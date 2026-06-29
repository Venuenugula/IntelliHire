#!/usr/bin/env python3
"""Career-trajectory probe (Phase-1 understanding — the gating measurement).

The decisive question (per the 'ordering > filtering' insight): does career
trajectory vary *within* the engineering-title population? If yes, it is a real
ORDERING signal for the ~30k engineers competing for 100 slots. If engineers all
have uniformly coherent careers, trajectory is just another filter and adds
nothing beyond the title gate.

Hypotheses:
  H5  career coherence (fraction of prior roles on-target) varies within engineers
      and is near-1 for genuine, low for honeypots.
  H6  trajectory signals (transition-in, seniority growth, tenure stability)
      TRIANGULATE with the already-proven fit signals (assessments,
      saved_by_recruiters) — i.e. high-coherence engineers are also behaviorally
      stronger ⇒ coherence is a genuine quality axis, not noise.

Run: python challenge/probe_career.py --candidates PATH [--limit N]
"""

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from forensics import _matches_any, _parse_date, _quantiles, Forensics

# seniority ladder — checked high-to-low so 'principal' beats 'engineer'
SENIORITY_RULES = [
    (["principal", "staff", "distinguished", "fellow"], 4),
    (["lead", "head ", "head of", "director", "vp", "chief", "architect", "manager"], 3),
    (["senior", "sr "], 2),
    (["intern", "trainee", "graduate"], 0),
]


def seniority(title: str) -> int:
    t = title.lower()
    for kws, lvl in SENIORITY_RULES:
        if _matches_any(t, kws):
            return lvl
    return 1  # default IC


class CareerProbe:
    def __init__(self) -> None:
        self.f = Forensics()
        self.n = 0
        # within-engineering distributions
        self.eng_on_target_frac: list[float] = []
        self.eng_seniority_trend: Counter[str] = Counter()
        self.eng_transitioned_in = 0
        self.eng_pure = 0          # every prior role on-target
        self.eng_hopper = 0
        self.eng_total = 0
        self.eng_tenure: list[float] = []
        # coherence x fit triangulation (engineering only), bucketed by coherence
        self.tri: defaultdict[str, defaultdict[str, list]] = defaultdict(lambda: defaultdict(list))
        # honeypot comparison
        self.hp_on_target_frac: list[float] = []
        self.hp_transitioned_in = 0
        self.hp_total = 0
        # global trajectory shapes
        self.shape: Counter[str] = Counter()

    def _bucket(self, title: str) -> str:
        return self.f._bucket_title(title or "")

    def add(self, c: dict[str, Any]) -> None:
        self.n += 1
        p = c.get("profile") or {}
        sig = c.get("redrob_signals") or {}
        career = c.get("career_history") or []
        cur_bucket = self._bucket(p.get("current_title") or "")

        roles = [j for j in career if j.get("title")]
        roles.sort(key=lambda j: _parse_date(j.get("start_date")) or date(1970, 1, 1))
        if not roles:
            return
        buckets = [self._bucket(j["title"]) for j in roles]
        on_target = [b == "engineering" for b in buckets]
        frac = sum(on_target) / len(on_target)
        sl = [seniority(j["title"]) for j in roles]
        trend = sl[-1] - sl[0]
        durs = [j.get("duration_months") or 0 for j in roles]
        avg_tenure = sum(durs) / len(durs) if durs else 0
        transitioned_in = (not on_target[0]) and on_target[-1] and len(roles) >= 2
        hopper = len(roles) >= 3 and max(durs) < 18

        # global shape label
        if all(on_target):
            self.shape["pure_engineering"] += 1
        elif transitioned_in:
            self.shape["transitioned_into_eng"] += 1
        elif on_target[-1]:
            self.shape["mixed_now_eng"] += 1
        elif any(on_target):
            self.shape["drifted_out_of_eng"] += 1
        else:
            self.shape["never_eng"] += 1

        # within engineering (current title) ------------------------------
        if cur_bucket == "engineering":
            self.eng_total += 1
            self.eng_on_target_frac.append(frac)
            self.eng_tenure.append(avg_tenure)
            self.eng_seniority_trend["up" if trend > 0 else ("flat" if trend == 0 else "down")] += 1
            if transitioned_in:
                self.eng_transitioned_in += 1
            if all(on_target):
                self.eng_pure += 1
            if hopper:
                self.eng_hopper += 1
            # triangulation: bucket engineers by coherence, look at fit signals
            cband = "coherent(>=0.8)" if frac >= 0.8 else ("mixed(0.4-0.8)" if frac >= 0.4 else "incoherent(<0.4)")
            t = self.tri[cband]
            t["saved_by_recruiters_30d"].append(float(sig.get("saved_by_recruiters_30d", 0)))
            t["search_appearance_30d"].append(float(sig.get("search_appearance_30d", 0)))
            t["n_assessments"].append(float(len(sig.get("skill_assessment_scores") or {})))
            t["interview_completion_rate"].append(float(sig.get("interview_completion_rate", 0)))
            t["avg_tenure"].append(avg_tenure)

        # honeypot comparison (off-target current title) -------------------
        if cur_bucket in ("non-technical", "non-software-eng"):
            self.hp_total += 1
            self.hp_on_target_frac.append(frac)
            if transitioned_in:
                self.hp_transitioned_in += 1


def _m(xs):
    q = _quantiles(xs)
    return q.get("median", 0) if q else 0


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates", type=Path, required=True)
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    pr = CareerProbe()
    with open(args.candidates) as fh:
        for i, line in enumerate(fh):
            if args.limit and i >= args.limit:
                break
            line = line.strip()
            if line:
                pr.add(json.loads(line))

    n = pr.n
    print(f"\n{'='*72}\nCAREER-TRAJECTORY PROBE  ({n:,} candidates)\n{'='*72}\n")

    print("GLOBAL CAREER SHAPE")
    for k, v in pr.shape.most_common():
        print(f"  {k:24s} {v:7,}  {100*v/n:5.1f}%")

    print(f"\nH5 — coherence WITHIN engineering-title population (n={pr.eng_total:,})")
    cf = pr.eng_on_target_frac
    q = _quantiles(cf)
    if q:
        print(f"  on_target_fraction: min {q['min']:.2f}  p25 {q['p25']:.2f}  median {q['median']:.2f}  "
              f"mean {q['mean']:.2f}  p75 {q['p75']:.2f}  max {q['max']:.2f}")
    pure = 100 * pr.eng_pure / pr.eng_total if pr.eng_total else 0
    print(f"  pure-engineering career: {pure:.1f}%   transitioned-in: {100*pr.eng_transitioned_in/pr.eng_total:.1f}%   "
          f"job-hopper: {100*pr.eng_hopper/pr.eng_total:.1f}%")
    print(f"  seniority trend: " + ", ".join(f"{k}={100*v/pr.eng_total:.0f}%" for k, v in pr.eng_seniority_trend.most_common()))
    print(f"  >>> VARIANCE CHECK: if median≈1.0 AND p25≈1.0, coherence is near-constant ⇒ weak ordering signal.")
    print(f"  >>> if p25 << median, engineers genuinely differ in coherence ⇒ real ordering signal.")

    print(f"\nH6 — does coherence TRIANGULATE with proven fit signals? (engineering only)")
    print(f"  {'coherence band':18s}{'n':>9s}{'saved30':>10s}{'search30':>10s}{'#assess':>9s}{'interview':>11s}{'tenure_mo':>11s}")
    for band in ["coherent(>=0.8)", "mixed(0.4-0.8)", "incoherent(<0.4)"]:
        t = pr.tri[band]
        cnt = len(t["saved_by_recruiters_30d"])
        if cnt:
            print(f"  {band:18s}{cnt:9,}{_m(t['saved_by_recruiters_30d']):10.1f}{_m(t['search_appearance_30d']):10.1f}"
                  f"{_m(t['n_assessments']):9.1f}{_m(t['interview_completion_rate']):11.2f}{_m(t['avg_tenure']):11.1f}")

    print(f"\nHONEYPOT comparison (off-target current title, n={pr.hp_total:,})")
    q2 = _quantiles(pr.hp_on_target_frac)
    if q2:
        print(f"  on_target_fraction: median {q2['median']:.2f}  mean {q2['mean']:.2f}  "
              f"(vs engineering median {q['median']:.2f})")
    print(f"  transitioned-into-eng: {100*pr.hp_transitioned_in/pr.hp_total:.1f}%  "
          f"(off-target person now claims eng path)")
    print()


if __name__ == "__main__":
    main()
