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
            try:
                models_to_try = [self.model_name, "gemini-2.0-flash", "gemini-1.5-flash"]
                unique_models = []
                for m in models_to_try:
                    if m and m not in unique_models:
                        unique_models.append(m)

                for target_model in unique_models:
                    try:
                        logger.info(
                            f"[GeminiService] Using Gemini API Key [{key_index + 1}/{num_keys}] ({key_snippet}) with model '{target_model}'."
                        )
                        response = client.models.generate_content(
                            model=target_model,
                            contents=prompt,
                        )
                        if response and hasattr(response, "text") and response.text:
                            self.current_key_index = (key_index + 1) % num_keys
                            return response.text.strip()
                    except Exception as model_err:
                        logger.warning(f"[GeminiService] Key {key_snippet} with model '{target_model}' error: {model_err}")
                        continue
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
        """Generate professional interview questions based on industry standards (STAR & Technical Deep Dive) for all departments."""
        prompt = f"""
You are a Lead Principal Interviewer conducting a professional '{interview_type.upper()}' interview for a candidate applying for the target domain/role: '{target_role}'.

CANDIDATE RESUME FULL TEXT:
{resume_summary}

STRICT DOMAIN & RESUME ALIGNMENT RULES FOR MAXIMUM INTERVIEW ACCURACY:
- ALL questions MUST be strictly relevant to the target domain/role: '{target_role}' AND the candidate's uploaded resume content.
- ZERO HALLUCINATED TECH STACKS: Do NOT ask questions outside the candidate's verified resume skills, internships, and target domain context.
- ACCURACY WEIGHTING: Prioritize candidate's primary skills, frameworks, and project deliverables with highest technical weight.

PROFESSIONAL INDUSTRY INTERVIEW FRAMEWORK & STRICT RULES:

1. QUESTION #1 MUST BE ONLY THE SIMPLE DEFAULT SELF-INTRODUCTION:
   "Welcome to your interview for {target_role}! To start off, please tell me about yourself."
   (DO NOT list skills, internships, or projects inside Question #1!).

2. QUESTIONS #2 THROUGH #{num_questions} MUST BE STRICTLY ONE RESUME TOPIC PER QUESTION (TAILORED TO '{target_role}' DOMAIN):

   IF ROUND IS 'TECHNICAL' (Core Technical Deep-Dive Framework):
   - Question #2 (Architecture & Domain Project): Focus on Project #1 from resume relevant to '{target_role}'. Ask about project architecture and why specific domain technologies/tools were selected.
   - Question #3 (Domain Work Experience & Internship): Focus on Internship #1 or Work Experience from resume. Ask about core domain responsibilities and deliverables.
   - Question #4 (Domain Skill & Tooling Hands-on): Focus on ONE specific technical skill/tool listed on resume (e.g., Python, React, SQL, AutoCAD, MATLAB, SolidWorks, PyTorch) relevant to '{target_role}'. Ask how they applied it.
   - Question #5 (Engineering Trade-offs & Bottlenecks): Focus on Project #2 or domain performance optimization, scalability, safety, or error handling.

   IF ROUND IS 'HR' or 'BEHAVIORAL' (STAR Method Framework: Situation, Task, Action, Result):
   - Question #2 (Role Motivation): Ask what motivated them to pursue '{target_role}' and choose the specific domain projects on their resume.
   - Question #3 (Teamwork & Conflict): Ask for a STAR scenario from their resume project/internship where they handled a technical disagreement or team conflict.
   - Question #4 (Deadline & Pressure Handling): Ask for a STAR scenario from their resume work where they managed tight deadlines or unexpected scope changes.
   - Question #5 (Career Growth): Ask how their resume achievements position them to grow in '{target_role}' over the next 3-5 years.

   IF ROUND IS 'NON_TECHNICAL' or 'ANALYTICAL' (Product & Decision-Making Framework):
   - Question #2 (Problem Framing): Ask how they defined goals and requirements for their primary '{target_role}' resume project.
   - Question #3 (Data-Driven Decision Making): Ask for a scenario from their resume where they made trade-offs under uncertainty backed by data.
   - Question #4 (Stakeholder Communication): Ask how they communicated domain milestones to stakeholders during their internship/projects.
   - Question #5 (Failure Analysis & Recovery): Ask about a project feature or experiment from their resume that underperformed and how they fixed it.

DO NOT bundle multiple topics into one question. Ask about ONE resume topic at a time!
Every question from #2 onward MUST cite specific items from the candidate's resume text and align with '{target_role}'.

Generate exactly {num_questions} questions.
Return a valid JSON array of objects, where each object has:
- "id": number (1 to {num_questions})
- "type": "hr" | "technical" | "behavioral" | "analytical"
- "question": string (Question #1 MUST be "Welcome to your interview for {target_role}! To start off, please tell me about yourself.", Questions #2-{num_questions} MUST focus on ONE specific resume project, internship, or skill item one-by-one)
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
            skills_in_resume = []
            for kw in ["python", "react", "node.js", "sql", "machine learning", "fastapi", "django", "java", "c++", "aws", "docker", "pytorch", "tensorflow"]:
                if kw in resume_summary.lower():
                    skills_in_resume.append(kw.title())

            tech_context = ", ".join(skills_in_resume[:2]) if skills_in_resume else "your primary technical stack"

            parsed_questions = [
                {
                    "id": 1,
                    "type": "hr",
                    "question": f"Welcome to your interview for {target_role}! To start off, please tell me about yourself.",
                    "difficulty": "Easy",
                },
                {
                    "id": 2,
                    "type": "technical",
                    "question": f"Walk me through the technical architecture and your key individual contributions to the primary project listed on your resume.",
                    "difficulty": "Medium",
                },
                {
                    "id": 3,
                    "type": "hr",
                    "question": "Regarding the major internship or work experience listed on your resume, what were your core engineering responsibilities and key achievements?",
                    "difficulty": "Medium",
                },
                {
                    "id": 4,
                    "type": "technical",
                    "question": f"In your resume, you highlighted hands-on experience with {tech_context}. How did you apply those specific tools to solve problems in your projects?",
                    "difficulty": "Medium",
                },
                {
                    "id": 5,
                    "type": "analytical",
                    "question": "What was the single most difficult technical challenge or bug you encountered in your resume project, and how did you diagnose and fix it?",
                    "difficulty": "Hard",
                },
            ]

        # Enforce Question #1 is strictly the simple self-introduction question
        if parsed_questions and len(parsed_questions) > 0:
            parsed_questions[0]["question"] = (
                f"Welcome to your interview for {target_role}! To start off, please tell me about yourself."
            )

        return parsed_questions


    def generate_followup_question(
        self,
        target_role: str,
        interview_type: str,
        transcript: List[Dict[str, str]],
        next_index: int,
        resume_summary: str = "",
    ) -> str:
        """Generate a professional STAR / Technical Deep-Dive follow-up question strictly based on candidate resume & previous answer."""
        last_answer = ""
        recent_history = []
        for t in (transcript or []):
            role = t.get("role")
            text = t.get("text", "").strip()
            if role == "user":
                last_answer = text
                recent_history.append(f"Candidate: {text}")
            elif role == "interviewer":
                recent_history.append(f"Interviewer: {text}")

    def analyze_resume_vs_jd(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Analyze candidate resume skills vs Job Description requirements."""
        prompt = f"""
Compare this candidate's resume with the target job description.

RESUME TEXT:
{resume_text[:2500]}

JOB DESCRIPTION:
{job_description[:2500]}

Identify:
1. matching_skills: List of technical & domain skills present in both resume and job description.
2. missing_skills: Important skills required by job description that are NOT on candidate's resume.
3. core_technologies: Primary tools/frameworks required for the job.
4. key_projects: Candidate projects relevant to job requirements.

Return ONLY a JSON object:
{{
    "matching_skills": ["Python", "PySpark", "SQL"],
    "missing_skills": ["Kubernetes"],
    "core_technologies": ["Spark", "Airflow"],
    "key_projects": ["MedIntel"]
}}
"""
        text = self._generate_content_with_rotation(prompt)
        if text:
            try:
                clean = text.strip()
                if clean.startswith("```"):
                    clean = clean.split("\n", 1)[1].rsplit("\n", 1)[0].strip()
                return json.loads(clean)
            except Exception:
                pass
        return {
            "matching_skills": ["Technical Architecture"],
            "missing_skills": [],
            "core_technologies": [],
            "key_projects": [],
        }

        prompt = f"""
You are an expert Lead Technical Interviewer conducting a '{interview_type.upper()}' interview for the target role: '{target_role}'.
{resume_section}
RECENT INTERVIEW DIALOGUE:
{history_str}

LATEST CANDIDATE ANSWER:
"{last_answer}"

INSTRUCTIONS FOR NEXT QUESTION GENERATION:
1. Deeply analyze the candidate's answer and their resume projects, frameworks, databases, and skills.
2. If the candidate mentioned a specific tool, database, model, or architecture (e.g. PySpark, DuckDB, Airflow, React, FastAPI, PyTorch, Docker, SQL, LLM), ask a sharp follow-up probing WHY they chose it vs alternatives, how they configured it, or what specific data transformations/preprocessing they performed.
3. If they gave a high-level answer, ask for concrete implementation metrics, scaling approach, or a specific technical challenge they solved.
4. Keep the question natural, conversational, human, and concise (1-2 sentences max).
5. DO NOT repeat any previous question from the dialogue history!

Respond ONLY with the next follow-up question text.
"""
        text = self._generate_content_with_rotation(prompt)
        if text and len(text.strip()) > 10:
            return text.strip()

    def evaluate_turn_and_generate_next(
        self,
        target_role: str,
        interview_type: str,
        resume_summary: str,
        current_question: str,
        candidate_answer: str,
        transcript_history: List[Dict[str, Any]],
        question_number: int = 1,
    ) -> Dict[str, Any]:
        """
        Evaluate candidate's latest answer, perform internal scoring, and generate the next dynamic follow-up or new question.
        Returns: {
            "relevance": int (1-10),
            "technical_accuracy": int (1-10),
            "depth": int (1-10),
            "clarity": int (1-10),
            "needs_followup": bool,
            "followup_reason": str,
            "next_question": str
        }
        """
        from app.utils.logger import app_logger

        app_logger.info(f"[STT FINAL TRANSCRIPT] candidate answer: '{candidate_answer}'")
        app_logger.info(f"[ANSWER SENT TO BACKEND] current question: '{current_question}'")

        if not candidate_answer or not candidate_answer.strip():
            return {
                "error": "No answer detected. Please try again.",
                "needs_followup": True,
                "next_question": current_question,
            }

        history_dialogue = []
        for t in (transcript_history or []):
            role = t.get("role", "")
            text = t.get("text", "").strip()
            if role == "user":
                history_dialogue.append(f"Candidate: {text}")
            elif role == "interviewer":
                history_dialogue.append(f"Interviewer: {text}")

        history_str = "\n".join(history_dialogue[-8:]) if history_dialogue else "None"
        resume_str = resume_summary[:2500] if resume_summary else "General experience"

        prompt = f"""
You are a Senior Technical Interviewer conducting a live '{interview_type.upper()}' job interview for the role '{target_role}'.

CANDIDATE RESUME SUMMARY:
{resume_str}

CONVERSATION HISTORY:
{history_str}

CURRENT QUESTION ASKED:
"{current_question}"

CANDIDATE'S SPOKEN ANSWER:
"{candidate_answer}"

INSTRUCTIONS FOR CONVERSATIONAL EVALUATION & NEXT QUESTION GENERATION:
1. EVALUATION RUBRIC:
   - Separate technical correctness & domain understanding from speech/grammar accents.
   - For behavioral questions, evaluate STAR elements (Situation, Task, Action, Result) naturally.
   - Assign turn score (0-100), identify what was good, what was missing, how to improve, and generate a concise example better answer.
2. CLAIM VERIFICATION & FOLLOW-UP CONTROL:
   - If candidate makes an ambitious technical claim (e.g., "processed large data"), probe scale/metrics (e.g. data volume, TPS).
   - Maximum 2 follow-ups on the same topic. If already probed twice, transition smoothly to another resume project, internship, or technical skill.
3. CONVERSATIONAL HUMANKIND NATURE:
   - Keep next question natural, human, and concise (1-2 sentences max).
   - DO NOT repeat questions.

Return ONLY a valid JSON object:
{{
    "score": 82.0,
    "relevance": 8,
    "technical_accuracy": 8,
    "depth": 7,
    "clarity": 9,
    "what_was_good": "Clearly explained PySpark usage for vital-sign data pipeline.",
    "what_was_missing": "Did not specify exact PySpark transformations or window functions used.",
    "how_to_improve": "Mention specific PySpark functions like selectExpr, withColumn, and na.fill.",
    "example_better_answer": "I used PySpark to ingest patient vital signs, applied withColumn for timestamp normalization, and handled missing values using median imputation before writing to DuckDB.",
    "needs_followup": true,
    "followup_reason": "Probe specific PySpark transformations used during data preprocessing.",
    "next_question": "Which specific PySpark transformations did you perform on the patient vital-sign data?"
}}
"""
        app_logger.info(f"[LLM INPUT] question: '{current_question}' | answer: '{candidate_answer}'")
        text = self._generate_content_with_rotation(prompt)

        parsed = None
        if text:
            try:
                clean_json = text.strip()
                if clean_json.startswith("```"):
                    clean_json = clean_json.split("\n", 1)[1].rsplit("\n", 1)[0].strip()
                parsed = json.loads(clean_json)
            except Exception as parse_err:
                app_logger.warning(f"[GeminiService] JSON parse warning for turn eval: {parse_err}")

        if not parsed or not isinstance(parsed, dict) or "next_question" not in parsed:
            # Fallback follow-up generation
            next_q = self.generate_followup_question(
                target_role=target_role,
                interview_type=interview_type,
                transcript=transcript_history,
                next_index=question_number,
                resume_summary=resume_summary,
            )
            parsed = {
                "score": 78.0,
                "relevance": 8,
                "technical_accuracy": 7,
                "depth": 7,
                "clarity": 8,
                "what_was_good": "Demonstrated active technical engagement.",
                "what_was_missing": "Elaborate with specific quantitative results.",
                "how_to_improve": "Structure response using STAR methodology.",
                "example_better_answer": "In my project, I implemented data validation pipelines that improved accuracy by 25%.",
                "needs_followup": True,
                "followup_reason": "Exploring project technical details.",
                "next_question": next_q,
            }

        app_logger.info(f"[LLM DECISION] needs_followup={parsed.get('needs_followup')} | reason='{parsed.get('followup_reason')}'")
        app_logger.info(f"[NEXT QUESTION] '{parsed.get('next_question')}'")

        return parsed

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
You are a Principal Technical & HR Interviewer evaluating a candidate's actual interview answers for '{target_role}'.
Analyze the following interview transcript in detail:
{json.dumps(transcript, indent=2)}

CRITICAL: If the candidate provided no answers, very brief answers (under 5 words total), or left the session early, assign overall_score = 0.0 and recommendation = "Incomplete / Abandoned".

Evaluate the candidate across 14 core dimensions with strict technical rubrics (0-100 scale):
- 90-100: Exceptional depth, precise domain terms, STAR structure, quantitative metrics, zero incorrect statements.
- 75-89: Solid understanding, good technical terms, minor omissions in trade-off analysis.
- 50-74: Surface-level answer, missing technical depth or STAR methodology.
- Below 50: Vague, incorrect technical concepts, or unarticulated responses.

1. "technical_score": Technical accuracy, algorithm/architecture correctness, and domain depth.
2. "communication_score": Clarity, articulation, structured delivery, andSTAR method execution.
3. "project_understanding_score": Deep understanding of architecture, design trade-offs, and scaling bottlenecks.
4. "resume_knowledge_score": Authenticity, confidence, and detail regarding resume claims.
5. "problem_solving_score": Analytical thinking, trade-offs, and logic.
6. "confidence_score": Composure, assertion, and conviction in answers.
7. "analytical_thinking_score": Data-driven reasoning and structured analysis.
8. "leadership_score": Initiative, ownership, and influence.
9. "teamwork_score": Collaboration, empathy, and conflict resolution.
10. "behavioural_score": STAR framework adherence and situational judgment.
11. "time_management_score": Conciseness and efficiency of explanation.
12. "professionalism_score": Tone, etiquette, and executive presence.
13. "vocabulary_score": Domain-specific terminology and technical language.
14. "clarity_score": Directness, focus, and precision.

Return ONLY a JSON object formatted as:
{{
  "overall_score": float (0-100),
  "communication_score": float (0-100),
  "technical_score": float (0-100),
  "project_understanding_score": float (0-100),
  "resume_knowledge_score": float (0-100),
  "problem_solving_score": float (0-100),
  "confidence_score": float (0-100),
  "analytical_thinking_score": float (0-100),
  "leadership_score": float (0-100),
  "teamwork_score": float (0-100),
  "behavioural_score": float (0-100),
  "time_management_score": float (0-100),
  "professionalism_score": float (0-100),
  "vocabulary_score": float (0-100),
  "clarity_score": float (0-100),
  "readiness": {{
    "resume_strength": float (0-100),
    "technical_readiness": float (0-100),
    "hr_readiness": float (0-100),
    "communication_readiness": float (0-100),
    "overall_readiness": float (0-100)
  }},
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
  "resume_suggestions": [
    "Actionable suggestion 1 to improve resume impact for target role",
    "Actionable suggestion 2 to add metrics and project deliverables",
    "Actionable suggestion 3"
  ],
  "learning_roadmap": [
    "Topic 1 to revise before your real interview",
    "Technology/framework to practice",
    "Soft skill or communication improvement tip"
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
            "project_understanding_score": round(tech_score * 0.95, 1),
            "resume_knowledge_score": round(comm_score * 0.9, 1),
            "problem_solving_score": problem_solving_score,
            "confidence_score": confidence_score,
            "analytical_thinking_score": problem_solving_score,
            "leadership_score": round(confidence_score * 0.85, 1),
            "teamwork_score": round(comm_score * 0.95, 1),
            "behavioural_score": round(comm_score * 0.9, 1),
            "time_management_score": 80.0,
            "professionalism_score": 85.0,
            "vocabulary_score": round(tech_score * 0.9, 1),
            "clarity_score": comm_score,
            "readiness": {
                "resume_strength": round(tech_score * 0.9, 1),
                "technical_readiness": tech_score,
                "hr_readiness": comm_score,
                "communication_readiness": comm_score,
                "overall_readiness": overall_score,
            },
            "strengths": [
                f"Demonstrated baseline technical engagement for {target_role}.",
                "Clear communication and response structure.",
                "Active participation across interview questions."
            ],
            "areas_for_improvement": [
                "Include deeper technical specifics and architectural trade-offs.",
                "Elaborate with specific quantitative results and metrics."
            ],
            "resume_suggestions": [
                "Quantify achievements in resume project descriptions with percentage gains.",
                "Highlight key tools and frameworks in bullet points for quick scanning."
            ],
            "learning_roadmap": [
                f"Review core system design principles relevant to {target_role}.",
                "Practice STAR method structure for behavioral scenario questions."
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
