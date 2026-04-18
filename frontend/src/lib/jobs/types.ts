export interface Job {
  title: string;
  companyName: string;
  location: string;
  link: string;
  descriptionText: string;
  companyLogo: string | null;
  companyWebsite: string | null;
  companyDescription: string | null;
  seniorityLevel: string | null;
  employmentType: string | null;
  scrapedAt: string;
}

export interface CursorPageResponse<T> {
  data: T[];
  pageSize: number;
  nextCursor: number | null;
  hasNext: boolean;
}

export interface JobsSearchParams {
  title?: string;
  lastId?: number;
  size?: number;
}

/** Maps to the backend's /api/jobs/filter endpoint */
export interface JobFilterParams {
  title?: string;
  location?: string;
  /** ISO date string: "YYYY-MM-DD" */
  postedAfter?: string;
  employmentType?: string;
  lastId?: number;
  size?: number;
}

/** "posted within" presets shown in the UI */
export type DatePreset = "any" | "24h" | "week" | "month";
