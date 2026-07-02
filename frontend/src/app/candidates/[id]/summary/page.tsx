"use client";

import { BriefSummary } from "@/components/summary/BriefSummary";
import { getCandidateDetail } from "@/lib/api";
import { riskLevelLabel } from "@/lib/candidatePresentation";
import type { CandidateDetail } from "@/lib/types";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import "@/components/candidate/candidate-workspace.css";

export default function CandidateSummaryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const candidateId = params.id as string;
  const jobId = searchParams.get("job");
  const [detail, setDetail] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCandidateDetail(candidateId)
      .then(setDetail)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [candidateId]);

  if (loading) return <div className="ci-workspace text-[var(--ci-muted)]">Loading summary…</div>;
  if (error) return <div className="ci-workspace text-red-600">{error}</div>;
  if (!detail) return null;

  const backHref = `/candidates/${candidateId}${jobId ? `?job=${jobId}` : ""}`;

  return (
    <div className="ci-workspace">
      <Link href={backHref} className="mb-6 inline-flex text-sm font-semibold text-[var(--ci-primary)] hover:underline">
        ← Back to candidate
      </Link>

      <header className="ci-surface ci-surface--compact mb-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="ci-label">Brief Summary</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ci-text)]">{detail.name}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {detail.capability && (
            <MetricPill label="Capability" value={`${detail.capability.capability_score.toFixed(0)}`} tone="primary" />
          )}
          {detail.hti && <MetricPill label="HTI" value={`${detail.hti.hti_score.toFixed(0)}`} tone="info" />}
          {detail.risk && (
            <MetricPill label="Risk" value={riskLevelLabel(detail.risk.risk_score)} tone={detail.risk.risk_score >= 60 ? "danger" : "warning"} />
          )}
        </div>
      </header>

      {detail.summary ? (
        <BriefSummary summary={detail.summary} />
      ) : (
        <section className="ci-surface">
          <p className="text-sm text-[var(--ci-muted)]">
            No summary is available yet — the candidate may still be analyzing.
          </p>
        </section>
      )}
    </div>
  );
}

function MetricPill({ label, value, tone }: { label: string; value: string; tone: "primary" | "info" | "warning" | "danger" }) {
  const cls =
    tone === "primary"
      ? "border-violet-200 bg-violet-50 text-violet-700"
      : tone === "info"
        ? "border-sky-200 bg-sky-50 text-sky-700"
        : tone === "danger"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div className={`min-w-[100px] rounded-2xl border px-4 py-3 text-center ${cls}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
