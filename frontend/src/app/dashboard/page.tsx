"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { 
  Sparkles, 
  Search, 
  ArrowUpRight, 
  TrendingUp, 
  Briefcase, 
  Target, 
  Zap,
  Star,
  ChevronRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const STATS = [
  { label: "Active Applications", value: "12", icon: Zap, color: "text-violet-400", bg: "bg-violet-400/10" },
  { label: "New Jobs Today", value: "48", icon: Briefcase, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { label: "Match Score", value: "85%", icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/10" },
];

const FEATURED_JOBS = [
  { title: "Senior React Engineer", company: "Airtable", salary: "$140k - $180k", match: "98%", time: "2h ago" },
  { title: "Full Stack Developer", company: "Stripe", salary: "$130k - $170k", match: "95%", time: "5h ago" },
  { title: "Product Designer", company: "Linear", salary: "$120k - $160k", match: "92%", time: "1d ago" },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        
        {/* Welcome Hero */}
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent border border-white/10 p-8 sm:p-12">
          <div className="absolute top-0 right-0 h-64 w-64 bg-violet-500/20 blur-[100px] -z-10" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-black uppercase tracking-widest text-violet-300 mb-6">
              <Sparkles className="h-3 w-3" />
              Intelligence Ready
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-4">
              Good morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Mohamed</span>.
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              We found <span className="text-white font-bold">12 new roles</span> today that perfectly match your tech stack. Ready to apply?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/jobs" className="btn-glow-primary px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 group">
                Find New Jobs
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/saved" className="bg-white/5 border border-white/10 hover:bg-white/10 px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all">
                Track Applications
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="rounded-3xl bg-white/[0.03] border border-white/5 p-6 relative overflow-hidden group hover:bg-white/[0.06] transition-all"
            >
              <div className={`p-3 rounded-2xl w-fit mb-4 ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-3xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main: Featured Matches */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-violet-400" />
                <h2 className="text-xl font-bold text-white tracking-tight">Top Matches for You</h2>
              </div>
              <Link href="/jobs" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {FEATURED_JOBS.map((job) => (
                <div key={job.title} className="group relative rounded-2xl bg-white/[0.03] border border-white/5 p-6 hover:bg-white/[0.06] transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Briefcase className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white leading-tight">{job.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">{job.company} • {job.salary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                          {job.match} Match
                        </div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {job.time}
                        </p>
                      </div>
                      <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white transition-all">
                        <ArrowUpRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Daily Goal & Tips */}
          <div className="lg:col-span-4 space-y-6">
            <section className="rounded-3xl bg-white/[0.03] border border-white/5 p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="h-24 w-24 text-violet-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-200 mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Daily Checklist
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Update Resume", done: true },
                  { label: "Apply to 3 Jobs", done: false },
                  { label: "Refine Tech Stack", done: true },
                  { label: "Check Messages", done: false },
                ].map((task) => (
                  <div key={task.label} className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center ${task.done ? "bg-emerald-500 border-emerald-500 text-[#07091a]" : "bg-white/5 border-white/10"}`}>
                      {task.done && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    <span className={`text-sm font-bold ${task.done ? "text-slate-500 line-through" : "text-slate-300"}`}>{task.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-gradient-to-br from-cyan-600/20 to-transparent border border-white/5 p-6">
              <Zap className="h-6 w-6 text-cyan-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Pro Tip</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Users who add their GitHub profiles see a <span className="text-cyan-400 font-bold">25% increase</span> in recruiter response rates.
              </p>
              <button className="text-xs font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">
                Link GitHub Now →
              </button>
            </section>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
