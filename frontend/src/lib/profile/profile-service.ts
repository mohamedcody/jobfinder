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

export interface SkillDto {
  id: number;
  name: string;
}

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
  skills?: SkillDto[];
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
  skills?: string[];
}

interface ApiUserProfileResponse {
  id: number;
  user_id: number;
  username: string;
  email: string;
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
  skills?: SkillDto[];
  updated_at?: string;
}

interface ApiUpdateProfileRequest {
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
}

const mapProfileFromApi = (data: ApiUserProfileResponse): UserProfileResponse => ({
  id: data.id,
  userId: data.user_id,
  username: data.username,
  email: data.email,
  currentJobTitle: data.current_job_title,
  yearsOfExperience: data.years_of_experience,
  educationLevel: data.education_level,
  country: data.country,
  city: data.city,
  resumeUrl: data.resume_url,
  expectedSalary: data.expected_salary,
  currency: data.currency,
  isOpenToWork: data.is_open_to_work,
  bio: data.bio,
  skills: data.skills,
  updatedAt: data.updated_at,
});

/**
 * Remove duplicate skills while preserving order
 * إزالة المهارات المكررة مع الحفاظ على الترتيب
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

const mapProfileToApi = (
  data?: UpdateProfileRequest,
): ApiUpdateProfileRequest => ({
  current_job_title: data?.currentJobTitle,
  years_of_experience: data?.yearsOfExperience,
  education_level: data?.educationLevel,
  country: data?.country,
  city: data?.city,
  resume_url: data?.resumeUrl,
  expected_salary: data?.expectedSalary,
  currency: data?.currency,
  is_open_to_work: data?.isOpenToWork,
  bio: data?.bio,
  skills: deduplicateSkills(data?.skills),
});

export const profileService = {
  // جيب البروفايل الخاص بي
  async getMyProfile(): Promise<UserProfileResponse> {
    const { data } = await profileApiClient.get<ApiUserProfileResponse>("");
    return mapProfileFromApi(data);
  },

  // حدث البروفايل بتاعك
  async updateMyProfile(
    request: UpdateProfileRequest,
  ): Promise<UserProfileResponse> {
    const payload = mapProfileToApi(request);
    const { data } = await profileApiClient.put<ApiUserProfileResponse>("", payload);
    return mapProfileFromApi(data);
  },

  // جيب بروفايل مستخدم معين (للإدمن)
  async getUserProfile(userId: number): Promise<UserProfileResponse> {
    const { data } = await profileApiClient.get<ApiUserProfileResponse>(`/${userId}`);
    return mapProfileFromApi(data);
  },
};


