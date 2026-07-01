"use client";

// Talent Graph — an interactive view of the candidate graph the backend built
// during evaluation (skills, technologies, projects, repositories, domains,
// organisations and their relationships). Selecting a node highlights its
// relationships and reveals its evidence provenance: source, verification status,
// supporting vs contradictory records, and confidence. Everything shown comes
// from real backend intelligence — nothing is synthesized on the client.

import "@xyflow/react/dist/style.css";
import { useMemo, useState } from "react";
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import type { CandidateGraph, GraphNode } from "@/lib/types";

const TYPE_COLOR: Record<string, string> = {
  candidate: "#a855f7",
  skill: "#34d399",
  technology: "#22d3ee",
  project: "#e879f9",
  repository: "#38bdf8",
  organization: "#fbbf24",
  domain: "#c084fc",
  role: "#2dd4bf",
  education: "#94a3b8",
  certification: "#f472b6",
  achievement: "#facc15",
  publication: "#60a5fa",
  contribution: "#4ade80",
};

function typeColor(type: string): string {
  return TYPE_COLOR[type] ?? "#cbd5e1";
}

// Deterministic radial layout: the candidate sits at the centre, everything else
// on a ring grouped by type — a constellation, echoing DELULU's neural motif.
function layout(nodes: GraphNode[]): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {};
  const center = nodes.find((n) => n.type === "candidate");
  const others = nodes.filter((n) => n !== center);
  if (center) pos[center.id] = { x: 0, y: 0 };
  const sorted = [...others].sort(
    (a, b) => a.type.localeCompare(b.type) || a.label.localeCompare(b.label),
  );
  const count = Math.max(sorted.length, 1);
  const radius = Math.max(240, count * 26);
  sorted.forEach((n, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    pos[n.id] = { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
  return pos;
}

function attrString(attrs: Record<string, unknown>, key: string): string | null {
  return typeof attrs[key] === "string" ? (attrs[key] as string) : null;
}
function attrNumber(attrs: Record<string, unknown>, key: string): number | null {
  return typeof attrs[key] === "number" ? (attrs[key] as number) : null;
}

export function TalentGraph({ graph }: { graph: CandidateGraph }) {
  const allTypes = useMemo(
    () => Array.from(new Set(graph.nodes.map((n) => n.type))).sort(),
    [graph],
  );
  const [active, setActive] = useState<Set<string>>(() => new Set(allTypes));
  const [selected, setSelected] = useState<string | null>(null);

  const positions = useMemo(() => layout(graph.nodes), [graph]);
  const visibleIds = useMemo(
    () => new Set(graph.nodes.filter((n) => active.has(n.type)).map((n) => n.id)),
    [graph, active],
  );

  const neighborIds = useMemo(() => {
    if (!selected) return null;
    const set = new Set<string>([selected]);
    for (const e of graph.edges) {
      if (e.source_id === selected) set.add(e.target_id);
      if (e.target_id === selected) set.add(e.source_id);
    }
    return set;
  }, [selected, graph]);

  const nodes: Node[] = useMemo(
    () =>
      graph.nodes
        .filter((n) => visibleIds.has(n.id))
        .map((n) => {
          const color = typeColor(n.type);
          const dim = neighborIds !== null && !neighborIds.has(n.id);
          const isSelected = selected === n.id;
          return {
            id: n.id,
            position: positions[n.id] ?? { x: 0, y: 0 },
            data: { label: n.label },
            draggable: false,
            style: {
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${color}`,
              borderRadius: 10,
              color: "#e9e9f2",
              fontSize: 11,
              padding: "6px 10px",
              boxShadow: isSelected
                ? `0 0 0 1px ${color}, 0 0 24px -4px ${color}`
                : `0 0 14px -8px ${color}`,
              opacity: dim ? 0.25 : 1,
            },
          } satisfies Node;
        }),
    [graph, positions, visibleIds, neighborIds, selected],
  );

  const edges: Edge[] = useMemo(
    () =>
      graph.edges
        .filter((e) => visibleIds.has(e.source_id) && visibleIds.has(e.target_id))
        .map((e, i) => {
          const touches = selected !== null && (e.source_id === selected || e.target_id === selected);
          const dim = selected !== null && !touches;
          return {
            id: e.id || `${e.source_id}|${e.type}|${e.target_id}|${i}`,
            source: e.source_id,
            target: e.target_id,
            animated: touches,
            style: {
              stroke: touches ? "#a855f7" : "rgba(168,85,247,0.35)",
              strokeWidth: touches ? 1.5 : 1,
              opacity: dim ? 0.12 : 1,
            },
          } satisfies Edge;
        }),
    [graph, visibleIds, selected],
  );

  const selectedNode = selected ? graph.nodes.find((n) => n.id === selected) ?? null : null;
  const selectedEvidence = useMemo(
    () => (selected ? graph.evidence_ledger.filter((l) => l.supporting_node_id === selected) : []),
    [selected, graph],
  );

  function toggleType(type: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  const verification = selectedNode ? attrString(selectedNode.attributes, "verification_status") : null;
  const sourceCount = selectedNode ? attrNumber(selectedNode.attributes, "source_count") : null;

  return (
    <div className="relative h-[540px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        colorMode="dark"
        fitView
        nodesDraggable={false}
        minZoom={0.2}
        maxZoom={2}
        onNodeClick={(_, node) => setSelected(node.id)}
        onPaneClick={() => setSelected(null)}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.06)" gap={22} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          maskColor="rgba(5,6,15,0.7)"
          nodeColor={(n) => typeColor(graph.nodes.find((g) => g.id === n.id)?.type ?? "")}
        />
      </ReactFlow>

      {/* type filter */}
      <div className="absolute left-3 top-3 z-10 flex max-w-[70%] flex-wrap gap-1.5">
        {allTypes.map((type) => {
          const on = active.has(type);
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              aria-pressed={on}
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium capitalize transition ${
                on ? "text-white" : "text-white/35"
              }`}
              style={{
                borderColor: on ? typeColor(type) : "rgba(255,255,255,0.12)",
                background: on ? `${typeColor(type)}1a` : "transparent",
              }}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* node detail — provenance, verification, contradictions, confidence */}
      {selectedNode && (
        <div className="glass absolute right-3 top-3 z-10 max-h-[500px] w-72 max-w-[calc(100%-1.5rem)] overflow-y-auto p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: typeColor(selectedNode.type) }}>
                {selectedNode.type}
              </p>
              <h3 className="text-sm font-semibold text-white">{selectedNode.label}</h3>
            </div>
            <button
              onClick={() => setSelected(null)}
              aria-label="Close node details"
              className="btn-ghost rounded px-2 py-0.5 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5 text-[10px]">
            <span className="chip px-2 py-0.5 text-white/70">confidence {Math.round(selectedNode.confidence * 100)}%</span>
            {verification && <span className="chip px-2 py-0.5 capitalize text-white/70">{verification}</span>}
            {sourceCount !== null && (
              <span className="chip px-2 py-0.5 text-white/70">
                {sourceCount} source{sourceCount === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {selectedEvidence.length > 0 ? (
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-white/40">Evidence</p>
              <ul className="space-y-2">
                {selectedEvidence.map((l) => (
                  <li key={l.evidence_id} className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5">
                    <div className="mb-0.5 flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-wide text-white/45">{l.source}</span>
                      <span
                        className={`text-[10px] font-medium ${
                          l.polarity === "contradicts" ? "text-red-300" : "text-emerald-300"
                        }`}
                      >
                        {l.polarity}
                      </span>
                    </div>
                    <p className="text-xs text-white/75">{l.claim}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40">
                      <span>conf {Math.round(l.confidence * 100)}%</span>
                      {l.verification_status && <span className="capitalize">· {l.verification_status}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-white/45">No evidence records attached to this node.</p>
          )}
        </div>
      )}
    </div>
  );
}
