@echo off
SETLOCAL

:: 1. Check for Go
where go >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Go is not installed. 
    echo 👉 Download it from: https://go.dev/dl/
    pause
    exit /b
)

:: 2. Check for Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed. 
    echo 👉 Download it from: https://www.python.org/downloads/
    pause
    exit /b
)

echo ✅ System dependencies verified.

:: 3. Setup Python Virtual Environment
echo 🐍 Setting up Python environment...
cd extract_parameters
if not exist ".venv" (
    python -m venv .venv
)
call .venv\Scripts\activate
echo 📦 Installing Python dependencies...
pip install --quiet pandas numpy
python extract_parameters.py
call deactivate
cd ..

:: 4. Run Go Estimator
echo 🐹 Running Go SOC Estimator...
cd src
go run main.go
cd ..

echo 🏁 Pipeline execution finished.
pause