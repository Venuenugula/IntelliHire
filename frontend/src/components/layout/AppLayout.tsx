"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "./AppShell";

const MARKETING_PATHS = ["/", "/login", "/signup"];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketing = MARKETING_PATHS.includes(pathname);

  if (isMarketing) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
