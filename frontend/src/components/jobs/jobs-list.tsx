"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Briefcase, Filter, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { JobCard } from "@/components/jobs/job-card";
import { JobSearchFilter } from "@/components/jobs/job-search-filter";
import { getApiErrorMessage } from "@/lib/auth/api-error";
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

  const loadJobs = useCallback(async (title = "", cursor: number | null = null, append = false) => {
    const setLoading = append ? setIsLoadingMore : setIsLoading;
    setLoading(true);
    setError(null);

    try {
      const response = title
        ? await jobsService.searchJobs({ title, lastId: cursor ?? undefined })
        : await jobsService.getAllJobs(cursor ?? undefined);

      setJobs((prev) => (append ? [...prev, ...response.data] : response.data));
      setHasMore(response.hasNext);
      setNextCursor(response.nextCursor);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const handleSearch = (title: string) => {
    setSearchTitle(title);
    setJobs([]);
    setNextCursor(null);
    void loadJobs(title);
  };

  const handleLoadMore = () => {
    if (nextCursor !== null) {
      void loadJobs(searchTitle, nextCursor, true);
    }
  };

  const stats = [
    { label: "Results", value: jobs.length.toString() },
    { label: "Search", value: searchTitle ? "Filtered" : "All jobs" },
    { label: "More", value: hasMore ? "Available" : "End reached" },
  ];

  if (isLoading && jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Search jobs</p>
              <p className="text-xs text-slate-500">Use keywords to find roles faster.</p>
            </div>
          </div>
          <div className="mt-5">
            <JobSearchFilter onSearch={handleSearch} isLoading={isLoading || isLoadingMore} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
            >
              <div className="flex animate-pulse gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-200/80" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 rounded-full bg-slate-200/80" />
                  <div className="h-3 w-1/2 rounded-full bg-slate-200/80" />
                  <div className="h-3 w-full rounded-full bg-slate-200/80" />
                  <div className="h-3 w-5/6 rounded-full bg-slate-200/80" />
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
      <div className="rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-900">We couldn&apos;t load jobs</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{error}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => void loadJobs(searchTitle)}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
      <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Search and filter</p>
            <p className="text-xs text-slate-500">Explore fresh opportunities and refine your search instantly.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            <Sparkles className="h-4 w-4" />
            Modern jobs dashboard
          </div>
        </div>

        <div className="mt-5">
          <JobSearchFilter onSearch={handleSearch} isLoading={isLoading || isLoadingMore} />
        </div>
      </div>

      {jobs.length === 0 && !isLoading ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
            <Briefcase className="h-9 w-9" />
          </div>
          <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-900">No jobs found</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
            {searchTitle
              ? `No results for "${searchTitle}". Try a broader keyword like “developer”, “engineer”, or “remote”.`
              : "There are no jobs available right now. Please check back soon."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                <p className="mt-2 text-lg font-black text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {jobs.map((job, index) => (
              <JobCard key={`${job.link}-${index}`} job={job} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
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
            <p className="mt-8 text-center text-sm text-slate-500">
              You&apos;ve reached the end of the list
            </p>
          )}
        </>
      )}
    </div>
  );
}
