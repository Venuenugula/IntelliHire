"use client";

import { useState } from "react";
import type { InterviewArea } from "@/lib/types";

export function RiskBreakdownPanel({
  evidenceRisk,
  roleGapRisk,
  credibilityRisk,
  riskScore,
}: {
  evidenceRisk?: number;
  roleGapRisk?: number;
  credibilityRisk?: number;
  riskScore?: number;
}) {
  if (evidenceRisk === undefined) return null;

  const items = [
    { label: "Evidence Risk", value: evidenceRisk },
    { label: "Role Gap", value: roleGapRisk ?? 0 },
    { label: "Credibility", value: credibilityRisk ?? 0 },
    { label: "Overall Risk", value: riskScore ?? 0 },
  ];

  return (
    <section className="ci-surface ci-animate-in">
      <h2 className="ci-title text-base">Risk Breakdown</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <RiskBar key={item.label} label={item.label} value={item.value} />
        ))}
      </div>
    </section>
  );
}

function RiskBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, value);
  const color = pct < 30 ? "bg-[var(--ci-success)]" : pct < 60 ? "bg-[var(--ci-warning)]" : "bg-[var(--ci-danger)]";
  return (
    <div className="rounded-2xl border border-[var(--ci-border)] bg-surface-subtle p-4">
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium text-[var(--ci-text)]">{label}</span>
        <span className="font-bold text-[var(--ci-text)]">{pct.toFixed(0)}%</span>
      </div>
      <div className="ci-bar-track">
        <div className={`ci-bar-fill ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function MissingEvidenceAccordions({ gaps }: { gaps: InterviewArea[] }) {
  const [open, setOpen] = useState<string | null>(gaps[0]?.topic ?? null);

  return (
    <section className="ci-surface ci-animate-in">
      <h2 className="ci-title text-base">Missing Evidence</h2>
      {gaps.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ci-muted)]">
          No critical evidence gaps — the evidence base sufficiently covers role requirements.
        </p>
      ) : (
        <div className="mt-5 divide-y divide-[var(--ci-border)] rounded-2xl border border-[var(--ci-border)]">
          {gaps.map((gap) => {
            const isOpen = open === gap.topic;
            return (
              <div key={gap.topic}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : gap.topic)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold text-[var(--ci-text)] hover:bg-surface-subtle"
                >
                  <span>{isOpen ? "▼" : "▶"} {gap.topic}</span>
                </button>
                {isOpen && (
                  <div className="space-y-3 border-t border-[var(--ci-border)] bg-surface-subtle px-4 py-4 text-sm text-[var(--ci-muted)]">
                    <p><strong className="text-[var(--ci-text)]">Reason:</strong> {gap.rationale || "Evidence not yet verified for this requirement."}</p>
                    <p><strong className="text-[var(--ci-text)]">Importance:</strong> Required to validate role fit with confidence.</p>
                    <p><strong className="text-[var(--ci-text)]">Recommendation:</strong> Gather supporting evidence or probe in interview.</p>
                    {gap.suggested_questions.length > 0 && (
                      <ul className="list-disc pl-5">
                        {gap.suggested_questions.map((q) => (
                          <li key={q}>{q}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
