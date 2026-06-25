"""Extracted field models with provenance and confidence."""

from __future__ import annotations

from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class SourceSpan(BaseModel):
    text: str
    start_char: int
    end_char: int
    page: int | None = None


class ExtractionProvenance(BaseModel):
    field: str
    model: str | None = None
    prompt_version: str | None = None
    parser_version: str | None = None


class ExtractedField(BaseModel, Generic[T]):
    value: T
    confidence: float = Field(ge=0.0, le=1.0, default=0.8)
    source: str | None = None
    source_span: SourceSpan | None = None
    provenance: ExtractionProvenance | None = None


class SkillField(BaseModel):
    name: str
    normalized_name: str
    confidence: float = Field(ge=0.0, le=1.0, default=0.8)
    source: str | None = None
    source_span: SourceSpan | None = None
    category: str | None = "technical"
    provenance: ExtractionProvenance | None = None


class HumanFeedback(BaseModel):
    field: str
    original_value: str | list | dict | None = None
    edited_value: str | list | dict | None = None
    confirmed: bool = False
    reviewer_note: str | None = None
    reviewed_at: datetime | None = None


class VersioningMeta(BaseModel):
    blueprint_version: str = "1.0.0"
    parser_version: str | None = None
    prompt_version: str | None = None
    llm_model: str | None = None
    approved_by: str | None = None
    approved_at: datetime | None = None
