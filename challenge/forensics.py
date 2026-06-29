#!/usr/bin/env python3
"""Forensic EDA over the Redrob challenge candidate dataset (candidates.jsonl).

PURPOSE
-------
This is *not* the ranker. It is the study that grounds the ranker. The challenge
rules tell us the evaluation constraints (CPU-only, no network, <5 min, top-100,
keyword-stuffer honeypots, behavioral down-weighting); this script tells us where
the *signal actually is* in the 100k-candidate pool so the ChallengeRankingEngine
can be designed around data rather than assumptions.

Streams the file line-by-line (the JSONL is ~487 MB) and accumulates counters in a
single pass. Writes a Markdown EDA report and prints a summary.

Run:
    python challenge/forensics.py                       # auto-locate dataset
    python challenge/forensics.py --candidates PATH      # explicit path
    python challenge/forensics.py --limit 5000           # quick sample run

The CONFIG sets at the top (engineering vs non-technical titles, AI-core skills,
services-firm names, JD experience band) are deliberately explicit and tunable —
they are the first draft of the ranking rubric, not hidden magic.
"""

from __future__ import annotations

import argparse
import json
import math
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any, Iterable

# --------------------------------------------------------------------------- #
# CONFIG — first-draft rubric inputs (tune as the data tells us to)
# --------------------------------------------------------------------------- #

# The JD: Senior AI Engineer, 5-9 yrs, retrieval/ranking/embeddings, product cos.
JD_EXP_MIN, JD_EXP_MAX = 5.0, 9.0

# Skills that signal genuine modern ML/IR depth the JD asks for.
AI_CORE_SKILL_PATTERNS = [
    "embedding", "retrieval", "ranking", "rerank", "learning to rank", "ltr",
    "vector", "faiss", "pinecone", "weaviate", "qdrant", "milvus", "opensearch",
    "elasticsearch", "bm25", "semantic search", "rag", "recommendation",
    "recommender", "information retrieval", "nlp", "transformer", "llm",
    "fine-tun", "fine tun", "lora", "qlora", "peft", "sentence-transformer",
    "bert", "bge", "e5", "sentence transformer",
]

# "Looks AI but shallow" keyword-stuffer vocabulary (framework-enthusiast tells).
AI_BUZZ_SKILL_PATTERNS = [
    "langchain", "llamaindex", "crewai", "autogen", "agent", "mcp", "rag",
    "prompt engineering", "openai api", "chatgpt", "gemini api", "gpt",
]

# Title buckets (substring match on lowercased current_title).
# Software/ML engineering — what the JD actually wants.
SOFTWARE_ENG_TITLE_PATTERNS = [
    "software", "developer", "ml engineer", "machine learning", "ai engineer",
    "data scien", "data engineer", "analytics engineer", "research engineer",
    "swe", "sde", "backend", "frontend", "full stack", "fullstack", "devops",
    "cloud engineer", "qa engineer", "site reliability", "sre", "mobile developer",
    "programmer", "platform engineer", "ml ", "recommendation systems engineer",
]
# "Engineer" but NOT software — Mechanical/Civil/etc. are off-target for this JD
# AND are honeypots when stacked with AI skills. Checked BEFORE software match.
OTHER_ENG_TITLE_PATTERNS = [
    "mechanical engineer", "civil engineer", "electrical engineer",
    "chemical engineer", "biomedical", "automobile", "structural engineer",
    "industrial engineer", "aerospace", "petroleum", "mining engineer",
]
NONTECH_TITLE_PATTERNS = [
    "marketing", "sales", "content", "hr ", "hr manager", "human resource",
    "recruiter", "talent acquisition", "account manager", "business development",
    "business analyst", "customer success", "customer support", "operations manager",
    "project manager", "product manager", "writer", "designer", "graphic",
    "finance", "accountant", "consultant", "teacher", "professor", "lecturer", "intern",
]

# Indian-services firms the JD explicitly down-weights ("only worked at consulting").
SERVICES_FIRMS = {
    "tcs", "tata consultancy", "infosys", "wipro", "accenture", "cognizant",
    "capgemini", "tech mahindra", "hcl", "mindtree", "ltimindtree", "mphasis",
    "igate", "syntel", "hexaware", "birlasoft", "persistent",
}

# JD-preferred locations (Noida/Pune + nearby metros).
PREFERRED_LOCATIONS = ["noida", "pune", "hyderabad", "mumbai", "delhi", "gurgaon", "gurugram", "ncr", "bengaluru", "bangalore"]

# Pure-research / non-NLP-domain tells (JD disqualifiers).
RESEARCH_ONLY_PATTERNS = ["research scientist", "phd", "postdoc", "research fellow", "academic"]
OFFDOMAIN_SKILL_PATTERNS = ["computer vision", "image classification", "object detection", "speech recognition", "robotics", "slam", "lidar"]

# Treat the dataset's "today" as the latest last_active seen (it's synthetic);
# overridden after the pass if we find a max date.
TODAY = date(2026, 6, 29)

# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #


def _matches_any(text: str, patterns: Iterable[str]) -> bool:
    t = text.lower()
    return any(p in t for p in patterns)


def _parse_date(s: Any) -> date | None:
    if not isinstance(s, str) or len(s) < 10:
        return None
    try:
        return date.fromisoformat(s[:10])
    except ValueError:
        return None


def _quantiles(values: list[float]) -> dict[str, float]:
    if not values:
        return {}
    v = sorted(values)
    n = len(v)

    def q(p: float) -> float:
        if n == 1:
            return v[0]
        idx = p * (n - 1)
        lo = math.floor(idx)
        hi = math.ceil(idx)
        if lo == hi:
            return v[lo]
        return v[lo] + (v[hi] - v[lo]) * (idx - lo)

    return {
        "min": v[0], "p10": q(0.10), "p25": q(0.25), "median": q(0.50),
        "mean": sum(v) / n, "p75": q(0.75), "p90": q(0.90), "max": v[-1],
    }


# --------------------------------------------------------------------------- #
# accumulator
# --------------------------------------------------------------------------- #


class Forensics:
    def __init__(self) -> None:
        self.n = 0
        # field completeness: counts of present-and-nonempty
        self.present: Counter[str] = Counter()
        # distributions
        self.titles: Counter[str] = Counter()
        self.title_bucket: Counter[str] = Counter()
        self.industries: Counter[str] = Counter()
        self.locations: Counter[str] = Counter()
        self.countries: Counter[str] = Counter()
        self.edu_tier: Counter[str] = Counter()
        self.work_mode: Counter[str] = Counter()
        self.exp_band: Counter[str] = Counter()
        self.skill_freq: Counter[str] = Counter()
        self.skills_per_cand: list[int] = []
        self.cert_per_cand: list[int] = []
        self.exp_years: list[float] = []
        # numeric redrob signals -> list of values
        self.sig_num: defaultdict[str, list[float]] = defaultdict(list)
        # boolean redrob signals -> true count
        self.sig_bool_true: Counter[str] = Counter()
        self.sig_bool_total: Counter[str] = Counter()
        # sentinel "-1 means missing" signals
        self.github_linked = 0
        self.offer_history = 0
        # recency
        self.last_active_days: list[int] = []
        self.max_last_active: date | None = None
        # honeypot / disqualifier tallies
        self.honeypot_nontech_title_ai_skills = 0
        self.keyword_stuffer_low_trust = 0
        self.services_only_career = 0
        self.research_only = 0
        self.offdomain_only = 0
        self.jobhopper = 0
        # "ideal" funnel
        self.in_exp_band = 0
        self.eng_title = 0
        self.has_ai_core = 0
        self.ideal_candidate = 0
        # examples for the report
        self.honeypot_examples: list[dict[str, Any]] = []
        self.ideal_examples: list[dict[str, Any]] = []

    # -- per-record ------------------------------------------------------- #
    def add(self, c: dict[str, Any]) -> None:
        self.n += 1
        profile = c.get("profile") or {}
        career = c.get("career_history") or []
        edu = c.get("education") or []
        skills = c.get("skills") or []
        certs = c.get("certifications") or []
        langs = c.get("languages") or []
        sig = c.get("redrob_signals") or {}

        # completeness (present & non-empty)
        def mark(key: str, val: Any) -> None:
            ok = val not in (None, "", [], {}, "unknown")
            if ok:
                self.present[key] += 1

        mark("profile.summary", profile.get("summary"))
        mark("profile.headline", profile.get("headline"))
        mark("profile.current_title", profile.get("current_title"))
        mark("profile.current_industry", profile.get("current_industry"))
        mark("profile.location", profile.get("location"))
        mark("career_history", career)
        mark("education", edu)
        mark("skills", skills)
        mark("certifications", certs)
        mark("languages", langs)

        # title / industry / location
        title = (profile.get("current_title") or "").strip()
        if title:
            self.titles[title] += 1
            self.title_bucket[self._bucket_title(title)] += 1
        ind = (profile.get("current_industry") or "").strip()
        if ind:
            self.industries[ind] += 1
        loc = (profile.get("location") or "").strip()
        if loc:
            self.locations[loc] += 1
        ctry = (profile.get("country") or "").strip()
        if ctry:
            self.countries[ctry] += 1

        # experience
        yrs = profile.get("years_of_experience")
        if isinstance(yrs, (int, float)):
            self.exp_years.append(float(yrs))
            self.exp_band[self._exp_band(float(yrs))] += 1

        # education tier
        for e in edu:
            self.edu_tier[(e.get("tier") or "unknown")] += 1

        # skills
        self.skills_per_cand.append(len(skills))
        self.cert_per_cand.append(len(certs))
        skill_names = []
        for s in skills:
            name = (s.get("name") or "").strip()
            if name:
                self.skill_freq[name.lower()] += 1
                skill_names.append(name.lower())

        # redrob signals
        self._add_signals(sig)

        # derived role-fit flags
        self._classify(profile, career, skills, skill_names, title, yrs, c)

    def _bucket_title(self, title: str) -> str:
        # order matters: other-engineering & non-technical are checked before
        # software so "Mechanical Engineer" / "Business Analyst" don't leak in.
        if _matches_any(title, OTHER_ENG_TITLE_PATTERNS):
            return "non-software-eng"
        if _matches_any(title, NONTECH_TITLE_PATTERNS):
            return "non-technical"
        if _matches_any(title, SOFTWARE_ENG_TITLE_PATTERNS):
            return "engineering"
        return "other"

    @staticmethod
    def _exp_band(y: float) -> str:
        if y < 2:
            return "0-2"
        if y < 5:
            return "2-5"
        if y <= 9:
            return "5-9 (JD band)"
        return "9+"

    def _add_signals(self, sig: dict[str, Any]) -> None:
        numeric = [
            "profile_completeness_score", "profile_views_received_30d",
            "applications_submitted_30d", "recruiter_response_rate",
            "avg_response_time_hours", "connection_count", "endorsements_received",
            "notice_period_days", "search_appearance_30d", "saved_by_recruiters_30d",
            "interview_completion_rate", "github_activity_score", "offer_acceptance_rate",
        ]
        for k in numeric:
            v = sig.get(k)
            if isinstance(v, (int, float)):
                self.sig_num[k].append(float(v))
        for k in ["open_to_work_flag", "willing_to_relocate", "verified_email", "verified_phone", "linkedin_connected"]:
            v = sig.get(k)
            if isinstance(v, bool):
                self.sig_bool_total[k] += 1
                if v:
                    self.sig_bool_true[k] += 1
        wm = sig.get("preferred_work_mode")
        if isinstance(wm, str):
            self.work_mode[wm] += 1
        if isinstance(sig.get("github_activity_score"), (int, float)) and sig["github_activity_score"] >= 0:
            self.github_linked += 1
        if isinstance(sig.get("offer_acceptance_rate"), (int, float)) and sig["offer_acceptance_rate"] >= 0:
            self.offer_history += 1
        la = _parse_date(sig.get("last_active_date"))
        if la:
            if self.max_last_active is None or la > self.max_last_active:
                self.max_last_active = la
            self.last_active_days.append((TODAY - la).days)

    def _classify(self, profile, career, skills, skill_names, title, yrs, full) -> None:
        ai_core_skills = [n for n in skill_names if _matches_any(n, AI_CORE_SKILL_PATTERNS)]
        ai_buzz_skills = [n for n in skill_names if _matches_any(n, AI_BUZZ_SKILL_PATTERNS)]
        bucket = self._bucket_title(title) if title else "other"
        is_off_target = bucket in ("non-technical", "non-software-eng")
        is_eng = bucket == "engineering"

        # honeypot: off-target title (non-tech OR mechanical/civil/etc.) but many AI skills
        if is_off_target and len(ai_core_skills) + len(ai_buzz_skills) >= 4:
            self.honeypot_nontech_title_ai_skills += 1
            if len(self.honeypot_examples) < 8:
                self.honeypot_examples.append({
                    "id": full.get("candidate_id"), "title": title,
                    "ai_skills": (ai_core_skills + ai_buzz_skills)[:8],
                })

        # keyword stuffer: many AI skills but shallow (low endorsements & short duration)
        if len(ai_core_skills) + len(ai_buzz_skills) >= 5:
            shallow = 0
            for s in skills:
                nm = (s.get("name") or "").lower()
                if _matches_any(nm, AI_CORE_SKILL_PATTERNS + AI_BUZZ_SKILL_PATTERNS):
                    if (s.get("endorsements") or 0) <= 2 and (s.get("duration_months") or 0) <= 6:
                        shallow += 1
            if shallow >= 4:
                self.keyword_stuffer_low_trust += 1

        # services-only career
        companies = [(j.get("company") or "").lower() for j in career]
        if companies and all(any(f in co for f in SERVICES_FIRMS) for co in companies):
            self.services_only_career += 1

        # research-only
        if title and _matches_any(title, RESEARCH_ONLY_PATTERNS):
            self.research_only += 1

        # off-domain only (CV/speech/robotics, no IR/NLP core)
        if skill_names and not ai_core_skills and _matches_any(" ".join(skill_names), OFFDOMAIN_SKILL_PATTERNS):
            self.offdomain_only += 1

        # job hopper: 3+ jobs all <18 months
        if len(career) >= 3:
            durs = [j.get("duration_months") or 0 for j in career]
            if durs and max(durs) < 18:
                self.jobhopper += 1

        # ideal funnel
        in_band = isinstance(yrs, (int, float)) and JD_EXP_MIN <= yrs <= JD_EXP_MAX
        if in_band:
            self.in_exp_band += 1
        if is_eng:
            self.eng_title += 1
        if ai_core_skills:
            self.has_ai_core += 1
        if in_band and is_eng and ai_core_skills and not is_off_target:
            self.ideal_candidate += 1
            if len(self.ideal_examples) < 8:
                self.ideal_examples.append({
                    "id": full.get("candidate_id"), "title": title,
                    "yrs": yrs, "ai_core": ai_core_skills[:6],
                })


# --------------------------------------------------------------------------- #
# report rendering
# --------------------------------------------------------------------------- #


def _pct(x: int, n: int) -> str:
    return f"{100*x/n:5.1f}%" if n else "  -  "


def render_report(f: Forensics) -> str:
    n = f.n
    out: list[str] = []
    w = out.append
    w("# Redrob Challenge — Candidate Dataset Forensic Report\n")
    w(f"**Records analyzed:** {n:,}  ")
    w(f"**Latest `last_active_date` in data:** {f.max_last_active}  ")
    w(f"**JD:** Senior AI Engineer, {JD_EXP_MIN:.0f}–{JD_EXP_MAX:.0f} yrs, retrieval/ranking/embeddings at product companies\n")

    w("## 1. Field completeness (present & non-empty)\n")
    w("| field | coverage |")
    w("|---|---|")
    for k in ["profile.current_title", "profile.current_industry", "profile.location",
              "profile.summary", "profile.headline", "career_history", "education",
              "skills", "certifications", "languages"]:
        w(f"| {k} | {_pct(f.present[k], n)} |")
    w(f"| redrob github linked (score≥0) | {_pct(f.github_linked, n)} |")
    w(f"| redrob offer history (rate≥0) | {_pct(f.offer_history, n)} |")
    w("")

    w("## 2. Experience distribution\n")
    eq = _quantiles(f.exp_years)
    w(f"years_of_experience — min {eq.get('min',0):.1f}, median {eq.get('median',0):.1f}, "
      f"mean {eq.get('mean',0):.1f}, p90 {eq.get('p90',0):.1f}, max {eq.get('max',0):.1f}\n")
    w("| band | count | share |")
    w("|---|---|---|")
    for band in ["0-2", "2-5", "5-9 (JD band)", "9+"]:
        w(f"| {band} | {f.exp_band[band]:,} | {_pct(f.exp_band[band], n)} |")
    w("")

    w("## 3. Title buckets & top titles\n")
    w("_'non-software-eng' = Mechanical/Civil/etc. — off-target for an AI-Engineer JD "
      "and honeypot-prone when stacked with AI skills._\n")
    w("| bucket | count | share |")
    w("|---|---|---|")
    for b in ["engineering", "non-technical", "non-software-eng", "other"]:
        w(f"| {b} | {f.title_bucket[b]:,} | {_pct(f.title_bucket[b], n)} |")
    w("\n**Top 25 current_title:**\n")
    w("| title | count |")
    w("|---|---|")
    for t, c in f.titles.most_common(25):
        w(f"| {t} | {c:,} |")
    w("")

    w("## 4. Skills\n")
    sq = _quantiles([float(x) for x in f.skills_per_cand])
    w(f"distinct skills: {len(f.skill_freq):,}; per candidate — median {sq.get('median',0):.0f}, "
      f"mean {sq.get('mean',0):.1f}, p90 {sq.get('p90',0):.0f}, max {sq.get('max',0):.0f}\n")
    w("**Top 30 skills:**\n")
    w("| skill | count | share |")
    w("|---|---|---|")
    for s, c in f.skill_freq.most_common(30):
        w(f"| {s} | {c:,} | {_pct(c, n)} |")
    rare = [s for s, c in f.skill_freq.items() if c <= 100]
    w(f"\n**Rarity:** {len(rare):,} skills appear ≤100 times "
      f"({_pct(len(rare), len(f.skill_freq))} of distinct skills). Rare ≠ noise — a scarce "
      "retrieval/ranking skill is far more discriminating than ubiquitous Python.\n")
    # uniformity: how flat is the common-skill distribution? near-flat ⇒ skills sprinkled
    # independently of fit ⇒ keyword-matching is a trap by construction.
    common = [c for _, c in f.skill_freq.most_common() if c >= 2000]
    if common:
        mean_c = sum(common) / len(common)
        var = sum((c - mean_c) ** 2 for c in common) / len(common)
        cv = (var ** 0.5) / mean_c if mean_c else 0
        w(f"**Uniformity:** the {len(common)} 'common' skills (≥2,000 occurrences) each appear "
          f"~{mean_c:,.0f} times with a coefficient of variation of only **{cv:.3f}** "
          f"(≈{100*mean_c/n:.1f}% of candidates each). The distribution is near-flat ⇒ skills are "
          "sprinkled **independently of role fit**. **Keyword count is a trap by construction — "
          "the discriminative signal lives in title + career history + summary, not the skills list.**\n")
    w("**Sample AI-core skill frequencies (the JD's real asks):**\n")
    w("| ai-core skill | count |")
    w("|---|---|")
    core_seen = [(s, c) for s, c in f.skill_freq.items() if _matches_any(s, AI_CORE_SKILL_PATTERNS)]
    for s, c in sorted(core_seen, key=lambda x: -x[1])[:20]:
        w(f"| {s} | {c:,} |")
    w("")

    w("## 5. Redrob behavioral signals (availability is a multiplier, not a feature)\n")
    w("| signal | min | p25 | median | mean | p75 | p90 | max |")
    w("|---|---|---|---|---|---|---|---|")
    for k in ["profile_completeness_score", "recruiter_response_rate", "avg_response_time_hours",
              "interview_completion_rate", "offer_acceptance_rate", "github_activity_score",
              "endorsements_received", "saved_by_recruiters_30d", "profile_views_received_30d",
              "applications_submitted_30d", "notice_period_days"]:
        q = _quantiles(f.sig_num.get(k, []))
        if q:
            w(f"| {k} | {q['min']:.2f} | {q['p25']:.2f} | {q['median']:.2f} | {q['mean']:.2f} | "
              f"{q['p75']:.2f} | {q['p90']:.2f} | {q['max']:.2f} |")
    w("\n**Boolean signals (true rate):**\n")
    w("| signal | true rate |")
    w("|---|---|")
    for k in ["open_to_work_flag", "willing_to_relocate", "verified_email", "verified_phone", "linkedin_connected"]:
        tot = f.sig_bool_total[k]
        w(f"| {k} | {_pct(f.sig_bool_true[k], tot)} |")
    laq = _quantiles([float(x) for x in f.last_active_days])
    if laq:
        w(f"\n**Inactivity (days since last_active, relative to {TODAY}):** "
          f"median {laq['median']:.0f}d, p90 {laq['p90']:.0f}d, max {laq['max']:.0f}d. "
          "JD: down-weight the dormant + low-response candidate — 'not actually available'.\n")
    w("**Preferred work mode:** " + ", ".join(f"{k}={v:,}" for k, v in f.work_mode.most_common()) + "\n")

    w("## 6. Honeypots & JD disqualifiers (this is where the leaderboard is won)\n")
    w("| pattern | count | share | rationale |")
    w("|---|---|---|---|")
    w(f"| off-target title (non-tech/mech/civil) + ≥4 AI skills | {f.honeypot_nontech_title_ai_skills:,} | {_pct(f.honeypot_nontech_title_ai_skills, n)} | explicit keyword-stuffer trap |")
    w(f"| keyword stuffer (≥5 AI skills, ≥4 shallow) | {f.keyword_stuffer_low_trust:,} | {_pct(f.keyword_stuffer_low_trust, n)} | low endorsement+duration ⇒ not real |")
    w(f"| services-firm-only career | {f.services_only_career:,} | {_pct(f.services_only_career, n)} | JD down-weights TCS/Infosys/… only |")
    w(f"| research-only title | {f.research_only:,} | {_pct(f.research_only, n)} | JD disqualifier |")
    w(f"| off-domain only (CV/speech/robotics) | {f.offdomain_only:,} | {_pct(f.offdomain_only, n)} | JD disqualifier |")
    w(f"| job hopper (3+ jobs all <18mo) | {f.jobhopper:,} | {_pct(f.jobhopper, n)} | JD: title-chasers |")
    w("\n**Honeypot examples:**\n")
    for ex in f.honeypot_examples:
        w(f"- `{ex['id']}` — *{ex['title']}* — skills: {', '.join(ex['ai_skills'])}")
    w("")

    w("## 7. Ideal-candidate funnel (the JD said 'maybe 10 great matches')\n")
    w("| filter | surviving | share |")
    w("|---|---|---|")
    w(f"| all | {n:,} | 100.0% |")
    w(f"| in 5–9 yr band | {f.in_exp_band:,} | {_pct(f.in_exp_band, n)} |")
    w(f"| engineering title | {f.eng_title:,} | {_pct(f.eng_title, n)} |")
    w(f"| has ≥1 AI-core skill | {f.has_ai_core:,} | {_pct(f.has_ai_core, n)} |")
    w(f"| **all three (rough ideal)** | **{f.ideal_candidate:,}** | {_pct(f.ideal_candidate, n)} |")
    w("\n**Ideal-candidate examples:**\n")
    for ex in f.ideal_examples:
        w(f"- `{ex['id']}` — *{ex['title']}* — {ex['yrs']}y — {', '.join(ex['ai_core'])}")
    w("")

    w("## 8. Geography\n")
    in_pref = sum(c for loc, c in f.locations.items() if _matches_any(loc, PREFERRED_LOCATIONS))
    w(f"JD-preferred locations (Noida/Pune/Hyd/Mumbai/Delhi/Blr): ~{_pct(in_pref, n)} of candidates.\n")
    w("**Top 12 locations:** " + ", ".join(f"{k} ({v:,})" for k, v in f.locations.most_common(12)) + "\n")
    w("**Top 8 countries:** " + ", ".join(f"{k} ({v:,})" for k, v in f.countries.most_common(8)) + "\n")

    w("## 9. Takeaways for the ChallengeRankingEngine\n")
    w("1. **Score all 100k in one cheap pass** — no retrieval funnel needed; the reference does 50k/10s on CPU.")
    w("2. **Title + career history is the honeypot discriminator**, not skill-keyword count. Weight it heavily and gate non-technical titles.")
    w("3. **Trust-weight skills** by endorsements × duration so keyword stuffers collapse.")
    w("4. **Behavioral signals are a multiplier** (response rate, recency, open-to-work, interview-completion) — apply *after* skill match, not as additive features.")
    w("5. **Reward the JD-means case** (transition-into-ML at product cos via career_history descriptions) and **penalize** services-only / research-only / off-domain / job-hopper patterns.")
    w("6. **Experience band is soft** — the JD says 5–9 is a guide, not a gate; partial credit just outside.")
    w("")
    return "\n".join(out)


# --------------------------------------------------------------------------- #
# driver
# --------------------------------------------------------------------------- #


def _locate_dataset() -> Path | None:
    for p in Path("challenge_data").rglob("candidates.jsonl"):
        if "MACOSX" not in str(p):
            return p
    return None


def main() -> None:
    ap = argparse.ArgumentParser(description="Forensic EDA over candidates.jsonl")
    ap.add_argument("--candidates", type=Path, default=None)
    ap.add_argument("--out", type=Path, default=Path("challenge/reports/eda_report.md"))
    ap.add_argument("--limit", type=int, default=0, help="analyze only first N records (0 = all)")
    args = ap.parse_args()

    path = args.candidates or _locate_dataset()
    if not path or not path.exists():
        raise SystemExit("Could not find candidates.jsonl — pass --candidates PATH")

    f = Forensics()
    bad = 0
    with open(path, "r", encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            if args.limit and i >= args.limit:
                break
            line = line.strip()
            if not line:
                continue
            try:
                f.add(json.loads(line))
            except json.JSONDecodeError:
                bad += 1
            if f.n % 20000 == 0:
                print(f"  ... {f.n:,} parsed")

    report = render_report(f)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(report, encoding="utf-8")
    print(f"\nParsed {f.n:,} candidates ({bad} unparseable). Report -> {args.out}\n")
    # also echo the high-signal sections to stdout
    print(report)


if __name__ == "__main__":
    main()
