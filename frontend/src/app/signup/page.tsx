"use client";

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-14">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7c3aed] text-sm font-bold text-white">D</span>
            <span className="text-xl font-bold text-gray-900">DELULU</span>
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Start ranking candidates on evidence, not resumes.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="field w-full px-4 py-2.5 text-sm"
                placeholder="Acme Inc."
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field w-full px-4 py-2.5 text-sm"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field w-full px-4 py-2.5 text-sm"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full rounded-lg px-6 py-2.5 disabled:opacity-60">
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href={`/login${nextSuffix}`} className="font-medium text-[#7c3aed] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
