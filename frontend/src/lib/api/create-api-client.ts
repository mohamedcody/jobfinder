/**
 * Shared API Client Factory
 * 
 * Creates pre-configured Axios instances with:
 * - JWT Bearer token injection (request interceptor)
 * - Token expiry validation before each request
 * - 401/403 session invalidation with redirect to login
 * - Global error emission for network/server errors
 * - Cancelled request detection
 *
 * REPLACES the 6 duplicated interceptor blocks across:
 * api-client.ts, jobs-service.ts, profile-service.ts,
 * saved-jobs-service.ts, cv-parser-service.ts, email-alert-service.ts
 */

import axios, { type AxiosInstance, type CreateAxiosDefaults } from "axios";
import { getToken, isTokenExpired, clearToken } from "@/lib/auth/token-storage";
import { emitGlobalApiError, getGlobalApiErrorMessage } from "@/lib/api/global-api-error";

/** Custom event name for session expiry — consumed by AuthGuard */
export const AUTH_EXPIRED_EVENT = "jobfinder-auth-expired";

const isBrowser = () => typeof window !== "undefined";

/**
 * Emits a global event when a 401/403 is received, so the AuthGuard
 * can redirect to /login with a callback URL.
 */
const emitAuthExpired = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
};

/**
 * Creates an Axios instance with all shared interceptors pre-configured.
 *
 * @param config - Standard Axios config (baseURL, timeout, headers, etc.)
 * @param options.emitGlobalErrors - Whether to emit global API error events for 5xx/network errors. Default: true
 * @returns A fully configured AxiosInstance
 *
 * @example
 * ```ts
 * const client = createApiClient({ baseURL: "/api/jobs", timeout: 30000 });
 * ```
 */
export function createApiClient(
  config: CreateAxiosDefaults,
  options: { emitGlobalErrors?: boolean } = {},
): AxiosInstance {
  const { emitGlobalErrors = true } = options;

  const client = axios.create(config);

  // ── Request Interceptor ─────────────────────────────────────────────
  // Attaches JWT Bearer token if valid, clears it if expired.
  client.interceptors.request.use((cfg) => {
    const token = getToken();

    if (!token) {
      return cfg;
    }

    if (isTokenExpired(token)) {
      clearToken();
      return cfg;
    }

    cfg.headers = cfg.headers ?? {};
    (cfg.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    return cfg;
  });

  // ── Response Interceptor ────────────────────────────────────────────
  // Handles auth errors (401/403) and server/network errors.
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const isCanceled = error?.code === "ERR_CANCELED";

      // ── Auth Error: clear session + notify for redirect ──
      if (status === 401 || status === 403) {
        clearToken();
        emitAuthExpired();
      }

      // ── Server/Network Error: emit global toast ──
      if (emitGlobalErrors && !isCanceled && (!status || status >= 500 || status === 0)) {
        emitGlobalApiError({
          status,
          message: getGlobalApiErrorMessage(status),
        });
      }

      return Promise.reject(error);
    },
  );

  return client;
}
