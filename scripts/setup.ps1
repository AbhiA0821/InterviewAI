# -------------------------------------------------------------------
# setup.ps1
# ---------
# Convenience script to bootstrap local development on Windows:
#   - Creates Python virtual environment for the backend
#   - Installs backend dependencies
#   - Installs frontend dependencies
#   - Copies .env.example files to .env if not already present
#
# Usage: .\scripts\setup.ps1
# -------------------------------------------------------------------

$ErrorActionPreference = "Stop"

Write-Host "Setting up backend..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\..\backend"

if (-not (Test-Path "venv")) {
    python -m venv venv
}

.\venv\Scripts\pip install -r requirements.txt
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

Write-Host "Setting up frontend..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\..\frontend"
npm install
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

Set-Location -Path "$PSScriptRoot\.."
Write-Host "Setup complete! See README.md for configuration details." -ForegroundColor Green
