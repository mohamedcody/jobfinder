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
