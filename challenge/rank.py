#!/usr/bin/env python3
"""ChallengeRankingEngine reproduce-command: candidates.jsonl -> submission.csv.

Constraints honored: CPU-only, no network, no GPU, deterministic, <5 min, stdlib-only.

Two streaming passes over the JSONL:
  PASS 1 — corpus skill document-frequency -> IDF (data-driven rarity; no hardcoded
           rarity table). Rare IR/ranking skills outweigh ubiquitous ones.
  PASS 2 — score every candidate (no shortlisting — we score the full pool), keep
           (id, score, reason).
Then: sort by (-score, candidate_id) -> top 100 -> spec CSV -> validate.

Usage:
  python challenge/rank.py --candidates ./candidates.jsonl --out ./submission.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
import time
from pathlib import Path

from role_dna import SENIOR_AI_ENGINEER
from scoring import score_candidate

SUBMISSION_SIZE = 100


def build_idf(path: Path, limit: int = 0) -> tuple[dict[str, float], int]:
    """Document-frequency IDF over lowercased skill names."""
    df: dict[str, int] = {}
    n = 0
    with open(path, encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            if limit and i >= limit:
                break
            line = line.strip()
            if not line:
                continue
            n += 1
            try:
                c = json.loads(line)
            except json.JSONDecodeError:
                continue
            seen = set()
            for s in c.get("skills") or []:
                nm = (s.get("name") or "").lower()
                if nm and nm not in seen:
                    seen.add(nm)
                    df[nm] = df.get(nm, 0) + 1
    # idf normalized so the most common skill ≈ 1.0 and rare skills get a boost
    idf = {k: math.log(1 + n / v) for k, v in df.items()}
    if idf:
        base = min(idf.values())
        idf = {k: v / base for k, v in idf.items()}  # >=1.0; rarer => larger
    return idf, n


def score_all(path: Path, idf: dict[str, float], limit: int = 0) -> list[tuple[str, float, str]]:
    jd = SENIOR_AI_ENGINEER
    out: list[tuple[str, float, str]] = []
    with open(path, encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            if limit and i >= limit:
                break
            line = line.strip()
            if not line:
                continue
            try:
                c = json.loads(line)
            except json.JSONDecodeError:
                continue
            sc = score_candidate(c, jd, idf)
            out.append((sc.candidate_id, sc.score, sc.reason))
    return out


def write_submission(rows: list[tuple[str, float, str]], out: Path) -> list[tuple[str, int, float, str]]:
    # round FIRST so the displayed (4dp) score is what we sort on — then equal
    # displayed scores tie-break by candidate_id ascending (validator requirement).
    rounded = [(cid, round(float(score), 4), reason) for cid, score, reason in rows]
    rounded.sort(key=lambda r: (-r[1], r[0]))
    top = rounded[:SUBMISSION_SIZE]
    final: list[tuple[str, int, float, str]] = []
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["candidate_id", "rank", "score", "reasoning"])
        for rank, (cid, sval, reason) in enumerate(top, start=1):
            w.writerow([cid, rank, f"{sval:.4f}", reason])
            final.append((cid, rank, sval, reason))
    return final


def validate(out: Path) -> list[str]:
    """Run the organizer's own validator if discoverable; else return []."""
    for p in Path("challenge_data").rglob("validate_submission.py"):
        if "MACOSX" in str(p):
            continue
        import importlib.util
        spec = importlib.util.spec_from_file_location("validate_submission", p)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)  # type: ignore
        return mod.validate_submission(str(out))
    return []


def _locate() -> Path | None:
    for p in Path("challenge_data").rglob("candidates.jsonl"):
        if "MACOSX" not in str(p):
            return p
    return None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates", type=Path, default=None)
    ap.add_argument("--out", type=Path, default=Path("challenge/submission.csv"))
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    path = args.candidates or _locate()
    if not path or not path.exists():
        raise SystemExit("Could not find candidates.jsonl — pass --candidates PATH")

    t0 = time.time()
    idf, n = build_idf(path, args.limit)
    print(f"pass1: IDF over {n:,} candidates, {len(idf):,} distinct skills ({time.time()-t0:.1f}s)")
    rows = score_all(path, idf, args.limit)
    print(f"pass2: scored {len(rows):,} candidates ({time.time()-t0:.1f}s)")
    final = write_submission(rows, args.out)
    print(f"wrote {len(final)} rows -> {args.out} ({time.time()-t0:.1f}s)")

    errors = validate(args.out)
    if errors:
        print(f"\nVALIDATION FAILED ({len(errors)}):")
        for e in errors[:10]:
            print(" -", e)
        sys.exit(1)
    print("VALIDATION: submission is valid ✓")
    print("\nTop 10 preview:")
    for cid, rank, score, reason in final[:10]:
        print(f"  {rank:3d}. {cid}  {score:.4f}  {reason[:90]}")


if __name__ == "__main__":
    main()
