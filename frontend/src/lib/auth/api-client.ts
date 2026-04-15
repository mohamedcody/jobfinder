import axios from "axios";
import { emitGlobalApiError, getGlobalApiErrorMessage } from "@/lib/api/global-api-error";
import { clearToken, getToken, isTokenExpired } from "@/lib/auth/token-storage";

const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL || "/api/auth";

export const apiClient = axios.create({
  baseURL: AUTH_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      clearToken();
    }

    if (!status || status >= 500) {
      emitGlobalApiError({
        status,
        message: getGlobalApiErrorMessage(status),
      });
    }

    return Promise.reject(error);
  },
);
