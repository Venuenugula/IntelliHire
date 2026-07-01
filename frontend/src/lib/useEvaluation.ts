"use client";

import { useCallback, useEffect, useState } from "react";
import { evaluateCandidate } from "./api";
import type { EvaluationResponse } from "./types";

export type EvaluationStatus = "idle" | "loading" | "ready" | "error";

interface Settled {
  key: string;
  status: "ready" | "error";
  evaluation: EvaluationResponse | null;
  error: string;
}

/**
 * Run the v2 hiring evaluation for a candidate and expose its lifecycle. Shared by
 * the recommendation header, reasoning drawer and interview-focus panel so the
 * pipeline runs once per candidate view (no duplicate fetching / state).
 *
 * `jobId` is required to evaluate (the pipeline needs role context). When it is
 * null — e.g. a deep link without job context — the hook stays `idle` and the UI
 * simply omits the intelligence layer, leaving the v1 profile intact.
 *
 * Status is derived (not set synchronously in the effect): while the settled
 * result doesn't match the current request `key`, the hook reads as `loading`.
 */
export function useEvaluation(candidateId: string, jobId: string | null) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled | null>(null);
  const key = jobId ? `${candidateId}|${jobId}|${attempt}` : "";

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    evaluateCandidate(candidateId, jobId)
      .then((res) => {
        if (!cancelled) setSettled({ key, status: "ready", evaluation: res, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setSettled({
            key,
            status: "error",
            evaluation: null,
            error: err instanceof Error ? err.message : "Evaluation failed",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [candidateId, jobId, key]);

  const current = settled?.key === key ? settled : null;
  const status: EvaluationStatus = !jobId ? "idle" : current ? current.status : "loading";
  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { evaluation: current?.evaluation ?? null, status, error: current?.error ?? "", retry };
}
