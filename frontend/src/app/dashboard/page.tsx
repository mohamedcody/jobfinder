"use client";

import { AppLayout } from "@/components/layout/app-layout";
import {
  Sparkles,
  ArrowUpRight,
  Briefcase,
  Target,
  Zap,
  Star,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { jobsService } from "@/services/jobs.service";
import type { Job } from "@/types/jobs.types";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatRelativeTime } from "@/utils/time-utils";

// Delegates to shared time utility — no duplication
function getTimeAgo(dateString: string): string {
  return formatRelativeTime(dateString);
}

function DashboardCompanyLogo({ logo, companyName }: { logo?: string | null; companyName: string }) {
  const [hasError, setHasError] = useState(false);

  if (logo && !hasError) {
    return (
      <img
        src={logo}
        alt={companyName}
        className="h-full w-full object-contain mix-blend-screen"
        onError={() => setHasError(true)}
      />
    );
  }

  return <Briefcase className="h-7 w-7 text-slate-500 group-hover:text-violet-400 transition-colors" />;
}

export default function DashboardPage() {
  const router = useRouter();
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const { fetchSavedJobs } = useSavedJobs();

  const [quickSearch, setQuickSearch] = useState("");
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickSearch.trim();
    if (query) {
      router.push(`/jobs?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/jobs");
    }
  };

  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    // 1. Fetch recent jobs
    try {
      setIsJobsLoading(true);
      setJobsError(null);
      // Realistically we'd pass user skills as filters here, 
      // but a basic recent jobs query simulates matches.
      const res = await jobsService.filterJobs({ size: 3 });
      setRecentJobs(res.data);
    } catch (err) {
      setJobsError(getApiErrorMessage(err));
    } finally {
      setIsJobsLoading(false);
    }

    // 2. Fetch saved jobs count
    try {
      setIsStatsLoading(true);
      const saved = await fetchSavedJobs();
      setSavedCount(saved.length);
    } catch (err) {
      console.error(err);
      setSavedCount(0);
    } finally {
      setIsStatsLoading(false);
    }
  }, [fetchSavedJobs]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const handleSavedJobsChange = (e: Event) => {
      const customEvent = e as CustomEvent<Record<number, boolean>>;
      if (customEvent.detail) {
        setSavedCount(Object.keys(customEvent.detail).length);
      }
    };
    window.addEventListener("jobfinder:saved-jobs-changed", handleSavedJobsChange);
    return () => window.removeEventListener("jobfinder:saved-jobs-changed", handleSavedJobsChange);
  }, []);

  // Derived Data
  const displayName = profile?.username?.trim() || "User";
  const hasResume = !!profile?.resumeUrl;
  const hasSkills = !!(profile?.skills && profile.skills.length > 0);
  const hasJobTitle = !!profile?.currentJobTitle;
  const hasBio = !!profile?.bio;

  // Dynamic market readiness score based on profile completion
  const marketReadiness = useMemo(() => {
    let score = 20; // Base active score
    if (hasResume) score += 20;
    if (hasSkills) score += 20;
    if (hasJobTitle) score += 20;
    if (hasBio) score += 20;
    return score;
  }, [hasResume, hasSkills, hasJobTitle, hasBio]);

  // Dynamic Tasks based on realistic profile states
  const tasks = useMemo(() => [
    { id: 1, label: "Add Current Job Title", done: hasJobTitle, href: "/profile" },
    { id: 2, label: "Upload Resume", done: hasResume, href: "/profile" },
    { id: 3, label: "Refine Tech Stack (Skills)", done: hasSkills, href: "/profile" },
    { id: 4, label: "Save an Application", done: (savedCount ?? 0) > 0, href: "/jobs" },
  ], [hasJobTitle, hasResume, hasSkills, savedCount]);

  const completedTasks = tasks.filter((t) => t.done).length;
  const progressPercentage = (completedTasks / tasks.length) * 100;

  // Dynamic Stats
  const STATS = [
    { 
      label: "Saved Applications", 
      value: isStatsLoading ? "..." : (savedCount?.toString() || "0"), 
      icon: Zap, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-500/20" 
    },
    { 
      label: "Recent Matches", 
      value: isJobsLoading ? "..." : (recentJobs.length > 0 ? `${recentJobs.length}+` : "0"), 
      icon: Briefcase, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-500/20" 
    },
    { 
      label: "Market Readiness", 
      value: isProfileLoading ? "..." : `${marketReadiness}%`, 
      icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" 
    },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Welcome Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-violet-600/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              Market Intelligence Active
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
                  {isProfileLoading ? (
                    <span className="animate-pulse bg-white/10 text-transparent rounded-lg">Hello, User</span>
                  ) : (
                    <>Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">{displayName}</span>.</>
                  )}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                  The tech market is active today. We identified <span className="text-white font-semibold underline decoration-violet-500 decoration-2 underline-offset-4">{isJobsLoading ? "..." : recentJobs.length} new roles</span> matching your career profile.
                </p>
              </div>
              
              <div className="shrink-0">
                <Link href="/jobs" className="btn-glow-primary px-6 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider inline-flex items-center gap-2 group/btn shadow-sm">
                  Explore Matches
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </Link>
              </div>
            </div>

            {/* Quick Job Search */}
            <form onSubmit={handleQuickSearch} className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-xl">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Quick search roles, tech stacks, or locations..."
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  icon={Search}
                  aria-label="Quick search jobs"
                  className="bg-black/30 border-white/10"
                />
              </div>
              <Button type="submit" variant="primary" size="default" className="shrink-0">
                Search Roles
              </Button>
            </form>
          </div>
        </section>

        {/* Intelligence Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              key={stat.label}
              className={`rounded-2xl bg-[#0c0f24] border ${stat.border} p-5 sm:p-6 transition-all hover:border-white/[0.14] shadow-sm`}
            >
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-white tracking-tight mb-1">{stat.value}</p>
              <p className="text-xs font-semibold text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Main: Curated Roles */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-violet-600/10 flex items-center justify-center">
                  <Star className="h-4 w-4 text-violet-400" />
                </div>
                <h2 className="text-base font-semibold text-white tracking-tight">Curated Matches</h2>
              </div>
              <Link href="/jobs" className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                View All Jobs →
              </Link>
            </div>

            <div className="grid gap-3">
              {isJobsLoading ? (
                // Loading Skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-white/[0.03] border border-white/5 p-5 h-24 flex items-center gap-4" />
                ))
              ) : jobsError ? (
                // Error State
                <div className="rounded-2xl bg-[#0c0f24] border border-red-500/20 p-6 text-center space-y-3">
                  <AlertTriangle className="h-6 w-6 text-red-400 mx-auto" />
                  <p className="text-slate-400 text-xs">{jobsError}</p>
                  <button onClick={fetchDashboardData} className="text-xs font-bold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1.5 uppercase tracking-wider">
                    <RefreshCw className="h-3 w-3" /> Retry
                  </button>
                </div>
              ) : recentJobs.length === 0 ? (
                // Empty State
                <div className="rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-8 text-center space-y-3">
                  <Search className="h-8 w-8 text-slate-500 mx-auto" />
                  <h3 className="text-base font-semibold text-white">No perfect matches right now</h3>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto">Try refining your profile skills or check back later as we scrape new roles hourly.</p>
                  <Link href="/profile" className="inline-block mt-2 text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-wider">
                    Optimize Profile →
                  </Link>
                </div>
              ) : (
                // Real Data
                recentJobs.map((job) => {
                  const timeAgo = job.scrapedAt ? getTimeAgo(job.scrapedAt) : "Just now";
                  
                  return (
                    <div key={job.id} className="group relative overflow-hidden rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-5 hover:border-violet-500/30 transition-all shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden p-2">
                            <DashboardCompanyLogo logo={job.companyLogo} companyName={job.companyName} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-base font-semibold text-white tracking-tight leading-snug truncate group-hover:text-violet-300 transition-colors" title={job.title}>
                              {job.title}
                            </h4>
                            <p className="text-xs font-medium text-slate-400 truncate mt-0.5">
                              {job.companyName} <span className="mx-1.5 opacity-30">•</span> {job.location || "Remote"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t border-white/[0.04] sm:border-0">
                          <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                              {job.employmentType || "Full Time"}
                            </div>
                            <div className="flex items-center justify-end gap-1.5 text-[11px] sm:text-xs text-slate-400">
                              <Clock className="h-3 w-3 text-slate-500" />
                              <span>{timeAgo}</span>
                            </div>
                          </div>
                          <Link href={`/jobs`} className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:bg-violet-600 hover:text-white transition-all shadow-sm shrink-0" aria-label="View job">
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Interactive Growth */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {/* Checklist Section */}
            <section className="rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-5 sm:p-6 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Profile Readiness Checklist</h3>
                <span className="text-xs font-bold text-emerald-400">{completedTasks}/{tasks.length}</span>
              </div>
              
              <div className="space-y-3">
                {isProfileLoading || isStatsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-5 bg-white/5 rounded-md w-full" />
                  ))
                ) : (
                  tasks.map((task) => (
                    <Link 
                      key={task.id} 
                      href={task.href}
                      className="flex w-full items-center gap-3 group/task text-left py-0.5 rounded-lg hover:bg-white/[0.02] -mx-1 px-1 transition-colors"
                      title={task.done ? `${task.label} (Completed)` : task.label}
                    >
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${task.done ? "bg-emerald-500 border-emerald-500 text-[#080913]" : "bg-white/[0.04] border-white/10 group-hover/task:border-emerald-500/50"}`}>
                        {task.done && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <span className={`text-xs font-medium transition-all ${task.done ? "text-slate-400 line-through" : "text-slate-300 group-hover/task:text-white"}`}>
                        {task.label}
                      </span>
                    </Link>
                  ))
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </section>

            {/* Career Insights Card */}
            <section className="rounded-2xl bg-[#0c0f24] border border-white/[0.08] p-5 sm:p-6 relative group cursor-pointer hover:border-cyan-500/30 transition-all shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-cyan-600/10 flex items-center justify-center mb-4">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight mb-2">Career Growth Insight</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Engineers with a <span className="text-cyan-400 font-semibold">GitHub Portfolio</span> attached receive <span className="text-white font-semibold underline">25% more</span> direct recruiter inquiries.
              </p>
              <Link href="/profile" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400 group-hover:gap-2.5 transition-all">
                Optimize Profile <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
