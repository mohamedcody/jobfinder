"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  uploadCvForParsing,
  parseCvApiError,
} from "@/lib/cv-parser/cv-parser-service";
import type { CvParseResponse, CvUploadStatus } from "@/lib/cv-parser/types";

export const useCvParser = () => {
  const [status, setStatus] = useState<CvUploadStatus>("idle");
  const [result, setResult] = useState<CvParseResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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
      toast.success("🎉 CV parsed and profile updated successfully!");
    } catch (err) {
      const message = parseCvApiError(err);
      setErrorMessage(message);
      setStatus("error");
      toast.error(message);
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
    uploadCv,
    reset,
  };
};
