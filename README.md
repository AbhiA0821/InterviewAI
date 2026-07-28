# Interview with Abhi

An AI-powered interview platform. Users log in with Google, upload a
resume, select a target role, and take a live, voice-based AI
interview — then receive structured feedback and can review their
interview history.

> **Status:** Project scaffold only. This phase sets up a clean,
> scalable folder structure and boilerplate config. No features are
> implemented yet — that comes in subsequent phases.

---

## Tech Stack

| Layer            | Technology |
|-------------------|------------|
| Frontend          | React + Vite + TypeScript + Tailwind CSS + shadcn/ui |
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

- Backend available at `http://localhost:8000`
- Frontend available at `http://localhost:4173` (Docker) or
  `http://localhost:5173` (`npm run dev`)

---

## Roadmap (phased build-out)

1. ✅ Project scaffold (this phase)
2. Backend: database models + SQLite setup
3. Backend: Firebase authentication
4. Backend: resume upload + PyMuPDF parsing
5. Backend: interview engine + Gemini / Gemini Live integration
6. Backend: feedback generation
7. Frontend: auth flow + routing + layout
8. Frontend: resume upload + role selection UI
9. Frontend: live interview UI (audio streaming)
10. Frontend: feedback + history views
11. Deployment: Docker, Vercel, Render
12. Future: real-time AI avatar via Simli

---

## License

TBD.
