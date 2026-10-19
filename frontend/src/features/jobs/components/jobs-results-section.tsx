/**
 * COMPONENT SPECIFICATION: JobsResultsSection (Quantum Organism)
 * ────────────────────────────────────────────────────────────
 * • PROPS API: Comprehensive list of search state handlers.
 * • IA: Story-driven empty/error states (Phase 3).
 * • PERF: Memoized to prevent unnecessary re-renders of the job list.
 * ────────────────────────────────────────────────────────────
 */

"use client";

import { memo, useRef, useEffect, useMemo } from "react";
import { 
  AlertCircle, 
  Filter, 
  Loader2, 
  Sparkles, 
  X 
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { JobCard } from "@/features/jobs/components/job-card";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Job } from "@/types/jobs.types";
import type { JobSearchFormState } from "@/features/jobs/components/job-search-filter";

interface JobsResultsSectionProps {
  jobs: Job[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  stats: Array<{ label: string; value: string }>;
  activeChips: Array<{ key: keyof JobSearchFormState; label: string }>;
  searchTerm?: string;
  onRetrySearch: () => void;
  onLoadMore: () => void;
  onRemoveFilter: (key: keyof JobSearchFormState) => void;
  onClearAll: () => void;
  onRefresh: () => void;
  onSelectPopularSearch?: (term: string) => void;
}

function JobsResultsSectionComponent({
  jobs,
  hasMore,
  isLoading,
  isLoadingMore,
  error,
  stats,
  activeChips,
  searchTerm,
  onRetrySearch,
  onLoadMore,
  onRemoveFilter,
  onClearAll,
  onRefresh,
  onSelectPopularSearch,
}: JobsResultsSectionProps) {
  const showError = error && jobs.length === 0;
  const showEmpty = !isLoading && !showError && jobs.length === 0;

  const visibleJobIds = useMemo(() => jobs.map((job) => job.id).filter(Boolean), [jobs]);
  useSavedJobs(visibleJobIds);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isLoadMoreInView = useInView(loadMoreRef, { margin: "200px" });

  useEffect(() => {
    if (isLoadMoreInView && hasMore && !isLoadingMore) {
      onLoadMore();
    }
  }, [isLoadMoreInView, hasMore, isLoadingMore, onLoadMore]);

  return (
    <div className="space-y-6">
      {/* 1. Results Metadata Panel */}
      <div className="rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Search Results
            </h2>
            <p className="text-sm font-semibold text-white">
              {activeChips.length ? `${activeChips.length} active filter${activeChips.length > 1 ? "s" : ""}` : "Showing all available opportunities"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-0.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <p className="text-sm font-bold text-white tracking-tight">
                  {stat.value}
                </p>
              </div>
            ))}

            <Button
              onClick={onRefresh}
              disabled={isLoading || isLoadingMore}
              variant="outline"
              size="sm"
              className="gap-2 border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:text-white text-xs font-semibold"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 border-t border-white/[0.06]">
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="info"
                removable
                onRemove={() => onRemoveFilter(chip.key)}
              >
                {chip.label}
              </Badge>
            ))}
            <button
              onClick={onClearAll}
              className="ml-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* 2. Content Matrix */}
      <div className="space-y-4" aria-live="polite">
        {isLoading && jobs.length === 0 ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-56 rounded-2xl bg-[#0c0f24] border border-white/[0.08] animate-pulse" />
            ))}
          </div>
        ) : showError ? (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-500/20 bg-[#0c0f24] p-10 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Unable to Load Jobs</h3>
            <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm text-slate-400 leading-relaxed">
              We encountered an issue fetching job opportunities. Please try refreshing.
            </p>
            <div className="mt-6 flex items-center justify-center">
              <button
                type="button"
                onClick={onRetrySearch}
                className="h-10 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors shadow-sm shadow-violet-600/30 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        ) : showEmpty ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-dashed border-white/[0.08] bg-[#0c0f24]/50 p-12 text-center"
          >
            <div className="mx-auto mb-5 relative flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
              <Filter className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {activeChips.length > 0 ? "No Matching Opportunities" : "Ready to Search?"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed">
              {activeChips.length > 0
                ? "No jobs matched your current criteria. Try adjusting keywords or clearing some filters."
                : "Enter a job title, keywords, or location above to find matching opportunities."}
            </p>
            <div className="mt-6 space-y-2.5">
              <p className="text-xs text-slate-500 font-medium">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["React Developer", "Full Stack", "Remote", "Node.js"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onSelectPopularSearch?.(term)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-all cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* SOVEREIGN WRAPPER: Ensures structural integrity of the results list and load more action */
          <>
            <div className="grid gap-4">
              {jobs.map((job, index) => (
                <JobCard key={`${job.link}-${index}`} job={job} searchTerm={searchTerm} />
              ))}
            </div>

            {hasMore && (
              <div ref={loadMoreRef} className="mt-8 flex justify-center">
                <button
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  aria-label="Load more results"
                  className="h-11 px-8 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-violet-600/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Load More Results</span>
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
