import Link from "next/link";

interface EvaluationRow {
  candidateId: string;
  jobId: string;
  name: string;
  role: string;
  evidenceScore: number;
  confidence: number | null;
  recommendation: string | null;
  status: string;
}

function statusPill(status: string) {
  if (status === "Strong Hire" || status === "Hire") return "rc-pill rc-pill--green";
  if (status === "Review" || status === "Evidence gap") return "rc-pill rc-pill--amber";
  if (status === "Pending") return "rc-pill rc-pill--gray";
  if (status === "Not recommended") return "rc-pill bg-red-50 text-red-600";
  return "rc-pill rc-pill--purple";
}

function formatRecommendation(rec: string | null) {
  if (!rec) return "—";
  return rec.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CandidateEvaluationsTable({ rows }: { rows: EvaluationRow[] }) {
  return (
    <section className="rc-surface rc-animate-in overflow-hidden p-0">
      <div className="border-b border-[var(--rc-border)] px-8 py-6">
        <h2 className="rc-title text-base">Recent Candidate Evaluations</h2>
      </div>

      {rows.length === 0 ? (
        <p className="px-8 py-10 text-sm text-[var(--rc-muted)]">No evaluations yet. Upload candidates to a role to begin.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--rc-border)] text-xs font-semibold uppercase tracking-wide text-[var(--rc-muted)]">
                <th className="px-8 py-4 font-semibold">Candidate</th>
                <th className="px-4 py-4 font-semibold">Role</th>
                <th className="px-4 py-4 font-semibold">Evidence</th>
                <th className="px-4 py-4 font-semibold">Confidence</th>
                <th className="px-4 py-4 font-semibold">Recommendation</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-8 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.candidateId}
                  className="border-b border-[var(--rc-border)] last:border-0 transition hover:bg-surface-subtle"
                >
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f3ff] text-xs font-bold text-[#6d5df6]">
                        {row.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-semibold text-[var(--rc-text)]">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[var(--rc-muted)]">{row.role}</td>
                  <td className="px-4 py-4 font-medium">{row.evidenceScore}%</td>
                  <td className="px-4 py-4 font-medium">{row.confidence !== null ? `${row.confidence}%` : "—"}</td>
                  <td className="px-4 py-4 text-[var(--rc-muted)]">{formatRecommendation(row.recommendation)}</td>
                  <td className="px-4 py-4">
                    <span className={statusPill(row.status)}>{row.status}</span>
                  </td>
                  <td className="px-8 py-4">
                    <Link href={`/candidates/${row.candidateId}`} className="text-sm font-semibold text-[#6d5df6] hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
