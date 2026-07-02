// Evidence section for the candidate profile. Renders the backend's canonical,
// explainable evidence (EvidenceObject) — per-source summary, extracted skills,
// signals and highlights — so the recruiter can see *why* a candidate scores the
// way they do, not just the score. Composed from existing DELULU primitives
// (glass cards, ScoreRing, chips) so it reads as a native part of the profile.

import type { EvidenceObject } from "@/lib/types";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { sourceIcon, sourceLabel } from "@/lib/sources";

function EvidenceCard({ ev }: { ev: EvidenceObject }) {
  const hasRelevance = typeof ev.relevance_score === "number";

  return (
    <div className="glass glass-hover relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-600/15 blur-2xl" />

      <div className="relative flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-lg" aria-hidden>
              {sourceIcon(ev.source)}
            </span>
            <h3 className="font-semibold text-white">{sourceLabel(ev.source)}</h3>
            <span
              className="chip ml-1 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/55"
              title="How much this source is weighted for reliability"
            >
              {Math.round(ev.reliability * 100)}% reliable
            </span>
          </div>
          {ev.summary && <p className="text-sm text-white/65">{ev.summary}</p>}
        </div>

        {hasRelevance && (
          <ScoreRing value={ev.relevance_score as number} sublabel="fit" tone="violet" size={64} stroke={6} />
        )}
      </div>

      {ev.error ? (
        <p className="relative mt-3 text-xs text-amber-300/80">Source could not be fully analyzed: {ev.error}</p>
      ) : (
        <>
          {ev.skills.length > 0 && (
            <div className="relative mt-4 flex flex-wrap gap-1.5">
              {ev.skills.slice(0, 12).map((s) => (
                <span key={s} className="chip px-2.5 py-0.5 text-xs text-white/70">
                  {s}
                </span>
              ))}
            </div>
          )}

          {ev.signals.length > 0 && (
            <dl className="relative mt-4 space-y-1.5">
              {ev.signals.map((sig) => (
                <div key={sig.label} className="flex items-start justify-between gap-3 border-b border-white/5 pb-1.5 last:border-0">
                  <dt className="text-xs uppercase tracking-wide text-white/40">{sig.label.replace(/_/g, " ")}</dt>
                  <dd className="text-right text-xs text-white/80">{sig.detail}</dd>
                </div>
              ))}
            </dl>
          )}

          {ev.highlights.length > 0 && (
            <div className="relative mt-4">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-emerald-300/80">Highlights</p>
              <div className="flex flex-wrap gap-1.5">
                {ev.highlights.slice(0, 8).map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-xs text-emerald-200"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {ev.source_url && (
        <div className="relative mt-4">
          <a
            href={ev.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-violet-300 hover:text-violet-200"
          >
            View source →
          </a>
        </div>
      )}
    </div>
  );
}

export function EvidenceSection({ evidence }: { evidence: EvidenceObject[] }) {
  if (!evidence || evidence.length === 0) return null;

  return (
    <section id="evidence" className="mt-7 scroll-mt-24">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-lg font-semibold text-white">Evidence</h2>
        <span className="text-xs text-white/40">{evidence.length} source{evidence.length === 1 ? "" : "s"} analyzed</span>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {evidence.map((ev) => (
          <EvidenceCard key={ev.source} ev={ev} />
        ))}
      </div>
    </section>
  );
}
