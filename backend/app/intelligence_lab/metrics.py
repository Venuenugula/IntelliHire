"""Ranking-quality metrics for the DELULU Intelligence Lab.

Pure-Python, dependency-free implementations of the standard information-retrieval
metrics used to score a produced ranking against a ground-truth relevance set:

    Precision@K, Recall@K, MRR, MAP (Average Precision), NDCG@K.

Design notes
------------
* These functions are deliberately decoupled from the domain models. They operate
  on plain ``list[str]`` of candidate ids and a ``relevance`` mapping, so they can
  score the ranking path today and the reasoning/decision paths later without
  change. The adapters in :mod:`app.intelligence_lab.benchmark` turn a
  :class:`~app.shared.models.RankedList` into these primitives.
* ``relevance`` is *graded*: ``candidate_id -> gain`` where ``gain >= 0``. For the
  common binary case, pass ``1.0`` for relevant ids and omit the rest. Binary
  precision/recall/MRR/MAP treat any ``gain > 0`` as relevant; NDCG uses the gain
  directly.
* Nothing here is async — metrics are CPU-only and trivially fast.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from math import log2

__all__ = [
    "precision_at_k",
    "recall_at_k",
    "reciprocal_rank",
    "average_precision",
    "dcg_at_k",
    "ndcg_at_k",
    "RankingScore",
    "evaluate_ranking",
    "aggregate_scores",
]


def _relevant_ids(relevance: dict[str, float]) -> set[str]:
    """The set of ids with strictly positive gain (binary relevance view)."""
    return {cid for cid, gain in relevance.items() if gain > 0}


def precision_at_k(predicted: list[str], relevance: dict[str, float], k: int) -> float:
    """Fraction of the top-``k`` predicted ids that are relevant.

    Returns ``0.0`` when ``k <= 0``. The denominator is ``k`` (the standard
    definition), not ``min(k, len(predicted))`` — a short ranking is penalised.
    """
    if k <= 0:
        return 0.0
    relevant = _relevant_ids(relevance)
    hits = sum(1 for cid in predicted[:k] if cid in relevant)
    return hits / k


def recall_at_k(predicted: list[str], relevance: dict[str, float], k: int) -> float:
    """Fraction of all relevant ids that appear in the top ``k``.

    Returns ``0.0`` when there are no relevant ids (nothing to recall).
    """
    relevant = _relevant_ids(relevance)
    if not relevant:
        return 0.0
    hits = sum(1 for cid in predicted[:k] if cid in relevant)
    return hits / len(relevant)


def reciprocal_rank(predicted: list[str], relevance: dict[str, float]) -> float:
    """``1 / rank`` of the first relevant id (1-based), or ``0.0`` if none hit."""
    relevant = _relevant_ids(relevance)
    for index, cid in enumerate(predicted, start=1):
        if cid in relevant:
            return 1.0 / index
    return 0.0


def average_precision(predicted: list[str], relevance: dict[str, float]) -> float:
    """Average Precision — the mean of Precision@i over every relevant hit position.

    The per-query term of Mean Average Precision (MAP). Normalised by the number of
    relevant ids so a query can reach ``1.0`` only by ranking all of them first.
    """
    relevant = _relevant_ids(relevance)
    if not relevant:
        return 0.0
    hits = 0
    summed = 0.0
    for index, cid in enumerate(predicted, start=1):
        if cid in relevant:
            hits += 1
            summed += hits / index
    return summed / len(relevant)


def dcg_at_k(predicted: list[str], relevance: dict[str, float], k: int) -> float:
    """Discounted Cumulative Gain over the top ``k`` (graded gains, log2 discount)."""
    dcg = 0.0
    for index, cid in enumerate(predicted[:k], start=1):
        gain = relevance.get(cid, 0.0)
        if gain:
            dcg += gain / log2(index + 1)
    return dcg


def ndcg_at_k(predicted: list[str], relevance: dict[str, float], k: int) -> float:
    """Normalised DCG@K in ``[0, 1]`` — DCG divided by the ideal DCG.

    The ideal ranking places the highest gains first. Returns ``0.0`` when the
    ideal DCG is zero (no positive gains).
    """
    actual = dcg_at_k(predicted, relevance, k)
    ideal_order = sorted(relevance.values(), reverse=True)
    ideal = 0.0
    for index, gain in enumerate(ideal_order[:k], start=1):
        if gain:
            ideal += gain / log2(index + 1)
    return actual / ideal if ideal else 0.0


@dataclass(frozen=True)
class RankingScore:
    """Every metric for one query (one job) at the configured cut-offs.

    ``precision_at`` / ``recall_at`` / ``ndcg_at`` are keyed by ``k``. ``map`` is
    the query's Average Precision (named ``map`` because the dataset-level mean of
    these *is* MAP); ``mrr`` is its Reciprocal Rank.
    """

    query_id: str
    precision_at: dict[int, float] = field(default_factory=dict)
    recall_at: dict[int, float] = field(default_factory=dict)
    ndcg_at: dict[int, float] = field(default_factory=dict)
    map: float = 0.0
    mrr: float = 0.0

    def as_dict(self) -> dict[str, float | str | dict[int, float]]:
        return {
            "query_id": self.query_id,
            "precision_at": dict(self.precision_at),
            "recall_at": dict(self.recall_at),
            "ndcg_at": dict(self.ndcg_at),
            "map": self.map,
            "mrr": self.mrr,
        }


def evaluate_ranking(
    query_id: str,
    predicted: list[str],
    relevance: dict[str, float],
    ks: tuple[int, ...] = (5, 10, 20, 100),
) -> RankingScore:
    """Compute the full metric set for a single ranked query."""
    return RankingScore(
        query_id=query_id,
        precision_at={k: precision_at_k(predicted, relevance, k) for k in ks},
        recall_at={k: recall_at_k(predicted, relevance, k) for k in ks},
        ndcg_at={k: ndcg_at_k(predicted, relevance, k) for k in ks},
        map=average_precision(predicted, relevance),
        mrr=reciprocal_rank(predicted, relevance),
    )


def aggregate_scores(scores: list[RankingScore]) -> dict[str, float]:
    """Mean every metric across queries → the dataset-level summary.

    Yields ``map`` (Mean Average Precision), ``mrr`` (Mean Reciprocal Rank) and a
    flattened ``precision@k`` / ``recall@k`` / ``ndcg@k`` for each ``k`` seen.
    Returns an empty dict when there are no scores.
    """
    if not scores:
        return {}
    n = len(scores)
    summary: dict[str, float] = {
        "map": sum(s.map for s in scores) / n,
        "mrr": sum(s.mrr for s in scores) / n,
    }
    ks = sorted({k for s in scores for k in s.precision_at})
    for k in ks:
        summary[f"precision@{k}"] = sum(s.precision_at.get(k, 0.0) for s in scores) / n
        summary[f"recall@{k}"] = sum(s.recall_at.get(k, 0.0) for s in scores) / n
        summary[f"ndcg@{k}"] = sum(s.ndcg_at.get(k, 0.0) for s in scores) / n
    return summary
