"""DELULU Intelligence Lab — isolated evaluation, benchmarking & experiment module.

Validates the quality of every DELULU intelligence engine without touching any of
them. It depends only on the *frozen* shared models and on injected abstractions
(``RankingTarget``, ``role_builder``), so it imports nothing from the in-progress
Evidence / Graph / Fusion / Reasoning / Decision feature branches and lights up
automatically as those engines land behind their interfaces.

    from app.intelligence_lab import (
        BenchmarkRunner, generate_synthetic, DatasetManager, to_markdown,
    )

See ``docs/intelligence_lab.md`` for the architecture and a runnable example.
"""

from __future__ import annotations

from app.intelligence_lab.benchmark import (
    BenchmarkReport,
    BenchmarkRunner,
    QueryReport,
    RankingTarget,
)
from app.intelligence_lab.datasets import (
    Candidate,
    DatasetManager,
    DatasetSplit,
    EvaluationDataset,
    GroundTruthEntry,
    JobSpec,
    generate_synthetic,
)
from app.intelligence_lab.metrics import (
    RankingScore,
    aggregate_scores,
    average_precision,
    evaluate_ranking,
    ndcg_at_k,
    precision_at_k,
    recall_at_k,
    reciprocal_rank,
)
from app.intelligence_lab.reports import to_csv, to_json, to_markdown

__all__ = [
    # metrics
    "precision_at_k",
    "recall_at_k",
    "reciprocal_rank",
    "average_precision",
    "ndcg_at_k",
    "evaluate_ranking",
    "aggregate_scores",
    "RankingScore",
    # datasets
    "DatasetSplit",
    "Candidate",
    "GroundTruthEntry",
    "JobSpec",
    "EvaluationDataset",
    "DatasetManager",
    "generate_synthetic",
    # benchmark
    "RankingTarget",
    "QueryReport",
    "BenchmarkReport",
    "BenchmarkRunner",
    # reports
    "to_json",
    "to_csv",
    "to_markdown",
]
