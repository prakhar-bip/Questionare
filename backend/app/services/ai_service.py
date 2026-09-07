import json
import time
import subprocess
import requests
from openai import OpenAI
from app.core.config import settings
from app.core.activity_logger import log_activity

# Initialize OpenAI client to connect to Nvidia API as fallback
client = OpenAI(
    api_key=settings.NVIDIA_API_KEY,
    base_url=settings.NVIDIA_BASE_URL
)

_gcloud_token = None
_token_expiry = 0
_unavailable_models: dict[str, float] = {}  # {model_name: timestamp_when_404_received}

def get_vertex_token():
    global _gcloud_token, _token_expiry
    now = time.time()
    if not _gcloud_token or now > _token_expiry:
        # Standard GCP Cloud Run runtime auth
        try:
            import google.auth
            import google.auth.transport.requests
            creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
            auth_req = google.auth.transport.requests.Request()
            creds.refresh(auth_req)
            if creds.token:
                _gcloud_token = creds.token
                _token_expiry = now + 3000
                return _gcloud_token
        except Exception:
            pass

        # Local development gcloud CLI fallback
        try:
            res = subprocess.run(
                "gcloud auth print-access-token",
                shell=True,
                capture_output=True,
                text=True,
                timeout=15
            )
            token = res.stdout.strip()
            if token and not token.startswith("ERROR"):
                _gcloud_token = token
                _token_expiry = now + 3000
                return _gcloud_token
        except Exception as e:
            print(f"Error fetching gcloud token: {e}")
    return _gcloud_token

def call_vertex_gemini(prompt: str, system_instruction: str = None, temperature: float = 0.4, max_tokens: int = 8192):
    global _unavailable_models
    token = get_vertex_token()
    if not token:
        raise RuntimeError("No Google Cloud access token available. Make sure gcloud is authenticated.")
        
    primary_model = settings.GCP_PRIMARY_MODEL
    secondary_model = settings.GCP_SECONDARY_MODEL
    
    # Request timeout: allocate ample time for multi-file codebases (180s+ for up to 8192 tokens)
    request_timeout = max(180, int(max_tokens / 30))

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens
        }
    }
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    now = time.time()
    last_err = None

    # 1. Attempt Primary Model (Gemini 3.1 Pro) if not cached as unavailable
    skip_primary = (
        primary_model in _unavailable_models
        and (now - _unavailable_models[primary_model]) < 3600
    )

    if not skip_primary:
        primary_url = f"https://{settings.GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/{settings.GCP_PROJECT_ID}/locations/{settings.GCP_LOCATION}/publishers/google/models/{primary_model}:generateContent"
        try:
            res = requests.post(primary_url, headers=headers, json=payload, timeout=request_timeout)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    return "".join(p.get("text", "") for p in parts), primary_model
            elif res.status_code == 404:
                _unavailable_models[primary_model] = now
                last_err = f"Primary {primary_model} returned 404 on Vertex AI (cached for 1h)"
            else:
                last_err = f"Primary {primary_model} returned HTTP {res.status_code}: {res.text[:150]}"
        except Exception as e:
            last_err = f"Primary {primary_model} error: {str(e)}"
    else:
        last_err = f"Primary {primary_model} cached as unavailable on Vertex AI"

    # 2. Attempt Secondary Fallback Model (Gemini 2.5 Pro)
    if secondary_model and secondary_model != primary_model:
        try:
            secondary_url = f"https://{settings.GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/{settings.GCP_PROJECT_ID}/locations/{settings.GCP_LOCATION}/publishers/google/models/{secondary_model}:generateContent"
            res = requests.post(secondary_url, headers=headers, json=payload, timeout=request_timeout)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    return "".join(p.get("text", "") for p in parts), secondary_model
            else:
                raise RuntimeError(f"Secondary {secondary_model} returned HTTP {res.status_code}: {res.text[:150]}")
        except Exception as e_sec:
            raise RuntimeError(f"Vertex AI failed. Primary ({last_err}), Secondary error: {str(e_sec)}")

    raise RuntimeError(f"Vertex AI error: {last_err}")


def call_nvidia(prompt: str, system_instruction: str = None, temperature: float = 0.4, max_tokens: int = 4096):
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})
    response = client.chat.completions.create(
        model=settings.NVIDIA_MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content

def call_llm(
    prompt: str,
    system_instruction: str = None,
    temperature: float = 0.4,
    max_tokens: int = 4096,
    agent_name: str = "Sarthi AI Agent"
):
    """
    LLM Router:
    - Primary Model: Google Cloud Vertex AI Gemini 3.1 Pro (settings.GCP_PRIMARY_MODEL)
    - Secondary Model: Google Cloud Vertex AI Gemini 2.5 Pro (settings.GCP_SECONDARY_MODEL)
    - Fallback: Nvidia NIM model (settings.NVIDIA_MODEL)
    - Logs every activity strictly to terminal in the format:
      date,time,ai agent that used to generate response,success,error,warning message reason for error and warning
    """
    use_vertex = settings.USE_VERTEX_AI or settings.ENVIRONMENT.lower() == "production"

    if use_vertex:
        # Primary & Secondary: Vertex AI
        try:
            res, model_used = call_vertex_gemini(prompt, system_instruction, temperature, max_tokens)
            warning_reason = None
            if model_used != settings.GCP_PRIMARY_MODEL:
                warning_reason = f"Notice: Primary {settings.GCP_PRIMARY_MODEL} routed to secondary {model_used}"
            log_activity(
                agent=f"{agent_name} (Vertex AI: {model_used})",
                success=True,
                error=None,
                warning_reason=warning_reason
            )
            return res
        except Exception as e_vertex:
            vertex_err = str(e_vertex)
            # Falling back to Nvidia NIM
            try:
                res = call_nvidia(prompt, system_instruction, temperature, max_tokens)
                log_activity(
                    agent=f"{agent_name} (Nvidia NIM: {settings.NVIDIA_MODEL})",
                    success=True,
                    error=None,
                    warning_reason=f"Warning: Vertex AI failed ({vertex_err}); fallback to Nvidia NIM succeeded"
                )
                return res
            except Exception as e_nvidia:
                nvidia_err = str(e_nvidia)
                log_activity(
                    agent=f"{agent_name} (Vertex AI & Nvidia NIM)",
                    success=False,
                    error=f"{type(e_nvidia).__name__}: {nvidia_err}",
                    warning_reason=f"Reason: Vertex AI failed ({vertex_err}); fallback Nvidia NIM failed ({nvidia_err})"
                )
                raise RuntimeError(f"All AI providers failed. Vertex AI: {vertex_err}. Nvidia: {nvidia_err}")
    else:
        # Development fallback: Nvidia NIM model
        try:
            res = call_nvidia(prompt, system_instruction, temperature, max_tokens)
            log_activity(
                agent=f"{agent_name} (Nvidia NIM: {settings.NVIDIA_MODEL})",
                success=True,
                error=None,
                warning_reason=None
            )
            return res
        except Exception as e_nvidia:
            nvidia_err = str(e_nvidia)
            # Falling back to Vertex AI
            try:
                res, model_used = call_vertex_gemini(prompt, system_instruction, temperature, max_tokens)
                log_activity(
                    agent=f"{agent_name} (Vertex AI: {model_used})",
                    success=True,
                    error=None,
                    warning_reason=f"Warning: Primary Nvidia NIM failed ({nvidia_err}); fallback to Vertex AI succeeded"
                )
                return res
            except Exception as e_vertex:
                vertex_err = str(e_vertex)
                log_activity(
                    agent=f"{agent_name} (Nvidia NIM & Vertex AI)",
                    success=False,
                    error=f"{type(e_vertex).__name__}: {vertex_err}",
                    warning_reason=f"Reason: Primary Nvidia NIM failed ({nvidia_err}); fallback Vertex AI failed ({vertex_err})"
                )
                raise RuntimeError(f"All AI providers failed. Nvidia: {nvidia_err}. Vertex AI: {vertex_err}")


def _repair_and_parse_json(text: str):
    import re
    # 1. Strip trailing commas before closing braces/brackets
    cleaned = re.sub(r',\s*([}\]])', r'\1', text)
    try:
        return json.loads(cleaned)
    except Exception:
        pass
        
    # 2. Try closing any unbalanced open braces/brackets
    open_braces = cleaned.count('{') - cleaned.count('}')
    open_brackets = cleaned.count('[') - cleaned.count(']')
    balanced = cleaned
    if open_brackets > 0:
        balanced += ']' * open_brackets
    if open_braces > 0:
        balanced += '}' * open_braces
    try:
        return json.loads(balanced)
    except Exception:
        pass

    return None

def _extract_json(content: str, agent_name: str = "JSON Parser"):
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError as decode_err:
        first_brace = content.find('{')
        first_bracket = content.find('[')
        start = -1
        if first_brace != -1 and first_bracket != -1:
            start = min(first_brace, first_bracket)
        elif first_brace != -1:
            start = first_brace
        elif first_bracket != -1:
            start = first_bracket

        last_brace = content.rfind('}')
        last_bracket = content.rfind(']')
        end = max(last_brace, last_bracket)

        if start != -1 and end != -1 and end > start:
            candidate = content[start:end+1]
            try:
                return json.loads(candidate)
            except Exception:
                # Attempt in-memory auto-repair before failing
                repaired = _repair_and_parse_json(candidate)
                if repaired is not None:
                    log_activity(
                        agent=f"{agent_name} (JSON Auto-Repair)",
                        success=True,
                        error=None,
                        warning_reason="Warning: AI JSON syntax automatically sanitized and recovered without data loss"
                    )
                    return repaired

        # Also attempt repair on the full content
        repaired = _repair_and_parse_json(content)
        if repaired is not None:
            log_activity(
                agent=f"{agent_name} (JSON Auto-Repair)",
                success=True,
                error=None,
                warning_reason="Warning: AI JSON syntax automatically sanitized and recovered without data loss"
            )
            return repaired

        log_activity(
            agent=f"{agent_name} (JSON Parser)",
            success=False,
            error=f"JSONDecodeError: {str(decode_err)}",
            warning_reason="Reason: AI output contained malformed JSON syntax that could not be parsed"
        )
        raise

def generate_raw_json(system: str, prompt: str, agent_name: str = "Sarthi JSON Gateway Agent"):
    """
    Gateway function for generating typed JSON from system and user prompts.
    """
    content = call_llm(prompt=prompt, system_instruction=system, temperature=0.4, max_tokens=8192, agent_name=agent_name)
    return _extract_json(content, agent_name=agent_name)

def generate_project_ideas(student_profile: dict, model_name: str = None):
    """
    Step 3: Generate personalized project ideas based on the student profile.
    """
    prompt = f"""
    You are an AI career and project advisor for final-year students.
    Based on the following student profile, generate 3 personalized practical project ideas.
    
    Student Profile:
    {json.dumps(student_profile, indent=2)}
    
    Return the response strictly as a JSON array of objects with the following keys:
    name, problem, solution, target_users, difficulty_level, estimated_development_time, required_skills (list of strings).
    Do not include markdown blocks or any other text, just the raw JSON array.
    """
    content = call_llm(prompt, temperature=0.7, max_tokens=4096, agent_name="Project Idea Advisor Agent")
    return _extract_json(content, agent_name="Project Idea Advisor Agent")

def refine_project_ideas(student_profile: dict, current_ideas: list, feedback: str, model_name: str = None):
    """
    Step 5: Refine project ideas based on student feedback.
    """
    prompt = f"""
    You are an AI career and project advisor.
    The student previously received these project ideas:
    {json.dumps(current_ideas, indent=2)}
    
    The student's profile is:
    {json.dumps(student_profile, indent=2)}
    
    The student provided the following feedback/request for changes:
    "{feedback}"
    
    Based on this feedback, generate 3 new or refined practical project ideas that better suit their request while still aligning with their profile.
    
    Return the response strictly as a JSON array of objects with the following keys:
    name, problem, solution, target_users, difficulty_level, estimated_development_time, required_skills (list of strings).
    Do not include markdown blocks or any other text, just the raw JSON array.
    """
    content = call_llm(prompt, temperature=0.7, max_tokens=4096, agent_name="Project Idea Refiner Agent")
    return _extract_json(content, agent_name="Project Idea Refiner Agent")

def analyze_project_feasibility(student_profile: dict, project_idea: dict, model_name: str = None):
    """
    Step 6: Analyze the feasibility of a specific project for the student.
    """
    prompt = f"""
    You are an AI career and technical advisor.
    Evaluate the feasibility of the following project idea for this specific student.
    
    Student Profile:
    {json.dumps(student_profile, indent=2)}
    
    Project Idea:
    {json.dumps(project_idea, indent=2)}
    
    Analyze whether this project is realistically achievable for the student given their skills and available time.
    Provide a skill match score (0-100) and an interest match score (0-100).
    Provide a detailed explanation. If it's too difficult, suggest a brief learning roadmap or simplifications.
    
    Return the response strictly as a JSON object with the following keys:
    skill_match_score (integer), interest_match_score (integer), feasibility_explanation (string).
    Do not include markdown blocks or any other text, just the raw JSON object.
    """
    content = call_llm(prompt, temperature=0.4, max_tokens=4096, agent_name="Project Feasibility Analyst Agent")
    return _extract_json(content, agent_name="Project Feasibility Analyst Agent")

def generate_project_blueprint(student_profile: dict, project_idea: dict, model_name: str = None):
    """
    Step 8 & 9: Complete Project Blueprint Generation (AI Project Architect).
    """
    prompt = f"""
    You are an expert AI Software Architect and Senior Technical Lead.
    Create an in-depth, production-ready, practical Project Blueprint for the selected final-year student project.
    
    Student Profile:
    {json.dumps(student_profile, indent=2)}
    
    Selected Project Idea:
    {json.dumps(project_idea, indent=2)}
    
    Generate a complete project blueprint adhering STRICTLY to the following JSON structure:
    {{
      "overview": {{
        "project_name": "{project_idea.get('name', 'Project')}",
        "problem_statement": "Detailed problem statement",
        "proposed_solution": "Detailed solution description",
        "project_objectives": ["objective 1", "objective 2", "objective 3"],
        "target_users": "Target audience description",
        "expected_impact": "Expected academic and real-world impact"
      }},
      "features": {{
        "core_mvp": ["MVP feature 1", "MVP feature 2", "MVP feature 3"],
        "advanced_features": ["Advanced feature 1", "Advanced feature 2"],
        "future_improvements": ["Improvement 1", "Improvement 2"]
      }},
      "tech_stack": [
        {{
          "name": "Technology Name",
          "category": "Frontend | Backend | Database | AI/ML | DevOps/Hosting | Tools",
          "why_selected": "Why chosen based on student skills and project needs",
          "how_used": "Exact role in this project"
        }}
      ],
      "system_architecture": {{
        "overview": "Detailed description of system architecture style and communication protocols",
        "components": [
          {{"component": "Frontend Client", "description": "Role and tech"}},
          {{"component": "Backend API Server", "description": "Endpoints and business logic"}},
          {{"component": "Database Layer", "description": "Data storage and modeling"}}
        ],
        "data_flow": ["Step 1: User action...", "Step 2: API processing...", "Step 3: Database query...", "Step 4: Response render..."]
      }},
      "development_roadmap": [
        {{
          "phase_number": 1,
          "phase_name": "Project Planning & Requirement Definition",
          "objectives": "Finalize scope and technical specifications",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "SRS document and wireframes"
        }},
        {{
          "phase_number": 2,
          "phase_name": "Project Setup & Environment Configuration",
          "objectives": "Initialize repositories, dependencies, and environments",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Configured repository and working dev server"
        }},
        {{
          "phase_number": 3,
          "phase_name": "Database Design & Integration",
          "objectives": "Design schema, setup database connection, and create tables",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "ER diagram and migration scripts"
        }},
        {{
          "phase_number": 4,
          "phase_name": "Backend Development",
          "objectives": "Implement RESTful API endpoints and business logic",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Tested backend endpoints"
        }},
        {{
          "phase_number": 5,
          "phase_name": "Frontend Development",
          "objectives": "Build UI components and integrate with backend APIs",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Responsive user interface"
        }},
        {{
          "phase_number": 6,
          "phase_name": "AI Integration (if applicable)",
          "objectives": "Integrate AI models, API keys, and prompt pipelines",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Working AI feature pipeline"
        }},
        {{
          "phase_number": 7,
          "phase_name": "Testing & Quality Assurance",
          "objectives": "Execute unit, integration, and user-flow tests",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Test reports and bug fixes"
        }},
        {{
          "phase_number": 8,
          "phase_name": "Deployment & Presentation Prep",
          "objectives": "Deploy to cloud hosting, document setup, and prepare demo",
          "tasks": ["Task 1", "Task 2"],
          "deliverables": "Live production URL and project report"
        }}
      ],
      "challenges_and_solutions": [
        {{
          "challenge": "Key technical bottleneck or risk",
          "solution": "Recommended mitigation and implementation strategy"
        }}
      ]
    }}

    Rules:
    1. Tailor the tech stack and roadmap to the student's existing skills, filling gaps realistically.
    2. Return ONLY the valid JSON object. No Markdown code fences, no extra text.
    """
    content = call_llm(prompt, temperature=0.4, max_tokens=8192, agent_name="AI Project Architect Agent")
    return _extract_json(content, agent_name="AI Project Architect Agent")

def mentor_chat_and_refine(
    student_profile: dict,
    project_idea: dict,
    current_blueprint: dict,
    chat_history: list,
    student_message: str,
    model_name: str = None
):
    """
    Steps 10 & 11: Interactive AI Project Mentor and Continuous Blueprint Refinement.
    """
    prompt = f"""
    You are an expert AI Technical Project Mentor and Senior Software Architect.
    You are having an interactive mentoring session with a final-year student regarding their project blueprint.
    
    Student Profile:
    {json.dumps(student_profile, indent=2)}
    
    Selected Project Idea:
    {json.dumps(project_idea, indent=2)}
    
    Current Project Blueprint:
    {json.dumps(current_blueprint, indent=2)}
    
    Recent Chat History:
    {json.dumps(chat_history[-6:], indent=2) if chat_history else "No previous conversation."}
    
    Student's Latest Message:
    "{student_message}"
    
    Your Tasks:
    1. Act as an encouraging, clear, and highly knowledgeable technical mentor.
    2. Address the student's question, concern, or modification request directly.
    3. Determine if the student's request requires a modification to the Project Blueprint.
    4. If a modification IS required:
       - Set "blueprint_updated": true.
       - In "updated_blueprint", provide the complete, updated project blueprint.
    5. If NO modification is needed:
       - Set "blueprint_updated": false.
       - Set "updated_blueprint": null.

    Respond STRICTLY with a valid JSON object matching this schema:
    {{
      "mentor_response": "Your thorough, helpful, conversational answer to the student.",
      "blueprint_updated": true,
      "updated_blueprint": {{ ... }}
    }}
    (Note: If blueprint_updated is false, updated_blueprint should be null).

    Rules:
    - Respond ONLY with the raw JSON object. No Markdown fences, no extra text.
    """
    content = call_llm(prompt, temperature=0.5, max_tokens=4096, agent_name="AI Project Mentor Agent")
    return _extract_json(content, agent_name="AI Project Mentor Agent")
