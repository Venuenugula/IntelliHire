"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentRecruiter, logout, setStoredRecruiter } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const authed = useRequireAuth();
  const router = useRouter();
  const cached = useCurrentUser();

  useEffect(() => {
    if (!authed) return;
    getCurrentRecruiter()
      .then(setStoredRecruiter)
      .catch(() => {
        logout();
        router.replace("/login?next=/profile");
      });
  }, [authed, router]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (!authed || !cached) {
    return <div className="flex items-center justify-center p-32 text-gray-400">Loading profile…</div>;
  }

  const label = cached.company_name || cached.email;
  const initial = (label[0] ?? "?").toUpperCase();
  const memberSince = cached.created_at
    ? new Date(cached.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div className="p-8">
      <PageHeader title="Settings" subtitle="Manage your recruiter account" />

      <div className="card max-w-2xl p-8">
        <div className="flex items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7c3aed] text-2xl font-bold text-white">
            {initial}
          </span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{cached.company_name}</h2>
            <p className="text-gray-500">{cached.email}</p>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <Field label="Company" value={cached.company_name} />
          <Field label="Email" value={cached.email} />
          <Field label="Member since" value={memberSince} />
          <Field label="Recruiter ID" value={cached.id} mono />
        </dl>

        <button onClick={handleLogout} className="mt-8 rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100">
          Sign out
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className={`mt-1 truncate text-sm text-gray-900 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
