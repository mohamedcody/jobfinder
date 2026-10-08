"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  uploadCvForParsing,
  confirmCvSave,
  parseCvApiError,
} from "@/services/cv-parser.service";
import type { CvParseResponse, CvConfirmRequest, CvUploadStatus } from "@/types/cv-parser.types";

export const useCvParser = () => {
  const [status, setStatus] = useState<CvUploadStatus>("idle");
  const [result, setResult] = useState<CvParseResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const uploadCv = useCallback(async (file: File) => {
    // Client-side validation
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }

    setFileName(file.name);
    setStatus("uploading");
    setErrorMessage(null);
    setResult(null);

    // Small delay for UI feedback before switching to "parsing"
    await new Promise((r) => setTimeout(r, 400));
    setStatus("parsing");

    try {
      const data = await uploadCvForParsing(file);
      setResult(data);
      setStatus("success");
      toast.success("CV parsed successfully! Review your data below.");
    } catch (err) {
      const message = parseCvApiError(err);
      setErrorMessage(message);
      setStatus("error");
      toast.error(message);
    }
  }, []);

  const confirmCv = useCallback(async (request: CvConfirmRequest) => {
    setIsConfirming(true);
    try {
      await confirmCvSave(request);
      toast.success("🎉 Profile saved successfully!");
      return true;
    } catch (err) {
      const message = parseCvApiError(err);
      toast.error(message);
      return false;
    } finally {
      setIsConfirming(false);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
    setFileName(null);
  }, []);

  return {
    status,
    result,
    errorMessage,
    fileName,
    isConfirming,
    uploadCv,
    confirmCv,
    reset,
  };
};
