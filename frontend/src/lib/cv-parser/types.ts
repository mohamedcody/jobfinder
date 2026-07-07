/**
 * CV Parser Types — Frontend
 * TypeScript interfaces for the AI-powered CV parsing module.
 */

/** Skill extracted by AI */
export interface CvSkillEntry {
  name: string;
  proficiencyScore: number | null;
  yearsOfExperience: number | null;
}

/** Education entry extracted by AI */
export interface CvEducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number | null;
  endYear: number | null;
  grade: string | null;
}

/** Work experience entry extracted by AI */
export interface CvWorkExperienceEntry {
  companyName: string;
  jobTitle: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
}

/** Success response from POST /api/cv/upload */
export interface CvParseResponse {
  message: string;
  fullName: string | null;
  currentJobTitle: string | null;
  educationLevel: string | null;
  yearsOfExperience: number | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  extractedSkills: string[];
  educationCount: number;
  workExperienceCount: number;
  parsedAt: string;
}

/** Backend error shape */
export interface CvApiError {
  errorCode: string;
  message: string;
  timestamp?: string;
  path?: string;
}

/** Upload state machine */
export type CvUploadStatus = "idle" | "uploading" | "parsing" | "success" | "error";
