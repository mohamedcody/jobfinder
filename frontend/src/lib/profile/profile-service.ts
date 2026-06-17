import axios from "axios";
import { emitGlobalApiError, getGlobalApiErrorMessage } from "@/lib/api/global-api-error";
import { getToken, isTokenExpired, clearToken } from "@/lib/auth/token-storage";
import type { UserProfileResponse, UpdateProfileRequest } from "./types";

export type { UserProfileResponse, UpdateProfileRequest } from "./types";

const PROFILE_API_BASE_URL =
  process.env.NEXT_PUBLIC_PROFILE_API_URL || "/api/users/profile";

type BackendSkill = { id: number; name: string };

type BackendUserProfileResponse = {
  id: number;
  user_id?: number;
  userId?: number;
  username: string;
  email: string;
  current_job_title?: string | null;
  currentJobTitle?: string | null;
  years_of_experience?: number | null;
  yearsOfExperience?: number | null;
  education_level?: string | null;
  educationLevel?: string | null;
  country?: string | null;
  city?: string | null;
  resume_url?: string | null;
  resumeUrl?: string | null;
  expected_salary?: number | null;
  expectedSalary?: number | null;
  currency?: string | null;
  is_open_to_work?: boolean | null;
  isOpenToWork?: boolean | null;
  bio?: string | null;
  skills?: BackendSkill[] | null;
  updated_at?: string;
  updatedAt?: string;
};

type BackendUpdateProfileRequest = {
  current_job_title?: string;
  years_of_experience?: number;
  education_level?: string;
  country?: string;
  city?: string;
  resume_url?: string;
  expected_salary?: number;
  currency?: string;
  is_open_to_work?: boolean;
  bio?: string;
  skills?: string[];
};

export const profileApiClient = axios.create({
  baseURL: PROFILE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

profileApiClient.interceptors.request.use((config) => {
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

profileApiClient.interceptors.response.use(
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

const normalizeProfile = (profile: BackendUserProfileResponse): UserProfileResponse => ({
  id: profile.id,
  userId: profile.userId ?? profile.user_id ?? profile.id,
  username: profile.username,
  email: profile.email,
  currentJobTitle: profile.currentJobTitle ?? profile.current_job_title ?? null,
  yearsOfExperience: profile.yearsOfExperience ?? profile.years_of_experience ?? null,
  educationLevel: profile.educationLevel ?? profile.education_level ?? null,
  country: profile.country ?? null,
  city: profile.city ?? null,
  resumeUrl: profile.resumeUrl ?? profile.resume_url ?? null,
  expectedSalary: profile.expectedSalary ?? profile.expected_salary ?? null,
  currency: profile.currency ?? null,
  isOpenToWork: profile.isOpenToWork ?? profile.is_open_to_work ?? null,
  bio: profile.bio ?? null,
  skills: profile.skills ?? [],
  updatedAt: profile.updatedAt ?? profile.updated_at,
});

const deduplicateSkills = (skills?: string[]): string[] => {
  if (!Array.isArray(skills)) return [];

  const seen = new Set<string>();
  return skills
    .map((skill) => String(skill).trim())
    .filter((skill) => {
      const key = skill.toLowerCase();
      if (key.length === 0 || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const toBackendUpdatePayload = (request: UpdateProfileRequest): BackendUpdateProfileRequest => ({
  current_job_title: request.currentJobTitle,
  years_of_experience: request.yearsOfExperience,
  education_level: request.educationLevel,
  country: request.country,
  city: request.city,
  resume_url: request.resumeUrl,
  expected_salary: request.expectedSalary,
  currency: request.currency,
  is_open_to_work: request.isOpenToWork,
  bio: request.bio,
  skills: deduplicateSkills(request.skills),
});

export const profileService = {
  async getMyProfile(): Promise<UserProfileResponse> {
    const { data } = await profileApiClient.get<BackendUserProfileResponse>("");
    return normalizeProfile(data);
  },

  async updateMyProfile(request: UpdateProfileRequest): Promise<UserProfileResponse> {
    const { data } = await profileApiClient.put<BackendUserProfileResponse>(
      "",
      toBackendUpdatePayload(request),
    );
    return normalizeProfile(data);
  },

  async getUserProfile(userId: number): Promise<UserProfileResponse> {
    const { data } = await profileApiClient.get<BackendUserProfileResponse>(`/${userId}`);
    return normalizeProfile(data);
  },
};
