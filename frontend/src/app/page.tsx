"use client";

import Link from "next/link";
import { useAuthSession } from "@/lib/auth/use-auth-session";

export default function Home() {
  const { isAuthenticated, logout } = useAuthSession();

  return (
    <main className="auth-page-background flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <section className="surface-card page-fade w-full max-w-2xl rounded-3xl p-8">
        <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary-strong)]">
          Smart Job Search Platform
        </span>
        <h1 className="mt-4 bg-gradient-to-r from-[var(--foreground)] to-[var(--primary-strong)] bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          JobFinder
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Production-ready authentication is now integrated with your Spring Boot API.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/jobs"
            className="cta-button rounded-lg px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Browse Jobs 🔥
          </Link>
          <Link
            href="/login"
            className="field-input rounded-lg px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="field-input rounded-lg px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5"
          >
            Register
          </Link>
          <Link
            href="/forgot-password"
            className="field-input rounded-lg px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5"
          >
            Forgot password
          </Link>
        </div>

        <div className="mt-8 rounded-lg border border-[var(--card-border)] bg-[var(--primary-soft)]/60 p-4">
          <p className="text-sm text-[var(--foreground)]">
            Session status:{" "}
            <span className="font-semibold">
              {isAuthenticated ? "Authenticated" : "Guest"}
            </span>
          </p>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="mt-3 rounded-lg bg-[var(--danger)] px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Logout
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
