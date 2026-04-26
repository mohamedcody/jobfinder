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
  Brain,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

const SKILLS = [
  { name: "React", level: "Expert", color: "from-cyan-500/20 to-blue-500/10", text: "text-cyan-400" },
  { name: "TypeScript", level: "Advanced", color: "from-blue-500/20 to-indigo-500/10", text: "text-blue-400" },
  { name: "Node.js", level: "Advanced", color: "from-emerald-500/20 to-teal-500/10", text: "text-emerald-400" },
  { name: "Spring Boot", level: "Intermediate", color: "from-green-500/20 to-emerald-500/10", text: "text-green-400" },
  { name: "PostgreSQL", level: "Intermediate", color: "from-indigo-500/20 to-blue-500/10", text: "text-indigo-400" },
  { name: "Tailwind CSS", level: "Expert", color: "from-cyan-500/20 to-sky-500/10", text: "text-cyan-400" },
  { name: "Docker", level: "Beginner", color: "from-blue-400/20 to-cyan-400/10", text: "text-blue-300" },
];

const MatchGauge = ({ score }: { score: number }) => (
  <div className="relative flex items-center justify-center h-40 w-40 mx-auto">
    <svg className="h-full w-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(139,44,245,0.2)]">
      <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
      <motion.circle
        cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent"
        strokeDasharray={439.8}
        initial={{ strokeDashoffset: 439.8 }}
        animate={{ strokeDashoffset: 439.8 - (439.8 * score) / 100 }}
        transition={{ duration: 1.5, ease: "circOut" }}
        className="text-violet-500"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-3xl font-black text-white">{score}%</span>
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Readiness</span>
    </div>
  </div>
);

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section: Identity Banner */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0c24] border border-white/5 p-8 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-violet-600/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative h-32 w-32 rounded-[2.2rem] bg-[#07091a] border border-white/10 flex items-center justify-center overflow-hidden">
                <User className="h-16 w-16 text-slate-400" />
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-transparent" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white border-4 border-[#0a0c24] shadow-xl">
                <Zap className="h-5 w-5" />
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <h1 className="text-4xl font-black text-white tracking-tight">Mohamed Saad</h1>
                <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-black uppercase tracking-widest text-violet-400">PRO Member</span>
              </div>
              <p className="text-lg font-medium text-slate-400 mb-6 flex items-center justify-center md:justify-start gap-2">
                Full Stack Developer <span className="h-1 w-1 rounded-full bg-slate-700" /> Cairo, Egypt
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <Mail className="h-4 w-4 text-violet-400" /> saad@example.com
                </div>
                <div className="flex gap-2">
                  {[Github, Linkedin, Globe].map((Icon, i) => (
                    <button key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-violet-500/40 transition-all">
                      <Icon className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all">
              Edit Profile <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Bento Grid: Core Data */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Skills Card - Takes more space */}
          <section className="lg:col-span-8 rounded-[2.5rem] bg-[#0a0c24]/60 border border-white/5 p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-violet-600/10 flex items-center justify-center">
                  <Code2 className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Technical Arsenal</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Core Tech Stack</p>
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-violet-500/40" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SKILLS.map((skill) => (
                <div key={skill.name} className={`relative group flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-gradient-to-br ${skill.color} transition-all hover:border-white/10 hover:translate-x-1`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${skill.text.replace('text', 'bg')} shadow-[0_0_8px_currentColor]`} />
                    <span className="text-sm font-bold text-white">{skill.name}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${skill.text} opacity-80`}>{skill.level}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Readiness Card - Compact & Visual */}
          <section className="lg:col-span-4 rounded-[2.5rem] bg-gradient-to-br from-violet-600/10 to-transparent border border-violet-500/10 p-8 text-center flex flex-col justify-center items-center">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-violet-300 mb-8">Market Readiness</h3>
            <MatchGauge score={85} />
            <div className="mt-8 space-y-2">
              <p className="text-sm font-bold text-white">Top 15% in Region</p>
              <p className="text-xs text-slate-500 leading-relaxed">Based on current tech-stack trends and recruitment patterns.</p>
            </div>
          </section>

          {/* Activity Mini-Bento */}
          <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Matches Found", value: "128", icon: Target, color: "text-violet-400" },
              { label: "Active Apps", value: "12", icon: Zap, color: "text-cyan-400" },
              { label: "Awarded Badges", value: "3", icon: Award, color: "text-emerald-400" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-3xl bg-white/[0.03] border border-white/5 p-6 flex items-center gap-6 hover:bg-white/[0.06] transition-all group">
                <div className={`h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
