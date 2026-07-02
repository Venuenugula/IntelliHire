"use client";

import { AIFindingsTimeline } from "@/components/dashboard/AIFindingsTimeline";
import { CandidateEvaluationsTable } from "@/components/dashboard/CandidateEvaluationsTable";
import { HiringPipeline } from "@/components/dashboard/HiringPipeline";
import { HiringWorkspaceCard } from "@/components/dashboard/HiringWorkspaceCard";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { RecruiterCommandHeader } from "@/components/dashboard/RecruiterCommandHeader";
import { TodaysTasks } from "@/components/dashboard/TodaysTasks";
import {
  buildFindings,
  buildPipelineStages,
  buildTasks,
  confidenceInsight,
  evaluationRows,
  evidenceInsight,
  headerSummary,
  hiringHealthInsight,
  pickPrimaryJob,
  pipelineInsight,
  type CandidateWithJob,
} from "@/lib/dashboardInsights";
import { deleteJob, getRankings, listJobCandidates, listJobs } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Job, RankingItem } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "@/components/dashboard/dashboard.css";

export default function DashboardPage() {
  const authed = useRequireAuth();
  const user = useCurrentUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<CandidateWithJob[]>([]);
  const [rankingsByJob, setRankingsByJob] = useState<Record<string, RankingItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) return;

    async function load() {
      try {
        const jobList = await listJobs();
        setJobs(jobList);

        const activeJobs = jobList.filter((j) => (j.candidate_count ?? 0) > 0).slice(0, 5);
        const candidateResults = await Promise.all(
          activeJobs.map(async (job) => {
            const list = await listJobCandidates(job.job_id);
            return list.map((c) => ({ ...c, job_id: job.job_id, job_title: job.title }));
          }),
        );
        const allCandidates = candidateResults.flat();
        setCandidates(allCandidates);

        const rankingResults = await Promise.all(
          activeJobs.map(async (job) => {
            try {
              const rankings = await getRankings(job.job_id);
              return [job.job_id, rankings] as const;
            } catch {
              return [job.job_id, []] as const;
            }
          }),
        );
        setRankingsByJob(Object.fromEntries(rankingResults));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [authed]);

  const primaryJob = useMemo(() => pickPrimaryJob(jobs), [jobs]);
  const primaryRankings = primaryJob ? rankingsByJob[primaryJob.job_id] ?? [] : [];
  const allRankings = useMemo(() => Object.values(rankingsByJob).flat(), [rankingsByJob]);

  const health = hiringHealthInsight(jobs);
  const evidence = evidenceInsight(candidates);
  const pipeline = pipelineInsight(allRankings);
  const confidence = confidenceInsight(allRankings);
  const summary = headerSummary(jobs, candidates, allRankings);

  const findings = buildFindings(candidates, allRankings);
  const stages = buildPipelineStages(candidates, allRankings);
  const tasks = buildTasks(candidates, jobs);
  const rows = evaluationRows(candidates, allRankings);

  const primaryCandidates = primaryJob
    ? candidates.filter((c) => c.job_id === primaryJob.job_id)
    : [];
  const evidenceComplete = primaryCandidates.filter((c) => c.analyzed).length;
  const awaitingReview = primaryCandidates.filter((c) => !c.analyzed).length;

  const firstName = user?.company_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const reviewHref = primaryJob ? `/jobs/${primaryJob.job_id}/rankings` : "/jobs";

  async function handleDelete(job: Job) {
    const count = job.candidate_count ?? 0;
    const confirmed = window.confirm(
      `Delete "${job.title}"?${count ? ` This will also remove ${count} candidate${count === 1 ? "" : "s"} and all their analysis data.` : ""}\n\nThis cannot be undone.`,
    );
    if (!confirmed) return;
    setDeletingId(job.job_id);
    setError("");
    try {
      await deleteJob(job.job_id);
      setJobs((prev) => prev.filter((j) => j.job_id !== job.job_id));
      setCandidates((prev) => prev.filter((c) => c.job_id !== job.job_id));
      setRankingsByJob((prev) => {
        const next = { ...prev };
        delete next[job.job_id];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  }

  if (!authed) {
    return (
      <div className="flex items-center justify-center p-32 text-gray-400">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="rc-dashboard">
      <RecruiterCommandHeader
        name={displayName}
        pipelineMessage={summary.pipelineMsg}
        confidence={summary.confidence}
        reviewCount={summary.reviewCount}
        evidenceUpdates={summary.overnight}
        reviewHref={reviewHref}
      />

      {error && (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {/* Insight cards — varied rhythm */}
      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <InsightCard
            label="Hiring Health"
            status={health.status}
            value={`${health.score}%`}
            detail={health.detail}
            tone={health.score >= 80 ? "success" : health.score >= 50 ? "primary" : "warning"}
            sparkData={health.spark}
            tall
          />
        </div>
        <div className="xl:col-span-3">
          <InsightCard
            label="Evidence Coverage"
            status={evidence.verified > 0 ? `${evidence.verified} verified` : undefined}
            value={`${evidence.pct}%`}
            detail={evidence.detail}
            tone="primary"
            sparkData={evidence.spark}
          />
        </div>
        <div className="xl:col-span-3">
          <InsightCard
            label="Strong Pipeline"
            status={pipeline.strong > 0 ? `${pipeline.strong} highly recommended` : undefined}
            value={pipeline.strong > 0 ? String(pipeline.strong) : "—"}
            detail={pipeline.detail}
            tone="success"
            sparkData={pipeline.spark}
          />
        </div>
        <div className="xl:col-span-3">
          <InsightCard
            label="Hiring Confidence"
            status={confidence.label}
            value={confidence.avg > 0 ? `${confidence.avg}%` : "—"}
            detail={confidence.detail}
            tone={confidence.avg >= 75 ? "success" : confidence.avg >= 50 ? "primary" : "warning"}
            sparkData={confidence.spark}
            tall
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left — workflow */}
        <div className="space-y-6 lg:col-span-8">
          <AIFindingsTimeline items={findings} />
          <HiringPipeline stages={stages} jobId={primaryJob?.job_id} />
          <CandidateEvaluationsTable rows={rows} />
        </div>

        {/* Right — workspace */}
        <div className="space-y-6 lg:col-span-4">
          {loading && <p className="text-sm text-[var(--rc-muted)]">Loading workspace…</p>}

          {!loading && primaryJob && (
            <HiringWorkspaceCard
              job={primaryJob}
              evidenceComplete={evidenceComplete}
              confidence={confidenceInsight(primaryRankings).avg}
              awaitingReview={awaitingReview}
              onDelete={() => handleDelete(primaryJob)}
              deleting={deletingId === primaryJob.job_id}
            />
          )}

          {!loading && !primaryJob && (
            <section className="rc-surface text-center">
              <p className="text-sm text-[var(--rc-muted)]">No roles yet.</p>
              <Link href="/jobs/new" className="rc-btn-primary mt-4 inline-flex">
                Create your first role
              </Link>
            </section>
          )}

          <TodaysTasks tasks={tasks} />

          {jobs.length > 1 && (
            <section className="rc-surface rc-surface--compact">
              <h3 className="rc-title text-sm">Other Roles</h3>
              <ul className="mt-4 space-y-2">
                {jobs
                  .filter((j) => j.job_id !== primaryJob?.job_id)
                  .map((job) => (
                    <li key={job.job_id}>
                      <Link
                        href={`/jobs/${job.job_id}`}
                        className="flex items-center justify-between rounded-xl border border-[var(--rc-border)] px-3 py-2.5 text-sm transition hover:bg-surface-subtle"
                      >
                        <span className="font-medium text-[var(--rc-text)]">{job.title}</span>
                        <span className="text-xs text-[var(--rc-muted)]">{job.candidate_count ?? 0} candidates</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
