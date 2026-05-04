"use client";

import { useRouter } from "next/navigation";
import { lazy, Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
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
import { Button } from "@/components/ui/button";

const JobsList = lazy(() =>
  import("@/components/jobs/jobs-list").then((module) => ({ default: module.JobsList })),
);

function JobsListFallback() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/5 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/5 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-16 rounded-full bg-white/5 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-white/5 animate-pulse" />
          </div>
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/[0.03] to-transparent" />
        </div>
      ))}
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
        <section className="fade-up group relative overflow-hidden rounded-[2rem] bg-[#0a0c24] border border-white/5 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-600/10 to-transparent pointer-events-none" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative h-16 w-16 rounded-2xl border border-white/10 bg-[#07091a] flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-violet-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white border-2 border-[#0a0c24]">
                    AI
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[9px] font-black uppercase tracking-widest text-violet-400">Quantum Match</span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Zap className="h-3 w-3 fill-current" /> 98% Compatibility
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                    Senior Software Engineer <span className="text-slate-500 font-medium">@ Remote</span>
                  </h2>
                  <p className="mt-2 text-sm text-slate-400 max-w-xl leading-relaxed">
                    Based on your expertise in <span className="text-cyan-400 font-bold">React</span> and <span className="text-violet-400 font-bold">Node.js</span>, this role is a top-tier recommendation for your next career move.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm">Quick Apply</Button>
                <Button variant="ghost" size="sm">Dismiss</Button>
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
