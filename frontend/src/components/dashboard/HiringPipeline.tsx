import type { PipelineStage } from "@/lib/dashboardInsights";
import Link from "next/link";

export function HiringPipeline({ stages, jobId }: { stages: PipelineStage[]; jobId?: string }) {
  return (
    <section className="rc-surface rc-animate-in">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="rc-title text-base">Hiring Pipeline</h2>
        {jobId && (
          <Link href={`/jobs/${jobId}/candidates`} className="text-sm font-semibold text-[#6d5df6] hover:underline">
            View candidates
          </Link>
        )}
      </div>

      <div className="space-y-0">
        {stages.map((stage, i) => (
          <div key={stage.key} className="group">
            <Link
              href={jobId ? `/jobs/${jobId}/candidates` : "/jobs"}
              className="flex items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-surface-subtle"
            >
              <div className="flex w-8 flex-col items-center">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition group-hover:scale-105"
                  style={{
                    borderColor: stage.count > 0 ? "#6d5df6" : "#e8edf5",
                    color: stage.count > 0 ? "#6d5df6" : "#94a3b8",
                    background: stage.count > 0 ? "#f5f3ff" : "#fff",
                  }}
                >
                  {stage.count}
                </span>
                {i < stages.length - 1 && <span className="my-1 h-6 w-px bg-[var(--rc-border)]" aria-hidden />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--rc-text)]">{stage.label}</p>
                  <div className="flex gap-3 text-xs text-[var(--rc-muted)]">
                    {stage.conversion !== undefined && stage.count > 0 && <span>{stage.conversion}% conversion</span>}
                    {stage.dropOff !== undefined && stage.dropOff > 0 && (
                      <span className="text-amber-600">−{stage.dropOff} drop-off</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f1f5f9]">
                  <div
                    className="h-full rounded-full bg-[#6d5df6] transition-all duration-500"
                    style={{ width: `${Math.min(100, (stage.count / Math.max(stages[0]?.count ?? 1, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
