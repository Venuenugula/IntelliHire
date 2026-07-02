/** SVG art for feature module cards — matched to reference composition */

import type { ComponentType } from "react";

export function RoleIntelligenceArt() {
  return (
    <svg viewBox="0 0 240 120" className="lp-feature-illustration" aria-hidden>
      <rect x="52" y="18" width="136" height="84" rx="14" fill="#fff" stroke="#d4e5ff" strokeWidth="1.5" />
      <rect x="68" y="36" width="56" height="7" rx="3.5" fill="#0066FF" opacity="0.5" />
      <rect x="68" y="52" width="88" height="5" rx="2.5" fill="#94A3B8" opacity="0.35" />
      <rect x="68" y="64" width="72" height="5" rx="2.5" fill="#94A3B8" opacity="0.25" />
      <circle cx="158" cy="58" r="22" fill="none" stroke="#0066FF" strokeWidth="2.5" opacity="0.4" />
      <circle cx="158" cy="58" r="14" fill="#E8F1FF" opacity="0.6" />
      <path d="M152 58h12M158 52v12" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function CandidateIntelligenceArt() {
  return (
    <svg viewBox="0 0 240 120" className="lp-feature-illustration" aria-hidden>
      <rect x="62" y="16" width="116" height="88" rx="14" fill="#fff" stroke="#d4e5ff" strokeWidth="1.5" />
      <circle cx="98" cy="48" r="16" fill="#E8F1FF" stroke="#0066FF" strokeWidth="1.5" />
      <circle cx="98" cy="44" r="6" fill="#94A3B8" opacity="0.35" />
      <path d="M88 56c2-4 16-4 20 0" fill="#94A3B8" opacity="0.25" />
      <rect x="124" y="36" width="40" height="5" rx="2.5" fill="#0066FF" opacity="0.35" />
      <rect x="124" y="48" width="32" height="4" rx="2" fill="#94A3B8" opacity="0.35" />
      <rect x="124" y="58" width="36" height="4" rx="2" fill="#94A3B8" opacity="0.25" />
      <rect x="78" y="72" width="84" height="4" rx="2" fill="#94A3B8" opacity="0.2" />
    </svg>
  );
}

export function EvidenceIntelligenceArt() {
  return (
    <svg viewBox="0 0 240 120" className="lp-feature-illustration" aria-hidden>
      <rect x="58" y="16" width="124" height="88" rx="14" fill="#fff" stroke="#d4e5ff" strokeWidth="1.5" />
      <circle cx="96" cy="48" r="14" fill="#E8F1FF" stroke="#0066FF" strokeWidth="1.2" />
      <rect x="118" y="36" width="44" height="4" rx="2" fill="#94A3B8" opacity="0.35" />
      <rect x="118" y="46" width="36" height="4" rx="2" fill="#94A3B8" opacity="0.28" />
      <rect x="118" y="56" width="40" height="4" rx="2" fill="#94A3B8" opacity="0.22" />
      <path d="M158 32l20 8v14c0 10-20 18-20 18s-20-8-20-18V40l20-8z" fill="#E8F1FF" stroke="#0066FF" strokeWidth="1.5" />
      <path d="M152 54l6 6 12-14" stroke="#0066FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AIReasoningArt() {
  return (
    <svg viewBox="0 0 240 120" className="lp-feature-illustration" aria-hidden>
      <ellipse cx="120" cy="58" rx="44" ry="36" fill="#E8F1FF" stroke="#b8d4ff" strokeWidth="1.5" />
      <path d="M120 26c-14 0-26 8-30 20 6-4 14-6 22-6h16c8 0 16 2 22 6-4-12-16-20-30-20z" fill="#0066FF" opacity="0.12" />
      <path d="M76 58c0-18 12-32 28-36" stroke="#0066FF" strokeWidth="1.5" fill="none" opacity="0.35" />
      <path d="M164 58c0-18-12-32-28-36" stroke="#0066FF" strokeWidth="1.5" fill="none" opacity="0.35" />
      <circle cx="108" cy="54" r="4" fill="#0066FF" opacity="0.45" />
      <circle cx="132" cy="54" r="4" fill="#0066FF" opacity="0.45" />
      <path d="M112 68c4 4 12 4 16 0" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function FeatureModuleIcon({ variant }: { variant: string }) {
  if (variant === "role") {
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M12 3l2 5h5l-4 3 1.5 5L12 13l-4.5 3L9 11 5 8h5L12 3z" strokeLinejoin="round" />
        <path d="M12 14v4" strokeLinecap="round" />
        <path d="M9 20h6" strokeLinecap="round" />
      </svg>
    );
  }
  if (variant === "candidate") {
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
        <rect x="4" y="5" width="16" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="11" r="3" />
        <path d="M8.5 16.5c.8-1.8 2-2.5 3.5-2.5s2.7.7 3.5 2.5" />
      </svg>
    );
  }
  if (variant === "evidence") {
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M4 6l8-3 8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M9 5c0-2 1.5-3.5 3-3.5S15 3 15 5s-1.5 3.5-3 3.5S9 7 9 5z" />
      <path d="M6 20c0-3.5 2.5-6 6-6s6 2.5 6 6" strokeLinecap="round" />
      <circle cx="17" cy="8" r="2.5" strokeWidth="1.4" />
      <path d="M17 10.5v2M16 11.5h2" strokeLinecap="round" />
    </svg>
  );
}

const ART: Record<string, ComponentType> = {
  role: RoleIntelligenceArt,
  candidate: CandidateIntelligenceArt,
  evidence: EvidenceIntelligenceArt,
  reasoning: AIReasoningArt,
};

export function FeatureModuleArt({ variant }: { variant: string }) {
  const Component = ART[variant] ?? RoleIntelligenceArt;
  return <Component />;
}
