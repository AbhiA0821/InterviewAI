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

    # Comprehensive multi-domain engineering technical skills dictionary scan
    known_skills = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI",
        "Express", "SQL", "PostgreSQL", "SQLite", "MongoDB", "Docker", "Kubernetes",
        "AWS", "GCP", "Azure", "Git", "REST API", "GraphQL", "Tailwind", "CSS",
        "HTML", "PyTorch", "TensorFlow", "Pandas", "NumPy", "Scikit-Learn",
        "C++", "Java", "Go", "Rust", "Swift", "Kotlin", "Spring Boot", "Redux",
        "Next.js", "Vue", "Angular", "CI/CD", "Linux", "System Design",
        "AutoCAD", "MATLAB", "SolidWorks", "ANSYS", "Verilog", "VHDL",
        "Embedded C", "Microcontrollers", "PLC", "SCADA", "Revit", "ETABS",
        "STAAD Pro", "Process Safety", "Thermodynamics", "Data Warehousing",
        "Power BI", "Tableau", "Spark", "Hadoop", "Penetration Testing"
    ]
    
    extracted_skills = [
        skill for skill in known_skills
        if re.search(rf"\b{re.escape(skill)}\b", raw_text, re.IGNORECASE)
    ]

    # Name estimation (first non-empty line usually)
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    candidate_name = lines[0] if lines else "Candidate"

    # Use Gemini API multi-key pool for deep resume intelligence
    try:
        from app.services.gemini_service import gemini_service
        ai_analysis = gemini_service.analyze_resume(raw_text)
    except Exception:
        ai_analysis = {}

    merged_skills = list(set(extracted_skills + (ai_analysis.get("skills") or [])))

    # Categorize extracted skills
    languages = [s for s in merged_skills if s in ["Python", "JavaScript", "TypeScript", "C++", "Java", "Go", "Rust", "Swift", "Kotlin", "Embedded C", "SQL"]]
    frameworks = [s for s in merged_skills if s in ["React", "Node.js", "FastAPI", "Express", "Spring Boot", "Next.js", "Vue", "Angular", "Tailwind", "Django", "PyTorch", "TensorFlow"]]
    tools = [s for s in merged_skills if s in ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "Git", "AutoCAD", "MATLAB", "SolidWorks", "ANSYS", "Revit", "Power BI", "Tableau"]]

    # Experience level heuristic fallback
    exp_level = ai_analysis.get("experience_level")
    if not exp_level:
        text_lower = raw_text.lower()
        if any(w in text_lower for w in ["lead", "principal", "senior", "5+ years", "architect", "manager"]):
            exp_level = "Experienced"
        elif any(w in text_lower for w in ["intern", "fresher", "graduate", "junior", "student"]):
            exp_level = "Fresher"
        else:
            exp_level = "Intermediate"

    return {
        "candidate_name": candidate_name,
        "email": email,
        "phone": phone,
        "skills": merged_skills if merged_skills else ["General Technical Skills"],
        "skill_categories": {
            "languages": languages,
            "frameworks": frameworks,
            "tools_and_cloud": tools,
        },
        "domain": ai_analysis.get("domain", "Software Engineer"),
        "job_title": ai_analysis.get("domain", "Software Engineer"),
        "experience_level": exp_level,
        "projects": ai_analysis.get("projects") or ["Hands-on Engineering Projects"],
        "education": ai_analysis.get("education") or "Engineering Degree",
        "certifications": ai_analysis.get("certifications") or [],
        "summary": raw_text[:300] + ("..." if len(raw_text) > 300 else ""),
        "raw_character_count": len(raw_text),
    }

