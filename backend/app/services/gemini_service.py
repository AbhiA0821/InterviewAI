import json
import logging
from typing import Any, Dict, List

from google import genai

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class GeminiService:
    def __init__(self):
        self.model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
        self.api_keys: List[str] = settings.get_all_gemini_api_keys()
        self.current_key_index: int = 0
        self.clients: Dict[str, Any] = {}

        if self.api_keys:
            logger.info(
                f"[GeminiService] Initialized with {len(self.api_keys)} Gemini API key(s) for automatic rotation & rate-limit fallback."
            )
            self._init_clients()
        else:
            logger.warning(
                "[GeminiService] No valid Gemini API keys found. Gemini calls will fall back to local AI generators."
            )

    def is_configured(self) -> bool:
        """Check if at least one valid Gemini API key is present."""
        return len(self.api_keys) > 0

    def reload_keys(self) -> None:
        """Reload API keys dynamically from settings/env."""
        self.api_keys = settings.get_all_gemini_api_keys()
        self.current_key_index = 0
        self._init_clients()

    def _init_clients(self) -> None:
        """Initialize genai.Client instances for all loaded API keys."""
        self.clients = {}
        for key in self.api_keys:
            try:
                self.clients[key] = genai.Client(api_key=key)
            except Exception as e:
                logger.warning(f"[GeminiService] Could not initialize genai.Client for key ending in ...{key[-6:]}: {e}")

    def _generate_content_with_rotation(self, prompt: str) -> str:
        """
        Execute Gemini generate_content call with automatic multi-key rotation.
        If an API key hits rate limits (HTTP 429), quota limits, or errors, it immediately
        rotates to the next available API key in the key pool.
        """
        # Always sync keys in case new ones were added to env
        current_keys = settings.get_all_gemini_api_keys()
        if set(current_keys) != set(self.api_keys):
            self.api_keys = current_keys
            self._init_clients()

        if not self.api_keys:
            logger.warning("[GeminiService] No API keys available for content generation.")
            return ""

        num_keys = len(self.api_keys)
        start_index = self.current_key_index

        for attempt in range(num_keys):
            key_index = (start_index + attempt) % num_keys
            api_key = self.api_keys[key_index]
            key_snippet = f"...{api_key[-6:]}" if len(api_key) > 6 else "key"

            client = self.clients.get(api_key)
            if not client:
                try:
                    client = genai.Client(api_key=api_key)
                    self.clients[api_key] = client
                except Exception as e:
                    logger.warning(f"[GeminiService] Error initializing client for key {key_snippet}: {e}")
                    continue

            try:
                logger.info(
                    f"[GeminiService] Using Gemini API Key [{key_index + 1}/{num_keys}] ({key_snippet}) for generation."
                )
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                )
                if response and hasattr(response, "text") and response.text:
                    # Update current_key_index for round-robin balancing across future requests
                    self.current_key_index = (key_index + 1) % num_keys
                    return response.text.strip()
                else:
                    logger.warning(f"[GeminiService] Key {key_snippet} returned empty response. Trying next key...")
            except Exception as e:
                logger.warning(
                    f"[GeminiService] API key [{key_index + 1}/{num_keys}] ({key_snippet}) failed or hit rate limit ({e}). Auto-rotating to next key..."
                )

        logger.error(f"[GeminiService] All {num_keys} Gemini API keys failed or hit rate limits.")
        return ""

    def generate_interview_questions(
        self,
        target_role: str,
        resume_summary: str,
        interview_type: str = "technical",
        num_questions: int = 5,
    ) -> List[Dict[str, Any]]:
        """Generate questions tailored to target role and interview mode with automatic key rotation."""
        prompt = f"""
You are an expert interviewer conducting a '{interview_type.upper()}' interview for the role of '{target_role}'.
Candidate Resume Content:
{resume_summary}

CRITICAL MANDATORY RULES:
1. QUESTION #1 MUST ALWAYS BE A PERSONAL SELF-INTRODUCTION QUESTION!
   (e.g., "Welcome to your interview for {target_role}! To start off, please introduce yourself, sharing a brief overview of your background, key technical skills, and major projects listed on your resume.")
2. Questions #2 through #{num_questions} MUST cover core domain knowledge, technical concepts, problem-solving, and resume projects relevant to '{target_role}'.

Interview Type Focus for Questions #2-{num_questions}:
- If 'hr': Focus on HR questions, cultural fit, salary expectations, motivation, conflict resolution, work ethics.
- If 'technical': Focus on core engineering domain knowledge, technical concepts, problem solving, system design and specific projects in the resume.
- If 'non_technical': Focus on communication, logical reasoning, aptitude, project management, decision making under ambiguity.

Generate exactly {num_questions} questions.
Return a valid JSON array of objects, where each object has:
- "id": number (1 to {num_questions})
- "type": "hr" | "technical" | "behavioral" | "analytical"
- "question": string (Question #1 MUST be self-introduction, Questions #2-{num_questions} reference candidate resume details)
- "difficulty": "Easy" | "Medium" | "Hard"

Respond ONLY with valid JSON array, no markdown codeblocks or extra text.
"""
        text = self._generate_content_with_rotation(prompt)
        parsed_questions = None
        if text:
            try:
                if text.startswith("```"):
                    text = text.split("\n", 1)[1].rsplit("\n", 1)[0].strip()
                parsed_questions = json.loads(text)
            except Exception as e:
                logger.error(f"Gemini API JSON parsing error: {e}")

        if not parsed_questions or not isinstance(parsed_questions, list) or len(parsed_questions) == 0:
            # Intelligent Fallback questions tailored to interview_type with Question #1 as Self-Introduction
            if interview_type == "hr":
                parsed_questions = [
                    {
                        "id": 1,
                        "type": "hr",
                        "question": f"Welcome to your interview for {target_role}! To start off, please introduce yourself, sharing a brief overview of your background, key technical skills, and experience listed in your resume.",
                        "difficulty": "Easy",
                    },
                    {
                        "id": 2,
                        "type": "hr",
                        "question": "What are your salary expectations and availability to start?",
                        "difficulty": "Easy",
                    },
                    {
                        "id": 3,
                        "type": "hr",
                        "question": "Describe a situation where you had a conflict with a teammate or manager and how you resolved it.",
                        "difficulty": "Medium",
                    },
                    {
                        "id": 4,
                        "type": "hr",
                        "question": "Where do you see yourself professionally in the next 3 to 5 years?",
                        "difficulty": "Medium",
                    },
                    {
                        "id": 5,
                        "type": "hr",
                        "question": "How do you maintain work-life balance and handle stressful project deadlines?",
                        "difficulty": "Medium",
                    },
                ]
            elif interview_type == "non_technical":
                parsed_questions = [
                    {
                        "id": 1,
                        "type": "analytical",
                        "question": f"Welcome to your interview for {target_role}! To start off, please introduce yourself, sharing a brief overview of your background, key skills, and experience listed in your resume.",
                        "difficulty": "Easy",
                    },
                    {
                        "id": 2,
                        "type": "analytical",
                        "question": f"How do you prioritize competing tasks when managing a project in {target_role}?",
                        "difficulty": "Easy",
                    },
                    {
                        "id": 3,
                        "type": "analytical",
                        "question": "Walk me through your decision-making process when dealing with incomplete data.",
                        "difficulty": "Medium",
                    },
                    {
                        "id": 4,
                        "type": "analytical",
                        "question": "How do you communicate complex technical concepts to non-technical stakeholders?",
                        "difficulty": "Medium",
                    },
                    {
                        "id": 5,
                        "type": "analytical",
                        "question": "Describe a project that failed or missed its goals, and what key lessons you learned.",
                        "difficulty": "Hard",
                    },
                ]
            else:
                parsed_questions = [
                    {
                        "id": 1,
                        "type": "technical",
                        "question": f"Welcome to your interview for {target_role}! To start off, please introduce yourself, sharing a brief overview of your background, key technical skills, and experience listed in your resume.",
                        "difficulty": "Easy",
                    },
                    {
                        "id": 2,
                        "type": "technical",
                        "question": f"What are the core fundamentals and methodologies you apply in {target_role}?",
                        "difficulty": "Easy",
                    },
                    {
                        "id": 3,
                        "type": "technical",
                        "question": f"Explain a complex technical problem you solved in {target_role} and the tools you used.",
                        "difficulty": "Medium",
                    },
                    {
                        "id": 4,
                        "type": "technical",
                        "question": "How do you ensure quality control, testing, and safety standards in your engineering projects?",
                        "difficulty": "Medium",
                    },
                    {
                        "id": 5,
                        "type": "technical",
                        "question": "Walk me through how you optimize performance, throughput, or efficiency in your designs.",
                        "difficulty": "Hard",
                    },
                ]

        # Guarantee Question #1 is always a warm self-introduction
        if parsed_questions and len(parsed_questions) > 0:
            first_q_lower = parsed_questions[0].get("question", "").lower()
            if "introduce" not in first_q_lower and "tell me about yourself" not in first_q_lower:
                parsed_questions[0]["question"] = (
                    f"Welcome to your interview for {target_role}! To start off, please introduce yourself, sharing a brief overview of your background, key technical skills, and experience listed in your resume."
                )

        return parsed_questions


    def generate_followup_question(
        self,
        target_role: str,
        interview_type: str,
        transcript: List[Dict[str, str]],
        next_index: int,
    ) -> str:
        """Generate a contextual, adaptive follow-up question using API key rotation."""
        last_answer = ""
        for t in reversed(transcript):
            if t.get("role") == "user":
                last_answer = t.get("text", "")
                break

        prompt = f"""
You are an expert interviewer conducting a '{interview_type.upper()}' interview for '{target_role}'.
Candidate's Previous Answer:
"{last_answer}"

Based directly on what the candidate just said, generate a concise, natural follow-up question (1-2 sentences max).
Acknowledge key points of their response and probe deeper into their technical reasoning, choices, or scenario handling.

Respond ONLY with the follow-up question text.
"""
        text = self._generate_content_with_rotation(prompt)
        if text:
            return text

        # Intelligent Fallback context-aware follow-up
        if last_answer:
            return f"That's insightful. Regarding what you mentioned about your approach, can you elaborate on the key challenges or metrics you encountered while executing that?"
        return "Can you elaborate further on your experience with that?"

    def evaluate_interview(
        self, target_role: str, transcript: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Evaluate full interview transcript and generate scores & feedback using API key rotation."""
        placeholders = {
            "[no answer provided]", "n/a", "pass", "skip", "none", "?", "...",
            "i don't know", "idk"
        }
        valid_user_texts = []
        for t in (transcript or []):
            if t.get("role") == "user":
                raw_text = t.get("text", "").strip()
                clean_text = raw_text.lower().strip(" .,!?")
                if raw_text and clean_text not in placeholders:
                    valid_user_texts.append(raw_text)

        combined_text = " ".join(valid_user_texts).lower()
        word_count = len(combined_text.split())

        if not valid_user_texts or word_count < 5:
            logger.info("[GeminiService] Candidate provided 0/insufficient valid answers. Returning incomplete interview evaluation.")
            return {
                "overall_score": 0.0,
                "communication_score": 0.0,
                "technical_score": 0.0,
                "problem_solving_score": 0.0,
                "confidence_score": 0.0,
                "strengths": [
                    "Session initiated."
                ],
                "areas_for_improvement": [
                    "Attempt all interview questions and provide spoken or written answers to receive a performance evaluation."
                ],
                "detailed_report": {
                    "summary": f"The candidate started the interview session for {target_role} but left without providing valid answers.",
                    "key_takeaway": "Session left incomplete / abandoned.",
                    "recommendation": "Incomplete / Abandoned",
                },
            }

        prompt = f"""
You are a Principal Technical Interviewer evaluating a candidate's actual interview answers for '{target_role}'.
Analyze the following interview transcript in detail:
{json.dumps(transcript, indent=2)}

CRITICAL: If the candidate provided no answers, very brief answers (under 5 words total), or left the session early, assign overall_score = 0.0 and recommendation = "Incomplete / Abandoned".

Evaluate the candidate across 4 core dimensions (0-100 scale):
1. "technical_score": Technical knowledge, accuracy, and engineering depth.
2. "communication_score": Clarity, articulation, and structure of responses.
3. "problem_solving_score": Analytical thinking, non-technical reasoning, trade-offs, and logic.
4. "confidence_score": Composure, assertion, and conviction in answers.

Return ONLY a JSON object formatted as:
{{
  "overall_score": float (0-100),
  "communication_score": float (0-100),
  "technical_score": float (0-100),
  "problem_solving_score": float (0-100),
  "confidence_score": float (0-100),
  "strengths": [
    "Specific candidate strength 1 based on their answers",
    "Specific candidate strength 2",
    "Specific candidate strength 3"
  ],
  "areas_for_improvement": [
    "Specific area to improve 1 based on their answers",
    "Specific area to improve 2",
    "Specific area to improve 3"
  ],
  "detailed_report": {{
    "summary": "Detailed overall candidate performance summary",
    "key_takeaway": "Key evaluation takeaway",
    "recommendation": "Strong Hire" | "Hire" | "Needs Improvement" | "Reject" | "Incomplete / Abandoned"
  }}
}}
Respond ONLY with valid JSON.
"""
        text = self._generate_content_with_rotation(prompt)
        if text:
            try:
                if text.startswith("```"):
                    text = text.split("\n", 1)[1].rsplit("\n", 1)[0].strip()
                parsed = json.loads(text)
                if "overall_score" in parsed and "technical_score" in parsed:
                    return parsed
            except Exception as e:
                logger.error(f"Gemini API evaluation parsing error: {e}")

        # Smart Transcript Text Signal Analyzer (Fallback when Gemini API is unavailable)
        if not valid_user_texts or word_count < 10:
            return {
                "overall_score": 0.0,
                "communication_score": 0.0,
                "technical_score": 0.0,
                "problem_solving_score": 0.0,
                "confidence_score": 0.0,
                "strengths": ["Session attempted with minimal input."],
                "areas_for_improvement": [
                    "Provide detailed, comprehensive answers with technical depth and examples to receive a complete evaluation score."
                ],
                "detailed_report": {
                    "summary": f"The candidate attempted the practice interview for {target_role} but provided insufficient response depth.",
                    "key_takeaway": "Insufficient answers provided for automated technical evaluation.",
                    "recommendation": "Incomplete / Abandoned",
                },
            }

        # 1. Technical Knowledge Signals
        tech_keywords = [
            "python", "java", "sql", "react", "architecture", "system", "database", "api",
            "model", "algorithm", "data", "pipeline", "service", "code", "deploy", "cloud",
            "framework", "testing", "optimization", "security", "git", "class", "function"
        ]
        tech_hits = sum(1 for kw in tech_keywords if kw in combined_text)
        depth_factor = min(1.0, word_count / 80.0)
        tech_score = round(min(95.0, (40.0 + (tech_hits * 5.0)) * depth_factor), 1)

        # 2. Problem Solving & Analytical Signals
        problem_keywords = [
            "because", "therefore", "analyzed", "prioritized", "result", "framework",
            "metrics", "tradeoff", "solved", "resolved", "strategy", "impact", "handled",
            "decision", "approach", "evaluating", "alternative", "issue", "root cause"
        ]
        problem_hits = sum(1 for kw in problem_keywords if kw in combined_text)
        problem_solving_score = round(min(95.0, (42.0 + (problem_hits * 4.5)) * depth_factor), 1)

        # 3. Communication Score
        avg_words_per_ans = word_count / max(len(valid_user_texts), 1)
        comm_base = min(90.0, 45.0 + (avg_words_per_ans * 1.2))
        comm_score = round(min(95.0, comm_base * depth_factor), 1)

        # 4. Confidence Score
        confidence_keywords = [
            "definitely", "experienced", "successfully", "built", "led", "achieved",
            "confident", "mastered", "implemented", "managed", "delivered", "sure"
        ]
        confidence_hits = sum(1 for kw in confidence_keywords if kw in combined_text)
        confidence_score = round(min(95.0, (44.0 + (confidence_hits * 4.5)) * depth_factor), 1)

        # Overall Score
        overall_score = round(
            (tech_score * 0.35) + (problem_solving_score * 0.25) + (comm_score * 0.25) + (confidence_score * 0.15),
            1
        )

        recommendation = (
            "Strong Hire" if overall_score >= 85
            else ("Hire" if overall_score >= 70
            else ("Needs Improvement" if overall_score >= 40 else "Incomplete / Abandoned"))
        )

        return {
            "overall_score": overall_score,
            "communication_score": comm_score,
            "technical_score": tech_score,
            "problem_solving_score": problem_solving_score,
            "confidence_score": confidence_score,
            "strengths": [
                f"Demonstrated baseline engagement for {target_role}.",
                "Provided responses to technical interview questions.",
            ],
            "areas_for_improvement": [
                "Include deeper technical specifics and architectural trade-offs.",
                "Elaborate with specific quantitative results and metrics.",
            ],
            "detailed_report": {
                "summary": f"The candidate completed the practice interview for {target_role}.",
                "key_takeaway": f"Performance score: {overall_score}%.",
                "recommendation": recommendation,
            },
        }

    def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """Analyze resume text and extract domain, skills, projects, education using Gemini multi-key rotation."""
        prompt = (
            "You are an expert HR & Technical Talent Analyzer. Analyze the candidate resume text below.\n\n"
            "Return ONLY a valid JSON object with keys:\n"
            '- "domain": String (e.g., "Software Engineer", "Data Analyst", "Civil Engineer", "Mechanical Engineer")\n'
            '- "experience_level": "Fresher" | "Intermediate" | "Experienced"\n'
            '- "skills": List of extracted technical/domain skills (strings)\n'
            '- "projects": List of project titles/descriptions extracted (strings)\n'
            '- "education": Summary of education\n'
            '- "certifications": List of certifications\n\n'
            f"Resume Text:\n{resume_text[:4000]}\n\n"
            "Respond ONLY with valid JSON, no markdown codeblocks or extra commentary."
        )
        text = self._generate_content_with_rotation(prompt)
        if text:
            try:
                content = text
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                parsed = json.loads(content.strip())
                if isinstance(parsed, dict):
                    return parsed
            except Exception as e:
                logger.warning(f"[GeminiService] Error parsing resume JSON: {e}")

        return {
            "domain": "Software Engineer",
            "experience_level": "Intermediate",
            "skills": ["Software Engineering", "Problem Solving"],
            "projects": ["General Project Experience"],
            "education": "Bachelor's Degree",
            "certifications": [],
        }

    def auto_detect_domain(self, resume_text: str) -> str:
        """Infer target domain/role from candidate resume using Gemini multi-key rotation."""
        analysis = self.analyze_resume(resume_text)
        return analysis.get("domain", "Full Stack Software Engineer")

    def evaluate_answer_and_generate_next(
        self,
        interview_id: int,
        current_question: str,
        user_answer: str,
        history: List[Dict[str, str]],
        target_role: str,
    ) -> Dict[str, Any]:
        """Evaluate candidate answer and generate follow-up using Gemini multi-key rotation."""
        prompt = (
            f"You are the AI Interviewer for role '{target_role}'.\n"
            f"Current Question asked: {current_question}\n"
            f"Candidate Spoken Answer: {user_answer}\n\n"
            "Acknowledge the candidate's answer constructively in 1-2 polite, natural human sentences, and ask a relevant technical/HR follow-up question. "
            "Respond ONLY with the text to speak aloud to the candidate."
        )
        response_text = self._generate_content_with_rotation(prompt)
        if not response_text:
            response_text = f"Thank you for sharing. Building on your answer, could you detail how you handle code reviews and testing in your workflow for {target_role}?"
        return {"next_question": response_text}

    def generate_feedback_report(
        self,
        target_role: str,
        transcript: List[Dict[str, str]],
        questions: List[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Generate comprehensive interview feedback report using Gemini multi-key rotation."""
        return self.evaluate_interview(target_role=target_role, transcript=transcript or [])


gemini_service = GeminiService()
