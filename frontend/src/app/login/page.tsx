"use client";

import { NeuralOrb } from "@/components/ui/NeuralOrb";
import { loginRecruiter, setStoredRecruiter, setToken } from "@/lib/api";
import { nextDestination, useNextSuffix } from "@/lib/useRequireAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const nextSuffix = useNextSuffix();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const auth = await loginRecruiter(email, password);
      setToken(auth.access_token);
      setStoredRecruiter(auth.recruiter);
      router.push(nextDestination());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.35em] text-violet-300">
            Recruiter Sign In
          </p>
          <h1 className="text-4xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-white/50">Sign in to your hiring dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md space-y-6">
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
                placeholder="Your password"
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full rounded-xl px-6 py-3 font-medium disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p className="text-sm text-white/50">
              New here?{" "}
              <Link href={`/signup${nextSuffix}`} className="text-violet-300 hover:text-violet-200">
                Create an account
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
            Evidence-driven hiring intelligence.
          </p>
        </div>
      </div>
    </div>
  );
}
