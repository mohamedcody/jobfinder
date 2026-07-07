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
  Loader2,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { jobsService } from "@/lib/jobs/jobs-service";
import type { Job } from "@/lib/jobs/types";
import { getApiErrorMessage } from "@/lib/auth/api-error";

// Simple relative time formatter to avoid external dependencies
function getTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1d ago";
    return `${diffDays}d ago`;
  } catch {
    return "Recently";
  }
}

export default function DashboardPage() {
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const { fetchSavedJobs } = useSavedJobs();

  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

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
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Hero */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0c24] border border-white/5 p-8 sm:p-12 shadow-2xl group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-600/10 to-transparent pointer-events-none" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-8">
              <Sparkles className="h-3 w-3" />
              Quantum Analysis Ready
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
                  {isProfileLoading ? (
                    <span className="animate-pulse bg-white/10 text-transparent rounded-lg">Hello, User...</span>
                  ) : (
                    <>Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-white to-cyan-400">{displayName}</span>.</>
                  )}
                </h1>
                <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                  The market is active today. We identified <span className="text-white font-bold underline decoration-violet-500 decoration-2 underline-offset-4">{isJobsLoading ? "..." : recentJobs.length} new roles</span> that align with your current trajectory.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/jobs" className="btn-glow-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 group/btn shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  Explore Matches
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligence Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className={`rounded-[2rem] bg-[#0a0c24]/60 border ${stat.border} p-8 backdrop-blur-xl group hover:scale-[1.02] transition-all`}
            >
              <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-6`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-4xl font-black text-white mb-2 tracking-tighter">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main: Curated Roles */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-violet-600/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Curated Matches</h2>
              </div>
              <Link href="/jobs" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors border-b border-transparent hover:border-white">
                Global Search
              </Link>
            </div>

            <div className="grid gap-4">
              {isJobsLoading ? (
                // Loading Skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-3xl bg-white/5 border border-white/5 p-6 h-28 flex items-center gap-6" />
                ))
              ) : jobsError ? (
                // Error State
                <div className="rounded-3xl bg-[#0a0c24] border border-red-500/20 p-8 text-center space-y-4">
                  <AlertTriangle className="h-8 w-8 text-red-400 mx-auto" />
                  <p className="text-slate-400 text-sm">{jobsError}</p>
                  <button onClick={fetchDashboardData} className="text-xs font-bold text-violet-400 hover:text-violet-300 inline-flex items-center gap-2 uppercase tracking-widest">
                    <RefreshCw className="h-3 w-3" /> Retry
                  </button>
                </div>
              ) : recentJobs.length === 0 ? (
                // Empty State
                <div className="rounded-3xl bg-[#0a0c24] border border-white/5 p-12 text-center space-y-4">
                  <Search className="h-10 w-10 text-slate-600 mx-auto" />
                  <h3 className="text-lg font-bold text-white">No perfect matches right now</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">Try refining your profile skills or check back later as we scrape new roles hourly.</p>
                  <Link href="/profile" className="inline-block mt-4 text-xs font-black text-violet-400 hover:text-violet-300 uppercase tracking-widest">
                    Optimize Profile →
                  </Link>
                </div>
              ) : (
                // Real Data
                recentJobs.map((job) => {
                  const timeAgo = job.scrapedAt ? getTimeAgo(job.scrapedAt) : "Just now";
                  
                  return (
                    <div key={job.id} className="group relative overflow-hidden rounded-3xl bg-[#0a0c24] border border-white/5 p-6 hover:border-violet-500/30 transition-all">
                      <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-violet-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner overflow-hidden p-2">
                            {job.companyLogo ? (
                              <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-contain mix-blend-screen" />
                            ) : (
                              <Briefcase className="h-7 w-7 text-slate-500 group-hover:text-violet-400 transition-colors" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white tracking-tight leading-tight mb-2 max-w-md truncate" title={job.title}>
                              {job.title}
                            </h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate max-w-[250px]">
                              {job.companyName} <span className="mx-2 opacity-30">|</span> {job.location || "Remote"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-right hidden sm:block">
                            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20">
                              {job.employmentType || "Full Time"}
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-2">
                              <Clock className="h-3 w-3 text-slate-600" />
                              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{timeAgo}</span>
                            </div>
                          </div>
                          <Link href={`/jobs`} className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-violet-600 hover:text-white transition-all shadow-xl">
                            <ArrowUpRight className="h-6 w-6" />
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
          <div className="lg:col-span-4 space-y-8">
            {/* Checklist Section */}
            <section className="rounded-[2.5rem] bg-[#0a0c24] border border-white/5 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daily Trajectory</h3>
                <span className="text-[10px] font-black text-emerald-400">{completedTasks}/{tasks.length}</span>
              </div>
              
              <div className="space-y-4">
                {isProfileLoading || isStatsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-6 bg-white/5 rounded-lg w-full" />
                  ))
                ) : (
                  tasks.map((task) => (
                    <Link 
                      key={task.id} 
                      href={task.done ? "#" : task.href}
                      className="flex w-full items-center gap-4 group/task text-left"
                    >
                      <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.done ? "bg-emerald-500 border-emerald-500 text-[#07091a]" : "bg-white/5 border-white/10 group-hover/task:border-emerald-500/50"}`}>
                        {task.done && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <span className={`text-sm font-bold transition-all ${task.done ? "text-slate-600 line-through" : "text-slate-300 group-hover/task:text-white"}`}>
                        {task.label}
                      </span>
                    </Link>
                  ))
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                </div>
              </div>
            </section>

            {/* Neural Insights Card */}
            <section className="rounded-[2.5rem] bg-gradient-to-br from-cyan-600/10 via-indigo-600/5 to-transparent border border-white/5 p-8 relative group cursor-pointer hover:border-cyan-500/30 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-cyan-600/10 flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mb-3">Neural Insight</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Engineers with a <span className="text-cyan-400 font-bold">GitHub Portfolio</span> attached receive <span className="text-white font-bold underline">25% more</span> direct recruiter inquiries.
              </p>
              <Link href="/profile" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 group-hover:gap-4 transition-all">
                Optimize Profile <ChevronRight className="h-3 w-3" />
              </Link>
            </section>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
