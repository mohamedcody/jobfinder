"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { isRequestCanceled } from "@/utils/api-error";
import { hasValidToken } from "@/utils/token-storage";
import { APP_CONSTANTS } from "@/constants";
import { savedJobsService, getSavedJobsErrorMessage } from "@/services/saved-jobs.service";
import type { SaveJobRequest, SavedJobResponse as SavedJob } from "@/types/saved-jobs.types";

/** Use centralized constant as the single source of truth for the localStorage key. */
const SAVED_JOBS_KEY = APP_CONSTANTS.SAVED_JOBS_STORAGE_KEY;
const SAVED_JOBS_EVENT = "jobfinder:saved-jobs-changed";
const EMPTY_JOB_IDS: number[] = [];

interface SavedJobsStore {
  [jobId: number]: boolean;
}

const readCachedSavedJobs = (): SavedJobsStore => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(SAVED_JOBS_KEY);
    return stored ? (JSON.parse(stored) as SavedJobsStore) : {};
  } catch {
    return {};
  }
};

const toSavedJobsStore = (jobIds: number[]): SavedJobsStore =>
  jobIds.reduce<SavedJobsStore>((acc, jobId) => {
    acc[jobId] = true;
    return acc;
  }, {});

const persistSavedJobs = (jobs: SavedJobsStore) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(jobs));
};

const emitSavedJobsChange = (jobs: SavedJobsStore) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SAVED_JOBS_EVENT, { detail: jobs }));
};

/**
 * Backend-first saved jobs hook with optimistic UI and localStorage fallback.
 * Pass visible job IDs from list pages to sync all cards in one batch request.
 */
export const useSavedJobs = (visibleJobIds: number[] = EMPTY_JOB_IDS) => {
  const [savedJobs, setSavedJobs] = useState<SavedJobsStore>(() => readCachedSavedJobs());
  const [savedJobDetails, setSavedJobDetails] = useState<SavedJob[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingJobIds, setPendingJobIds] = useState<Set<number>>(() => new Set());
  const requestIdRef = useRef(0);

  const visibleJobIdsKey = visibleJobIds.join(",");
  const normalizedVisibleIds = useMemo(
    () => Array.from(new Set(visibleJobIds.filter(Number.isFinite))).sort((a, b) => a - b),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleJobIdsKey],
  );

  const updateSavedJobs = useCallback((updater: (current: SavedJobsStore) => SavedJobsStore) => {
    setSavedJobs((current) => {
      const next = updater(current);
      persistSavedJobs(next);
      emitSavedJobsChange(next);
      return next;
    });
  }, []);

  const syncVisibleSavedStatus = useCallback(
    async (signal?: AbortSignal) => {
      if (normalizedVisibleIds.length === 0 || !hasValidToken()) return;

      const requestId = ++requestIdRef.current;
      setIsSyncing(true);

      try {
        const savedIds = await savedJobsService.getSavedJobIds(normalizedVisibleIds, { signal });
        if (requestId !== requestIdRef.current) return;

        updateSavedJobs((current) => {
          const next = { ...current };
          const savedSet = new Set(savedIds);

          for (const jobId of normalizedVisibleIds) {
            if (savedSet.has(jobId)) {
              next[jobId] = true;
            } else {
              delete next[jobId];
            }
          }

          return next;
        });
      } catch (error) {
        if (!isRequestCanceled(error)) {
          console.error("Failed to sync saved job status", error);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsSyncing(false);
        }
      }
    },
    [normalizedVisibleIds, updateSavedJobs],
  );

  const fetchSavedJobs = useCallback(async (signal?: AbortSignal) => {
    if (!hasValidToken()) return [];

    setIsSyncing(true);
    try {
      const saved = await savedJobsService.getMySavedJobs({ signal });
      setSavedJobDetails(saved);
      updateSavedJobs(() => toSavedJobsStore(saved.map((job) => job.jobId)));
      return saved;
    } catch (error) {
      if (!isRequestCanceled(error)) {
        toast.error(getSavedJobsErrorMessage(error));
      }
      return [];
    } finally {
      setIsSyncing(false);
    }
  }, [updateSavedJobs]);

  useEffect(() => {
    const handleSavedJobsChange = (e: Event) => {
      const customEvent = e as CustomEvent<SavedJobsStore>;
      if (customEvent.detail) {
        setSavedJobs(customEvent.detail);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SAVED_JOBS_KEY && e.newValue) {
        try {
          setSavedJobs(JSON.parse(e.newValue));
        } catch {
          // ignore invalid JSON
        }
      }
    };

    window.addEventListener(SAVED_JOBS_EVENT, handleSavedJobsChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(SAVED_JOBS_EVENT, handleSavedJobsChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void syncVisibleSavedStatus(controller.signal);
    return () => controller.abort();
  }, [syncVisibleSavedStatus]);

  const isSaved = useCallback((jobId: number): boolean => savedJobs[jobId] === true, [savedJobs]);

  const isPending = useCallback((jobId: number): boolean => pendingJobIds.has(jobId), [pendingJobIds]);

  const setPending = useCallback((jobId: number, pending: boolean) => {
    setPendingJobIds((current) => {
      const next = new Set(current);
      if (pending) next.add(jobId);
      else next.delete(jobId);
      return next;
    });
  }, []);

  const toggleSaveJob = useCallback(
    async (jobId: number, payload?: SaveJobRequest) => {
      if (!hasValidToken()) {
        toast.error("Please sign in to save jobs.");
        return;
      }

      if (isPending(jobId)) return;

      const wasSaved = savedJobs[jobId] === true;
      setPending(jobId, true);

      updateSavedJobs((current) => {
        const next = { ...current };
        if (wasSaved) delete next[jobId];
        else next[jobId] = true;
        return next;
      });

      try {
        if (wasSaved) {
          await savedJobsService.unsaveJob(jobId);
          setSavedJobDetails((current) => current.filter((job) => job.jobId !== jobId));
          toast.success("Removed from saved jobs");
        } else {
          const saved = await savedJobsService.saveJob(jobId, payload);
          setSavedJobDetails((current) => [saved, ...current.filter((job) => job.jobId !== jobId)]);
          toast.success("Saved job successfully");
        }
      } catch (error) {
        updateSavedJobs((current) => {
          const next = { ...current };
          if (wasSaved) next[jobId] = true;
          else delete next[jobId];
          return next;
        });
        toast.error(getSavedJobsErrorMessage(error));
      } finally {
        setPending(jobId, false);
      }
    },
    [isPending, savedJobs, setPending, updateSavedJobs],
  );

  const clearSavedJobs = useCallback(async () => {
    if (!hasValidToken()) {
      toast.error("Please sign in to manage saved jobs.");
      return;
    }

    const jobsToRemove = Object.keys(savedJobs).map(Number).filter(Number.isFinite);
    const previous = savedJobs;

    updateSavedJobs(() => ({}));
    setSavedJobDetails([]);

    try {
      await Promise.all(jobsToRemove.map((jobId) => savedJobsService.unsaveJob(jobId)));
      toast.success("All saved jobs cleared");
    } catch (error) {
      updateSavedJobs(() => previous);
      toast.error(getSavedJobsErrorMessage(error));
    }
  }, [savedJobs, updateSavedJobs]);

  return {
    savedJobs,
    savedJobDetails,
    isSyncing,
    isSaved,
    isPending,
    toggleSaveJob,
    clearSavedJobs,
    fetchSavedJobs,
    syncVisibleSavedStatus,
  };
};
