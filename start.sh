#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Travel Planner Application...${NC}"

# Check if .env file exists for backend
if [ ! -f ./backend/.env ]; then
  echo -e "${BLUE}Creating .env file for backend from example...${NC}"
  cp ./backend/.env.example ./backend/.env
  echo -e "${GREEN}Created .env file. Please edit it with your API keys before using the application.${NC}"
fi

# Function to cleanup background processes on exit
cleanup() {
  echo -e "\n${GREEN}Shutting down services...${NC}"
  if [ ! -z "$BACKEND_PID" ]; then
    echo "Stopping backend (PID: $BACKEND_PID)"
    kill $BACKEND_PID
  fi
  if [ ! -z "$FRONTEND_PID" ]; then
    echo "Stopping frontend (PID: $FRONTEND_PID)"
    kill $FRONTEND_PID
  fi
  exit 0
}

# Set up trap to catch Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM

# Start backend server
echo -e "${BLUE}Starting backend server...${NC}"
cd backend
if [ ! -d "./venv" ]; then
  echo -e "${BLUE}Setting up Python virtual environment...${NC}"
  python -m venv venv
  
  # Activate virtual environment
  if [ -f "./venv/Scripts/activate" ]; then
    # Windows
    source ./venv/Scripts/activate
  else
    # Unix/Linux/Mac
    source ./venv/bin/activate
  fi
  
  echo -e "${BLUE}Installing backend dependencies...${NC}"
  pip install -r requirements.txt
else
  # Activate virtual environment
  if [ -f "./venv/Scripts/activate" ]; then
    # Windows
    source ./venv/Scripts/activate
  else
    # Unix/Linux/Mac
    source ./venv/bin/activate
  fi
fi

# Start the backend
echo -e "${GREEN}Starting FastAPI backend server...${NC}"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to initialize
sleep 2

# Start frontend
echo -e "${BLUE}Starting frontend...${NC}"
cd frontend
if [ ! -d "./node_modules" ]; then
  echo -e "${BLUE}Installing frontend dependencies...${NC}"
  npm install
fi

echo -e "${GREEN}Starting React frontend...${NC}"
npm start &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}Travel Planner Application is running:${NC}"
echo -e "${GREEN}- Backend server: http://localhost:8000${NC}"
echo -e "${GREEN}  API documentation: http://localhost:8000/docs${NC}"
echo -e "${GREEN}- Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}==================================================${NC}"
echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"

# Wait for both processes
wait 