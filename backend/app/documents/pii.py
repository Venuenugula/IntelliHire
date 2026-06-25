"""PII detection and masking."""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.schemas.document import PiiDetection, PiiPolicy

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"\+?\d[\d\s\-().]{7,}\d")


@dataclass
class PiiResult:
    detection: PiiDetection
    masked_text: str | None


def detect_pii(text: str) -> PiiDetection:
    return PiiDetection(
        emails=list(set(EMAIL_RE.findall(text))),
        phones=list(set(PHONE_RE.findall(text))),
    )


def mask_pii(text: str, detection: PiiDetection) -> str:
    masked = text
    for email in detection.emails:
        masked = masked.replace(email, "[EMAIL]")
    for phone in detection.phones:
        masked = masked.replace(phone, "[PHONE]")
    return masked


def apply_pii_policy(text: str, policy: PiiPolicy, *, is_external_llm: bool = True) -> PiiResult:
    detection = detect_pii(text)
    if policy == PiiPolicy.DETECT_ONLY:
        return PiiResult(detection=detection, masked_text=None)
    if policy == PiiPolicy.MASK_ALWAYS or (policy == PiiPolicy.MASK_EXTERNAL and is_external_llm):
        return PiiResult(detection=detection, masked_text=mask_pii(text, detection))
    return PiiResult(detection=detection, masked_text=None)
