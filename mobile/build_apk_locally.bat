@echo off
echo ========================================================
echo   Building Standalone Android APK Locally (No Expo Account)
echo ========================================================
cd /d "%~dp0android"
echo Building APK with Gradle...
call gradlew.bat assembleDebug
echo.
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    copy "app\build\outputs\apk\debug\app-debug.apk" "..\InterviewAI.apk" /Y
    echo ========================================================
    echo   BUILD SUCCESSFUL!
    echo   Your app has been saved & renamed to:
    echo   mobile\InterviewAI.apk
    echo ========================================================
) else (
    echo Build failed or output APK not found.
)
pause
