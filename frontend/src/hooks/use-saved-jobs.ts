"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getSavedJobsErrorMessage, savedJobsService } from "@/lib/saved-jobs/saved-jobs-service";
import type { SaveJobRequest, SaveJobStatus, SavedJobResponse } from "@/lib/saved-jobs/types";

const SAVED_JOBS_KEY = "jobfinder.saved-jobs";

type SavedJobsStore = Record<number, boolean>;
type LoadingStore = Record<number, boolean>;

const readLocalSavedJobs = (): SavedJobsStore => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(SAVED_JOBS_KEY);
    return stored ? (JSON.parse(stored) as SavedJobsStore) : {};
  } catch {
    return {};
  }
};

export const useSavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJobsStore>(() => readLocalSavedJobs());
  const [savedJobDetails, setSavedJobDetails] = useState<SavedJobResponse[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<LoadingStore>({});
  const [status, setStatus] = useState<SaveJobStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const persistSavedJobs = useCallback((jobs: SavedJobsStore) => {
    window.localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(jobs));
  }, []);

  const applySavedJobs = useCallback((jobs: SavedJobsStore) => {
    setSavedJobs(jobs);
    if (typeof window !== "undefined") {
      persistSavedJobs(jobs);
    }
  }, [persistSavedJobs]);

  const isSaved = useCallback((jobId: number): boolean => savedJobs[jobId] === true, [savedJobs]);
  const isJobLoading = useCallback((jobId: number): boolean => loadingJobs[jobId] === true, [loadingJobs]);

  const setJobLoading = useCallback((jobId: number, isLoading: boolean) => {
    setLoadingJobs((current) => ({ ...current, [jobId]: isLoading }));
  }, []);

  const refreshSavedJobs = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await savedJobsService.getMySavedJobs();
      const nextSavedJobs = response.reduce<SavedJobsStore>((acc, savedJob) => {
        acc[savedJob.jobId] = true;
        return acc;
      }, {});

      setSavedJobDetails(response);
      applySavedJobs(nextSavedJobs);
      setStatus("success");
      return response;
    } catch (caughtError) {
      const message = getSavedJobsErrorMessage(caughtError);
      setError(message);
      setStatus("error");
      toast.error(message);
      throw caughtError;
    }
  }, [applySavedJobs]);

  useEffect(() => {
    void refreshSavedJobs().catch(() => undefined);
  }, [refreshSavedJobs]);

  const saveJob = useCallback(async (jobId: number, request?: SaveJobRequest) => {
    const previousSavedJobs = savedJobs;
    const nextSavedJobs = { ...savedJobs, [jobId]: true };

    applySavedJobs(nextSavedJobs);
    setJobLoading(jobId, true);
    setStatus("loading");
    setError(null);

    try {
      const savedJob = await savedJobsService.saveJob(jobId, request);
      setSavedJobDetails((current) => [savedJob, ...current.filter((item) => item.jobId !== jobId)]);
      setStatus("success");
      toast.success("Job added to saved jobs.");
      return savedJob;
    } catch (caughtError) {
      applySavedJobs(previousSavedJobs);
      const message = getSavedJobsErrorMessage(caughtError);
      setError(message);
      setStatus("error");
      toast.error(message);
      throw caughtError;
    } finally {
      setJobLoading(jobId, false);
    }
  }, [applySavedJobs, savedJobs, setJobLoading]);

  const unsaveJob = useCallback(async (jobId: number) => {
    const previousSavedJobs = savedJobs;
    const nextSavedJobs = { ...savedJobs, [jobId]: false };

    applySavedJobs(nextSavedJobs);
    setJobLoading(jobId, true);
    setStatus("loading");
    setError(null);

    try {
      await savedJobsService.unsaveJob(jobId);
      setSavedJobDetails((current) => current.filter((item) => item.jobId !== jobId));
      setStatus("success");
      toast.success("Job removed from saved jobs.");
    } catch (caughtError) {
      applySavedJobs(previousSavedJobs);
      const message = getSavedJobsErrorMessage(caughtError);
      setError(message);
      setStatus("error");
      toast.error(message);
      throw caughtError;
    } finally {
      setJobLoading(jobId, false);
    }
  }, [applySavedJobs, savedJobs, setJobLoading]);

  const toggleSaveJob = useCallback(async (jobId: number, request?: SaveJobRequest) => {
    if (isSaved(jobId)) {
      await unsaveJob(jobId);
      return;
    }

    await saveJob(jobId, request);
  }, [isSaved, saveJob, unsaveJob]);

  const clearSavedJobs = useCallback(() => {
    applySavedJobs({});
    setSavedJobDetails([]);
    setStatus("idle");
    setError(null);
  }, [applySavedJobs]);

  return useMemo(() => ({
    savedJobs,
    savedJobDetails,
    status,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    error,
    isSaved,
    isJobLoading,
    saveJob,
    unsaveJob,
    toggleSaveJob,
    refreshSavedJobs,
    clearSavedJobs,
  }), [clearSavedJobs, error, isJobLoading, isSaved, refreshSavedJobs, saveJob, savedJobDetails, savedJobs, status, toggleSaveJob, unsaveJob]);
};
