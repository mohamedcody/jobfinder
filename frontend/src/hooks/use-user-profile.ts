"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { profileService, type UserProfileResponse, type UpdateProfileRequest } from "@/lib/profile/profile-service";

type ErrorType = "network" | "unauthorized" | "not_found" | "validation" | "unknown";

interface ProfileError {
  type: ErrorType;
  message: string;
  status?: number;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<ProfileError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Parse error and determine type
  const parseError = (err: unknown): ProfileError => {
    const message = err instanceof Error ? err.message : String(err ?? "");
    const status = typeof err === "object" && err !== null && "response" in err
      ? (err as { response?: { status?: number } }).response?.status
      : undefined;

    if (!status || status === 0) {
      return { type: "network", message: "Network connection failed", status };
    }
    if (status === 401 || status === 403) {
      return { type: "unauthorized", message: "You are not authorized to access this resource", status };
    }
    if (status === 404) {
      return { type: "not_found", message: "Profile not found", status };
    }
    if (status === 400 || status === 422) {
      return { type: "validation", message: message || "Invalid profile data", status };
    }
    if (status >= 500) {
      return { type: "unknown", message: "Server error. Please try again later", status };
    }

    return { type: "unknown", message, status };
  };

  // Show error toast with appropriate message
  const showErrorToast = (error: ProfileError) => {
    const messages: Record<ErrorType, string> = {
      network: "❌ Network error. Please check your connection.",
      unauthorized: "❌ You don't have permission to access this profile.",
      not_found: "❌ Profile not found. Please create one first.",
      validation: "❌ Please check your profile data.",
      unknown: "❌ Something went wrong. Please try again.",
    };
    toast.error(messages[error.type]);
  };

  // جيب البروفايل من الـ API مع Retry Logic
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`[Profile] Fetching profile... (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
      
      const data = await profileService.getMyProfile();
      setProfile(data);
      setRetryCount(0); // Reset retry count on success
      console.log("[Profile] Successfully fetched:", data);
    } catch (err) {
      const parsedError = parseError(err);
      console.error("[Profile] Error:", parsedError);
      
      // Retry logic for network and not found errors
      if ((parsedError.type === "network" || parsedError.type === "not_found") && retryCount < MAX_RETRIES) {
        console.log(`[Profile] Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(retryCount + 1);
        const delayMs = 1000 * Math.pow(2, retryCount); // Exponential backoff
        setTimeout(() => {
          fetchProfile();
        }, delayMs);
        return;
      }
      
      setError(parsedError);
      showErrorToast(parsedError);
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);

  // حدث البروفايل
  const updateProfile = useCallback(
    async (updates: UpdateProfileRequest) => {
      try {
        setIsSaving(true);
        setError(null);
        const updated = await profileService.updateMyProfile(updates);
        setProfile(updated);
        toast.success("✅ Profile updated successfully!");
        return updated;
      } catch (err) {
        const parsedError = parseError(err);
        setError(parsedError);
        showErrorToast(parsedError);
        return undefined;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    fetchProfile,
    updateProfile,
  };
};

