"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { clearToken, getToken, isTokenExpired } from "@/lib/auth/token-storage";
import { savedJobsService } from "@/lib/saved-jobs/saved-jobs-service";

const SAVED_JOBS_KEY = "jobfinder.saved-jobs";

interface SavedJobsStore {
  [jobId: number]: boolean;
}

const readSavedJobsFromStorage = (): SavedJobsStore => {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(SAVED_JOBS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const hasUsableToken = () => {
  const token = getToken();

  if (!token) {
    return false;
  }

  if (isTokenExpired(token)) {
    clearToken();
    return false;
  }

  return true;
};

/**
 * Hook for managing saved jobs locally and with the Spring Boot backend.
 * Provides save/unsave functionality with optimistic updates.
 */
export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJobsStore>(readSavedJobsFromStorage);

  // Persist to localStorage
  const persistSavedJobs = useCallback((jobs: SavedJobsStore) => {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(jobs));
  }, []);

  useEffect(() => {
    if (!hasUsableToken()) {
      return;
    }

    let isMounted = true;

    savedJobsService
      .getMySavedJobs()
      .then((serverSavedJobs) => {
        if (!isMounted) return;

        const nextSavedJobs = serverSavedJobs.reduce<SavedJobsStore>((acc, savedJob) => {
          acc[savedJob.jobId] = true;
          return acc;
        }, {});

        setSavedJobs(nextSavedJobs);
        persistSavedJobs(nextSavedJobs);
      })
      .catch((error) => {
        console.warn("Failed to sync saved jobs from the backend.", error);
      });

    return () => {
      isMounted = false;
    };
  }, [persistSavedJobs]);

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

      // Attempt server sync when the user is authenticated.
      try {
        if (onServerToggle) {
          await onServerToggle();
        } else if (hasUsableToken()) {
          if (wasStored) {
            await savedJobsService.unsaveJob(jobId);
          } else {
            await savedJobsService.saveJob(jobId);
          }
        }

        const action = !wasStored ? "added to" : "removed from";
        toast.success(`Job ${action} saved jobs`);
      } catch (error) {
        // Revert optimistic update on error
        console.error("Failed to sync saved job with backend.", error);
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
