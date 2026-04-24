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
    <div className="relative w-full pb-12">
      {/* AI Chatbot Floating Button */}
      <AiChatbot />
      
      {/* Mobile Navbar (Hidden on Desktop since Sidebar takes over) */}
      <div className="lg:hidden">
        <JobsNavbar />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Top: AI Match Section */}
        <section className="fade-up dashboard-panel mb-8 overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-64 w-64 opacity-30 pointer-events-none">
            <div className="h-full w-full rounded-full bg-linear-to-br from-[#A020F0] to-[#4B0082] blur-3xl" />
          </div>

          <div className="relative">
            <div className="live-session-pill mb-6 inline-flex items-center gap-2 rounded-full bg-[#00FF00]/10 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-[#00FF00]/30">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF00] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00FF00]" />
              </div>
              Live AI Match Detected
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[inset_0_-6px_16px_rgba(10,15,31,0.35)]">
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>

                  <div className="space-y-2">
                    <h1 className="metallic-title text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                      Top Match for You
                    </h1>
                    
                    <p className="max-w-xl text-sm leading-6 text-[#D1D5DB] sm:text-base">
                      Based on your recent profile update, our AI found this perfect remote opportunity that aligns with your skills.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Zap, label: "98% Match", color: "from-green-500 to-emerald-600" },
                    { icon: Shield, label: "$120k - $150k", color: "from-violet-600 to-cyan-600" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="group glass-panel flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      <div className={`flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br ${stat.color} text-white shadow-[0_0_10px_rgba(160,32,240,0.3)]`}>
                        <stat.icon className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-bold text-white">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 lg:flex-col lg:items-stretch">
                <button className="flex-1 py-3 px-6 text-sm font-bold text-white bg-linear-to-r from-violet-600 to-cyan-600 rounded-xl shadow-[0_0_20px_rgba(160,32,240,0.4)] hover:scale-105 transition-transform whitespace-nowrap">
                  Apply with 1-Click
                </button>
                <button className="flex-1 py-3 px-6 text-sm font-bold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap">
                  Save for Later
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
    </div>
  );
}
