import axios from "axios";
import { getToken, isTokenExpired, clearToken } from "@/lib/auth/token-storage";

const PROFILE_API_BASE_URL = 
  process.env.NEXT_PUBLIC_PROFILE_API_URL || "/api/users/profile";

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

export interface UserProfileResponse {
  id: number;
  userId: number;
  username: string;
  email: string;
  currentJobTitle?: string;
  yearsOfExperience?: number;
  educationLevel?: string;
  country?: string;
  city?: string;
  resumeUrl?: string;
  expectedSalary?: number;
  currency?: string;
  isOpenToWork?: boolean;
  bio?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  currentJobTitle?: string;
  yearsOfExperience?: number;
  educationLevel?: string;
  country?: string;
  city?: string;
  resumeUrl?: string;
  expectedSalary?: number;
  currency?: string;
  isOpenToWork?: boolean;
  bio?: string;
}

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
    const { data } = await profileApiClient.put<UserProfileResponse>("", request);
    return data;
  },

  // جيب بروفايل مستخدم معين (للإدمن)
  async getUserProfile(userId: number): Promise<UserProfileResponse> {
    const { data } = await profileApiClient.get<UserProfileResponse>(`/${userId}`);
    return data;
  },
};

