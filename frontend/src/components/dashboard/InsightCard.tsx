import { Sparkline } from "./Sparkline";

type InsightTone = "success" | "primary" | "warning" | "neutral";

const TONE_COLORS: Record<InsightTone, string> = {
  success: "#22c55e",
  primary: "#6d5df6",
  warning: "#f59e0b",
  neutral: "#94a3b8",
};

interface InsightCardProps {
  label: string;
  status?: string;
  value: string;
  detail: string;
  tone?: InsightTone;
  sparkData?: number[];
  tall?: boolean;
}

export function InsightCard({ label, status, value, detail, tone = "primary", sparkData, tall }: InsightCardProps) {
  const color = TONE_COLORS[tone];

  return (
    <article className={`rc-surface rc-surface--hover rc-surface--compact ${tall ? "min-h-[200px]" : "min-h-[168px]"} flex flex-col`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="rc-label">{label}</p>
          {status && (
            <p className="mt-2 text-sm font-semibold" style={{ color }}>
              {status}
            </p>
          )}
          <p className="rc-metric mt-1">{value}</p>
        </div>
        {status && (
          <span
            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: color, boxShadow: `0 0 0 4px ${color}22` }}
            aria-hidden
          />
        )}
      </div>
      <p className="rc-detail flex-1">{detail}</p>
      <div className="mt-4">
        <Sparkline color={color} data={sparkData} className="h-9" />
      </div>
    </article>
  );
}
