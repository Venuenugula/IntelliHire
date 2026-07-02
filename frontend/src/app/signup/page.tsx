"use client";

import { NeuralOrb } from "@/components/ui/NeuralOrb";
import { registerRecruiter, setStoredRecruiter, setToken } from "@/lib/api";
import { nextDestination, useNextSuffix } from "@/lib/useRequireAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const nextSuffix = useNextSuffix();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const auth = await registerRecruiter(companyName, email, password);
      setToken(auth.access_token);
      setStoredRecruiter(auth.recruiter);
      router.push(nextDestination());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.35em] text-violet-300">
            Recruiter Sign Up
          </p>
          <h1 className="text-4xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-white/50">
            Start ranking candidates on evidence, not resumes.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-6">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="field w-full px-4 py-3 text-sm"
                placeholder="Acme Inc."
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field w-full px-4 py-3 text-sm"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field w-full px-4 py-3 text-sm"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full rounded-xl px-6 py-3 font-medium disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <p className="text-sm text-white/50">
              Already have an account?{" "}
              <Link href={`/login${nextSuffix}`} className="text-violet-300 hover:text-violet-200">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        <div className="glass relative hidden overflow-hidden p-10 lg:block">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />
          <div className="flex justify-center">
            <div className="floaty">
              <NeuralOrb size={300} />
            </div>
          </div>
          <p className="relative mt-8 text-center text-lg font-semibold text-white">
            We don&apos;t rank resumes. We rank evidence.
          </p>
          <p className="relative mt-2 text-center text-sm text-white/50">
            Deep GitHub, LeetCode &amp; LinkedIn analysis for every candidate.
          </p>
        </div>
      </div>
    </div>
  );
}
