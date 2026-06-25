"""Document domain model — all intelligence engines consume Document, not str."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class PiiPolicy(str, Enum):
    DETECT_ONLY = "detect_only"
    MASK_EXTERNAL = "mask_external"
    MASK_ALWAYS = "mask_always"


class DocumentQuality(BaseModel):
    score: float = Field(ge=0.0, le=100.0, default=100.0)
    ocr_quality: float = 100.0
    formatting: float = 100.0
    missing_sections: float = 100.0
    image_only_pages: float = 100.0
    language_detected: str = "en"
    duplicate_text_ratio: float = 0.0
    has_tables: bool = False
    broken_encoding: bool = False
    recommend_manual_review: bool = False


class PiiDetection(BaseModel):
    emails: list[str] = Field(default_factory=list)
    phones: list[str] = Field(default_factory=list)
    names: list[str] = Field(default_factory=list)
    addresses: list[str] = Field(default_factory=list)


class DocumentMetadata(BaseModel):
    file_size_bytes: int = 0
    page_count: int = 1
    content_hash: str = ""
    extractor_version: str = "1.0.0"
    pii_policy: PiiPolicy = PiiPolicy.MASK_EXTERNAL


class Document(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    filename: str = "unknown"
    filetype: str = "txt"
    pages: int = 1
    language: str = "en"
    original_text: str = ""
    masked_text: str | None = None
    raw_text: str = ""
    cleaned_text: str = ""
    sections: dict[str, str] = Field(default_factory=dict)
    metadata: DocumentMetadata = Field(default_factory=DocumentMetadata)
    quality: DocumentQuality = Field(default_factory=DocumentQuality)
    pii: PiiDetection = Field(default_factory=PiiDetection)
    confidence: float = 1.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    extra: dict[str, Any] = Field(default_factory=dict)
