#!/bin/bash

# 1. Check for Go
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed."
    echo "👉 Install it using: sudo pacman -S go"
    exit 1
fi

# 2. Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed."
    echo "👉 Install it using: sudo pacman -S python"
    exit 1
fi

echo "✅ System dependencies verified."

# 3. Setup Python Virtual Environment
echo "🐍 Setting up Python environment..."
cd extract_parameters
# Create venv if it doesn't exist
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
echo "📦 Installing Python dependencies..."
pip install --quiet pandas numpy
python3 extract_parameters.py
deactivate
cd ..

# 4. Run Go Estimator
echo "🐹 Running Go SOC Estimator..."
cd src
# Ensure modules are ready
if [ ! -f "go.mod" ]; then
    go mod init battery_modelling/src
fi
go mod tidy
go run main.go
cd ..

echo "🏁 Pipeline execution finished."