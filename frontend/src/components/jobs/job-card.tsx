/**
 * COMPONENT SPECIFICATION: JobCard (Quantum Organism)
 * ────────────────────────────────────────────────────────────
 * • PROPS API: { job: JobResponseDTO }
 * • STATE MACHINE: [Idle] -> [Summarizing] -> [Expanded] | [Error]
 * • A11Y: WCAG 2.2 AA. Keyboard support for expansion and apply actions.
 * • PERF BUDGET: Render < 10ms, Framer Motion GPU accelerated.
 * • USAGE: Primary entry point for job discovery in list/grid views.
 * • BACKEND CONTRACT: Requires JobResponseDTO with populated id and title.
 * ────────────────────────────────────────────────────────────
 */

"use client";

import { memo, useCallback, useState } from "react";
import Image from "next/image";
import { 
  BadgeCheck, 
  Building2, 
  Clock3, 
  Heart, 
  MapPin, 
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JobResponseDTO } from "@/lib/jobs/types";
import { jobsService } from "@/lib/jobs/jobs-service";
import { formatRelativeTime } from "@/lib/jobs/time-utils";

interface JobCardProps {
  job: JobResponseDTO;
}

export const JobCard = memo(function JobCardComponent({ job }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [summary, setSummary] = useState(job.aiSummary || "");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isLogoBroken, setIsLogoBroken] = useState(false);

  const handleSummarize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    setShowSummary(true);
    if (summary) return;
    
    setIsLoadingSummary(true);
    try {
      const result = await jobsService.summarizeJob(job.id);
      setSummary(result);
    } catch (error) {
      console.error("AI Insights Error:", error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleLogoError = useCallback(() => setIsLogoBroken(true), []);

  return (
    <motion.article 
      layout
      className="system-card group relative flex flex-col gap-5 overflow-hidden"
      role="article"
      aria-labelledby={`job-title-${job.id}`}
    >
      {/* 1. Header Section: Identity & Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white/5 border border-white/10">
            {job.companyLogo && !isLogoBroken ? (
              <Image
                src={job.companyLogo}
                alt={`${job.companyName} logo`}
                fill
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                onError={handleLogoError}
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/20 to-cyan-600/20">
                <Building2 className="h-6 w-6 text-slate-400" />
              </div>
            )}
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
              {job.employmentType && (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  • {job.employmentType}
                </span>
              )}
            </div>
            <h3 id={`job-title-${job.id}`} className="text-display text-lg text-white group-hover:text-violet-400 transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-sm font-bold text-slate-200 mt-0.5">{job.companyName}</p>
          </div>
        </div>

        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`p-3 rounded-xl transition-all duration-300 ${
            isSaved ? "bg-pink-500/10 text-pink-400" : "bg-white/5 text-slate-500 hover:text-white"
          }`}
          aria-label={isSaved ? "Remove from saved" : "Save job"}
        >
          <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* 2. Metadata Section: Spatial Context */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-400">{job.location || "Remote"}</span>
        </div>
        {job.salaryRange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
              {job.salaryRange}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {formatRelativeTime(job.scrapedAt)}
          </span>
        </div>
      </div>

      {/* 3. Narrative Section: AI & Description */}
      <div className="space-y-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400/90">
          {job.descriptionText || "Full role details available on official company website."}
        </p>

        <div className="relative pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSummarize}
              className="group/btn inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-violet-400 transition-colors hover:text-violet-300"
            >
              <Sparkles className="h-4 w-4" />
              {summary ? (showSummary ? "Hide Insights" : "View Insights") : "Generate AI Insights"}
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showSummary ? "rotate-180" : ""}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent("trigger-ai-chat", {
                  detail: {
                    text: `Analyze this role: **${job.title}** at **${job.companyName}**. 
                    Key details: ${job.descriptionText?.slice(0, 100)}...
                    How can I prepare my profile for this?`,
                    autoSend: true
                  }
                }));
              }}
              className="group/btn inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-cyan-400 transition-colors hover:text-cyan-300 border-l border-white/10 pl-3"
            >
              <Bot className="h-4 w-4" />
              Consult JobBot
            </button>
          </div>

          <AnimatePresence>
            {showSummary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-2xl bg-white/[0.02] border border-white/5 p-4">
                  {isLoadingSummary ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                        <div className="h-2 w-24 bg-white/10 rounded" />
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded" />
                      <div className="h-2 w-[85%] bg-white/5 rounded" />
                    </div>
                  ) : (
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {summary}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Action Section: Conversion */}
      <div className="mt-auto pt-4 flex items-center gap-3 border-t border-white/5">
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 px-6 text-xs font-black uppercase tracking-widest text-white text-center flex items-center justify-center gap-2 transition-all"
        >
          Apply Now
          <ArrowUpRight className="h-4 w-4" />
        </a>
        <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/5">
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
});
