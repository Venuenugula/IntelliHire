import type { EvaluationResponse, RecommendationLevel } from "@/lib/types";
import { NEXT_ACTION, RECOMMENDATION_META } from "@/lib/recommendation";
import { displayNextAction } from "@/lib/candidatePresentation";

export function AIReasoningCard({
  evaluation,
  strengths,
  reservations,
  sourceCount,
}: {
  evaluation: EvaluationResponse;
  strengths: string[];
  reservations: string[];
  sourceCount: number;
}) {
  const meta = RECOMMENDATION_META[evaluation.recommendation];

  return (
    <section className="ci-surface ci-animate-in">
      <h2 className="ci-title text-base">Why DELULU recommended &ldquo;{meta.label}&rdquo;</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ReasonGroup title="Strengths" items={strengths.length ? strengths : evaluation.reasons} tone="success" />
        <ReasonGroup title="Risks" items={reservations} tone="warning" />
        <ReasonGroup title="Evidence" items={sourceCount > 0 ? [`${sourceCount} evidence source${sourceCount === 1 ? "" : "s"} analyzed`] : []} tone="info" />
        <ReasonGroup
          title="Missing Signals"
          items={evaluation.interview_focus.map((g) => g.topic)}
          tone="neutral"
        />
      </div>
      <div className="mt-6 rounded-2xl border border-[var(--ci-border)] bg-surface-subtle p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ci-primary)]">Recommendation</p>
        <p className="mt-1 text-sm text-[var(--ci-text)]">{evaluation.summary || meta.label}</p>
      </div>
    </section>
  );
}

function ReasonGroup({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  const border =
    tone === "success" ? "border-emerald-200" : tone === "warning" ? "border-amber-200" : "border-[var(--ci-border)]";
  return (
    <div className={`rounded-2xl border ${border} bg-surface-subtle p-4`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ci-muted)]">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--ci-muted)]">—</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.slice(0, 6).map((item, i) => (
            <li key={`${item}-${i}`} className="text-sm text-[var(--ci-text)]">• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NextActionCard({ recommendation }: { recommendation: RecommendationLevel }) {
  const action = displayNextAction(recommendation);
  const meta = RECOMMENDATION_META[recommendation];

  return (
    <section className="ci-surface ci-animate-in border-[var(--ci-primary)]/20 bg-[#f8f7ff]">
      <p className="ci-label text-[var(--ci-primary)]">Recommended Next Action</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--ci-text)] sm:text-3xl">{action}</p>
      <p className="mt-2 text-sm text-[var(--ci-muted)]">{NEXT_ACTION[recommendation].status}</p>
      <button type="button" className="ci-btn-primary mt-6">
        {action}
      </button>
    </section>
  );
}

export function HTICard({ htiScore, visibility }: { htiScore: number; visibility: number }) {
  return (
    <section className="ci-surface ci-surface--compact ci-animate-in">
      <h2 className="ci-title text-base">Hidden Talent Index</h2>
      <p className="mt-3 text-4xl font-bold text-[var(--ci-primary)]">{htiScore.toFixed(1)}</p>
      <p className="mt-2 text-sm text-[var(--ci-muted)]">Visibility score: {visibility.toFixed(1)}</p>
    </section>
  );
}
