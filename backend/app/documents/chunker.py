"""Heuristic section detection for document upload."""

from __future__ import annotations

import re


def detect_sections(text: str) -> dict[str, str]:
    headers = [
        ("role_summary", r"(?i)^(role|position|job)\s+(summary|title|overview)"),
        ("responsibilities", r"(?i)^responsibilities"),
        ("required_skills", r"(?i)^(required|must have)"),
        ("preferred_skills", r"(?i)^(preferred|nice to have)"),
        ("qualifications", r"(?i)^qualifications"),
    ]
    sections: dict[str, str] = {}
    current_key = "body"
    current_lines: list[str] = []

    for line in text.split("\n"):
        matched = None
        for key, pattern in headers:
            if re.match(pattern, line.strip()):
                if current_lines:
                    sections[current_key] = "\n".join(current_lines).strip()
                current_key = key
                current_lines = []
                matched = True
                break
        if not matched:
            current_lines.append(line)

    if current_lines:
        sections[current_key] = "\n".join(current_lines).strip()
    return sections
