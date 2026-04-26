import axios from "axios";
import { emitGlobalApiError, getGlobalApiErrorMessage } from "@/lib/api/global-api-error";
import { clearToken, getToken, isTokenExpired } from "@/lib/auth/token-storage";
import type { CursorPageResponse, Job, JobFilterParams, JobsSearchParams } from "./types";

interface RequestOptions {
  signal?: AbortSignal;
}

type QueryParamValue = string | number;

const JOBS_API_BASE_URL = 
  process.env.NEXT_PUBLIC_JOBS_API_URL || "/api/jobs";

export const jobsApiClient = axios.create({
  baseURL: JOBS_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

jobsApiClient.interceptors.request.use((config) => {
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

jobsApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isCanceledRequest = error?.code === "ERR_CANCELED";

    if (status === 401 || status === 403) {
      clearToken();
    }

    if (!isCanceledRequest && (!status || status >= 500)) {
      emitGlobalApiError({
        status,
        message: getGlobalApiErrorMessage(status),
      });
    }

    return Promise.reject(error);
  },
);

export const jobsService = {
  async getAllJobs(lastId?: number, size: number = 10, options?: RequestOptions): Promise<CursorPageResponse<Job>> {
    const params: Record<string, string | number> = { size };
    if (lastId !== undefined && lastId !== null) {
      params.lastId = lastId;
    }
    const { data } = await jobsApiClient.get<CursorPageResponse<Job>>("", {
      params,
      signal: options?.signal,
    });
    return data;
  },

  async searchJobs(params: JobsSearchParams, options?: RequestOptions): Promise<CursorPageResponse<Job>> {
    const { title, lastId, size = 10 } = params;
    
    if (!title || title.trim() === "") {
      return this.getAllJobs(lastId, size, options);
    }

    const queryParams: Record<string, string | number> = { title, size };
    if (lastId !== undefined && lastId !== null) {
      queryParams.lastId = lastId;
    }

    const { data } = await jobsApiClient.get<CursorPageResponse<Job>>("/search", {
      params: queryParams,
      signal: options?.signal,
    });
    return data;
  },

  /** New Advanced Filter Method */
  async filterJobs(params: JobFilterParams, options?: RequestOptions): Promise<CursorPageResponse<Job>> {
    const { title, location, postedAfter, employmentType, lastId, size = 10 } = params;
    
    const queryParams: Record<string, QueryParamValue> = { size };
    if (title) queryParams.title = title;
    if (location) queryParams.location = location;
    if (postedAfter) queryParams.postedAfter = postedAfter;
    if (employmentType) queryParams.employmentType = employmentType;
    if (lastId !== undefined && lastId !== null) queryParams.lastId = lastId;
    if (params.refresh) queryParams.refresh = "true";

    const { data } = await jobsApiClient.get<CursorPageResponse<Job>>("/filter", {
      params: queryParams,
      signal: options?.signal,
    });
    return data;
  },

  async summarizeJob(id: number, options?: RequestOptions): Promise<string> {
    const { data } = await jobsApiClient.post<{ summary: string }>(`/${id}/summarize`, {}, {
      signal: options?.signal,
    });
    return data.summary;
  },
};
