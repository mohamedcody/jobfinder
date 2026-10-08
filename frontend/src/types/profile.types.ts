/**
 * User Profile Types - Frontend
 * تعريفات TypeScript لبيانات البروفايل
 */

/**
 * Response من Backend عند جلب البروفايل
 */
export interface UserProfileResponse {
  id: number;
  userId: number;
  username: string;
  email: string;
  currentJobTitle?: string | null;
  yearsOfExperience?: number | null;
  educationLevel?: string | null;
  country?: string | null;
  city?: string | null;
  resumeUrl?: string | null;
  expectedSalary?: number | null;
  currency?: string | null;
  isOpenToWork?: boolean | null;
  bio?: string | null;
  skills?: { id: number; name: string }[] | null;
  updatedAt?: string;
}

/**
 * Request لتحديث البروفايل
 * جميع الحقول اختيارية (Partial Update)
 */
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

