from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.feedback import Feedback
from app.models.interview import Interview
from app.models.resume import Resume
from app.services.gemini_service import gemini_service

router = APIRouter()


class StartInterviewRequest(BaseModel):
    target_role: str
    resume_id: Optional[int] = None


class AnswerRequest(BaseModel):
    answer_text: str


@router.post("/start")
def start_interview(request: StartInterviewRequest, db: Session = Depends(get_db)):
    """Start a new AI interview session."""
    resume_summary = "General Software Engineering experience."
    if request.resume_id:
        resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
        if resume and resume.raw_text:
            resume_summary = resume.raw_text[:1000]

    questions = gemini_service.generate_interview_questions(
        target_role=request.target_role,
        resume_summary=resume_summary,
        num_questions=5,
    )

    first_q_text = questions[0]["question"] if questions else "Can you introduce yourself?"
    initial_transcript = [
        {
            "role": "interviewer",
            "text": f"Hello! Welcome to your AI interview for the position of {request.target_role}. Let's get started. {first_q_text}",
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
        next_q_text = questions[next_index]["question"]
        current_transcript.append(
            {
                "role": "interviewer",
                "text": f"Thank you for sharing that. Question {next_index + 1}: {next_q_text}",
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

    # Generate Feedback if not existing
    existing_fb = db.query(Feedback).filter(Feedback.interview_id == interview_id).first()
    if not existing_fb:
        eval_data = gemini_service.evaluate_interview(
            target_role=interview.target_role,
            transcript=interview.transcript or [],
        )
        feedback = Feedback(
            interview_id=interview.id,
            overall_score=eval_data["overall_score"],
            communication_score=eval_data.get("communication_score"),
            technical_score=eval_data.get("technical_score"),
            problem_solving_score=eval_data.get("problem_solving_score"),
            confidence_score=eval_data.get("confidence_score"),
            strengths=eval_data.get("strengths", []),
            areas_for_improvement=eval_data.get("areas_for_improvement", []),
            detailed_report=eval_data.get("detailed_report", {}),
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
    else:
        feedback = existing_fb

    return {
        "interview_id": interview.id,
        "status": interview.status,
        "feedback_id": feedback.id,
        "overall_score": feedback.overall_score,
    }


@router.get("/history")
def list_interview_history(db: Session = Depends(get_db)):
    """List all past interviews."""
    interviews = db.query(Interview).order_by(Interview.started_at.desc()).all()
    results = []
    for item in interviews:
        fb = db.query(Feedback).filter(Feedback.interview_id == item.id).first()
        results.append(
            {
                "id": item.id,
                "target_role": item.target_role,
                "status": item.status,
                "started_at": item.started_at.isoformat() if item.started_at else None,
                "completed_at": item.completed_at.isoformat() if item.completed_at else None,
                "overall_score": fb.overall_score if fb else None,
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

