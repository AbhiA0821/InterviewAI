import re
from typing import Any, Dict


def structure_resume_text(raw_text: str) -> Dict[str, Any]:
    """Parse raw resume text into structured components."""
    # Email extraction
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", raw_text)
    email = email_match.group(0) if email_match else ""

    # Phone extraction
    phone_match = re.search(r"\(?\+?\d{1,3}\)?[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}", raw_text)
    phone = phone_match.group(0) if phone_match else ""

    # Common technical skills dictionary scan
    known_skills = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI",
        "Express", "SQL", "PostgreSQL", "SQLite", "MongoDB", "Docker", "Kubernetes",
        "AWS", "GCP", "Azure", "Git", "REST API", "GraphQL", "Tailwind", "CSS",
        "HTML", "PyTorch", "TensorFlow", "Pandas", "NumPy", "Scikit-Learn",
        "C++", "Java", "Go", "Rust", "Swift", "Kotlin", "Spring Boot", "Redux",
        "Next.js", "Vue", "Angular", "CI/CD", "Linux", "System Design"
    ]
    
    extracted_skills = [
        skill for skill in known_skills
        if re.search(rf"\b{re.escape(skill)}\b", raw_text, re.IGNORECASE)
    ]

    # Name estimation (first non-empty line usually)
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    candidate_name = lines[0] if lines else "Candidate"

    return {
        "candidate_name": candidate_name,
        "email": email,
        "phone": phone,
        "skills": extracted_skills,
        "summary": raw_text[:300] + ("..." if len(raw_text) > 300 else ""),
        "raw_character_count": len(raw_text),
    }

