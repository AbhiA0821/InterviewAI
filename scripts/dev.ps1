# -------------------------------------------------------------------
# dev.ps1
# -------
# Runs backend (uvicorn) and frontend (vite) dev servers for local development on Windows.
#
# Usage: .\scripts\dev.ps1
# -------------------------------------------------------------------

$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\..\backend'; .\venv\Scripts\uvicorn app.main:app --reload --port 8000" -PassThru
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\..\frontend'; npm run dev" -PassThru

Write-Host "Started Backend (PID $($backend.Id)) on http://localhost:8000" -ForegroundColor Green
Write-Host "Started Frontend (PID $($frontend.Id)) on http://localhost:5173" -ForegroundColor Green
