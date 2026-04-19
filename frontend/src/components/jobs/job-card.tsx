"use client";

import Image from "next/image";
import { memo, useCallback, useMemo, useState } from "react";
import type { Job } from "@/lib/jobs/types";
import { ArrowUpRight, BadgeCheck, Briefcase, Building2, Clock3, Heart, MapPin, Sparkles, Loader2 } from "lucide-react";
import { normalizeExternalUrl } from "@/lib/security/url";
import { jobsService } from "@/lib/jobs/jobs-service";
import { motion, AnimatePresence } from "framer-motion";

interface JobCardProps {
  job: Job;
}

const formatDateLabel = (dateString: string) => {
  const parsed = new Date(dateString);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
};

function JobCardComponent({ job }: JobCardProps) {
  const [isLogoBroken, setIsLogoBroken] = useState(false);

  const safeJobLink = useMemo(() => normalizeExternalUrl(job.link), [job.link]);
  const safeCompanyWebsite = useMemo(() => normalizeExternalUrl(job.companyWebsite), [job.companyWebsite]);
  const safeCompanyLogo = useMemo(() => normalizeExternalUrl(job.companyLogo), [job.companyLogo]);
  const postedDateLabel = useMemo(() => formatDateLabel(job.scrapedAt), [job.scrapedAt]);
  const showCompanyLogo = Boolean(safeCompanyLogo) && !isLogoBroken;

  const handleLogoError = useCallback(() => {
    setIsLogoBroken(true);
  }, []);

  const [summary, setSummary] = useState(job.aiSummary);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleSummarize = async () => {
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
      console.error("Failed to summarize:", error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  return (
    <article className="group glass-panel relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(160,32,240,0.28)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#A020F0] via-[#6A0DAD] to-[#4B0082] opacity-90" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {showCompanyLogo ? (
          <Image
            src={safeCompanyLogo!}
            alt={job.companyName}
            width={64}
            height={64}
            unoptimized
            referrerPolicy="no-referrer"
            onError={handleLogoError}
            className="h-16 w-16 rounded-2xl border border-white/20 bg-white/10 object-contain p-2 shadow-[inset_0_-6px_16px_rgba(10,15,31,0.35)]"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[inset_0_-6px_16px_rgba(10,15,31,0.35)]">
            <Building2 className="h-6 w-6 text-[#D1D5DB]" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              <BadgeCheck className="h-3.5 w-3.5" />
              Featured role
            </span>
            {job.employmentType && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-[#D1D5DB]">
                <Briefcase className="h-3.5 w-3.5" />
                {job.employmentType}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-xl font-black tracking-tight text-white transition-colors group-hover:text-[#FFFFE0]">
            {job.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#D1D5DB]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-white">
              <Building2 className="h-4 w-4 text-[#FFFFE0]" />
              {job.companyName}
            </span>

            {job.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#D1D5DB]" />
                {job.location}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 text-[#D1D5DB]">
              <Clock3 className="h-4 w-4 text-[#D1D5DB]" />
              {postedDateLabel}
            </span>
          </div>

          {job.seniorityLevel && (
            <div className="mt-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              {job.seniorityLevel}
            </div>
          )}

          {job.description && (
            <div className="mt-4">
              <p className="line-clamp-3 text-sm leading-6 text-[#D1D5DB]">
                {job.description}
              </p>
              
              <button
                onClick={handleSummarize}
                className="mt-3 flex items-center gap-1.5 text-sm font-bold text-[#A020F0] transition-colors hover:text-[#b845ff]"
              >
                <Sparkles className="h-4 w-4" />
                {summary ? (showSummary ? "Hide AI Summary" : "Show AI Summary") : "Summarize with AI"}
              </button>

              <AnimatePresence>
                {showSummary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-2xl border border-[#A020F0]/30 bg-[#A020F0]/5 p-5 text-base text-[#E5E7EB] backdrop-blur-sm">
                      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#A020F0]">
                        <Sparkles className="h-4 w-4" />
                        AI GENERATED SUMMARY
                      </div>
                      {isLoadingSummary ? (
                        <div className="flex items-center gap-2 py-2 text-[#D1D5DB]">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Analyzing job description...
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-base max-w-none leading-relaxed">
                          {summary?.split('\n').map((line, i) => (
                            <p key={i} className="mb-2 last:mb-0 text-base">{line}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {safeJobLink ? (
              <a
                href={safeJobLink}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#A020F0] to-[#4B0082] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(160,32,240,0.9)] transition-all hover:brightness-110 active:scale-[0.98]"
              >
                View Job
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : (
              <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-[#D1D5DB]">
                View Job
                <ArrowUpRight className="h-4 w-4" />
              </span>
            )}

            <div className="flex items-center gap-3">
              {safeCompanyWebsite && (
                <a
                  href={safeCompanyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#D1D5DB] transition hover:text-white"
                >
                  Company Website
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              <button
                type="button"
                aria-label={`Save ${job.title} to favorites`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-[0_0_12px_rgba(160,32,240,0.35)] transition hover:text-[#FFFFE0]"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

const areEqual = (prevProps: JobCardProps, nextProps: JobCardProps) => {
  const prev = prevProps.job;
  const next = nextProps.job;

  return (
    prev.id === next.id &&
    prev.title === next.title &&
    prev.companyName === next.companyName &&
    prev.link === next.link &&
    prev.scrapedAt === next.scrapedAt &&
    prev.companyLogo === next.companyLogo &&
    prev.companyWebsite === next.companyWebsite &&
    prev.location === next.location &&
    prev.employmentType === next.employmentType &&
    prev.seniorityLevel === next.seniorityLevel &&
    prev.description === next.description &&
    prev.aiSummary === next.aiSummary
  );
};

export const JobCard = memo(JobCardComponent, areEqual);

