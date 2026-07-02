import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface RecruiterCommandHeaderProps {
  name: string;
  pipelineMessage: string;
  confidence: number;
  reviewCount: number;
  evidenceUpdates: number;
  reviewHref: string;
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function RecruiterCommandHeader({
  name,
  pipelineMessage,
  confidence,
  reviewCount,
  evidenceUpdates,
  reviewHref,
}: RecruiterCommandHeaderProps) {
  return (
    <header className="rc-surface rc-surface--compact mb-8 rc-animate-in">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="rc-label">{timeGreeting()}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--rc-text)] sm:text-[28px]">
            {name} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-2 text-[15px] text-[var(--rc-muted)]">{pipelineMessage}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {confidence > 0 && (
              <span className="rc-status rc-status--info">{confidence}% Hiring Confidence</span>
            )}
            {reviewCount > 0 && (
              <span className="rc-status rc-status--warning">
                {reviewCount} candidate{reviewCount === 1 ? "" : "s"} require review
              </span>
            )}
            {evidenceUpdates > 0 && (
              <span className="rc-status rc-status--success">
                {evidenceUpdates} evidence update{evidenceUpdates === 1 ? "" : "s"} overnight
              </span>
            )}
          </div>

          {reviewCount > 0 && (
            <div className="mt-5">
              <Link href={reviewHref} className="rc-btn-primary">
                Review Candidates
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle variant="icon" />
          <Link href="/jobs/new" className="rc-btn-primary">
            + Analyze New Candidate
          </Link>
        </div>
      </div>
    </header>
  );
}
