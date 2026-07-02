// Role DNA — the recruiter-facing view of the backend's Role Blueprint.

import type { ExtractedField, RoleBlueprint, SkillField } from "@/lib/types";

function confidenceTone(confidence: number): string {
  if (confidence > 0.85) return "bg-emerald-500";
  if (confidence >= 0.6) return "bg-amber-500";
  return "bg-red-500";
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
    <div className="flex flex-wrap gap-1.5">
      {skills.slice(0, 6).map((s) => (
        <span key={s.normalized_name || s.name} className="chip flex items-center gap-1 px-2.5 py-0.5 text-xs">
          <ConfidenceDot confidence={s.confidence} />
          {s.canonical_name || s.name}
        </span>
      ))}
      {skills.length > 6 && <span className="text-xs text-gray-400">+{skills.length - 6} more</span>}
    </div>
  );
}

function TraitChips({ traits }: { traits: ExtractedField[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {traits.slice(0, 5).map((t) => (
        <span
          key={t.value}
          className="flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs text-violet-700"
        >
          <ConfidenceDot confidence={t.confidence} />
          {t.value}
        </span>
      ))}
    </div>
  );
}

function WeightBars({ weights }: { weights: Record<string, number> }) {
  const entries = Object.entries(weights).sort((a, b) => b[1] - a[1]).slice(0, 4);
  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key}>
          <div className="mb-0.5 flex items-center justify-between text-xs">
            <span className="capitalize text-gray-600">{key}</span>
            <span className="font-medium text-violet-600">{Math.round(value * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const DNA_CARDS = [
  { key: "responsibilities", title: "Responsibilities", icon: "📋", color: "bg-blue-50 text-blue-600" },
  { key: "required_skills", title: "Required Skills", icon: "⚡", color: "bg-violet-50 text-violet-600" },
  { key: "behavioral_traits", title: "Critical Traits", icon: "🎯", color: "bg-emerald-50 text-emerald-600" },
  { key: "success_metrics", title: "Success Factors", icon: "🏆", color: "bg-amber-50 text-amber-600" },
  { key: "preferred_skills", title: "Culture Signals", icon: "🌱", color: "bg-teal-50 text-teal-600" },
  { key: "education", title: "Failure Risks", icon: "⚠️", color: "bg-red-50 text-red-600" },
  { key: "tools", title: "Learning Curve", icon: "📈", color: "bg-indigo-50 text-indigo-600" },
  { key: "required_evidence", title: "Evidence Requirements", icon: "🔍", color: "bg-purple-50 text-purple-600" },
] as const;

function DnaGridCard({
  title,
  icon,
  color,
  count,
  children,
}: {
  title: string;
  icon: string;
  color: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="card card-hover p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${color}`}>{icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-400">{count} item{count === 1 ? "" : "s"}</p>
        </div>
      </div>
      <div className="text-sm text-gray-600">{children}</div>
      <button type="button" className="mt-3 text-xs font-medium text-[#7c3aed] hover:underline">
        View details →
      </button>
    </div>
  );
}

export function RoleDNA({ blueprint, variant = "default" }: { blueprint: RoleBlueprint; variant?: "default" | "grid" }) {
  const requiredSkills = blueprint.required_skills ?? [];
  const preferredSkills = blueprint.preferred_skills ?? [];
  const traits = blueprint.behavioral_traits ?? [];
  const weights = blueprint.capability_weights ?? {};
  const evidence = blueprint.required_evidence ?? [];
  const successFactors = blueprint.success_metrics ?? [];
  const responsibilities = blueprint.responsibilities ?? [];
  const roleTitle = blueprint.role_title?.value;
  const level = blueprint.experience_level?.value;

  const hasContent =
    requiredSkills.length > 0 ||
    preferredSkills.length > 0 ||
    traits.length > 0 ||
    Object.keys(weights).length > 0 ||
    evidence.length > 0 ||
    successFactors.length > 0 ||
    responsibilities.length > 0;
  if (!hasContent) return null;

  if (variant === "grid") {
    const cardData: Record<string, { count: number; content: React.ReactNode }> = {
      responsibilities: {
        count: responsibilities.length,
        content: responsibilities.length > 0 ? (
          <ul className="list-inside list-disc space-y-0.5 text-xs">
            {responsibilities.slice(0, 3).map((r) => <li key={r.value}>{r.value}</li>)}
          </ul>
        ) : <p className="text-xs text-gray-400">Not extracted yet</p>,
      },
      required_skills: {
        count: requiredSkills.length,
        content: requiredSkills.length > 0 ? <SkillChips skills={requiredSkills} /> : <p className="text-xs text-gray-400">Not extracted yet</p>,
      },
      behavioral_traits: {
        count: traits.length,
        content: traits.length > 0 ? <TraitChips traits={traits} /> : <p className="text-xs text-gray-400">Not extracted yet</p>,
      },
      success_metrics: {
        count: successFactors.length,
        content: successFactors.length > 0 ? (
          <ul className="list-inside list-disc space-y-0.5 text-xs">
            {successFactors.slice(0, 3).map((s) => <li key={s.value}>{s.value}</li>)}
          </ul>
        ) : <p className="text-xs text-gray-400">Not extracted yet</p>,
      },
      preferred_skills: {
        count: preferredSkills.length,
        content: preferredSkills.length > 0 ? <SkillChips skills={preferredSkills} /> : <p className="text-xs text-gray-400">Not extracted yet</p>,
      },
      education: {
        count: 0,
        content: Object.keys(weights).length > 0 ? <WeightBars weights={weights} /> : <p className="text-xs text-gray-400">Risk analysis pending</p>,
      },
      tools: {
        count: Object.keys(weights).length,
        content: Object.keys(weights).length > 0 ? <WeightBars weights={weights} /> : <p className="text-xs text-gray-400">Not extracted yet</p>,
      },
      required_evidence: {
        count: evidence.length,
        content: evidence.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {evidence.map((e) => (
              <span key={e} className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-xs capitalize text-cyan-700">
                {e.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        ) : <p className="text-xs text-gray-400">Not extracted yet</p>,
      },
    };

    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DNA_CARDS.map((card) => (
          <DnaGridCard
            key={card.key}
            title={card.title}
            icon={card.icon}
            color={card.color}
            count={cardData[card.key]?.count ?? 0}
          >
            {cardData[card.key]?.content}
          </DnaGridCard>
        ))}
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-violet-600">Role DNA</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">{roleTitle || "Role Intelligence"}</h2>
        </div>
        {level && <span className="chip shrink-0 px-3 py-1 text-xs capitalize">{level} level</span>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {requiredSkills.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Critical Skills</p>
            <SkillChips skills={requiredSkills} />
          </div>
        )}
        {preferredSkills.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Optional Skills</p>
            <SkillChips skills={preferredSkills} />
          </div>
        )}
        {traits.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Critical Traits</p>
            <TraitChips traits={traits} />
          </div>
        )}
        {Object.keys(weights).length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Capability Weighting</p>
            <WeightBars weights={weights} />
          </div>
        )}
        {successFactors.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Success Factors</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
              {successFactors.map((s) => <li key={s.value}>{s.value}</li>)}
            </ul>
          </div>
        )}
        {responsibilities.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Responsibilities</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
              {responsibilities.map((r) => <li key={r.value}>{r.value}</li>)}
            </ul>
          </div>
        )}
        {evidence.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">Evidence Expected</p>
            <div className="flex flex-wrap gap-2">
              {evidence.map((e) => (
                <span key={e} className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs capitalize text-cyan-700">
                  {e.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
