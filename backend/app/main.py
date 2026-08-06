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
from app.api.routes import auth_routes, feedback_routes, interview_routes, resume_routes, ws_interview
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
import time
from collections import defaultdict
from fastapi import Request, Response

client_request_history = defaultdict(list)
RATE_LIMIT_WINDOW_SECONDS = 60
MAX_REQUESTS_PER_WINDOW = 60

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    if request.url.path in ("/health", "/api/health") or not request.url.path.startswith("/api/"):
        return await call_next(request)

    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    timestamps = [t for t in client_request_history[client_ip] if now - t < RATE_LIMIT_WINDOW_SECONDS]
    client_request_history[client_ip] = timestamps

    if len(timestamps) >= MAX_REQUESTS_PER_WINDOW:
        return Response(
            content='{"detail": "Rate limit exceeded. Please wait a minute before making more requests."}',
            status_code=429,
            media_type="application/json",
        )

    client_request_history[client_ip].append(now)
    return await call_next(request)

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
app.include_router(ws_interview.router, tags=["ws"])



@app.get("/api/health")
@app.get("/health")
def health_check():
    """Health check endpoint used by readiness probes and status monitoring."""
    config_audit = settings.validate_configuration()
    return {
        "status": "ok",
        "app_name": "Interview with Abhi",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "config": config_audit,
    }





# ---------------------------------------------------------------------------
# Unified Single Deployment: Serve Frontend Static SPA
# ---------------------------------------------------------------------------
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Do not intercept API calls, docs, or openapi endpoints
    if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json"):
        raise HTTPException(status_code=404, detail="Route not found")

    if os.path.exists(frontend_dist):
        target_file = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)

        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})

    if full_path == "" or full_path == "/":
        return {"message": "InterviewAI API is running. Build frontend dist to view full UI."}

    raise HTTPException(
        status_code=404,
        detail="Frontend build not found. Run 'npm run build' inside frontend directory to enable SPA routing."
    )

