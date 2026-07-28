from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.feedback import Feedback
from app.models.interview import Interview
from app.models.resume import Resume
from app.services.ai_service import ai_service
from app.services.gemini_service import gemini_service
from app.services.simli_service import simli_service

router = APIRouter()


class StartInterviewRequest(BaseModel):
    target_role: str
    resume_id: Optional[int] = None
    interview_type: Optional[str] = "technical"
    experience_level: Optional[str] = "Fresher"


class AnswerRequest(BaseModel):
    answer_text: str


@router.post("/start")
def start_interview(request: StartInterviewRequest, db: Session = Depends(get_db)):
    """Start a new AI interview session."""
    resume_summary = "General Engineering experience."
    target_role = request.target_role

    if request.resume_id:
        resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
        if resume and resume.raw_text:
            resume_summary = resume.raw_text[:4000]
            # Auto-detect domain if default role
            if not target_role or target_role in ("General Engineering", "Full Stack Software Engineer"):
                target_role = gemini_service.auto_detect_domain(resume.raw_text[:3000])

    mode_name = (request.interview_type or "technical").upper()
    questions = gemini_service.generate_interview_questions(
        target_role=target_role,
        resume_summary=resume_summary,
        interview_type=request.interview_type or "technical",
        num_questions=5,
    )

    first_q_text = questions[0]["question"] if questions else "Can you introduce yourself?"
    initial_transcript = [
        {
            "role": "interviewer",
            "text": first_q_text,
            "timestamp": datetime.utcnow().isoformat(),
        }
    ]




    interview = Interview(
        target_role=request.target_role,
        resume_id=request.resume_id,
        questions=questions,
        transcript=initial_transcript,
        current_question_index=0,
        status="in_progress",
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    return {
        "interview_id": interview.id,
        "target_role": interview.target_role,
        "status": interview.status,
        "questions": questions,
        "current_question_index": 0,
        "total_questions": len(questions),
        "transcript": interview.transcript,
    }


@router.post("/{interview_id}/answer")
def answer_question(
    interview_id: int, request: AnswerRequest, db: Session = Depends(get_db)
):
    """Submit candidate response and receive next question or completion signal."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")

    if interview.status != "in_progress":
        raise HTTPException(status_code=400, detail="Interview is already completed.")

    # Record user response
    current_transcript = list(interview.transcript or [])
    current_transcript.append(
        {
            "role": "user",
            "text": request.answer_text,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )

    next_index = interview.current_question_index + 1
    questions = interview.questions or []
    is_finished = next_index >= len(questions)

    if not is_finished:
        followup_q = gemini_service.generate_followup_question(
            target_role=interview.target_role,
            interview_type="technical",
            transcript=current_transcript,
            next_index=next_index,
        )
        current_transcript.append(
            {
                "role": "interviewer",
                "text": followup_q,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        interview.current_question_index = next_index

    else:
        current_transcript.append(
            {
                "role": "interviewer",
                "text": "Thank you! That completes our interview questions. Generating your feedback report now...",
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
        interview.status = "completed"
        interview.completed_at = datetime.utcnow()

    interview.transcript = current_transcript
    db.commit()
    db.refresh(interview)

    return {
        "interview_id": interview.id,
        "current_question_index": interview.current_question_index,
        "is_finished": is_finished,
        "transcript": interview.transcript,
    }


@router.post("/{interview_id}/finish")
def finish_interview(interview_id: int, db: Session = Depends(get_db)):
    """Finish interview and compute AI evaluation scores & feedback."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")

    interview.status = "completed"
    if not interview.completed_at:
        interview.completed_at = datetime.utcnow()

    # Check candidate response presence
    placeholders = {
        "[no answer provided]", "n/a", "pass", "skip", "none", "?", "...",
        "i don't know", "idk"
    }
    user_texts = [
        t.get("text", "").strip()
        for t in (interview.transcript or [])
        if t.get("role") == "user"
        and t.get("text", "").strip()
        and t.get("text", "").strip().lower() not in placeholders
    ]
    has_valid_answers = len(user_texts) > 0 and len(" ".join(user_texts).split()) >= 5

    # Generate Feedback if not existing
    existing_fb = db.query(Feedback).filter(Feedback.interview_id == interview_id).first()
    if not existing_fb:
        try:
            eval_data = gemini_service.evaluate_interview(
                target_role=interview.target_role,
                transcript=interview.transcript or [],
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
                ["Session initiated."] if not has_valid_answers else ["Attempted interview practice session."]
            ),
            areas_for_improvement=eval_data.get("areas_for_improvement") or (
                ["Attempt interview questions and speak or type complete answers to receive an AI performance evaluation."]
            ),
            detailed_report=eval_data.get("detailed_report") or {
                "summary": f"The candidate started the interview session for {interview.target_role} but left without providing valid answers."
                if not has_valid_answers
                else f"Practice session completed for {interview.target_role}.",
                "key_takeaway": "Session left incomplete / abandoned." if not has_valid_answers else "Practice session completed.",
                "recommendation": "Incomplete / Abandoned" if not has_valid_answers else "Needs Improvement",
            },
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
    else:
        feedback = existing_fb
        if not has_valid_answers and feedback.overall_score > 0:
            feedback.overall_score = 0.0
            feedback.communication_score = 0.0
            feedback.technical_score = 0.0
            feedback.problem_solving_score = 0.0
            feedback.confidence_score = 0.0
            feedback.detailed_report = {
                "summary": f"The candidate started the interview session for {interview.target_role} but left without providing valid answers.",
                "key_takeaway": "Session left incomplete / abandoned.",
                "recommendation": "Incomplete / Abandoned",
            }
            db.commit()

    return {
        "interview_id": interview.id,
        "status": interview.status,
        "feedback_id": feedback.id,
        "overall_score": feedback.overall_score,
    }


@router.get("/history")
def list_interview_history(db: Session = Depends(get_db)):
    """List all past interviews."""
    placeholders = {
        "[no answer provided]", "n/a", "pass", "skip", "none", "?", "...",
        "i don't know", "idk"
    }
    interviews = db.query(Interview).order_by(Interview.started_at.desc()).all()
    results = []
    for item in interviews:
        fb = db.query(Feedback).filter(Feedback.interview_id == item.id).first()

        user_texts = [
            t.get("text", "").strip()
            for t in (item.transcript or [])
            if t.get("role") == "user"
            and t.get("text", "").strip()
            and t.get("text", "").strip().lower() not in placeholders
        ]
        has_valid_answers = len(user_texts) > 0 and len(" ".join(user_texts).split()) >= 5

        # Sanitize feedback if zero valid answers but positive overall_score stored
        if fb and not has_valid_answers and fb.overall_score > 0:
            fb.overall_score = 0.0
            fb.communication_score = 0.0
            fb.technical_score = 0.0
            fb.problem_solving_score = 0.0
            fb.confidence_score = 0.0
            fb.detailed_report = {
                "summary": f"The candidate started the interview session for {item.target_role} but left without providing valid answers.",
                "key_takeaway": "Session left incomplete / abandoned.",
                "recommendation": "Incomplete / Abandoned",
            }
            db.commit()

        results.append(
            {
                "id": item.id,
                "target_role": item.target_role,
                "status": "incomplete" if not has_valid_answers and item.status != "completed" else item.status,
                "started_at": item.started_at.isoformat() if item.started_at else None,
                "completed_at": item.completed_at.isoformat() if item.completed_at else None,
                "overall_score": fb.overall_score if fb else (0.0 if not has_valid_answers else None),
            }
        )
    return results


@router.get("/{interview_id}")
def get_interview(interview_id: int, db: Session = Depends(get_db)):
    """Get detailed interview session."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")
    return {
        "id": interview.id,
        "target_role": interview.target_role,
        "status": interview.status,
        "questions": interview.questions,
        "current_question_index": interview.current_question_index,
        "transcript": interview.transcript,
        "started_at": interview.started_at.isoformat() if interview.started_at else None,
    }


@router.get("/simli-session")
def get_simli_session(gender: str = "female"):
    """Get active Simli WebRTC session for real-time lip-synced video avatar."""
    return simli_service.create_session(gender)


