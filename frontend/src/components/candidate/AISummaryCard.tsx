export function AISummaryCard({ summary, recommendation }: { summary: string; recommendation?: string }) {
  const lines = summary.split(/\n+/).filter(Boolean).slice(0, 5);
  return (
    <section className="ci-surface ci-animate-in">
      <h2 className="ci-title text-base">AI Hiring Summary</h2>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-[var(--ci-muted)]">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      {recommendation && (
        <div className="mt-5 rounded-2xl border border-[var(--ci-border)] bg-surface-subtle px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ci-primary)]">Recommendation</p>
          <p className="mt-1 text-sm font-medium text-[var(--ci-text)]">{recommendation}</p>
        </div>
      )}
    </section>
  );
}
