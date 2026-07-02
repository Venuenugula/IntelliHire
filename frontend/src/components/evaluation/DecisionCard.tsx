"use client";

// Decision Intelligence — the final, self-contained decision panel on the
// candidate profile. Answers "can I confidently move this candidate forward?"
// by consolidating the verdict, confidence, overall risk, recommended next
// action, strengths, reservations, missing evidence, and what strengthened vs
// tempered DELULU's confidence. All from data already fetched (no new request).

import { useState } from "react";
import type { CandidateDetail, EvaluationResponse } from "@/lib/types";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { BulletList } from "@/components/ui/BulletList";
import { NEXT_ACTION, RECOMMENDATION_META, confidenceTone } from "@/lib/recommendation";

interface DecisionCardProps {
  evaluation: EvaluationResponse;
  detail: CandidateDetail;
}

function riskDescriptor(score: number): string {
  if (score < 35) return "text-emerald-600";
  if (score < 60) return "text-amber-600";
  return "text-red-600";
}

function Stat({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${className ?? "text-gray-900"}`}>{value}</p>
      <p className="text-[11px] text-gray-400">{label}</p>
    </div>
  );
}

function plural(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

/** Build a plain-text evaluation report for download — recruiter-readable, no backend. */
function buildReport(name: string, evaluation: EvaluationResponse, detail: CandidateDetail): string {
  const meta = RECOMMENDATION_META[evaluation.recommendation];
  const action = NEXT_ACTION[evaluation.recommendation];
  const strengths = detail.summary?.overall_strengths ?? detail.explanation?.strengths ?? [];
  const lines = [
    `DELULU — Candidate Evaluation`,
    name,
    ``,
    `Recommendation:  ${meta.label} (${action.status})`,
    `Confidence:      ${Math.round(evaluation.confidence * 100)}%`,
    `Decision score:  ${Math.round(evaluation.score * 100)}`,
    `Next action:     ${action.action}`,
    ``,
    `Decision summary`,
    evaluation.summary || "—",
    ``,
    `Strengths`,
    ...(strengths.length ? strengths.map((s) => `  • ${s}`) : ["  —"]),
    ``,
    `Reservations`,
    ...(evaluation.reservations.length ? evaluation.reservations.map((r) => `  • ${r}`) : ["  —"]),
    ``,
    `Missing evidence`,
    ...(evaluation.interview_focus.length
      ? evaluation.interview_focus.map((g) => `  • ${g.topic}${g.rationale ? ` — ${g.rationale}` : ""}`)
      : ["  —"]),
  ];
  return lines.join("\n");
}

export function DecisionCard({ evaluation, detail }: DecisionCardProps) {
  const [copied, setCopied] = useState(false);

  function exportReport() {
    const blob = new Blob([buildReport(detail.name, evaluation, detail)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${detail.name.replace(/\s+/g, "_")}_evaluation.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  const meta = RECOMMENDATION_META[evaluation.recommendation];
  const action = NEXT_ACTION[evaluation.recommendation];
  const strengths = detail.summary?.overall_strengths ?? detail.explanation?.strengths ?? [];
  const reservations = evaluation.reservations;
  const missing = evaluation.interview_focus; // gap-derived: unmet requirements + why
  const roleFit = detail.summary?.role_fit;
  const sourceCount = detail.standardized_evidence?.length ?? 0;
  const risk = detail.risk;

  // What moved DELULU's confidence, from real counts.
  const strengthened: string[] = [];
  if (evaluation.reasons.length) strengthened.push(plural(evaluation.reasons.length, "supporting reason"));
  if (roleFit?.matched_skills.length) strengthened.push(plural(roleFit.matched_skills.length, "matched requirement"));
  if (sourceCount) strengthened.push(plural(sourceCount, "evidence source"));

  const tempered: string[] = [];
  if (reservations.length) tempered.push(plural(reservations.length, "reservation"));
  if (missing.length) tempered.push(plural(missing.length, "evidence gap"));
  if (roleFit?.missing_skills.length) tempered.push(plural(roleFit.missing_skills.length, "unmet requirement"));

  return (
    <section className="mt-7">
      <div className="card relative overflow-hidden p-6">
        <div className="relative mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-violet-600">Decision</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${meta.pill}`}>
                {meta.label}
              </span>
              <span className="text-sm text-gray-500">{action.status}</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <ScoreRing
              value={evaluation.confidence * 100}
              label="Confidence"
              sublabel="conf"
              tone={confidenceTone(evaluation.confidence)}
            />
            <Stat value={(evaluation.score * 100).toFixed(0)} label="score" className="text-violet-600" />
            {risk && <Stat value={risk.risk_score.toFixed(0)} label="risk" className={riskDescriptor(risk.risk_score)} />}
          </div>
        </div>

        <div className="relative mb-6 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Recommended next action</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-900">{action.action}</p>
        </div>

        <div className="relative grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-emerald-600">Strengths</p>
            {strengths.length > 0 ? (
              <BulletList items={strengths} tone="bg-emerald-500" />
            ) : (
              <p className="text-sm text-gray-400">No standout strengths surfaced.</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-amber-600">Reservations</p>
            {reservations.length > 0 ? (
              <BulletList items={reservations} tone="bg-amber-500" />
            ) : (
              <p className="text-sm text-gray-400">No material reservations surfaced.</p>
            )}
          </div>
        </div>

        <div className="relative mt-6">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-500">Missing evidence</p>
          {missing.length > 0 ? (
            <div className="space-y-2">
              {missing.map((gap, i) => (
                <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{gap.topic}</p>
                  {gap.rationale && <p className="mt-0.5 text-xs text-gray-500">{gap.rationale}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No critical evidence gaps — the evidence base sufficiently covers the role&apos;s requirements.
            </p>
          )}
        </div>

        <div className="relative mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-emerald-600">
              Strengthened confidence
            </p>
            {strengthened.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {strengthened.map((s) => (
                  <span key={s} className="chip px-2.5 py-0.5 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-amber-600">Tempered confidence</p>
            {tempered.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tempered.map((t) => (
                  <span key={t} className="chip px-2.5 py-0.5 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
          <button onClick={exportReport} className="btn-secondary rounded-lg px-4 py-2 text-sm font-medium">
            Export report
          </button>
          <button onClick={copyLink} className="btn-secondary rounded-lg px-4 py-2 text-sm font-medium">
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>
    </section>
  );
}
