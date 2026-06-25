"""Document quality scoring."""

from __future__ import annotations

import re

from app.schemas.document import DocumentQuality


def score_document_quality(text: str, page_count: int, filetype: str) -> DocumentQuality:
    if not text.strip():
        return DocumentQuality(score=0.0, recommend_manual_review=True)

    formatting = 100.0
    if len(re.findall(r"\n{5,}", text)) > 0:
        formatting -= 20.0
    if re.search(r"[^\x00-\x7F]{20,}", text):
        formatting -= 10.0

    missing_sections = 100.0
    lowered = text.lower()
    for keyword in ("responsibilities", "requirements", "skills", "qualifications"):
        if keyword not in lowered:
            missing_sections -= 15.0

    ocr_quality = 90.0 if filetype == "pdf" else 100.0
    image_only_pages = 100.0 if len(text) > 100 else 30.0

    components = [formatting, missing_sections, ocr_quality, image_only_pages]
    score = max(0.0, sum(components) / len(components))

    return DocumentQuality(
        score=round(score, 1),
        ocr_quality=ocr_quality,
        formatting=formatting,
        missing_sections=max(0.0, missing_sections),
        image_only_pages=image_only_pages,
        recommend_manual_review=score < 40,
    )
