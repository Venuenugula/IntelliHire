"""Modular, transparent scoring for the ChallengeRankingEngine.

Each feature family is a function that emits a `FeatureScore(score, confidence,
reason, contribution)`. The combiner assembles them into a final explainable
score. No black boxes — every number traces to evidence.

Design (evidence-locked from Phase-1 probes):
  * TITLE is the master gate (separates ~70% off-target).
  * BOILERPLATE summary is a STRONG PENALTY, never standalone elimination
    (combined with other features — per review guidance).
  * Ordering among engineers comes from signals proven to VARY: capability match
    (IDF-rarity + credibility weighted), assessment evidence, experience fit,
    free-text relevance, and a behavioral multiplier.
  * Career trajectory and company name are OMITTED — probes proved them
    redundant/noise.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any

from role_dna import JDRoleDNA

# proficiency → credibility multiplier
_PROF = {"beginner": 0.4, "intermediate": 0.7, "advanced": 1.0, "expert": 1.15}

# title buckets (mirrors forensics classifier; duplicated to keep this module standalone)
_OTHER_ENG = ("mechanical engineer", "civil engineer", "electrical engineer",
              "chemical engineer", "biomedical", "automobile", "structural engineer",
              "industrial engineer", "aerospace", "petroleum", "mining engineer")
_NONTECH = ("marketing", "sales", "content", "hr ", "hr manager", "human resource",
            "recruiter", "talent acquisition", "account manager", "business development",
            "business analyst", "customer success", "customer support", "operations manager",
            "project manager", "product manager", "writer", "designer", "graphic",
            "finance", "accountant", "consultant", "teacher", "professor", "lecturer", "intern")
_SOFTWARE_ENG = ("software", "developer", "ml engineer", "machine learning", "ai engineer",
                 "data scien", "data engineer", "analytics engineer", "research engineer",
                 "swe", "sde", "backend", "frontend", "full stack", "fullstack", "devops",
                 "cloud engineer", "qa engineer", "site reliability", "sre", "mobile developer",
                 "programmer", "platform engineer", "ml ", "recommendation systems engineer")
_OFFDOMAIN = ("computer vision", "image classification", "object detection",
              "speech recognition", "robotics", "slam", "lidar")
# JD disqualifies research-ONLY-without-production. Presence of any of these in the
# narrative is evidence of production work and exempts a 'research' title.
_PRODUCTION_TERMS = ("production", "deployed", "deploy", "real users", "at scale",
                     "shipped", "launched", "serving", "in prod", "live traffic", "users")
_SERVICES = ("tcs", "tata consultancy", "infosys", "wipro", "accenture", "cognizant",
             "capgemini", "tech mahindra", "hcl", "mindtree", "ltimindtree", "mphasis",
             "hexaware", "birlasoft", "persistent")


def _has(text: str, pats) -> bool:
    return any(p in text for p in pats)


def title_bucket(title: str) -> str:
    t = (title or "").lower()
    if _has(t, _OTHER_ENG):
        return "non-software-eng"
    if _has(t, _NONTECH):
        return "non-technical"
    if _has(t, _SOFTWARE_ENG):
        return "engineering"
    return "other"


@dataclass
class FeatureScore:
    name: str
    score: float          # 0..1 (or multiplier for behavioral)
    confidence: float     # 0..1
    reason: str
    contribution: float = 0.0  # filled by combiner


# --------------------------------------------------------------------------- #
# individual features
# --------------------------------------------------------------------------- #


def f_title(cand: dict[str, Any]) -> FeatureScore:
    b = title_bucket((cand.get("profile") or {}).get("current_title") or "")
    score = {"engineering": 1.0, "other": 0.45, "non-software-eng": 0.08, "non-technical": 0.05}[b]
    return FeatureScore("title_fit", score, 1.0, f"current title bucket={b}")


def f_capabilities(cand: dict[str, Any], jd: JDRoleDNA, idf: dict[str, float]) -> FeatureScore:
    """Capability-group coverage, IDF-rarity + credibility weighted, × JD weights."""
    skills = cand.get("skills") or []
    # precompute per-skill credibility and idf-weighted presence
    total = 0.0
    detail: list[str] = []
    for cap in jd.capabilities:
        cap_score = 0.0
        best = 0.0
        for s in skills:
            nm = (s.get("name") or "").lower()
            if not nm:
                continue
            if any(m in nm for m in cap.members):
                e = s.get("endorsements") or 0
                d = s.get("duration_months") or 0
                prof = _PROF.get((s.get("proficiency") or "").lower(), 0.5)
                # credibility: endorsements×√duration×proficiency, damped
                cred = math.log1p(e) * math.sqrt(1 + d) * prof
                rarity = idf.get(nm, 1.0)
                contrib = (1.0 + 0.15 * cred) * rarity
                cap_score += contrib
                best = max(best, contrib)
        # squash capability score: saturating so 1 strong skill ≈ most of the credit
        sat = 1.0 - math.exp(-cap_score / 6.0) if cap_score > 0 else 0.0
        total += cap.weight * sat
        if sat > 0.05:
            detail.append(f"{cap.key}:{sat:.2f}")
    # total is already weighted by capability weights summing ~1.0
    reason = "caps[" + ",".join(detail[:4]) + "]" if detail else "no capability skills"
    return FeatureScore("capability_match", min(1.0, total), 0.9, reason)


def f_assessments(cand: dict[str, Any], jd: JDRoleDNA) -> FeatureScore:
    """Assessment evidence on JD-relevant skills — harder to fake (proven 4× rarer in honeypots)."""
    sig = cand.get("redrob_signals") or {}
    assess = sig.get("skill_assessment_scores") or {}
    if not assess:
        return FeatureScore("assessment_evidence", 0.0, 0.4, "no assessments")
    members = {m for cap in jd.capabilities for m in cap.members}
    rel = [v for k, v in assess.items() if any(m in k.lower() for m in members)]
    if not rel:
        # has assessments but not on JD skills — weak positive
        avg = sum(assess.values()) / len(assess)
        return FeatureScore("assessment_evidence", 0.2 * (avg / 100), 0.6,
                            f"{len(assess)} assessments, none JD-relevant")
    avg = sum(rel) / len(rel)
    cover = min(1.0, len(rel) / 3.0)
    return FeatureScore("assessment_evidence", (avg / 100) * (0.5 + 0.5 * cover), 0.85,
                        f"{len(rel)} JD-relevant assessments avg={avg:.0f}")


def f_experience(cand: dict[str, Any], jd: JDRoleDNA) -> FeatureScore:
    yrs = (cand.get("profile") or {}).get("years_of_experience")
    if not isinstance(yrs, (int, float)):
        return FeatureScore("experience_fit", 0.5, 0.3, "experience unknown")
    lo, hi = jd.exp_ideal_min, jd.exp_ideal_max
    if lo <= yrs <= hi:
        s = 1.0
    elif yrs < lo:
        # steepened below-band ramp (recruiter call): a Senior 5-9 role should not
        # let sub-5y candidates leapfrog in-band seniors unless truly exceptional.
        s = max(0.0, 1.0 - (lo - yrs) / 2.0)
    else:
        s = max(0.3, 1.0 - (yrs - hi) / 8.0)   # gentler decay above (seniority ok)
    return FeatureScore("experience_fit", s, 0.9, f"{yrs:.1f}y vs {lo:.0f}-{hi:.0f}")


def f_text_relevance(cand: dict[str, Any], jd: JDRoleDNA) -> FeatureScore:
    """Free-text JD relevance over summary + career descriptions — the 'JD-means' rescue."""
    p = cand.get("profile") or {}
    text = (p.get("summary") or "") + " " + (p.get("headline") or "")
    for j in cand.get("career_history") or []:
        text += " " + (j.get("description") or "")
    text = text.lower()
    hits = sum(1 for t in jd.text_relevance_terms if t in text)
    s = 1.0 - math.exp(-hits / 4.0)
    return FeatureScore("text_relevance", s, 0.7, f"{hits} JD terms in narrative")


def f_boilerplate(cand: dict[str, Any], jd: JDRoleDNA) -> FeatureScore:
    """Boilerplate-template summary: STRONG penalty, not elimination (combined with rest)."""
    summary = ((cand.get("profile") or {}).get("summary") or "").lower()
    if _has(summary, jd.boilerplate_markers):
        return FeatureScore("boilerplate", 0.35, 0.95, "boilerplate summary (honeypot marker)")
    return FeatureScore("boilerplate", 1.0, 0.6, "specific summary")


def f_disqualifiers(cand: dict[str, Any], jd: JDRoleDNA) -> FeatureScore:
    """Deterministic JD red-flag penalties (multiplier)."""
    skills = [(s.get("name") or "").lower() for s in cand.get("skills") or []]
    career = cand.get("career_history") or []
    pen = 1.0
    reasons = []
    comps = [(j.get("company") or "").lower() for j in career]
    if comps and all(_has(co, _SERVICES) for co in comps):
        pen *= 0.85
        reasons.append("services-only")
    skilltext = " ".join(skills)
    cap_members = {m for cap in jd.capabilities for m in cap.members}
    has_core = any(any(m in s for m in cap_members) for s in skills)
    if skills and not has_core and _has(skilltext, _OFFDOMAIN):
        pen *= 0.8
        reasons.append("offdomain-only")
    # research-only disqualifier: 'research' title with no production evidence in narrative
    title = ((cand.get("profile") or {}).get("current_title") or "").lower()
    if "research" in title:
        narrative = ((cand.get("profile") or {}).get("summary") or "").lower()
        for j in career:
            narrative += " " + (j.get("description") or "").lower()
        if not _has(narrative, _PRODUCTION_TERMS):
            pen *= 0.75
            reasons.append("research-no-production")
    return FeatureScore("disqualifiers", pen, 0.8, ",".join(reasons) or "none")


def f_behavioral(cand: dict[str, Any]) -> FeatureScore:
    """Availability/recruiter-interest multiplier in ~[0.6, 1.12]. Secondary, ablatable."""
    sig = cand.get("redrob_signals") or {}
    rr = sig.get("recruiter_response_rate", 0.4) or 0.0
    saved = sig.get("saved_by_recruiters_30d", 0) or 0
    interview = sig.get("interview_completion_rate", 0.5) or 0.0
    open_w = 1.0 if sig.get("open_to_work_flag") else 0.0
    # normalize each to ~0..1 then blend
    comp = (
        0.30 * min(1.0, rr / 0.7)
        + 0.30 * min(1.0, saved / 15.0)
        + 0.25 * min(1.0, interview / 0.85)
        + 0.15 * open_w
    )
    mult = 0.6 + 0.52 * comp   # 0.6 (dormant) .. ~1.12 (hot)
    return FeatureScore("behavioral", mult, 0.7,
                        f"resp={rr:.2f} saved={saved} interview={interview:.2f} open={bool(open_w)}")


# --------------------------------------------------------------------------- #
# combiner
# --------------------------------------------------------------------------- #

# positive-score weights among the additive features (ablatable in the Lab)
_ADDITIVE_WEIGHTS = {
    "capability_match": 0.46,
    "assessment_evidence": 0.16,
    "text_relevance": 0.16,
    "experience_fit": 0.12,
    "title_fit": 0.10,   # also acts as a gate via multiplier below
}


@dataclass
class ScoredCandidate:
    candidate_id: str
    score: float
    features: list[FeatureScore]
    reason: str
    # explainability artifacts (Phases 1-2, 7): score decomposition + aggregate certainty
    additive: dict[str, float] | None = None     # feature -> additive contribution (base = sum)
    multipliers: dict[str, float] | None = None  # gate/boilerplate/disqualifiers/behavioral
    certainty: float = 0.0                        # confidence-weighted aggregate, 0..1


# feature families that can be ablated (Phase 3). Names match FeatureScore.name +
# the synthetic "gate" tied to title.
ABLATABLE = (
    "capability_match", "assessment_evidence", "text_relevance", "experience_fit",
    "title_fit", "boilerplate", "disqualifiers", "behavioral",
)


def score_candidate(
    cand: dict[str, Any],
    jd: JDRoleDNA,
    idf: dict[str, float],
    disable: frozenset[str] = frozenset(),
) -> ScoredCandidate:
    """Score one candidate. `disable` neutralizes a feature family (for Lab ablation):
    additive features -> 0 contribution; multipliers -> 1.0 (neutral); title also
    neutralizes its gate. With `disable` empty the result is byte-identical to v1."""
    title = f_title(cand)
    caps = f_capabilities(cand, jd, idf)
    assess = f_assessments(cand, jd)
    exp = f_experience(cand, jd)
    text = f_text_relevance(cand, jd)
    boiler = f_boilerplate(cand, jd)
    disq = f_disqualifiers(cand, jd)
    behav = f_behavioral(cand)

    feats = [title, caps, assess, exp, text]
    additive: dict[str, float] = {}
    base = 0.0
    for fs in feats:
        w = _ADDITIVE_WEIGHTS.get(fs.name, 0.0)
        fs.contribution = 0.0 if fs.name in disable else w * fs.score
        additive[fs.name] = fs.contribution
        base += fs.contribution

    # title gate: off-target titles suppressed (not zeroed); neutral=1.0 if disabled
    gate = 1.0 if "title_fit" in disable else (0.15 + 0.85 * title.score)
    boiler_m = 1.0 if "boilerplate" in disable else boiler.score
    disq_m = 1.0 if "disqualifiers" in disable else disq.score
    behav_m = 1.0 if "behavioral" in disable else behav.score

    final = base * gate * boiler_m * disq_m * behav_m
    final = max(0.0, min(1.0, final))

    boiler.contribution = boiler_m
    disq.contribution = disq_m
    behav.contribution = behav_m
    all_feats = feats + [boiler, disq, behav]
    multipliers = {"gate": gate, "boilerplate": boiler_m, "disqualifiers": disq_m, "behavioral": behav_m}

    # aggregate certainty: mean confidence across families (HIGH/MED/LOW in audit)
    certainty = (sum(f.confidence for f in all_feats) / len(all_feats)) if all_feats else 0.0

    reason = _render_reason(cand, all_feats, final)
    return ScoredCandidate(cand.get("candidate_id", ""), final, all_feats, reason,
                           additive=additive, multipliers=multipliers, certainty=certainty)


def _render_reason(cand: dict[str, Any], feats: list[FeatureScore], final: float) -> str:
    """Deterministic one-line reasoning (CSV column), human-readable like the sample."""
    p = cand.get("profile") or {}
    title = p.get("current_title") or "?"
    yrs = p.get("years_of_experience")
    by = {f.name: f for f in feats}
    bits = [f"{title} ({yrs:.1f}y)" if isinstance(yrs, (int, float)) else title]
    cap = by.get("capability_match")
    if cap and cap.score > 0.05:
        bits.append(cap.reason)
    ass = by.get("assessment_evidence")
    if ass and ass.score > 0.05:
        bits.append(ass.reason)
    if by.get("boilerplate") and by["boilerplate"].score < 1.0:
        bits.append("⚠ boilerplate")
    if by.get("disqualifiers") and by["disqualifiers"].reason != "none":
        bits.append(by["disqualifiers"].reason)
    return "; ".join(bits)[:240]
