#!/bin/bash

# Navigate to the backend directory
cd backend

# Activate the virtual environment
source venv/bin/activate

# Run the application
uvicorn main:app --host 127.0.0.1 --port 8000 --log-level info
