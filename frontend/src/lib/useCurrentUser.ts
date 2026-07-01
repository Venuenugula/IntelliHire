"use client";

import { useSyncExternalStore } from "react";
import { AUTH_EVENT, getStoredRecruiter } from "./api";
import type { Recruiter } from "./types";

function subscribe(callback: () => void): () => void {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback); // sync across tabs
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * The currently signed-in recruiter, or `null`. Reactive: updates on sign-in /
 * sign-out (including in other tabs). Server snapshot is `null` to avoid
 * hydration mismatches for this client-only value.
 */
export function useCurrentUser(): Recruiter | null {
  return useSyncExternalStore(subscribe, getStoredRecruiter, () => null);
}
