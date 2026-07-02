import { EVIDENCE_FLOW } from "@/components/landing/constants";
import { EvidenceEngineDiagram } from "@/components/landing/LandingIllustrations";
import { FadeIn } from "@/components/landing/FadeIn";
import { PrimaryButton } from "@/components/landing/ui/LandingButton";
import { SectionEyebrow } from "@/components/landing/ui/SectionEyebrow";

export function EvidenceFlow() {
  return (
    <section id="solutions" className="lp-section lp-section--evidence">
      <div className="lp-container lp-section-split">
        <FadeIn className="lp-split-copy">
          <SectionEyebrow>{EVIDENCE_FLOW.eyebrow}</SectionEyebrow>
          <h2 className="lp-h2 lp-split-title">{EVIDENCE_FLOW.heading}</h2>
          <p className="lp-body lp-split-desc">{EVIDENCE_FLOW.description}</p>
          <div className="lp-split-cta">
            <PrimaryButton href="#process">{EVIDENCE_FLOW.cta}</PrimaryButton>
          </div>
        </FadeIn>

        <FadeIn delay={0.06} className="lp-split-visual">
          <EvidenceEngineDiagram />
        </FadeIn>
      </div>
    </section>
  );
}
