/**
 * Centralized constants for the application
 * Helps maintain consistency and ease of configuration changes
 */

export const APP_CONSTANTS = {
  // Timeouts
  API_TIMEOUT_MS: 30000,
  AUTH_API_TIMEOUT_MS: 15000,
  DEBOUNCE_DELAY_MS: 300,
  SEARCH_DEBOUNCE_MS: 300,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  LOAD_MORE_THRESHOLD: 3,

  // Storage Keys
  TOKEN_STORAGE_KEY: "jobfinder.auth.token",
  AUTH_SESSION_EVENT: "jobfinder-auth-session-changed",
  SAVED_JOBS_STORAGE_KEY: "jobfinder.saved-jobs",
  SIDEBAR_COLLAPSED_KEY: "sidebar-collapsed",

  // UI
  ANIMATION_DURATION_FAST: 200,
  ANIMATION_DURATION_NORMAL: 300,
  ANIMATION_DURATION_SLOW: 500,
  SKELETON_LINES: 3,

  // API
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,

  // Job Search
  MIN_SEARCH_LENGTH: 2,
  MAX_FILTERS_DISPLAY: 5,

  // Sidebar
  SIDEBAR_COLLAPSED_WIDTH: 80,
  SIDEBAR_EXPANDED_WIDTH: 272,

  // Toast Messages
  SAVE_SUCCESS: "Job added to saved jobs",
  UNSAVE_SUCCESS: "Job removed from saved jobs",
  SAVE_ERROR: "Failed to save job. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNAUTHORIZED: "Your session has expired. Please log in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
};

export const API_ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input.",
  401: "Unauthorized. Please log in again.",
  403: "Forbidden. You don't have access to this resource.",
  404: "Resource not found.",
  500: "Server error. Please try again later.",
  502: "Bad gateway. Please try again later.",
  503: "Service unavailable. Please try again later.",
  504: "Request timeout. Please try again later.",
};

export const EMPLOYMENT_TYPES = [
  "Remote",
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
];

export const DATE_PRESETS = [
  { value: "any" as const, label: "Anytime" },
  { value: "24h" as const, label: "24 Hours" },
  { value: "week" as const, label: "This Week" },
  { value: "month" as const, label: "This Month" },
];

