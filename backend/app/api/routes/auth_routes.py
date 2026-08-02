from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException
import jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database.session import get_db
from app.models.user import User

import os

router = APIRouter()
settings = get_settings()

SECRET_KEY = settings.SECRET_KEY or "interviewai-secret-key-123"
ALGORITHM = "HS256"


@router.get("/firebase-config")
def get_firebase_runtime_config():
    """Dynamically return Firebase configuration loaded from runtime environment variables."""
    api_key = (
        os.getenv("VITE_FIREBASE_API_KEY")
        or os.getenv("FIREBASE_API_KEY")
        or getattr(settings, "FIREBASE_API_KEY", "")
        or "AIzaSyDp_50V-dRwcfcUQaPz2iasIzfpb01umJA"
    )
    return {
        "apiKey": api_key.strip(),
        "authDomain": os.getenv("VITE_FIREBASE_AUTH_DOMAIN", "interviewai-d249e.firebaseapp.com").strip(),
        "projectId": os.getenv("VITE_FIREBASE_PROJECT_ID", "interviewai-d249e").strip(),
        "storageBucket": os.getenv("VITE_FIREBASE_STORAGE_BUCKET", "interviewai-d249e.firebasestorage.app").strip(),
        "messagingSenderId": os.getenv("VITE_FIREBASE_MESSAGING_SENDER_ID", "980340256724").strip(),
        "appId": os.getenv("VITE_FIREBASE_APP_ID", "1:980340256724:web:a822b8c684a94f4b02b041").strip(),
    }


class GoogleAuthRequest(BaseModel):
    token: Optional[str] = None
    email: Optional[str] = None
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    google_id: Optional[str] = None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/google")
def google_authenticate(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate via Google OAuth token/JWT and save user profile into SQLite database."""
    email = request.email or "google_user@interviewai.com"
    display_name = request.display_name or "Google Candidate"
    photo_url = request.photo_url or ""

    from app.utils.logger import app_logger
    app_logger.info(f"[Auth] Processing Google authentication for user email: {email}")
    firebase_uid = request.google_id or f"google-{hash(email)}"

    # Decode payload if raw JWT token is supplied
    if request.token and "." in request.token:
        try:
            unverified = jwt.decode(request.token, options={"verify_signature": False})
            email = unverified.get("email", email)
            display_name = unverified.get("name", display_name)
            photo_url = unverified.get("picture", photo_url)
            firebase_uid = unverified.get("sub", firebase_uid)
        except Exception:
            pass

    # Query existing user in SQLite database or create new user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            display_name=display_name,
            photo_url=photo_url,
            firebase_uid=firebase_uid,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update user profile in database
        user.display_name = display_name
        if photo_url:
            user.photo_url = photo_url
        db.commit()
        db.refresh(user)

    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "display_name": user.display_name}
    )

    return {
        "user_id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "photo_url": user.photo_url,
        "token": access_token,
    }


@router.post("/demo-login")
def demo_login(db: Session = Depends(get_db)):
    """Demo login creating or fetching a demo user profile."""
    return google_authenticate(
        GoogleAuthRequest(
            email="demo@interviewai.com",
            display_name="Demo Candidate",
            google_id="demo-uid-12345",
        ),
        db,
    )


@router.get("/me")
def get_current_user_profile(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    """Get current user info from JWT authorization header."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("user_id")
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return {
                    "authenticated": True,
                    "user_id": user.id,
                    "email": user.email,
                    "display_name": user.display_name,
                    "photo_url": user.photo_url,
                }
        except Exception:
            pass

    return {"authenticated": False}


class UpdateProfileRequest(BaseModel):
    display_name: str


@router.put("/profile")
def update_user_profile(
    request: UpdateProfileRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """Update current logged in user's username/display_name in SQLite database."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header.")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session token.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    clean_name = request.display_name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Username cannot be empty.")

    user.display_name = clean_name
    db.commit()
    db.refresh(user)

    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "display_name": user.display_name}
    )

    return {
        "user_id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "photo_url": user.photo_url,
        "token": access_token,
    }

