"""
ai_service.py
---------------
Centralized AI Service for InterviewAI.
Fully powered by Gemini API (with Multi-Key Rotation Pool).
Handles resume parsing, domain detection, dynamic question generation,
spoken answer evaluation, and feedback scorecard generation.
"""
import logging
from typing import List, Dict, Any

from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)


class AIService:
    def is_configured(self) -> bool:
        """Check if Gemini API keys are present."""
        return gemini_service.is_configured()

    def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """Analyze candidate resume text using Gemini API multi-key pool."""
        return gemini_service.analyze_resume(resume_text)

    def auto_detect_domain(self, resume_text: str) -> str:
        """Automatically analyze resume to infer domain/role using Gemini API multi-key pool."""
        return gemini_service.auto_detect_domain(resume_text)

    def generate_interview_questions(
        self,
        target_role: str,
        resume_summary: str,
        interview_type: str = "technical",
        experience_level: str = "Fresher",
        num_questions: int = 5,
    ) -> List[Dict[str, Any]]:
        """Generate resume-driven interview questions using Gemini API multi-key pool."""
        return gemini_service.generate_interview_questions(
            target_role=target_role,
            resume_summary=resume_summary,
            interview_type=interview_type,
            num_questions=num_questions,
        )

    def evaluate_answer_and_generate_next(
        self,
        interview_id: int,
        current_question: str,
        user_answer: str,
        history: List[Dict[str, str]],
        target_role: str,
    ) -> Dict[str, Any]:
        """Evaluate spoken answer and generate follow-up using Gemini API multi-key pool."""
        return gemini_service.evaluate_answer_and_generate_next(
            interview_id=interview_id,
            current_question=current_question,
            user_answer=user_answer,
            history=history,
            target_role=target_role,
        )

    def generate_feedback_report(
        self,
        target_role: str,
        transcript: List[Dict[str, str]],
        questions: List[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Generate full interview feedback report & scorecard using Gemini API multi-key pool."""
        return gemini_service.generate_feedback_report(
            target_role=target_role,
            transcript=transcript,
            questions=questions,
        )


ai_service = AIService()
