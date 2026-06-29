#!/usr/bin/env python3
"""Capability-group ablation + semantic-robustness validation (frozen architecture).

Measurement instruments — they feed MODIFIED RoleDNA / perturbed skill names into
the unchanged engine; no scoring logic changes here.

  A) capability-group ablation — disable each of the 6 capability groups; which
     ones actually move the ranking? Inert groups are simplification candidates.
  B) semantic robustness — does the ranking depend on capability GROUPS or on
     specific keywords? Perturb JD/candidate terminology within a group and
     measure Spearman/Kendall. High stability => grouping genuinely generalizes.

Run: python challenge/validate_rubric.py --candidates PATH [--limit N]
"""

from __future__ import annotations

import argparse
import copy
from dataclasses import replace
from pathlib import Path

from lab import build_idf, load, rank_all, rank_correlation
from role_dna import SENIOR_AI_ENGINEER as JD


def ids(scored):
    return [s.candidate_id for s in scored]


def cap_group_ablation(cands, idf) -> None:
    base = ids(rank_all(cands, JD, idf))
    b100, b20 = set(base[:100]), set(base[:20])
    print("A) CAPABILITY-GROUP ABLATION (disable one group; lower overlap => more important)")
    print(f"   {'group':18s} {'weight':>6} {'top100':>7} {'top20':>6} {'spearman':>9} {'dropped':>8}")
    rows = []
    for cap in JD.capabilities:
        variant = replace(JD, capabilities=tuple(c for c in JD.capabilities if c.key != cap.key))
        ab = ids(rank_all(cands, variant, idf))
        ov100 = len(b100 & set(ab[:100])) / 100
        ov20 = len(b20 & set(ab[:20])) / 20
        rc = rank_correlation(base[:100], ab[:100])
        rows.append((ov100, cap.key, cap.weight, ov20, rc["spearman"], 100 - len(b100 & set(ab[:100]))))
    for ov100, key, w, ov20, sp, dropped in sorted(rows):
        print(f"   {key:18s} {w:>6.2f} {ov100:>6.0%} {ov20:>6.0%} {sp:>9.3f} {dropped:>8}")
    print("   => groups with ~100% overlap & spearman~1.0 are inert: simplify/down-weight candidates.\n")


def _perturb_skills(cands, rename: dict[str, str]):
    """Return a copy of cands with skill names rewritten per `rename` (lowercased keys)."""
    out = []
    for c in cands:
        c2 = dict(c)
        skills = []
        for s in c.get("skills") or []:
            s2 = dict(s)
            nm = (s2.get("name") or "")
            if nm.lower() in rename:
                s2["name"] = rename[nm.lower()]
            skills.append(s2)
        c2["skills"] = skills
        out.append(c2)
    return out


def semantic_robustness(cands, idf) -> None:
    base = ids(rank_all(cands, JD, idf))
    print("B) SEMANTIC ROBUSTNESS (perturb terminology; high spearman/kendall => grouping generalizes)")

    # B1: remove 'langchain' from the JD's llm_tooling members (does a low-cap group matter?)
    new_caps = []
    for cap in JD.capabilities:
        if cap.key == "llm_tooling":
            cap = replace(cap, members=tuple(m for m in cap.members if m != "langchain"))
        new_caps.append(cap)
    jd_nolc = replace(JD, capabilities=tuple(new_caps))
    rc = rank_correlation(base[:100], ids(rank_all(cands, jd_nolc, idf))[:100])
    print(f"   B1 drop 'langchain' from JD  -> top100 overlap {rc['overlap']}/100, spearman {rc['spearman']:.4f}")

    # B2: synonym swap, SAME group + similar corpus rarity (faiss <-> vector search, both retrieval_ir)
    p2 = _perturb_skills(cands, {"vector search": "FAISS"})
    idf2 = build_idf(p2)
    rc = rank_correlation(base[:100], ids(rank_all(p2, jd_nolc if False else JD, idf2))[:100])
    print(f"   B2 candidate 'vector search'->'FAISS' (same group) -> overlap {rc['overlap']}/100, spearman {rc['spearman']:.4f}")

    # B3: cross-rarity swap (bm25 rare -> 'sparse retrieval'); reveals IDF sensitivity within a group
    p3 = _perturb_skills(cands, {"bm25": "sparse retrieval"})
    idf3 = build_idf(p3)
    # 'sparse retrieval' isn't a member -> tests reliance on the exact token
    rc = rank_correlation(base[:100], ids(rank_all(p3, JD, idf3))[:100])
    print(f"   B3 candidate 'bm25'->'sparse retrieval' (UNmapped token) -> overlap {rc['overlap']}/100, spearman {rc['spearman']:.4f}")
    print("   B3 low stability is EXPECTED & informative: unmapped synonyms lose credit -> add to members.\n")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates", type=Path, required=True)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()
    cands = load(args.candidates, args.limit)
    idf = build_idf(cands)
    print(f"loaded {len(cands):,} candidates\n")
    cap_group_ablation(cands, idf)
    semantic_robustness(cands, idf)


if __name__ == "__main__":
    main()
