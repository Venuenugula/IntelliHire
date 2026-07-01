import type {
  AuthToken,
  Candidate,
  CandidateDetail,
  CandidateListItem,
  Job,
  RankingItem,
  Recruiter,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const TOKEN_KEY = "delulu_token";
const RECRUITER_KEY = "delulu_recruiter";

/** Fired whenever the stored token/recruiter changes, so hooks can re-read. */
export const AUTH_EVENT = "delulu-auth-change";

function emitAuthChange(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
  emitAuthChange();
}

// Cache the parsed recruiter so getStoredRecruiter() returns a stable reference
// while the underlying JSON is unchanged — required by useSyncExternalStore,
// which loops if getSnapshot yields a new object every call.
let _rawRecruiter: string | null = null;
let _cachedRecruiter: Recruiter | null = null;

/** The recruiter persisted at sign-in (stable reference until it changes). */
export function getStoredRecruiter(): Recruiter | null {
  const raw = typeof window === "undefined" ? null : window.localStorage.getItem(RECRUITER_KEY);
  if (raw !== _rawRecruiter) {
    _rawRecruiter = raw;
    try {
      _cachedRecruiter = raw ? (JSON.parse(raw) as Recruiter) : null;
    } catch {
      _cachedRecruiter = null;
    }
  }
  return _cachedRecruiter;
}

export function setStoredRecruiter(recruiter: Recruiter | null): void {
  if (typeof window === "undefined") return;
  if (recruiter) window.localStorage.setItem(RECRUITER_KEY, JSON.stringify(recruiter));
  else window.localStorage.removeItem(RECRUITER_KEY);
  emitAuthChange();
}

/** Extract a human-readable message from FastAPI's error responses. */
function parseError(text: string, status: number): string {
  try {
    const body = JSON.parse(text);
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  } catch {
    /* not JSON — fall through */
  }
  return text || `Request failed: ${status}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(parseError(await res.text(), res.status));
  }
  return res.json();
}

export async function registerRecruiter(
  companyName: string,
  email: string,
  password: string,
): Promise<AuthToken> {
  return request<AuthToken>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company_name: companyName, email, password }),
  });
}

export async function loginRecruiter(email: string, password: string): Promise<AuthToken> {
  return request<AuthToken>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentRecruiter(): Promise<Recruiter> {
  return request<Recruiter>("/auth/me");
}

export function logout(): void {
  setToken(null);
  setStoredRecruiter(null);
}

export async function createJob(title: string, description: string): Promise<Job> {
  return request<Job>("/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  });
}

export async function getJob(jobId: string): Promise<Job> {
  return request<Job>(`/jobs/${jobId}`);
}

export async function listJobs(): Promise<Job[]> {
  return request<Job[]>("/jobs");
}

export async function deleteJob(jobId: string): Promise<{ deleted: boolean; candidates_removed: number }> {
  return request(`/jobs/${jobId}`, { method: "DELETE" });
}

export async function listJobCandidates(jobId: string): Promise<CandidateListItem[]> {
  return request<CandidateListItem[]>(`/jobs/${jobId}/candidates`);
}

export async function uploadCandidate(formData: FormData): Promise<Candidate> {
  return request<Candidate>("/candidates", {
    method: "POST",
    body: formData,
  });
}

export async function analyzeCandidate(candidateId: string): Promise<{ status: string }> {
  return request(`/candidates/${candidateId}/analyze`, { method: "POST" });
}

export async function runJobAnalysis(jobId: string): Promise<{ results: unknown[] }> {
  return request(`/analysis/jobs/${jobId}/run`, { method: "POST" });
}

export async function getRankings(jobId: string): Promise<RankingItem[]> {
  return request<RankingItem[]>(`/jobs/${jobId}/rankings`);
}

export async function getCandidateDetail(candidateId: string): Promise<CandidateDetail> {
  return request<CandidateDetail>(`/candidates/${candidateId}`);
}
