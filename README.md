# Travel AI Planner

A modern travel planning and recommendation application powered by AI language models, with support for Google Gemini Pro, Anthropic Claude, and Ollama.

## Features

- **Travel Itinerary Planning**: Get detailed day-by-day travel plans for any destination
- **Destination Recommendations**: Discover new places based on your interests and preferences
- **Multiple AI Providers**: Choose between Gemini Pro (default), Claude, or Ollama
- **Modern UI**: Clean, responsive interface built with React and Material UI

## Project Structure

- `backend/`: Python FastAPI backend
- `frontend/`: React frontend
- `scripts/`: Helper scripts for setup and running the application

## Quick Start

### Option 1: Using the provided starter scripts

For Unix/Linux/macOS:
```bash
# Make the script executable (only needed once)
chmod +x start.sh

# Run the application
./start.sh
```

For Windows:
```
start.bat
```

### Option 2: Using npm scripts

If you have Node.js installed:

```bash
# Install dependencies and set up the project
npm run setup

# Start both frontend and backend
npm start

# Or run them separately
npm run start:backend
npm run start:frontend
```

## Manual Setup and Installation

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Create a `.env` file:
   ```
   cp .env.example .env
   ```

6. Edit the `.env` file with your API keys:
   - Get a Gemini API key from [Google AI Studio](https://ai.google.dev/)
   - Get a Claude API key from [Anthropic](https://anthropic.com/)
   - Ollama works locally without keys if you have it installed

7. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. The frontend will be available at http://localhost:3000

## API Documentation

Once the backend is running, you can access the Swagger documentation at http://localhost:8000/docs

## Environment Variables

### Backend (.env file)

- `GEMINI_API_KEY`: Your Google Gemini API key
- `ANTHROPIC_API_KEY`: Your Anthropic Claude API key
- `OLLAMA_BASE_URL`: URL for your Ollama instance (default: http://localhost:11434)

### Frontend

- `REACT_APP_API_URL`: The URL of the backend API (default: http://localhost:8000/api)

## License

This project is open source and available under the MIT License. 