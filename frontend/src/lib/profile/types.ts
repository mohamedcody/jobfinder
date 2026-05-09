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
  // Fallbacks for UI that might use old names
  headline?: string | null;
  about?: string | null;
  skills?: { id: number; name: string }[] | null;
  availableToWork?: boolean;
  location?: string | null;
}

/**
 * Request لتحديث البروفايل
 * جميع الحقول اختيارية (Partial Update)
 */
export interface UpdateProfileRequest {
  headline?: string;
  about?: string;
  location?: string;
  yearsOfExperience?: number;
  expectedSalary?: number;
  currency?: string;
  availableToWork?: boolean;
  skills?: string[]; // Send an array of skill names
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

