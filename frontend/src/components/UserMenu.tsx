"use client";

import { logout } from "@/lib/api";
import { useCurrentUser } from "@/lib/useCurrentUser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserMenu() {
  const recruiter = useCurrentUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Signed out — show the auth entry points.
  if (!recruiter) {
    return (
      <>
        <Link href="/login" className="text-white/60 transition hover:text-white">
          Sign In
        </Link>
        <Link href="/signup" className="btn-glow rounded-lg px-4 py-2 text-white">
          Sign Up
        </Link>
      </>
    );
  }

  const label = recruiter.company_name || recruiter.email;
  const initial = (label[0] ?? "?").toUpperCase();

  function handleLogout() {
    setOpen(false);
    logout();
    router.push("/");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition hover:border-violet-400/40"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
          {initial}
        </span>
        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-white/80 sm:block">
          {label}
        </span>
      </button>

      {open && (
        <>
          {/* click-outside backdrop */}
          <button
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="glass absolute right-0 z-50 mt-2 w-60 overflow-hidden p-2"
          >
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-white">{recruiter.company_name}</p>
              <p className="truncate text-xs text-white/50">{recruiter.email}</p>
            </div>
            <div className="my-1 h-px bg-white/10" />
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Profile
            </Link>
            <Link
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              Dashboard
            </Link>
            <button
              role="menuitem"
              onClick={handleLogout}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
