"use client";

import { JobTabs, PageHeader } from "@/components/layout/PageHeader";
import { RoleDNA } from "@/components/role/RoleDNA";
import { getJob } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Job } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoleIntelligencePage() {
  const authed = useRequireAuth();
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authed) return;
    getJob(jobId)
      .then(setJob)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load job"))
      .finally(() => setLoading(false));
  }, [authed, jobId]);

  if (!authed) {
    return <div className="flex items-center justify-center p-32 text-gray-400">Redirecting…</div>;
  }

  if (loading) return <div className="p-8 text-gray-400">Loading role intelligence…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!job) return null;

  return (
    <div className="p-8">
      <PageHeader
        title={job.title}
        subtitle="Role Intelligence — evidence-driven hiring blueprint"
        badge={<span className="badge badge-green">Active</span>}
        action={
          <div className="flex gap-2">
            <Link href={`/jobs/${jobId}/candidates`} className="btn-secondary rounded-lg px-4 py-2 text-sm">
              Add Candidates
            </Link>
            <Link href="/jobs/new" className="btn-primary rounded-lg px-4 py-2 text-sm">
              Edit Role
            </Link>
          </div>
        }
      />

      <JobTabs jobId={jobId} active="dna" />

      {job.role_blueprint ? (
        <RoleDNA blueprint={job.role_blueprint} variant="grid" />
      ) : (
        <div className="card p-10 text-center">
          <p className="text-gray-500">No role blueprint available for this job.</p>
          <p className="mt-2 text-sm text-gray-400">Role DNA is generated when you create a job with a job description.</p>
        </div>
      )}

      {job.description && (
        <div className="card mt-6 p-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#7c3aed]">AI Role Summary</h3>
          <p className="text-sm leading-relaxed text-gray-600">{job.description.slice(0, 500)}{job.description.length > 500 ? "…" : ""}</p>
        </div>
      )}
    </div>
  );
}
