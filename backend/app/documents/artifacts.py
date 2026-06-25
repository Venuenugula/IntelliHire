"""Document artifact persistence — Postgres audit log."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document_artifact import DocumentArtifactRecord
from app.schemas.artifacts import ArtifactStatus, ArtifactType


async def save_artifact(
    db: AsyncSession,
    document_id: UUID,
    artifact_type: ArtifactType,
    payload: dict,
    *,
    storage_uri: str | None = None,
    status: ArtifactStatus = ArtifactStatus.DRAFT,
    created_by: str | None = None,
    entity_type: str | None = None,
    entity_id: UUID | None = None,
    artifact_version: int = 1,
) -> DocumentArtifactRecord:
    record = DocumentArtifactRecord(
        document_id=document_id,
        entity_type=entity_type,
        entity_id=entity_id,
        artifact_type=artifact_type.value,
        artifact_version=artifact_version,
        status=status.value,
        payload=payload,
        storage_uri=storage_uri,
        created_by=created_by,
    )
    db.add(record)
    await db.flush()
    return record


async def approve_artifact(db: AsyncSession, artifact_id: UUID) -> None:
    record = await db.get(DocumentArtifactRecord, artifact_id)
    if record:
        record.status = ArtifactStatus.APPROVED.value
        record.approved_at = datetime.now(timezone.utc)
