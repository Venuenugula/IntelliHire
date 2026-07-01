"use client";

import { useCurrentUser } from "@/lib/useCurrentUser";
import Link from "next/link";

/**
 * Persistent bottom-left avatar. Shows the signed-in recruiter's initial and
 * links to their profile; renders nothing when signed out.
 */
export function ProfileBadge() {
  const recruiter = useCurrentUser();
  if (!recruiter) return null;

  const label = recruiter.company_name || recruiter.email;
  const initial = (label[0] ?? "?").toUpperCase();

  return (
    <Link
      href="/profile"
      title={label}
      className="fixed bottom-6 left-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(139,92,246,0.7)] backdrop-blur transition hover:scale-105"
    >
      {initial}
    </Link>
  );
}
