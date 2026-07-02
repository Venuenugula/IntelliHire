"use client";

import type { CandidateDetail, EvaluationResponse } from "@/lib/types";
import type { EvaluationStatus } from "@/lib/useEvaluation";
import {
  displayNextAction,
  learningVelocityLabel,
  metaChips,
  potentialLabel,
  riskLevelLabel,
} from "@/lib/candidatePresentation";
import { RECOMMENDATION_META } from "@/lib/recommendation";
import { useState } from "react";

interface DecisionHeroProps {
  detail: CandidateDetail;
  evaluation: EvaluationResponse | null;
  status: EvaluationStatus;
  jobTitle?: string | null;
  rankingsHref?: string | null;
  onRetry: () => void;
  onExplain?: () => void;
  onExport: () => void;
}

export function DecisionHero({
  detail,
  evaluation,
  status,
  jobTitle,
  rankingsHref,
  onRetry,
  onExplain,
  onExport,
}: DecisionHeroProps) {
  const [copied, setCopied] = useState(false);
  const meta = evaluation ? RECOMMENDATION_META[evaluation.recommendation] : null;
  const chips = metaChips(detail, jobTitle, !!evaluation);
  const fitScore = evaluation ? Math.round(evaluation.score * 100) : detail.capability?.capability_score ?? 0;
  const confidence = evaluation ? Math.round(evaluation.confidence * 100) : 0;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  return (
    <section className="ci-surface ci-animate-in mb-8">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <div className="min-w-0 flex-1">
          <p className="ci-label">Candidate Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--ci-text)] sm:text-4xl">{detail.name}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                { id: "role", label: chips.role },
                { id: "location", label: chips.location },
                { id: "experience", label: chips.experience },
                { id: "availability", label: chips.availability },
              ] as const
            )
              .filter((chip) => chip.label && chip.label !== "—")
              .map((chip) => (
                <span
                  key={chip.id}
                  className="rounded-full border border-[var(--ci-border)] bg-surface-subtle px-3 py-1 text-xs font-medium text-[var(--ci-muted)]"
                >
                  {chip.label}
                </span>
              ))}
          </div>

          <div className="mt-6">
            {status === "loading" && (
              <span className="inline-flex items-center gap-2 text-sm text-[var(--ci-muted)]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--ci-primary)]" />
                Generating hiring intelligence…
              </span>
            )}
            {status === "error" && (
              <span className="text-sm text-[var(--ci-muted)]">
                Couldn&apos;t generate recommendation.{" "}
                <button type="button" onClick={onRetry} className="font-semibold text-[var(--ci-primary)]">
                  Retry
                </button>
              </span>
            )}
            {meta && evaluation && (
              <span className={`inline-flex items-center rounded-full border px-5 py-2 text-base font-bold ${meta.pill}`}>
                {meta.label}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <HeroStat label="Confidence" value={confidence > 0 ? `${confidence}%` : "—"} accent />
          <HeroStat label="Fit Score" value={`${Math.round(fitScore)}%`} />
          <HeroStat label="Potential" value={potentialLabel(detail.hti?.hti_score, detail.capability?.capability_score)} />
          <HeroStat label="Learning Velocity" value={learningVelocityLabel(detail.capability?.learning_velocity)} />
          <HeroStat label="Risk" value={riskLevelLabel(detail.risk?.risk_score)} warn={detail.risk && detail.risk.risk_score >= 60} />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--ci-border)] pt-6">
        {evaluation && (
          <button type="button" className="ci-btn-primary">
            {displayNextAction(evaluation.recommendation)}
          </button>
        )}
        {rankingsHref && (
          <a href={rankingsHref} className="ci-btn-ghost">
            Compare
          </a>
        )}
        <button type="button" onClick={onExport} className="ci-btn-ghost">
          Export
        </button>
        <button type="button" onClick={copyLink} className="ci-btn-ghost">
          {copied ? "Copied!" : "Share"}
        </button>
        {onExplain && (
          <button type="button" onClick={onExplain} className="ci-btn-ghost">
            Why?
          </button>
        )}
      </div>
    </section>
  );
}

function HeroStat({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-2xl border border-[var(--ci-border)] bg-surface-subtle px-4 py-3 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--ci-muted)]">{label}</p>
      <p
        className={`mt-1 text-xl font-bold ${warn ? "text-[var(--ci-danger)]" : accent ? "text-[var(--ci-primary)]" : "text-[var(--ci-text)]"}`}
      >
        {value}
      </p>
    </div>
  );
}
