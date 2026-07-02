"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { listJobCandidates, listJobs } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { CandidateListItem, Job } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

type CandidateRow = CandidateListItem & { job_id: string; job_title: string };

export default function CandidatesPage() {
  const authed = useRequireAuth();
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authed) return;
    listJobs()
      .then(async (jobs: Job[]) => {
        const rows = await Promise.all(
          jobs.map(async (job) => {
            const list = await listJobCandidates(job.job_id).catch(() => [] as CandidateListItem[]);
            return list.map((c) => ({ ...c, job_id: job.job_id, job_title: job.title }));
          }),
        );
        setCandidates(rows.flat());
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load candidates"))
      .finally(() => setLoading(false));
  }, [authed]);

  if (!authed) {
    return <div className="flex items-center justify-center p-32 text-gray-400">Redirecting…</div>;
  }

  const pending = candidates.filter((c) => !c.analyzed).length;

  return (
    <div className="p-8">
      <PageHeader
        title="Candidates"
        subtitle="All applicants across your open roles"
        action={
          <Link href="/jobs" className="btn-secondary rounded-lg px-4 py-2 text-sm">
            View Jobs
          </Link>
        }
      />

      {loading && <p className="text-gray-400">Loading candidates…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && candidates.length === 0 && (
        <div className="card border-dashed p-12 text-center">
          <p className="mb-3 text-gray-500">No candidates uploaded yet.</p>
          <Link href="/jobs" className="font-medium text-[#7c3aed] hover:underline">
            Open a job to upload candidates →
          </Link>
        </div>
      )}

      {!loading && candidates.length > 0 && (
        <>
          {pending > 0 && (
            <p className="mb-4 text-sm text-amber-600">{pending} candidate{pending === 1 ? "" : "s"} still analyzing…</p>
          )}
          <div className="card divide-y divide-gray-100 overflow-hidden">
            {candidates.map((c) => (
              <div key={c.candidate_id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <Link
                    href={`/candidates/${c.candidate_id}?job=${c.job_id}`}
                    className="font-medium text-gray-900 hover:text-[#7c3aed]"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {c.job_title}
                    {c.email ? ` · ${c.email}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {c.analyzed ? (
                    <span className="badge badge-green">Analyzed</span>
                  ) : (
                    <span className="badge badge-amber">Analyzing…</span>
                  )}
                  <Link
                    href={`/candidates/${c.candidate_id}?job=${c.job_id}`}
                    className="text-sm font-medium text-[#7c3aed] hover:underline"
                  >
                    Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
