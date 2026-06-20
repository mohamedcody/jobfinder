export interface SaveJobRequest {
  /** Optional note. Backend validation requires notes to be 500 characters or fewer. */
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
  /** LocalDateTime serialized by Spring Boot as an ISO-like string. */
  savedAt: string;
  notes: string | null;
}

export interface SavedJobsErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
}

export type SaveJobStatus = "idle" | "loading" | "success" | "error";
