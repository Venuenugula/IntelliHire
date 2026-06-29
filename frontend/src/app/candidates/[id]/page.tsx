"use client";

import { CapabilityRadar } from "@/components/charts/CapabilityRadar";
import { getCandidateDetail } from "@/lib/api";
import type { CandidateDetail, CandidateSummary } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = params.id as string;
  const [detail, setDetail] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    getCandidateDetail(candidateId)
      .then(setDetail)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [candidateId]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;
  if (!detail) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/dashboard" className="mb-6 inline-block text-sm text-violet-600 hover:underline">
        ← Back to dashboard
      </Link>

      <h1 className="mb-8 text-3xl font-bold">{detail.name}</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {detail.capability && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold">Capability Profile</h2>
            <CapabilityRadar capability={detail.capability} />
            <p className="mt-4 text-center text-2xl font-bold text-violet-600">
              {detail.capability.capability_score.toFixed(1)}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {detail.risk && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold">Risk Breakdown</h2>
              <ul className="space-y-2 text-sm">
                <li>Evidence Risk: {detail.risk.evidence_risk.toFixed(1)}</li>
                <li>Role Gap Risk: {detail.risk.role_gap_risk.toFixed(1)}</li>
                <li>Credibility Risk: {detail.risk.credibility_risk.toFixed(1)}</li>
                <li className="font-semibold">Total Risk: {detail.risk.risk_score.toFixed(1)}</li>
              </ul>
            </div>
          )}

          {detail.hti && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold">Hidden Talent Index</h2>
              <p className="text-sm text-zinc-500">Visibility: {detail.hti.visibility_score.toFixed(1)}</p>
              <p className="text-2xl font-bold text-violet-600">HTI: {detail.hti.hti_score.toFixed(1)}</p>
            </div>
          )}

          {detail.explanation && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Explanation</h2>
                {detail.summary && (
                  <button
                    type="button"
                    onClick={() => setShowSummary((s) => !s)}
                    className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                  >
                    {showSummary ? "Hide brief summary" : "📋 Brief Summary"}
                  </button>
                )}
              </div>
              <p className="mb-4 text-sm">{detail.explanation.reason}</p>
              {detail.explanation.strengths.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-emerald-600">Strengths</p>
                  <ul className="list-inside list-disc text-sm">
                    {detail.explanation.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {detail.explanation.risks.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-amber-600">Risks</p>
                  <ul className="list-inside list-disc text-sm">
                    {detail.explanation.risks.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showSummary && detail.summary && (
        <BriefSummaryPanel summary={detail.summary} name={detail.name} />
      )}
    </div>
  );
}

function verdictClasses(verdict: string): string {
  if (verdict.startsWith("Strong")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  if (verdict.startsWith("Partial")) return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
}

function BriefSummaryPanel({ summary, name }: { summary: CandidateSummary; name: string }) {
  return (
    <div className="mt-8 rounded-xl border border-violet-200 bg-violet-50/40 p-6 dark:border-violet-900 dark:bg-violet-950/20">
      <h2 className="mb-2 text-xl font-bold">Brief Summary — {name}</h2>
      <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-300">{summary.headline}</p>

      {/* Role fit */}
      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${verdictClasses(summary.role_fit.verdict)}`}>
            {summary.role_fit.verdict}
          </span>
          <span className="text-sm text-zinc-500">Role fit score: {summary.role_fit.fit_score.toFixed(0)}/100</span>
        </div>
        <p className="mb-3 text-sm">{summary.role_fit.reason}</p>
        <div className="flex flex-wrap gap-4 text-xs">
          {summary.role_fit.matched_skills.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-emerald-600">Matched skills</p>
              <div className="flex flex-wrap gap-1">
                {summary.role_fit.matched_skills.map((s) => (
                  <span key={s} className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {summary.role_fit.missing_skills.length > 0 && (
            <div>
              <p className="mb-1 font-medium text-red-600">Missing skills</p>
              <div className="flex flex-wrap gap-1">
                {summary.role_fit.missing_skills.map((s) => (
                  <span key={s} className="rounded-full bg-red-100 px-2 py-0.5 text-red-700 dark:bg-red-950 dark:text-red-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Per-source breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {summary.sources.map((src) => (
          <div key={src.source} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-semibold">{src.title}</h3>
            </div>
            <p className="mb-3 text-xs text-zinc-500">{src.headline}</p>

            {src.stats.length > 0 && (
              <dl className="mb-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                {src.stats.map((st) => (
                  <div key={st.label} className="flex justify-between gap-2 border-b border-zinc-100 py-0.5 dark:border-zinc-800">
                    <dt className="text-zinc-500">{st.label}</dt>
                    <dd className="text-right font-medium">{st.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {src.strengths.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-emerald-600">Strengths</p>
                <ul className="list-inside list-disc text-xs text-zinc-700 dark:text-zinc-300">
                  {src.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {src.weaknesses.length > 0 && (
              <div>
                <p className="text-xs font-medium text-amber-600">Weaknesses</p>
                <ul className="list-inside list-disc text-xs text-zinc-700 dark:text-zinc-300">
                  {src.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overall */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-zinc-900">
          <p className="mb-2 font-semibold text-emerald-600">Overall Strengths</p>
          {summary.overall_strengths.length > 0 ? (
            <ul className="list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
              {summary.overall_strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">No notable strengths surfaced.</p>
          )}
        </div>
        <div className="rounded-lg border border-amber-200 bg-white p-4 dark:border-amber-900 dark:bg-zinc-900">
          <p className="mb-2 font-semibold text-amber-600">Overall Weaknesses</p>
          {summary.overall_weaknesses.length > 0 ? (
            <ul className="list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
              {summary.overall_weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">No notable weaknesses surfaced.</p>
          )}
        </div>
      </div>
    </div>
  );
}
