"use client";

import { JobTabs, PageHeader } from "@/components/layout/PageHeader";
import { getJob, listJobCandidates, uploadCandidate } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { CandidateListItem, Job } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type LinkField = "github_url" | "linkedin_url" | "leetcode_url" | "portfolio_url";

const LINK_FIELDS: { field: LinkField; label: string; placeholder: string }[] = [
  { field: "github_url", label: "GitHub", placeholder: "https://github.com/username" },
  { field: "linkedin_url", label: "LinkedIn", placeholder: "https://www.linkedin.com/in/username" },
  { field: "leetcode_url", label: "LeetCode", placeholder: "https://leetcode.com/u/username" },
  { field: "portfolio_url", label: "Portfolio", placeholder: "https://yoursite.dev" },
];

const SOURCE_CHIPS: { key: keyof CandidateListItem; label: string }[] = [
  { key: "github_url", label: "GitHub" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "leetcode_url", label: "LeetCode" },
  { key: "portfolio_url", label: "Portfolio" },
];

export default function CandidateUploadPage() {
  const authed = useRequireAuth();
  const params = useParams();
  const jobId = params.id as string;

  const [resume, setResume] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [job, setJob] = useState<Job | null>(null);

  const [links, setLinks] = useState({
    github_url: "",
    linkedin_url: "",
    leetcode_url: "",
    portfolio_url: "",
  });
  const [showLinks, setShowLinks] = useState(false);

  const loadCandidates = useCallback(() => {
    listJobCandidates(jobId)
      .then(setCandidates)
      .catch(() => setCandidates([]));
  }, [jobId]);

  useEffect(() => {
    if (authed) loadCandidates();
  }, [authed, loadCandidates]);

  useEffect(() => {
    if (!authed) return;
    getJob(jobId).then(setJob).catch(() => setJob(null));
  }, [authed, jobId]);

  useEffect(() => {
    if (!candidates.some((c) => !c.analyzed)) return;
    const timer = setInterval(loadCandidates, 4000);
    return () => clearInterval(timer);
  }, [candidates, loadCandidates]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!resume) {
      setMessage("Please choose a resume PDF.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("job_id", jobId);
      formData.append("resume", resume);
      for (const [field, value] of Object.entries(links)) {
        if (value.trim()) formData.append(field, value.trim());
      }

      const created = await uploadCandidate(formData);
      setMessage(`Uploaded ${created.name ?? "candidate"} — analyzing in the background…`);
      setResume(null);
      setFileKey((k) => k + 1);
      setLinks({ github_url: "", linkedin_url: "", leetcode_url: "", portfolio_url: "" });
      loadCandidates();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  const pending = candidates.filter((c) => !c.analyzed).length;

  if (!authed) {
    return <div className="flex items-center justify-center p-32 text-gray-400">Redirecting to sign in…</div>;
  }

  return (
    <div className="p-8">
      <PageHeader
        title={job?.title ?? "Upload Candidates"}
        subtitle="Add candidates for evidence-based analysis"
        action={
          <Link href={`/jobs/${jobId}/rankings`} className="btn-secondary rounded-lg px-4 py-2 text-sm">
            View Rankings
          </Link>
        }
      />

      <JobTabs jobId={jobId} active="candidates" />

      <form onSubmit={handleUpload} className="space-y-5">
        <label className="card relative flex cursor-pointer flex-col items-center justify-center gap-3 border-dashed py-12 text-center">
          <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-gray-700">
            {resume ? resume.name : "Drag & Drop Resume PDF"}
          </p>
          <p className="text-xs text-gray-400">PDF — name, email and profile links are auto-extracted</p>
          <input
            key={fileKey}
            type="file"
            accept=".pdf"
            onChange={(e) => setResume(e.target.files?.[0] || null)}
            className="hidden"
            required
          />
        </label>

        <div className="card p-4">
          <button
            type="button"
            onClick={() => setShowLinks((s) => !s)}
            className="text-sm font-medium text-[#7c3aed] hover:underline"
          >
            {showLinks ? "▾" : "▸"} Add profile links manually (optional)
          </button>
          {showLinks && (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-gray-500">
                Links are read from the resume first. Fill these in only as a fallback.
              </p>
              {LINK_FIELDS.map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
                  <input
                    type="url"
                    value={links[field]}
                    onChange={(e) => setLinks((prev) => ({ ...prev, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="field w-full px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || !resume} className="btn-primary rounded-lg px-6 py-2.5 disabled:opacity-50">
          {loading ? "Uploading..." : "Upload Candidate"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Uploaded Applications ({candidates.length})</h2>
          {pending > 0 && <span className="badge badge-amber">{pending} analyzing…</span>}
        </div>

        {candidates.length === 0 ? (
          <p className="text-sm text-gray-400">No candidates uploaded yet.</p>
        ) : (
          <div className="card divide-y divide-gray-100 overflow-hidden">
            {candidates.map((c) => (
              <div key={c.candidate_id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <Link href={`/candidates/${c.candidate_id}?job=${jobId}`} className="font-medium text-gray-900 hover:text-[#7c3aed]">
                    {c.name}
                  </Link>
                  {c.email && <p className="truncate text-xs text-gray-400">{c.email}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  {c.analyzed ? (
                    <span className="badge badge-green">Analyzed</span>
                  ) : (
                    <span className="badge badge-amber">Analyzing…</span>
                  )}
                  {SOURCE_CHIPS.filter((s) => c[s.key]).map((s) => (
                    <span key={s.label} className="chip px-2.5 py-1">{s.label}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
