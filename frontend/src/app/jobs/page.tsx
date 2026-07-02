"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { deleteJob, listJobs } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Job } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function JobsPage() {
  const authed = useRequireAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleDelete(job: Job) {
    const count = job.candidate_count ?? 0;
    const confirmed = window.confirm(
      `Delete "${job.title}"?${count ? ` This will also remove ${count} candidate${count === 1 ? "" : "s"}.` : ""}\n\nThis cannot be undone.`,
    );
    if (!confirmed) return;
    setDeletingId(job.job_id);
    try {
      await deleteJob(job.job_id);
      setJobs((prev) => prev.filter((j) => j.job_id !== job.job_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Jobs"
        subtitle="Manage open roles and access role intelligence"
        action={
          <Link href="/jobs/new" className="btn-primary rounded-lg px-4 py-2 text-sm">
            + New Job
          </Link>
        }
      />

      {loading && <p className="text-gray-400">Loading jobs…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <div className="card border-dashed p-12 text-center">
          <p className="mb-3 text-gray-500">No jobs yet.</p>
          <Link href="/jobs/new" className="font-medium text-[#7c3aed] hover:underline">
            Create your first job →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {jobs.map((job) => (
          <div key={job.job_id} className="card card-hover p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <Link href={`/jobs/${job.job_id}`} className="text-lg font-semibold text-gray-900 hover:text-[#7c3aed]">
                {job.title}
              </Link>
              <span className="badge badge-green shrink-0">
                {job.candidate_count ?? 0} candidate{(job.candidate_count ?? 0) === 1 ? "" : "s"}
              </span>
            </div>
            {job.created_at && (
              <p className="mb-4 text-xs text-gray-400">
                Created {new Date(job.created_at).toLocaleDateString()}
              </p>
            )}
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href={`/jobs/${job.job_id}`} className="font-medium text-[#7c3aed] hover:underline">
                Role DNA
              </Link>
              <Link href={`/jobs/${job.job_id}/candidates`} className="font-medium text-[#7c3aed] hover:underline">
                Candidates
              </Link>
              <Link href={`/jobs/${job.job_id}/rankings`} className="font-medium text-[#7c3aed] hover:underline">
                Rankings
              </Link>
              <button
                onClick={() => handleDelete(job)}
                disabled={deletingId === job.job_id}
                className="ml-auto text-red-500 hover:underline disabled:opacity-50"
              >
                {deletingId === job.job_id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
