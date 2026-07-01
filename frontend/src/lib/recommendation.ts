// Shared presentation for the v2 hiring recommendation. Kept in one place so the
// candidate header, reasoning drawer and ranking rows all render the verdict
// identically. Colours reuse DELULU's semantic palette: emerald = confidence,
// violet = the AI verdict, amber = attention, red = risk.

import type { RecommendationLevel } from "./types";

export const RECOMMENDATION_META: Record<RecommendationLevel, { label: string; pill: string }> = {
  strong_hire: { label: "Strong Hire", pill: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  hire: { label: "Hire", pill: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" },
  lean_hire: { label: "Lean Hire", pill: "border-violet-400/40 bg-violet-500/10 text-violet-200" },
  insufficient_evidence: { label: "Insufficient Evidence", pill: "border-white/15 bg-white/5 text-white/60" },
  no_hire: { label: "No Hire", pill: "border-red-400/40 bg-red-400/10 text-red-300" },
};

/** Confidence gauge tone by band — trust signal, independent of the verdict. */
export function confidenceTone(confidence: number): "emerald" | "cyan" | "amber" {
  if (confidence >= 0.75) return "emerald";
  if (confidence >= 0.5) return "cyan";
  return "amber";
}

/** Plain-language confidence band for recruiters. */
export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.75) return "High confidence";
  if (confidence >= 0.5) return "Moderate confidence";
  return "Low confidence";
}

/**
 * The recruiter's recommended next action + pipeline status, derived from the
 * hiring recommendation. Framed as a decision workflow, not interview planning.
 */
export const NEXT_ACTION: Record<RecommendationLevel, { action: string; status: string }> = {
  strong_hire: { action: "Fast-track", status: "Ready to advance" },
  hire: { action: "Move forward", status: "Ready to advance" },
  lean_hire: { action: "Needs additional review", status: "Hold for review" },
  insufficient_evidence: { action: "Gather more evidence", status: "Evidence incomplete" },
  no_hire: { action: "Do not advance", status: "Not recommended" },
};
