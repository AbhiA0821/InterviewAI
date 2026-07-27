"""
config.py
---------
Centralized application configuration using Pydantic settings management.

All environment variables should be read through this module rather than
accessed directly via os.environ elsewhere in the codebase. This keeps
configuration typed, validated, and easy to mock in tests.

Values are loaded from a `.env` file in development and from real
environment variables in production (Render/Docker).
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ------------------------------------------------------------------
    # General
    # ------------------------------------------------------------------
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------
    # SQLite for local dev, PostgreSQL URL for production.
    DATABASE_URL: str = "sqlite:///./interviewai.db"

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    # ------------------------------------------------------------------
    # Firebase Authentication
    # ------------------------------------------------------------------
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_CREDENTIALS_JSON: str = ""  # path or JSON string, TBD in auth phase

    # ------------------------------------------------------------------
    # Gemini / Gemini Live API
    # ------------------------------------------------------------------
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"


    # ------------------------------------------------------------------
    # Simli (future real-time AI avatar integration)
    # ------------------------------------------------------------------
    SIMLI_API_KEY: str = ""

    # ------------------------------------------------------------------
    # Security
    # ------------------------------------------------------------------
    SECRET_KEY: str = "change-me-in-production"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor so .env is parsed only once."""
    return Settings()
