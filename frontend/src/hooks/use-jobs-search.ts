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

  // Debounced search logic for instant feedback
  useEffect(() => {
    // Don't search if it's the initial load or if filters haven't changed
    const isInitial = Object.values(draftFilters).every(v => v === "" || v === "any");
    if (isInitial) return;

    const timer = setTimeout(() => {
      // Trigger search automatically
      setAppliedFilters(draftFilters);
    }, 500); // 500ms wait

    return () => clearTimeout(timer);
  }, [draftFilters]);

  // Sync applied filters to actual search logic
  useEffect(() => {
    setJobs([]);
    setError(null);
    setNextCursor(null);
    void loadJobs(toJobFilterParams(appliedFilters));
  }, [appliedFilters, loadJobs]);

  const handleSearch = (e?: React.FormEvent) => {
    // Safely check if 'e' is a React event with preventDefault
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    setAppliedFilters(draftFilters);
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
