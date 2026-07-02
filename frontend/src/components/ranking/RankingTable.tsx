import { ScoreRing } from "@/components/ui/ScoreRing";
import type { RankingItem } from "@/lib/types";
import Link from "next/link";

interface RankingTableProps {
  rankings: RankingItem[];
  jobId: string;
}

function riskTone(risk: number): "emerald" | "amber" {
  return risk < 35 ? "emerald" : "amber";
}
function riskPill(risk: number) {
  if (risk < 35) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (risk < 60) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-600";
}
function medal(rank: number) {
  if (rank === 1) return "border-amber-300 text-amber-600 bg-amber-50";
  if (rank === 2) return "border-gray-300 text-gray-600 bg-gray-50";
  if (rank === 3) return "border-orange-300 text-orange-600 bg-orange-50";
  return "border-violet-300 text-violet-600 bg-violet-50";
}

const SOURCES = ["GH", "LC", "in"];

function Bar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function RankingTable({ rankings, jobId }: RankingTableProps) {
  // Carry the job context to the candidate profile so it can run the evaluation.
  const candidateHref = (candidateId: string) => `/candidates/${candidateId}?job=${jobId}`;
  if (rankings.length === 0) {
    return (
      <div className="card border-dashed p-8 text-center text-gray-400">
        No rankings yet. Upload candidates and run analysis.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500">
            <tr className="border-b border-gray-100">
              {["Rank", "Candidate", "Fit Score", "HTI", "Risk", "Confidence", "Action"].map((h) => (
                <th key={h} className="px-5 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rankings.map((r) => (
              <tr key={r.candidate_id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 font-semibold text-gray-900">#{r.rank}</td>
                <td className="px-5 py-3 text-gray-700">{r.candidate}</td>
                <td className="px-5 py-3 font-medium text-emerald-600">{r.fit_score.toFixed(1)}</td>
                <td className="px-5 py-3 font-medium text-violet-600">{r.hti.toFixed(1)}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-md border px-2 py-0.5 text-xs ${riskPill(r.risk)}`}>{r.risk.toFixed(1)}</span>
                </td>
                <td className="px-5 py-3 text-gray-600">{r.confidence.toFixed(1)}</td>
                <td className="px-5 py-3">
                  <Link href={candidateHref(r.candidate_id)} className="text-[#7c3aed] hover:text-violet-700">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 5h5v5M19 5l-9 9M19 14v5H5V5h5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded rank cards */}
      <div className="space-y-5">
        {rankings.map((r) => (
          <div key={r.candidate_id} className={`card p-5 ${r.rank === 1 ? "card-highlight" : ""}`}>
            <div className="flex items-center gap-5">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 text-lg font-bold ${medal(r.rank)}`}
              >
                #{r.rank}
              </div>

              {/* name + bars */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={candidateHref(r.candidate_id)}
                    className="truncate text-lg font-semibold text-gray-900 hover:text-[#7c3aed]"
                  >
                    {r.candidate}
                  </Link>
                  <span className="text-lg font-bold text-emerald-600">{r.fit_score.toFixed(1)}</span>
                </div>
                <p className="mb-1 mt-2 text-[11px] uppercase tracking-wide text-gray-400">Fit Score</p>
                <Bar value={r.fit_score} tone="bg-linear-to-r from-violet-500 to-fuchsia-400" />
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-wide text-gray-400">HTI</span>
                  <div className="flex-1">
                    <Bar value={r.hti} tone="bg-linear-to-r from-emerald-500 to-teal-400" />
                  </div>
                  <span className="text-sm font-medium text-violet-600">{r.hti.toFixed(1)}</span>
                </div>
              </div>

              {/* risk ring */}
              <div className={`hidden shrink-0 rounded-xl border px-3 py-2 sm:block ${riskPill(r.risk)}`}>
                <ScoreRing value={r.risk} size={64} stroke={6} tone={riskTone(r.risk)} sublabel="risk" />
              </div>

              {/* confidence */}
              <div className="hidden shrink-0 text-center sm:block">
                <p className="text-lg font-semibold text-gray-900">{r.confidence.toFixed(1)}</p>
                <p className="text-[11px] text-gray-400">confidence</p>
              </div>

              {/* source nodes */}
              <div className="hidden shrink-0 grid-cols-1 gap-2 lg:grid">
                {SOURCES.map((s) => (
                  <span
                    key={s}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-[10px] font-semibold text-gray-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Link
                href={candidateHref(r.candidate_id)}
                className="btn-secondary rounded-lg px-4 py-1.5 text-xs font-medium"
              >
                {r.recommendation || "Review"} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
