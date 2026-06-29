#!/usr/bin/env python3
"""Targeted diagnostics for the two open technical concerns + Top-20 review sheet.

Measurement only (frozen architecture). Answers:

  Concern #1 — capability_match dominance: is it FRAGILE (rests on rare-skill IDF
      boost or a single capability) or ROBUST (diverse capability evidence)?
        * rarity-sensitivity: re-rank with IDF flattened; measure top-100 overlap.
        * capability diversity: how many of 6 capabilities each top-20 candidate hits.

  Concern #2 — behavioral overpowering technical fit: re-rank with behavioral
      disabled; flag any top-50 candidate "carried" by behavioral (big drop) or
      ranked above a stronger-capability candidate.

Also writes reports/top20_review.md — a clean, recruiter-facing review sheet.

Run: python challenge/diagnose.py --candidates PATH [--limit N]
"""

from __future__ import annotations

import argparse
from pathlib import Path

from lab import build_idf, load, rank_all, _swap_attribution, _cert
from role_dna import SENIOR_AI_ENGINEER as JD


def cap_hits(cand) -> int:
    """How many of the 6 capabilities have >=1 matching skill (diversity proxy)."""
    names = [(s.get("name") or "").lower() for s in cand.get("skills") or []]
    return sum(1 for cap in JD.capabilities if any(any(m in n for m in cap.members) for n in names))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates", type=Path, required=True)
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--outdir", type=Path, default=Path("challenge/reports"))
    args = ap.parse_args()

    cands = load(args.candidates, args.limit)
    by_id = {c.get("candidate_id"): c for c in cands}
    idf = build_idf(cands)
    print(f"loaded {len(cands):,} candidates")

    base = rank_all(cands, JD, idf)
    base_ids = [s.candidate_id for s in base]
    base_rank = {c: i for i, c in enumerate(base_ids)}
    b100, b20, b50 = set(base_ids[:100]), set(base_ids[:20]), set(base_ids[:50])

    # ---- Concern #1a: rarity sensitivity --------------------------------- #
    flat = rank_all(cands, JD, {k: 1.0 for k in idf})
    f_ids = [s.candidate_id for s in flat]
    f100, f20 = set(f_ids[:100]), set(f_ids[:20])
    print("\n#1a RARITY SENSITIVITY (flatten IDF -> rare skills no longer boosted)")
    print(f"   top-100 overlap {len(b100 & f100)}/100 | top-20 overlap {len(b20 & f20)}/20")
    print("   high overlap => dominance is NOT driven by rare-skill weighting (robust);"
          " low overlap => fragile.")

    # ---- Concern #1b: capability diversity in top-20 --------------------- #
    hits = [cap_hits(by_id[c]) for c in base_ids[:20]]
    print("\n#1b CAPABILITY DIVERSITY in top-20 (capabilities hit, of 6)")
    print(f"   min {min(hits)} | median {sorted(hits)[len(hits)//2]} | max {max(hits)} | "
          f"single-capability candidates: {sum(1 for h in hits if h <= 1)}")
    print("   higher => top ranks rest on broad evidence, not one lucky skill.")

    # ---- Concern #2: behavioral overpowering ----------------------------- #
    boff = rank_all(cands, JD, idf, disable=frozenset({"behavioral"}))
    boff_rank = {s.candidate_id: i for i, s in enumerate(boff)}
    print("\n#2 BEHAVIORAL EDGE-CASES (disable behavioral, see who was 'carried')")
    carried = []
    for c in b50:
        drop = boff_rank[c] - base_rank[c]   # +ve => falls without behavioral
        if drop >= 15:
            carried.append((base_rank[c] + 1, boff_rank[c] + 1, drop, c))
    carried.sort()
    if carried:
        for r, r2, d, c in carried[:8]:
            p = by_id[c]["profile"]
            print(f"   rank {r:2d} -> {r2:2d} (+{d}) {p['current_title'][:28]:28s} "
                  f"caps={cap_hits(by_id[c])}/6  (behavioral-carried)")
    else:
        print("   none: no top-50 candidate falls >=15 places without behavioral "
              "=> behavioral is not overpowering technical fit at the head.")
    # also: any top-20 with weak capability evidence?
    weak = [(base_rank[c] + 1, by_id[c]["profile"]["current_title"], cap_hits(by_id[c]))
            for c in b20 if cap_hits(by_id[c]) <= 2]
    print(f"   top-20 with <=2 capabilities hit: {weak if weak else 'none'}")

    # ---- Top-50 review sheet --------------------------------------------- #
    out = ["# Top-50 Review Sheet (for recruiter judgment)\n",
           "For each: score, certainty, why-it-beats-the-next, capability breadth. "
           "Mark agree/disagree in the last column.\n",
           "| # | candidate | title | yrs | score | cert | caps/6 | why > next | agree? |",
           "|---|---|---|---|---|---|---|---|---|"]
    for i, s in enumerate(base[:50]):
        c = by_id[s.candidate_id]
        p = c["profile"]
        why = ""
        if i + 1 < len(base):
            comp, drop, hv, lv = _swap_attribution(s, base[i + 1])
            why = f"{comp} ({hv:.2f}v{lv:.2f})"
        out.append(f"| {i+1} | {s.candidate_id} | {p['current_title'][:26]} | "
                   f"{p['years_of_experience']:.1f} | {s.score:.4f} | {_cert(s.certainty)} | "
                   f"{cap_hits(c)} | {why} |  |")
    args.outdir.mkdir(parents=True, exist_ok=True)
    (args.outdir / "top50_review.md").write_text("\n".join(out), encoding="utf-8")
    print(f"\nwrote {args.outdir}/top50_review.md")


if __name__ == "__main__":
    main()
