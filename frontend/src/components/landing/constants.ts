export const LP = {
  bg: "#FFFFFF",
  section: "#F8FAFC",
  card: "#FFFFFF",
  primary: "#0066FF",
  primaryDark: "#0052CC",
  primaryLight: "#E8F1FF",
  primarySoft: "#D6E8FF",
  border: "#E2E8F0",
  text: "#0B1220",
  navy: "#0B1220",
  footer: "#0A192F",
  muted: "#64748B",
  green: "#16A34A",
  gradient: "linear-gradient(90deg, #0066FF 0%, #3B82F6 55%, #60A5FA 100%)",
} as const;

export const NAV_LINKS = [
  { label: "How It Works", href: "#solutions", chevron: false },
  { label: "Intelligence Modules", href: "#product", chevron: false },
  { label: "Talent Graph", href: "#resources", chevron: false },
  { label: "AI Reasoning", href: "#process", chevron: false },
  { label: "Contact", href: "#contact", chevron: false },
] as const;

export const HERO_COPY = {
  badge: "Evidence-Driven Recruiter Intelligence",
  headline: "Every hiring decision should be",
  headlineAccent: "explainable.",
  description:
    "DELULU collects evidence from GitHub, LinkedIn, resumes, portfolios, and projects — then transforms it into transparent recruiter intelligence with confidence scores and reasoning.",
  ctaPrimary: "Get Started",
} as const;

export const TRUST_ITEMS = [
  "Evidence-backed",
  "Explainable scoring",
  "Enterprise ready",
  "Fast onboarding",
] as const;

export const EVIDENCE_FLOW = {
  eyebrow: "How DELULU works",
  heading: "From raw signals to confident hiring decisions.",
  description:
    "Collect evidence from every source, validate it through the DELULU Evidence Engine, and deliver transparent recommendations recruiters can trust.",
  cta: "See How It Works",
} as const;

export const EVIDENCE_SOURCES = [
  { label: "GitHub", icon: "GH" },
  { label: "Resume", icon: "RE" },
  { label: "LinkedIn", icon: "IN" },
  { label: "Portfolio", icon: "PO" },
  { label: "LeetCode", icon: "LC" },
  { label: "Projects", icon: "PR" },
] as const;

export const ENGINE_FEATURES = [
  "Cross-source validation",
  "AI reasoning",
  "Signal scoring",
  "Bias mitigation",
] as const;

export const RECOMMENDATION = {
  title: "Transparent Recommendation",
  detail: "Every score. Every reason. Every line.",
  verdict: "Strong Hire",
} as const;

export const FEATURES_SECTION = {
  eyebrow: "Powerful intelligence modules",
} as const;

export const FEATURES = [
  {
    title: "Role Intelligence",
    description:
      "Extract hiring intent from job descriptions and build structured role blueprints with skills, traits, and evidence requirements.",
    variant: "role" as const,
  },
  {
    title: "Candidate Intelligence",
    description:
      "Unified profiles built from resumes, GitHub, LinkedIn, portfolios, and more. Every signal scored with confidence.",
    variant: "candidate" as const,
  },
  {
    title: "Evidence Intelligence",
    description:
      "Cross-source validation ensures claims are verified against real-world work — not just keywords.",
    variant: "evidence" as const,
  },
  {
    title: "AI Reasoning",
    description:
      "Transparent recommendations with strengths, risks, and missing evidence. No black-box decisions.",
    variant: "reasoning" as const,
  },
] as const;

export const TALENT_GRAPH_SECTION = {
  eyebrow: "See the complete picture",
  heading: "Talent Graph that connects what matters.",
  description:
    "Discover how skills, companies, projects, and communities connect to show the real potential behind every candidate.",
  cta: "Explore Talent Graph",
} as const;

export const TALENT_GRAPH_NODES = [
  "Python",
  "System Design",
  "Open Source",
  "Tech Communities",
  "AWS",
  "E-commerce Platform",
  "REST APIs",
  "Acme Inc.",
] as const;

export const TIMELINE_SECTION = {
  eyebrow: "AI reasoning in action",
  heading: "Every recommendation has proof.",
  description: "We show you the why behind every score so you can hire with confidence.",
  cta: "See AI Reasoning",
} as const;

export const TIMELINE_STEPS = [
  { title: "Resume Uploaded", body: "Extracted experience, skills & education", time: "10:32 AM" },
  { title: "GitHub Analyzed", body: "Analyzed 727 commits, 12 repositories", time: "10:34 AM" },
  { title: "Portfolio Verified", body: "3 projects verified, 2 case studies", time: "10:35 AM" },
  { title: "Projects Extracted", body: "Impact & tech stack identified", time: "10:38 AM" },
  { title: "AI Recommendation", body: "Strong hire with 92% confidence", time: "10:47 AM" },
] as const;

export const CTA_COPY = {
  heading: "Ready to hire with confidence?",
  body: "Evaluate your first candidate in less than 5 minutes.",
  primary: "Get Started",
} as const;

export const FOOTER_TAGLINE = "Evidence-driven insights for modern recruiting teams.";

export const FOOTER_COLUMNS = {
  Product: ["Features", "Role Intelligence", "Candidate Intelligence", "Evidence Intelligence", "Talent Graph"],
  Solutions: ["How it Works", "AI Reasoning", "Candidate Ranking", "Enterprise", "Integrations"],
  Resources: ["Documentation", "Blog", "Guides", "Changelog"],
  Company: ["About Us", "Careers", "Contact", "Press"],
  Legal: ["Privacy Policy", "Terms of Service", "Security", "GDPR"],
} as const;
