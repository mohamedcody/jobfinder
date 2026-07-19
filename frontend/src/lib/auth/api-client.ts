import { createApiClient } from "@/lib/api/create-api-client";
import { env } from "@/lib/config/env";

export const apiClient = createApiClient({
  baseURL: env.AUTH_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
