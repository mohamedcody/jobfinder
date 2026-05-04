/**
 * User Profile Service - Frontend
 * يتعامل مع جميع الاتصالات مع Backend للبروفايل
 */

import axios, { AxiosError } from "axios";
import { UserProfileResponse, UpdateUserProfileRequest } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

/**
 * Instance من Axios مع معالجة معايير مشتركة
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor لإضافة JWT Token إلى كل request
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * جلب بيانات البروفايل الحالي
 * GET /api/users/profile
 * 
 * @returns بيانات البروفايل الكاملة
 * @throws AxiosError إذا فشل الطلب
 */
export async function fetchUserProfile(): Promise<UserProfileResponse> {
  try {
    const response = await apiClient.get<UserProfileResponse>("/users/profile");
    return response.data;
  } catch (error) {
    handleProfileError(error, "Failed to fetch profile");
    throw error;
  }
}

/**
 * تحديث بيانات البروفايل
 * PUT /api/users/profile
 * 
 * يدعم التحديثات الجزئية - يمكن إرسال حقل واحد فقط
 * 
 * @param data بيانات التحديث (جميع الحقول اختيارية)
 * @returns البروفايل المحدّث
 * @throws AxiosError إذا فشل الطلب
 */
export async function updateUserProfile(
  data: UpdateUserProfileRequest
): Promise<UserProfileResponse> {
  try {
    const response = await apiClient.put<UserProfileResponse>(
      "/users/profile",
      data
    );
    return response.data;
  } catch (error) {
    handleProfileError(error, "Failed to update profile");
    throw error;
  }
}

/**
 * جلب بروفايل مستخدم معين (للإداريين)
 * GET /api/users/profile/{userId}
 * 
 * @param userId معرف المستخدم
 * @returns بيانات البروفايل
 * @throws AxiosError إذا فشل الطلب
 */
export async function getUserProfileById(
  userId: number
): Promise<UserProfileResponse> {
  try {
    const response = await apiClient.get<UserProfileResponse>(
      `/users/profile/${userId}`
    );
    return response.data;
  } catch (error) {
    handleProfileError(error, `Failed to fetch profile for user ${userId}`);
    throw error;
  }
}

/**
 * معالجة الأخطاء الشاملة
 * تحويل أخطاء Axios إلى رسائل مفهومة للمستخدم
 */
function handleProfileError(error: unknown, defaultMessage: string): void {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;

    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      defaultMessage;

    console.error("Profile API Error:", {
      status: axiosError.response?.status,
      message: errorMessage,
      data: axiosError.response?.data,
    });
  } else {
    console.error("Unexpected error:", error);
  }
}

/**
 * دالة مساعدة للتحقق من نجاح أو فشل الطلب
 * @param error أي خطأ
 * @returns true إذا كان الخطأ 401 أو 403
 */
export function isAuthError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401 || error.response?.status === 403;
  }
  return false;
}

/**
 * دالة مساعدة للتحقق من أخطاء التحقق من الصحة (Validation)
 * @param error أي خطأ
 * @returns true إذا كان الخطأ 400
 */
export function isValidationError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 400;
  }
  return false;
}

