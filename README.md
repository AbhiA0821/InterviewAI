# Interview with Abhi

An AI-powered interview platform. Users log in with Google, upload a
resume, select a target role, and take a live, voice-based AI
interview — then receive structured feedback and can review their
interview history.

> **Status:** Fully functional AI Interview Platform with Multi-Key Gemini Rotation, 14-Metric AI Evaluation Rubric, and Real-time Voice Proctoring.

---

## ⚡ Key Features & AI Accuracy Architecture

- **Multi-Key Gemini API Pool**: Automatic rotation across multiple API keys with 429 rate-limit fallback.
- **14-Metric Evaluation Rubric**: Comprehensive scoring covering Technical Depth, STAR Structure, System Design Trade-offs, and Communication.
- **Phonetic ASR Correction**: Post-processing STT dictionary for technical terms (PyTorch, Kubernetes, React, FastAPI).
- **Session Proctoring**: Tab-switching anti-cheat focus tracking with dynamic penalty calculations.

---

## Tech Stack

| Mobile App        | React Native + Expo + TypeScript + expo-av + React Navigation |
| Frontend (Web)    | React + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Backend           | Python + FastAPI |
| AI                | Gemini API + Gemini Live API |
| Resume Parsing    | PyMuPDF |
| Database          | SQLAlchemy ORM — SQLite (dev) / PostgreSQL (prod) |
| Authentication    | Firebase Google Authentication |
| Containerization  | Docker |
| Frontend Hosting  | Vercel |
| Backend Hosting   | Render |
| Future            | Real-time AI avatar via Simli |

---

## Project Structure

```
InterviewAI/
│
├── frontend/                # React + Vite + TS + Tailwind + shadcn/ui app
│   ├── src/
│   │   ├── components/      # UI components (ui/, common/, interview/)
│   │   ├── pages/            # Route-level page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API clients, Firebase, business logic
│   │   ├── contexts/         # React context providers (auth, interview)
│   │   ├── layouts/          # Page layout wrappers
│   │   ├── types/            # Shared TypeScript types
│   │   ├── lib/               # Small shared utilities (e.g. cn())
│   │   └── assets/            # Images, icons
│   └── public/
│
├── backend/                 # Python + FastAPI service
│   └── app/
│       ├── api/routes/       # FastAPI route modules
│       ├── auth/             # Firebase token verification, auth deps
│       ├── database/         # SQLAlchemy engine/session/base
│       ├── models/           # SQLAlchemy ORM models
│       ├── services/         # Gemini, Gemini Live, Simli, user services
│       ├── prompts/          # Gemini prompt templates
│       ├── resume_parser/    # PyMuPDF-based resume parsing
│       ├── interview_engine/ # Live interview session/question logic
│       ├── feedback/         # Feedback generation & scoring
│       └── utils/            # Logging, exceptions, validators
│
├── docs/                     # Architecture notes, API reference, setup guide
├── docker/                   # Shared/auxiliary Docker assets
├── scripts/                  # Dev convenience scripts (setup.sh, dev.sh)
│
├── .gitignore
├── README.md
├── docker-compose.yml
└── requirements.txt           # Pointer to backend/requirements.txt
```

---

## Getting Started (once features are implemented)

### 1. Clone and configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in Firebase, Gemini, and (later) Simli credentials.

### 2. Run with the setup script

```bash
./scripts/setup.sh
./scripts/dev.sh
```

### 3. Or run with Docker Compose

```bash
docker-compose up --build
```

- Backend API available at `http://localhost:8000/api/health`
- Frontend UI available at `http://localhost:5173` (dev) or via unified single-app server (`python run_unified_app.py`)

---

## Roadmap & Status

1. ✅ Project scaffold & directory architecture
2. ✅ Backend: database models + SQLite / PostgreSQL setup
3. ✅ Backend: Firebase authentication & JWT verification
4. ✅ Backend: resume upload + PyMuPDF parsing & domain detection
5. ✅ Backend: interview engine + Gemini API multi-key pool rotation
6. ✅ Backend: 14-metric feedback evaluation & scoring engine
7. ✅ Frontend: auth flow + routing + glassmorphism theme layout
8. ✅ Frontend: resume upload + parsed section breakdown UI
9. ✅ Frontend: live interview room + speech-to-text resilience & status badges
10. ✅ Frontend: feedback report + learning roadmap & history views
11. ✅ Unified Deployment: Docker, Vercel, Render single-process SPA support
12. 🔄 Future: real-time AI avatar via Simli

---

## License

MIT License - feel free to use and adapt for your interview preparation platform.

