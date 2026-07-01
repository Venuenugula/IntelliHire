"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "./api";

// Token/URL are client-only external values. useSyncExternalStore reads them
// without an SSR hydration mismatch and without setState-in-effect.
const noopSubscribe = () => () => {};

/**
 * Client-side route guard. Returns `true` once a recruiter token is present.
 * If none is found, redirects to /login carrying a `next` param so the user is
 * returned to the page they were trying to reach after signing in.
 */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const hasToken = useSyncExternalStore(
    noopSubscribe,
    () => getToken() !== null,
    () => false,
  );

  useEffect(() => {
    // Read the token directly (not the SSR snapshot) so we only ever redirect a
    // genuinely unauthenticated client.
    if (getToken() === null) {
      const next = window.location.pathname + window.location.search;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [router]);

  return hasToken;
}

/** Resolve a safe post-auth destination from the current URL's `next` param. */
export function nextDestination(): string {
  if (typeof window === "undefined") return "/dashboard";
  const raw = new URLSearchParams(window.location.search).get("next");
  // Only allow same-site absolute paths to avoid open-redirects.
  return raw && raw.startsWith("/") ? raw : "/dashboard";
}

/**
 * A `?next=…` query suffix carrying the current page's `next` param, for links
 * between /login and /signup. Client-only via useSyncExternalStore.
 */
export function useNextSuffix(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      const raw = new URLSearchParams(window.location.search).get("next");
      return raw && raw.startsWith("/") ? `?next=${encodeURIComponent(raw)}` : "";
    },
    () => "",
  );
}
