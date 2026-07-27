from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User

router = APIRouter()


@router.post("/demo-login")
def demo_login(db: Session = Depends(get_db)):
    """Demo login creating or fetching a demo user profile."""
    user = db.query(User).filter(User.email == "demo@interviewai.com").first()
    if not user:
        user = User(
            email="demo@interviewai.com",
            display_name="Demo Candidate",
            firebase_uid="demo-uid-12345",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "user_id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "token": "demo-jwt-token",
    }


@router.get("/me")
def get_current_user_profile(db: Session = Depends(get_db)):
    """Get current user info."""
    user = db.query(User).first()
    if not user:
        return {"authenticated": False}
    return {
        "authenticated": True,
        "user_id": user.id,
        "email": user.email,
        "display_name": user.display_name,
    }

