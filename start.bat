@echo off
echo Starting Travel Planner Application...

REM Check if .env file exists for backend
if not exist .\backend\.env (
  echo Creating .env file for backend from example...
  copy .\backend\.env.example .\backend\.env
  echo Created .env file. Please edit it with your API keys before using the application.
)

REM Start backend server
echo Starting backend server...
cd backend

REM Check if virtual environment exists
if not exist .\venv (
  echo Setting up Python virtual environment...
  python -m venv venv
  call .\venv\Scripts\activate
  
  echo Installing backend dependencies...
  pip install -r requirements.txt
) else (
  call .\venv\Scripts\activate
)

REM Start the backend in a new window
echo Starting FastAPI backend server...
start "Travel Planner Backend" cmd /k "uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a bit for backend to initialize
timeout /t 2 /nobreak > nul

REM Go back to root directory
cd ..

REM Start frontend
echo Starting frontend...
cd frontend
if not exist .\node_modules (
  echo Installing frontend dependencies...
  call npm install
)

REM Start the frontend in a new window
echo Starting React frontend...
start "Travel Planner Frontend" cmd /k "npm start"

echo.
echo =================================================
echo Travel Planner Application is running:
echo - Backend server: http://localhost:8000
echo   API documentation: http://localhost:8000/docs
echo - Frontend: http://localhost:3000
echo =================================================
echo.
echo Open the URLs in your browser to access the application.
echo You can close the application by closing both command windows.
echo.

REM Return to root directory
cd .. 