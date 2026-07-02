import { LP } from "@/components/landing/constants";
import Link from "next/link";
import type { ReactNode } from "react";

function Arrow() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

export function PrimaryButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`landing-btn-primary inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white ${className}`}
      style={{ background: LP.primary }}
    >
      {children}
      <Arrow />
    </Link>
  );
}

export function SecondaryButton({
  href,
  children,
  className = "",
  dark = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors ${className}`}
      style={{
        borderColor: dark ? "rgba(255,255,255,0.45)" : LP.border,
        color: dark ? "#FFFFFF" : LP.text,
        background: dark ? "transparent" : LP.bg,
      }}
    >
      {children}
    </Link>
  );
}

export function TextLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`inline-flex items-center gap-1 text-sm font-semibold ${className}`} style={{ color: LP.primary }}>
      {children}
      <span>→</span>
    </Link>
  );
}
