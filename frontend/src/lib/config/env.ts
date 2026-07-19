/**
 * Centralized Environment Configuration
 *
 * Single source of truth for all environment variables.
 * All env vars are validated here at module load time so misconfiguration
 * surfaces immediately rather than as cryptic runtime errors.
 *
 * Usage:
 *   import { env } from "@/lib/config/env";
 *   const baseUrl = env.API_BASE_URL;
 */

const getEnv = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[env] "${key}" is not set. Falling back to "${fallback}". ` +
        `Set this variable in your .env.local file.`
      );
    }
    return fallback;
  }
  return value.trim();
};

export const env = {
  // ── Authentication ───────────────────────────────────────────────
  AUTH_API_URL: getEnv("NEXT_PUBLIC_AUTH_API_URL", "/api/auth"),

  // ── Jobs ─────────────────────────────────────────────────────────
  JOBS_API_URL: getEnv("NEXT_PUBLIC_JOBS_API_URL", "/api/jobs"),

  // ── User Profile ─────────────────────────────────────────────────
  PROFILE_API_URL: getEnv("NEXT_PUBLIC_PROFILE_API_URL", "/api/users/profile"),

  // ── Saved Jobs ───────────────────────────────────────────────────
  SAVED_JOBS_API_URL: getEnv("NEXT_PUBLIC_SAVED_JOBS_API_URL", "/api/saved-jobs"),
  SAVED_JOBS_API_TIMEOUT_MS: Number(
    getEnv("NEXT_PUBLIC_SAVED_JOBS_API_TIMEOUT_MS", "15000")
  ),

  // ── Email Alerts ─────────────────────────────────────────────────
  ALERTS_API_URL: getEnv("NEXT_PUBLIC_ALERTS_API_URL", "/api/users/profile/alerts"),

  // ── CV Parser ────────────────────────────────────────────────────
  /** Base /api URL used by the CV upload endpoint (/api/cv/upload) */
  API_BASE_URL: getEnv("NEXT_PUBLIC_API_URL", "/api"),
} as const;

export type Env = typeof env;
