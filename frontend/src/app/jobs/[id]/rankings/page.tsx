"use client";

import { JobTabs, PageHeader } from "@/components/layout/PageHeader";
import { RankingTable } from "@/components/ranking/RankingTable";
import { getRankings } from "@/lib/api";
import type { RankingItem } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RankingsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRankings(jobId)
      .then(setRankings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  return (
    <div className="p-8">
      <PageHeader
        title="Candidate Rankings"
        subtitle="Evidence-based ranking with HTI scores"
      />

      <JobTabs jobId={jobId} active="rankings" />

      {loading && <p className="text-gray-400">Loading rankings…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && <RankingTable rankings={rankings} jobId={jobId} />}
    </div>
  );
}
