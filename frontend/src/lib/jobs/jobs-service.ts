import axios from "axios";
import { clearToken, getToken, isTokenExpired } from "@/lib/auth/token-storage";
import type { CursorPageResponse, Job, JobsSearchParams } from "./types";

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

    if (status === 401 || status === 403) {
      clearToken();
    }

    return Promise.reject(error);
  },
);

export const jobsService = {
  async getAllJobs(lastId?: number, size: number = 10): Promise<CursorPageResponse<Job>> {
    const params: Record<string, string | number> = { size };
    if (lastId !== undefined && lastId !== null) {
      params.lastId = lastId;
    }
    const { data } = await jobsApiClient.get<CursorPageResponse<Job>>("", { params });
    return data;
  },

  async searchJobs(params: JobsSearchParams): Promise<CursorPageResponse<Job>> {
    const { title, lastId, size = 10 } = params;
    
    if (!title || title.trim() === "") {
      return this.getAllJobs(lastId, size);
    }

    const queryParams: Record<string, string | number> = { title, size };
    if (lastId !== undefined && lastId !== null) {
      queryParams.lastId = lastId;
    }

    const { data } = await jobsApiClient.get<CursorPageResponse<Job>>("/search", {
      params: queryParams,
    });
    return data;
  },
};
