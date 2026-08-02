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
    # Gemini / Gemini Live API (Multi-Key Rotation Pool)
    # ------------------------------------------------------------------
    GEMINI_API_KEY: str = ""
    GEMINI_API_KEYS: str = ""  # Comma or newline separated list of multiple Gemini API keys
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMINI_TEMPERATURE: float = 0.7
    GEMINI_TIMEOUT_SECONDS: float = 5.0

    def get_all_gemini_api_keys(self) -> List[str]:
        """
        Extract all configured Gemini API keys from:
        1. GEMINI_API_KEYS (comma, space, semicolon, or newline-separated string)
        2. GEMINI_API_KEY_1, GEMINI_API_KEY_2, ... env variables
        3. Single GEMINI_API_KEY
        Returns a deduplicated list of valid non-placeholder API keys.
        """
        import os
        import re
        keys: List[str] = []

        # 1. GEMINI_API_KEYS (multi-key string)
        raw_keys_str = self.GEMINI_API_KEYS or os.getenv("GEMINI_API_KEYS", "")
        if raw_keys_str:
            parts = re.split(r'[,;\s\n\r]+', raw_keys_str)
            for p in parts:
                clean_p = p.strip().strip("'\"")
                if clean_p and not clean_p.startswith("your-"):
                    keys.append(clean_p)

        # 2. GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
        for env_var, value in os.environ.items():
            if env_var.startswith("GEMINI_API_KEY_") and value:
                clean_v = str(value).strip().strip("'\"")
                if clean_v and not clean_v.startswith("your-"):
                    keys.append(clean_v)

        # 3. Single GEMINI_API_KEY
        if self.GEMINI_API_KEY:
            clean_s = self.GEMINI_API_KEY.strip().strip("'\"")
            if clean_s and not clean_s.startswith("your-"):
                keys.append(clean_s)

        # Deduplicate preserving order
        seen = set()
        unique_keys = []
        for k in keys:
            if k not in seen:
                seen.add(k)
                unique_keys.append(k)

        return unique_keys


    # ------------------------------------------------------------------
    # Simli (future real-time AI avatar integration)
    # ------------------------------------------------------------------
    SIMLI_API_KEY: str = ""

    # ------------------------------------------------------------------
    # Security
    # ------------------------------------------------------------------
    SECRET_KEY: str = "change-me-in-production"

    class Config:
        import os
        backend_env = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
        env_file = (backend_env, ".env")
        case_sensitive = True
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor so .env is parsed only once."""
    return Settings()
