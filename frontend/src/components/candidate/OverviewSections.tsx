import { sourceIcon } from "@/lib/sources";

const CHIP_ICONS = ["⚡", "◆", "◎", "✦", "▣", "◈", "✓", "⬡", "◉", "✳", "◇", "▲"];

export function StrengthChips({ items }: { items: string[] }) {
  return (
    <section className="ci-surface ci-surface--hover ci-animate-in">
      <h2 className="ci-title text-base">Key Strengths</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ci-muted)]">No strengths surfaced yet.</p>
      ) : (
        <div className="ci-stagger mt-5 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={`${item}-${i}`} className="ci-chip">
              <span aria-hidden>{CHIP_ICONS[i % CHIP_ICONS.length]}</span>
              {item.length > 42 ? `${item.slice(0, 42)}…` : item}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export function RiskCards({ items }: { items: Array<{ title: string; severity: string; explanation: string }> }) {
  const tone = (s: string) =>
    s === "High" ? "border-red-200 bg-red-50 text-red-700" : s === "Medium" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <section className="ci-surface ci-animate-in">
      <h2 className="ci-title text-base">Key Risks</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ci-muted)]">No material risks identified.</p>
      ) : (
        <div className="ci-stagger mt-5 space-y-3">
          {items.map((item, i) => (
            <div key={`${item.title}-${i}`} className="rounded-2xl border border-[var(--ci-border)] bg-surface-subtle p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--ci-text)]">{item.title}</p>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${tone(item.severity)}`}>
                  {item.severity}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--ci-muted)]">{item.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function EvidenceSourceGrid({ sources }: { sources: Array<{ source: string; label: string; score: number | null; status: string }> }) {
  return (
    <section className="ci-surface ci-animate-in">
      <h2 className="ci-title text-base">Evidence Sources</h2>
      <div className="ci-stagger mt-5 grid gap-3 sm:grid-cols-2">
        {sources.map((src) => (
          <div key={src.source} className="rounded-2xl border border-[var(--ci-border)] bg-surface-subtle p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{sourceIcon(src.source)}</span>
                <p className="text-sm font-semibold text-[var(--ci-text)]">{src.label}</p>
              </div>
              <StatusPill status={src.status} />
            </div>
            <p className="mt-3 text-2xl font-bold text-[var(--ci-text)]">{src.score !== null ? `${src.score}%` : "—"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "Verified"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Partial"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-500";
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${cls}`}>{status}</span>;
}
