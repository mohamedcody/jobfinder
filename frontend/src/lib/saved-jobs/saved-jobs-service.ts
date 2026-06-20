import axios from "axios";
import { emitGlobalApiError, getGlobalApiErrorMessage } from "@/lib/api/global-api-error";
import { clearToken, getToken, isTokenExpired } from "@/lib/auth/token-storage";

const DEFAULT_SAVED_JOBS_API_BASE_URL = "/api/saved-jobs";
const configuredBaseUrl = process.env.NEXT_PUBLIC_SAVED_JOBS_API_URL;

if (!configuredBaseUrl && typeof console !== "undefined") {
  console.warn(
    `NEXT_PUBLIC_SAVED_JOBS_API_URL is not set. Falling back to ${DEFAULT_SAVED_JOBS_API_BASE_URL}. Add NEXT_PUBLIC_SAVED_JOBS_API_URL=/api/saved-jobs to frontend/.env.local.`,
  );
}

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, "");

const SAVED_JOBS_API_BASE_URL = normalizeBaseUrl(
  configuredBaseUrl || DEFAULT_SAVED_JOBS_API_BASE_URL,
);

const timeout = Number(process.env.NEXT_PUBLIC_SAVED_JOBS_API_TIMEOUT_MS);

export interface SaveJobRequest {
  notes?: string | null;
}

export interface SavedJobResponse {
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

export type SavedJobStatusBatchRequest = number[];
export type SavedJobStatusBatchResponse = number[];

export class SavedJobsApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "SavedJobsApiError";
  }
}

export const savedJobsApiClient = axios.create({
  baseURL: SAVED_JOBS_API_BASE_URL,
  timeout: Number.isFinite(timeout) && timeout > 0 ? timeout : 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
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

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Saved jobs API request failed.";

    return Promise.reject(new SavedJobsApiError(message, status, error));
  },
);

interface RequestOptions {
  signal?: AbortSignal;
}

export const savedJobsService = {
  async saveJob(
    jobId: number,
    payload: SaveJobRequest = {},
    options?: RequestOptions,
  ): Promise<SavedJobResponse> {
    const { data } = await savedJobsApiClient.post<SavedJobResponse>(
      `/${jobId}`,
      payload,
      { signal: options?.signal },
    );
    return data;
  },

  async unsaveJob(jobId: number, options?: RequestOptions): Promise<void> {
    await savedJobsApiClient.delete(`/${jobId}`, { signal: options?.signal });
  },

  async getMySavedJobs(options?: RequestOptions): Promise<SavedJobResponse[]> {
    const { data } = await savedJobsApiClient.get<SavedJobResponse[]>("", {
      signal: options?.signal,
    });
    return data;
  },

  async isJobSaved(jobId: number, options?: RequestOptions): Promise<boolean> {
    const { data } = await savedJobsApiClient.get<boolean>(`/${jobId}/status`, {
      signal: options?.signal,
    });
    return data;
  },

  async getSavedJobIds(
    jobIds: SavedJobStatusBatchRequest,
    options?: RequestOptions,
  ): Promise<SavedJobStatusBatchResponse> {
    const { data } = await savedJobsApiClient.post<SavedJobStatusBatchResponse>(
      "/status/batch",
      jobIds,
      { signal: options?.signal },
    );
    return data;
  },
};
