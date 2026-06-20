"use client";

import { Heart, Loader2 } from "lucide-react";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import type { SaveJobRequest } from "@/lib/saved-jobs/types";
import { cn } from "@/lib/utils";

interface SaveJobToggleProps {
  jobId: number;
  request?: SaveJobRequest;
  className?: string;
  iconClassName?: string;
}

export function SaveJobToggle({ jobId, request, className, iconClassName }: SaveJobToggleProps) {
  const { isSaved, isJobLoading, toggleSaveJob } = useSavedJobs();
  const saved = isSaved(jobId);
  const loading = isJobLoading(jobId);

  return (
    <button
      type="button"
      onClick={() => void toggleSaveJob(jobId, request)}
      disabled={loading}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved jobs" : "Save this job"}
      title={saved ? "Remove from saved jobs" : "Save this job"}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border p-3.5 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        saved
          ? "border-pink-500/30 bg-pink-500/10 text-pink-500"
          : "border-white/5 bg-white/5 text-slate-600 hover:text-white",
        className,
      )}
    >
      {loading ? (
        <Loader2 className={cn("h-5 w-5 animate-spin", iconClassName)} aria-hidden="true" />
      ) : (
        <Heart className={cn("h-5 w-5", saved && "fill-current", iconClassName)} aria-hidden="true" />
      )}
    </button>
  );
}
