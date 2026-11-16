import logging
import time
from typing import List, Dict, Optional
import httpx
from fastapi import HTTPException
from app.config import settings

logger = logging.getLogger("ai_service")

class AIService:
    @staticmethod
    def get_active_provider() -> Optional[str]:
        if settings.GEMINI_API_KEY:
            return "Gemini"
        elif settings.OPENAI_API_KEY:
            return "OpenAI"
        return None

    @staticmethod
    def validate_api_key():
        """Ensure at least one API key is configured; raise clear setup error otherwise."""
        # Reload settings in case the user edited .env while server was running
        settings.reload()
        if not settings.is_api_key_configured():
            raise HTTPException(
                status_code=400,
                detail=(
                    "LLM API Key not found! Please configure your API key in `backend/.env`:\n"
                    "• Add `GEMINI_API_KEY=your_key_here` (Recommended, free from https://aistudio.google.com/app/apikey)\n"
                    "• OR add `OPENAI_API_KEY=your_key_here` (from https://platform.openai.com/api-keys)\n"
                    "Then restart the server or retry your message."
                )
            )

    @classmethod
    def generate_response(cls, prompt: str, history: Optional[List[Dict[str, str]]] = None) -> str:
        """
        Generate response from LLM maintaining conversation context.
        Supports both Gemini API and OpenAI/compatible APIs.
        """
        cls.validate_api_key()
        history = history or []

        if settings.GEMINI_API_KEY:
            return cls._call_gemini(prompt, history)
        elif settings.OPENAI_API_KEY:
            return cls._call_openai(prompt, history)
        else:
            raise HTTPException(status_code=400, detail="No active AI provider configured.")

    @classmethod
    def _call_gemini(cls, prompt: str, history: List[Dict[str, str]]) -> str:
        """Call Google Gemini API using REST endpoint."""
        model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"

        # Construct Gemini formatted contents
        contents = []
        for msg in history:
            role = "model" if msg["role"] == "assistant" else "user"
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })

        # Append current user prompt
        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })

        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": settings.SYSTEM_INSTRUCTION}]
            },
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.95,
                "maxOutputTokens": 4096,
            }
        }

        MAX_RETRIES = 3
        RETRY_DELAY = 2.0  # seconds between retries on 503

        try:
            with httpx.Client(timeout=45.0) as client:
                response = None
                for attempt in range(1, MAX_RETRIES + 1):
                    response = client.post(url, json=payload, headers={"Content-Type": "application/json"})

                    if response.status_code == 503:
                        if attempt < MAX_RETRIES:
                            logger.warning(
                                f"Gemini 503 (model overloaded) on attempt {attempt}/{MAX_RETRIES}. "
                                f"Retrying in {RETRY_DELAY}s..."
                            )
                            time.sleep(RETRY_DELAY)
                            continue
                        # All retries exhausted
                        logger.error(f"Gemini 503 after {MAX_RETRIES} attempts: {response.text}")
                        raise HTTPException(
                            status_code=503,
                            detail=(
                                "The AI model is temporarily overloaded due to high demand. "
                                "Please wait a moment and try again."
                            )
                        )

                    elif response.status_code == 429:
                        logger.warning(f"Gemini 429 rate limit: {response.text}")
                        raise HTTPException(
                            status_code=429,
                            detail="API rate limit reached. Please wait a moment and try again."
                        )

                    elif response.status_code == 404:
                        logger.error(f"Gemini 404 model not found: {response.text}")
                        raise HTTPException(
                            status_code=404,
                            detail=(
                                f"Model '{model_name}' was not found or is deprecated. "
                                "Please update GEMINI_MODEL in backend/.env to a valid model "
                                "(e.g. gemini-3.5-flash-lite) and restart the server."
                            )
                        )

                    elif response.status_code != 200:
                        err_body = response.text
                        logger.error(f"Gemini API Error {response.status_code}: {err_body}")
                        raise HTTPException(
                            status_code=response.status_code,
                            detail=f"Gemini API Error {response.status_code}: {err_body}"
                        )

                    # ---- Success (200) ----
                    break

                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise HTTPException(status_code=500, detail="Gemini returned an empty candidate list.")

                parts = candidates[0].get("content", {}).get("parts", [])
                text_response = "".join(part.get("text", "") for part in parts)
                if not text_response.strip():
                    raise HTTPException(status_code=500, detail="Empty text received from Gemini API.")
                return text_response.strip()

        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Request to Gemini API timed out. Please try again.")
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Unexpected error in Gemini API call")
            raise HTTPException(status_code=500, detail=f"Failed to communicate with Gemini API: {str(e)}")

    @classmethod
    def _call_openai(cls, prompt: str, history: List[Dict[str, str]]) -> str:
        """Call OpenAI or OpenAI-compatible API (Groq, OpenRouter, etc.)."""
        base_url = settings.OPENAI_API_BASE.rstrip("/")
        url = f"{base_url}/chat/completions"

        messages = [{"role": "system", "content": settings.SYSTEM_INSTRUCTION}]
        for msg in history:
            messages.append({
                "role": "assistant" if msg["role"] == "assistant" else "user",
                "content": msg["content"]
            })
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": settings.OPENAI_MODEL or "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.7,
        }

        try:
            with httpx.Client(timeout=45.0) as client:
                response = client.post(url, json=payload, headers=headers)
                if response.status_code != 200:
                    err_body = response.text
                    logger.error(f"OpenAI API Error {response.status_code}: {err_body}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"OpenAI API Error: {err_body}"
                    )
                data = response.json()
                choices = data.get("choices", [])
                if not choices:
                    raise HTTPException(status_code=500, detail="No choices returned by OpenAI API.")
                return choices[0].get("message", {}).get("content", "").strip()

        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Request to OpenAI API timed out. Please try again.")
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Unexpected error in OpenAI API call")
            raise HTTPException(status_code=500, detail=f"Failed to communicate with OpenAI API: {str(e)}")

    @classmethod
    def generate_title(cls, prompt: str) -> str:
        """Generate a concise title (3-5 words) for a new chat based on the first prompt."""
        if not settings.is_api_key_configured():
            clean = prompt.replace("\n", " ").strip()
            return clean[:35] + ("..." if len(clean) > 35 else "")

        title_prompt = f"Provide a short, descriptive title (maximum 5 words, no quotes, no preamble) for a chat that begins with: '{prompt}'"
        try:
            title = cls.generate_response(title_prompt, history=[])
            title = title.strip().strip('"').strip("'").split("\n")[0]
            if len(title) > 40:
                title = title[:37] + "..."
            return title or "New Conversation"
        except Exception:
            clean = prompt.replace("\n", " ").strip()
            return clean[:35] + ("..." if len(clean) > 35 else "")
