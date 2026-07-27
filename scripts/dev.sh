#!/usr/bin/env bash
# -------------------------------------------------------------------
# dev.sh
# -------
# Runs backend (uvicorn) and frontend (vite) dev servers concurrently
# for local development (outside of Docker).
#
# Usage: ./scripts/dev.sh
# -------------------------------------------------------------------
set -e

(cd backend && source venv/bin/activate && uvicorn app.main:app --reload) &
BACKEND_PID=$!

(cd frontend && npm run dev) &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
