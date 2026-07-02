import type { FindingItem } from "@/lib/dashboardInsights";

const ICONS: Record<FindingItem["tone"], string> = {
  success: "✓",
  info: "◎",
  warning: "!",
  neutral: "·",
};

const TONE_CLASS: Record<FindingItem["tone"], string> = {
  success: "bg-emerald-50 text-emerald-600",
  info: "bg-violet-50 text-[#6d5df6]",
  warning: "bg-amber-50 text-amber-600",
  neutral: "bg-slate-100 text-slate-500",
};

export function AIFindingsTimeline({ items }: { items: FindingItem[] }) {
  return (
    <section className="rc-surface rc-animate-in">
      <h2 className="rc-title text-base">Recent AI Findings</h2>
      <div className="rc-stagger mt-6 space-y-0">
        {items.map((item, i) => (
          <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < items.length - 1 && (
              <span className="absolute left-[15px] top-9 bottom-0 w-px bg-[var(--rc-border)]" aria-hidden />
            )}
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${TONE_CLASS[item.tone]}`}>
              {ICONS[item.tone]}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <time className="text-xs font-semibold tabular-nums text-[var(--rc-muted)]">{item.time}</time>
                <p className="text-sm font-semibold text-[var(--rc-text)]">{item.title}</p>
              </div>
              <p className="mt-1 text-sm text-[var(--rc-muted)]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
