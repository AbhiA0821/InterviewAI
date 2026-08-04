import io
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Extract raw text from PDF file bytes using PyMuPDF (fitz) or pypdf fallback.
    Guarantees robust text extraction even if one library is uninstalled or fails.
    """
    text_chunks = []

    # Strategy 1: Try pypdf (widely supported pure Python PDF parser)
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(pdf_bytes))
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text_chunks.append(t)
        extracted = "\n\n".join(text_chunks).strip()
        if extracted:
            return extracted
    except Exception as e:
        logger.debug(f"pypdf extraction failed or incomplete: {e}")

    # Strategy 2: Try PyMuPDF (fitz)
    try:
        import fitz
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_chunks = []
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text_chunks.append(page_text)
        extracted = "\n\n".join(text_chunks).strip()
        if extracted:
            return extracted
    except Exception as e:
        logger.debug(f"fitz extraction failed: {e}")

    # Strategy 3: Try pdfplumber if available
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            text_chunks = [p.extract_text() for p in pdf.pages if p.extract_text()]
        extracted = "\n\n".join(text_chunks).strip()
        if extracted:
            return extracted
    except Exception as e:
        logger.debug(f"pdfplumber extraction failed: {e}")

    if text_chunks:
        return "\n\n".join(text_chunks).strip()

    raise ValueError("Failed to extract readable text from PDF bytes using available engines.")


