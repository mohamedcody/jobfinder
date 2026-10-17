import axios from "axios";
import type { ApiErrorShape } from "@/types/auth.types";

export const isRequestCanceled = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return error.code === "ERR_CANCELED";
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code?: string }).code === "ERR_CANCELED";
  }

  return false;
};

export const getApiErrorMessage = (error: unknown): string => {
  const isAxios = axios.isAxiosError<ApiErrorShape>(error);
  const isDuckAxios =
    typeof error === "object" &&
    error !== null &&
    ("response" in error || "isAxiosError" in error);

  if (isAxios || isDuckAxios) {
    const axiosError = error as {
      response?: { data?: ApiErrorShape; status?: number };
      message?: string;
    };
    const data = axiosError.response?.data;
    const status = axiosError.response?.status;

    if (status === 401) {
      return "Your session has expired. Please log in again.";
    }

    if (status === 403) {
      return "You are not authorized to access this resource. Please log in again.";
    }

    if (status === 423) {
      return "Your account is temporarily locked after multiple failed attempts. Please wait for one minute and try again.";
    }

    if (status === 429) {
      return data?.message || "Too many requests. Please wait a moment before trying again.";
    }

    if (!axiosError.response && !status && !data) {
      return "Unable to reach the server. Please check your connection and try again.";
    }

    return (
      data?.message ||
      data?.error ||
      data?.details ||
      (!status && !data ? "Unable to reach the server. Please check your connection and try again." : undefined) ||
      (status ? `Request failed with status code ${status}` : undefined) ||
      axiosError.message ||
      "Something went wrong. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

