from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
from app.services.ai_service import generate_raw_json, call_llm

router = APIRouter()

class GenerateJsonRequest(BaseModel):
    system: str
    prompt: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Any]
    context: Optional[dict] = None

@router.post("/generate-json")
def gateway_generate_json(req: GenerateJsonRequest):
    """
    Direct JSON generation bridge for frontend server functions using Vertex AI Gemini Pro.
    """
    try:
        data = generate_raw_json(system=req.system, prompt=req.prompt)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vertex AI JSON generation failed: {str(e)}")

@router.post("/chat")
def gateway_chat(req: ChatRequest):
    """
    Direct mentor chat response using Vertex AI Gemini Pro.
    """
    try:
        system = (
            "You are the AI Project Mentor inside Questline, guiding a final-year student through their project. "
            "You know their profile and their current project blueprint. Answer questions about implementation, "
            "stack choices, scope, alternatives and complexity. Be concrete, helpful, and concise."
        )
        if req.context:
            system += f"\n\nCONTEXT:\n{str(req.context)[:8000]}"
            
        last_msg = ""
        for m in reversed(req.messages):
            if isinstance(m, dict) and m.get("content"):
                last_msg = str(m.get("content"))
                break
            elif isinstance(m, str):
                last_msg = m
                break
                
        if not last_msg:
            last_msg = "Hello mentor, can you help me with my project?"
            
        text = call_llm(prompt=last_msg, system_instruction=system, temperature=0.6, max_tokens=1024)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vertex AI chat failed: {str(e)}")
