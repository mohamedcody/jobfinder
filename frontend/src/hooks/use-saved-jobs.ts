"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

const SAVED_JOBS_KEY = "jobfinder.saved-jobs";

interface SavedJobsStore {
  [jobId: number]: boolean;
}

/**
 * Hook for managing saved jobs locally and with backend
 * Provides save/unsave functionality with optimistic updates
 */
export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJobsStore>(() => {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem(SAVED_JOBS_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // Persist to localStorage
  const persistSavedJobs = useCallback((jobs: SavedJobsStore) => {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(jobs));
  }, []);

  const isSaved = useCallback((jobId: number): boolean => {
    return savedJobs[jobId] === true;
  }, [savedJobs]);

  const toggleSaveJob = useCallback(
    async (jobId: number, onServerToggle?: () => Promise<void>) => {
      const wasStored = savedJobs[jobId];
      
      // Optimistic update
      const newState = { ...savedJobs, [jobId]: !wasStored };
      setSavedJobs(newState);
      persistSavedJobs(newState);

      // Attempt server sync
      try {
        if (onServerToggle) {
          await onServerToggle();
        }
        const action = !wasStored ? "added to" : "removed from";
        toast.success(`Job ${action} saved jobs`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Revert optimistic update on error
        setSavedJobs(savedJobs);
        persistSavedJobs(savedJobs);
        toast.error("Failed to save job. Please try again.");
      }
    },
    [savedJobs, persistSavedJobs]
  );

  const clearSavedJobs = useCallback(() => {
    setSavedJobs({});
    localStorage.removeItem(SAVED_JOBS_KEY);
    toast.success("All saved jobs cleared");
  }, []);

  return {
    savedJobs,
    isSaved,
    toggleSaveJob,
    clearSavedJobs,
  };
};

