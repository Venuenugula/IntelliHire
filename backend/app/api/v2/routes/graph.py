"""POST /v2/graph/build — GraphBuilder stage (stub)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.api.v2.schemas import ERROR_RESPONSES, BuildGraphRequest
from app.runtime.deps import get_graph_builder
from app.shared.interfaces import GraphBuilder
from app.shared.models import CandidateGraph

# INTERNAL/DEBUG: single-stage endpoint, not the frontend API. Use POST /v2/evaluations.
router = APIRouter(prefix="/graph", tags=["v2: internal/debug"])


@router.post(
    "/build",
    response_model=CandidateGraph,
    status_code=status.HTTP_200_OK,
    responses=ERROR_RESPONSES,
    summary="[debug] Build a CandidateGraph from Evidence",
    description=(
        "INTERNAL/DEBUG. Assemble Evidence into a CandidateGraph via the injected "
        "GraphBuilder. Graph Intelligence (Developer 3) is not yet implemented, so the "
        "active builder is the NoOpGraphAdapter: it passes evidence through and emits "
        "'graph skipped' telemetry. The frontend should use POST /v2/evaluations."
    ),
)
async def build_graph(
    payload: BuildGraphRequest,
    builder: GraphBuilder = Depends(get_graph_builder),
) -> CandidateGraph:
    return await builder.build(payload.candidate_id, payload.evidence, payload.job_id)
