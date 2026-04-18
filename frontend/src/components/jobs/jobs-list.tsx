"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Briefcase, Filter, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { JobCard } from "@/components/jobs/job-card";
import {
  JobSearchFilter,
  createEmptyJobSearchState,
  getPostedAfterFromPreset,
  type JobSearchFormState,
} from "@/components/jobs/job-search-filter";
import { getApiErrorMessage, isRequestCanceled } from "@/lib/auth/api-error";
import { jobsService } from "@/lib/jobs/jobs-service";
import type { Job, JobFilterParams } from "@/lib/jobs/types";

const toJobFilterParams = (filters: JobSearchFormState): JobFilterParams => ({
  title: filters.title.trim() || undefined,
  location: filters.location.trim() || undefined,
  postedAfter: getPostedAfterFromPreset(filters.datePreset),
  employmentType: filters.empType || undefined,
});

const isFilterActive = (filters: JobSearchFormState, key: keyof JobSearchFormState) => {
  if (key === "datePreset") return filters.datePreset !== "any";
  return Boolean(filters[key]?.trim?.() || filters[key]);
};

const formatDatePresetLabel = (preset: JobSearchFormState["datePreset"]) => {
  if (preset === "any") return "Anytime";
  if (preset === "24h") return "Last 24h";
  if (preset === "week") return "This week";
  return "This month";
};

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
}: JobsResultsSectionProps) {
  const showError = error && jobs.length === 0;
  const showEmpty = !isLoading && !showError && jobs.length === 0;

  return (
    <>
      <div className="glass-panel rounded-3xl p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Advanced Search Filters</p>
            <p className="text-xs text-[#D1D5DB]">Find roles by title, location and posting date.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white">
            <Filter className="h-4 w-4 text-[#00FFFF]" />
            Smart Filtering Active
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Active filters</p>
              <p className="text-xs text-[#D1D5DB]">
                {activeChips.length ? `${activeChips.length} filter${activeChips.length === 1 ? "" : "s"} applied` : "No filters applied — showing everything."}
              </p>
            </div>

            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {activeChips.length > 0 ? (
              activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => onRemoveFilter(chip.key)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#A020F0]/30 bg-[#A020F0]/10 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#A020F0]/50 hover:bg-[#A020F0]/20"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  {chip.label}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-[#D1D5DB]">
                <Sparkles className="h-3.5 w-3.5 text-[#00FFFF]" />
                Try title, location, posting date, or job type filters to narrow results.
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading && jobs.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="glass-panel h-64 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      ) : showError ? (
        <div className="glass-panel rounded-3xl border-dashed border-red-500/30 p-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="text-xl font-bold text-white">Connection Error</h3>
          <p className="mt-2 text-sm text-[#D1D5DB]">{error}</p>
          <button
            type="button"
            onClick={onRetrySearch}
            className="btn-primary mt-6"
            aria-label="Retry loading job search results"
          >
            Retry Search
          </button>
        </div>
      ) : showEmpty ? (
        <div className="glass-panel rounded-3xl border-dashed p-16 text-center">
          <Briefcase className="mx-auto mb-4 h-14 w-14 text-white/20" />
          <h3 className="text-2xl font-black text-white">No results found</h3>
          <p className="mt-2 text-[#D1D5DB]">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-panel rounded-2xl px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#D1D5DB]">{stat.label}</p>
                <p className="mt-2 text-lg font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {jobs.map((job, index) => (
              <JobCard key={`${job.link}-${index}`} job={job} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                aria-label="Load more job search results"
                className="group relative flex items-center gap-2 rounded-full bg-linear-to-r from-[#A020F0] to-[#4B0082] px-10 py-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(160,32,240,0.5)] transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
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
    </>
  );
}

const JobsResultsSection = memo(JobsResultsSectionComponent);

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [draftFilters, setDraftFilters] = useState<JobSearchFormState>(createEmptyJobSearchState());
  const [appliedFilters, setAppliedFilters] = useState<JobSearchFormState>(createEmptyJobSearchState());

  const requestIdRef = useRef(0);
  const activeControllerRef = useRef<AbortController | null>(null);

  const cancelInFlightRequest = useCallback(() => {
    activeControllerRef.current?.abort();
    activeControllerRef.current = null;
    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  const loadJobs = useCallback(
    async (currentFilters: JobFilterParams, cursor: number | null = null, append = false) => {
      cancelInFlightRequest();

      const controller = new AbortController();
      activeControllerRef.current = controller;
      const requestId = ++requestIdRef.current;
      const setLoading = append ? setIsLoadingMore : setIsLoading;

      setLoading(true);
      if (!append) setError(null);

      try {
        const response = await jobsService.filterJobs(
          { ...currentFilters, lastId: cursor ?? undefined },
          { signal: controller.signal },
        );

        if (requestId !== requestIdRef.current) return;

        setJobs((prev) => (append ? [...prev, ...response.data] : response.data));
        setHasMore(response.hasNext);
        setNextCursor(response.nextCursor);
      } catch (err) {
        if (isRequestCanceled(err) || requestId !== requestIdRef.current) return;

        const message = getApiErrorMessage(err);
        setError(message);
        toast.error(message);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [cancelInFlightRequest],
  );

  useEffect(() => {
    void loadJobs({});
    return () => cancelInFlightRequest();
  }, [cancelInFlightRequest, loadJobs]);

  const handleSearch = useCallback(
    (nextFilters: JobSearchFormState) => {
      setAppliedFilters(nextFilters);
      setJobs([]);
      setError(null);
      setNextCursor(null);
      void loadJobs(toJobFilterParams(nextFilters));
    },
    [loadJobs],
  );

  const handleClearAll = useCallback(() => {
    const emptyState = createEmptyJobSearchState();
    setDraftFilters(emptyState);
    setAppliedFilters(emptyState);
    setJobs([]);
    setError(null);
    setNextCursor(null);
    void loadJobs({});
  }, [loadJobs]);

  const handleRemoveFilter = useCallback(
    (key: keyof JobSearchFormState) => {
      const nextState: JobSearchFormState = {
        ...appliedFilters,
        [key]: key === "datePreset" ? "any" : "",
      };

      setDraftFilters(nextState);
      setAppliedFilters(nextState);
      setJobs([]);
      setError(null);
      setNextCursor(null);
      void loadJobs(toJobFilterParams(nextState));
    },
    [appliedFilters, loadJobs],
  );

  const handleLoadMore = useCallback(() => {
    if (nextCursor !== null) {
      void loadJobs(toJobFilterParams(appliedFilters), nextCursor, true);
    }
  }, [appliedFilters, loadJobs, nextCursor]);

  const handleRetrySearch = useCallback(() => {
    void loadJobs(toJobFilterParams(appliedFilters));
  }, [appliedFilters, loadJobs]);

  const stats = useMemo(
    () => [
      { label: "Matches", value: jobs.length.toString() },
      { label: "Location", value: appliedFilters.location.trim() || "Anywhere" },
      { label: "Status", value: hasMore ? "More available" : "End reached" },
    ],
    [appliedFilters.location, hasMore, jobs.length],
  );

  const activeChips = useMemo(
    () => [
      isFilterActive(appliedFilters, "title") && { key: "title" as const, label: `Title: ${appliedFilters.title.trim()}` },
      isFilterActive(appliedFilters, "location") && { key: "location" as const, label: `Location: ${appliedFilters.location.trim()}` },
      isFilterActive(appliedFilters, "datePreset") && { key: "datePreset" as const, label: `Posted: ${formatDatePresetLabel(appliedFilters.datePreset)}` },
      isFilterActive(appliedFilters, "empType") && { key: "empType" as const, label: `Type: ${appliedFilters.empType}` },
    ].filter(Boolean) as Array<{ key: keyof JobSearchFormState; label: string }>,
    [appliedFilters],
  );

  return (
    <div className="space-y-6 pb-10">
      <JobSearchFilter
        value={draftFilters}
        onChange={setDraftFilters}
        onSearch={handleSearch}
        onClear={handleClearAll}
        isLoading={isLoading || isLoadingMore}
      />

      <JobsResultsSection
        jobs={jobs}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        stats={stats}
        activeChips={activeChips}
        onRetrySearch={handleRetrySearch}
        onLoadMore={handleLoadMore}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
