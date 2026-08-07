# -----------------------------------------------------------------------
# InterviewAI - Unified Dockerfile for Render Cloud Deployment
# Builds React SPA frontend and Python FastAPI backend into a single container.
# -----------------------------------------------------------------------
#docker
# Stage 1: Build React Production Dist
FROM node:20-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend Runtime
FROM python:3.11-slim
WORKDIR /app

# System dependencies for PyMuPDF & SQLite/PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy Backend source code and Frontend compiled dist
COPY backend/ ./backend
COPY --from=frontend-builder /frontend/dist ./frontend/dist

WORKDIR /app/backend

EXPOSE 8000

# Start Uvicorn server on PORT provided by Render
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
