export interface Recruiter {
  id: string;
  company_name: string;
  email: string;
  created_at?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  recruiter: Recruiter;
}

/** Every AI extraction carries a value, a confidence and (optionally) its source. */
export interface ExtractedField<T = string> {
  value: T;
  confidence: number;
  source?: string | null;
}

/** A skill extracted from the JD, with normalization + extraction confidence. */
export interface SkillField {
  name: string;
  normalized_name: string;
  canonical_name?: string | null;
  confidence: number;
  category?: string | null;
  domain?: string | null;
}

/**
 * The role blueprint the backend derives from a job description — DELULU's
 * "Role DNA". Mirrors `app/schemas/job.py::RoleBlueprint` (the full serialized
 * shape returned by `model_dump`). Most fields are optional: the JD parser fills
 * them in progressively, so the UI renders only the sections that carry data.
 */
export interface RoleBlueprint {
  role_title?: ExtractedField;
  experience_level?: ExtractedField;
  employment_type?: ExtractedField | null;
  required_skills?: SkillField[];
  preferred_skills?: SkillField[];
  responsibilities?: ExtractedField[];
  behavioral_traits?: ExtractedField[];
  education?: ExtractedField[];
  certifications?: ExtractedField[];
  domain?: ExtractedField | null;
  industry?: ExtractedField | null;
  tools?: SkillField[];
  success_metrics?: ExtractedField[];
  capability_weights?: Record<string, number>;
  required_evidence?: string[];
}

export interface Job {
  job_id: string;
  title: string;
  description: string;
  role_blueprint?: RoleBlueprint;
  created_at?: string;
  candidate_count?: number;
}

export interface Candidate {
  candidate_id: string;
  job_id: string;
  name: string;
  email?: string;
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  portfolio_url?: string;
}

export interface CandidateListItem {
  candidate_id: string;
  name: string;
  email?: string;
  github_url?: string;
  linkedin_url?: string;
  leetcode_url?: string;
  portfolio_url?: string;
  has_resume: boolean;
  analyzed: boolean;
  created_at?: string;
}

export interface RankingItem {
  candidate_id: string;
  candidate: string;
  fit_score: number;
  risk: number;
  hti: number;
  confidence: number;
  rank: number;
  recommendation?: string;
}

export interface CapabilityProfile {
  technical: number;
  execution: number;
  ownership: number;
  learning_velocity: number;
  problem_solving: number;
  domain_expertise: number;
  capability_score: number;
}

export interface RiskProfile {
  evidence_risk: number;
  role_gap_risk: number;
  credibility_risk: number;
  risk_score: number;
}

export interface HTIProfile {
  visibility_score: number;
  hti_score: number;
}

export interface Explanation {
  strengths: string[];
  risks: string[];
  reason: string;
}

export interface SummaryStat {
  label: string;
  value: string;
}

export interface SourceSummary {
  source: string;
  title: string;
  headline: string;
  available: boolean;
  stats: SummaryStat[];
  strengths: string[];
  weaknesses: string[];
}

export interface RoleFitSummary {
  verdict: string;
  fit_score: number;
  matched_skills: string[];
  missing_skills: string[];
  reason: string;
}

export interface CandidateSummary {
  headline: string;
  role_fit: RoleFitSummary;
  sources: SourceSummary[];
  overall_strengths: string[];
  overall_weaknesses: string[];
}

/** A single explainable observation pulled from a source. */
export interface EvidenceSignal {
  label: string;
  detail: string;
  weight: number;
  value?: number | string | null;
}

/**
 * Canonical, source-agnostic evidence record (backend `EvidenceObject`). The
 * human-readable, explainable view of what a source told us about a candidate.
 */
export interface EvidenceObject {
  source: string;
  source_url?: string | null;
  reliability: number;
  relevance_score?: number | null;
  summary: string;
  skills: string[];
  signals: EvidenceSignal[];
  highlights: string[];
  error?: string | null;
}

export interface CandidateDetail {
  candidate_id: string;
  name: string;
  capability?: CapabilityProfile;
  risk?: RiskProfile;
  hti?: HTIProfile;
  evidence: Array<{
    source_type: string;
    source_url?: string;
    relevance_score?: number;
    // The stored per-source package — the exact input the v2 evaluation pipeline
    // re-ingests when assembling `sources` (see `evaluateCandidate`).
    processed_content?: Record<string, unknown> | null;
  }>;
  standardized_evidence?: EvidenceObject[];
  explanation?: Explanation;
  summary?: CandidateSummary;
}

// --- Candidate graph (v2 graph intelligence) ------------------------------- //

export interface GraphNode {
  id: string;
  type: string; // GraphNodeType: candidate|skill|technology|project|repository|organization|domain|role|…
  label: string;
  attributes: Record<string, unknown>; // may carry verification_status, source_count, claim_strength, inferred
  confidence: number;
  evidence_ids: string[];
}

export interface GraphEdge {
  id?: string | null;
  source_id: string;
  target_id: string;
  type: string; // GraphEdgeType: has_skill|used_in|built|proves|in_domain|related_to|…
  confidence: number;
  evidence_ids: string[];
}

export interface EvidenceLedgerEntry {
  evidence_id: string;
  candidate_id: string;
  source: string;
  evidence_type: string;
  entity_ref: string;
  claim: string;
  polarity: string; // "supports" | "contradicts"
  confidence: number;
  supporting_node_id?: string | null;
  verification_status?: string | null;
  provenance?: Record<string, unknown>;
}

export interface CandidateGraph {
  schema_version: string;
  graph_id: string;
  candidate_id: string;
  job_id?: string | null;
  nodes: GraphNode[];
  edges: GraphEdge[];
  evidence_ledger: EvidenceLedgerEntry[];
  metadata: Record<string, unknown>;
}

/** Hiring recommendation levels produced by the v2 decision engine. */
export type RecommendationLevel =
  | "strong_hire"
  | "hire"
  | "lean_hire"
  | "no_hire"
  | "insufficient_evidence";

/** A focused area to probe in an interview. `suggested_questions` may be empty. */
export interface InterviewArea {
  topic: string;
  rationale: string;
  suggested_questions: string[];
}

/**
 * The business result of evaluating a candidate for a job (backend
 * `EvaluationResponse` from `POST /v2/evaluations`). `reasons`/`summary` are
 * always populated; `reservations`/`interview_focus` populate when the pipeline
 * surfaces blockers or gaps.
 */
export interface EvaluationResponse {
  evaluation_id: string;
  candidate_id: string;
  job_id: string;
  recommendation: RecommendationLevel;
  score: number;
  confidence: number;
  summary: string;
  reasons: string[];
  reservations: string[];
  interview_focus: InterviewArea[];
  status: "completed" | "failed";
  meta: Record<string, unknown>;
}
