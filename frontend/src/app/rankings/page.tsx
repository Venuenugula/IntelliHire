"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { listJobs } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Job } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RankingsHubPage() {
  const authed = useRequireAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authed) return;
    listJobs()
      .then(setJobs)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load jobs"))
      .finally(() => setLoading(false));
  }, [authed]);

  if (!authed) {
    return <div className="flex items-center justify-center p-32 text-gray-400">Redirecting…</div>;
  }

  const withCandidates = jobs.filter((j) => (j.candidate_count ?? 0) > 0);

  return (
    <div className="p-8">
      <PageHeader
        title="Rankings"
        subtitle="Evidence-based candidate rankings by role"
      />

      {loading && <p className="text-gray-400">Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && withCandidates.length === 0 && (
        <div className="card border-dashed p-12 text-center">
          <p className="mb-3 text-gray-500">No rankings yet — upload candidates to a job first.</p>
          <Link href="/jobs" className="font-medium text-[#7c3aed] hover:underline">
            Go to Jobs →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {withCandidates.map((job) => (
          <Link
            key={job.job_id}
            href={`/jobs/${job.job_id}/rankings`}
            className="card card-hover flex items-center justify-between p-5"
          >
            <div>
              <p className="font-semibold text-gray-900">{job.title}</p>
              <p className="mt-1 text-sm text-gray-500">
                {job.candidate_count} candidate{(job.candidate_count ?? 0) === 1 ? "" : "s"} ranked
              </p>
            </div>
            <span className="text-sm font-medium text-[#7c3aed]">View →</span>
          </Link>
        ))}
      </div>

      {!loading && jobs.length > withCandidates.length && (
        <p className="mt-6 text-sm text-gray-400">
          {jobs.length - withCandidates.length} job{jobs.length - withCandidates.length === 1 ? "" : "s"} with no candidates yet.{" "}
          <Link href="/jobs" className="text-[#7c3aed] hover:underline">
            Upload candidates
          </Link>
        </p>
      )}
    </div>
  );
}
