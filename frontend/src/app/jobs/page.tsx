"use client";

import { useRouter } from "next/navigation";
import { lazy, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
// Dynamically import the AI Chatbot (client-side only)
const AiChatbot = dynamic(() => import("@/components/ai/ai-chatbot"), { ssr: false });
import {
  Briefcase, 
  Rocket,
  Shield,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";
import { JobsNavbar } from "@/components/jobs/jobs-navbar";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { AppLayout } from "@/components/layout/app-layout";

const JobsList = lazy(() =>
  import("@/components/jobs/jobs-list").then((module) => ({ default: module.JobsList })),
);

function JobsListFallback() {
  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="h-5 w-40 animate-pulse rounded bg-white/20" />
      <div className="mt-4 h-14 animate-pulse rounded-2xl bg-white/10" />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { isAuthenticated, isSessionReady } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (isSessionReady && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.replace(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, isSessionReady, router]);

  if (!isSessionReady || !isAuthenticated) {
    return (
      <div className="jobs-page-background relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="scale-in dashboard-panel w-full max-w-md rounded-3xl p-10 text-center">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-linear-to-r from-[#A020F0] to-[#4B0082] opacity-35" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[0_0_20px_rgba(160,32,240,0.35)]">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>

            <h1 className="metallic-title text-2xl font-black">Verifying Session</h1>
            <p className="mt-3 text-sm leading-6 text-[#D1D5DB]">
              Redirecting you to the login page securely...
            </p>

            <div className="mt-6 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 animate-bounce rounded-full bg-linear-to-r from-[#A020F0] to-[#4B0082]"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Explore Jobs</h1>
            <p className="text-slate-400 text-sm mt-1">Discover opportunities that match your expertise.</p>
          </div>
        </div>

        {/* Top: AI Match Section - Compact & Premium */}
        <section className="fade-up mb-6 overflow-hidden rounded-2xl bg-white/[0.03] border border-white/5 p-5 sm:p-6 relative">
          <div className="absolute right-0 top-0 h-40 w-40 opacity-10 pointer-events-none">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/5">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-sm font-black uppercase tracking-widest text-violet-400">Perfect Match</h2>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
                    Senior Software Engineer (Remote)
                  </h1>
                  <p className="mt-1 text-sm text-slate-400 max-w-lg">
                    This role matches 98% of your profile skills and preferences.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="btn-glow-primary px-5 py-2.5 text-xs font-bold rounded-xl">
                  Quick Apply
                </button>
                <button className="px-5 py-2.5 text-xs font-bold rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-all">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Middle: Jobs List */}
        <div className="fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recommended Roles</h2>
            <span className="text-xs text-slate-400 font-medium hover:text-white cursor-pointer transition-colors">View All</span>
          </div>
          <Suspense fallback={<JobsListFallback />}>
            <JobsList />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}
