import { createApiClient } from "@/lib/api/create-api-client";
import { env } from "@/lib/config/env";
import type { EmailAlertResponse, UpdateEmailAlertRequest } from "./types";

export const alertsApiClient = createApiClient({
  baseURL: env.ALERTS_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
