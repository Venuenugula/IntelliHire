import type { CandidateListItem, Job, RankingItem } from "./types";

export type CandidateWithJob = CandidateListItem & { job_id: string; job_title: string };

export interface DashboardSnapshot {
  jobs: Job[];
  candidates: CandidateWithJob[];
  rankingsByJob: Record<string, RankingItem[]>;
}

export function pickPrimaryJob(jobs: Job[]): Job | null {
  if (jobs.length === 0) return null;
  return [...jobs].sort((a, b) => (b.candidate_count ?? 0) - (a.candidate_count ?? 0))[0];
}

export function hiringHealthInsight(jobs: Job[]) {
  const activeRoles = jobs.filter((j) => (j.candidate_count ?? 0) > 0).length;
  const score = jobs.length > 0 ? Math.min(100, Math.round((activeRoles / jobs.length) * 100)) : 0;
  const emptyRoles = jobs.filter((j) => (j.candidate_count ?? 0) === 0).length;
  const status = score >= 80 ? "Excellent" : score >= 50 ? "Healthy" : "Needs attention";
  const detail =
    emptyRoles > 0
      ? `${emptyRoles} role${emptyRoles === 1 ? "" : "s"} still need candidates.`
      : "No hiring bottlenecks detected.";
  return { score, status, detail, spark: buildSpark(score) };
}

export function evidenceInsight(candidates: CandidateWithJob[]) {
  const verified = candidates.filter((c) => c.analyzed).length;
  const missingGithub = candidates.filter((c) => !c.github_url).length;
  const pct = candidates.length > 0 ? Math.round((verified / candidates.length) * 100) : 0;
  const detail =
    candidates.length === 0
      ? "Upload candidates to begin evidence collection."
      : missingGithub > 0
        ? `${missingGithub} candidate${missingGithub === 1 ? "" : "s"} missing GitHub evidence.`
        : "All candidates have core evidence links.";
  return { verified, missingGithub, pct, detail, spark: buildSpark(pct) };
}

export function pipelineInsight(rankings: RankingItem[]) {
  const strong = rankings.filter((r) => isStrongRecommendation(r.recommendation)).length;
  const medium = rankings.filter((r) => isMediumRecommendation(r.recommendation)).length;
  const detail =
    rankings.length === 0
      ? "Run analysis to surface hiring recommendations."
      : `${strong} highly recommended · ${medium} medium confidence`;
  return { strong, medium, detail, spark: buildSpark(strong * 12 + medium * 6) };
}

export function confidenceInsight(rankings: RankingItem[]) {
  if (rankings.length === 0) {
    return { avg: 0, label: "Awaiting data", detail: "Analyze candidates to calculate confidence.", trend: "—", spark: buildSpark(0) };
  }
  const avg = Math.round((rankings.reduce((s, r) => s + r.confidence, 0) / rankings.length) * 100);
  const label = avg >= 75 ? "Increasing" : avg >= 50 ? "Stable" : "Needs review";
  const detail = `Based on ${rankings.length} evaluated candidate${rankings.length === 1 ? "" : "s"}.`;
  return { avg, label, detail, trend: label, spark: buildSpark(avg) };
}

export function headerSummary(jobs: Job[], candidates: CandidateWithJob[], rankings: RankingItem[]) {
  const pendingReview = candidates.filter((c) => !c.analyzed).length;
  const leanReview = rankings.filter((r) => r.recommendation === "lean_hire" || r.recommendation === "insufficient_evidence").length;
  const reviewCount = pendingReview + leanReview;
  const confidence = confidenceInsight(rankings).avg;
  const overnight = candidates.filter((c) => isRecent(c.created_at, 24)).length;
  const pipelineMsg =
    jobs.length === 0
      ? "Create a role to start building your hiring pipeline."
      : reviewCount > 0
        ? `${reviewCount} candidate${reviewCount === 1 ? "" : "s"} need your attention today.`
        : "Your hiring pipeline looks healthy today.";
  return { confidence, reviewCount, overnight, pipelineMsg };
}

export interface PipelineStage {
  key: string;
  label: string;
  count: number;
  conversion?: number;
  dropOff?: number;
}

export function buildPipelineStages(candidates: CandidateWithJob[], rankings: RankingItem[]): PipelineStage[] {
  const sourced = candidates.length;
  const screened = candidates.filter((c) => c.has_resume).length;
  const verified = candidates.filter((c) => c.analyzed).length;
  const interview = rankings.filter((r) => isAdvanceRecommendation(r.recommendation)).length;
  const offer = rankings.filter((r) => r.recommendation === "strong_hire" || r.recommendation === "hire").length;
  const hired = 0;

  const stages = [
    { key: "sourced", label: "Sourced", count: sourced },
    { key: "screened", label: "Screened", count: screened },
    { key: "verified", label: "Evidence Verified", count: verified },
    { key: "interview", label: "Interview", count: interview },
    { key: "offer", label: "Offer", count: offer },
    { key: "hired", label: "Hired", count: hired },
  ];

  return stages.map((stage, i) => {
    const prev = i > 0 ? stages[i - 1].count : stage.count;
    const conversion = prev > 0 ? Math.round((stage.count / prev) * 100) : undefined;
    const dropOff = prev > 0 && stage.count < prev ? prev - stage.count : undefined;
    return { ...stage, conversion, dropOff };
  });
}

export interface FindingItem {
  id: string;
  time: string;
  title: string;
  description: string;
  tone: "success" | "info" | "warning" | "neutral";
}

export function buildFindings(candidates: CandidateWithJob[], rankings: RankingItem[]): FindingItem[] {
  const items: FindingItem[] = [];

  for (const c of [...candidates].sort((a, b) => timeValue(b.created_at) - timeValue(a.created_at)).slice(0, 4)) {
    if (c.analyzed) {
      const rank = rankings.find((r) => r.candidate_id === c.candidate_id);
      items.push({
        id: `analysis-${c.candidate_id}`,
        time: formatTime(c.created_at),
        title: "Analysis completed",
        description: rank
          ? `${c.name} · ${Math.round(rank.confidence * 100)}% confidence`
          : `${c.name} evidence processed`,
        tone: "success",
      });
    }
  }

  for (const c of candidates.filter((x) => !x.github_url).slice(0, 2)) {
    items.push({
      id: `github-${c.candidate_id}`,
      time: formatTime(c.created_at),
      title: "Missing GitHub profile",
      description: `${c.name} requires additional evidence`,
      tone: "warning",
    });
  }

  for (const r of rankings.filter((x) => isAdvanceRecommendation(x.recommendation)).slice(0, 2)) {
    items.push({
      id: `rec-${r.candidate_id}`,
      time: "Now",
      title: "Interview recommendation generated",
      description: `${r.candidate} ready to advance`,
      tone: "info",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "empty",
      time: "—",
      title: "No recent findings",
      description: "Upload candidates to start evidence analysis.",
      tone: "neutral",
    });
  }

  return items.slice(0, 5);
}

export interface TaskItem {
  id: string;
  label: string;
  href: string;
  tone: "primary" | "default" | "warning";
}

export function buildTasks(candidates: CandidateWithJob[], jobs: Job[]): TaskItem[] {
  const tasks: TaskItem[] = [];
  const primary = pickPrimaryJob(jobs);

  for (const c of candidates.filter((x) => !x.analyzed).slice(0, 2)) {
    tasks.push({
      id: `review-${c.candidate_id}`,
      label: `Review ${c.name}`,
      href: `/candidates/${c.candidate_id}`,
      tone: "primary",
    });
  }

  for (const c of candidates.filter((x) => !x.github_url).slice(0, 2)) {
    tasks.push({
      id: `github-${c.candidate_id}`,
      label: `Verify GitHub evidence · ${c.name}`,
      href: `/candidates/${c.candidate_id}`,
      tone: "warning",
    });
  }

  for (const c of candidates.filter((x) => !x.portfolio_url && x.analyzed).slice(0, 1)) {
    tasks.push({
      id: `portfolio-${c.candidate_id}`,
      label: `Portfolio pending · ${c.name}`,
      href: `/candidates/${c.candidate_id}`,
      tone: "default",
    });
  }

  if (primary && tasks.length < 4) {
    tasks.push({
      id: `rankings-${primary.job_id}`,
      label: `Review rankings · ${primary.title}`,
      href: `/jobs/${primary.job_id}/rankings`,
      tone: "default",
    });
  }

  if (tasks.length === 0 && jobs.length > 0) {
    tasks.push({
      id: "new-candidate",
      label: "Analyze a new candidate",
      href: "/jobs/new",
      tone: "primary",
    });
  }

  return tasks.slice(0, 5);
}

export function evidenceScore(c: CandidateListItem): number {
  const fields = [c.has_resume, c.github_url, c.linkedin_url, c.portfolio_url, c.leetcode_url];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export function evaluationRows(candidates: CandidateWithJob[], rankings: RankingItem[]): Array<{
  candidateId: string;
  jobId: string;
  name: string;
  role: string;
  evidenceScore: number;
  confidence: number | null;
  recommendation: string | null;
  status: string;
}> {
  const rankingMap = new Map(rankings.map((r) => [r.candidate_id, r]));
  return [...candidates]
    .sort((a, b) => timeValue(b.created_at) - timeValue(a.created_at))
    .slice(0, 8)
    .map((c) => {
      const rank = rankingMap.get(c.candidate_id);
      return {
        candidateId: c.candidate_id,
        jobId: c.job_id,
        name: c.name,
        role: c.job_title,
        evidenceScore: evidenceScore(c),
        confidence: rank ? Math.round(rank.confidence * 100) : null,
        recommendation: rank?.recommendation ?? null,
        status: c.analyzed ? (rank ? recommendationStatus(rank.recommendation) : "Analyzed") : "Pending",
      };
    });
}

function buildSpark(seed: number): number[] {
  const base = Math.max(10, seed);
  return [base - 12, base - 6, base - 10, base - 2, base + 4, base - 3, base + 6, base];
}

function isStrongRecommendation(rec?: string) {
  return rec === "strong_hire" || rec === "hire";
}

function isMediumRecommendation(rec?: string) {
  return rec === "lean_hire";
}

function isAdvanceRecommendation(rec?: string) {
  return rec === "strong_hire" || rec === "hire" || rec === "lean_hire";
}

function recommendationStatus(rec?: string) {
  if (rec === "strong_hire") return "Strong Hire";
  if (rec === "hire") return "Hire";
  if (rec === "lean_hire") return "Review";
  if (rec === "insufficient_evidence") return "Evidence gap";
  if (rec === "no_hire") return "Not recommended";
  return "Evaluated";
}

function timeValue(iso?: string) {
  return iso ? new Date(iso).getTime() : 0;
}

function isRecent(iso: string | undefined, hours: number) {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < hours * 60 * 60 * 1000;
}

function formatTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
