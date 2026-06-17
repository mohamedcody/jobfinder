import axios from "axios";
import { emitGlobalApiError, getGlobalApiErrorMessage } from "@/lib/api/global-api-error";
import { clearToken, getToken, isTokenExpired } from "@/lib/auth/token-storage";

export interface SavedJob {
  savedJobId: number;
  jobId: number;
  jobTitle: string;
  companyName: string | null;
  companyLogo: string | null;
  location: string | null;
  jobUrl: string | null;
  employmentType: string | null;
  savedAt: string;
  notes: string | null;
}

export interface SaveJobPayload {
  notes?: string;
}

const SAVED_JOBS_API_BASE_URL =
  process.env.NEXT_PUBLIC_SAVED_JOBS_API_URL || "/api/saved-jobs";

export const savedJobsApiClient = axios.create({
  baseURL: SAVED_JOBS_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

savedJobsApiClient.interceptors.request.use((config) => {
  const token = getToken();

  if (!token) {
    return config;
  }

  if (isTokenExpired(token)) {
    clearToken();
    return config;
  }

  config.headers = config.headers ?? {};
  (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  return config;
});

savedJobsApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isCanceledRequest = error?.code === "ERR_CANCELED";

    if (status === 401 || status === 403) {
      clearToken();
    }

    if (!isCanceledRequest && (!status || status >= 500 || status === 0)) {
      emitGlobalApiError({
        status,
        message: getGlobalApiErrorMessage(status),
      });
    }

    return Promise.reject(error);
  },
);

export const savedJobsService = {
  async getSavedJobs(options?: { signal?: AbortSignal }): Promise<SavedJob[]> {
    const { data } = await savedJobsApiClient.get<SavedJob[]>("", {
      signal: options?.signal,
    });
    return data;
  },

  async saveJob(jobId: number, payload?: SaveJobPayload): Promise<SavedJob> {
    const { data } = await savedJobsApiClient.post<SavedJob>(`/${jobId}`, payload ?? {});
    return data;
  },

  async unsaveJob(jobId: number): Promise<void> {
    await savedJobsApiClient.delete(`/${jobId}`);
  },

  async isJobSaved(jobId: number, options?: { signal?: AbortSignal }): Promise<boolean> {
    const { data } = await savedJobsApiClient.get<boolean>(`/${jobId}/status`, {
      signal: options?.signal,
    });
    return data;
  },

  async getSavedJobIds(jobIds: number[], options?: { signal?: AbortSignal }): Promise<number[]> {
    if (jobIds.length === 0) {
      return [];
    }

    const { data } = await savedJobsApiClient.post<number[]>("/status/batch", jobIds, {
      signal: options?.signal,
    });
    return data;
  },
};
