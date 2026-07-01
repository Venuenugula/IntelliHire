"use client";

import { getCurrentRecruiter, logout, setStoredRecruiter } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const authed = useRequireAuth();
  const router = useRouter();
  // Stored recruiter renders instantly; /auth/me refreshes + validates the session.
  const cached = useCurrentUser();

  useEffect(() => {
    if (!authed) return;
    getCurrentRecruiter()
      .then(setStoredRecruiter)
      .catch(() => {
        // Token invalid/expired — sign out and send to login.
        logout();
        router.replace("/login?next=/profile");
      });
  }, [authed, router]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (!authed || !cached) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-6 py-32 text-white/50">
        Loading profile…
      </div>
    );
  }

  const label = cached.company_name || cached.email;
  const initial = (label[0] ?? "?").toUpperCase();
  const memberSince = cached.created_at
    ? new Date(cached.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.35em] text-violet-300">
        Recruiter Profile
      </p>

      <div className="glass relative overflow-hidden p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-600/25 blur-3xl" />

        <div className="relative flex items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-2xl font-bold text-white shadow-[0_0_30px_-6px_rgba(139,92,246,0.8)]">
            {initial}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">{cached.company_name}</h1>
            <p className="text-white/50">{cached.email}</p>
          </div>
        </div>

        <dl className="relative mt-8 grid gap-4 sm:grid-cols-2">
          <Field label="Company" value={cached.company_name} />
          <Field label="Email" value={cached.email} />
          <Field label="Member since" value={memberSince} />
          <Field label="Recruiter ID" value={cached.id} mono />
        </dl>

        <div className="relative mt-8 flex gap-3">
          <button
            onClick={handleLogout}
            className="btn-ghost rounded-xl px-5 py-2.5 text-sm font-medium text-red-300"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-white/40">{label}</dt>
      <dd className={`mt-1 truncate text-sm text-white/85 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
