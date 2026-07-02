import {
  ENGINE_FEATURES,
  EVIDENCE_SOURCES,
  FEATURES,
  LP,
  RECOMMENDATION,
  TIMELINE_STEPS,
} from "@/components/landing/constants";
import { FeatureModuleIcon } from "@/components/landing/FeatureModuleArt";

export { HeroIllustration } from "@/components/landing/HeroIllustration";

const SOURCE_ICONS: Record<string, string> = {
  GitHub: "GH",
  Resume: "RE",
  LinkedIn: "in",
  Portfolio: "PO",
  LeetCode: "LC",
  Projects: "PR",
};

function SourceRow({ label }: { label: string }) {
  return (
    <div className="lp-evidence-source">
      <span className="lp-evidence-source-icon">{SOURCE_ICONS[label] ?? "•"}</span>
      <span>{label}</span>
    </div>
  );
}

function IsometricCube() {
  return (
    <svg viewBox="0 0 88 96" className="lp-evidence-cube-svg" aria-hidden>
      <defs>
        <linearGradient id="cube-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b8bff" />
          <stop offset="100%" stopColor="#0066ff" />
        </linearGradient>
        <linearGradient id="cube-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0052cc" />
          <stop offset="100%" stopColor="#0047b3" />
        </linearGradient>
        <linearGradient id="cube-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0066ff" />
          <stop offset="100%" stopColor="#0052cc" />
        </linearGradient>
      </defs>
      <polygon points="44,8 80,28 44,48 8,28" fill="url(#cube-top)" />
      <polygon points="8,28 44,48 44,88 8,68" fill="url(#cube-left)" />
      <polygon points="44,48 80,28 80,68 44,88" fill="url(#cube-right)" />
      <text x="44" y="58" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="800">
        D
      </text>
    </svg>
  );
}

export function EvidenceEngineDiagram() {
  return (
    <div className="lp-evidence-diagram">
      <div className="lp-evidence-card lp-evidence-card--sources">
        {EVIDENCE_SOURCES.map((s) => (
          <SourceRow key={s.label} label={s.label} />
        ))}
      </div>

      <div className="lp-evidence-connector" aria-hidden>
        <svg viewBox="0 0 48 120" className="lp-evidence-connector-svg">
          <path
            d="M4 20 C24 20, 28 40, 44 58 M4 60 C24 60, 28 58, 44 58 M4 100 C24 100, 28 76, 44 58"
            fill="none"
            stroke={LP.primary}
            strokeWidth="1.5"
            strokeDasharray="4 5"
            opacity="0.45"
          />
        </svg>
      </div>

      <div className="lp-evidence-engine">
        <div className="lp-evidence-cube">
          <IsometricCube />
        </div>
        <div className="lp-evidence-engine-copy">
          <p className="lp-evidence-engine-title">DELULU Evidence Engine</p>
          <ul>
            {ENGINE_FEATURES.map((f) => (
              <li key={f}>
                <span className="lp-plus">+</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lp-evidence-connector lp-evidence-connector--out" aria-hidden>
        <svg viewBox="0 0 48 24" className="lp-evidence-connector-svg-h">
          <line x1="0" y1="12" x2="40" y2="12" stroke={LP.primary} strokeWidth="1.5" strokeDasharray="4 5" opacity="0.45" />
          <path d="M42 8l6 4-6 4V8z" fill={LP.primary} opacity="0.65" />
        </svg>
      </div>

      <div className="lp-evidence-card lp-evidence-card--output">
        <p className="lp-evidence-output-label">{RECOMMENDATION.title}</p>
        <div className="lp-evidence-shield">
          <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none">
            <circle cx="20" cy="16" r="8" fill={LP.primaryLight} stroke={LP.primary} strokeWidth="1.5" />
            <path d="M10 34c0-8 4.5-12 10-12s10 4 10 12" fill={LP.primaryLight} stroke={LP.primary} strokeWidth="1.5" />
            <path d="M16 34h8" stroke={LP.primary} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="lp-evidence-output-detail">{RECOMMENDATION.detail}</p>
        <span className="lp-evidence-verdict">{RECOMMENDATION.verdict}</span>
      </div>
    </div>
  );
}

const FEATURE_ART_SRC: Record<string, string> = {
  role: "/landing/feature-role.png",
  candidate: "/landing/feature-candidate.png",
  evidence: "/landing/feature-evidence.png",
  reasoning: "/landing/feature-reasoning.png",
};

function FeatureIllustration({ variant }: { variant: string }) {
  const src = FEATURE_ART_SRC[variant] ?? FEATURE_ART_SRC.role;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="lp-feature-illustration" width={512} height={341} />
  );
}

function FeatureIcon({ variant }: { variant: string }) {
  return <FeatureModuleIcon variant={variant} />;
}

export function FeatureCards() {
  return (
    <div className="lp-feature-grid">
      {FEATURES.map((f) => (
        <article key={f.title} className="lp-feature-card">
          <div className="lp-feature-card-top">
            <div className="lp-feature-card-icon">
              <FeatureIcon variant={f.variant} />
            </div>
            <div className="lp-feature-card-art">
              <FeatureIllustration variant={f.variant} />
            </div>
          </div>
          <h3>{f.title}</h3>
          <p>{f.description}</p>
          <a href="/signup" className="lp-feature-link">
            Explore <span aria-hidden>→</span>
          </a>
        </article>
      ))}
    </div>
  );
}

export function TalentGraphVisual() {
  return (
    <div className="lp-talent-graph">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/landing/talent-graph-visual.png"
        alt="Talent graph showing skills, companies, and communities connected to a candidate"
        className="lp-talent-graph-img"
        width={1024}
        height={508}
      />
    </div>
  );
}

export function TimelineDiagram() {
  return (
    <div className="lp-timeline">
      <div className="lp-timeline-rail" aria-hidden />
      <div className="lp-timeline-steps">
        {TIMELINE_STEPS.map((step, i) => (
          <div key={step.title} className="lp-timeline-step">
            <div className="lp-timeline-dot">{i + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <time>{step.time}</time>
          </div>
        ))}
      </div>
    </div>
  );
}
