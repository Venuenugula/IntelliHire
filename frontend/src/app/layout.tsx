import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { ProfileBadge } from "@/components/ProfileBadge";
import { CosmicBackground } from "@/components/ui/CosmicBackground";
import { Sparkle } from "@/components/ui/Sparkle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DELULU — Hiring Intelligence",
  description: "We don't rank resumes. We rank evidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col bg-[#05060f] text-zinc-100">
        <CosmicBackground />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Sparkle />
        {/* persistent profile avatar, bottom-left — reflects the signed-in user */}
        <ProfileBadge />
      </body>
    </html>
  );
}
