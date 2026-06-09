export const GLOBAL_API_ERROR_EVENT = "jobfinder-global-api-error";

interface GlobalApiErrorDetail {
  message: string;
  status?: number;
}

const isBrowser = () => typeof window !== "undefined";

export const emitGlobalApiError = (detail: GlobalApiErrorDetail) => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new CustomEvent<GlobalApiErrorDetail>(GLOBAL_API_ERROR_EVENT, { detail }));
};

export const getGlobalApiErrorMessage = (status?: number) => {
  if (status && status >= 500) {
    return "Server error detected. Please try again shortly.";
  }

  return "Network issue detected. Please verify your connection.";
};

