import { createApiClient } from "@/lib/api/create-api-client";
import type { CursorPageResponse, Job, JobFilterParams, JobsSearchParams } from "./types";

interface RequestOptions {
  signal?: AbortSignal;
}

type QueryParamValue = string | number;

const JOBS_API_BASE_URL = 
  process.env.NEXT_PUBLIC_JOBS_API_URL || "/api/jobs";

export const jobsApiClient = createApiClient({
  baseURL: JOBS_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
