#!/usr/bin/env python3
"""Intelligence Lab — optimization instruments over the FROZEN ChallengeRankingEngine.

NOT new engine modules — these are measurement tools that answer the only two
questions that matter now: which features drive the ranking, and why is candidate
A ranked above candidate B.

  ablation  (Phase 3) — disable one feature family at a time; measure top-100 /
            top-20 overlap and rank movement vs baseline = feature importance.
  audit     (Phases 1-2, 7) — per-candidate score decomposition + certainty, and
            a leave-one-component-swap attribution for every adjacent pair
            (rank i vs i+1): which single signal, if reverted to the lower
            candidate's value, most collapses the margin.

Loads the corpus once into memory and reuses it across all ablations (CPU, no net).

Run:
  python challenge/lab.py --candidates ./candidates.jsonl            # all artifacts
  python challenge/lab.py --candidates ./candidates.jsonl --limit 20000
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from role_dna import SENIOR_AI_ENGINEER
from scoring import ABLATABLE, score_candidate

SUBMISSION_SIZE = 100


def load(path: Path, limit: int = 0) -> list[dict]:
    out = []
    with open(path, encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            if limit and i >= limit:
                break
            line = line.strip()
            if line:
                try:
                    out.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return out


def build_idf(cands: list[dict]) -> dict[str, float]:
    df: dict[str, int] = {}
    n = len(cands)
    for c in cands:
        for nm in {(s.get("name") or "").lower() for s in c.get("skills") or []}:
            if nm:
                df[nm] = df.get(nm, 0) + 1
    idf = {k: math.log(1 + n / v) for k, v in df.items()}
    if idf:
        base = min(idf.values())
        idf = {k: v / base for k, v in idf.items()}
    return idf


def rank_all(cands, jd, idf, disable=frozenset()):
    scored = [score_candidate(c, jd, idf, disable) for c in cands]
    scored.sort(key=lambda s: (-round(s.score, 6), s.candidate_id))
    return scored


def rank_correlation(ids_a: list[str], ids_b: list[str]) -> dict[str, float]:
    """Spearman rho + Kendall tau over the INTERSECTION of two ranked id lists.
    Proves internal-ordering stability (not just set membership). O(n^2) — fine for top-100."""
    ra = {c: i for i, c in enumerate(ids_a)}
    rb = {c: i for i, c in enumerate(ids_b)}
    common = [c for c in ids_a if c in rb]
    n = len(common)
    if n < 2:
        return {"n": n, "spearman": 1.0, "kendall": 1.0, "overlap": n}
    xa = [ra[c] for c in common]
    xb = [rb[c] for c in common]
    # Spearman = Pearson on the rank values
    ma, mb = sum(xa) / n, sum(xb) / n
    cov = sum((xa[i] - ma) * (xb[i] - mb) for i in range(n))
    va = sum((v - ma) ** 2 for v in xa) ** 0.5
    vb = sum((v - mb) ** 2 for v in xb) ** 0.5
    spearman = cov / (va * vb) if va and vb else 1.0
    # Kendall tau-a
    conc = disc = 0
    for i in range(n):
        for j in range(i + 1, n):
            s = (xa[i] - xa[j]) * (xb[i] - xb[j])
            conc += s > 0
            disc += s < 0
    tot = n * (n - 1) / 2
    kendall = (conc - disc) / tot if tot else 1.0
    return {"n": n, "spearman": spearman, "kendall": kendall, "overlap": len(common)}


# --------------------------------------------------------------------------- #
# Phase 3 — feature-family ablation
# --------------------------------------------------------------------------- #


def ablation(cands, jd, idf) -> str:
    base = rank_all(cands, jd, idf)
    base_ids = [s.candidate_id for s in base]
    base_rank = {cid: i for i, cid in enumerate(base_ids)}
    base_100, base_20 = set(base_ids[:100]), set(base_ids[:20])

    rows = []
    for feat in ABLATABLE:
        ab = rank_all(cands, jd, idf, disable=frozenset({feat}))
        ab_ids = [s.candidate_id for s in ab]
        ab_rank = {cid: i for i, cid in enumerate(ab_ids)}
        ab_100, ab_20 = set(ab_ids[:100]), set(ab_ids[:20])
        keep100 = base_100 & ab_100
        moves = [abs(base_rank[c] - ab_rank[c]) for c in keep100]
        rows.append((
            feat,
            len(keep100) / 100,
            len(base_20 & ab_20) / 20,
            sum(moves) / len(moves) if moves else 0.0,
            100 - len(keep100),
        ))
    rows.sort(key=lambda r: r[1])  # most disruptive (lowest overlap) first = most important

    out = ["# Phase 3 — Feature-Family Ablation (importance)\n",
           f"Corpus: {len(cands):,} candidates. Each row disables ONE family and re-ranks.\n",
           "Lower top-100 overlap / higher rank-move ⇒ the ranking depends MORE on that family.\n",
           "| disabled family | top100 overlap | top20 overlap | mean rank move (kept) | dropped from top100 |",
           "|---|---|---|---|---|"]
    for feat, ov100, ov20, move, dropped in rows:
        out.append(f"| {feat} | {ov100:.0%} | {ov20:.0%} | {move:.1f} | {dropped} |")
    out.append("\n**Read:** the family at the top is the strongest ranking driver; "
               "a family with ~100% overlap and ~0 move is near-inert and a candidate for re-weighting or removal.\n")
    return "\n".join(out)


# --------------------------------------------------------------------------- #
# Phases 1-2 — top-100 audit + adjacent-pair attribution
# --------------------------------------------------------------------------- #


def _recompute_final(additive: dict[str, float], multipliers: dict[str, float]) -> float:
    base = sum(additive.values())
    m = 1.0
    for v in multipliers.values():
        m *= v
    return max(0.0, min(1.0, base * m))


def _swap_attribution(hi, lo) -> tuple[str, float, float, float]:
    """Leave-one-component-swap: replace each of hi's components with lo's value;
    the component whose swap drops hi's final the most is the ordering driver."""
    best = ("", 0.0, 0.0, 0.0)
    for comp, hv in {**hi.additive, **hi.multipliers}.items():
        add = dict(hi.additive)
        mult = dict(hi.multipliers)
        if comp in add:
            lv = lo.additive[comp]
            add[comp] = lv
        else:
            lv = lo.multipliers[comp]
            mult[comp] = lv
        drop = hi.score - _recompute_final(add, mult)
        if drop > best[1]:
            best = (comp, drop, hv, lv)
    return best


def _cert(x: float) -> str:
    return "HIGH" if x >= 0.8 else ("MED" if x >= 0.6 else "LOW")


def audit(cands, jd, idf) -> str:
    base = rank_all(cands, jd, idf)[:SUBMISSION_SIZE]
    out = ["# Phases 1-2 — Top-100 Audit & Adjacent-Pair Attribution\n",
           "Per candidate: final score, certainty, score decomposition. "
           "Each pair line answers *why rank i beats i+1* via leave-one-component-swap.\n"]
    for i, s in enumerate(base):
        add = ", ".join(f"{k.split('_')[0]}={v:.3f}" for k, v in s.additive.items() if v)
        mul = ", ".join(f"{k}={v:.2f}" for k, v in s.multipliers.items() if abs(v - 1.0) > 1e-6)
        out.append(f"### {i+1}. {s.candidate_id}  —  {s.score:.4f}  [{_cert(s.certainty)}]")
        out.append(f"- {s.reason}")
        out.append(f"- additive: {add or 'none'}")
        # per-capability reasoning: which technical strengths drove the capability score
        cap_fs = next((f for f in s.features if f.name == "capability_match"), None)
        if cap_fs and cap_fs.detail:
            w = 0.523  # capability additive weight; expresses sub-caps as score contribution
            top = sorted(((k, v * w) for k, v in cap_fs.detail.items() if v > 0), key=lambda x: -x[1])
            out.append("  - capability ← " + ", ".join(f"{k} {v:.3f}" for k, v in top[:5]))
        out.append(f"- multipliers: {mul or 'all neutral'}")
        if i + 1 < len(base):
            lo = base[i + 1]
            margin = s.score - lo.score
            comp, drop, hv, lv = _swap_attribution(s, lo)
            out.append(f"- **vs #{i+2} (Δ={margin:.4f}):** driven by **{comp}** "
                       f"({hv:.3f} vs {lv:.3f}); reverting it would cost rank #{i+1} {drop:.4f}")
        out.append("")
    return "\n".join(out)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates", type=Path, default=None)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--outdir", type=Path, default=Path("challenge/reports"))
    args = ap.parse_args()
    path = args.candidates
    if not path:
        for p in Path("challenge_data").rglob("candidates.jsonl"):
            if "MACOSX" not in str(p):
                path = p
                break
    if not path or not path.exists():
        raise SystemExit("pass --candidates PATH")

    cands = load(path, args.limit)
    idf = build_idf(cands)
    print(f"loaded {len(cands):,} candidates, {len(idf):,} skills")

    args.outdir.mkdir(parents=True, exist_ok=True)
    abl = ablation(cands, jd=SENIOR_AI_ENGINEER, idf=idf)
    (args.outdir / "ablation_report.md").write_text(abl, encoding="utf-8")
    aud = audit(cands, jd=SENIOR_AI_ENGINEER, idf=idf)
    (args.outdir / "top100_audit.md").write_text(aud, encoding="utf-8")
    print(f"wrote {args.outdir}/ablation_report.md and top100_audit.md")
    print("\n" + abl)


if __name__ == "__main__":
    main()
