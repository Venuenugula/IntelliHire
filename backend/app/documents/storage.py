"""Object storage abstraction — local filesystem default."""

from __future__ import annotations

import uuid
from pathlib import Path

from app.core.config import get_settings


class LocalObjectStorage:
    def __init__(self) -> None:
        settings = get_settings()
        self.local_root = Path(settings.upload_dir) / "documents"
        self.local_root.mkdir(parents=True, exist_ok=True)

    def store(self, document_id: uuid.UUID, filename: str, content: bytes) -> str:
        dest_dir = self.local_root / str(document_id)
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / filename
        dest.write_bytes(content)
        return str(dest)


def get_object_storage() -> LocalObjectStorage:
    return LocalObjectStorage()
