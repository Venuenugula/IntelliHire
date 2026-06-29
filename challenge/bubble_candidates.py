#!/usr/bin/env python3
"""Candidate-level boundary inspection. ANALYSIS ONLY — engine unchanged (weight
variants applied at runtime, restored). Answers the recruiter-grade questions:

  Q1 capability overestimated? — inspect the assess=0-but-IN candidates vs the
     assess-rich-but-OUT ones at the boundary: are their capability skills REAL
     (endorsed, long-held) or sprinkled?
  Q2 experience prior too strong? — the 4.5y candidate that jumps 39 places when
     the prior is removed: full profile vs an in-band neighbour.
  Q3 WHICH candidates does assessment_up move (not how many)? — top-100 set diff,
     characterised: better engineers or assessment specialists with weak careers?
  Q4 interactions — assessment_up x text_down, assessment_up x behavioral_neutral:
     cancel or amplify?

Run: python challenge/bubble_candidates.py --candidates PATH
"""

from __future__ import annotations

import argparse
import statistics as st
from dataclasses import replace as dreplace
from pathlib import Path

import scoring
from lab import build_idf, load, rank_all
from role_dna import CAPABILITIES, SENIOR_AI_ENGINEER as JD

CAP_MEMBERS = {m for cap in CAPABILITIES for m in cap.members}


def reweight(orig, key, new):
    others = {k: v for k, v in orig.items() if k != key}
    s = sum(others.values())
    w = {k: v / s * (1.0 - new) for k, v in others.items()}
    w[key] = new
    return w


def top100(scored):
    return {s.candidate_id for s in scored[:100]}


def career_len(c):
    return len(c.get("career_history") or [])


def card(c, sc, rank):
    p = c["profile"]; sig = c["redrob_signals"]
    print(f"\n  ── rank {rank} | {c['candidate_id']} | {p['current_title']} | {p['years_of_experience']}y | score {sc.score:.4f}")
    print(f"     summary: {(p.get('summary') or '')[:150]}")
    print(f"     career : {[(j['title'], j['duration_months']) for j in c.get('career_history') or []]}")
    capskills = [(s['name'], s.get('proficiency'), s.get('endorsements'), s.get('duration_months'))
                 for s in c.get('skills') or [] if any(m in (s.get('name') or '').lower() for m in CAP_MEMBERS)]
    print(f"     cap-skills (name,prof,endorse,dur): {capskills}")
    print(f"     capability breakdown: {{{', '.join(f'{k}:{v:.2f}' for k,v in (sc.features[1].detail or {}).items() if v>0.01)}}}")
    print(f"     assessments: {sig.get('skill_assessment_scores') or {}}")
    print(f"     behavioral : resp={sig['recruiter_response_rate']:.2f} open={bool(sig.get('open_to_work_flag'))} saved={sig['saved_by_recruiters_30d']} interview={sig['interview_completion_rate']:.2f}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates", type=Path, required=True)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()
    cands = load(args.candidates, args.limit)
    idf = build_idf(cands)
    by_id = {c.get("candidate_id"): c for c in cands}

    base = rank_all(cands, JD, idf)
    rank = {s.candidate_id: i + 1 for i, s in enumerate(base)}
    scd = {s.candidate_id: s for s in base}

    print("=" * 78)
    print("Q1 — capability overestimated? assess=0-IN (96,97) vs assess-rich-OUT (105,106)")
    print("=" * 78)
    for cid in ["CAND_0098846", "CAND_0018722", "CAND_0006418", "CAND_0014234"]:
        if cid in by_id:
            card(by_id[cid], scd[cid], rank[cid])

    print("\n" + "=" * 78)
    print("Q2 — experience prior too strong? the 4.5y that jumps 101->62 vs in-band neighbour")
    print("=" * 78)
    for cid in ["CAND_0056881", "CAND_0061257"]:  # 4.5y bubble-out vs rank-99 8.0y
        if cid in by_id:
            card(by_id[cid], scd[cid], rank[cid])

    print("\n" + "=" * 78)
    print("Q3 — WHICH candidates does assessment_up move (top-100 set diff)?")
    print("=" * 78)
    orig = dict(scoring._ADDITIVE_WEIGHTS)
    scoring._ADDITIVE_WEIGHTS = reweight(orig, "assessment_evidence", 0.28)
    au = rank_all(cands, JD, idf)
    scoring._ADDITIVE_WEIGHTS = orig
    au_rank = {s.candidate_id: i + 1 for i, s in enumerate(au)}
    enter = top100(au) - top100(base)
    leave = top100(base) - top100(au)

    def describe(idset, label):
        rows = [(by_id[c], scd[c]) for c in idset]
        caps = [s.additive["capability_match"] for _, s in rows]
        ass = [s.additive["assessment_evidence"] for _, s in rows]
        cl = [career_len(c) for c, _ in rows]
        print(f"\n  {label} ({len(idset)}): median capability {st.median(caps):.3f}, "
              f"median assessment {st.median(ass):.3f}, median #roles {st.median(cl):.1f}")
        for c, s in sorted(rows, key=lambda r: -r[1].additive['assessment_evidence']):
            print(f"    {c['candidate_id']} {c['profile']['current_title'][:24]:24s} "
                  f"{c['profile']['years_of_experience']:.1f}y cap={s.additive['capability_match']:.3f} "
                  f"ass={s.additive['assessment_evidence']:.3f} roles={career_len(c)} "
                  f"base#{rank[c['candidate_id']]}->au#{au_rank[c['candidate_id']]}")
    describe(enter, "ENTER under assessment_up")
    describe(leave, "LEAVE under assessment_up")

    print("\n" + "=" * 78)
    print("Q4 — interaction effects (top-100 churn vs baseline)")
    print("=" * 78)
    base100 = top100(base)

    def churn(weights=None, disable=frozenset()):
        if weights:
            scoring._ADDITIVE_WEIGHTS = weights
        sc = rank_all(cands, JD, idf, disable=disable)
        scoring._ADDITIVE_WEIGHTS = orig
        return len(top100(sc) - base100)

    a_up = reweight(orig, "assessment_evidence", 0.28)
    a_up_t_down = reweight(a_up, "text_relevance", 0.09)
    print(f"  assessment_up alone           : churn {churn(a_up)}")
    print(f"  text_down alone               : churn {churn(reweight(orig,'text_relevance',0.09))}")
    print(f"  assessment_up + text_down     : churn {churn(a_up_t_down)}  (amplify if > each alone)")
    print(f"  behavioral_neutral alone      : churn {churn(disable=frozenset({'behavioral'}))}")
    scoring._ADDITIVE_WEIGHTS = a_up
    cc = len(top100(rank_all(cands, JD, idf, disable=frozenset({'behavioral'}))) - base100)
    scoring._ADDITIVE_WEIGHTS = orig
    print(f"  assessment_up + behavioral_neutral: churn {cc}")


if __name__ == "__main__":
    main()
