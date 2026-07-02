"use client";

import { LP, NAV_LINKS } from "@/components/landing/constants";
import { PrimaryButton } from "@/components/landing/ui/LandingButton";
import Link from "next/link";

function Chevron() {
  return (
    <svg className="h-3 w-3 opacity-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function Navbar() {
  return (
    <header className="lp-nav">
      <div className="lp-container lp-nav-inner">
        <Link href="/" className="lp-nav-logo">
          <span className="lp-nav-mark">D</span>
          <div className="lp-nav-brand">
            <strong>DELULU</strong>
            <span>Recruiter Intelligence</span>
          </div>
        </Link>

        <nav className="lp-nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
              {link.chevron ? <Chevron /> : null}
            </a>
          ))}
        </nav>

        <div className="lp-nav-actions">
          <Link href="/login" className="lp-nav-signin">
            Sign In
          </Link>
          <PrimaryButton href="/signup" className="!px-4 !py-2 !text-[13px]">
            Get Started
          </PrimaryButton>
        </div>
      </div>
    </header>
  );
}
