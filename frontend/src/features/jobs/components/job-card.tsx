"use client";

import { memo, useCallback, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Building2,
  Clock3,
  MapPin,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  Bot,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Job } from "@/types/jobs.types";
import { jobsService } from "@/services/jobs.service";
import { formatRelativeTime } from "@/utils/time-utils";
import { highlightText } from "@/utils/highlight-utils";
import { SaveJobToggle } from "@/features/saved-jobs/components/save-job-toggle";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { toast } from "sonner";

interface JobCardProps {
  job: Job;
  searchTerm?: string;
}

export const JobCard = memo(function JobCardComponent({ job, searchTerm = "" }: JobCardProps) {
  const { isSaved, toggleSaveJob } = useSavedJobs();
  const [summary, setSummary] = useState(job.aiSummary || "");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isLogoBroken, setIsLogoBroken] = useState(false);

  const handleApplyClick = () => {
    if (!isSaved(job.id)) {
      void toggleSaveJob(job.id);
    }
    try {
      const stored = window.localStorage.getItem("jobfinder:kanban-stages");
      const map = stored ? JSON.parse(stored) : {};
      map[job.id] = "applied";
      window.localStorage.setItem("jobfinder:kanban-stages", JSON.stringify(map));
      window.dispatchEvent(new CustomEvent("jobfinder:kanban-stages-changed", { detail: map }));
    } catch {
      // storage error safe fallback
    }

    toast.success(`Application opened for ${job.title}`, {
      description: "Automatically tracked in 'Applied' stage under Saved Matches.",
    });
  };

  const handleSummarize = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (showSummary && !summaryError && summary) {
      setShowSummary(false);
      return;
    }
    setShowSummary(true);
    if (summary && !summaryError) return;

    setIsLoadingSummary(true);
    setSummaryError(false);
    try {
      const result = await jobsService.summarizeJob(job.id);
      setSummary(result);
    } catch (error) {
      console.error("AI Insights Error:", error);
      setSummaryError(true);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleLogoError = useCallback(() => setIsLogoBroken(true), []);

  return (
      <motion.article
          layout
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-5 sm:p-6 hover:border-violet-500/30 transition-all duration-200 shadow-sm hover:shadow-md"
          role="article"
      >
        {/* 1. Identity Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/[0.04] border border-white/[0.08] shadow-inner group-hover:border-violet-500/30 transition-colors">
              {job.companyLogo && !isLogoBroken ? (
                  <Image
                      src={job.companyLogo}
                      alt={`${job.companyName} logo`}
                      fill
                      className="object-contain p-2"
                      onError={handleLogoError}
                      unoptimized
                  />
              ) : (
                  <div className="flex h-full w-full items-center justify-center bg-violet-600/10 text-slate-400">
                    <Building2 className="h-6 w-6" />
                  </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
                {job.employmentType && (
                  <span className="text-xs font-medium text-slate-400">
                    • {job.employmentType}
                  </span>
                )}
                {job.salaryRange && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/20">
                    <DollarSign className="h-3 w-3" />
                    {job.salaryRange}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors truncate tracking-tight">
                {searchTerm ? highlightText(job.title, searchTerm) : job.title}
              </h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{job.companyName}</p>
            </div>
          </div>

          <SaveJobToggle jobId={job.id} />
        </div>

        {/* 2. Metadata Context */}
        <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-slate-300 font-medium">{job.location || "Remote"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-slate-500" />
            <span>{formatRelativeTime(job.scrapedAt)}</span>
          </div>
        </div>

        {/* 3. AI Intelligence Section */}
        <div className="space-y-4">
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-400 font-medium">
            {searchTerm
                ? highlightText(job.description || "Advanced role analytics available via JobBot platform.", searchTerm)
                : (job.description || "Advanced role analytics available via JobBot platform.")}
          </p>

          <div className="pt-1 flex flex-wrap gap-2.5">
            <button
                onClick={handleSummarize}
                disabled={isLoadingSummary}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    showSummary
                        ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
                        : "bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 border border-violet-500/20"
                }`}
                title="Get AI-powered analysis of this job role - اضغط للحصول على تحليل ذكي للوظيفة"
            >
              {isLoadingSummary ? (
                  <>
                    <div className="animate-spin">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <span>Analyzing...</span>
                  </>
              ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{summary ? (showSummary ? "Hide AI Insights" : "Show AI Insights") : "AI Insights"}</span>
                    <span className="sm:hidden">{showSummary ? "✕" : "✓"} AI</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showSummary ? "rotate-180" : ""}`} />
                  </>
              )}
            </button>

            <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent("trigger-ai-chat", {
                    detail: {
                      text: `Analyze this role: **${job.title}** at **${job.companyName}**.`,
                      autoSend: true
                    }
                  }));
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold transition-all duration-200 border border-cyan-500/20 cursor-pointer"
                title="Chat with JobBot AI - تحدث مع مساعد الذكاء الاصطناعي للاستفسار عن الوظيفة"
            >
              <Bot className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ask JobBot</span>
              <span className="sm:hidden">Bot</span>
            </button>
          </div>

          <AnimatePresence>
            {showSummary && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                >
                  <div className="mt-3 rounded-xl bg-[#090b1c] border border-violet-500/20 p-4 relative">
                    <div className="relative space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                          <h4 className="text-xs font-bold text-violet-200">AI Role Summary</h4>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">Powered by Gemini</span>
                      </div>

                      {isLoadingSummary ? (
                          <div className="space-y-2 py-2">
                            <div className="h-2 w-28 bg-white/10 rounded-full animate-pulse" />
                            <div className="h-2 w-full bg-white/5 rounded-full animate-pulse" />
                            <div className="h-2 w-4/5 bg-white/5 rounded-full animate-pulse" />
                          </div>
                      ) : summaryError ? (
                          <div className="py-3 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center space-y-1.5">
                            <p className="text-xs text-red-300">
                              Unable to generate AI analysis at this moment.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleSummarize()}
                              className="text-xs font-semibold text-violet-400 hover:text-violet-300 underline underline-offset-2 cursor-pointer"
                            >
                              Try Again
                            </button>
                          </div>
                      ) : (
                          <div className="space-y-3">
                            <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                              <p className="text-xs text-slate-300 leading-relaxed max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                {summary}
                              </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/[0.02] border border-white/5 border-dashed">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <p className="text-[11px] font-medium text-slate-400">
                                Matched with your profile capabilities
                              </p>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. Action Nexus */}
        <div className="mt-auto pt-4 flex items-center gap-2.5 border-t border-white/[0.06]">
          <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApplyClick}
              className="flex-1 h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl px-4 text-xs font-bold text-white text-center flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-600/25 active:scale-[0.99] group/apply"
          >
            <span>Apply Now</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover/apply:translate-x-0.5 group-hover/apply:-translate-y-0.5" />
          </a>
          <a 
            href={job.companyWebsite || job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 w-11 shrink-0 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all border border-white/[0.06] flex items-center justify-center cursor-pointer active:scale-95"
            aria-label={`View ${job.companyName} company profile or external resources`}
            title={job.companyWebsite ? "Visit Company Website" : "Open Original Job Posting"}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </motion.article>
  );
});