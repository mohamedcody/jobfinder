"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileUp,
  FileText,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useCvParser } from "@/hooks/use-cv-parser";
import { AiLoadingState } from "./ai-loading-state";
import { ReviewAndSaveForm } from "./review-and-save-form";
import { Button } from "@/components/ui/button";

/**
 * Main CV Uploader Widget with drag-and-drop support.
 *
 * State machine: idle → uploading → parsing → success / error
 *
 * Drop zone accepts only PDF files (validated client-side + server-side).
 */
export function CvUploaderWidget() {
  const { status, result, errorMessage, fileName, uploadCv, reset } =
    useCvParser();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      uploadCv(file);
    },
    [uploadCv],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleFile],
  );

  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* ─── IDLE: Drag & Drop Zone ─── */}
        {status === "idle" && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFilePicker}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openFilePicker();
              }}
              className={`
                relative group cursor-pointer rounded-3xl border-2 border-dashed p-12
                transition-all duration-300 ease-out text-center
                ${
                  isDragging
                    ? "border-cyan-400 bg-cyan-400/8 shadow-[0_0_40px_rgba(34,211,238,0.15)] scale-[1.01]"
                    : "border-white/15 bg-white/3 hover:border-violet-500/40 hover:bg-violet-500/5"
                }
              `}
            >
              {/* Decorative gradient */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative">
                {/* Icon */}
                <motion.div
                  className={`mx-auto mb-5 h-20 w-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isDragging
                      ? "bg-cyan-400/15 border-cyan-400/30 shadow-[0_0_24px_rgba(34,211,238,0.2)]"
                      : "bg-violet-500/10 border-violet-500/20 group-hover:bg-violet-500/15"
                  } border`}
                  animate={
                    isDragging ? { y: [0, -5, 0] } : { y: 0 }
                  }
                  transition={{
                    repeat: isDragging ? Infinity : 0,
                    duration: 1.5,
                  }}
                >
                  {isDragging ? (
                    <FileUp className="h-9 w-9 text-cyan-400" />
                  ) : (
                    <Upload className="h-9 w-9 text-violet-400 group-hover:text-violet-300 transition-colors" />
                  )}
                </motion.div>

                {/* Text */}
                <h3 className="text-lg font-bold text-white mb-2">
                  {isDragging ? (
                    <span className="text-cyan-300">Drop your CV here</span>
                  ) : (
                    <>
                      <span className="text-violet-300">Drag & drop</span>{" "}
                      your CV, or{" "}
                      <span className="text-violet-300 underline underline-offset-4 decoration-violet-500/50">
                        browse
                      </span>
                    </>
                  )}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  PDF files only • Max 10MB
                </p>

                {/* Feature badges */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {[
                    { icon: Sparkles, label: "AI-Powered Parsing" },
                    { icon: FileText, label: "Auto-fills Profile" },
                  ].map((feat) => (
                    <span
                      key={feat.label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-semibold text-slate-400"
                    >
                      <feat.icon className="h-3 w-3 text-violet-400" />
                      {feat.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleInputChange}
                className="hidden"
                aria-label="Upload CV PDF file"
              />
            </div>
          </motion.div>
        )}

        {/* ─── UPLOADING / PARSING: AI Loading State ─── */}
        {(status === "uploading" || status === "parsing") && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-xl"
          >
            <AiLoadingState fileName={fileName} />
          </motion.div>
        )}

        {/* ─── SUCCESS: Review & Save Form ─── */}
        {status === "success" && result && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-xl"
          >
            <ReviewAndSaveForm result={result} onReset={reset} />
          </motion.div>
        )}

        {/* ─── ERROR: Retry State ─── */}
        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl bg-red-500/5 border border-red-500/20 p-8 text-center"
          >
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Parsing Failed
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              {errorMessage || "Something went wrong. Please try again."}
            </p>
            <Button
              onClick={reset}
              className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-6"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
