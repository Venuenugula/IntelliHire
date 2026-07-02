import { FEATURES_SECTION } from "@/components/landing/constants";
import { FeatureCards } from "@/components/landing/LandingIllustrations";
import { FadeIn } from "@/components/landing/FadeIn";
import { SectionEyebrow } from "@/components/landing/ui/SectionEyebrow";

export function FeatureGrid() {
  return (
    <section id="product" className="lp-section lp-section--features">
      <div className="lp-container">
        <FadeIn className="lp-features-header lp-features-header--left">
          <SectionEyebrow>{FEATURES_SECTION.eyebrow}</SectionEyebrow>
        </FadeIn>
        <FadeIn delay={0.04}>
          <FeatureCards />
        </FadeIn>
      </div>
    </section>
  );
}
