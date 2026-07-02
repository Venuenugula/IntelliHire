"use client";

import { CreateRoleForm } from "@/components/create-role/CreateRoleForm";
import { RoleIntelligencePanel } from "@/components/create-role/RoleIntelligencePanel";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { createJob } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "@/components/create-role/create-role.css";

export default function NewJobPage() {
  const router = useRouter();
  const authed = useRequireAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const job = await createJob(title, description);
      router.push(`/jobs/${job.job_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  if (!authed) {
    return (
      <div className="cr-page flex items-center justify-center">
        <p className="text-sm text-[#94a3b8]">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <div className="cr-page">
      <header className="cr-header">
        <div className="cr-header__row">
          <div>
            <h1>Create a New Role</h1>
            <p>
              Transform any job description into an evidence-driven Role DNA that powers candidate
              evaluation.
            </p>
          </div>
          <ThemeToggle variant="icon" />
        </div>
      </header>

      <div className="cr-layout">
        <CreateRoleForm
          title={title}
          description={description}
          loading={loading}
          error={error}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onSubmit={handleSubmit}
        />
        <RoleIntelligencePanel />
      </div>
    </div>
  );
}
