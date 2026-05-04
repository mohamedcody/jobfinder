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
import { Job } from "@/lib/jobs/types";
import { jobsService } from "@/lib/jobs/jobs-service";
import { formatRelativeTime } from "@/lib/jobs/time-utils";

interface JobCardProps {
  job: Job;
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative flex flex-col gap-6 overflow-hidden rounded-[2rem] bg-[#0a0c24] border border-white/5 p-6 hover:border-violet-500/30 transition-all duration-500 shadow-2xl hover:shadow-violet-600/5"
      role="article"
    >
      {/* 1. Identity Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-500">
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
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
                <Building2 className="h-7 w-7 text-slate-500" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </span>
              {job.employmentType && (
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  • {job.employmentType}
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-white group-hover:text-violet-400 transition-colors truncate tracking-tight">
              {job.title}
            </h3>
            <p className="text-sm font-bold text-slate-400 mt-1">{job.companyName}</p>
          </div>
        </div>

        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`p-3.5 rounded-2xl transition-all duration-300 border ${
            isSaved ? "bg-pink-500/10 border-pink-500/30 text-pink-500" : "bg-white/5 border-white/5 text-slate-600 hover:text-white"
          }`}
        >
          <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* 2. Metadata Context */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-600" />
          <span className="text-xs font-bold text-slate-300">{job.location || "Remote"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-slate-600" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {formatRelativeTime(job.scrapedAt)}
          </span>
        </div>
      </div>

      {/* 3. AI Intelligence Section */}
      <div className="space-y-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400 font-medium">
          {job.description || "Advanced role analytics available via JobBot platform."}
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={handleSummarize}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              showSummary 
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30" 
                : "bg-violet-600/10 text-violet-400 hover:bg-violet-600/20"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {summary ? (showSummary ? "Hide Insights" : "AI Insights") : "Generate Insights"}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSummary ? "rotate-180" : ""}`} />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/10 text-cyan-400 hover:bg-cyan-600/20 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Bot className="h-3.5 w-3.5" />
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
              <div className="mt-2 rounded-2xl bg-white/[0.02] border border-white/5 p-5 relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Sparkles className="h-12 w-12 text-violet-500" />
                </div>
                {isLoadingSummary ? (
                  <div className="space-y-3">
                    <div className="h-2 w-32 bg-white/10 rounded animate-pulse" />
                    <div className="h-2 w-full bg-white/5 rounded animate-pulse" />
                  </div>
                ) : (
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    &quot;{summary}&quot;
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Action Nexus */}
      <div className="mt-auto pt-6 flex items-center gap-3 border-t border-white/5">
        <a
          href={job.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative overflow-hidden flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-2xl py-4 px-6 text-xs font-black uppercase tracking-[0.2em] text-white text-center flex items-center justify-center gap-3 transition-all shadow-xl shadow-violet-600/20 group/apply"
        >
          Apply Now
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover/apply:translate-x-1 group-hover/apply:-translate-y-1" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/apply:translate-x-full transition-transform duration-1000" />
        </a>
        <button className="h-14 w-14 rounded-2xl bg-white/5 text-slate-500 hover:text-white transition-all border border-white/5 flex items-center justify-center">
          <ExternalLink className="h-5 w-5" />
        </button>
      </div>
    </motion.article>
  );
});
