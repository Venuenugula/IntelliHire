# DELULU — Redrob Challenge Engine

Standalone, CPU-only, network-free ranking of 100k candidates → top-100 submission CSV.
Decoupled from the platform so it satisfies the challenge constraints (`<5 min`, no GPU,
no API calls, deterministic, stdlib-only). The platform (`backend/`) is untouched.

## Reproduce

```bash
python challenge/rank.py --candidates ./candidates.jsonl --out ./submission.csv
```

Full 100k run ≈ **17s** on CPU. Output is validated in-process against the organizer's
`validate_submission.py`.

## Approach (evidence-driven — see `reports/eda_report.md`)

The dataset is synthetic with planted honeypots. Phase-1 forensics + hypothesis probes
(`forensics.py`, `probe.py`, `probe_career.py`) established **what is signal vs noise**:

| signal | verdict | use |
|---|---|---|
| current title (software/ML-eng vs off-target) | master gate (~70% of pool off-target) | strong gate |
| boilerplate summary template | **100%** of honeypots, **0%** of engineers | strong penalty (not elimination) |
| capability-group match (retrieval/IR, ranking, LLM, systems, eval) | varies within engineers | primary ordering signal, IDF-rarity + credibility weighted |
| `skill_assessment_scores` on JD skills | 4× rarer in honeypots | positive evidence |
| experience band (5–9) | varies | soft fit |
| free-text JD relevance (summary+career) | rescues transition candidates | ordering signal |
| behavioral (saved/search/interview/response/open) | weakly fit-correlated | secondary multiplier |
| **career trajectory** | **96.9% flat — redundant with title** | **dropped** |
| **company name** | **uniform sprinkle (~23.5k each)** | **noise — ignored** |
| **raw skill count** | **near-uniform (CV 0.37)** | **trap — never counted** |

Scoring is modular (`scoring.py`): each feature emits `(score, confidence, reason)`;
the combiner applies additive positive features × title-gate × boilerplate × disqualifier ×
behavioral multipliers. The JD is interpreted via a RoleDNA (`role_dna.py`) with
capability weights traced to JD sentences — **all weights are ablatable in the Intelligence Lab.**

## Files

- `forensics.py` — full-dataset EDA → `reports/eda_report.md`
- `probe.py`, `probe_career.py` — hypothesis validation (assessments, boilerplate, trajectory)
- `role_dna.py` — JD → capabilities + weights + red-flags (semantic interpretation)
- `scoring.py` — modular feature scorers + transparent combiner
- `rank.py` — two-pass (IDF → score-all) driver + CSV + validation

## Next

1. Intelligence-Lab feature-family ablation (remove assessments / behavioral / capabilities / experience → measure top-100 churn & which feature dominates).
2. `RankingEngine` adapter in `backend/` delegating to this core (platform integration; `DeterministicRankingEngine` stays the default).
