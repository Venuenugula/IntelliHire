import { TALENT_GRAPH_SECTION } from "@/components/landing/constants";
import { TalentGraphVisual } from "@/components/landing/LandingIllustrations";
import { FadeIn } from "@/components/landing/FadeIn";
import { TextLink } from "@/components/landing/ui/LandingButton";
import { SectionEyebrow } from "@/components/landing/ui/SectionEyebrow";

export function TalentGraphSection() {
  return (
    <section id="resources" className="lp-section lp-section--alt lp-section--talent">
      <div className="lp-container lp-section-split">
        <FadeIn className="lp-split-copy">
          <SectionEyebrow>{TALENT_GRAPH_SECTION.eyebrow}</SectionEyebrow>
          <h2 className="lp-h2 lp-split-title">{TALENT_GRAPH_SECTION.heading}</h2>
          <p className="lp-body lp-split-desc">{TALENT_GRAPH_SECTION.description}</p>
          <TextLink href="/signup" className="lp-split-link">
            {TALENT_GRAPH_SECTION.cta}
          </TextLink>
        </FadeIn>

        <FadeIn delay={0.06} className="lp-split-visual">
          <TalentGraphVisual />
        </FadeIn>
      </div>
    </section>
  );
}
