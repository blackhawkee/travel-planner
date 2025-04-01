const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiConfig = {
  plannerEndpoint: `${API_URL}/plan`,
  recommendationsEndpoint: `${API_URL}/recommend`,
  llmProviders: [
    { value: 'gemini', label: 'Google Gemini 2.0 Flash (Default)' },
    { value: 'claude', label: 'Anthropic Claude 3 Sonnet' },
    { value: 'ollama', label: 'Ollama (Local LLM)' }
  ]
};

export default apiConfig; 