@echo off
REM run.bat - Automated pipeline for Battery SOC Estimator (Windows)

echo 🔋 Phase 1: Starting Digital Twin Extraction...
cd extract_parameters

REM Smart check for Windows Python virtual environment
if exist ".venv\Scripts\activate.bat" (
    echo -^> Activating .venv...
    call .venv\Scripts\activate.bat
)

python extract_parameters.py
if %errorlevel% neq 0 (
    echo ❌ Error: Python extraction failed. Halting pipeline.
    exit /b %errorlevel%
)

echo.
echo ✅ Extraction complete. Passing ECM payload to Go...
cd ..\src

echo ⚡ Phase 2: Running Real-Time BMS Simulation...
go run main.go
if %errorlevel% neq 0 (
    echo ❌ Error: Go simulation failed.
    exit /b %errorlevel%
)

echo.
echo 🎉 Pipeline finished successfully!
pause