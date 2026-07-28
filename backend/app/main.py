"""
main.py
--------
Unified single-deployment entrypoint for InterviewAI.

Serves both the FastAPI REST API and the React Single Page Application (SPA).
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import get_settings
from app.api.routes import auth_routes, feedback_routes, interview_routes, resume_routes
from app.database.init_db import init_db

settings = get_settings()

app = FastAPI(
    title="Interview with Abhi",
    description="Unified API & Web Application for Interview with Abhi platform.",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables on application startup
init_db()

# Register API Routers
app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume_routes.router, prefix="/api/resume", tags=["resume"])
app.include_router(interview_routes.router, prefix="/api/interview", tags=["interview"])
app.include_router(feedback_routes.router, prefix="/api/feedback", tags=["feedback"])


@app.get("/api/health")
@app.get("/health")
def health_check():
    """Health check endpoint used by readiness probes."""
    return {"status": "ok"}




# ---------------------------------------------------------------------------
# Unified Single Deployment: Serve Frontend Static SPA
# ---------------------------------------------------------------------------
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    avatars_dir = os.path.join(frontend_dist, "avatars")
    if os.path.exists(avatars_dir):
        app.mount("/avatars", StaticFiles(directory=avatars_dir), name="avatars")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept API calls
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")

        target_file = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)

        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "InterviewAI API is running. Build frontend dist to view full UI."}
else:
    @app.get("/")
    def read_root():
        return {"message": "InterviewAI API is running. Build frontend dist to serve full app."}
