"""Skill normalization — Tensor Flow / TensorFlow / TF → TensorFlow."""

from __future__ import annotations

import re

ALIASES: dict[str, str] = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "tf": "TensorFlow",
    "tensor flow": "TensorFlow",
    "tensorflow": "TensorFlow",
    "py torch": "PyTorch",
    "pytorch": "PyTorch",
    "fast api": "FastAPI",
    "fastapi": "FastAPI",
    "node js": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "reactjs": "React",
    "react.js": "React",
    "llms": "LLMs",
    "large language models": "LLMs",
}


def normalize_skill(raw: str) -> str:
    key = raw.strip().lower()
    key = re.sub(r"[\s\-_]+", " ", key).strip()
    if key in ALIASES:
        return ALIASES[key]
    return raw.strip().title() if raw.islower() else raw.strip()


def normalize_skills(skills: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for skill in skills:
        normalized = normalize_skill(skill)
        if normalized.lower() not in seen:
            seen.add(normalized.lower())
            result.append(normalized)
    return result
