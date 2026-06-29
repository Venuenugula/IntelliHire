"""Unit tests — Intelligence Lab ranking metrics (known-value checks)."""

from __future__ import annotations

import pytest

from app.intelligence_lab.metrics import (
    aggregate_scores,
    average_precision,
    evaluate_ranking,
    ndcg_at_k,
    precision_at_k,
    recall_at_k,
    reciprocal_rank,
)

PRED = ["a", "b", "c", "d", "e"]
REL = {"a": 1.0, "c": 1.0, "e": 1.0}  # relevant at ranks 1, 3, 5


def test_precision_at_k():
    assert precision_at_k(PRED, REL, 1) == 1.0
    assert precision_at_k(PRED, REL, 3) == pytest.approx(2 / 3)
    assert precision_at_k(PRED, REL, 5) == pytest.approx(0.6)
    assert precision_at_k(PRED, REL, 0) == 0.0  # guard


def test_recall_at_k():
    assert recall_at_k(PRED, REL, 3) == pytest.approx(2 / 3)
    assert recall_at_k(PRED, REL, 5) == 1.0
    assert recall_at_k(PRED, {}, 5) == 0.0  # nothing to recall


def test_reciprocal_rank():
    assert reciprocal_rank(PRED, REL) == 1.0
    assert reciprocal_rank(["x", "y", "c"], REL) == pytest.approx(1 / 3)
    assert reciprocal_rank(["x", "y"], REL) == 0.0


def test_average_precision():
    # hits at ranks 1,3,5 -> mean of (1/1, 2/3, 3/5)
    assert average_precision(PRED, REL) == pytest.approx((1.0 + 2 / 3 + 3 / 5) / 3)
    assert average_precision(PRED, {}) == 0.0


def test_ndcg_binary():
    assert ndcg_at_k(PRED, REL, 5) == pytest.approx(0.8855, abs=1e-4)
    # perfect ordering scores 1.0
    assert ndcg_at_k(["a", "c", "e", "b", "d"], REL, 5) == pytest.approx(1.0)
    assert ndcg_at_k(PRED, {}, 5) == 0.0


def test_ndcg_graded():
    rel = {"a": 3.0, "b": 1.0}
    assert ndcg_at_k(["a", "b"], rel, 2) == pytest.approx(1.0)
    assert ndcg_at_k(["b", "a"], rel, 2) == pytest.approx(0.7967, abs=1e-4)


def test_evaluate_and_aggregate():
    s1 = evaluate_ranking("j1", PRED, REL, ks=(1, 3, 5))
    s2 = evaluate_ranking("j2", ["a", "c", "e", "b", "d"], REL, ks=(1, 3, 5))
    assert s1.mrr == 1.0 and s1.precision_at[3] == pytest.approx(2 / 3)
    summary = aggregate_scores([s1, s2])
    assert summary["map"] == pytest.approx((s1.map + s2.map) / 2)
    assert summary["ndcg@5"] == pytest.approx((s1.ndcg_at[5] + s2.ndcg_at[5]) / 2)
    assert "precision@1" in summary and "recall@3" in summary
    assert aggregate_scores([]) == {}
