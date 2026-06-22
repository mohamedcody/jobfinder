import axios from "axios";
import { getToken, isTokenExpired, clearToken } from "@/lib/auth/token-storage";
import type { UserProfileResponse, UpdateProfileRequest } from "./types";
export type { UserProfileResponse, UpdateProfileRequest } from "./types";

const PROFILE_API_BASE_URL = 
  process.env.NEXT_PUBLIC_PROFILE_API_URL || "http://localhost:8080/api/users/profile";

export const profileApiClient = axios.create({
  baseURL: PROFILE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Add JWT Token
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

// Response Interceptor - Handle errors
profileApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      clearToken();
    }

    return Promise.reject(error);
  },
);

/**
 * Remove duplicate skills while preserving order
 */
const deduplicateSkills = (skills?: string[]): string[] => {
  if (!skills || !Array.isArray(skills)) return [];
  
  const seen = new Set<string>();
  return skills
    .map(skill => String(skill).trim().toLowerCase())
    .filter(skill => {
      if (skill.length === 0) return false;
      if (seen.has(skill)) return false;
      seen.add(skill);
      return true;
    });
};

export const profileService = {
  // جيب البروفايل الخاص بي
  async getMyProfile(): Promise<UserProfileResponse> {
    const { data } = await profileApiClient.get<UserProfileResponse>("");
    return data;
  },

  // حدث البروفايل بتاعك
  async updateMyProfile(
    request: UpdateProfileRequest,
  ): Promise<UserProfileResponse> {
    // Clean up skills before sending
    const payload = {
      ...request,
      skills: deduplicateSkills(request.skills),
    };
    const { data } = await profileApiClient.put<UserProfileResponse>("", payload);
    return data;
  },

  // جيب بروفايل مستخدم معين (للإدمن)
  async getUserProfile(userId: number): Promise<UserProfileResponse> {
    const { data } = await profileApiClient.get<UserProfileResponse>(`/${userId}`);
    return data;
  },
};


