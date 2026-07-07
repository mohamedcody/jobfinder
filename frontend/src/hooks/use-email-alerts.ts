"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { emailAlertService } from "@/lib/email-alerts/email-alert-service";
import type {
  EmailAlertResponse,
  UpdateEmailAlertRequest,
} from "@/lib/email-alerts/types";
import { getApiErrorMessage } from "@/lib/auth/api-error";

export const useEmailAlerts = () => {
  const [settings, setSettings] = useState<EmailAlertResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch alert settings from the backend.
   * Called on mount. Backend auto-creates defaults if none exist.
   */
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await emailAlertService.getAlertSettings();
      setSettings(data);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(`❌ ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Persist updated settings to the backend.
   * Returns the updated settings on success, or undefined on failure.
   */
  const updateSettings = useCallback(
    async (request: UpdateEmailAlertRequest) => {
      try {
        setIsSaving(true);
        setError(null);
        const updated = await emailAlertService.updateAlertSettings(request);
        setSettings(updated);
        toast.success("✅ Email alert settings saved successfully!");
        return updated;
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        toast.error(`❌ ${message}`);
        return undefined;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  /**
   * Trigger a test email alert.
   * The backend returns a plain string message describing the outcome.
   */
  const sendTestEmail = useCallback(async () => {
    try {
      setIsSendingTest(true);
      setError(null);
      const message = await emailAlertService.triggerTestEmail();

      // Backend returns informational messages for both success and
      // "no matches" scenarios with 200 OK. Distinguish by content.
      const isNoMatches = message.toLowerCase().includes("no matches found");
      if (isNoMatches) {
        toast.warning(`⚠️ ${message}`);
      } else {
        toast.success(`📧 ${message}`);
      }

      return message;
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(`❌ ${message}`);
      return undefined;
    } finally {
      setIsSendingTest(false);
    }
  }, []);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    isSendingTest,
    error,
    fetchSettings,
    updateSettings,
    sendTestEmail,
  };
};
