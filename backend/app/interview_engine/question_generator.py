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
        """Return high-quality structured fallback questions based on resume keywords & project titles."""
        extracted_skills = []
        keywords = ["python", "pyspark", "duckdb", "airflow", "sql", "react", "fastapi", "docker", "aws", "pytorch", "tensorflow", "autocad", "matlab"]
        for kw in keywords:
            if kw in (resume_text or "").lower():
                extracted_skills.append(kw.title())

        tech_stack = ", ".join(extracted_skills[:3]) if extracted_skills else "your core technical stack"

        # Dynamically extract project title lines from candidate resume text
        project_title = "your primary project"
        for line in (resume_text or "").splitlines():
            line_clean = line.strip()
            if any(k in line_clean.lower() for k in ["project", "pipeline", "system", "app", "model", "platform", "intel", "bot"]) and len(line_clean) < 60:
                project_title = line_clean.strip("-|•# ")
                break

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
                "question": f"Walk me through your '{project_title}' project listed on your resume, what problem it solves, and why you selected your primary tech stack.",
                "difficulty": "Medium",
            },
            {
                "id": 3,
                "type": "technical",
                "question": f"In '{project_title}', what specific architectural trade-offs or data preprocessing steps did you perform using {tech_stack}?",
                "difficulty": "Medium",
            },
            {
                "id": 4,
                "type": "technical",
                "question": f"Regarding your major internship or work experience listed on your resume, what were your core engineering deliverables and key achievements?",
                "difficulty": "Medium",
            },
            {
                "id": 5,
                "type": "analytical",
                "question": f"What was the most difficult technical bottleneck or error you encountered in your projects, and how would you scale your solution for high production load in {target_role}?",
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
