"""
ROX AI — Gemini AI Service
Integrates Google Gemini API for semantic code analysis and embeddings.
The API key is ONLY read from the backend environment (GEMINI_API_KEY).
NEVER hardcode the key or expose it to the frontend.
"""
import os
import json
import hashlib
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional
from database import get_database

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-004"
CHAT_MODEL = "gemini-1.5-flash"

class GeminiService:
    @staticmethod
    def is_available() -> bool:
        """Returns True if GEMINI_API_KEY is configured in backend environment."""
        key = os.environ.get("GEMINI_API_KEY", "").strip()
        return bool(key) and key != "YOUR_NEW_ROTATED_KEY" and key != "YOUR_GEMINI_API_KEY_HERE"

    @classmethod
    def get_code_hash(cls, code: str, language: str) -> str:
        """Generates deterministic code hash for embedding caching."""
        normalized = "".join(code.split()).lower()
        content = f"{language.lower()}:{normalized}"
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    @classmethod
    def get_cached_embedding(cls, code_hash: str) -> Optional[List[float]]:
        """Retrieves cached embedding vector from MongoDB if available."""
        try:
            db = get_database()
            doc = db.code_embeddings.find_one({"codeHash": code_hash})
            if doc and "embedding" in doc:
                return doc["embedding"]
        except Exception as e:
            logger.warning(f"Failed to read cached embedding: {e}")
        return None

    @classmethod
    def cache_embedding(cls, code_hash: str, embedding: List[float], language: str):
        """Stores embedding vector in MongoDB embedding cache."""
        try:
            db = get_database()
            db.code_embeddings.update_one(
                {"codeHash": code_hash},
                {
                    "$set": {
                        "codeHash": code_hash,
                        "embedding": embedding,
                        "embeddingModel": EMBEDDING_MODEL,
                        "language": language
                    }
                },
                upsert=True
            )
        except Exception as e:
            logger.warning(f"Failed to cache embedding: {e}")

    @classmethod
    def _http_post(cls, url: str, payload: dict, timeout: int = 10) -> Optional[dict]:
        """Performs HTTP POST using Python stdlib urllib.request."""
        try:
            data_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data_bytes,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=timeout) as response:
                if response.status == 200:
                    resp_body = response.read().decode("utf-8")
                    return json.loads(resp_body)
        except urllib.error.HTTPError as e:
            logger.warning(f"Gemini HTTP Error {e.code}: {e.reason}")
        except Exception as e:
            logger.warning(f"Gemini Request Error: {e}")
        return None

    @classmethod
    def generate_code_embedding(cls, code: str, language: str = "Java") -> Optional[List[float]]:
        """
        Generates vector embedding for code using Gemini API.
        Checks cache first. Falls back to None if API unavailable.
        """
        if not code or not code.strip():
            return None

        code_hash = cls.get_code_hash(code, language)
        cached = cls.get_cached_embedding(code_hash)
        if cached:
            return cached

        if not cls.is_available():
            return None

        api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{EMBEDDING_MODEL}:embedContent?key={api_key}"

        payload = {
            "model": f"models/{EMBEDDING_MODEL}",
            "content": {
                "parts": [{"text": f"Code snippet ({language}):\n{code}"}]
            }
        }

        data = cls._http_post(url, payload, timeout=8)
        if data:
            embedding = data.get("embedding", {}).get("values", [])
            if embedding:
                cls.cache_embedding(code_hash, embedding, language)
                return embedding

        return None

    @classmethod
    def analyze_semantic_similarity(
        cls,
        code_a: str,
        code_b: str,
        language_a: str = "Java",
        language_b: str = "Java"
    ) -> Dict[str, Any]:
        """
        Queries Gemini for explainable semantic similarity analysis.
        Must return STRICT JSON matching the evidence schema.
        Includes retry logic for invalid JSON.
        """
        if not cls.is_available():
            return {
                "source": "fallback",
                "semanticRelationship": "AI_UNAVAILABLE",
                "algorithmicApproach": "AI semantic analysis unavailable (API key not configured)",
                "similarConcepts": [],
                "differences": [],
                "confidence": 0.0,
                "ai_available": False
            }

        prompt = (
            "You are a code integrity and static analysis engine for ROX AI.\n"
            "Compare the following two source code submissions and identify semantic/algorithmic relationships.\n\n"
            "CRITICAL PRINCIPLE: You must NEVER state or imply that any student plagiarized or committed misconduct.\n"
            "Your job is ONLY to identify objective technical similarities and differences.\n\n"
            f"SUBMISSION A ({language_a}):\n```\n{code_a}\n```\n\n"
            f"SUBMISSION B ({language_b}):\n```\n{code_b}\n```\n\n"
            "Respond ONLY with a valid JSON object matching this exact structure:\n"
            "{\n"
            '  "semanticRelationship": "SIMILAR_LOGIC" | "EQUIVALENT_ALGORITHM" | "DIFFERENT_ALGORITHM" | "UNRELATED",\n'
            '  "algorithmicApproach": "A concise description of the underlying algorithmic approach used in both implementations",\n'
            '  "similarConcepts": ["concept 1", "concept 2"],\n'
            '  "differences": ["difference 1", "difference 2"],\n'
            '  "confidence": 0.85\n'
            "}\n"
            "Return ONLY the JSON string. Do not include markdown code block backticks."
        )

        result = cls._call_gemini_chat(prompt)
        if not result or not cls._validate_analysis_schema(result):
            # Stricter retry prompt
            retry_prompt = (
                prompt + "\n\nIMPORTANT: Previous attempt failed schema validation. Return raw valid JSON ONLY."
            )
            result = cls._call_gemini_chat(retry_prompt)

        if result and cls._validate_analysis_schema(result):
            result["source"] = "gemini"
            result["ai_available"] = True
            return result

        return {
            "source": "fallback",
            "semanticRelationship": "AI_ANALYSIS_FAILED",
            "algorithmicApproach": "AI semantic explanation failed validation; using deterministic fallback.",
            "similarConcepts": [],
            "differences": [],
            "confidence": 0.0,
            "ai_available": False
        }

    @classmethod
    def _call_gemini_chat(cls, prompt: str) -> Optional[Dict[str, Any]]:
        api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{CHAT_MODEL}:generateContent?key={api_key}"

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }

        data = cls._http_post(url, payload, timeout=12)
        if data:
            text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            try:
                return json.loads(text)
            except Exception as e:
                logger.warning(f"Failed to parse Gemini JSON: {e}")

        return None

    @staticmethod
    def _validate_analysis_schema(data: Any) -> bool:
        if not isinstance(data, dict):
            return False
        required_fields = ["semanticRelationship", "algorithmicApproach", "similarConcepts", "differences"]
        for field in required_fields:
            if field not in data:
                return False
        return True
