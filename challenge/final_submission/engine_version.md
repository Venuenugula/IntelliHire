# Challenge Ranking Engine — version & configuration snapshot

Frozen configuration used to produce `final.csv`. Reproducible and inspectable.

## Provenance
- **Git commit:** `90a5fb5b4fca3c0b5a4ae1e91c0bc4659d038d2d` (branch `feat/challenge-ranking-engine`)
- **final.csv SHA256:** `b6ef9e9eb44b5ea69a51f8337a4c2963fa8dafb84c18a29370e6dd84afbff019`
- **Candidates processed:** 100,000
- **Runtime:** ~20s (pass1 IDF 2.8s + pass2 scoring)
- **Environment:** Python 3.10.12, Linux 6.8.0, 4 CPU cores; no GPU; no network during ranking
- **Validator:** organizer `validate_submission.py` — PASS (see `validation.log`)

## Pipeline
`candidates.jsonl` → pass1 corpus skill document-frequency → IDF rarity → pass2 score
every candidate → sort by (−score, candidate_id) → top-100 → CSV.

## Scoring composition (deterministic, rule-based)
**Additive base** (weights renormalised to 1.0; experience removed — now a prior):
| feature | weight |
|---|---|
| capability_match | 0.523 |
| assessment_evidence | 0.182 |
| text_relevance | 0.182 |
| title_fit | 0.114 |

`final = base × gate × experience × boilerplate × disqualifiers × behavioral`

**Multiplicative priors / gates:**
- title gate: `0.15 + 0.85·title_fit` (off-target titles suppressed, not zeroed)
- experience prior: in-band [5,9] = 1.0; below = `max(0.60, 1−0.15·deficit)`; above = `max(0.85, 1−0.03·excess)`
- boilerplate: 0.35 if honeypot-template summary else 1.0
- disqualifiers: services-only ×0.85; off-domain-only ×0.80; research-title-without-production ×0.75
- behavioral (availability prior, compressed): `0.85 + 0.20·comp` ∈ [0.85, 1.05]

## Capability groups (RoleDNA, JD-provenance weights)
retrieval_ir 0.28 · ranking_recsys 0.22 · nlp_llm 0.16 · production_systems 0.16 ·
eval_systems 0.10 · llm_tooling 0.08. Per-skill credit = IDF-rarity × (1 + 0.15·endorsements×√duration×proficiency), saturating per group. Member lists enriched with synonyms for hidden-set robustness.

## Explicitly excluded (measured as redundant/noise)
- career trajectory (96.9% flat → redundant with title)
- company name (uniform distribution → noise)
- raw skill keyword count (near-uniform, CV 0.37 → dataset's keyword-stuffer trap)

## Validation harness (how decisions were justified)
feature-family ablation · Spearman/Kendall rank correlation · capability-group
ablation · semantic-robustness perturbation · boundary sensitivity (ranks 90–110) ·
candidate-level inspection. No label-free weight curve-fitting; every change cited
candidate IDs + recruiter rationale + measured impact.
