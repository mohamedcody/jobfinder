import axios from "axios";
import { getToken, isTokenExpired, clearToken } from "@/lib/auth/token-storage";
import type { EmailAlertResponse, UpdateEmailAlertRequest } from "./types";

/**
 * Base URL for the Email Alert API.
 * Uses the Next.js rewrite proxy: /api/users/profile/alerts → backend:8080
 */
const ALERTS_API_BASE_URL =
  process.env.NEXT_PUBLIC_ALERTS_API_URL || "/api/users/profile/alerts";

export const alertsApiClient = axios.create({
  baseURL: ALERTS_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor — Attach JWT Bearer token
alertsApiClient.interceptors.request.use((config) => {
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

// Response Interceptor — Clear token on 401/403
alertsApiClient.interceptors.response.use(
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
 * Email Alert API Service
 * Handles GET, PUT, and POST /test operations
 */
export const emailAlertService = {
  /**
   * Fetch current email alert settings.
   * Backend auto-creates defaults (dailyDigestEnabled=true, minMatchScore=60)
   * if no settings exist for the user.
   */
  async getAlertSettings(): Promise<EmailAlertResponse> {
    const { data } = await alertsApiClient.get<EmailAlertResponse>("");
    return data;
  },

  /**
   * Update email alert settings.
   * Both fields are required by the backend (@NotNull validation).
   */
  async updateAlertSettings(
    request: UpdateEmailAlertRequest,
  ): Promise<EmailAlertResponse> {
    const { data } = await alertsApiClient.put<EmailAlertResponse>("", request);
    return data;
  },

  /**
   * Trigger a test email alert.
   * Returns a plain string message (not JSON).
   * Possible outcomes:
   *   - 200: Success message with match count and recipient email
   *   - 200: "No matches found above your minimum score..."
   *   - 400: BaseException if profile has no job title
   *   - 404: BaseException if user not found
   */
  async triggerTestEmail(): Promise<string> {
    const { data } = await alertsApiClient.post<string>("/test");
    return data;
  },
};
