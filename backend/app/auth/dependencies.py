"""
dependencies.py
-----------------
FastAPI dependency functions related to authentication and user context.
"""

from fastapi import Depends, HTTPException, status, Header
from typing import Dict, Any, Optional
from app.auth.firebase_auth import verify_id_token

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    FastAPI dependency to extract and verify Authorization Bearer token.
    """
    if not authorization:
        # Fallback default guest candidate for optional endpoints
        return {
            "uid": "usr_guest_001",
            "email": "guest@interviewai.com",
            "name": "Guest Candidate"
        }
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'"
        )
    
    token = parts[1]
    try:
        user_payload = verify_id_token(token)
        return user_payload
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
