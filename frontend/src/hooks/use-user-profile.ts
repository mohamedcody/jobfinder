"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { profileService, type UserProfileResponse, type UpdateProfileRequest } from "@/lib/profile/profile-service";
import { getApiErrorMessage } from "@/lib/auth/api-error";

/** Maximum number of auto-retries for network / not-found errors. */
const MAX_RETRIES = 3;

type ErrorType = "network" | "unauthorized" | "not_found" | "validation" | "unknown";

interface ProfileError {
  type: ErrorType;
  message: string;
  status?: number;
}

const TOAST_MESSAGES: Record<ErrorType, string> = {
  network: "Network error. Please check your connection.",
  unauthorized: "You don't have permission to access this profile.",
  not_found: "Profile not found. Please create one first.",
  validation: "Please check your profile data.",
  unknown: "Something went wrong. Please try again.",
};

function parseProfileError(err: unknown): ProfileError {
  const message = getApiErrorMessage(err);
  const status =
    typeof err === "object" && err !== null && "response" in err
      ? (err as { response?: { status?: number } }).response?.status
      : undefined;

  if (!status || status === 0) return { type: "network", message: "Network connection failed", status };
  if (status === 401 || status === 403) return { type: "unauthorized", message: "You are not authorized to access this resource", status };
  if (status === 404) return { type: "not_found", message: "Profile not found", status };
  if (status === 400 || status === 422) return { type: "validation", message: message || "Invalid profile data", status };
  if (status >= 500) return { type: "unknown", message: "Server error. Please try again later", status };

  return { type: "unknown", message, status };
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<ProfileError | null>(null);

  // Use a ref to track retry count so it doesn't cause stale closure issues.
  const retryCountRef = useRef(0);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await profileService.getMyProfile();
      setProfile(data);
      retryCountRef.current = 0;
    } catch (err) {
      const parsedError = parseProfileError(err);

      const isRetryable = parsedError.type === "network" || parsedError.type === "not_found";
      if (isRetryable && retryCountRef.current < MAX_RETRIES) {
        const delay = 1000 * Math.pow(2, retryCountRef.current); // Exponential backoff
        retryCountRef.current += 1;
        setTimeout(() => void fetchProfile(), delay);
        return;
      }

      setError(parsedError);
      toast.error(TOAST_MESSAGES[parsedError.type]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: UpdateProfileRequest) => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await profileService.updateMyProfile(updates);
      setProfile(updated);
      toast.success("Profile updated successfully!");
      return updated;
    } catch (err) {
      const parsedError = parseProfileError(err);
      setError(parsedError);
      toast.error(TOAST_MESSAGES[parsedError.type]);
      return undefined;
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    fetchProfile,
    updateProfile,
  };
};
