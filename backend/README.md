# Travel Planner Backend

A Python FastAPI backend that powers the Travel Planner application with LLM integration.

## Features

- Travel planning with detailed itineraries
- Destination recommendations based on user preferences
- Support for multiple LLM providers:
  - Google Gemini Pro (default)
  - Anthropic Claude
  - Ollama (for local LLM deployment)

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file:
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file with your API keys and settings.

## Running the Server

Start the development server:

```
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, visit http://localhost:8000/docs for the interactive API documentation. 