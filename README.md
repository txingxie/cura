# Cura - AI-Powered Therapeutic Guidance Platform

A proof-of-concept web application that provides mental health counselors with AI-powered therapeutic guidance through a three-layer intelligent response system.

## Overview

Cura assists counselors by providing:
1. **Semantic Search** - Relevant examples from real counseling transcripts
2. **ML Classification** - Predicted therapeutic intervention categories with confidence scoring
3. **LLM Advice** - Generated therapeutic recommendations and next steps

## Architecture

### Three-Layer AI Pipeline
```
Patient Scenario Input
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    CURA AI PIPELINE                        │
├─────────────────────────────────────────────────────────────┤
│ 1. SEMANTIC SEARCH                                         │
│    • Vector embeddings of counseling transcripts           │
│    • Cosine similarity matching                            │
│    • Returns top 3 most relevant cases                     │
├─────────────────────────────────────────────────────────────┤
│ 2. ML CLASSIFICATION                                        │
│    • 6 evidence-based intervention categories              │
│    • Confidence scoring and alternatives                   │
│    • Based on MULTI-30 therapeutic framework               │
├─────────────────────────────────────────────────────────────┤
│ 3. LLM ADVICE GENERATION                                   │
│    • Context-aware therapeutic recommendations             │
│    • Specific techniques and considerations                 │
│    • Next steps and action items                           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
Comprehensive Response Display
```

## Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Axios for API communication

### Backend
- FastAPI for Python web framework
- Sentence Transformers for semantic embeddings
- OpenAI API for therapeutic advice generation

### Database & Infrastructure
- Supabase (PostgreSQL) with pgvector for vector search
- Docker for containerized development

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase account
- OpenAI API key

### Setup
```bash
# Clone repository
git clone https://github.com/your-username/cura.git
cd cura

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

### Configuration
Create `.env` files with your credentials:
```bash
# .env (root)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

### Run Application
```bash
# Backend (Terminal 1)
cd backend
source venv/bin/activate
python -m uvicorn main:app --host 127.0.0.1 --port 8000

# Frontend (Terminal 2)
cd frontend
npm start
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure
```
cura/
├── frontend/          # React TypeScript frontend
├── backend/           # FastAPI Python backend
├── config/            # Environment configurations
├── scripts/           # Automation scripts
├── docs/              # Documentation
└── data/              # Dataset and processed data
```

## Therapeutic Intervention Categories

Based on evidence-based therapeutic frameworks:
1. Validation & Empathy
2. Cognitive Restructuring
3. Behavioral Activation
4. Mindfulness/Grounding
5. Problem-Solving
6. Psychoeducation

## License

MIT License - see LICENSE file for details.

---

*Cura is designed to augment, not replace, professional clinical judgment. Always prioritize your clinical expertise and ethical guidelines.*

## System Architecture: Mental Model

To understand how Cura works end-to-end, here's a visual representation of the complete system:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CURA SYSTEM                                   │
└─────────────────────────────────────────────────────────────────────────────┘

USER INPUT: "Patient is struggling with work stress and anxiety"
     │
     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + TypeScript)                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │   PatientInput  │  │  Loading States │  │  Three-Layer Response UI    │ │
│  │     Form        │  │   & Progress    │  │  ┌─────────────────────────┐ │ │
│  └─────────────────┘  └─────────────────┘  │  │ 1. Similar Cases        │ │ │
│           │                    │           │  │ 2. ML Predictions       │ │ │
│           ▼                    ▼           │  │ 3. LLM Advice           │ │ │
└───────────┼────────────────────┼───────────┘  └─────────────────────────┘ │
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI + Python)                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    /therapeutic-inference                              │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │ │
│  │  │   Input         │  │   Parallel      │  │   Response              │ │ │
│  │  │  Validation     │  │   Processing    │  │   Synthesis             │ │ │
│  │  │  (Pydantic)     │  │   (async)       │  │   (JSON)                │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THREE-LAYER AI PROCESSING                              │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │   LAYER 1:      │  │   LAYER 2:      │  │   LAYER 3:                 │ │
│  │   SEMANTIC      │  │   ML CLASSIFI-   │  │   LLM GENERATION           │ │
│  │   SEARCH        │  │   CATION        │  │                             │ │
│  │                 │  │                 │  │  ┌─────────────────────────┐ │ │
│  │ • Sentence      │  │ • Zero-shot     │  │  │ • OpenAI GPT-3.5-turbo  │ │ │
│  │   Embeddings    │  │   BART-MNLI     │  │  │ • Context Integration   │ │ │
│  │ • pgvector      │  │ • Multi-label   │  │  │ • Structured Output     │ │ │
│  │ • Similarity    │  │ • Confidence    │  │  │ • Safety Filters        │ │ │
│  │   Search        │  │   Thresholding  │  │  └─────────────────────────┘ │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
│           │                    │                    │                      │
│           ▼                    ▼                    ▼                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │   Output:       │  │   Output:       │  │   Output:                  │ │
│  │   • 3 Similar   │  │   • Intervention│  │   • Therapeutic Advice     │ │
│  │     Cases       │  │     Categories  │  │   • Techniques List        │ │
│  │   • Similarity  │  │   • Confidence  │  │   • Considerations         │ │
│  │     Scores      │  │     Scores      │  │   • Next Steps             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE (Supabase)                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │   conversations │  │conversation_    │  │conversation_                │ │
│  │   table         │  │embeddings       │  │classifications              │ │
│  │                 │  │table            │  │table                        │ │
│  │ • patient_text  │  │                 │  │                             │ │
│  │ • counselor_    │  │ • patient_embed │  │ • intervention_type         │ │
│  │   response      │  │ • counselor_    │  │ • confidence_score          │ │
│  │ • metadata      │  │   embed         │  │ • model_version             │ │
│  │                 │  │ • combined_     │  │                             │ │
│  │                 │  │   embed         │  │                             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ML/AI COMPONENTS                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │   Sentence      │  │   Zero-shot     │  │   OpenAI API                │ │
│  │   Transformers  │  │   Classifier     │  │   Integration               │ │
│  │                 │  │                 │  │                             │ │
│  │ • all-MiniLM-   │  │ • facebook/     │  │ • GPT-3.5-turbo            │ │
│  │   L6-v2         │  │   bart-large-   │  │ • Custom Prompts            │ │
│  │ • 384-dim       │  │   mnli          │  │ • Safety Filters            │ │
│  │ • Triple        │  │ • Multi-label   │  │ • Error Handling            │ │
│  │   Embeddings    │  │ • Confidence    │  │                             │ │
│  │                 │  │   Calibration   │  │                             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

DATA FLOW:
1. User enters patient scenario → Frontend validates and sends to Backend
2. Backend processes in parallel: Semantic Search + ML Classification
3. Results are combined and sent to LLM for advice generation
4. All three layers are returned to Frontend for display
5. Database stores conversations, embeddings, and classifications for future use

KEY DESIGN PRINCIPLES:
• Transparency: Users see evidence (similar cases) and reasoning (ML predictions)
• Safety: Multiple layers of validation and fallback mechanisms
• Performance: Async processing and vector indexing for sub-second search
• Scalability: Modular architecture allows independent scaling of components
```

---

