import type {
  AuthToken,
  Candidate,
  CandidateDetail,
  CandidateGraph,
  CandidateListItem,
  EvaluationResponse,
  Job,
  JobUploadResponse,
  RankingItem,
  Recruiter,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
// The v2 intelligence API is mounted at `/v2` on the same origin as the v1 `/api`.
const V2_URL = `${API_URL.replace(/\/api\/?$/, "")}/v2`;

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

async function doHttp<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(url, {
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

// De-duplicate concurrent identical GETs (e.g. the candidate page and
// evaluateCandidate both fetching the same detail on mount). In-flight only —
// the entry clears on settle, so responses are never staled.
const inflightGets = new Map<string, Promise<unknown>>();

/** Shared fetch core: attaches auth, parses backend errors, returns JSON. */
function http<T>(url: string, options?: RequestInit): Promise<T> {
  const method = (options?.method ?? "GET").toUpperCase();
  if (method !== "GET") return doHttp<T>(url, options);
  const existing = inflightGets.get(url);
  if (existing) return existing as Promise<T>;
  const pending = doHttp<T>(url, options).finally(() => inflightGets.delete(url));
  inflightGets.set(url, pending);
  return pending;
}

/** Call the v1 business API (`/api/...`). */
function request<T>(path: string, options?: RequestInit): Promise<T> {
  return http<T>(`${API_URL}${path}`, options);
}

/** Call the v2 intelligence API (`/v2/...`) — same origin, different mount. */
function requestV2<T>(path: string, options?: RequestInit): Promise<T> {
  return http<T>(`${V2_URL}${path}`, options);
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

export async function uploadJobDescription(file: File): Promise<JobUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return request<JobUploadResponse>("/jobs/upload", {
    method: "POST",
    body: formData,
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

/**
 * Assemble the raw per-source payloads the v2 evaluation pipeline expects from a
 * candidate's already-analyzed evidence. Each source's stored `processed_content`
 * is exactly the package the backend normalizer re-ingests, keyed by source name
 * (e.g. `{ github: {...}, resume: {...} }`).
 */
function assembleSources(detail: CandidateDetail): Record<string, unknown> {
  const sources: Record<string, unknown> = {};
  for (const ev of detail.evidence) {
    if (ev.processed_content) sources[ev.source_type] = ev.processed_content;
  }
  return sources;
}

/**
 * Run the full v2 hiring-evaluation pipeline for a candidate against their job and
 * return the business result (recommendation, confidence, reasons, reservations,
 * interview focus). Reuses data the app already has — the candidate's stored
 * evidence supplies the pipeline's `sources` and the job's blueprint supplies the
 * role context — so no extra backend endpoint is required.
 */
export async function evaluateCandidate(
  candidateId: string,
  jobId: string,
): Promise<EvaluationResponse> {
  const [detail, job] = await Promise.all([getCandidateDetail(candidateId), getJob(jobId)]);
  return requestV2<EvaluationResponse>("/evaluations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidate_id: candidateId,
      job_id: jobId,
      jd_text: job.description || undefined,
      role_blueprint: job.role_blueprint ?? undefined,
      sources: assembleSources(detail),
    }),
  });
}

/**
 * Fetch the candidate graph the evaluation persisted (nodes, edges, evidence
 * ledger). The `graphId` comes from `EvaluationResponse.meta.graph_id`.
 */
export async function getCandidateGraph(graphId: string): Promise<CandidateGraph> {
  return requestV2<CandidateGraph>(`/graph/${encodeURIComponent(graphId)}`);
}
