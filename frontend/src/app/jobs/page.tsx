"use client";

import { useRouter } from "next/navigation";
import { lazy, Suspense, useEffect } from "react";
import {
  Sparkles,
  Zap
} from "lucide-react";
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
        <div key={i} className="relative overflow-hidden rounded-[2rem] bg-white/[0.03] border border-white/5 p-6 space-y-4 min-h-[340px]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/5 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse shrink-0" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-3 w-full rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="flex gap-2 pt-4">
            <div className="h-6 w-24 rounded-full bg-white/5 animate-pulse" />
            <div className="h-6 w-24 rounded-full bg-white/5 animate-pulse" />
          </div>
          <div className="pt-4 border-t border-white/5 flex gap-3">
            <div className="flex-1 h-10 rounded-2xl bg-white/5 animate-pulse" />
            <div className="h-10 w-10 rounded-2xl bg-white/5 animate-pulse" />
          </div>
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
        </div>
      ))}
    </div>
  );
}

export default function JobsPage() {
  const router = useRouter();

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Section - Enhanced */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-black text-white tracking-tight">Find Your Next Opportunity</h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            Discover verified job opportunities powered by AI matching. Every role is analyzed and ranked based on your skills and career preferences for the best fit.
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-widest">
            <Sparkles className="h-4 w-4" />
            Smart Matching Powered by AI
          </div>
        </div>

        {/* AI Match Section - Premium & Clear */}
        <section className="fade-up group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-indigo-950/40 border border-white/10 p-6 sm:p-8 shadow-2xl shadow-violet-500/10">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-600/10 to-transparent pointer-events-none" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-start gap-6 flex-1">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative h-16 w-16 rounded-2xl border border-white/10 bg-[#07091a] flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-violet-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white border-2 border-[#0a0c24]">
                    AI
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-[10px] font-black uppercase tracking-widest text-violet-400">🎯 Perfect Match</span>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <Zap className="h-3.5 w-3.5 fill-current" /> 98% Compatibility
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-2">
                    Senior Software Engineer <span className="text-slate-500 font-medium text-xl">@ Remote</span>
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Based on your expertise in <span className="text-cyan-300 font-bold">React</span>, <span className="text-violet-300 font-bold">Node.js</span>, and <span className="text-emerald-300 font-bold">AWS</span>, this is our top recommendation for your career growth. 
                    <span className="block text-xs text-slate-400 mt-2">💡 Tip: Click &quot;AI Insights&quot; on any job card to get detailed analysis and alignment score.</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Button variant="primary" size="sm" className="font-bold">Quick Apply</Button>
                <Button variant="ghost" size="sm">Dismiss</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">✨ AI Insights</p>
            <p className="text-sm text-slate-300">Click the AI button on any job to get detailed analysis, skills match, and career impact assessment.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">🤖 JobBot Assistant</p>
            <p className="text-sm text-slate-300">Ask our AI assistant questions about roles, salary ranges, company culture, and career guidance.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">❤️ Save & Track</p>
            <p className="text-sm text-slate-300">Save jobs you like and track applications across multiple opportunities in one place.</p>
          </div>
        </div>

        {/* Middle: Jobs List */}
        <div className="fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Recommended Roles</h2>
              <p className="text-xs text-slate-400 mt-1">Ranked by AI match quality and career alignment</p>
            </div>
            <span className="text-xs text-slate-400 font-medium hover:text-white cursor-pointer transition-colors">View All →</span>
          </div>
          <Suspense fallback={<JobsListFallback />}>
            <JobsList />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}
