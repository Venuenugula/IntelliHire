export function EvidenceBreakdown({ items }: { items: Array<{ label: string; value: number }> }) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <section className="ci-surface ci-animate-in">
      <h2 className="ci-title text-base">Evidence Breakdown</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ci-muted)]">Evidence breakdown will appear after analysis.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--ci-text)]">{item.label}</span>
                <span className="font-semibold text-[var(--ci-muted)]">{item.value}%</span>
              </div>
              <div className="ci-bar-track">
                <div
                  className="ci-bar-fill bg-[var(--ci-primary)]"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function EvidenceTimeline({ events }: { events: Array<{ id: string; title: string; description: string; tone: string }> }) {
  const dot = (tone: string) =>
    tone === "success" ? "bg-emerald-500" : tone === "warning" ? "bg-amber-500" : tone === "info" ? "bg-[var(--ci-primary)]" : "bg-slate-300";

  return (
    <section className="ci-surface ci-animate-in">
      <h2 className="ci-title text-base">Recent Evidence Timeline</h2>
      <div className="ci-stagger mt-6 space-y-0">
        {events.map((event, i) => (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < events.length - 1 && <span className="absolute left-[7px] top-4 bottom-0 w-px bg-[var(--ci-border)]" aria-hidden />}
            <span className={`relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full ${dot(event.tone)}`} aria-hidden />
            <div>
              <p className="text-sm font-semibold text-[var(--ci-text)]">{event.title}</p>
              <p className="mt-1 text-sm text-[var(--ci-muted)]">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
