#!/usr/bin/env python3
"""Boundary sensitivity: ranks 90-110, and the single rubric lever that moves each
across the Top-100 cutoff. ANALYSIS ONLY — the engine is not modified (weight
variants are applied at runtime and restored; scoring.py on disk is unchanged).

Levers tested (each a single one-knob change, full re-rank of all 100k):
  behavioral_neutral  — ignore availability (behavioral mult -> 1.0)
  behavioral_wide     — restore old wide range [0.60,1.12]
  experience_neutral  — ignore experience band (prior -> 1.0)
  assessment_up       — assessment weight 0.182 -> 0.28 (others renormalized)
  capability_up       — capability weight 0.523 -> 0.62 (others renormalized)
  text_down           — text weight 0.182 -> 0.09 (others renormalized)

Run: python challenge/bubble_analysis.py --candidates PATH
"""

from __future__ import annotations

import argparse
from pathlib import Path

import scoring
from lab import build_idf, load, rank_all
from role_dna import SENIOR_AI_ENGINEER as JD

CUTOFF = 100


def ranks_of(scored) -> dict[str, int]:
    return {s.candidate_id: i + 1 for i, s in enumerate(scored)}


def reweight(orig: dict[str, float], key: str, new: float) -> dict[str, float]:
    """Set key=new, renormalize the others so weights still sum to 1.0."""
    others = {k: v for k, v in orig.items() if k != key}
    s = sum(others.values())
    rem = 1.0 - new
    w = {k: v / s * rem for k, v in others.items()}
    w[key] = new
    return w


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates", type=Path, required=True)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--out", type=Path, default=Path("challenge/reports/bubble_analysis.md"))
    args = ap.parse_args()

    cands = load(args.candidates, args.limit)
    idf = build_idf(cands)
    by_id = {c.get("candidate_id"): c for c in cands}

    base = rank_all(cands, JD, idf)
    base_rank = ranks_of(base)
    by_cand = {s.candidate_id: s for s in base}
    cutoff_score = base[CUTOFF - 1].score
    first_out_score = base[CUTOFF].score
    bubble = base[89:110]  # ranks 90..110

    # --- scenario rankings (full re-rank each) ------------------------------
    scen: dict[str, dict[str, int]] = {"baseline": base_rank}
    scen["behavioral_neutral"] = ranks_of(rank_all(cands, JD, idf, disable=frozenset({"behavioral"})))
    scen["experience_neutral"] = ranks_of(rank_all(cands, JD, idf, disable=frozenset({"experience_fit"})))

    # behavioral_wide: analytic (recover comp from the compressed multiplier)
    wide = []
    for s in base:
        m = s.multipliers["behavioral"]
        comp = max(0.0, min(1.0, (m - 0.85) / 0.20))
        wide.append((s.candidate_id, s.score / m * (0.60 + 0.52 * comp)))
    wide.sort(key=lambda r: (-round(r[1], 6), r[0]))
    scen["behavioral_wide"] = {c: i + 1 for i, (c, _) in enumerate(wide)}

    # weight levers via runtime monkeypatch (restored immediately)
    orig = dict(scoring._ADDITIVE_WEIGHTS)
    for name, key, val in [("assessment_up", "assessment_evidence", 0.28),
                           ("capability_up", "capability_match", 0.62),
                           ("text_down", "text_relevance", 0.09)]:
        scoring._ADDITIVE_WEIGHTS = reweight(orig, key, val)
        scen[name] = ranks_of(rank_all(cands, JD, idf))
    scoring._ADDITIVE_WEIGHTS = orig

    levers = [k for k in scen if k != "baseline"]

    # --- per-candidate analysis --------------------------------------------
    out = ["# Boundary Sensitivity — ranks 90-110 and the single lever that flips each\n",
           f"Top-100 cutoff score = **{cutoff_score:.4f}** (rank 100); first-out = {first_out_score:.4f} "
           f"(rank 101). Δ across the line = {cutoff_score - first_out_score:.4f}.\n",
           "For each candidate: profile, score, margin to the cutoff, and which single "
           "rubric change flips their in/out status (→IN promotes, →OUT drops).\n"]
    for s in bubble:
        c = by_id[s.candidate_id]
        p = c["profile"]
        sig = c["redrob_signals"]
        r = base_rank[s.candidate_id]
        status = "IN" if r <= CUTOFF else "OUT"
        margin = s.score - cutoff_score  # +ve => above the line
        a = s.additive
        capdet = (s.features[1].detail or {})
        topcaps = ", ".join(f"{k}:{v:.2f}" for k, v in sorted(capdet.items(), key=lambda x: -x[1])[:3] if v > 0.01)
        flips = []
        for lev in levers:
            nr = scen[lev].get(s.candidate_id, 99999)
            now_in = nr <= CUTOFF
            was_in = r <= CUTOFF
            if now_in != was_in:
                flips.append((lev, nr, "→IN" if now_in else "→OUT"))
        out.append(f"### Rank {r} [{status}] {s.candidate_id} — {p['current_title']} ({p['years_of_experience']:.1f}y) — score {s.score:.4f} (margin {margin:+.4f})")
        out.append(f"- additive: cap={a['capability_match']:.3f} ({topcaps}); assess={a['assessment_evidence']:.3f}; text={a['text_relevance']:.3f}; title={a['title_fit']:.3f}")
        out.append(f"- multipliers: experience={s.multipliers['experience']:.3f}, behavioral={s.multipliers['behavioral']:.3f}  | resp={sig['recruiter_response_rate']:.2f} open={bool(sig.get('open_to_work_flag'))} assessments={len(sig.get('skill_assessment_scores') or {})}")
        if flips:
            out.append("- **single change that flips status:** " + "; ".join(f"`{lev}` (→rank {nr}) {d}" for lev, nr, d in flips))
        else:
            out.append(f"- **robust** under all tested single levers; would need a larger move (closest margin {margin:+.4f}).")
        out.append("")

    # summary: which lever is most pivotal at the boundary
    out.append("## Which lever controls the boundary\n")
    out.append("| lever | bubble candidates it flips |")
    out.append("|---|---|")
    for lev in levers:
        n = sum(1 for s in bubble if (scen[lev].get(s.candidate_id, 99999) <= CUTOFF) != (base_rank[s.candidate_id] <= CUTOFF))
        out.append(f"| {lev} | {n} |")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text("\n".join(out), encoding="utf-8")
    print("\n".join(out))
    print(f"\nwrote {args.out}")


if __name__ == "__main__":
    main()
