import logging
from typing import Any, Dict, List, Optional
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)


class QuestionGenerator:
    """
    Generates structured, domain and resume-tailored interview questions.
    Ensures question #1 is a welcoming self-introduction, followed by
    resume project deep dives, technical tool questions, and STAR follow-ups.
    """

    def generate_initial_questions(
        self,
        target_role: str,
        resume_summary: Optional[str] = None,
        interview_type: str = "technical",
        num_questions: int = 5,
    ) -> List[Dict[str, Any]]:
        """Generate full set of interview questions via Gemini or structured fallback."""
        summary_text = resume_summary or "General Engineering experience."
        try:
            questions = gemini_service.generate_interview_questions(
                target_role=target_role,
                resume_summary=summary_text,
                interview_type=interview_type,
                num_questions=num_questions,
            )
            if questions and len(questions) >= num_questions:
                return questions
        except Exception as e:
            logger.warning(f"[QuestionGenerator] Gemini generation failed: {e}. Utilizing fallback set.")

        return self.get_fallback_questions(target_role, summary_text, num_questions)

    def get_fallback_questions(
        self, target_role: str, resume_text: str, num_questions: int = 5
    ) -> List[Dict[str, Any]]:
        """Return high-quality structured fallback questions based on resume keywords."""
        extracted_skills = []
        keywords = ["python", "java", "react", "sql", "aws", "docker", "fastapi", "autocad", "matlab", "tensorflow", "pytorch"]
        for kw in keywords:
            if kw in resume_text.lower():
                extracted_skills.append(kw.title())

        tech_stack = ", ".join(extracted_skills[:3]) if extracted_skills else "your core technical stack"

        return [
            {
                "id": 1,
                "type": "hr",
                "question": f"Welcome to your interview for {target_role}! To start off, please tell me about yourself.",
                "difficulty": "Easy",
            },
            {
                "id": 2,
                "type": "technical",
                "question": f"Walk me through the system architecture and your key technical contributions to the main project listed on your resume.",
                "difficulty": "Medium",
            },
            {
                "id": 3,
                "type": "hr",
                "question": "In your most recent work experience or internship, what were your core responsibilities and how did you measure success?",
                "difficulty": "Medium",
            },
            {
                "id": 4,
                "type": "technical",
                "question": f"Your resume highlights experience with {tech_stack}. Can you give a specific example of how you used these tools to solve a complex issue?",
                "difficulty": "Medium",
            },
            {
                "id": 5,
                "type": "analytical",
                "question": "What technical trade-offs or bottlenecks did you encounter during development, and how would you optimize your solution for scale?",
                "difficulty": "Hard",
            },
        ]

    def generate_followup(
        self,
        target_role: str,
        interview_type: str,
        transcript: List[Dict[str, str]],
        next_index: int,
        resume_summary: Optional[str] = None,
    ) -> str:
        """Generate dynamic follow-up probing question based on previous candidate answer."""
        return gemini_service.generate_followup_question(
            target_role=target_role,
            interview_type=interview_type,
            transcript=transcript,
            next_index=next_index,
            resume_summary=resume_summary or "",
        )


question_generator = QuestionGenerator()
