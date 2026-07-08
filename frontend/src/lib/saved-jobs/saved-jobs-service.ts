import { createApiClient } from "@/lib/api/create-api-client";
import type { SaveJobRequest, SavedJobResponse, SavedJobsErrorResponse } from "./types";

interface RequestOptions {
    signal?: AbortSignal;
}

const SAVED_JOBS_API_BASE_URL = process.env.NEXT_PUBLIC_SAVED_JOBS_API_URL || "/api/saved-jobs";

export class SavedJobsApiError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
        public readonly errorCode?: string,
        public readonly path?: string,
    ) {
        super(message);
        this.name = "SavedJobsApiError";
    }
}

export const savedJobsApiClient = createApiClient({
    baseURL: SAVED_JOBS_API_BASE_URL,
    timeout: Number(process.env.NEXT_PUBLIC_SAVED_JOBS_API_TIMEOUT_MS ?? 15000),
    headers: {
        "Content-Type": "application/json",
    },
});

// Add custom error mapping specific to saved jobs
savedJobsApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const responseData = error?.response?.data as SavedJobsErrorResponse | undefined;
        return Promise.reject(
            new SavedJobsApiError(
                responseData?.message ?? error?.message ?? "Saved jobs request failed.",
                status,
                responseData?.errorCode,
                responseData?.path,
            ),
        );
    },
);

export const getSavedJobsErrorMessage = (error: unknown): string => {
    if (!(error instanceof SavedJobsApiError)) {
        return "Unable to update saved jobs. Please try again.";
    }

    if (error.status === 401 || error.status === 403) {
        return "Please sign in to save jobs.";
    }

    switch (error.message) {
        case "Job already saved.":
            return "This job is already in your saved jobs.";
        case "Saved job not found.":
            return "This job is not currently saved.";
        case "Notes must not exceed 500 characters":
        case "notes: Notes must not exceed 500 characters":
            return "Saved-job notes must be 500 characters or fewer.";
        default:
            if (error.message.startsWith("Job not found:")) {
                return "We could not find that job. It may have been removed.";
            }
            if (error.message.startsWith("You can save up to")) {
                return error.message;
            }
            return error.message || "Unable to update saved jobs. Please try again.";
    }
};

export const savedJobsService = {
    async saveJob(jobId: number, request?: SaveJobRequest, options?: RequestOptions): Promise<SavedJobResponse> {
        const { data } = await savedJobsApiClient.post<SavedJobResponse>(`/${jobId}`, request ?? null, {
            signal: options?.signal,
        });
        return data;
    },

    async unsaveJob(jobId: number, options?: RequestOptions): Promise<void> {
        await savedJobsApiClient.delete<void>(`/${jobId}`, {
            signal: options?.signal,
        });
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

    async getSavedJobIds(jobIds: number[], options?: RequestOptions): Promise<number[]> {
        const { data } = await savedJobsApiClient.post<number[]>("/status/batch", jobIds, {
            signal: options?.signal,
        });
        return data;
    },
};