"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { 
  createEmptyJobSearchState, 
  type JobSearchFormState 
} from "@/components/jobs/job-search-filter";
import { getPostedAfterFromPreset } from "@/lib/jobs/jobs-utils";
import { getApiErrorMessage, isRequestCanceled } from "@/lib/auth/api-error";
import { jobsService } from "@/lib/jobs/jobs-service";
import type { Job, JobFilterParams } from "@/lib/jobs/types";

const toJobFilterParams = (filters: JobSearchFormState): JobFilterParams => ({
  title: filters.title.trim() || undefined,
  location: filters.location.trim() || undefined,
  postedAfter: getPostedAfterFromPreset(filters.datePreset),
  employmentType: filters.empType || undefined,
});

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
    return () => cancelInFlightRequest();
  }, [cancelInFlightRequest]);

  // Debounced search logic for instant feedback - only call when filters actually change
  useEffect(() => {
    // Check if filters have actually changed
    const currentFilterState = JSON.stringify(draftFilters);
    if (currentFilterState === lastFilterStateRef.current) {
      return;
    }

    // Don't search if it's the initial load
    const isInitial = Object.values(draftFilters).every(v => v === "" || v === "any");
    if (isInitial) {
      lastFilterStateRef.current = currentFilterState;
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      lastFilterStateRef.current = currentFilterState;
      setAppliedFilters(draftFilters);
    }, 300); // Reduced from 500ms for better responsiveness

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

  const handleSearch = (filters: JobSearchFormState) => {
    setAppliedFilters(filters);
  };

  const handleClearAll = useCallback(() => {
    const emptyState = createEmptyJobSearchState();
    setDraftFilters(emptyState);
    setAppliedFilters(emptyState);
    setJobs([]);
    setError(null);
    setNextCursor(null);
  }, []);

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
    },
    [appliedFilters],
  );

  const handleLoadMore = useCallback(() => {
    if (nextCursor !== null) {
      void loadJobs(toJobFilterParams(appliedFilters), nextCursor, true);
    }
  }, [appliedFilters, loadJobs, nextCursor]);

  const handleRetrySearch = useCallback(() => {
    void loadJobs(toJobFilterParams(appliedFilters));
  }, [appliedFilters, loadJobs]);

  const handleRefresh = useCallback(() => {
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
