import { createApiClient } from "@/lib/api/create-api-client";
import type { UserProfileResponse, UpdateProfileRequest } from "./types";
export type { UserProfileResponse, UpdateProfileRequest } from "./types";

const PROFILE_API_BASE_URL = 
  process.env.NEXT_PUBLIC_PROFILE_API_URL || "/api/users/profile";

export const profileApiClient = createApiClient({
  baseURL: PROFILE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// --- Network Boundary Mappers ---
const mapToCamelCase = (data: any): UserProfileResponse => {
  if (!data) return data;
  return {
    ...data,
    userId: data.user_id,
    currentJobTitle: data.current_job_title,
    yearsOfExperience: data.years_of_experience,
    educationLevel: data.education_level,
    resumeUrl: data.resume_url,
    expectedSalary: data.expected_salary,
    isOpenToWork: data.is_open_to_work,
    updatedAt: data.updated_at,
  };
};

const mapToSnakeCase = (data: Partial<UpdateProfileRequest>): any => {
  if (!data) return data;
  return {
    ...data,
    current_job_title: data.currentJobTitle,
    years_of_experience: data.yearsOfExperience,
    education_level: data.educationLevel,
    resume_url: data.resumeUrl,
    expected_salary: data.expectedSalary,
    is_open_to_work: data.isOpenToWork,
  };
};

export const profileService = {
  // جيب البروفايل الخاص بي
  async getMyProfile(): Promise<UserProfileResponse> {
    const { data } = await profileApiClient.get<any>("");
    return mapToCamelCase(data);
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
    
    const snakeCasePayload = mapToSnakeCase(payload);
    const { data } = await profileApiClient.put<any>("", snakeCasePayload);
    return mapToCamelCase(data);
  },

  async getUserProfile(userId: number): Promise<UserProfileResponse> {
    const { data } = await profileApiClient.get<any>(`/${userId}`);
    return mapToCamelCase(data);
  },
};
