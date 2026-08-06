@echo off
echo ========================================================
echo   Starting InterviewAI FastAPI Backend Server
echo ========================================================
cd /d "%~dp0"
if not exist "venv\Scripts\python.exe" (
    echo Creating Python virtual environment...
    py -m venv venv
    venv\Scripts\python.exe -m pip install --upgrade pip
    venv\Scripts\python.exe -m pip install -r requirements.txt
)
echo Launching Uvicorn Server on http://localhost:8000 ...
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
