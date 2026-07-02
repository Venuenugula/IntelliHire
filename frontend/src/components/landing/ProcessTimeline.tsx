import { TIMELINE_SECTION } from "@/components/landing/constants";
import { TimelineDiagram } from "@/components/landing/LandingIllustrations";
import { FadeIn } from "@/components/landing/FadeIn";
import { TextLink } from "@/components/landing/ui/LandingButton";
import { SectionEyebrow } from "@/components/landing/ui/SectionEyebrow";

export function ProcessTimeline() {
  return (
    <section id="process" className="lp-section">
      <div className="lp-container lp-section-split">
        <FadeIn className="lp-split-copy">
          <SectionEyebrow>{TIMELINE_SECTION.eyebrow}</SectionEyebrow>
          <h2 className="lp-h2 lp-split-title">{TIMELINE_SECTION.heading}</h2>
          <p className="lp-body lp-split-desc">{TIMELINE_SECTION.description}</p>
          <TextLink href="/signup" className="lp-split-link">
            {TIMELINE_SECTION.cta}
          </TextLink>
        </FadeIn>

        <FadeIn delay={0.06} className="lp-split-visual">
          <TimelineDiagram />
        </FadeIn>
      </div>
    </section>
  );
}
