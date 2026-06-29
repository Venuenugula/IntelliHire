"""Integration tests — Intelligence Lab benchmark over the REAL ranking path.

Wires the actual RankingOrchestrator + DeterministicRankingEngine (with the same
mock engines the runtime tests use for the not-yet-merged stages) and benchmarks
it against a synthetic, labelled dataset. Proves the lab produces real metric
numbers today, end-to-end, without modifying any feature-branch module.
"""

from __future__ import annotations

import asyncio

from mocks import (
    MockDecisionEngine,
    MockEvidenceProvider,
    MockFusionEngine,
    MockGraphBuilder,
    MockReasoningEngine,
)

from app.intelligence.role_dna import BlueprintRoleDNAProvider
from app.intelligence_lab import (
    BenchmarkRunner,
    generate_synthetic,
    to_csv,
    to_json,
    to_markdown,
)
from app.intelligence_lab.benchmark import BenchmarkReport
from app.runtime import (
    CandidateEvaluationPipeline,
    DeterministicRankingEngine,
    RankingOrchestrator,
)
from app.shared.enums import EvidenceSource

run = asyncio.run


def _orchestrator() -> RankingOrchestrator:
    pipeline = CandidateEvaluationPipeline(
        evidence_providers=[
            MockEvidenceProvider(EvidenceSource.GITHUB),
            MockEvidenceProvider(EvidenceSource.RESUME),
        ],
        graph_builder=MockGraphBuilder(),
        fusion_engine=MockFusionEngine(),
        reasoning_engine=MockReasoningEngine(),
        decision_engine=MockDecisionEngine(),
    )
    return RankingOrchestrator(
        evaluation_pipeline=pipeline, ranking_engine=DeterministicRankingEngine()
    )


def _build_role(job_id: str, blueprint: dict) -> object:
    return BlueprintRoleDNAProvider().build(job_id, blueprint=blueprint)


def test_benchmark_runs_end_to_end_and_scores():
    dataset = generate_synthetic(n_jobs=3, n_candidates=25, n_relevant=8, seed=11)
    runner = BenchmarkRunner(
        target=_orchestrator(), role_builder=_build_role, ks=(5, 10, 20), limit=25
    )
    report = run(runner.run(dataset))

    assert isinstance(report, BenchmarkReport)
    assert len(report.queries) == 3
    assert not report.metadata["failed_jobs"]
    # every aggregate metric is a valid probability-ish value
    for key, value in report.summary.items():
        assert 0.0 <= value <= 1.0, key
    assert {"map", "mrr", "ndcg@10", "precision@5", "recall@20"} <= set(report.summary)
    assert report.latency["total_ms"] >= 0.0
    assert 0.0 <= report.overall_score <= 1.0


def test_benchmark_recovers_relevant_with_an_oracle_target():
    """A target that ranks by ground-truth order must score near-perfectly —
    this proves the metric pipeline rewards correct rankings (not just that it runs)."""
    dataset = generate_synthetic(n_jobs=2, n_candidates=20, n_relevant=6, seed=3)

    class _OracleTarget:
        async def rank(self, *, job_id, role_dna, candidates, limit):
            from app.shared.enums import RankingStage
            from app.shared.models import CandidateRanking, RankedList

            gt = next(j.ground_truth for j in dataset.jobs if j.job_id == job_id)
            ordered = sorted(
                (c["candidate_id"] for c in candidates),
                key=lambda cid: gt.relevance.get(cid, 0.0),
                reverse=True,
            )
            items = [
                CandidateRanking(
                    ranking_id=f"r:{job_id}:{cid}",
                    job_id=job_id,
                    candidate_id=cid,
                    rank=i + 1,
                    score=1.0,
                    stage=RankingStage.RERANK,
                )
                for i, cid in enumerate(ordered[:limit])
            ]
            return RankedList(
                ranked_list_id=f"rl:{job_id}", job_id=job_id, stage=RankingStage.RERANK, items=items
            )

    runner = BenchmarkRunner(target=_OracleTarget(), role_builder=_build_role, ks=(5, 10))
    report = run(runner.run(dataset))
    assert report.summary["ndcg@10"] == 1.0
    assert report.summary["map"] == 1.0
    assert report.summary["mrr"] == 1.0


def test_report_renderers_emit_all_formats():
    dataset = generate_synthetic(n_jobs=2, n_candidates=12, n_relevant=4, seed=5)
    runner = BenchmarkRunner(target=_orchestrator(), role_builder=_build_role, ks=(5, 10))
    report = run(runner.run(dataset))

    md = to_markdown(report)
    assert "# Benchmark" in md and "Metric breakdown" in md and "Worst jobs" in md

    csv_text = to_csv(report)
    assert "job_id" in csv_text.splitlines()[0]
    assert len(csv_text.strip().splitlines()) == 1 + len(report.queries)

    restored = BenchmarkReport.model_validate_json(to_json(report))
    assert restored.summary == report.summary
