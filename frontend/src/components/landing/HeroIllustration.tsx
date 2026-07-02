"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function HeroIllustration() {
  const reduce = useReducedMotion();

  const scene = (
    <div className="lp-hero-scene lp-hero-scene--blend">
      <div className="lp-hero-ambient" aria-hidden />
      <div className="lp-hero-ambient lp-hero-ambient--floor" aria-hidden />
      <div className="lp-glow-orb lp-hero-glow-a" aria-hidden />
      <div className="lp-glow-orb lp-hero-glow-b" aria-hidden />

      <div className="lp-hero-photo">
        <Image
          src="/landing/hero-reference.png"
          alt="DELULU recruiter intelligence — robot, evidence cards, and priority dashboard"
          fill
          priority
          sizes="(min-width: 1024px) 640px, 100vw"
          className="lp-hero-photo-img"
          draggable={false}
        />
      </div>

      <div className="lp-hero-edge-fade" aria-hidden />
    </div>
  );

  if (reduce) {
    return <div className="lp-hero-visual-wrap">{scene}</div>;
  }

  return (
    <motion.div
      className="lp-hero-visual-wrap"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: easeOut }}
    >
      {scene}
    </motion.div>
  );
}
