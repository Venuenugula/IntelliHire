"use client";

import { useEffect, useState } from "react";
import { getCandidateGraph } from "./api";
import type { CandidateGraph } from "./types";

export type GraphStatus = "loading" | "ready" | "error";

/** Fetch the persisted candidate graph by id. Cancellation-safe. */
export function useCandidateGraph(graphId: string | null) {
  const [graph, setGraph] = useState<CandidateGraph | null>(null);
  const [status, setStatus] = useState<GraphStatus>("loading");

  useEffect(() => {
    if (!graphId) return;
    let cancelled = false;
    getCandidateGraph(graphId)
      .then((g) => {
        if (!cancelled) {
          setGraph(g);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [graphId]);

  return { graph, status };
}
