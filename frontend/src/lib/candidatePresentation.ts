import type { CandidateDetail, EvaluationResponse, EvidenceObject, RecommendationLevel } from "./types";
import { NEXT_ACTION, RECOMMENDATION_META } from "./recommendation";
import { sourceLabel } from "./sources";

export function displayNextAction(recommendation: RecommendationLevel): string {
  const map: Partial<Record<RecommendationLevel, string>> = {
    strong_hire: "Move to Interview",
    hire: "Proceed to Interview",
    lean_hire: "Schedule Technical Interview",
    insufficient_evidence: "Request Portfolio",
    no_hire: "Do not advance",
  };
  return map[recommendation] ?? NEXT_ACTION[recommendation].action;
}

export function potentialLabel(hti?: number, capability?: number): string {
  const score = hti ?? capability ?? 0;
  if (score >= 75) return "High";
  if (score >= 50) return "Moderate";
  if (score > 0) return "Emerging";
  return "—";
}

export function riskLevelLabel(score?: number): string {
  if (score === undefined) return "—";
  if (score < 30) return "Low";
  if (score < 60) return "Medium";
  return "High";
}

export function learningVelocityLabel(capability?: number): string {
  if (!capability) return "—";
  return capability > 70 ? "High" : capability > 45 ? "Moderate" : "Low";
}

export function truncateSummary(text: string, maxLines = 6): string {
  const lines = text.split(/\n+/).filter(Boolean);
  return lines.slice(0, maxLines).join("\n");
}

export function collectStrengths(detail: CandidateDetail, evaluation?: EvaluationResponse | null): string[] {
  const fromSummary = detail.summary?.overall_strengths ?? [];
  const fromExplanation = detail.explanation?.strengths ?? [];
  const fromReasons = evaluation?.reasons ?? [];
  const skills = (detail.standardized_evidence ?? []).flatMap((e) => e.skills).slice(0, 6);
  return [...new Set([...fromSummary, ...fromExplanation, ...fromReasons, ...skills])].slice(0, 12);
}

export interface RiskCardItem {
  title: string;
  severity: "High" | "Medium" | "Low";
  explanation: string;
}

export function collectRisks(detail: CandidateDetail, evaluation?: EvaluationResponse | null): RiskCardItem[] {
  const items: RiskCardItem[] = [];
  const risks = [...(detail.explanation?.risks ?? []), ...(evaluation?.reservations ?? [])];
  const weaknesses = detail.summary?.overall_weaknesses ?? [];

  [...risks, ...weaknesses].forEach((text, i) => {
    const severity = inferSeverity(text, i);
    items.push({ title: text.split("—")[0].trim().slice(0, 64), severity, explanation: text });
  });

  return items.slice(0, 6);
}

function inferSeverity(text: string, index: number): "High" | "Medium" | "Low" {
  const lower = text.toLowerCase();
  if (lower.includes("missing") || lower.includes("no ") || lower.includes("lack")) return index === 0 ? "High" : "Medium";
  if (lower.includes("limited") || lower.includes("partial")) return "Medium";
  return index < 2 ? "Medium" : "Low";
}

export interface SourceCardData {
  source: string;
  label: string;
  score: number | null;
  status: "Verified" | "Partial" | "Missing";
}

const KNOWN_SOURCES = ["github", "resume", "linkedin", "portfolio", "projects", "leetcode"] as const;

export function buildSourceCards(detail: CandidateDetail): SourceCardData[] {
  const evidenceMap = new Map((detail.standardized_evidence ?? []).map((e) => [e.source.toLowerCase(), e]));
  const rawMap = new Map(detail.evidence.map((e) => [e.source_type.toLowerCase(), e]));

  return KNOWN_SOURCES.map((source) => {
    const ev = evidenceMap.get(source) ?? evidenceMap.get(source === "projects" ? "portfolio" : source);
    const raw = rawMap.get(source);
    if (!ev && !raw) {
      return { source, label: sourceLabel(source), score: null, status: "Missing" as const };
    }
    const score = scoreFromEvidence(ev);
    const status: SourceCardData["status"] =
      ev?.error ? "Partial" : score !== null && score >= 70 ? "Verified" : score !== null ? "Partial" : "Missing";
    return { source, label: sourceLabel(source), score, status };
  });
}

function scoreFromEvidence(ev?: EvidenceObject): number | null {
  if (!ev) return null;
  if (typeof ev.relevance_score === "number") return Math.round(ev.relevance_score);
  return Math.round(ev.reliability * 100);
}

export interface BreakdownItem {
  label: string;
  value: number;
}

export function buildEvidenceBreakdown(detail: CandidateDetail): BreakdownItem[] {
  const cards = buildSourceCards(detail).filter((c) => c.score !== null);
  if (cards.length > 0) {
    return cards.map((c) => ({ label: c.label, value: c.score ?? 0 }));
  }
  if (detail.capability) {
    return [
      { label: "Technical", value: detail.capability.technical },
      { label: "Execution", value: detail.capability.execution },
      { label: "Problem Solving", value: detail.capability.problem_solving },
      { label: "Ownership", value: detail.capability.ownership },
      { label: "Learning", value: detail.capability.learning_velocity },
      { label: "Domain", value: detail.capability.domain_expertise },
    ];
  }
  return [];
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  tone: "success" | "warning" | "info" | "neutral";
}

export function buildEvidenceTimeline(
  detail: CandidateDetail,
  evaluation?: EvaluationResponse | null,
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  if (detail.evidence.some((e) => e.source_type === "resume")) {
    events.push({ id: "resume", title: "Resume Parsed", description: "Experience and skills extracted", tone: "success" });
  }
  if (detail.evidence.some((e) => e.source_type === "github")) {
    events.push({ id: "github", title: "GitHub Verified", description: "Repositories and activity analyzed", tone: "success" });
  }
  if ((detail.standardized_evidence ?? []).some((e) => e.source === "portfolio" || e.highlights.length > 0)) {
    events.push({ id: "projects", title: "Projects Analysed", description: "Portfolio and project impact reviewed", tone: "info" });
  }
  if (detail.evidence.some((e) => e.source_type === "portfolio")) {
    events.push({ id: "portfolio", title: "Portfolio Detected", description: "Case studies and work samples indexed", tone: "success" });
  }
  if (!detail.evidence.some((e) => e.source_type === "leetcode")) {
    events.push({ id: "leetcode-miss", title: "Missing LeetCode", description: "No competitive programming profile linked", tone: "warning" });
  }
  if (evaluation) {
    const meta = RECOMMENDATION_META[evaluation.recommendation];
    events.push({
      id: "rec",
      title: "Recommendation Updated",
      description: `${meta.label} · ${Math.round(evaluation.confidence * 100)}% confidence`,
      tone: "info",
    });
  }

  return events;
}

export function metaChips(detail: CandidateDetail, jobTitle?: string | null, hasEvaluation?: boolean) {
  const experienceStat = detail.summary?.sources
    ?.flatMap((s) => s.stats)
    .find((s) => /experience|years/i.test(s.label));
  return {
    role: jobTitle ?? detail.summary?.headline ?? "Open role",
    location: detail.summary?.sources?.[0]?.stats?.find((s) => /location|city/i.test(s.label))?.value ?? "—",
    experience: experienceStat?.value ?? "—",
    availability: hasEvaluation ? "Under review" : "Pending analysis",
  };
}
