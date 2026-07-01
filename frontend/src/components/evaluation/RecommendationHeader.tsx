"use client";

// Candidate-profile verdict header. Answers the recruiter's first question —
// "should I interview this person?" — before any detail: name, hiring
// recommendation, confidence + fit gauges and the AI summary. Progressively
// enhances the existing profile: the v1 page renders first, this layers the v2
// evaluation on top with calm loading / error / insufficient-evidence states.

import type { EvaluationResponse, RecommendationLevel } from "@/lib/types";
import type { EvaluationStatus } from "@/lib/useEvaluation";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { RECOMMENDATION_META, confidenceTone } from "@/lib/recommendation";

interface RecommendationHeaderProps {
  name: string;
  status: EvaluationStatus;
  evaluation: EvaluationResponse | null;
  onRetry: () => void;
  /** When provided (and a verdict is ready), shows the "Why?" explainability trigger. */
  onExplain?: () => void;
}

function VerdictPill({ recommendation }: { recommendation: RecommendationLevel }) {
  const meta = RECOMMENDATION_META[recommendation];
  return (
    <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${meta.pill}`}>
      {meta.label}
    </span>
  );
}

function GeneratingPill() {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-white/45">
      <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
      Generating hiring intelligence…
    </span>
  );
}

function RingSkeleton() {
  return <div className="h-[84px] w-[84px] animate-pulse rounded-full border border-white/10 bg-white/[0.03]" />;
}

export function RecommendationHeader({
  name,
  status,
  evaluation,
  onRetry,
  onExplain,
}: RecommendationHeaderProps) {
  const ready = status === "ready" && evaluation !== null;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">{name}</h1>
          <div className="mt-3">
            {status === "loading" && <GeneratingPill />}
            {status === "error" && (
              <span className="inline-flex items-center gap-2 text-sm text-white/50">
                Couldn&apos;t generate recommendation.
                <button onClick={onRetry} className="font-medium text-violet-300 hover:text-violet-200">
                  Retry
                </button>
              </span>
            )}
            {ready && (
              <div className="flex flex-wrap items-center gap-3">
                <VerdictPill recommendation={evaluation.recommendation} />
                {onExplain && (
                  <button
                    onClick={onExplain}
                    className="btn-ghost rounded-lg px-3 py-1.5 text-xs font-medium text-white/80"
                  >
                    Why this recommendation?
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {status === "loading" && (
          <div className="flex shrink-0 gap-5">
            <RingSkeleton />
            <RingSkeleton />
          </div>
        )}
        {ready && (
          <div className="flex shrink-0 gap-5">
            <ScoreRing
              value={evaluation.confidence * 100}
              label="Confidence"
              sublabel="conf"
              tone={confidenceTone(evaluation.confidence)}
            />
            <ScoreRing value={evaluation.score * 100} label="Fit" sublabel="fit" tone="violet" />
          </div>
        )}
      </div>

      {ready && evaluation.summary && (
        <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-white/70">
          {evaluation.summary}
        </p>
      )}
      {ready && evaluation.recommendation === "insufficient_evidence" && (
        <p className="mt-2 text-xs text-amber-300/80">
          Add more profile links or a résumé to strengthen the evidence base.
        </p>
      )}
    </div>
  );
}
