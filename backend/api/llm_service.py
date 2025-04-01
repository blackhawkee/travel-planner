import os
import json
import google.generativeai as genai
import httpx
from anthropic import Anthropic
from fastapi import HTTPException, Depends
from functools import lru_cache

class LLMService:
    def __init__(self):
        # Initialize Gemini
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
        
        # Initialize Claude
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        
        # Ollama base URL
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        
        # Default Ollama model
        self.default_ollama_model = os.getenv("DEFAULT_OLLAMA_MODEL", "llama2")
    
    async def generate_completion(self, prompt: str, provider: str = "gemini"):
        provider = provider.lower()
        
        if provider == "gemini":
            return await self._generate_with_gemini(prompt)
        elif provider == "claude":
            return await self._generate_with_claude(prompt)
        elif provider == "ollama":
            return await self._generate_with_ollama(prompt)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported LLM provider: {provider}")
    
    async def _generate_with_gemini(self, prompt: str):
        try:
            if not self.gemini_api_key:
                raise ValueError("Gemini API key not configured. Please set the GEMINI_API_KEY environment variable.")
            
            # Use the specified model (gemini-2.0-flash) as shown in your code
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            # Set response parameters to ensure we get a well-formatted response
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 4096,
                }
            )
            
            # Check if the response has an error
            if hasattr(response, 'error'):
                raise ValueError(f"Gemini API error: {response.error}")
                
            # Check if the response has text attribute
            if not hasattr(response, 'text'):
                raise ValueError("Gemini API returned an unexpected response format")
                
            return response.text
        except Exception as e:
            error_msg = f"Gemini API error: {str(e)}"
            raise HTTPException(status_code=500, detail=error_msg)
    
    async def _generate_with_claude(self, prompt: str):
        try:
            if not self.anthropic_api_key:
                raise ValueError("Claude API key not configured. Please set the ANTHROPIC_API_KEY environment variable.")
            
            client = Anthropic(api_key=self.anthropic_api_key)
            message = client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=4000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            if not message.content or len(message.content) == 0:
                raise ValueError("Claude API returned an empty response")
                
            return message.content[0].text
        except Exception as e:
            error_msg = f"Claude API error: {str(e)}"
            raise HTTPException(status_code=500, detail=error_msg)
    
    async def _generate_with_ollama(self, prompt: str, model: str = None):
        try:
            # Use the model passed or fall back to the default
            model_to_use = model or self.default_ollama_model
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.ollama_base_url}/api/generate",
                    json={"model": model_to_use, "prompt": prompt, "stream": False},
                    timeout=60.0
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code, 
                        detail=f"Ollama API error: {response.text}"
                    )
                
                response_data = response.json()
                if "response" not in response_data:
                    raise ValueError("Ollama API returned an unexpected response format")
                    
                return response_data.get("response", "")
        except httpx.TimeoutError:
            raise HTTPException(status_code=504, detail="Ollama API request timed out")
        except Exception as e:
            error_msg = f"Ollama API error: {str(e)}"
            raise HTTPException(status_code=500, detail=error_msg)

@lru_cache()
def get_llm_service():
    return LLMService() 