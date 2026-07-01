"use client";

// Talent Graph section for the candidate profile. Lazy-loads the React Flow graph
// (heavy, so it stays out of every other route's bundle) and owns the fetch +
// loading / empty / error states. Only rendered when an evaluation produced a
// persisted graph (meta.graph_id).

import dynamic from "next/dynamic";
import { useCandidateGraph } from "@/lib/useCandidateGraph";

function GraphSkeleton() {
  return (
    <div className="flex h-[540px] items-center justify-center">
      <span className="inline-flex items-center gap-2 text-sm text-white/45">
        <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
        Loading talent graph…
      </span>
    </div>
  );
}

const TalentGraph = dynamic(() => import("./TalentGraph").then((m) => m.TalentGraph), {
  ssr: false,
  loading: () => <GraphSkeleton />,
});

export function TalentGraphSection({ graphId }: { graphId: string }) {
  const { graph, status } = useCandidateGraph(graphId);

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-lg font-semibold text-white">Talent Graph</h2>
        {graph && (
          <span className="text-xs text-white/40">
            {graph.nodes.length} nodes · {graph.edges.length} relationships
          </span>
        )}
      </div>
      <div className="glass overflow-hidden">
        {status === "loading" && <GraphSkeleton />}
        {status === "error" && (
          <div className="p-8 text-sm text-white/45">Couldn&apos;t load the talent graph.</div>
        )}
        {status === "ready" &&
          graph &&
          (graph.nodes.length > 0 ? (
            <TalentGraph graph={graph} />
          ) : (
            <div className="p-8 text-sm text-white/45">No graph relationships yet for this candidate.</div>
          ))}
      </div>
    </section>
  );
}
