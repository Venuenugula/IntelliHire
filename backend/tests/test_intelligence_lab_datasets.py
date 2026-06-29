"""Unit tests — Intelligence Lab dataset management + synthetic generation."""

from __future__ import annotations

import pytest

from app.intelligence_lab.datasets import (
    DatasetManager,
    DatasetSplit,
    EvaluationDataset,
    generate_synthetic,
)


def test_synthetic_is_deterministic_and_labelled():
    a = generate_synthetic(n_jobs=2, n_candidates=20, n_relevant=6, seed=1)
    b = generate_synthetic(n_jobs=2, n_candidates=20, n_relevant=6, seed=1)
    assert a.model_dump() == b.model_dump()  # reproducible
    assert generate_synthetic(seed=2).model_dump() != a.model_dump()  # seed matters

    assert len(a.jobs) == 2
    for job in a.jobs:
        assert len(job.candidates) == 20
        assert len(job.ground_truth.relevant_ids()) == 6
        # every relevant id is a real candidate in the pool
        pool = {c.candidate_id for c in job.candidates}
        assert job.ground_truth.relevant_ids() <= pool
    assert a.split is DatasetSplit.SYNTHETIC


def test_candidate_dict_shape_matches_orchestrator():
    job = generate_synthetic(n_jobs=1, n_candidates=5).jobs[0]
    d = job.candidate_dicts()[0]
    assert set(d) == {"candidate_id", "raw_sources"}
    assert "github" in d["raw_sources"]


def test_manager_versioning_and_latest():
    mgr = DatasetManager()
    mgr.register(generate_synthetic(dataset_id="syn", version=1))
    mgr.register(generate_synthetic(dataset_id="syn", version=2))
    assert mgr.versions("syn") == [1, 2]
    assert mgr.get("syn").version == 2  # latest by default
    assert mgr.get("syn", version=1).version == 1
    with pytest.raises(ValueError):
        mgr.register(generate_synthetic(dataset_id="syn", version=1))  # dup
    with pytest.raises(KeyError):
        mgr.get("missing")


def test_json_round_trip(tmp_path):
    ds = generate_synthetic(n_jobs=1, n_candidates=8)
    path = ds.save_json(tmp_path / "ds.json")
    loaded = EvaluationDataset.load_json(path)
    assert loaded.model_dump() == ds.model_dump()
