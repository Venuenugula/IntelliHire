"""LLM provider factory."""

from __future__ import annotations

from app.core.config import get_settings
from app.llm.gemini import GeminiProvider, OpenAIProvider


def get_llm_provider():
    settings = get_settings()
    if settings.llm_provider == "openai":
        return OpenAIProvider()
    return GeminiProvider()
