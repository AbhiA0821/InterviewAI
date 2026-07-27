import fitz  # PyMuPDF


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract raw text from PDF file bytes using PyMuPDF."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_chunks = []
        for page in doc:
            page_text = page.get_text()
            if page_text:
                text_chunks.append(page_text)
        return "\n\n".join(text_chunks).strip()
    except Exception as e:
        raise ValueError(f"Failed to parse PDF file: {str(e)}")

