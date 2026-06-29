"""Runnable demo:  ``python -m app.intelligence_lab.demo``

Self-contained — depends on nothing from the in-progress feature branches. It
benchmarks two trivial in-file targets against a synthetic labelled dataset to
show the lab end to end and prove the metrics *discriminate*:

* ``PositionalTarget`` — ranks candidates in pool order (no intelligence). Scores
  near chance: the honest baseline every real engine must beat.
* ``OracleTarget``     — ranks by ground truth. Scores 1.0: the ceiling.

Replace either with a real ``RankingOrchestrator`` and the same report prints its
true quality.
"""

from __future__ import annotations

import asyncio

from app.intelligence_lab import BenchmarkRunner, generate_synthetic, to_markdown
from app.shared.enums import RankingStage
from app.shared.models import CandidateRanking, RankedList, RoleDNA


async def _build_role(job_id: str, blueprint: dict) -> RoleDNA:
    """Minimal RoleDNA so the demo needs no role-DNA implementation."""
    return RoleDNA(
        role_dna_id=f"roledna:{job_id}",
        job_id=job_id,
        role_summary=blueprint.get("role_title", {}).get("value", "role"),
        must_have_skills=[s["normalized_name"] for s in blueprint.get("required_skills", [])],
    )


def _ranked_list(job_id: str, ordered: list[str], limit: int) -> RankedList:
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


class PositionalTarget:
    """Ranks candidates in the order they arrive — a no-intelligence baseline."""

    async def rank(self, *, job_id, role_dna, candidates, limit):
        return _ranked_list(job_id, [c["candidate_id"] for c in candidates], limit)


class OracleTarget:
    """Ranks by hidden quality — the achievable ceiling for this synthetic data."""

    async def rank(self, *, job_id, role_dna, candidates, limit):
        ordered = sorted(
            candidates, key=lambda c: c["raw_sources"].get("quality", 0.0), reverse=True
        )
        return _ranked_list(job_id, [c["candidate_id"] for c in ordered], limit)


async def _main() -> None:
    dataset = generate_synthetic(n_jobs=3, n_candidates=40, n_relevant=10, seed=42)
    for target in (PositionalTarget(), OracleTarget()):
        runner = BenchmarkRunner(target=target, role_builder=_build_role, ks=(5, 10, 20))
        report = await runner.run(dataset)
        print(to_markdown(report))
        print("\n" + "=" * 72 + "\n")


if __name__ == "__main__":
    asyncio.run(_main())
