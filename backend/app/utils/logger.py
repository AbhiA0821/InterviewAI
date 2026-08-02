"""
logger.py
----------
Centralized logging configuration for the backend application.
Includes structured logging helpers for AI key rotation & WebSocket events.
"""

import logging
import sys
from typing import Any, Dict


def setup_logger(name: str = "interview_ai") -> logging.Logger:
    """Configure standard application logger with uniform formatting."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


app_logger = setup_logger()


def log_interview_event(event_type: str, session_id: int, details: Dict[str, Any]) -> None:
    """Log structured WebSocket interview session event."""
    app_logger.info(f"[Session #{session_id}] Event: {event_type} | Data: {details}")
