"""
main.py
--------
Application entrypoint for the InterviewAI backend.

Responsible for:
    - Creating the FastAPI app instance
    - Registering middleware (CORS, etc.)
    - Registering API routers (see app/api/routes)
    - Wiring up startup/shutdown events (DB connection, etc.)

Run locally with:
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings

settings = get_settings()

app = FastAPI(
    title="InterviewAI API",
    description="Backend API for the InterviewAI platform.",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.routes import auth_routes, feedback_routes, interview_routes, resume_routes
from app.database.init_db import init_db

# Initialize database tables on application startup
init_db()

app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume_routes.router, prefix="/api/resume", tags=["resume"])
app.include_router(interview_routes.router, prefix="/api/interview", tags=["interview"])
app.include_router(feedback_routes.router, prefix="/api/feedback", tags=["feedback"])


@app.get("/")
def read_root():
    """Basic health-check / welcome route."""
    return {"message": "InterviewAI API is running."}


@app.get("/health")
def health_check():
    """Health check endpoint used by Docker/Render for readiness probes."""
    return {"status": "ok"}

