import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file explicitly
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Smart AI Assistant")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "127.0.0.1")
    
    # SQLite Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/smart_assistant.db")
    
    # AI Providers
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
    
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()
    OPENAI_API_BASE: str = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1").strip()
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
    
    # CORS Origins
    _raw_cors = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
    CORS_ORIGINS: List[str] = [origin.strip() for origin in _raw_cors.split(",") if origin.strip()]

    # System instruction for AI assistant
    SYSTEM_INSTRUCTION: str = (
        "You are Smart AI Assistant, a friendly, intelligent, and highly capable AI assistant similar to ChatGPT. "
        "Your capabilities include:\n"
        "1. Answering user questions clearly, concisely, and accurately.\n"
        "2. Explaining complex programming concepts with intuitive real-world analogies.\n"
        "3. Generating clean, modern, well-commented code and explaining how it works step-by-step.\n"
        "4. Seamlessly supporting both English and Tamil (தமிழ்). When addressed in Tamil or asked for Tamil, communicate fluently in natural Tamil.\n"
        "5. Summarizing long text into structured bullet points or executive summaries.\n"
        "6. Formatting all code snippets with standard markdown code blocks (e.g. ```python, ```javascript, ```sql) so they render with syntax highlighting.\n"
        "Always maintain conversational context, be helpful, respectful, and deliver top-tier responses."
    )

    def is_api_key_configured(self) -> bool:
        """Check whether any LLM API key has been configured."""
        return bool(self.GEMINI_API_KEY or self.OPENAI_API_KEY)

    def reload(self):
        """Reload configuration from disk while preserving environment variables."""
        if ENV_PATH.exists():
            load_dotenv(dotenv_path=ENV_PATH, override=True)
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
        self.GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
        self.OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1").strip()
        self.OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

settings = Settings()
