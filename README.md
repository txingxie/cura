# Cura - AI-Powered Counselor Guidance Platform

**An intelligent co-pilot for mental health counselors providing data-backed insights and therapeutic recommendations.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)](https://supabase.com/)

## 🎯 Overview

Cura assists mental health counselors when they face challenging patient scenarios by providing a **three-layered intelligent response system**:

1. **📋 Similar Cases** - Relevant examples from real counseling transcripts using semantic search
2. **🤖 ML Insights** - Predicted therapeutic intervention category with confidence scoring  
3. **💡 LLM Advice** - Generated therapeutic recommendations and next steps

### The Problem
Mental health counselors face nuanced, high-pressure decisions when determining how to best support their patients. They need quick access to evidence-based insights and therapeutic strategies.

### The Solution
Cura acts as an intelligent co-pilot, combining machine learning, semantic search, and large language models to provide contextual guidance based on real counseling data and evidence-based therapeutic frameworks.

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Web    │    │   FastAPI       │    │   Supabase     │
│   Frontend      │◄──►│   Backend       │◄──►│   Database     │
│                 │    │                  │    │                 │
│ • Input Forms   │    │ • API Routes     │    │ • Conversations │
│ • Response UI   │    │ • ML Models      │    │ • Embeddings    │
│ • State Mgmt    │    │ • LLM Service    │    │ • Vector Search │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

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

## ✨ Features

### Core Functionality
- 🔍 **Semantic Search** - Find similar counseling scenarios from real transcript data
- 🎯 **ML Classification** - Predict optimal therapeutic intervention approach
- 🧠 **LLM Integration** - Generate contextual therapeutic advice
- 📊 **Confidence Scoring** - Transparent AI predictions with uncertainty quantification
- 📱 **Responsive Design** - Professional interface optimized for counselor workflows

### Therapeutic Intervention Categories
Based on the MULTI-30 evidence-based framework:
1. **Validation & Empathy** - Emotional support and understanding
2. **Cognitive Restructuring** - Challenge negative thought patterns (CBT)
3. **Behavioral Activation** - Encourage activity and engagement
4. **Mindfulness/Grounding** - Present-moment awareness techniques
5. **Problem-Solving** - Practical steps and action planning
6. **Psychoeducation** - Teaching coping skills and understanding

### Technical Features
- 🔐 **Secure Configuration** - Environment-based settings management
- 🚀 **Fast Performance** - <3 second response times
- 🔄 **Real-time Updates** - Live API integration
- 🧪 **Testing Coverage** - Comprehensive unit and integration tests
- 📖 **API Documentation** - Auto-generated OpenAPI/Swagger docs
- 🐳 **Docker Support** - Containerized development environment

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for professional, responsive design
- **Axios** for API communication
- **React Hooks** for state management

### Backend
- **FastAPI** for high-performance Python web framework
- **Pydantic** for data validation and settings management
- **Uvicorn** for ASGI server
- **Sentence Transformers** for semantic embeddings
- **OpenAI API** for therapeutic advice generation
- **Scikit-learn** for ML model training and inference

### Database & Infrastructure
- **Supabase** (PostgreSQL) for data storage
- **pgvector** extension for vector similarity search
- **Docker** for containerized development
- **Git** for version control

### Data & ML
- **CounselChat Dataset** (~3,000 mental health conversations)
- **Pre-trained Transformers** (BERT/RoBERTa) for classification
- **Vector Embeddings** for semantic similarity
- **Evidence-based Categories** using MULTI-30 framework

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **Git** (for version control)
- **Supabase Account** (for database)
- **OpenAI API Key** (for LLM integration)

### 1. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/your-username/cura.git
cd cura

# Setup development environment
./scripts/setup-env.sh development
```

### 2. Configure Credentials
Add your credentials to `.env` and `backend/.env`:
```bash
# Required credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Run the Application

**Option A: Local Development**
```bash
# Start backend (in one terminal)
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py

# Start frontend (in another terminal)
cd frontend
npm install
npm start
```

**Option B: Docker Development**
```bash
# Start all services
./docker-dev.sh up

# Or manually
docker compose up
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📚 Documentation

### Environment Setup
- [📖 Environment Configuration Guide](./docs/ENVIRONMENT_SETUP.md) - Comprehensive setup instructions
- [⚙️ Configuration Reference](./docs/ENVIRONMENT_SETUP.md#environment-variables-reference) - All available settings

### API Documentation
- **Interactive Docs**: http://localhost:8000/docs (when running)
- **ReDoc**: http://localhost:8000/redoc (alternative format)

### Development
- [🔧 Development Workflow](#development-workflow) - Common tasks and commands
- [🧪 Testing](#testing) - Running tests and coverage
- [🐳 Docker Usage](#docker-usage) - Container development

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests  
cd frontend
npm test

# Run all tests with coverage
./scripts/test-all.sh  # (to be created)
```

### Test Coverage
- **Backend**: Unit tests for services, API routes, and database operations
- **Frontend**: Component tests and integration tests
- **E2E**: End-to-end testing of the complete three-layer pipeline

## 🐳 Docker Usage

### Development Environment
```bash
# Start development environment
./docker-dev.sh up

# View logs
./docker-dev.sh logs

# Stop services
./docker-dev.sh down

# Rebuild containers
./docker-dev.sh build

# Access backend shell
./docker-dev.sh shell
```

### Services
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000  
- **Database**: PostgreSQL on port 5432
- **Adminer**: http://localhost:8080 (database management UI)

## 🔧 Development Workflow

### Common Tasks
```bash
# Check environment configuration
./scripts/setup-env.sh check

# Start local development
cd backend && source venv/bin/activate && python main.py
cd frontend && npm start

# Add new dependencies
cd backend && pip install package-name && pip freeze > requirements.txt
cd frontend && npm install package-name

# Run linting and formatting
cd backend && black . && flake8
cd frontend && npm run lint

# Database operations
cd backend && python database/init_db.py
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: description of changes"

# Push and create pull request
git push origin feature/your-feature-name
```

## 📁 Project Structure

```
cura/
├── 📁 frontend/                 # React TypeScript frontend
│   ├── 📁 src/
│   │   ├── 📁 components/       # React components
│   │   ├── 📁 services/         # API services
│   │   ├── 📁 config/           # Frontend configuration
│   │   └── 📁 types/            # TypeScript definitions
│   ├── 📄 package.json
│   └── 📄 tailwind.config.js
├── 📁 backend/                  # FastAPI Python backend
│   ├── 📁 api/                  # API routes and endpoints
│   ├── 📁 services/             # Business logic services
│   ├── 📁 database/             # Database models and connections
│   ├── 📁 models/               # ML models and training
│   ├── 📄 main.py              # FastAPI application entry
│   ├── 📄 config.py            # Configuration management
│   └── 📄 requirements.txt     # Python dependencies
├── 📁 config/                   # Environment configurations
├── 📁 scripts/                  # Automation scripts
├── 📁 docs/                     # Documentation
├── 📁 data/                     # Dataset and processed data
├── 📄 docker-compose.yml       # Container orchestration
├── 📄 .gitignore               # Git ignore rules
└── 📄 README.md                # This file
```

## 🚀 Deployment

### Production Deployment

1. **Setup Production Environment**
   ```bash
   ./scripts/setup-env.sh production
   ```

2. **Configure Production Settings**
   - Set strong `SECRET_KEY`
   - Configure production Supabase project
   - Set up monitoring (Sentry)
   - Configure CORS for your domain

3. **Deploy Options**
   - **Vercel** (Frontend) + **Railway/Render** (Backend)
   - **Docker** containers on cloud providers
   - **Traditional** server deployment

### Environment Variables for Production
See [production configuration template](./config/production.env.template) for complete setup.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup
1. Follow the [Quick Start](#quick-start) guide
2. Read the [Development Workflow](#development-workflow)
3. Check existing issues and discussions

## 📊 Project Status

### Current Implementation (v1.0)
- ✅ **Infrastructure**: React + FastAPI + Supabase setup complete
- ✅ **Environment Management**: Comprehensive configuration system
- ✅ **Docker Development**: Containerized development environment
- 🔄 **Data Pipeline**: In progress (Task 2.0)
- ⏳ **ML Model**: Planned (Task 3.0)
- ⏳ **API Development**: Planned (Task 4.0)
- ⏳ **Frontend UI**: Planned (Task 5.0)
- ⏳ **Integration**: Planned (Task 6.0)

### Roadmap
- **Phase 1**: Data processing and ML model training
- **Phase 2**: API development and integration
- **Phase 3**: Frontend implementation and testing
- **Phase 4**: Performance optimization and deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check our [comprehensive guides](./docs/)
- **Environment Issues**: Run `./scripts/setup-env.sh check`
- **API Issues**: Visit http://localhost:8000/docs for interactive API testing
- **General Questions**: Create an issue on GitHub

### Common Issues
- **Database Connection**: Verify Supabase credentials in `.env`
- **OpenAI API**: Check API key format and quotas
- **CORS Errors**: Ensure frontend URL is in `CORS_ORIGINS`
- **Port Conflicts**: Check if ports 3000/8000 are available

## 🙏 Acknowledgments

- **CounselChat Dataset** - For providing real counseling conversation data
- **MULTI-30 Framework** - For evidence-based therapeutic intervention categories
- **Open Source Community** - For the amazing tools and libraries that make this possible

---

**Built with ❤️ for mental health professionals**

*Cura is designed to augment, not replace, professional clinical judgment. Always prioritize your clinical expertise and ethical guidelines.*
