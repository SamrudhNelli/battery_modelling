#!/bin/bash
# run.sh - Automated pipeline for Battery SOC Estimator

echo "🔋 Phase 1: Starting Digital Twin Extraction..."
cd extract_parameters || { echo "Directory not found"; exit 1; }

# Smart check for your local Python virtual environment
if [ -d ".venv" ]; then
    echo "-> Activating .venv..."
    source .venv/bin/activate
fi

python extract_parameters.py
if [ $? -ne 0 ]; then
    echo "❌ Error: Python extraction failed. Halting pipeline."
    exit 1
fi

echo -e "\n✅ Extraction complete. Passing ECM payload to Go..."
cd ../src || { echo "Directory not found"; exit 1; }

echo "⚡ Phase 2: Running Real-Time BMS Simulation..."
go run main.go
if [ $? -ne 0 ]; then
    echo "❌ Error: Go simulation failed."
    exit 1
fi

echo -e "\n🎉 Pipeline finished successfully!"