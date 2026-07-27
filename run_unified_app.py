"""
run_unified_app.py
------------------
Single deployment launcher for InterviewAI.
Runs both Frontend & Backend together on http://localhost:8000
"""
import os
import shutil
import subprocess
import sys

# Configure UTF-8 encoding for Windows stdout
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")
    backend_dir = os.path.join(root_dir, "backend")

    print("==================================================")
    print("Starting InterviewAI Single Deployment Launcher")
    print("==================================================")

    # 1. Build Frontend dist
    print("\n[Step 1] Building React Production Bundle...")
    try:
        subprocess.run("npm run build", shell=True, cwd=frontend_dir, check=True)
        print("Frontend build completed successfully!")
    except Exception as e:
        print(f"Warning: Frontend build failed ({e}). Proceeding to launch backend...")

    # Copy avatars folder to dist if missing
    dist_avatars = os.path.join(frontend_dir, "dist", "avatars")
    public_avatars = os.path.join(frontend_dir, "public", "avatars")
    if os.path.exists(public_avatars) and not os.path.exists(dist_avatars):
        try:
            shutil.copytree(public_avatars, dist_avatars)
            print("Copied avatar assets to production build folder.")
        except Exception:
            pass

    # 2. Start Uvicorn Server serving both API & Frontend on Port 8000
    print("\n[Step 2] Launching Unified Web Application Server on http://localhost:8000 ...")
    print("Press Ctrl+C to stop.\n")

    python_executable = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
    if not os.path.exists(python_executable):
        python_executable = sys.executable

    cmd = [
        python_executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
        "--reload",
    ]

    subprocess.run(cmd, cwd=backend_dir)


if __name__ == "__main__":
    main()
