import Image from "next/image";
import type { Job } from "@/lib/jobs/types";
import { ArrowUpRight, BadgeCheck, Briefcase, Building2, Clock3, MapPin } from "lucide-react";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(37,99,235,0.14)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-80" />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {job.companyLogo ? (
          <Image
            src={job.companyLogo}
            alt={job.companyName}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 rounded-2xl border border-slate-200 bg-white object-contain p-2 shadow-sm"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            <Building2 className="h-6 w-6 text-slate-400" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Featured role
            </span>
            {job.employmentType && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <Briefcase className="h-3.5 w-3.5" />
                {job.employmentType}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-xl font-black tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
            {job.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <Building2 className="h-4 w-4 text-blue-600" />
              {job.companyName}
            </span>

            {job.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-slate-400" />
                {job.location}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <Clock3 className="h-4 w-4 text-slate-400" />
              {formatDate(job.scrapedAt)}
            </span>
          </div>

          {job.seniorityLevel && (
            <div className="mt-3 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              {job.seniorityLevel}
            </div>
          )}

          {job.descriptionText && (
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
              {job.descriptionText}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
            >
              View Job
              <ArrowUpRight className="h-4 w-4" />
            </a>

            {job.companyWebsite && (
              <a
                href={job.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
              >
                Company Website
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
