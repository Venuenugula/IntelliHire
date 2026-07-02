// Role DNA — the recruiter-facing view of the backend's Role Blueprint.
// Renders the hiring intent DELULU derives from a job description: critical
// skills, traits, capability weighting and evidence expectations. Confidence
// from each AI extraction is surfaced as a subtle signal dot so the panel reads
// as evidence-driven, not a static form. Sections with no data are hidden, so
// the panel fills out on its own as the JD parser gets richer.

import type { ExtractedField, RoleBlueprint, SkillField } from "@/lib/types";

// Same thresholds the backend uses for ConfidenceLevel (green/yellow/red).
function confidenceTone(confidence: number): string {
  if (confidence > 0.85) return "bg-emerald-400";
  if (confidence >= 0.6) return "bg-amber-400";
  return "bg-red-400";
}

function ConfidenceDot({ confidence }: { confidence: number }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${confidenceTone(confidence)}`}
      title={`Extraction confidence ${Math.round(confidence * 100)}%`}
    />
  );
}

function SkillChips({ skills }: { skills: SkillField[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s) => (
        <span key={s.normalized_name || s.name} className="chip flex items-center gap-1.5 px-3 py-1 text-xs">
          <ConfidenceDot confidence={s.confidence} />
          {s.canonical_name || s.name}
        </span>
      ))}
    </div>
  );
}

function TraitChips({ traits }: { traits: ExtractedField[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {traits.map((t) => (
        <span
          key={t.value}
          className="flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200"
        >
          <ConfidenceDot confidence={t.confidence} />
          {t.value}
        </span>
      ))}
    </div>
  );
}

// Capability weighting as a distribution of bars — mirrors the fit-score bar in
// RankingTable so the visual language stays consistent across the app.
function WeightBars({ weights }: { weights: Record<string, number> }) {
  const entries = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-2.5">
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="capitalize text-white/70">{key}</span>
            <span className="font-medium text-violet-300">{Math.round(value * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-400"
              style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/40">{title}</p>
      {children}
    </div>
  );
}

export function RoleDNA({ blueprint }: { blueprint: RoleBlueprint }) {
  const requiredSkills = blueprint.required_skills ?? [];
  const preferredSkills = blueprint.preferred_skills ?? [];
  const traits = blueprint.behavioral_traits ?? [];
  const weights = blueprint.capability_weights ?? {};
  const evidence = blueprint.required_evidence ?? [];
  const successFactors = blueprint.success_metrics ?? [];
  const responsibilities = blueprint.responsibilities ?? [];
  const roleTitle = blueprint.role_title?.value;
  const level = blueprint.experience_level?.value;

  // Nothing recognizable to show (e.g. a legacy blueprint shape) — render nothing
  // rather than an empty card.
  const hasContent =
    requiredSkills.length > 0 ||
    preferredSkills.length > 0 ||
    traits.length > 0 ||
    Object.keys(weights).length > 0 ||
    evidence.length > 0 ||
    successFactors.length > 0 ||
    responsibilities.length > 0;
  if (!hasContent) return null;

  return (
    <div className="glass relative overflow-hidden p-6">
      {/* signature DELULU glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-violet-300">Role DNA</p>
          <h2 className="mt-1 text-xl font-bold gradient-text">{roleTitle || "Role Intelligence"}</h2>
        </div>
        {level && (
          <span className="chip shrink-0 px-3 py-1 text-xs capitalize text-white/70">{level} level</span>
        )}
      </div>

      <div className="relative grid gap-6 sm:grid-cols-2">
        {requiredSkills.length > 0 && (
          <Section title="Critical Skills">
            <SkillChips skills={requiredSkills} />
          </Section>
        )}
        {preferredSkills.length > 0 && (
          <Section title="Optional Skills">
            <SkillChips skills={preferredSkills} />
          </Section>
        )}
        {traits.length > 0 && (
          <Section title="Critical Traits">
            <TraitChips traits={traits} />
          </Section>
        )}
        {Object.keys(weights).length > 0 && (
          <Section title="Capability Weighting">
            <WeightBars weights={weights} />
          </Section>
        )}
        {successFactors.length > 0 && (
          <Section title="Success Factors">
            <ul className="list-inside list-disc space-y-1 text-sm text-white/70">
              {successFactors.map((s) => (
                <li key={s.value}>{s.value}</li>
              ))}
            </ul>
          </Section>
        )}
        {responsibilities.length > 0 && (
          <Section title="Responsibilities">
            <ul className="list-inside list-disc space-y-1 text-sm text-white/70">
              {responsibilities.map((r) => (
                <li key={r.value}>{r.value}</li>
              ))}
            </ul>
          </Section>
        )}
        {evidence.length > 0 && (
          <Section title="Evidence Expected">
            <div className="flex flex-wrap gap-2">
              {evidence.map((e) => (
                <span
                  key={e}
                  className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs capitalize text-cyan-200"
                >
                  {e.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
