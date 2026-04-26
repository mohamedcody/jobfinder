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
  CheckCircle2,
  Bell,
  LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const STATS = [
  { label: "Active Applications", value: "12", icon: Zap, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-500/20" },
  { label: "New Jobs Today", value: "48", icon: Briefcase, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-500/20" },
  { label: "Market Readiness", value: "85%", icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-500/20" },
];

const FEATURED_JOBS = [
  { title: "Senior React Engineer", company: "Airtable", salary: "$140k - $180k", match: "98%", time: "2h ago", color: "from-violet-600/20 to-transparent" },
  { title: "Full Stack Developer", company: "Stripe", salary: "$130k - $170k", match: "95%", time: "5h ago", color: "from-cyan-600/20 to-transparent" },
  { title: "Product Designer", company: "Linear", salary: "$120k - $160k", match: "92%", time: "1d ago", color: "from-indigo-600/20 to-transparent" },
];

export default function DashboardPage() {
  const [tasks, setTasks] = useState([
    { id: 1, label: "Update Resume", done: true },
    { id: 2, label: "Apply to 3 Jobs", done: false },
    { id: 3, label: "Refine Tech Stack", done: true },
    { id: 4, label: "Check Messages", done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedTasks = tasks.filter(t => t.done).length;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Hero: Identity Banner */}
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
                  Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-white to-cyan-400">Saad</span>.
                </h1>
                <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                  The market is active today. We identified <span className="text-white font-bold underline decoration-violet-500 decoration-2 underline-offset-4">12 elite roles</span> that perfectly align with your engineering profile.
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
              {FEATURED_JOBS.map((job) => (
                <div key={job.title} className="group relative overflow-hidden rounded-3xl bg-[#0a0c24] border border-white/5 p-6 hover:border-violet-500/30 transition-all">
                  <div className={`absolute top-0 left-0 h-full w-1 bg-gradient-to-b ${job.color.replace('from-', 'from-').replace('to-', 'to-')}`} />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                        <Briefcase className="h-7 w-7 text-slate-500 group-hover:text-violet-400 transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white tracking-tight leading-none mb-2">{job.title}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{job.company} <span className="mx-2 opacity-30">|</span> {job.salary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20">
                          {job.match} Match
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <Clock className="h-3 w-3 text-slate-600" />
                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{job.time}</span>
                        </div>
                      </div>
                      <button className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-violet-600 hover:text-white transition-all shadow-xl">
                        <ArrowUpRight className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                {tasks.map((task) => (
                  <button 
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    className="flex w-full items-center gap-4 group/task text-left"
                  >
                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.done ? "bg-emerald-500 border-emerald-500 text-[#07091a]" : "bg-white/5 border-white/10 group-hover/task:border-emerald-500/50"}`}>
                      {task.done && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <span className={`text-sm font-bold transition-all ${task.done ? "text-slate-600 line-through" : "text-slate-300"}`}>{task.label}</span>
                  </button>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                </div>
              </div>
            </section>

            {/* Neural Insights Card */}
            <section className="rounded-[2.5rem] bg-gradient-to-br from-cyan-600/10 via-indigo-600/5 to-transparent border border-white/5 p-8 relative group cursor-pointer">
              <div className="h-12 w-12 rounded-2xl bg-cyan-600/10 flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mb-3">Neural Insight</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Engineers with a <span className="text-cyan-400 font-bold">GitHub Portfolio</span> attached receive <span className="text-white font-bold underline">25% more</span> direct recruiter inquiries.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 group-hover:gap-4 transition-all">
                Optimize Profile <ChevronRight className="h-3 w-3" />
              </div>
            </section>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
