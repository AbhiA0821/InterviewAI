from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.feedback import Feedback
from app.models.interview import Interview

router = APIRouter()


@router.get("/{interview_id}")
def get_feedback(interview_id: int, db: Session = Depends(get_db)):
    """Get feedback report for completed interview."""
    feedback = db.query(Feedback).filter(Feedback.interview_id == interview_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback report not found for this interview.")

    interview = db.query(Interview).filter(Interview.id == interview_id).first()

    return {
        "id": feedback.id,
        "interview_id": feedback.interview_id,
        "target_role": interview.target_role if interview else "Software Engineer",
        "overall_score": feedback.overall_score,
        "communication_score": feedback.communication_score,
        "technical_score": feedback.technical_score,
        "problem_solving_score": feedback.problem_solving_score,
        "confidence_score": feedback.confidence_score,
        "strengths": feedback.strengths,
        "areas_for_improvement": feedback.areas_for_improvement,
        "detailed_report": feedback.detailed_report,
        "transcript": interview.transcript if interview else [],
        "created_at": feedback.created_at.isoformat(),
    }


@router.get("/history/list")
def list_feedback_history(db: Session = Depends(get_db)):
    """Get list of past feedback reports."""
    feedbacks = db.query(Feedback).order_by(Feedback.created_at.desc()).all()
    results = []
    for fb in feedbacks:
        interview = db.query(Interview).filter(Interview.id == fb.interview_id).first()
        results.append(
            {
                "id": fb.id,
                "interview_id": fb.interview_id,
                "target_role": interview.target_role if interview else "Software Engineer",
                "overall_score": fb.overall_score,
                "created_at": fb.created_at.isoformat(),
            }
        )
    return results

