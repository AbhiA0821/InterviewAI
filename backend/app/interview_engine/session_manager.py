import logging
from datetime import datetime
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from app.interview_engine.conversation_state import ConversationState, InterviewStage
from app.interview_engine.question_generator import question_generator
from app.models.interview import Interview
from app.models.resume import Resume

logger = logging.getLogger(__name__)


class SessionManager:
    """Manages interview lifecycle, question transitions, state tracking, and transcript histories."""

    def create_session(
        self,
        db: Session,
        target_role: str,
        resume_id: Optional[int] = None,
        job_description: Optional[str] = None,
        interview_type: str = "technical",
        difficulty: str = "Intermediate",
        duration: str = "15 mins",
    ) -> Interview:
        """Create and initialize a new stateful interview session in the database."""
        resume_summary = "General Engineering experience."
        resume = None
        if resume_id:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()

        if not resume:
            resume = db.query(Resume).order_by(Resume.id.desc()).first()

        if resume and resume.raw_text:
            resume_summary = resume.raw_text

        # Extract JD skills vs Resume skills comparison if Job Description provided
        from app.services.gemini_service import gemini_service
        jd_analysis = {}
        if job_description and job_description.strip():
            try:
                jd_analysis = gemini_service.analyze_resume_vs_jd(resume_summary, job_description)
            except Exception as e:
                logger.warning(f"[SessionManager] JD analysis warning: {e}")

        questions = question_generator.generate_initial_questions(
            target_role=target_role,
            resume_summary=resume_summary,
            interview_type=interview_type,
            num_questions=6,
        )

        first_q_text = (
            questions[0]["question"]
            if questions
            else f"Welcome to your interview for {target_role}! To start off, please tell me about yourself."
        )

        initial_transcript = [
            {
                "role": "interviewer",
                "text": first_q_text,
                "timestamp": datetime.utcnow().isoformat(),
                "stage": InterviewStage.SELF_INTRO.value,
            }
        ]

        initial_memory = {
            "candidate_projects": [],
            "technologies_discussed": [],
            "strong_topics": [],
            "weak_topics": [],
            "topics_covered": ["self_introduction"],
            "topics_remaining": (jd_analysis.get("matching_skills") or []) + ["projects", "internship", "behavioral"],
            "claims_to_verify": [],
            "current_topic": "self_introduction",
            "followup_depth": 0,
            "max_followup_depth": 2,
        }

        initial_coverage = {
            "self_intro": "COVERED",
            "primary_project": "PENDING",
            "tech_stack": "PENDING",
            "internship_experience": "PENDING",
            "problem_solving": "PENDING",
            "behavioral_star": "PENDING",
        }

        interview = Interview(
            target_role=target_role,
            resume_id=resume.id if resume else None,
            job_description=job_description,
            jd_analysis=jd_analysis,
            interview_type=interview_type,
            difficulty=difficulty,
            duration=duration,
            questions=questions,
            transcript=initial_transcript,
            current_question_index=0,
            status="in_progress",
            coverage_matrix=initial_coverage,
            long_term_memory=initial_memory,
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
        return interview

    def get_state(self, interview: Interview) -> ConversationState:
        """Construct ConversationState dataclass from an Interview DB record."""
        current_index = interview.current_question_index or 0
        total_questions = len(interview.questions or []) or 5

        stage = InterviewStage.NOT_STARTED
        if current_index == 0:
            stage = InterviewStage.SELF_INTRO
        elif 1 <= current_index < max(1, total_questions - 2):
            stage = InterviewStage.RESUME_DEEP_DIVE
        elif current_index == total_questions - 2:
            stage = InterviewStage.FOLLOW_UP_PROBING
        elif current_index >= total_questions - 1:
            stage = InterviewStage.WRAP_UP

        if interview.status == "completed":
            stage = InterviewStage.COMPLETED

        return ConversationState(
            interview_id=interview.id,
            target_role=interview.target_role,
            stage=stage,
            current_turn=current_index,
            total_questions=total_questions,
            transcript=interview.transcript or [],
        )


    def process_candidate_answer(
        self,
        db: Session,
        interview: Interview,
        candidate_answer: str,
    ) -> Dict[str, Any]:
        """
        Process incoming candidate answer:
        1. Validate answer is non-empty.
        2. Evaluate answer + resume + conversation history via GeminiService.
        3. Save candidate answer turn AND new interviewer question turn into DB transcript.
        4. Advance interview state.
        """
        clean_answer = (candidate_answer or "").strip()
        if not clean_answer:
            return {
                "error": "No answer detected. Please try again.",
                "status": "error",
            }

        from app.services.gemini_service import gemini_service

        resume_summary = "General Engineering experience."
        if interview.resume_id:
            resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
            if resume and resume.raw_text:
                resume_summary = resume.raw_text

        current_index = interview.current_question_index or 0
        transcript = list(interview.transcript or [])

        # Find current question text
        current_q_text = "Tell me about yourself."
        for t in reversed(transcript):
            if t.get("role") == "interviewer":
                current_q_text = t.get("text", current_q_text)
                break

        # Append candidate answer to transcript
        user_turn = {
            "role": "user",
            "text": clean_answer,
            "timestamp": datetime.utcnow().isoformat(),
        }
        transcript.append(user_turn)

        # Call Gemini to evaluate answer and generate dynamic follow-up / next question
        eval_result = gemini_service.evaluate_turn_and_generate_next(
            target_role=interview.target_role or "Software Engineer",
            interview_type="technical",
            resume_summary=resume_summary,
            current_question=current_q_text,
            candidate_answer=clean_answer,
            transcript_history=transcript,
            question_number=current_index + 1,
        )

        next_question_text = eval_result.get("next_question") or "Tell me more about your technical experience."

        # Append next interviewer question to transcript
        interviewer_turn = {
            "role": "interviewer",
            "text": next_question_text,
            "timestamp": datetime.utcnow().isoformat(),
            "evaluation": {
                "relevance": eval_result.get("relevance", 8),
                "technical_accuracy": eval_result.get("technical_accuracy", 7),
                "depth": eval_result.get("depth", 7),
                "clarity": eval_result.get("clarity", 8),
            },
        }
        transcript.append(interviewer_turn)

        # Update DB record
        interview.transcript = transcript
        interview.current_question_index = current_index + 1

        # Check if total questions limit reached (e.g. 6 turns)
        if interview.current_question_index >= 6:
            interview.status = "completed"

        db.commit()
        db.refresh(interview)

        return {
            "status": "success",
            "interview_id": interview.id,
            "question": next_question_text,
            "question_index": interview.current_question_index,
            "total_questions": 6,
            "is_completed": interview.status == "completed",
            "evaluation": eval_result,
            "transcript": interview.transcript,
        }


session_manager = SessionManager()
