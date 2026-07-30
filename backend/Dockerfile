# -----------------------------------------------------------------------
# InterviewAI Backend Dockerfile
# -----------------------------------------------------------------------
FROM python:3.11-slim

WORKDIR /app

# System dependencies required by PyMuPDF and psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


