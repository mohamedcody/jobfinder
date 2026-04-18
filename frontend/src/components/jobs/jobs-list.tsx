"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Briefcase, Filter, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { JobCard } from "@/components/jobs/job-card";
import { JobSearchFilter } from "@/components/jobs/job-search-filter";
import { getApiErrorMessage, isRequestCanceled } from "@/lib/auth/api-error";
import { jobsService } from "@/lib/jobs/jobs-service";
import type { Job, JobFilterParams } from "@/lib/jobs/types";

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [filters, setFilters] = useState<JobFilterParams>({});
  
  const requestIdRef = useRef(0);
  const activeControllerRef = useRef<AbortController | null>(null);

  const cancelInFlightRequest = useCallback(() => {
    activeControllerRef.current?.abort();
    activeControllerRef.current = null;
    // Avoid stuck loading flags when a previous request is aborted by a newer one.
    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  const loadJobs = useCallback(async (currentFilters: JobFilterParams, cursor: number | null = null, append = false) => {
    cancelInFlightRequest();

    const controller = new AbortController();
    activeControllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    const setLoading = append ? setIsLoadingMore : setIsLoading;
    
    setLoading(true);
    if (!append) setError(null);

    try {
      // Always use filterJobs for consistent experience
      const response = await jobsService.filterJobs(
        { ...currentFilters, lastId: cursor ?? undefined }, 
        { signal: controller.signal }
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
  }, [cancelInFlightRequest]);

  useEffect(() => {
    void loadJobs({});
    return () => cancelInFlightRequest();
  }, [cancelInFlightRequest, loadJobs]);

  const handleSearch = useCallback((newFilters: JobFilterParams) => {
    setFilters(newFilters);
    setJobs([]);
    setNextCursor(null);
    void loadJobs(newFilters);
  }, [loadJobs]);

  const handleLoadMore = useCallback(() => {
    if (nextCursor !== null) {
      void loadJobs(filters, nextCursor, true);
    }
  }, [loadJobs, nextCursor, filters]);

  const stats = useMemo(() => [
    { label: "Matches", value: jobs.length.toString() },
    { label: "Location", value: filters.location || "Anywhere" },
    { label: "Status", value: hasMore ? "More available" : "End reached" },
  ], [hasMore, jobs.length, filters.location]);

  return (
    <div className="space-y-6 pb-10">
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-white">Advanced Search Filters</p>
            <p className="text-xs text-[#D1D5DB]">Find roles by title, location and posting date.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white">
            <Filter className="h-4 w-4 text-[#00FFFF]" />
            Smart Filtering Active
          </div>
        </div>

        <JobSearchFilter onSearch={handleSearch} isLoading={isLoading || isLoadingMore} />
      </div>

      {isLoading && jobs.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="glass-panel animate-pulse rounded-3xl h-64 bg-white/5" />
          ))}
        </div>
      ) : error && jobs.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-red-500/30">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white">Connection Error</h3>
          <p className="text-sm text-[#D1D5DB] mt-2">{error}</p>
          <button
            type="button"
            onClick={() => handleSearch(filters)}
            className="mt-6 btn-primary"
            aria-label="Retry loading job search results"
          >
            Retry Search
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center border-dashed">
          <Briefcase className="mx-auto h-14 w-14 text-white/20 mb-4" />
          <h3 className="text-2xl font-black text-white">No results found</h3>
          <p className="text-[#D1D5DB] mt-2">Try adjusting your filters or search keywords.</p>
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
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                aria-label="Load more job search results"
                className="group relative flex items-center gap-2 rounded-full bg-linear-to-r from-[#A020F0] to-[#4B0082] px-10 py-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(160,32,240,0.5)] transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
              >
                {isLoadingMore ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Sparkles className="h-5 w-5" /> Load More Results</>}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
