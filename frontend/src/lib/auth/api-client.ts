import { createApiClient } from "@/lib/api/create-api-client";

const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL || "/api/auth";

export const apiClient = createApiClient({
  baseURL: AUTH_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
