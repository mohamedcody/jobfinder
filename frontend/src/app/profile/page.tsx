"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { 
  User, 
  Mail, 
  MapPin, 
  Code2, 
  Github, 
  Globe, 
  Linkedin,
  Sparkles,
  Zap,
  Target,
  Award,
  History,
  TrendingUp,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";

const SKILLS = [
  { name: "React", level: "Expert", color: "bg-cyan-500/10 text-cyan-400" },
  { name: "TypeScript", level: "Advanced", color: "bg-blue-500/10 text-blue-400" },
  { name: "Node.js", level: "Advanced", color: "bg-emerald-500/10 text-emerald-400" },
  { name: "Spring Boot", level: "Intermediate", color: "bg-green-500/10 text-green-400" },
  { name: "PostgreSQL", level: "Intermediate", color: "bg-indigo-500/10 text-indigo-400" },
  { name: "Tailwind CSS", level: "Expert", color: "bg-cyan-500/10 text-cyan-400" },
  { name: "Docker", level: "Beginner", color: "bg-blue-400/10 text-blue-300" },
];

const MatchGauge = ({ score }: { score: number }) => (
  <div className="relative flex items-center justify-center h-48 w-48 mx-auto">
    {/* Background Circle */}
    <svg className="h-full w-full transform -rotate-90">
      <circle
        cx="96"
        cy="96"
        r="80"
        stroke="currentColor"
        strokeWidth="12"
        fill="transparent"
        className="text-white/5"
      />
      <motion.circle
        cx="96"
        cy="96"
        r="80"
        stroke="currentColor"
        strokeWidth="12"
        fill="transparent"
        strokeDasharray={502.6}
        initial={{ strokeDashoffset: 502.6 }}
        animate={{ strokeDashoffset: 502.6 - (502.6 * score) / 100 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="text-violet-500 drop-shadow-[0_0_8px_rgba(139,44,245,0.5)]"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <span className="text-4xl font-black text-white">{score}%</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Match Score</span>
    </div>
  </div>
);

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: User Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <section className="rounded-3xl bg-white/[0.03] border border-white/5 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-cyan-500" />
            
            <div className="relative mx-auto mb-6 h-32 w-32 rounded-3xl bg-gradient-to-br from-violet-600/30 to-cyan-600/20 p-1">
              <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-[#07091a] border border-white/10">
                <User className="h-16 w-16 text-violet-300" />
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg border-2 border-[#07091a]">
                <Zap className="h-4 w-4" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-white">Mohamed Saad</h1>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Full Stack Developer</p>
            
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <Mail className="h-4 w-4 text-violet-400" />
                saad@example.com
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <MapPin className="h-4 w-4 text-cyan-400" />
                Cairo, Egypt
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-violet-600/20 transition-all border border-white/5">
                <Github className="h-5 w-5" />
              </button>
              <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-blue-600/20 transition-all border border-white/5">
                <Linkedin className="h-5 w-5" />
              </button>
              <button className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-emerald-600/20 transition-all border border-white/5">
                <Globe className="h-5 w-5" />
              </button>
            </div>
          </section>

          {/* AI Match Gauge Section */}
          <section className="rounded-3xl bg-white/[0.03] border border-white/5 p-8 text-center">
            <div className="flex items-center gap-2 justify-center mb-6">
              <Brain className="h-4 w-4 text-violet-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">Market Readiness</h3>
            </div>
            <MatchGauge score={85} />
            <p className="mt-6 text-xs text-slate-400 leading-relaxed">
              You're in the top <span className="text-violet-400 font-bold">15%</span> of developers in your region based on current market tech-stacks.
            </p>
          </section>
        </div>

        {/* Right Column: Skills and Activity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Skills Section */}
          <section className="rounded-3xl bg-white/[0.03] border border-white/5 p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10">
                  <Code2 className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Tech Stack & Skills</h2>
              </div>
              <button className="text-xs font-black uppercase tracking-widest text-violet-400 hover:text-violet-300">Edit Skills</button>
            </div>

            <div className="flex flex-wrap gap-3">
              {SKILLS.map((skill) => (
                <div 
                  key={skill.name}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border border-white/5 ${skill.color}`}
                >
                  <span className="text-sm font-bold">{skill.name}</span>
                  <span className="h-1 w-1 rounded-full bg-current opacity-40" />
                  <span className="text-[10px] font-black uppercase opacity-60 tracking-wider">{skill.level}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Stats & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Jobs Matched", value: "128", icon: Target, color: "text-violet-400" },
              { label: "Applications", value: "12", icon: Zap, color: "text-cyan-400" },
              { label: "Interviews", value: "3", icon: Award, color: "text-emerald-400" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-3xl bg-white/[0.03] border border-white/5 p-6">
                <stat.icon className={`h-5 w-5 mb-4 ${stat.color}`} />
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Activity Timeline */}
          <section className="rounded-3xl bg-white/[0.03] border border-white/5 p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/10">
                <History className="h-5 w-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity</h2>
            </div>

            <div className="space-y-6">
              {[
                { event: "Applied to Senior React Dev", company: "Airtable", time: "2 hours ago", color: "bg-cyan-500" },
                { event: "Profile view by Recruiter", company: "Netflix", time: "Yesterday", color: "bg-violet-500" },
                { event: "Skill Badge: Spring Boot Mastery", company: "System Verified", time: "2 days ago", color: "bg-emerald-500" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 2 && <div className="absolute left-2 top-8 bottom-[-24px] w-px bg-white/10" />}
                  <div className={`h-4 w-4 rounded-full mt-1.5 shrink-0 border-4 border-[#07091a] ${item.color}`} />
                  <div>
                    <p className="text-sm font-bold text-white">{item.event}</p>
                    <p className="text-xs text-slate-400 mt-1">{item.company} • {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </AppLayout>
  );
}
