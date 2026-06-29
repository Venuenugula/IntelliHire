#!/usr/bin/env python3
"""Hypothesis-validation probe over candidates.jsonl (Phase-1 understanding, NOT the engine).

Tests four falsifiable hypotheses about the synthetic generator's latent
ground-truth structure. Output is evidence to drive the ranking design — we do
NOT design features until these are measured.

H1  behavioral signals encode FIT (not just availability) — do recruiter-interest
    signals differ between on-target vs off-target/honeypot profiles?
H2  skill_assessment_scores is a TRUTH ORACLE — do honeypots have empty/low
    assessment coverage on JD-relevant skills while genuine candidates don't?
H3  summary/career TEXT betrays honeypots — boilerplate-template summaries and
    off-target career histories concentrate in the honeypot population.
H4  company/education/cert distributions carry signal.

Run: python challenge/probe.py [--candidates PATH] [--limit N]
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from forensics import (  # reuse the validated classifiers
    AI_BUZZ_SKILL_PATTERNS, AI_CORE_SKILL_PATTERNS, JD_EXP_MAX, JD_EXP_MIN,
    SERVICES_FIRMS, _matches_any, _quantiles, Forensics,
)

# Boilerplate-summary fingerprints observed in confirmed honeypots.
BOILERPLATE_MARKERS = [
    "driving outcomes in my domain",
    "typical responsibilities of the role",
    "team management, stakeholder communication",
    "built strong functional expertise",
]


def _bucket(c: dict[str, Any], f: Forensics) -> str:
    return f._bucket_title((c.get("profile") or {}).get("current_title") or "")


def _ai_skills(skills: list[dict]) -> list[dict]:
    out = []
    for s in skills:
        nm = (s.get("name") or "").lower()
        if _matches_any(nm, AI_CORE_SKILL_PATTERNS + AI_BUZZ_SKILL_PATTERNS):
            out.append(s)
    return out


def _ai_skill_credibility(ai: list[dict]) -> float:
    # endorsements weighted by sqrt(duration) — rewards real, long-held, endorsed skills
    tot = 0.0
    for s in ai:
        e = s.get("endorsements") or 0
        d = s.get("duration_months") or 0
        tot += e * (d ** 0.5)
    return tot


class Probe:
    def __init__(self) -> None:
        self.f = Forensics()  # only for its _bucket_title classifier
        self.n = 0
        # population tags
        self.tag_counts: Counter[str] = Counter()
        # per-population accumulators for behavioral + skill stats
        self.acc: defaultdict[str, defaultdict[str, list]] = defaultdict(lambda: defaultdict(list))
        # assessment coverage
        self.assess_nonempty_by_bucket: Counter[str] = Counter()
        self.bucket_total: Counter[str] = Counter()
        # boilerplate
        self.boiler_by_pop: Counter[str] = Counter()
        # companies / industries / edu
        self.companies: Counter[str] = Counter()
        self.industries: Counter[str] = Counter()
        self.services_only = 0
        # cross: does assessment presence depend on having genuine skills?
        self.assess_and_eng = 0
        self.assess_and_offtarget = 0

    def population(self, c, bucket, in_band, ai, n_ai, boiler) -> str:
        """Coarse genuine/honeypot/neutral tag from title+experience+skill-count."""
        off_target = bucket in ("non-technical", "non-software-eng")
        if off_target and n_ai >= 4:
            return "honeypot"             # off-target title stacked with AI skills
        if bucket == "engineering" and in_band and n_ai >= 1:
            return "genuine_candidate"    # on-target, in-band, some AI
        if bucket == "engineering":
            return "engineer_other"
        return "neutral"

    def add(self, c: dict[str, Any]) -> None:
        self.n += 1
        p = c.get("profile") or {}
        sig = c.get("redrob_signals") or {}
        skills = c.get("skills") or []
        career = c.get("career_history") or []
        bucket = _bucket(c, self.f)
        yrs = p.get("years_of_experience")
        in_band = isinstance(yrs, (int, float)) and JD_EXP_MIN <= yrs <= JD_EXP_MAX
        ai = _ai_skills(skills)
        n_ai = len(ai)
        summary = (p.get("summary") or "").lower()
        boiler = _matches_any(summary, BOILERPLATE_MARKERS)

        pop = self.population(c, bucket, in_band, ai, n_ai, boiler)
        self.tag_counts[pop] += 1

        # H2 assessment coverage by bucket
        assess = sig.get("skill_assessment_scores") or {}
        self.bucket_total[bucket] += 1
        if assess:
            self.assess_nonempty_by_bucket[bucket] += 1
            if bucket == "engineering":
                self.assess_and_eng += 1
            if bucket in ("non-technical", "non-software-eng"):
                self.assess_and_offtarget += 1

        # H3 boilerplate by population
        if boiler:
            self.boiler_by_pop[pop] += 1

        # H1 behavioral + skill stats by population
        a = self.acc[pop]
        for k in ["recruiter_response_rate", "profile_views_received_30d",
                  "saved_by_recruiters_30d", "search_appearance_30d",
                  "profile_completeness_score", "interview_completion_rate"]:
            v = sig.get(k)
            if isinstance(v, (int, float)):
                a[k].append(float(v))
        a["ai_skill_credibility"].append(_ai_skill_credibility(ai))
        a["n_assessments"].append(float(len(assess)))
        a["github"].append(float(sig.get("github_activity_score", -1)))

        # H4 companies / industries
        for j in career:
            co = (j.get("company") or "").strip()
            if co:
                self.companies[co] += 1
        ind = (p.get("current_industry") or "").strip()
        if ind:
            self.industries[ind] += 1
        comps = [(j.get("company") or "").lower() for j in career]
        if comps and all(any(s in co for s in SERVICES_FIRMS) for co in comps):
            self.services_only += 1


def _med(xs):
    q = _quantiles(xs)
    return (q.get("median", 0), q.get("mean", 0)) if q else (0, 0)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates", type=Path, default=None)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()
    path = args.candidates
    if not path:
        for cand in Path("challenge_data").rglob("candidates.jsonl"):
            if "MACOSX" not in str(cand):
                path = cand
                break
    if not path or not path.exists():
        raise SystemExit("pass --candidates PATH")

    pr = Probe()
    with open(path) as fh:
        for i, line in enumerate(fh):
            if args.limit and i >= args.limit:
                break
            line = line.strip()
            if line:
                pr.add(json.loads(line))

    n = pr.n
    print(f"\n{'='*72}\nHYPOTHESIS PROBE  ({n:,} candidates)\n{'='*72}\n")

    print("POPULATION TAGS")
    for k, v in pr.tag_counts.most_common():
        print(f"  {k:20s} {v:7,}  {100*v/n:5.1f}%")

    print("\nH2 — skill_assessment_scores coverage by title bucket")
    for b in ["engineering", "non-technical", "non-software-eng", "other"]:
        tot = pr.bucket_total[b]
        nz = pr.assess_nonempty_by_bucket[b]
        print(f"  {b:18s} non-empty assessments: {100*nz/tot if tot else 0:5.1f}%  (n={tot:,})")

    print("\nH3 — boilerplate-template summary rate by population")
    for k in ["honeypot", "genuine_candidate", "engineer_other", "neutral"]:
        tot = pr.tag_counts[k]
        b = pr.boiler_by_pop[k]
        print(f"  {k:20s} boilerplate: {100*b/tot if tot else 0:5.1f}%  (n={tot:,})")

    print("\nH1 — behavioral + skill stats by population (median / mean)")
    cols = ["recruiter_response_rate", "profile_views_received_30d", "saved_by_recruiters_30d",
            "search_appearance_30d", "profile_completeness_score", "interview_completion_rate",
            "ai_skill_credibility", "n_assessments", "github"]
    hdr = "  " + f"{'population':20s}" + "".join(f"{c[:11]:>13s}" for c in cols)
    print(hdr)
    for pop in ["genuine_candidate", "engineer_other", "honeypot", "neutral"]:
        row = f"  {pop:20s}"
        for c in cols:
            med, _ = _med(pr.acc[pop][c])
            row += f"{med:13.2f}"
        print(row)

    print("\nH4 — distributions")
    print(f"  services-firm-only careers: {100*pr.services_only/n:.1f}%")
    print("  top 10 companies:", ", ".join(f"{k}({v:,})" for k, v in pr.companies.most_common(10)))
    print("  top 8 industries:", ", ".join(f"{k}({v:,})" for k, v in pr.industries.most_common(8)))
    print()


if __name__ == "__main__":
    main()
