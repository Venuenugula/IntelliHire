"""Dataset management for the DELULU Intelligence Lab.

A benchmark needs three things per job: a role spec (blueprint), a pool of
candidates, and a *ground-truth* relevance grade for those candidates. The repo
ships none of these as labelled data, so this module both (a) defines the schema
and a versioned in-memory registry, and (b) can synthesise a fully-labelled
dataset so every metric in :mod:`app.intelligence_lab.metrics` is computable today.

Schema
------
``EvaluationDataset`` -> many ``JobSpec`` -> each has a ``blueprint`` (RoleDNA
input, same shape the rest of the system uses), a list of ``Candidate`` records
(``candidate_id`` + ``raw_sources``, exactly what the orchestrator consumes), and
a ``GroundTruthEntry`` mapping ``candidate_id -> graded gain``.

Everything is a pydantic model, so ``EvaluationDataset.model_validate`` /
``model_validate_json`` *is* the schema validation step.
"""

from __future__ import annotations

import json
import random
from enum import Enum
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

__all__ = [
    "DatasetSplit",
    "Candidate",
    "GroundTruthEntry",
    "JobSpec",
    "EvaluationDataset",
    "DatasetManager",
    "generate_synthetic",
]


class DatasetSplit(str, Enum):
    """What a dataset is for. Keeps train/eval/demo data from being mixed up."""

    TRAIN = "train"
    EVAL = "eval"
    DEMO = "demo"
    SYNTHETIC = "synthetic"


class Candidate(BaseModel):
    """One candidate, in the exact shape the orchestrator's ``candidates`` expects."""

    candidate_id: str
    raw_sources: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)

    def as_candidate_dict(self) -> dict[str, Any]:
        """Render to the plain dict the RankingOrchestrator consumes."""
        return {"candidate_id": self.candidate_id, "raw_sources": self.raw_sources}


class GroundTruthEntry(BaseModel):
    """Graded relevance for one job: ``candidate_id -> gain`` (gain >= 0)."""

    job_id: str
    relevance: dict[str, float] = Field(default_factory=dict)

    def relevant_ids(self) -> set[str]:
        return {cid for cid, gain in self.relevance.items() if gain > 0}


class JobSpec(BaseModel):
    """A single benchmark unit: a role, its candidate pool, and the ground truth."""

    job_id: str
    blueprint: dict[str, Any] = Field(
        ..., description="RoleDNA blueprint (role_title/required_skills/...)."
    )
    candidates: list[Candidate] = Field(default_factory=list)
    ground_truth: GroundTruthEntry

    def candidate_dicts(self) -> list[dict[str, Any]]:
        return [c.as_candidate_dict() for c in self.candidates]


class EvaluationDataset(BaseModel):
    """A named, versioned collection of jobs to benchmark against."""

    dataset_id: str
    version: int = 1
    name: str = ""
    description: str = ""
    split: DatasetSplit = DatasetSplit.EVAL
    jobs: list[JobSpec] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @property
    def key(self) -> str:
        """Stable registry key, e.g. ``'roles-v2'``."""
        return f"{self.dataset_id}:v{self.version}"

    def save_json(self, path: str | Path) -> Path:
        target = Path(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(self.model_dump_json(indent=2), encoding="utf-8")
        return target

    @classmethod
    def load_json(cls, path: str | Path) -> EvaluationDataset:
        return cls.model_validate_json(Path(path).read_text(encoding="utf-8"))


class DatasetManager:
    """Versioned in-memory registry of datasets, with JSON load/save helpers.

    Not a database — a lightweight registry so a benchmark run can resolve a
    dataset by id (latest version by default) and so multiple versions coexist.
    """

    def __init__(self) -> None:
        self._datasets: dict[str, EvaluationDataset] = {}

    def register(self, dataset: EvaluationDataset, *, overwrite: bool = False) -> EvaluationDataset:
        if dataset.key in self._datasets and not overwrite:
            raise ValueError(f"dataset {dataset.key} already registered (pass overwrite=True)")
        self._datasets[dataset.key] = dataset
        return dataset

    def load_file(self, path: str | Path, *, overwrite: bool = False) -> EvaluationDataset:
        return self.register(EvaluationDataset.load_json(path), overwrite=overwrite)

    def get(self, dataset_id: str, version: int | None = None) -> EvaluationDataset:
        """Resolve a dataset by id; ``version=None`` returns the latest version."""
        if version is not None:
            try:
                return self._datasets[f"{dataset_id}:v{version}"]
            except KeyError:
                raise KeyError(f"dataset {dataset_id}:v{version} not registered") from None
        versions = self.versions(dataset_id)
        if not versions:
            raise KeyError(f"no dataset registered under id {dataset_id!r}")
        return self._datasets[f"{dataset_id}:v{max(versions)}"]

    def versions(self, dataset_id: str) -> list[int]:
        return sorted(
            d.version for d in self._datasets.values() if d.dataset_id == dataset_id
        )

    def list(self) -> list[str]:
        return sorted(self._datasets)


# --------------------------------------------------------------------------- #
# Synthetic data — labelled, deterministic, recoverable.
# --------------------------------------------------------------------------- #

_SKILLS = ["python", "fastapi", "postgres", "kubernetes", "react", "go", "rust", "aws"]


def generate_synthetic(
    *,
    dataset_id: str = "synthetic",
    n_jobs: int = 3,
    n_candidates: int = 50,
    n_relevant: int = 10,
    seed: int = 7,
    version: int = 1,
) -> EvaluationDataset:
    """Build a fully-labelled dataset of ``n_jobs`` jobs.

    Each candidate carries a hidden ``quality`` in ``raw_sources`` and a matching
    skill set; ground-truth gain is derived from that quality, so the data is
    *recoverable*: a quality-aware ranker scores high, while a placeholder ranker
    scores near chance. Deterministic for a given ``seed``.
    """
    rng = random.Random(seed)
    jobs: list[JobSpec] = []

    for j in range(n_jobs):
        job_id = f"{dataset_id}-job-{j + 1}"
        required = rng.sample(_SKILLS, 3)
        blueprint = {
            "role_title": {"value": f"Engineer (job {j + 1})"},
            "experience_level": {"value": f"{rng.randint(3, 8)} years"},
            "required_skills": [{"normalized_name": s} for s in required],
            "capability_weights": {"backend": 1.0},
        }

        candidates: list[Candidate] = []
        relevance: dict[str, float] = {}
        # The top n_relevant candidates (by quality) are the relevant set, graded
        # 3/2/1 so NDCG has something to discriminate.
        qualities = sorted((rng.random() for _ in range(n_candidates)), reverse=True)
        for i, quality in enumerate(qualities):
            cid = f"{job_id}-cand-{i + 1}"
            n_matched = 3 if i < n_relevant else rng.randint(0, 2)
            candidates.append(
                Candidate(
                    candidate_id=cid,
                    raw_sources={
                        "github": {"skills": required[:n_matched]},
                        "resume": {"skills": rng.sample(_SKILLS, 2)},
                        "quality": round(quality, 4),
                    },
                )
            )
            if i < n_relevant:
                grade = 3.0 if i < n_relevant // 3 else 2.0 if i < 2 * n_relevant // 3 else 1.0
                relevance[cid] = grade

        # Shuffle so position carries no signal — the ranker must earn its order.
        rng.shuffle(candidates)
        jobs.append(
            JobSpec(
                job_id=job_id,
                blueprint=blueprint,
                candidates=candidates,
                ground_truth=GroundTruthEntry(job_id=job_id, relevance=relevance),
            )
        )

    return EvaluationDataset(
        dataset_id=dataset_id,
        version=version,
        name=f"Synthetic benchmark ({n_jobs} jobs x {n_candidates} candidates)",
        description="Deterministic, recoverable synthetic data for metric validation.",
        split=DatasetSplit.SYNTHETIC,
        jobs=jobs,
        metadata={"seed": seed, "n_relevant": n_relevant},
    )
