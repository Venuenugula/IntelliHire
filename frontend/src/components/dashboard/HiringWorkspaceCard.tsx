import type { Job } from "@/lib/types";
import Link from "next/link";

interface HiringWorkspaceCardProps {
  job: Job;
  evidenceComplete: number;
  confidence: number;
  awaitingReview: number;
  onDelete: () => void;
  deleting: boolean;
}

export function HiringWorkspaceCard({
  job,
  evidenceComplete,
  confidence,
  awaitingReview,
  onDelete,
  deleting,
}: HiringWorkspaceCardProps) {
  const count = job.candidate_count ?? 0;
  const active = count > 0;

  return (
    <section className="rc-surface rc-surface--hover rc-animate-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="rc-label">Current Hiring</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-[var(--rc-text)]">{job.title}</h2>
          <span className={`rc-pill mt-3 ${active ? "rc-pill--green" : "rc-pill--gray"}`}>
            {active ? "Active" : "Open"}
          </span>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f3ff] text-lg font-bold text-[#6d5df6]">
          {(job.title[0] ?? "J").toUpperCase()}
        </span>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4">
        <Metric label="Candidates" value={String(count)} />
        <Metric label="Evidence Complete" value={String(evidenceComplete)} />
        <Metric label="Hiring Confidence" value={confidence > 0 ? `${confidence}%` : "—"} />
        <Metric label="Awaiting Review" value={String(awaitingReview)} />
      </dl>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href={`/jobs/${job.job_id}`} className="rc-btn-primary flex-1 justify-center sm:flex-none">
          Open Workspace
        </Link>
        <Link href={`/jobs/${job.job_id}`} className="rc-btn-ghost">
          Role DNA
        </Link>
        <Link href={`/jobs/${job.job_id}/rankings`} className="rc-btn-ghost">
          Rankings
        </Link>
      </div>

      <div className="mt-6 border-t border-[var(--rc-border)] pt-4">
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="text-sm font-medium text-[var(--rc-danger)] hover:underline disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete role"}
        </button>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--rc-border)] bg-surface-subtle px-4 py-3">
      <dt className="text-xs font-medium text-[var(--rc-muted)]">{label}</dt>
      <dd className="mt-1 text-lg font-bold text-[var(--rc-text)]">{value}</dd>
    </div>
  );
}
