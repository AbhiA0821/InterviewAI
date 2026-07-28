from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.feedback import Feedback
from app.models.interview import Interview
from app.services.ai_service import ai_service
from app.services.gemini_service import gemini_service

router = APIRouter()


@router.get("/{interview_id}")
def get_feedback(interview_id: int, db: Session = Depends(get_db)):
    """Get feedback report for interview. Auto-generates report using Groq AI if missing."""
    feedback = db.query(Feedback).filter(Feedback.interview_id == interview_id).first()
    interview = db.query(Interview).filter(Interview.id == interview_id).first()

    placeholders = {
        "[no answer provided]", "n/a", "pass", "skip", "none", "?", "...",
        "i don't know", "idk"
    }
    user_texts = [
        t.get("text", "").strip()
        for t in ((interview.transcript if interview else []) or [])
        if t.get("role") == "user"
        and t.get("text", "").strip()
        and t.get("text", "").strip().lower() not in placeholders
    ]
    has_valid_answers = len(user_texts) > 0 and len(" ".join(user_texts).split()) >= 5

    if feedback and not has_valid_answers and feedback.overall_score > 0:
        feedback.overall_score = 0.0
        feedback.communication_score = 0.0
        feedback.technical_score = 0.0
        feedback.problem_solving_score = 0.0
        feedback.confidence_score = 0.0
        feedback.detailed_report = {
            "summary": f"The candidate started the interview session for {interview.target_role if interview else 'practice'} but left without providing valid answers.",
            "key_takeaway": "Session left incomplete / abandoned.",
            "recommendation": "Incomplete / Abandoned",
        }
        db.commit()

    if not feedback:
        if not interview:
            raise HTTPException(status_code=404, detail="Interview session not found.")

        # Generate evaluation report using Gemini Service multi-key pool
        try:
            eval_data = gemini_service.generate_feedback_report(
                target_role=interview.target_role,
                transcript=interview.transcript or [],
                questions=interview.questions or [],
            )
        except Exception:
            eval_data = {}

        def safe_float(val, default):
            try:
                return float(val)
            except (ValueError, TypeError):
                return default

        default_score = 0.0 if not has_valid_answers else 50.0

        feedback = Feedback(
            interview_id=interview.id,
            overall_score=safe_float(eval_data.get("overall_score"), default_score),
            communication_score=safe_float(eval_data.get("communication_score"), default_score),
            technical_score=safe_float(eval_data.get("technical_score"), default_score),
            problem_solving_score=safe_float(eval_data.get("problem_solving_score"), default_score),
            confidence_score=safe_float(eval_data.get("confidence_score"), default_score),
            strengths=eval_data.get("strengths") or (
                ["Session initiated."] if not has_valid_answers else ["Attempted practice interview."]
            ),
            areas_for_improvement=eval_data.get("areas_for_improvement") or [
                "Attempt all interview questions and provide spoken or written answers to receive a performance evaluation."
            ],
            detailed_report=eval_data.get("detailed_report") or {
                "summary": f"The candidate started the interview session for {interview.target_role} but left without providing valid answers."
                if not has_valid_answers
                else f"Practice session completed for {interview.target_role}.",
                "key_takeaway": "Session left incomplete / abandoned." if not has_valid_answers else "Practice session completed.",
                "recommendation": "Incomplete / Abandoned" if not has_valid_answers else "Needs Improvement",
            },
            created_at=datetime.utcnow(),
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)

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
