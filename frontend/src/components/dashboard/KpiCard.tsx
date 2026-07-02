import { Sparkline } from "./Sparkline";

type KpiTone = "green" | "purple" | "blue" | "amber";

const TONE_STYLES: Record<KpiTone, { accent: string; bg: string; text: string }> = {
  green: { accent: "#10b981", bg: "#ecfdf5", text: "#059669" },
  purple: { accent: "#7c3aed", bg: "#f5f3ff", text: "#7c3aed" },
  blue: { accent: "#3b82f6", bg: "#eff6ff", text: "#2563eb" },
  amber: { accent: "#f59e0b", bg: "#fffbeb", text: "#d97706" },
};

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  tone?: KpiTone;
  sparkData?: number[];
}

export function KpiCard({ label, value, trend, trendUp = true, tone = "purple", sparkData }: KpiCardProps) {
  const style = TONE_STYLES[tone];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trendUp ? "text-emerald-600" : "text-amber-600"}`}>
              {trend}
            </p>
          )}
        </div>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: style.bg, color: style.text }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </span>
      </div>
      <div className="mt-3">
        <Sparkline color={style.accent} data={sparkData} className="h-8" />
      </div>
    </div>
  );
}
