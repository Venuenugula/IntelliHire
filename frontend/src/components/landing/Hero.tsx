import { HERO_COPY, TRUST_ITEMS } from "@/components/landing/constants";
import { HeroIllustration } from "@/components/landing/HeroIllustration";
import { FadeIn } from "@/components/landing/FadeIn";
import { PrimaryButton } from "@/components/landing/ui/LandingButton";

function SparkleIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
      <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.4 1.4M8.1 8.1l1.4 1.4M2.5 9.5l1.4-1.4M8.1 3.9l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <span className="lp-check-icon">
      <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

export function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-container lp-hero-grid">
        <FadeIn className="lp-hero-copy">
          <span className="lp-badge">
            <SparkleIcon />
            {HERO_COPY.badge}
          </span>

          <h1 className="lp-h1 lp-hero-title">
            {HERO_COPY.headline}
            <br />
            <span className="lp-text-accent">{HERO_COPY.headlineAccent}</span>
          </h1>

          <p className="lp-body lp-hero-desc">{HERO_COPY.description}</p>

          <div className="lp-hero-actions">
            <PrimaryButton href="/signup">{HERO_COPY.ctaPrimary}</PrimaryButton>
          </div>

          <div className="lp-trust-row">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="lp-trust-item">
                <CheckIcon />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.06} className="lp-hero-visual-col">
          <HeroIllustration />
        </FadeIn>
      </div>
    </section>
  );
}
