"""
ai_service.py
---------------
Extensible AI Service Layer supporting Groq API (Primary) and Gemini API (Fallback).
Allows switching AI providers via `.env` configuration.
"""
import os
import json
from typing import List, Dict, Any
import requests

from app.services.gemini_service import gemini_service


class AIService:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.provider = os.getenv("PRIMARY_AI_PROVIDER", "groq").lower()

    def is_groq_available(self) -> bool:
        return bool(self.groq_api_key and self.groq_api_key != "your-groq-api-key")

    def auto_detect_domain(self, resume_text: str) -> str:
        """Automatically analyze candidate resume to infer job domain/role."""
        if not resume_text or len(resume_text.strip()) < 20:
            return "Full Stack Software Engineer"

        prompt = (
            "Analyze the following resume text and return ONLY the target job title/domain "
            "(e.g., 'Software Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Data Analyst', 'MBA Product Manager'). "
            "Return ONLY the concise role string without extra commentary.\n\n"
            f"Resume:\n{resume_text[:2000]}"
        )

        if self.is_groq_available() and self.provider == "groq":
            try:
                headers = {
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": self.groq_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                }
                res = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=8,
                )
                if res.status_code == 200:
                    ans = res.json()["choices"][0]["message"]["content"].strip()
                    if ans:
                        return ans
            except Exception as e:
                print(f"[AIService] Groq domain detection error: {e}")

        # Fallback to Gemini Service
        try:
            return gemini_service.generate_interview_questions(
                target_role="General Domain",
                resume_summary=resume_text,
                num_questions=1,
            )[0].get("question", "Full Stack Software Engineer")
        except Exception:
            return "Full Stack Software Engineer"

    def generate_interview_questions(
        self,
        target_role: str,
        resume_summary: str,
        interview_type: str = "technical",
        num_questions: int = 5,
    ) -> List[Dict[str, Any]]:
        """Generate structured interview questions using Groq API or Gemini API fallback."""
        if self.is_groq_available() and self.provider == "groq":
            try:
                prompt = (
                    f"You are a Senior Technical & HR Interviewer conducting an interview for the role: '{target_role}'.\n"
                    f"Interview Mode: {interview_type.upper()}.\n"
                    f"Candidate Resume Content:\n{resume_summary}\n\n"
                    "CRITICAL INSTRUCTION: Every question MUST be deeply resume-driven! Directly mention specific projects, tools, skills, certifications, metrics, or experiences listed in the candidate's resume content above.\n"
                    f"Generate exactly {num_questions} structured interview questions. "
                    "Return ONLY a valid JSON array of objects with keys: "
                    '["id", "type", "question", "difficulty"]. Example format:\n'
                    '[{"id": 1, "type": "technical", "question": "I see in your resume that you worked on [Project Name] using [Tool/Skill]. How did you...", "difficulty": "medium"}]'
                )

                headers = {
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": self.groq_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.6,
                }
                res = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=10,
                )
                if res.status_code == 200:
                    content = res.json()["choices"][0]["message"]["content"].strip()
                    if content.startswith("```json"):
                        content = content[7:]
                    if content.endswith("```"):
                        content = content[:-3]
                    content = content.strip()
                    parsed = json.loads(content)
                    if isinstance(parsed, list) and len(parsed) > 0:
                        return parsed
            except Exception as e:
                print(f"[AIService] Groq question generation error: {e}. Falling back to Gemini...")

        # Fallback to Gemini Service
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
        """Evaluate candidate answer and generate follow-up question."""
        if self.is_groq_available() and self.provider == "groq":
            try:
                prompt = (
                    f"You are the AI Interviewer for role '{target_role}'.\n"
                    f"Current Question asked: {current_question}\n"
                    f"Candidate Spoken Answer: {user_answer}\n\n"
                    "Evaluate the candidate's answer constructively in 1-2 polite sentences, and then ask the next technical/HR follow-up question. "
                    "Return ONLY the response text to speak aloud to the candidate."
                )

                headers = {
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json",
                }
                payload = {
                    "model": self.groq_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                }
                res = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=10,
                )
                if res.status_code == 200:
                    response_text = res.json()["choices"][0]["message"]["content"].strip()
                    return {"next_question": response_text}
            except Exception as e:
                print(f"[AIService] Groq answer evaluation error: {e}. Falling back to Gemini...")

        # Fallback to Gemini Service
        return gemini_service.evaluate_answer_and_generate_next(
            interview_id=interview_id,
            current_question=current_question,
            user_answer=user_answer,
            history=history,
            target_role=target_role,
        )


ai_service = AIService()
