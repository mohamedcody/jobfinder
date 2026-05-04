/**
 * User Profile Types - Frontend
 * تعريفات TypeScript لبيانات البروفايل
 */

/**
 * Response من Backend عند جلب البروفايل
 */
export interface UserProfileResponse {
  id: number;
  user_id: number;
  username: string;
  email: string;
  current_job_title?: string | null;
  years_of_experience?: number | null;
  education_level?: string | null;
  country?: string | null;
  city?: string | null;
  resume_url?: string | null;
  expected_salary?: number | null;
  currency?: string | null;
  is_open_to_work?: boolean | null;
  bio?: string | null;
  updated_at?: string;
}

/**
 * Request لتحديث البروفايل
 * جميع الحقول اختيارية (Partial Update)
 */
export interface UpdateUserProfileRequest {
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
}

/**
 * حالة التحميل والأخطاء
 */
export interface ProfileState {
  data: UserProfileResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * معايير التحقق من صحة البيانات
 */
export const PROFILE_VALIDATION_RULES = {
  currentJobTitle: {
    maxLength: 150,
  },
  yearsOfExperience: {
    min: 0,
    max: 70,
  },
  educationLevel: {
    maxLength: 100,
  },
  country: {
    maxLength: 100,
  },
  city: {
    maxLength: 100,
  },
  bio: {
    maxLength: 1000,
  },
  currency: {
    pattern: /^[A-Z]{3}$/,
    example: "USD, EUR, EGP",
  },
} as const;

