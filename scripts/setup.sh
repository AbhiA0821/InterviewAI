#!/usr/bin/env bash
# -------------------------------------------------------------------
# setup.sh
# ---------
# Convenience script to bootstrap local development:
#   - Creates Python virtual environment for the backend
#   - Installs backend dependencies
#   - Installs frontend dependencies
#   - Copies .env.example files to .env if not already present
#
# Usage: ./scripts/setup.sh
# -------------------------------------------------------------------
set -e

echo "Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
[ -f .env ] || cp .env.example .env
deactivate
cd ..

echo "Setting up frontend..."
cd frontend
npm install
[ -f .env ] || cp .env.example .env
cd ..

echo "Setup complete. See README.md for how to run the app."
