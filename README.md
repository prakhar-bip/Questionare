# Questline — AI-Powered Final-Year Student Project Discovery & Planning Platform

Questline is an AI-powered platform designed to guide final-year university students through discovering, evaluating, refining, and architecting practical final-year engineering projects tailored to their skills, interests, time constraints, and career goals.

Powered by **Google Cloud Vertex AI (Gemini Pro)**, **FastAPI**, **PostgreSQL (Supabase)**, and a modern **React/TanStack** frontend.

---

## 🌟 11-Step Workflow & Architecture

1. **Student Discovery**: Conversational onboarding capturing field of study, technical skills, languages, frameworks, time budget, team size, and career ambitions.
2. **Dynamic Student Profile**: Converts discovery input into an actionable, structured profile with strengths and risk analysis.
3. **Personalized Project Idea Generation**: Generates 4 tailored project ideas with full problem statements, solutions, target users, and difficulty levels.
4. **Compatibility & Suitability Analysis**: Multi-dimensional scoring across Skill Match, Interest Match, Feasibility, Career Relevance, Portfolio Value, and Time Budget.
5. **Interactive Idea Refinement**: Students can provide direct feedback (make it simpler, add ML, switch stack) to regenerate and refine recommendations.
6. **Feasibility Reality Check**: Evaluates project scope against student constraints, providing an honest verdict, identified skill gaps, and learning roadmaps.
7. **Final Project Selection**: Locks in the chosen project direction for detailed system architecture.
8. **AI Project Architect**: Senior Technical Architect AI ingests the full context to design a production-grade system blueprint.
9. **Comprehensive Project Blueprint**:
   - Project Overview, Problem Statement & Objectives
   - Core MVP Features, Advanced Features & Future Roadmap
   - Tailored Tech Stack with justification and exact role
   - System Architecture, Component breakdown & Data Flow
   - 8-Phase Step-by-Step Development Roadmap
   - Potential Technical Challenges & Actionable Solutions
10. **Interactive AI Project Mentor**: Context-aware chat mentor available at all times to answer doubts and explain difficult concepts.
11. **Continuous Project Refinement**: Real-time architectural plan updates when technology or scope changes are agreed upon with the mentor.

---

## 🛠️ Technology Stack

- **AI Engine**: Google Cloud Vertex AI (`gemini-2.5-pro` / `gemini-3.1-pro`) with automatic failover to Nvidia NIM (`nemotron-3-ultra-550b-a55b`).
- **Backend API**: Python 3.12+, FastAPI, SQLAlchemy, Pydantic v2.
- **Database**: PostgreSQL (Supabase Cloud).
- **Frontend**: React 19, TypeScript, TanStack Start & Router, Tailwind CSS, Lucide Icons.

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:3000`
