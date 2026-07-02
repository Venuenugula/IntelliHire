import type { CandidateSummary, SourceSummary } from "@/lib/types";
import { sourceIcon } from "@/lib/sources";

function verdictClasses(verdict: string): string {
  if (verdict.startsWith("Strong")) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (verdict.startsWith("Partial")) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-700";
}

function SourceCard({ src }: { src: SourceSummary }) {
  if (!src.available) {
    return (
      <article className="ci-surface ci-surface--compact border-dashed opacity-80">
        <div className="flex items-center gap-2">
          <span className="text-xl opacity-70">{sourceIcon(src.source)}</span>
          <h3 className="text-sm font-semibold text-[var(--ci-text)]">{src.title}</h3>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
            Not available
          </span>
        </div>
        <p className="mt-2 text-sm text-[var(--ci-muted)]">{src.headline}</p>
      </article>
    );
  }

  return (
    <article className="ci-surface ci-surface--hover ci-surface--compact">
      <div className="flex items-center gap-2">
        <span className="text-xl">{sourceIcon(src.source)}</span>
        <h3 className="text-sm font-semibold text-[var(--ci-text)]">{src.title}</h3>
      </div>
      <p className="mt-2 text-sm text-[var(--ci-muted)]">{src.headline}</p>

      {src.stats.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {src.stats.map((st) => (
            <div key={st.label} className="flex justify-between gap-2 border-b border-[var(--ci-border)] py-1.5">
              <dt className="text-[var(--ci-muted)]">{st.label}</dt>
              <dd className="font-semibold text-[var(--ci-text)]">{st.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {src.strengths.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Strengths</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {src.strengths.map((s, i) => (
              <span key={`${s}-${i}`} className="ci-chip text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      {src.weaknesses.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Gaps</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {src.weaknesses.map((w, i) => (
              <span key={`${w}-${i}`} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export function BriefSummary({ summary }: { summary: CandidateSummary }) {
  const { role_fit } = summary;

  return (
    <div className="space-y-6">
      <section className="ci-surface ci-animate-in">
        <p className="ci-label">Role Fit</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className={`rounded-full border px-4 py-2 text-base font-bold ${verdictClasses(role_fit.verdict)}`}>
            {role_fit.verdict}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-[var(--ci-primary)]">{role_fit.fit_score.toFixed(0)}</span>
            <span className="text-sm font-medium text-[var(--ci-muted)]">/ 100 role fit</span>
          </div>
        </div>
        <p className="mt-4 text-[15px] font-medium leading-relaxed text-[var(--ci-text)]">{summary.headline}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ci-muted)]">{role_fit.reason}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {role_fit.matched_skills.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Matched skills</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {role_fit.matched_skills.map((s) => (
                  <span key={s} className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {role_fit.missing_skills.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Missing skills</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {role_fit.missing_skills.map((s) => (
                  <span key={s} className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="ci-title mb-4 text-base">Evidence by Source</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summary.sources.map((src) => (
            <SourceCard key={src.source} src={src} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="ci-surface ci-surface--compact border-emerald-200/60 bg-emerald-50/30">
          <p className="text-sm font-semibold text-emerald-800">Overall Strengths</p>
          {summary.overall_strengths.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {summary.overall_strengths.map((s, i) => (
                <li key={`${s}-${i}`} className="flex items-start gap-2 text-sm text-[var(--ci-text)]">
                  <span className="mt-0.5 text-emerald-600">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[var(--ci-muted)]">No notable strengths surfaced.</p>
          )}
        </section>
        <section className="ci-surface ci-surface--compact border-amber-200/60 bg-amber-50/30">
          <p className="text-sm font-semibold text-amber-800">Overall Weaknesses</p>
          {summary.overall_weaknesses.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {summary.overall_weaknesses.map((w, i) => (
                <li key={`${w}-${i}`} className="flex items-start gap-2 text-sm text-[var(--ci-text)]">
                  <span className="mt-0.5 text-amber-600">!</span>
                  {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[var(--ci-muted)]">No notable weaknesses surfaced.</p>
          )}
        </section>
      </div>
    </div>
  );
}
