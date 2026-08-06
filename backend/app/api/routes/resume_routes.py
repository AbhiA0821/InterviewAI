from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.resume import Resume
from app.resume_parser.pdf_parser import extract_text_from_pdf_bytes
from app.resume_parser.resume_structurer import structure_resume_text

router = APIRouter()


@router.post("/upload")
@router.post("/parse")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload PDF resume, extract text, structure parsed data, and store in DB."""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="File is empty.")

    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit
    if len(pdf_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 10MB.")

    try:
        raw_text = extract_text_from_pdf_bytes(pdf_bytes)
        parsed_json = structure_resume_text(raw_text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process resume: {str(e)}")

    db_resume = Resume(
        original_filename=file.filename,
        raw_text=raw_text,
        parsed_json=parsed_json,
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    return {
        "id": db_resume.id,
        "original_filename": db_resume.original_filename,
        "parsed_json": db_resume.parsed_json,
        "uploaded_at": db_resume.uploaded_at.isoformat(),
    }


@router.get("/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    """Get resume by ID."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {
        "id": resume.id,
        "original_filename": resume.original_filename,
        "raw_text": resume.raw_text,
        "parsed_json": resume.parsed_json,
        "uploaded_at": resume.uploaded_at.isoformat(),
    }

