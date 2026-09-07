import { createServerFn } from "@tanstack/react-start";
import { generateJson, generateText } from "./ai-gateway.server";
import type {
  ApiEndpointContract,
  Blueprint,
  Feasibility,
  ProductionBatch,
  ProductionManifest,
  ProjectIdea,
  PrototypeData,
  PrototypeFile,
  QuestScroll,
  StudentProfile,
} from "./types";

const SYSTEM =
  "You are Sarthi, an expert final-year project advisor and guide for engineering students (inspired by Krishna guiding Arjun with wisdom and clarity). " +
  "You are pragmatic, specific and encouraging. You never invent unrealistic scope. " +
  "Everything you write must be concrete: real technologies, real user groups, real numbers.";

function profileBlock(p: StudentProfile) {
  return `STUDENT PROFILE
Name: ${p.name}
Field: ${p.fieldOfStudy} | Year: ${p.yearOfStudy} | Experience: ${p.experienceLevel}
Skills: ${p.skills.join(", ") || "n/a"}
Languages: ${p.languages.join(", ") || "n/a"}
Frameworks/tools: ${p.frameworks.join(", ") || "n/a"}
AI/ML knowledge: ${p.aiKnowledge}
Previous projects: ${p.previousProjects || "none stated"}
Interests: ${p.interests.join(", ") || "n/a"}
Preferred domains: ${p.domains.join(", ") || "n/a"}
Career goal: ${p.careerGoal}
Preferred project type: ${p.projectType}
Time budget: ${p.hoursPerWeek} hrs/week for ${p.weeks} weeks
Team: ${p.teamSize} | Resources: ${p.resources.join(", ") || "laptop only"}
Preferred complexity: ${p.complexity}
Their own project ideas / extra notes: ${p.ownIdeas || "none"}`;
}

export const buildProfile = createServerFn({ method: "POST" })
  .inputValidator((data: { raw: StudentProfile }) => data)
  .handler(async ({ data }) => {
    const p = data.raw;
    const result = await generateJson<{
      summary: string;
      strengths: string[];
      watchOuts: string[];
    }>({
      system: SYSTEM,
      prompt: `${profileBlock(p)}

Write a structured read of this student. JSON shape:
{"summary": "3 sentence portrait covering capability, interests, constraints and goal",
 "strengths": ["4 short concrete strengths"],
 "watchOuts": ["3 short honest constraints or risks"]}`,
    });
    return { ...p, ...result } satisfies StudentProfile;
  });

export const generateIdeas = createServerFn({ method: "POST" })
  .inputValidator((data: { profile: StudentProfile; feedback?: string[]; exclude?: string[] }) => data)
  .handler(async ({ data }) => {
    const { profile, feedback = [], exclude = [] } = data;
    const ideas = await generateJson<{ ideas: ProjectIdea[] }>({
      system: SYSTEM,
      prompt: `${profileBlock(profile)}

${feedback.length ? `STUDENT FEEDBACK SO FAR (most recent last):\n- ${feedback.join("\n- ")}\n` : ""}
${exclude.length ? `Do not repeat these project names: ${exclude.join(", ")}\n` : ""}
Generate 4 distinct, practical final-year project ideas tailored to this student, and score each one.
If the student wrote their own project ideas or notes above, build at least one idea directly on them.
Scores are 0-100. "overall" is your weighted suitability score.
Set "rarity" by overall: >=90 legendary, >=80 epic, >=68 rare, else common.

JSON shape:
{"ideas":[{"id":"kebab-case-id","name":"Product-style name","tagline":"max 8 words",
"problem":"1-2 sentences","solution":"2 sentences","targetUsers":"who exactly",
"difficulty":"Beginner|Intermediate|Advanced","estimatedTime":"e.g. 7-9 weeks",
"requiredSkills":["4-6 skills"],
"match":{"skill":0,"interest":0,"feasibility":0,"career":0,"portfolio":0,"time":0},
"overall":0,"why":"2 sentences explaining why this fits THIS student specifically",
"rarity":"common"}]}`,
    });
    return ideas.ideas.slice(0, 4);
  });

export const refineIdeas = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      profile: StudentProfile;
      idea: ProjectIdea;
      action: string;
      note?: string;
      feedback: string[];
    }) => data,
  )
  .handler(async ({ data }) => {
    const { profile, idea, action, note, feedback } = data;
    const result = await generateJson<{ ideas: ProjectIdea[] }>({
      system: SYSTEM,
      prompt: `${profileBlock(profile)}

The student is looking at this idea:
${JSON.stringify(idea)}

Their request: "${action}"${note ? ` — extra note: "${note}"` : ""}
Earlier feedback: ${feedback.join(" | ") || "none"}

Produce 3 new or reworked ideas that answer that request, scored the same way.
JSON shape: {"ideas":[{"id":"","name":"","tagline":"","problem":"","solution":"","targetUsers":"","difficulty":"","estimatedTime":"","requiredSkills":[],"match":{"skill":0,"interest":0,"feasibility":0,"career":0,"portfolio":0,"time":0},"overall":0,"why":"","rarity":"common"}]}`,
    });
    return result.ideas.slice(0, 3);
  });

export const analyzeFeasibility = createServerFn({ method: "POST" })
  .inputValidator((data: { profile: StudentProfile; idea: ProjectIdea }) => data)
  .handler(async ({ data }) => {
    return await generateJson<Feasibility>({
      system: SYSTEM,
      prompt: `${profileBlock(data.profile)}

SELECTED PROJECT:
${JSON.stringify(data.idea)}

Judge honestly whether this student can realistically finish this project in their time budget with their resources.
JSON shape:
{"achievable":true,"verdict":"one punchy line","reasoning":"3-4 sentences comparing current skills vs required skills, complexity, time and resources",
"skillGaps":["skills they must learn"],"timeVerdict":"one line","resourceVerdict":"one line",
"simplified":{"name":"","summary":"2 sentences describing a trimmed version that definitely fits"},
"learningRoadmap":[{"skill":"","how":"specific resource or exercise","weeks":1}],
"alternative":{"name":"","summary":"2 sentences on a similar but more achievable project"}}`,
    });
  });

export const generateBlueprint = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      profile: StudentProfile;
      idea: ProjectIdea;
      feasibility: Feasibility | null;
      feedback: string[];
      direction?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    return await generateJson<Blueprint>({
      system: SYSTEM,
      prompt: `${profileBlock(data.profile)}

FINAL PROJECT: ${JSON.stringify(data.idea)}
FEASIBILITY: ${JSON.stringify(data.feasibility)}
STUDENT FEEDBACK: ${data.feedback.join(" | ") || "none"}
CHOSEN DIRECTION: ${data.direction || "build the project as selected"}

Produce a complete, practical project blueprint. The tech stack must lean on skills the student already has,
with at most two genuinely new technologies. The roadmap must fit ${data.profile.hoursPerWeek} hrs/week over ${data.profile.weeks} weeks.
JSON shape:
{"title":"",
"overview":{"summary":"","problemStatement":"","proposedSolution":"","objectives":["4-5"],"targetUsers":"","expectedImpact":""},
"mvpFeatures":[{"name":"","detail":""}],
"advancedFeatures":[{"name":"","detail":""}],
"futureImprovements":["4"],
"stack":[{"name":"","category":"Frontend|Backend|Database|AI|DevOps|Tooling","why":"","howUsed":"","isNew":false}],
"architecture":{"layers":[{"name":"","parts":["..."]}],"dataFlow":"2-3 sentences describing the request/data path"},
"roadmap":[{"phase":"01","title":"e.g. Planning & requirements","weeks":"wk 1","tasks":["3-5 concrete tasks"]}],
"challenges":[{"challenge":"","solution":""}]}
Roadmap must cover planning, requirements, setup, core/backend, frontend, database, AI integration if relevant, testing, deployment.`,
    });
  });

export const updateBlueprint = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { profile: StudentProfile; blueprint: Blueprint; request: string }) => data,
  )
  .handler(async ({ data }) => {
    return await generateJson<{ blueprint: Blueprint; changeSummary: string }>({
      system: SYSTEM,
      prompt: `${profileBlock(data.profile)}

CURRENT BLUEPRINT:
${JSON.stringify(data.blueprint)}

The student asked for this change: "${data.request}"

Apply the change and return the FULL updated blueprint, keeping every field and staying consistent with the
student's skills, constraints and goal. Keep untouched parts identical.
JSON shape: {"blueprint": <same schema as the current blueprint>, "changeSummary":"one sentence on what changed"}`,
    });
  });

export const summarizeBlueprint = createServerFn({ method: "POST" })
  .inputValidator((data: { profile: StudentProfile; blueprint: Blueprint }) => data)
  .handler(async ({ data }) => {
    return await generateJson<QuestScroll>({
      system: SYSTEM,
      prompt: `${profileBlock(data.profile)}

CURRENT BLUEPRINT:
${JSON.stringify(data.blueprint)}

Summarise this plan so the student can explain it out loud in under a minute, and so they know what to do next.
Be specific to THIS plan — no generic advice.
JSON shape:
{"tldr":"1 punchy sentence describing the project",
 "pitch":"3 sentences the student could say to a supervisor",
 "keyMoves":[{"move":"short name of a decisive build decision","why":"1 sentence"}],
 "loadout":["5-7 tech stack items as short strings"],
 "nextThreeMoves":["3 concrete things to do first, in order"],
 "bossRisks":["3 short risks with a hint at how to dodge each"]}`,
    });
  });

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "tsx":
    case "ts":
      return "typescript";
    case "jsx":
    case "js":
      return "javascript";
    case "py":
      return "python";
    case "sql":
      return "sql";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "html":
      return "html";
    case "css":
      return "css";
    default:
      return "text";
  }
}

export function parseDelimitedCodeFiles(text: string): PrototypeFile[] {
  const files: PrototypeFile[] = [];

  // Match: === FILE: <path> === ... === END FILE ===
  const equalsFileRegex =
    /===\s*FILE:\s*([^\r\n=]+)\s*===\r?\n([\s\S]*?)(?:===\s*END FILE\s*===|(?====\s*FILE:)|$)/gi;
  let eqMatch: RegExpExecArray | null;

  while ((eqMatch = equalsFileRegex.exec(text)) !== null) {
    const rawPath = eqMatch[1].trim();
    let rawCode = eqMatch[2].trim();
    // If the model wrapped code in ```lang ... ``` inside === FILE ===, strip the outer fences
    const fenceStripMatch = rawCode.match(/^```(?:\w+)?\r?\n([\s\S]*?)\r?\n```$/);
    if (fenceStripMatch) {
      rawCode = fenceStripMatch[1];
    }
    const language = getLanguageFromPath(rawPath);
    files.push({
      path: rawPath,
      language,
      description: `Production file for ${rawPath}`,
      code: rawCode,
    });
  }

  // If no === FILE === was found, try ### FILE: or Markdown format
  if (files.length === 0) {
    const mdFileRegex =
      /(?:###?\s*FILE:?|\*\*File:?\*\*|File:?)\s*`?([^\r\n`]+)`?\r?\n```(\w*)\r?\n([\s\S]*?)```/gi;
    let mdMatch: RegExpExecArray | null;
    while ((mdMatch = mdFileRegex.exec(text)) !== null) {
      const rawPath = mdMatch[1].trim();
      const language = mdMatch[2].trim() || getLanguageFromPath(rawPath);
      const code = mdMatch[3].trimEnd();
      files.push({
        path: rawPath,
        language,
        description: `Production file for ${rawPath}`,
        code,
      });
    }
  }

  // Fallback: If still empty, capture standard code blocks
  if (files.length === 0) {
    const codeBlockRegex = /```(\w+)\r?\n([\s\S]*?)```/g;
    let blockMatch: RegExpExecArray | null;
    let idx = 1;
    while ((blockMatch = codeBlockRegex.exec(text)) !== null) {
      const language = blockMatch[1].trim();
      const code = blockMatch[2].trimEnd();
      let path = `src/module_${idx}.${
        language === "python" ? "py" : language === "typescript" ? "ts" : language === "sql" ? "sql" : "txt"
      }`;
      files.push({
        path,
        language,
        description: `Generated ${language} module`,
        code,
      });
      idx++;
    }
  }

  return files;
}

export const parseMarkdownCodeFiles = parseDelimitedCodeFiles;

type PrototypeUiSpec = Omit<PrototypeData, "codeFiles">;

export const generatePrototype = createServerFn({ method: "POST" })
  .inputValidator((data: { profile: StudentProfile; blueprint: Blueprint }) => data)
  .handler(async ({ data }) => {
    const uiPrompt = `${profileBlock(data.profile)}

FINALIZED BLUEPRINT:
${JSON.stringify(data.blueprint)}

Generate an interactive software prototype UI specification and user workflow simulation for this project blueprint.
Focus on creating intuitive screens, realistic interactive metrics, action forms, and setup commands.

JSON shape:
{
  "title": "${data.blueprint.overview.title || "Project Prototype"}",
  "tagline": "A punchy one-sentence motto or hook for this software prototype",
  "architectureSummary": "2-3 sentences explaining how this prototype implements the core architecture and what students can test immediately.",
  "screens": [
    {
      "id": "dashboard",
      "title": "Primary Screen / Dashboard Name",
      "subtitle": "Clear description of the primary user workflow",
      "iconName": "layout",
      "metrics": [
        {"label": "Key Metric 1", "value": "1,280", "change": "+14%"},
        {"label": "Key Metric 2", "value": "98.4%", "change": "+2.1%"}
      ],
      "inputForm": {
        "title": "Interactive Action Form",
        "description": "Short explanation of what happens when the student submits data here",
        "fields": [
          {"name": "input_name", "label": "Field 1 Label", "placeholder": "Example input...", "type": "text"},
          {"name": "category", "label": "Field 2 (Category/Model)", "placeholder": "Select an option", "type": "select", "options": ["Option A", "Option B", "Option C"]}
        ],
        "submitLabel": "Execute / Analyze",
        "successMessage": "Simulation complete: Successfully processed with response code 200 OK."
      },
      "sampleItems": [
        {"title": "Sample Record 1", "category": "Production", "status": "Active", "detail": "Processed in 42ms via API pipeline"},
        {"title": "Sample Record 2", "category": "Staging", "status": "Completed", "detail": "Data synchronized with local storage"}
      ],
      "actions": [
        {"id": "run_test", "label": "Trigger Mock Data Flow", "description": "Simulates request moving through the API", "mockResponse": "Data payload validated: Handshake successful with database."},
        {"id": "inspect_cache", "label": "Inspect State Cache", "description": "Checks local model cache memory", "mockResponse": "Cache status: 2 warm instances ready for inference."}
      ]
    },
    {
      "id": "analytics",
      "title": "Analytics & Pipeline View",
      "subtitle": "Real-time inspection of system data flow and outputs",
      "iconName": "activity",
      "metrics": [
        {"label": "Latency", "value": "38ms", "change": "-6ms"},
        {"label": "Throughput", "value": "450 req/s", "change": "+12%"}
      ],
      "sampleItems": [
        {"title": "Pipeline Batch #104", "category": "Inference", "status": "Passed", "detail": "Zero validation errors detected"},
        {"title": "Model Weights Sync", "category": "Storage", "status": "Ready", "detail": "Latest checkpoint loaded into memory"}
      ],
      "actions": [
        {"id": "benchmark", "label": "Run Stress Simulation", "description": "Tests system against simulated bursts", "mockResponse": "P99 Latency: 48ms across 1,000 simulated packets."}
      ]
    },
    {
      "id": "settings",
      "title": "Configuration & Environment",
      "subtitle": "Inspect environment variables, API secrets and backend links",
      "iconName": "settings",
      "sampleItems": [
        {"title": "Database Connection", "category": "Postgres/SQLite", "status": "Connected", "detail": "Connection pool size: 10"},
        {"title": "Authentication Provider", "category": "JWT Bearer", "status": "Configured", "detail": "Token expiry: 3600 seconds"}
      ],
      "actions": [
        {"id": "verify_env", "label": "Verify Environment Setup", "description": "Checks local dependencies", "mockResponse": "All environment variables parsed and validated successfully."}
      ]
    }
  ],
  "runInstructions": [
    "Clone or extract the downloaded starter package into your local workspace.",
    "Set up backend: cd backend && python -m venv venv && pip install -r requirements.txt",
    "Start API server: uvicorn main:app --reload --port 8000",
    "Set up frontend: cd frontend && npm install && npm run dev",
    "Open http://localhost:5173 to test your interactive prototype live!"
  ]
}

Return strictly valid JSON. Do not generate code files in this output.`;

    const codePrompt = `${profileBlock(data.profile)}

FINALIZED BLUEPRINT:
${JSON.stringify(data.blueprint)}

Generate a complete, high-quality, production-grade multi-file starter codebase for this engineering project.
Write full, realistic, runnable implementations with complete logic, imports, models, and comments.

Format each file cleanly using this exact Markdown code fence structure:

### FILE: frontend/src/App.tsx
\`\`\`typescript
// Full React Component implementation with Tailwind CSS and mock state
\`\`\`

### FILE: backend/main.py
\`\`\`python
# Full FastAPI server implementation matching the blueprint endpoints and logic
\`\`\`

### FILE: backend/schemas.py
\`\`\`python
# Complete Pydantic schemas for request validation and response models
\`\`\`

### FILE: database/schema.sql
\`\`\`sql
-- SQL schema with DDL table definitions, foreign keys, and indexes
\`\`\`

### FILE: README.md
\`\`\`markdown
# Project Setup & Architecture Guide
\`\`\`

Provide complete, realistic code for all 5 files. Do not use placeholders or empty stubs.`;

    // Concurrently fetch UI Layout (JSON) and Multi-File Codebase (Markdown) with independent token limits
    const [uiSpec, codeMarkdown] = await Promise.all([
      generateJson<PrototypeUiSpec>({
        system: SYSTEM,
        prompt: uiPrompt,
      }),
      generateText({
        system:
          "You are an expert full-stack software engineer and code architect. " +
          "You write pristine, production-grade starter codebases for student engineering projects.",
        prompt: codePrompt,
        temperature: 0.3,
        maxTokens: 8192,
      }),
    ]);

    let parsedFiles = parseMarkdownCodeFiles(codeMarkdown);

    // Safeguard: Ensure at least the core starter files exist if the model used an unexpected format
    if (parsedFiles.length === 0) {
      parsedFiles = [
        {
          path: "frontend/src/App.tsx",
          language: "typescript",
          description: "Main React application component",
          code: `import React, { useState } from "react";\n\nexport default function App() {\n  return (\n    <div className="min-h-screen bg-slate-950 text-white p-8">\n      <h1 className="text-3xl font-bold">${uiSpec.title || "Project Prototype"}</h1>\n      <p className="text-slate-400 mt-2">${uiSpec.tagline || "Interactive Software Prototype"}</p>\n    </div>\n  );\n}`,
        },
        {
          path: "backend/main.py",
          language: "python",
          description: "FastAPI server starter",
          code: `from fastapi import FastAPI\n\napp = FastAPI(title="${uiSpec.title || "Project API"}")\n\n@app.get("/")\ndef read_root():\n    return {"message": "Server running", "status": "active"}\n`,
        },
        {
          path: "README.md",
          language: "markdown",
          description: "Quick start instructions",
          code: `# ${uiSpec.title || "Project"}\n\n${uiSpec.architectureSummary || "Starter codebase."}\n`,
        },
      ];
    }

    const prototypeResult: PrototypeData = {
      title: uiSpec.title || data.blueprint.overview.title || "Project Prototype",
      tagline: uiSpec.tagline || "Interactive Software Prototype & Starter Codebase",
      architectureSummary:
        uiSpec.architectureSummary ||
        data.blueprint.overview.problemSummary ||
        "Interactive software prototype.",
      screens: uiSpec.screens || [],
      codeFiles: parsedFiles,
      runInstructions:
        uiSpec.runInstructions && uiSpec.runInstructions.length > 0
          ? uiSpec.runInstructions
          : [
              "Clone or extract the downloaded starter package into your local workspace.",
              "Set up backend: cd backend && python -m venv venv && pip install -r requirements.txt",
              "Start API server: uvicorn main:app --reload --port 8000",
              "Set up frontend: cd frontend && npm install && npm run dev",
              "Open http://localhost:5173 to test your interactive prototype live!",
            ],
    };

    return prototypeResult;
  });

export const generateProductionManifest = createServerFn({ method: "POST" })
  .inputValidator((data: { profile: StudentProfile; blueprint: Blueprint }) => data)
  .handler(async ({ data }) => {
    const prompt = `${profileBlock(data.profile)}

FINALIZED BLUEPRINT:
${JSON.stringify(data.blueprint)}

Act as a Principal Software Architect. Design the complete Shared Architectural Contract and Topological Batch Generation Schedule for this production application.
Establish the single source of truth for the entire full-stack system: Database DDL, REST API endpoints, environment variables, and 5 ordered generation batches.

JSON shape:
{
  "title": "${data.blueprint.overview.title || "Production Application"}",
  "description": "2-sentence executive summary of the production software architecture.",
  "databaseContract": "CREATE TABLE ... (Complete PostgreSQL DDL with CREATE TABLE statements, primary keys, foreign keys, constraints, and indexes for all core entities)",
  "apiContract": [
    {
      "method": "GET",
      "path": "/api/v1/health",
      "summary": "Healthcheck endpoint returning system uptime and database status",
      "responseBody": "{\\"status\\":\\"ok\\",\\"database\\":\\"connected\\"}"
    },
    {
      "method": "GET",
      "path": "/api/v1/items",
      "summary": "Fetch list of primary entity items",
      "responseBody": "[{\\"id\\":\\"1\\",\\"name\\":\\"Sample\\"}]"
    },
    {
      "method": "POST",
      "path": "/api/v1/items",
      "summary": "Create or trigger processing for an item",
      "requestBody": "{\\"title\\":\\"string\\",\\"payload\\":\\"string\\"}",
      "responseBody": "{\\"id\\":\\"string\\",\\"status\\":\\"processed\\"}"
    }
  ],
  "envContract": [
    "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db",
    "SECRET_KEY=dev_secret_key_change_in_production",
    "API_V1_PREFIX=/api/v1",
    "ENVIRONMENT=development",
    "VITE_API_BASE_URL=http://localhost:8000"
  ],
  "batches": [
    {
      "id": "layer_1_database",
      "layerName": "Layer 1: Database & Configuration",
      "description": "Database schema definitions, mock seeds and environment configuration",
      "targetFiles": [
        {"path": "database/schema.sql", "language": "sql", "purpose": "DDL table definitions, foreign keys, and indexes"},
        {"path": "database/seed.sql", "language": "sql", "purpose": "Initial test data records matching schema constraints"},
        {"path": ".env.example", "language": "bash", "purpose": "Complete environment variables template"}
      ]
    },
    {
      "id": "layer_2_backend",
      "layerName": "Layer 2: Backend Core & APIs",
      "description": "FastAPI application server, Pydantic validation schemas, and database session handling",
      "targetFiles": [
        {"path": "backend/app/schemas.py", "language": "python", "purpose": "Pydantic v2 schemas strictly matching API contract request and response models"},
        {"path": "backend/app/main.py", "language": "python", "purpose": "FastAPI primary server implementing CORS and API contract endpoints"},
        {"path": "backend/requirements.txt", "language": "text", "purpose": "Python package dependencies with pinned versions"}
      ]
    },
    {
      "id": "layer_3_api_client",
      "layerName": "Layer 3: Frontend API Client & Types",
      "description": "TypeScript interfaces and type-safe fetch client for backend endpoints",
      "targetFiles": [
        {"path": "frontend/src/types/api.ts", "language": "typescript", "purpose": "TypeScript models mirroring Pydantic models with 100% type safety"},
        {"path": "frontend/src/lib/api-client.ts", "language": "typescript", "purpose": "Type-safe client functions with error handling and base URL handling"}
      ]
    },
    {
      "id": "layer_4_ui_views",
      "layerName": "Layer 4: Interactive Views & State",
      "description": "Production React components connecting UI forms to the API client",
      "targetFiles": [
        {"path": "frontend/src/App.tsx", "language": "typescript", "purpose": "Main React application root with layout, navigation, and theme wrapper"},
        {"path": "frontend/src/components/DashboardView.tsx", "language": "typescript", "purpose": "Interactive dashboard component rendering data feeds, forms, and live metrics"}
      ]
    },
    {
      "id": "layer_5_deployment",
      "layerName": "Layer 5: DevOps & Deployment Manifests",
      "description": "Docker containerization, Compose orchestration, and comprehensive setup documentation",
      "targetFiles": [
        {"path": "Dockerfile", "language": "dockerfile", "purpose": "Production multi-stage build container for FastAPI backend"},
        {"path": "docker-compose.yml", "language": "yaml", "purpose": "Orchestrates PostgreSQL service, backend API container, and volume persistence"},
        {"path": "README.md", "language": "markdown", "purpose": "Production runbook with installation, curl tests, and architecture guide"}
      ]
    }
  ]
}

Ensure the database schema has clean SQL syntax and the API contracts cover the core user stories. Return strictly valid JSON.`;

    return await generateJson<ProductionManifest>({
      system: SYSTEM,
      prompt,
      agentName: "Sarthi Production Manifest Agent",
    });
  });

export const generateProductionBatch = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      batch: ProductionBatch;
      manifestContract: {
        databaseContract: string;
        apiContract: ApiEndpointContract[];
        envContract: string[];
      };
      blueprint: Blueprint;
      profile: StudentProfile;
    }) => data,
  )
  .handler(async ({ data }) => {
    const prompt = `You are a Senior Full-Stack Production Engineer.
You are generating ${data.batch.layerName} for this project: "${data.blueprint.overview.title}".

=== SHARED ARCHITECTURAL CONTRACT (IMMUTABLE SINGLE SOURCE OF TRUTH) ===
DATABASE DDL CONTRACT:
${data.manifestContract.databaseContract}

API ENDPOINTS CONTRACT:
${JSON.stringify(data.manifestContract.apiContract, null, 2)}

ENVIRONMENT VARIABLES:
${data.manifestContract.envContract.join("\n")}

=== BATCH TASK: ${data.batch.layerName} ===
Layer Description: ${data.batch.description}

You MUST generate the complete, pristine, production-grade source code for each of the following target files:
${data.batch.targetFiles
  .map((f) => `- Path: ${f.path} | Language: ${f.language} | Purpose: ${f.purpose}`)
  .join("\n")}

CRITICAL INSTRUCTIONS:
1. Every table name, column name, and data type MUST match the DATABASE DDL CONTRACT exactly.
2. Every endpoint path, HTTP method, and JSON property MUST match the API ENDPOINTS CONTRACT exactly.
3. Write complete, runnable, production-quality code. Do not use placeholders or "// TODO: add code later".
4. Format each file cleanly using the standard delimiter structure:

=== FILE: path/to/file.ext ===
[Raw code here with no markdown fences]
=== END FILE ===

Begin outputting the batch files now:`;

    const codeText = await generateText({
      system:
        "You are an expert full-stack engineer and code compiler. " +
        "You output pristine, interconnected production code matching shared contracts with 100% precision.",
      prompt,
      temperature: 0.2,
      maxTokens: 8192,
      agentName: `Sarthi Batch Architect (${data.batch.layerName})`,
    });

    const parsedFiles = parseDelimitedCodeFiles(codeText);

    // If parser missed any file, ensure stubs exist
    if (parsedFiles.length === 0) {
      return data.batch.targetFiles.map((target) => ({
        path: target.path,
        language: target.language,
        description: target.purpose,
        code: `// ${target.path}\n// ${target.purpose}\n`,
      }));
    }

    return parsedFiles;
  });

