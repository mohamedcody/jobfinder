/**
 * COMPONENT SPECIFICATION: JobsResultsSection (Quantum Organism)
 * ────────────────────────────────────────────────────────────
 * • PROPS API: Comprehensive list of search state handlers.
 * • IA: Story-driven empty/error states (Phase 3).
 * • PERF: Memoized to prevent unnecessary re-renders of the job list.
 * ────────────────────────────────────────────────────────────
 */

"use client";

import { memo } from "react";
import { 
  AlertCircle, 
  Briefcase, 
  Filter, 
  Loader2, 
  Sparkles, 
  X 
} from "lucide-react";
import { motion } from "framer-motion";
import { JobCard } from "@/components/jobs/job-card";
import type { Job } from "@/lib/jobs/types";
import type { JobSearchFormState } from "@/components/jobs/job-search-filter";

interface JobsResultsSectionProps {
  jobs: Job[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  stats: Array<{ label: string; value: string }>;
  activeChips: Array<{ key: keyof JobSearchFormState; label: string }>;
  onRetrySearch: () => void;
  onLoadMore: () => void;
  onRemoveFilter: (key: keyof JobSearchFormState) => void;
  onClearAll: () => void;
  onRefresh: () => void;
}

function JobsResultsSectionComponent({
  jobs,
  hasMore,
  isLoading,
  isLoadingMore,
  error,
  stats,
  activeChips,
  onRetrySearch,
  onLoadMore,
  onRemoveFilter,
  onClearAll,
  onRefresh,
}: JobsResultsSectionProps) {
  const showError = error && jobs.length === 0;
  const showEmpty = !isLoading && !showError && jobs.length === 0;

  return (
    <div className="space-y-6">
      {/* 1. Results Metadata Panel */}
      <div className="rounded-[32px] bg-white/[0.03] border border-white/5 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xs font-black text-white uppercase tracking-widest opacity-60">
              System Scan Results
            </h2>
            <p className="text-sm font-bold text-slate-200">
              {activeChips.length ? `${activeChips.length} parameters active` : "All sectors clear / Showing all results"}
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-500">
                  {stat.label}
                </p>
                <p className="text-base font-black text-white tracking-tight">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading || isLoadingMore}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/10 border border-violet-600/20 text-violet-400 hover:bg-violet-600 hover:text-white transition-all shadow-lg shadow-violet-600/5"
          >
            <Sparkles className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Refresh System</span>
          </button>
        </div>

        {activeChips.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-6 border-t border-white/5">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => onRemoveFilter(chip.key)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-3 py-1.5 text-[11px] font-black text-slate-300 transition-all hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/20"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              onClick={onClearAll}
              className="ml-2 text-[11px] font-black uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors"
            >
              Flush All Filters
            </button>
          </div>
        )}
      </div>

      {/* 2. Content Matrix */}
      <div className="space-y-4" aria-live="polite">
        {isLoading && jobs.length === 0 ? (
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-64 rounded-[32px] bg-white/[0.03] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : showError ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-dashed border-red-500/20 bg-red-500/5 p-16 text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Signal Interrupted</h3>
            <p className="mx-auto mt-3 max-w-sm text-slate-400 leading-relaxed">
              We encountered turbulence while fetching your opportunities. This is usually temporary.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={onRetrySearch}
                className="btn-glow-primary px-8 py-3 rounded-2xl font-bold text-sm"
              >
                Re-establish Signal
              </button>
            </div>
          </motion.div>
        ) : showEmpty ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] border border-dashed border-white/10 bg-white/[0.02] p-20 text-center"
          >
            <div className="mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-violet-500/20 blur-[60px] rounded-full" />
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-violet-600/20 to-cyan-500/10 border border-white/10 shadow-2xl">
                <Filter className="h-10 w-10 text-violet-400" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight">No Matches in this Quadrant</h3>
            <p className="mx-auto mt-4 max-w-md text-lg text-slate-400 leading-relaxed">
              Your current filters are too specific. Try expanding your search to discover hidden opportunities.
            </p>
            <div className="mt-10">
              <button
                onClick={onClearAll}
                className="btn-glow-primary px-10 py-4 rounded-2xl font-bold text-sm group"
              >
                Reset All Parameters
                <X className="ml-2 h-4 w-4 inline-block transition-transform group-hover:rotate-90" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* SOVEREIGN WRAPPER: Ensures structural integrity of the results list and load more action */
          <>
            <div className="grid gap-6">
              {jobs.map((job, index) => (
                <JobCard key={`${job.link}-${index}`} job={job} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  aria-label="Synchronize more results"
                  className="btn-glow-primary btn-shine relative flex items-center gap-2.5 rounded-2xl px-12 py-4 text-sm font-black uppercase tracking-widest text-white disabled:opacity-50 transition-all"
                >
                  {isLoadingMore ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" /> Load More Results
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export const JobsResultsSection = memo(JobsResultsSectionComponent);
