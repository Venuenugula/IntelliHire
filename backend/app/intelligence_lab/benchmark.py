"""Benchmark engine for the DELULU Intelligence Lab.

Runs a *ranking target* over every job in an :class:`EvaluationDataset`, scores
each produced ranking against ground truth, and returns a serialisable
:class:`BenchmarkReport`.

The runner is decoupled from concrete engines by two injected abstractions:

* ``RankingTarget`` — anything with ``async rank(*, job_id, role_dna, candidates,
  limit) -> RankedList``. The production :class:`RankingOrchestrator` satisfies
  this as-is, so the same benchmark scores today's deterministic path and
  tomorrow's reasoning-based path without change.
* ``role_builder`` — ``async (job_id, blueprint) -> RoleDNA``. Injected so the lab
  depends on the *contract*, not on the role-DNA implementation.

Because everything is injected, this module imports nothing from the
in-progress feature branches — it only touches frozen shared models.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from datetime import datetime
from time import perf_counter
from typing import Any, Protocol

from pydantic import BaseModel, Field

from app.intelligence_lab.datasets import EvaluationDataset, JobSpec
from app.intelligence_lab.metrics import RankingScore, aggregate_scores, evaluate_ranking
from app.shared.models import RankedList, RoleDNA

__all__ = ["RankingTarget", "RoleBuilder", "QueryReport", "BenchmarkReport", "BenchmarkRunner"]


class RankingTarget(Protocol):
    """The minimal surface a benchmark needs — satisfied by RankingOrchestrator."""

    async def rank(
        self,
        *,
        job_id: str,
        role_dna: RoleDNA,
        candidates: list[dict[str, Any]],
        limit: int,
    ) -> RankedList: ...


RoleBuilder = Callable[[str, dict[str, Any]], Awaitable[RoleDNA]]


def _flatten(score: RankingScore) -> dict[str, float]:
    """RankingScore -> flat ``{'precision@5': .., 'map': .., 'mrr': ..}`` for reports."""
    flat: dict[str, float] = {"map": score.map, "mrr": score.mrr}
    for k, v in score.precision_at.items():
        flat[f"precision@{k}"] = v
    for k, v in score.recall_at.items():
        flat[f"recall@{k}"] = v
    for k, v in score.ndcg_at.items():
        flat[f"ndcg@{k}"] = v
    return flat


class QueryReport(BaseModel):
    """Per-job result: flattened metrics + how long the ranking took."""

    job_id: str
    metrics: dict[str, float]
    latency_ms: float
    n_candidates: int
    n_relevant: int


class BenchmarkReport(BaseModel):
    """The full, serialisable outcome of one benchmark run."""

    dataset_key: str
    target_name: str
    ks: list[int]
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    summary: dict[str, float] = Field(default_factory=dict)
    queries: list[QueryReport] = Field(default_factory=list)
    latency: dict[str, float] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @property
    def overall_score(self) -> float:
        """A single headline number — NDCG@10 if present, else MAP."""
        return self.summary.get("ndcg@10", self.summary.get("map", 0.0))

    def ranked_queries(self, *, by: str = "map", best: bool = True) -> list[QueryReport]:
        """Queries sorted by a metric — for best/worst breakdowns in reports."""
        return sorted(self.queries, key=lambda q: q.metrics.get(by, 0.0), reverse=best)


class BenchmarkRunner:
    """Score a ranking target over a dataset and produce a BenchmarkReport."""

    def __init__(
        self,
        *,
        target: RankingTarget,
        role_builder: RoleBuilder,
        ks: tuple[int, ...] = (5, 10, 20, 100),
        limit: int = 100,
    ) -> None:
        self._target = target
        self._role_builder = role_builder
        self._ks = ks
        self._limit = limit

    async def _run_job(self, job: JobSpec) -> tuple[RankingScore, QueryReport]:
        role_dna = await self._role_builder(job.job_id, job.blueprint)
        started = perf_counter()
        ranked = await self._target.rank(
            job_id=job.job_id,
            role_dna=role_dna,
            candidates=job.candidate_dicts(),
            limit=self._limit,
        )
        latency_ms = (perf_counter() - started) * 1000.0

        predicted = [row.candidate_id for row in sorted(ranked.items, key=lambda r: r.rank)]
        score = evaluate_ranking(job.job_id, predicted, job.ground_truth.relevance, ks=self._ks)
        report = QueryReport(
            job_id=job.job_id,
            metrics=_flatten(score),
            latency_ms=round(latency_ms, 3),
            n_candidates=len(job.candidates),
            n_relevant=len(job.ground_truth.relevant_ids()),
        )
        return score, report

    async def run(self, dataset: EvaluationDataset) -> BenchmarkReport:
        """Benchmark every job in ``dataset`` and aggregate the results.

        Jobs are scored sequentially; the target itself is free to parallelise its
        per-candidate work (RankingOrchestrator does). One failed job does not sink
        the run — it is recorded in ``metadata['failed_jobs']`` and skipped.
        """
        scores: list[RankingScore] = []
        queries: list[QueryReport] = []
        failed: list[str] = []

        run_started = perf_counter()
        for job in dataset.jobs:
            try:
                score, report = await self._run_job(job)
            except Exception as exc:  # noqa: BLE001 — isolate one bad job from the batch
                failed.append(f"{job.job_id}: {type(exc).__name__}: {exc}")
                continue
            scores.append(score)
            queries.append(report)
        wall_ms = (perf_counter() - run_started) * 1000.0

        latencies = [q.latency_ms for q in queries]
        latency = {
            "total_ms": round(wall_ms, 3),
            "mean_ms": round(sum(latencies) / len(latencies), 3) if latencies else 0.0,
            "max_ms": round(max(latencies), 3) if latencies else 0.0,
            "throughput_qps": round(len(queries) / (wall_ms / 1000.0), 3) if wall_ms else 0.0,
        }

        return BenchmarkReport(
            dataset_key=dataset.key,
            target_name=type(self._target).__name__,
            ks=list(self._ks),
            summary=aggregate_scores(scores),
            queries=queries,
            latency=latency,
            metadata={"failed_jobs": failed, "n_jobs": len(dataset.jobs)},
        )
