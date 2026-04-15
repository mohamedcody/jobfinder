"use client";

import { useRouter } from "next/navigation";
import { lazy, Suspense, useEffect } from "react";
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
      router.replace("/login");
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
    <div className="jobs-page-background relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="aurora-spot absolute left-1/4 top-20 h-96 w-96 rounded-full bg-[#A020F0]/25 blur-3xl" />
        <div className="aurora-spot absolute right-1/4 top-40 h-80 w-80 rounded-full bg-[#00FFFF]/20 blur-3xl" />
        <div className="aurora-spot absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-[#A020F0]/18 blur-3xl" />
      </div>

      <JobsNavbar />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="fade-up dashboard-panel mb-10 overflow-hidden rounded-3xl p-8 sm:p-10">
          <div className="absolute right-0 top-0 h-64 w-64 opacity-30">
            <div className="h-full w-full rounded-full bg-linear-to-br from-[#A020F0] to-[#4B0082] blur-3xl" />
          </div>

          <div className="relative">
            <div className="live-session-pill mb-6 inline-flex items-center gap-2 rounded-full bg-[#00FF00]/10 px-4 py-2 text-sm font-bold text-white ring-1 ring-[#00FF00]/30">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF00] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00FF00]" />
              </div>
              Live Opportunities Updated Daily
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[inset_0_-6px_16px_rgba(10,15,31,0.35)]">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>

                  <div className="space-y-3">
                    <h1 className="metallic-title text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                      Discover Your Next
                      <span className="block">Dream Role</span>
                    </h1>
                    
                    <p className="max-w-2xl text-base leading-7 text-[#D1D5DB] sm:text-lg">
                      Browse through curated job opportunities with intelligent search, 
                      elegant filters, and a lightning-fast experience designed to help you land your ideal position.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {[
                    { icon: Zap, label: "Instant Results", color: "from-[#A020F0] to-[#4B0082]" },
                    { icon: Shield, label: "Verified Jobs", color: "from-[#A020F0] to-[#4B0082]" },
                    { icon: TrendingUp, label: "Fresh Postings", color: "from-[#A020F0] to-[#4B0082]" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="group glass-panel flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:-translate-y-0.5"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br ${stat.color} text-white shadow-[0_0_15px_rgba(160,32,240,0.45)]`}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-white">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel space-y-4 rounded-2xl p-6 lg:min-w-[320px]">
                <div className="flex items-center gap-3">
                  <Rocket className="h-6 w-6 text-[#FFFFE0] quick-yellow-glow" />
                  <h3 className="text-lg font-black text-white">Quick Actions</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="glass-panel flex items-center justify-between rounded-lg px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-[#D1D5DB]">
                      <Zap className="h-4 w-4 text-[#FFFFE0] quick-yellow-glow" />
                      Active Searches
                    </span>
                    <span className="quick-yellow-glow rounded-full bg-linear-to-r from-[#A020F0] to-[#4B0082] px-2.5 py-1 text-xs font-bold text-white shadow-[0_0_15px_rgba(160,32,240,0.5)]">
                      24/7
                    </span>
                  </div>
                  
                  <div className="glass-panel flex items-center justify-between rounded-lg px-4 py-3">
                    <span className="text-sm font-medium text-[#D1D5DB]">Match Rate</span>
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "conic-gradient(#FFFFE0 0deg, #00FFFF 352.8deg, rgba(255,255,255,0.15) 352.8deg)" }}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A0F1F] text-xs font-bold text-white">98%</div>
                    </div>
                  </div>
                  
                  <div className="glass-panel flex items-center justify-between rounded-lg px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-[#D1D5DB]">
                      <TrendingUp className="h-4 w-4 text-[#FFFFE0] quick-yellow-glow" />
                      Response Time
                    </span>
                    <span className="quick-yellow-glow rounded-full bg-linear-to-r from-[#A020F0] to-[#4B0082] px-2.5 py-1 text-xs font-bold text-white shadow-[0_0_15px_rgba(160,32,240,0.5)]">
                      &lt;1s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Jobs List */}
        <div className="fade-up" style={{ animationDelay: "0.2s" }}>
          <Suspense fallback={<JobsListFallback />}>
            <JobsList />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
