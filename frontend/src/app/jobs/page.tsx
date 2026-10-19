"use client";

import { lazy, Suspense, useState } from "react";
import {
  Sparkles,
  Zap
} from "lucide-react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";

const JobsList = lazy(() =>
  import("@/features/jobs/components/jobs-list").then((module) => ({ default: module.JobsList })),
);

function JobsListFallback() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-5 sm:p-6 space-y-4 min-h-[280px]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-white/5 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-white/5 animate-pulse shrink-0" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="h-3 w-full rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-20 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-6 w-20 rounded-lg bg-white/5 animate-pulse" />
          </div>
          <div className="pt-3 border-t border-white/[0.06] flex gap-3">
            <div className="flex-1 h-11 rounded-xl bg-white/5 animate-pulse" />
            <div className="h-11 w-11 rounded-xl bg-white/5 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JobsPage() {
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Match Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Find Your Next Opportunity</h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Discover verified roles ranked by AI alignment with your skills and career preferences.
          </p>
        </div>

        {/* AI Match Section */}
        {!isBannerDismissed && (
          <section className="relative overflow-hidden rounded-2xl bg-[#0c0f24] border border-violet-500/25 p-5 sm:p-6 shadow-sm">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-xl border border-violet-500/30 bg-violet-600/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-violet-400" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-[11px] font-semibold text-violet-300">
                      Top Recommendation
                    </span>
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <Zap className="h-3 w-3 fill-current" /> 98% Compatibility
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Senior Software Engineer <span className="text-slate-400 font-normal text-sm">@ Remote</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                    Based on your skills in React, TypeScript, and Node.js. Click AI Insights on any job card for personalized evaluation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0 self-end lg:self-center">
                <Button
                  variant="primary"
                  size="sm"
                  className="h-10 px-4 rounded-xl text-xs font-semibold cursor-pointer"
                  onClick={() => document.getElementById("jobs-list-container")?.scrollIntoView({ behavior: "smooth" })}
                >
                  View Matches
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-3 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                  onClick={() => setIsBannerDismissed(true)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Info Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0f24] p-4">
            <p className="text-xs font-bold text-violet-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" /> AI Insights
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant analysis and key requirements breakdown directly on each opportunity.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0f24] p-4">
            <p className="text-xs font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
              <span>🤖</span> JobBot Assistant
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask targeted questions about salary benchmarks, culture, and interview prep.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0f24] p-4">
            <p className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
              <span>📌</span> Saved Matches & Kanban
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organize opportunities across pipeline stages from Bookmarked to Applied.
            </p>
          </div>
        </div>

        {/* Middle: Jobs List */}
        <div id="jobs-list-container" className="fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Recommended Roles</h2>
              <p className="text-xs text-slate-400 mt-1">Ranked by AI match quality and career alignment</p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("jobs-list-container")?.scrollIntoView({ behavior: "smooth" })}
              className="text-xs text-slate-400 font-medium hover:text-white cursor-pointer transition-colors"
            >
              View All →
            </button>
          </div>
          <Suspense fallback={<JobsListFallback />}>
            <JobsList />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}
