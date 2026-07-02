import { CTA_COPY } from "@/components/landing/constants";
import { FadeIn } from "@/components/landing/FadeIn";
import Link from "next/link";

export function CTA() {
  return (
    <section id="contact" className="lp-cta">
      <FadeIn>
        <div className="lp-container">
          <div className="lp-cta-banner">
            <div className="lp-cta-copy">
              <h2>{CTA_COPY.heading}</h2>
              <p>{CTA_COPY.body}</p>
            </div>
            <div className="lp-cta-actions">
              <Link href="/signup" className="lp-cta-btn-primary">
                {CTA_COPY.primary}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
