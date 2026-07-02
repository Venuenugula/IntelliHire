import { CTA } from "@/components/landing/CTA";
import { EvidenceFlow } from "@/components/landing/EvidenceFlow";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { ProcessTimeline } from "@/components/landing/ProcessTimeline";
import { TalentGraphSection } from "@/components/landing/TalentGraphSection";
import "./landing.css";
import "./landing-sections.css";

export function LandingPage() {
  return (
    <div className="landing-page min-h-screen antialiased">
      <Navbar />
      <main>
        <Hero />
        <EvidenceFlow />
        <FeatureGrid />
        <TalentGraphSection />
        <ProcessTimeline />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
