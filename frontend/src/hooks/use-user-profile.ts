"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { profileService, type UserProfileResponse, type UpdateProfileRequest } from "@/lib/profile/profile-service";

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // جيب البروفايل من الـ API مع Retry Logic
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`[Profile] Fetching profile... (attempt ${retryCount + 1})`);
      
      const data = await profileService.getMyProfile();
      setProfile(data);
      setRetryCount(0); // Reset retry count on success
      console.log("[Profile] Successfully fetched:", data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch profile";
      console.error("[Profile] Error:", message);
      
      // ✅ إذا كان الخطأ 404 والمحاولات ما انتهت → حاول مرة تانية
      if (message.includes("404") && retryCount < MAX_RETRIES) {
        console.log(`[Profile] Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(retryCount + 1);
        setTimeout(() => {
          fetchProfile();
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      setError(message);
      toast.error(message);
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
        toast.success("Profile updated successfully!");
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update profile";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, []); // Remove fetchProfile from dependency to prevent infinite loops

  return {
    profile,
    isLoading,
    isSaving,
    error,
    fetchProfile,
    updateProfile,
  };
};



