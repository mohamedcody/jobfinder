"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { 
  createEmptyJobSearchState, 
  type JobSearchFormState 
} from "@/features/jobs/components/job-search-filter";
import { getPostedAfterFromPreset } from "@/utils/jobs-utils";
import { getApiErrorMessage, isRequestCanceled } from "@/utils/api-error";
import { jobsService } from "@/services/jobs.service";
import type { Job, JobFilterParams } from "@/types/jobs.types";
import { APP_CONSTANTS } from "@/constants";

const toJobFilterParams = (filters: JobSearchFormState): JobFilterParams => ({
  title: filters.title.trim() || undefined,
  location: filters.location.trim() || undefined,
  postedAfter: getPostedAfterFromPreset(filters.datePreset),
  employmentType: filters.empType || undefined,
});

const CACHE_TTL_MS = 1000 * 60 * 5; // 5 mins
const jobsCache = new Map<string, { jobs: Job[], hasNext: boolean, nextCursor: number | null, timestamp: number }>();

export const useJobsSearch = () => {
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
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);
  const lastFilterStateRef = useRef<string>("");

  const cancelInFlightRequest = useCallback(() => {
    activeControllerRef.current?.abort();
    activeControllerRef.current = null;
    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  const loadJobs = useCallback(
    async (currentFilters: JobFilterParams, cursor: number | null = null, append = false) => {
      cancelInFlightRequest();

      const cacheKey = JSON.stringify({ currentFilters, cursor });
      const isRefresh = (currentFilters as any).refresh;

      if (!append && !isRefresh) {
        const cached = jobsCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          setJobs(cached.jobs);
          setHasMore(cached.hasNext);
          setNextCursor(cached.nextCursor);
          setIsLoading(false);
          setIsLoadingMore(false);
          setError(null);
          return;
        }
      }

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

        if (!append && !(currentFilters as any).refresh) {
          jobsCache.set(cacheKey, {
            jobs: response.data,
            hasNext: response.hasNext,
            nextCursor: response.nextCursor,
            timestamp: Date.now()
          });
        }

        setJobs((prev) => {
          if (!append) return response.data;
          const seen = new Set(prev.map((j) => j.id || j.link));
          const uniqueNewJobs = response.data.filter((j) => !seen.has(j.id || j.link));
          return [...prev, ...uniqueNewJobs];
        });
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
    return () => cancelInFlightRequest();
  }, [cancelInFlightRequest]);

  // Debounced search logic for instant typing feedback
  useEffect(() => {
    const currentFilterState = JSON.stringify(draftFilters);

    // Skip initial mount since appliedFilters is already set to initial state
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      lastFilterStateRef.current = currentFilterState;
      return;
    }

    if (currentFilterState === lastFilterStateRef.current) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      lastFilterStateRef.current = currentFilterState;
      setAppliedFilters(draftFilters);
    }, APP_CONSTANTS.DEBOUNCE_DELAY_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [draftFilters]);

  // Sync applied filters to actual search logic
  useEffect(() => {
    setJobs([]);
    setError(null);
    setNextCursor(null);
    void loadJobs(toJobFilterParams(appliedFilters));
  }, [appliedFilters, loadJobs]);

  const handleSearch = useCallback((filters: JobSearchFormState) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const stateStr = JSON.stringify(filters);
    lastFilterStateRef.current = stateStr;
    setDraftFilters(filters);
    setAppliedFilters(filters);
  }, []);

  const handleClearAll = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const emptyState = createEmptyJobSearchState();
    lastFilterStateRef.current = JSON.stringify(emptyState);
    setDraftFilters(emptyState);
    setAppliedFilters(emptyState);
    setJobs([]);
    setError(null);
    setNextCursor(null);
  }, []);

  const handleRemoveFilter = useCallback(
    (key: keyof JobSearchFormState) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      const nextState: JobSearchFormState = {
        ...appliedFilters,
        [key]: key === "datePreset" ? "any" : "",
      };
      lastFilterStateRef.current = JSON.stringify(nextState);
      setDraftFilters(nextState);
      setAppliedFilters(nextState);
      setJobs([]);
      setError(null);
      setNextCursor(null);
    },
    [appliedFilters],
  );

  const handleLoadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore && nextCursor !== null) {
      void loadJobs(toJobFilterParams(appliedFilters), nextCursor, true);
    }
  }, [appliedFilters, hasMore, isLoading, isLoadingMore, loadJobs, nextCursor]);

  const handleRetrySearch = useCallback(() => {
    void loadJobs(toJobFilterParams(appliedFilters));
  }, [appliedFilters, loadJobs]);

  const handleRefresh = useCallback(() => {
    jobsCache.clear();
    setJobs([]);
    void loadJobs({ ...toJobFilterParams(appliedFilters), refresh: true });
    toast.success("System Refreshed");
  }, [appliedFilters, loadJobs]);

  const stats = useMemo(
    () => [
      { label: "Matches", value: jobs.length.toString() },
      { label: "Location", value: appliedFilters.location.trim() || "Anywhere" },
      { label: "Status", value: hasMore ? "More available" : "End reached" },
    ],
    [appliedFilters.location, hasMore, jobs.length],
  );

  return {
    jobs,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    draftFilters,
    appliedFilters,
    stats,
    setDraftFilters,
    handleSearch,
    handleClearAll,
    handleRemoveFilter,
    handleLoadMore,
    handleRetrySearch,
    handleRefresh,
  };
};
