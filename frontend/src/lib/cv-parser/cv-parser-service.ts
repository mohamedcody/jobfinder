/**
 * CV Parser Service — Frontend
 * Handles the multipart file upload to the backend CV parsing endpoint.
 *
 * IMPORTANT: We do NOT set Content-Type manually.
 * The browser must auto-generate the multipart boundary header.
 */

import axios, { AxiosError } from "axios";
import { getToken, isTokenExpired, clearToken } from "@/lib/auth/token-storage";
import type { CvParseResponse, CvApiError } from "./types";

const CV_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const cvApiClient = axios.create({
  baseURL: CV_API_BASE_URL,
  timeout: 60000, // 60s — AI processing can take time
});

// JWT interceptor (same pattern as profile-service)
cvApiClient.interceptors.request.use((config) => {
  const token = getToken();

  if (!token) return config;

  if (isTokenExpired(token)) {
    clearToken();
    return config;
  }

  config.headers = config.headers ?? {};
  (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;

  return config;
});

cvApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      clearToken();
    }
    return Promise.reject(error);
  },
);

/**
 * Upload a PDF file for AI-powered CV parsing.
 *
 * @param file - The PDF file from the input/drop zone
 * @returns Parsed CV data from the backend
 * @throws AxiosError with CvApiError body on failure
 */
export async function uploadCvForParsing(file: File): Promise<CvParseResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await cvApiClient.post<CvParseResponse>(
    "/cv/upload",
    formData
  );

  return data;
}

/**
 * Extracts user-friendly error message from backend error response.
 */
export function parseCvApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<CvApiError>;
    const status = axiosErr.response?.status;
    const backendMessage = axiosErr.response?.data?.message;

    // Return the backend's exact message when available
    if (backendMessage) return backendMessage;

    // Fallback messages by status code
    if (status === 400) return "Invalid file. Please upload a valid PDF.";
    if (status === 401 || status === 403) return "Session expired. Please log in again.";
    if (status === 413) return "File is too large. Maximum size is 10MB.";
    if (status === 422) return "AI could not parse the CV. Please try a different file.";
    if (status === 504) return "AI service timed out. Please try again in a moment.";
    if (status && status >= 500) return "Server error. Please try again later.";

    // Network error (no response)
    if (axiosErr.code === "ERR_NETWORK") return "Network error. Check your connection.";
    if (axiosErr.code === "ECONNABORTED") return "Request timed out. Please try again.";
  }

  return "An unexpected error occurred. Please try again.";
}
