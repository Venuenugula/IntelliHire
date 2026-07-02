"use client";

import dynamic from "next/dynamic";
import { AISummaryCard } from "@/components/candidate/AISummaryCard";
import { DecisionHero } from "@/components/candidate/DecisionHero";
import { EvidenceBreakdown, EvidenceTimeline } from "@/components/candidate/EvidencePanels";
import { AIReasoningCard, HTICard, NextActionCard } from "@/components/candidate/ReasoningSections";
import { MissingEvidenceAccordions, RiskBreakdownPanel } from "@/components/candidate/RiskAndGaps";
import { EvidenceSourceGrid, RiskCards, StrengthChips } from "@/components/candidate/OverviewSections";
import { EvidenceSection } from "@/components/evidence/EvidenceSection";
import { DecisionCard } from "@/components/evaluation/DecisionCard";
import { ReasoningDrawer } from "@/components/evaluation/ReasoningDrawer";
import { TalentGraphSection } from "@/components/graph/TalentGraphSection";
import { getCandidateDetail, getJob } from "@/lib/api";
import {
  buildEvidenceBreakdown,
  buildEvidenceTimeline,
  buildSourceCards,
  collectRisks,
  collectStrengths,
  displayNextAction,
} from "@/lib/candidatePresentation";
import { useEvaluation } from "@/lib/useEvaluation";
import type { CandidateDetail } from "@/lib/types";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import "@/components/candidate/candidate-workspace.css";

const CapabilityRadar = dynamic(
  () => import("@/components/charts/CapabilityRadar").then((m) => m.CapabilityRadar),
  { ssr: false, loading: () => <div className="h-48 w-full animate-pulse rounded-2xl bg-slate-100" /> },
);

function exportEvaluationReport(name: string, evaluation: NonNullable<ReturnType<typeof useEvaluation>["evaluation"]>, detail: CandidateDetail) {
  const strengths = detail.summary?.overall_strengths ?? detail.explanation?.strengths ?? [];
  const lines = [
    "DELULU — Candidate Evaluation",
    name,
    "",
    `Recommendation: ${evaluation.recommendation}`,
    `Confidence: ${Math.round(evaluation.confidence * 100)}%`,
    `Fit score: ${Math.round(evaluation.score * 100)}`,
    `Next action: ${displayNextAction(evaluation.recommendation)}`,
    "",
    evaluation.summary || "—",
    "",
    "Strengths",
    ...(strengths.length ? strengths.map((s) => `  • ${s}`) : ["  —"]),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g, "_")}_evaluation.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = params.id as string;
  const jobId = useSearchParams().get("job");
  const { evaluation, status, retry } = useEvaluation(candidateId, jobId);
  const graphId = typeof evaluation?.meta?.graph_id === "string" ? evaluation.meta.graph_id : null;
  const [detail, setDetail] = useState<CandidateDetail | null>(null);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [explainOpen, setExplainOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "graph">("overview");

  useEffect(() => {
    getCandidateDetail(candidateId)
      .then(setDetail)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [candidateId]);

  useEffect(() => {
    if (!jobId) return;
    getJob(jobId)
      .then((job) => setJobTitle(job.title))
      .catch(() => setJobTitle(null));
  }, [jobId]);

  const handleExport = useCallback(() => {
    if (!detail || !evaluation) return;
    exportEvaluationReport(detail.name, evaluation, detail);
  }, [detail, evaluation]);

  if (loading) return <div className="ci-workspace p-8 text-[var(--ci-muted)]">Loading candidate intelligence…</div>;
  if (error) return <div className="ci-workspace p-8 text-red-600">{error}</div>;
  if (!detail) return null;

  const strengths = collectStrengths(detail, evaluation);
  const risks = collectRisks(detail, evaluation);
  const sources = buildSourceCards(detail);
  const breakdown = buildEvidenceBreakdown(detail);
  const timeline = buildEvidenceTimeline(detail, evaluation);
  const reservations = evaluation?.reservations ?? [];
  const summaryText = evaluation?.summary ?? detail.explanation?.reason ?? detail.summary?.headline ?? "";
  const rankingsHref = jobId ? `/jobs/${jobId}/rankings` : null;

  return (
    <div className="ci-workspace">
      <Link
        href={jobId ? `/jobs/${jobId}/rankings` : "/dashboard"}
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--ci-primary)] hover:underline"
      >
        ← Back
      </Link>

      <DecisionHero
        detail={detail}
        evaluation={evaluation}
        status={status}
        jobTitle={jobTitle}
        rankingsHref={rankingsHref}
        onRetry={retry}
        onExplain={evaluation ? () => setExplainOpen(true) : undefined}
        onExport={handleExport}
      />

      <div className="mb-8 flex gap-1 border-b border-[var(--ci-border)]">
        {(["overview", "evidence", "graph"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "border-b-2 border-[var(--ci-primary)] text-[var(--ci-primary)]"
                : "text-[var(--ci-muted)] hover:text-[var(--ci-text)]"
            }`}
          >
            {tab === "graph" ? "Skills Graph" : tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {summaryText && (
            <AISummaryCard
              summary={summaryText}
              recommendation={evaluation ? displayNextAction(evaluation.recommendation) : undefined}
            />
          )}

          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <EvidenceSourceGrid sources={sources} />
            </div>
            <div className="space-y-6 xl:col-span-5">
              <StrengthChips items={strengths} />
              <RiskCards items={risks} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <EvidenceBreakdown items={breakdown} />
            <EvidenceTimeline events={timeline} />
          </div>

          {detail.risk && (
            <RiskBreakdownPanel
              evidenceRisk={detail.risk.evidence_risk}
              roleGapRisk={detail.risk.role_gap_risk}
              credibilityRisk={detail.risk.credibility_risk}
              riskScore={detail.risk.risk_score}
            />
          )}

          {evaluation && <MissingEvidenceAccordions gaps={evaluation.interview_focus} />}

          {evaluation && (
            <AIReasoningCard
              evaluation={evaluation}
              strengths={strengths}
              reservations={reservations}
              sourceCount={detail.standardized_evidence?.length ?? 0}
            />
          )}

          {evaluation && <NextActionCard recommendation={evaluation.recommendation} />}

          {detail.capability && (
            <section className="ci-surface ci-surface--compact">
              <h2 className="ci-title text-base">Capability Profile</h2>
              <p className="mt-1 text-sm text-[var(--ci-muted)]">
                Overall capability score: {detail.capability.capability_score.toFixed(0)}
              </p>
              <div className="mt-4">
                <CapabilityRadar capability={detail.capability} />
              </div>
            </section>
          )}

          {detail.hti && <HTICard htiScore={detail.hti.hti_score} visibility={detail.hti.visibility_score} />}

          {detail.explanation?.reason && !evaluation?.summary && (
            <section className="ci-surface ci-surface--compact">
              <h2 className="ci-title text-base">Analysis Notes</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ci-muted)]">{detail.explanation.reason}</p>
            </section>
          )}

          {detail.summary && (
            <div className="text-right">
              <Link
                href={`/candidates/${candidateId}/summary${jobId ? `?job=${jobId}` : ""}`}
                className="ci-btn-ghost inline-flex"
              >
                View Brief Summary →
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "evidence" && detail.standardized_evidence && detail.standardized_evidence.length > 0 && (
        <div className="ci-evidence-tab">
          <EvidenceSection evidence={detail.standardized_evidence} />
        </div>
      )}

      {activeTab === "graph" && status === "ready" && graphId && <TalentGraphSection graphId={graphId} />}

      {status === "ready" && evaluation && (
        <div className="mt-8 [&_.card]:rounded-[24px] [&_.card]:border-[var(--ci-border)] [&_.card]:shadow-[var(--ci-shadow)]">
          <DecisionCard evaluation={evaluation} detail={detail} />
        </div>
      )}

      {evaluation && (
        <ReasoningDrawer
          open={explainOpen}
          onClose={() => setExplainOpen(false)}
          evaluation={evaluation}
          detail={detail}
        />
      )}
    </div>
  );
}
