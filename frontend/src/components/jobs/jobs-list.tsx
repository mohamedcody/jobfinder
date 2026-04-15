"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Briefcase, Filter, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { JobCard } from "@/components/jobs/job-card";
import { JobSearchFilter } from "@/components/jobs/job-search-filter";
import { getApiErrorMessage, isRequestCanceled } from "@/lib/auth/api-error";
import { jobsService } from "@/lib/jobs/jobs-service";
import type { Job } from "@/lib/jobs/types";

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [searchTitle, setSearchTitle] = useState("");
  const requestIdRef = useRef(0);
  const activeControllerRef = useRef<AbortController | null>(null);

  const cancelInFlightRequest = useCallback(() => {
    activeControllerRef.current?.abort();
    activeControllerRef.current = null;
  }, []);

  const loadJobs = useCallback(async (title = "", cursor: number | null = null, append = false) => {
    cancelInFlightRequest();

    const controller = new AbortController();
    activeControllerRef.current = controller;
    const requestId = ++requestIdRef.current;
    const setLoading = append ? setIsLoadingMore : setIsLoading;
    setLoading(true);
    setError(null);

    try {
      const response = title
        ? await jobsService.searchJobs({ title, lastId: cursor ?? undefined }, { signal: controller.signal })
        : await jobsService.getAllJobs(cursor ?? undefined, 10, { signal: controller.signal });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setJobs((prev) => (append ? [...prev, ...response.data] : response.data));
      setHasMore(response.hasNext);
      setNextCursor(response.nextCursor);
    } catch (err) {
      if (isRequestCanceled(err) || requestId !== requestIdRef.current) {
        return;
      }

      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }

      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
      }
    }
  }, [cancelInFlightRequest]);

  useEffect(() => {
    void loadJobs();

    return () => {
      cancelInFlightRequest();
    };
  }, [cancelInFlightRequest, loadJobs]);

  const handleSearch = useCallback((title: string) => {
    setSearchTitle(title);
    setJobs([]);
    setNextCursor(null);
    void loadJobs(title);
  }, [loadJobs]);

  const handleLoadMore = useCallback(() => {
    if (nextCursor !== null) {
      void loadJobs(searchTitle, nextCursor, true);
    }
  }, [loadJobs, nextCursor, searchTitle]);

  const stats = useMemo(() => [
    { label: "Results", value: jobs.length.toString() },
    { label: "Search", value: searchTitle ? "Filtered" : "All jobs" },
    { label: "More", value: hasMore ? "Available" : "End reached" },
  ], [hasMore, jobs.length, searchTitle]);

  if (isLoading && jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-[#FFFFE0]">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Search jobs</p>
              <p className="text-xs text-[#D1D5DB]">Use keywords to find roles faster.</p>
            </div>
          </div>
          <div className="mt-5">
            <JobSearchFilter onSearch={handleSearch} isLoading={isLoading || isLoadingMore} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel rounded-2xl p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#D1D5DB]">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="glass-panel rounded-3xl p-6"
            >
              <div className="flex animate-pulse gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/20" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 rounded-full bg-white/20" />
                  <div className="h-3 w-1/2 rounded-full bg-white/20" />
                  <div className="h-3 w-full rounded-full bg-white/20" />
                  <div className="h-3 w-5/6 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-red-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="mt-5 text-2xl font-black tracking-tight text-white">We couldn&apos;t load jobs</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#D1D5DB]">{error}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => void loadJobs(searchTitle)}
            aria-label="Retry loading jobs"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A020F0] to-[#4B0082] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_15px_rgba(160,32,240,0.9)] transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-cyan-300/50"
          >
            Go to Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Search and filter</p>
            <p className="text-xs text-[#D1D5DB]">Explore fresh opportunities and refine your search instantly.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white">
            <Sparkles className="h-4 w-4" />
            Modern jobs dashboard
          </div>
        </div>

        <div className="mt-5">
          <JobSearchFilter onSearch={handleSearch} isLoading={isLoading || isLoadingMore} debounceMs={400} />
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Showing {jobs.length} job results
      </p>

      {jobs.length === 0 && !isLoading ? (
        <div className="glass-panel rounded-3xl border-dashed p-12 text-center">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-[#D1D5DB]">
            <Briefcase className="h-9 w-9" />
          </div>
          <h3 className="mt-5 text-2xl font-black tracking-tight text-white">No jobs found</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#D1D5DB]">
            {searchTitle
              ? `No results for "${searchTitle}". Try a broader keyword like “developer”, “engineer”, or “remote”.`
              : "There are no jobs available right now. Please check back soon."}
          </p>
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
              <JobCard key={`${job.link}-${job.scrapedAt}-${job.companyName}-${index}`} job={job} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                aria-label="Load more jobs"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A020F0] to-[#4B0082] px-8 py-3 text-sm font-semibold text-white shadow-[0_0_15px_rgba(160,32,240,0.9)] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  <>
                    Load More Jobs
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {!hasMore && jobs.length > 0 && (
            <p className="mt-8 text-center text-sm text-[#D1D5DB]">
              You&apos;ve reached the end of the list
            </p>
          )}
        </>
      )}
    </div>
  );
}
