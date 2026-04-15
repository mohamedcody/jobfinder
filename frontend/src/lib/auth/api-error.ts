import axios from "axios";
import type { ApiErrorShape } from "@/lib/auth/types";

export const isRequestCanceled = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return error.code === "ERR_CANCELED";
};

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    const data = error.response?.data;
    const status = error.response?.status;

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

    if (!status) {
      return "Unable to reach the server. Please check your connection and try again.";
    }

    return (
      data?.message ||
      data?.error ||
      data?.details ||
      (status ? `Request failed with status code ${status}` : undefined) ||
      error.message ||
      "Something went wrong. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

