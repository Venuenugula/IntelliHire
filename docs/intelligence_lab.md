# DELULU Intelligence Lab

An **isolated** evaluation, benchmarking, and experiment module that validates the
quality of DELULU's intelligence engines — *without modifying any of them*.

> Status: **vertical slice (ranking path)**. The benchmark runs end-to-end against
> the live ranking path today. Decision / reasoning / evidence metrics plug into
> the same harness as those engines land behind their frozen interfaces.

---

## Why it's isolated (and stays that way)

The lab imports **only** frozen shared models (`app.shared.models`) and two
*injected* abstractions. It imports nothing from the in-progress feature branches
(Evidence, Graph, Fusion, Reasoning, Decision providers), so it cannot conflict
with them and lights up automatically as they merge.

| Injected abstraction | Contract | Satisfied today by |
| --- | --- | --- |
| `RankingTarget` | `async rank(*, job_id, role_dna, candidates, limit) -> RankedList` | `app.runtime.RankingOrchestrator` (unchanged) |
| `role_builder` | `async (job_id, blueprint) -> RoleDNA` | `BlueprintRoleDNAProvider.build` |

Because the target is the *real* `RankingOrchestrator`, swapping its injected
`RankingEngine` (deterministic → evidence-aware → reasoning → LLM) re-scores the
exact same benchmark with zero lab changes.

## Module map — `backend/app/intelligence_lab/`

| File | Responsibility |
| --- | --- |
| `metrics.py` | Pure-Python IR metrics: Precision@K, Recall@K, MRR, MAP, NDCG@K + aggregation. Dependency-free. |
| `datasets.py` | `EvaluationDataset` schema, versioned `DatasetManager`, deterministic synthetic generator. |
| `benchmark.py` | `BenchmarkRunner` → runs a target over a dataset → serialisable `BenchmarkReport`. |
| `reports.py` | Render a report to Markdown / JSON / CSV. |
| `demo.py` | `python -m app.intelligence_lab.demo` — self-contained baseline-vs-oracle run. |

Tests: `backend/tests/test_intelligence_lab_*.py` (metrics, datasets, end-to-end
benchmark over the real orchestrator).

## Quickstart

```bash
cd backend
python -m app.intelligence_lab.demo          # prints baseline + oracle reports
python -m pytest tests/test_intelligence_lab_*.py
```

Benchmark a real ranking target in code:

```python
from app.intelligence_lab import BenchmarkRunner, generate_synthetic, to_markdown

dataset = generate_synthetic(n_jobs=3, n_candidates=50, n_relevant=10, seed=7)
runner  = BenchmarkRunner(target=orchestrator, role_builder=role_provider.build)
report  = await runner.run(dataset)

print(report.overall_score)      # headline (NDCG@10, else MAP)
print(to_markdown(report))       # human report; to_json / to_csv also available
```

## Metrics (per query → aggregated)

| Metric | Meaning |
| --- | --- |
| **Precision@K** | fraction of the top-K that are relevant (denominator = K). |
| **Recall@K** | fraction of all relevant candidates found in the top-K. |
| **MRR** | mean of `1/rank` of the first relevant hit. |
| **MAP** | mean Average Precision — rewards ranking *all* relevant candidates early. |
| **NDCG@K** | graded-relevance ranking quality in `[0,1]` vs the ideal ordering. |

Relevance is **graded** (`candidate_id -> gain`); pass `1.0` for the binary case.

## Ground-truth data

The repo ships no labelled relevance data, so `generate_synthetic(...)` produces a
**deterministic, recoverable** dataset: each candidate has a hidden `quality`, and
ground-truth gain derives from it. A quality-aware ranker scores ~1.0; a
positional baseline scores near chance — which is how the demo proves the metrics
discriminate rather than merely run. Real labelled datasets drop in via
`DatasetManager.load_file(path)` (JSON matching `EvaluationDataset`).

## Roadmap (same harness, more surface)

Built: ranking metrics · dataset management · benchmark runner · reports · demo.
Next, all additive and still isolated:

- **Decision/Reasoning/Evidence metrics** — agreement, calibration, contradiction
  detection, evidence coverage — scored off `HiringDecision` / `CandidateReasoning`
  once those engines land.
- **ExperimentManager** — persist `{branch, commit, dataset, config, metrics}` per
  run for comparison over time.
- **Leaderboard + regression detection** — best vs latest, flag metric drops.
- **Ablation studies** — re-run with an evidence source removed to quantify its
  contribution ("GitHub evidence improves NDCG@10 by X%").
- **Chart-ready exports** — precision/recall curves, latency trend, confidence
  histograms (structured data only; no frontend).
