"use client";

// Explainability slide-over — answers "why did DELULU make this recommendation?".
// Composes the real intelligence into a top-down narrative: verdict → confidence
// → AI summary → reasons → reservations → role alignment (matched/unmet
// requirements) → the on-page evidence basis. No fabricated per-reason links; the
// evidence layer is reached via an anchored jump to the existing Evidence section.

import { useEffect, useRef } from "react";
import type { CandidateDetail, EvaluationResponse } from "@/lib/types";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { BulletList } from "@/components/ui/BulletList";
import { RECOMMENDATION_META, confidenceLabel, confidenceTone } from "@/lib/recommendation";

interface ReasoningDrawerProps {
  open: boolean;
  onClose: () => void;
  evaluation: EvaluationResponse;
  detail: CandidateDetail;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/40">{title}</p>
      {children}
    </div>
  );
}

export function ReasoningDrawer({ open, onClose, evaluation, detail }: ReasoningDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // While open: focus the panel, trap Tab within it, Escape to close, lock body
  // scroll, and restore focus to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  const meta = RECOMMENDATION_META[evaluation.recommendation];
  const roleFit = detail.summary?.role_fit;
  const sourceCount = detail.standardized_evidence?.length ?? 0;
  const reasoningMode = typeof evaluation.meta?.reasoning_mode === "string" ? evaluation.meta.reasoning_mode : null;

  function goToEvidence() {
    onClose();
    requestAnimationFrame(() =>
      document.getElementById("evidence")?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Why this recommendation"
        aria-hidden={!open}
        className={`glass fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto rounded-none border-l border-white/10 p-6 transition-transform duration-300 ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-violet-300">
              Why this recommendation
            </p>
            <div className="mt-2">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${meta.pill}`}>
                {meta.label}
              </span>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="btn-ghost rounded-lg px-2.5 py-1 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <ScoreRing value={evaluation.confidence * 100} tone={confidenceTone(evaluation.confidence)} sublabel="conf" />
          <div>
            <p className="text-sm font-medium text-white">{confidenceLabel(evaluation.confidence)}</p>
            {reasoningMode && (
              <p className="text-xs text-white/40">Reasoning: {reasoningMode.replace(/_/g, " ")}</p>
            )}
          </div>
        </div>

        {evaluation.summary && (
          <p className="mb-6 whitespace-pre-line text-sm leading-relaxed text-white/75">{evaluation.summary}</p>
        )}

        {evaluation.reasons.length > 0 && (
          <Section title="Reasons">
            <BulletList items={evaluation.reasons} tone="bg-emerald-400" />
          </Section>
        )}

        <Section title="Reservations">
          {evaluation.reservations.length > 0 ? (
            <BulletList items={evaluation.reservations} tone="bg-amber-400" />
          ) : (
            <p className="text-sm text-white/45">No material reservations surfaced.</p>
          )}
        </Section>

        {roleFit && (
          <Section title="Role Alignment">
            <p className="mb-2 text-sm text-white/70">
              {roleFit.verdict} <span className="text-white/40">· {roleFit.fit_score.toFixed(0)}/100 fit</span>
            </p>
            {roleFit.matched_skills.length > 0 && (
              <div className="mb-2">
                <p className="mb-1 text-xs font-medium text-emerald-300">Matched requirements</p>
                <div className="flex flex-wrap gap-1.5">
                  {roleFit.matched_skills.map((s) => (
                    <span key={s} className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs text-emerald-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {roleFit.missing_skills.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-red-300">Unmet requirements</p>
                <div className="flex flex-wrap gap-1.5">
                  {roleFit.missing_skills.map((s) => (
                    <span key={s} className="rounded-full border border-red-400/30 bg-red-400/10 px-2.5 py-0.5 text-xs text-red-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {sourceCount > 0 && (
          <Section title="Evidence basis">
            <p className="mb-2 text-sm text-white/70">
              Grounded in evidence from {sourceCount} source{sourceCount === 1 ? "" : "s"}.
            </p>
            <button onClick={goToEvidence} className="text-sm font-medium text-violet-300 hover:text-violet-200">
              View supporting evidence ↓
            </button>
          </Section>
        )}
      </aside>
    </>
  );
}
