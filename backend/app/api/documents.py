"""Document upload API with artifact persistence."""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.documents.artifacts import save_artifact
from app.documents.storage import get_object_storage
from app.documents.service import build_document
from app.schemas.artifacts import ArtifactType
from app.schemas.job import BlueprintDraftResponse, BlueprintGenerateRequest, JobUploadResponse

router = APIRouter(prefix="/jobs", tags=["document-intelligence"])


@router.post("/upload", response_model=JobUploadResponse)
async def upload_job_description(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required")

    content = await file.read()
    try:
        document = build_document(file.filename, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    storage = get_object_storage()
    storage_uri = storage.store(document.id, file.filename, content)

    await save_artifact(
        db,
        document.id,
        ArtifactType.RAW_DOCUMENT,
        {"filename": file.filename, "filetype": document.filetype},
        storage_uri=storage_uri,
    )
    await save_artifact(
        db,
        document.id,
        ArtifactType.EXTRACTED_TEXT,
        document.model_dump(mode="json"),
    )
    await save_artifact(
        db,
        document.id,
        ArtifactType.CLEAN_TEXT,
        {"cleaned_text": document.cleaned_text, "sections": document.sections},
    )
    if document.masked_text:
        await save_artifact(
            db,
            document.id,
            ArtifactType.MASKED_TEXT,
            {"masked_text": document.masked_text, "pii": document.pii.model_dump()},
        )
    await db.commit()

    message = "Document extracted. Review text, then generate blueprint."
    if document.quality.recommend_manual_review:
        message = (
            f"Document quality score {document.quality.score}/100 — "
            "manual review or OCR recommended before blueprint generation."
        )

    return JobUploadResponse(document_id=document.id, document=document, message=message)


@router.post("/blueprint", response_model=BlueprintDraftResponse)
async def generate_blueprint(request: BlueprintGenerateRequest):
    raise HTTPException(
        status_code=501,
        detail="Blueprint generator not implemented — see feat/jd-intelligence branch",
    )
