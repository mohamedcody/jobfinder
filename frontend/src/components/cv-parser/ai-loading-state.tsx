"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Sparkles,
  Brain,
  Search,
  CheckCircle2,
  Shield,
} from "lucide-react";

/**
 * Engaging AI loading state shown while the backend processes the CV.
 * Features skeleton loaders, animated dots, and step progress indicators.
 */
export function AiLoadingState({ fileName }: { fileName: string | null }) {
  const steps = [
    { icon: FileText, label: "Extracting text from PDF", delay: 0 },
    { icon: Brain, label: "AI analyzing your experience", delay: 0.3 },
    { icon: Search, label: "Identifying skills & education", delay: 0.6 },
    { icon: Shield, label: "Validating extracted data", delay: 0.9 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          className="relative mx-auto mb-5 h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(139,44,245,0.25)]"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <Sparkles className="h-9 w-9 text-violet-400" />
          {/* Orbital ring */}
          <motion.div
            className="absolute inset-[-6px] rounded-2xl border border-dashed border-cyan-400/30"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          />
        </motion.div>
        <h3 className="text-xl font-black text-white mb-1">
          Analyzing Your CV...
        </h3>
        <p className="text-sm text-slate-400">
          {fileName ? (
            <>
              Processing{" "}
              <span className="text-cyan-400 font-semibold">{fileName}</span>
            </>
          ) : (
            "Our AI is extracting structured data from your resume"
          )}
        </p>
      </div>

      {/* Step Progress */}
      <div className="space-y-3 mb-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.delay + 0.3, duration: 0.4 }}
            className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 px-4 py-3"
          >
            <motion.div
              className="h-8 w-8 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                delay: step.delay,
              }}
            >
              <step.icon className="h-4 w-4 text-violet-400" />
            </motion.div>
            <span className="text-sm text-slate-300 font-medium flex-1">
              {step.label}
            </span>
            {/* Animated loading dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    delay: dot * 0.2 + step.delay,
                  }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Skeleton Preview */}
      <div className="rounded-xl bg-white/3 border border-white/6 p-5 space-y-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">
          Extracted Data Preview
        </p>
        {/* Name skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full skeleton-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-2/3 rounded-lg skeleton-pulse" />
            <div className="h-3 w-1/3 rounded-lg skeleton-pulse" />
          </div>
        </div>
        {/* Skills skeleton */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-6 rounded-full skeleton-pulse"
              style={{ width: `${50 + Math.random() * 40}px` }}
            />
          ))}
        </div>
        {/* Experience skeleton */}
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full rounded skeleton-pulse" />
          <div className="h-3 w-4/5 rounded skeleton-pulse" />
          <div className="h-3 w-3/5 rounded skeleton-pulse" />
        </div>
      </div>

      {/* Bottom tip */}
      <motion.p
        className="text-center text-xs text-slate-500 mt-5 flex items-center justify-center gap-1.5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <CheckCircle2 className="h-3 w-3" />
        This usually takes 10–20 seconds
      </motion.p>
    </motion.div>
  );
}
