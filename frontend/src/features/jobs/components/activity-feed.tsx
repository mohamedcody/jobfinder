"use client";

import { Bell, CheckCircle, Eye, Star, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EVENTS = [
  {
    icon: Eye,
    color: "text-cyan-400",
    bg: "bg-cyan-500/12 border-cyan-500/20",
    glow: "shadow-[0_0_10px_rgba(34,211,238,0.25)]",
    title: "Profile Viewed",
    time: "2m ago",
    desc: "A recruiter from Google viewed your profile.",
    dot: "bg-cyan-400",
  },
  {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/12 border-emerald-500/20",
    glow: "shadow-[0_0_10px_rgba(16,185,129,0.25)]",
    title: "Application Seen",
    time: "1h ago",
    desc: "Your application for Senior Frontend Dev was reviewed.",
    dot: "bg-emerald-400",
  },
  {
    icon: Star,
    color: "text-yellow-400",
    bg: "bg-yellow-500/12 border-yellow-500/20",
    glow: "shadow-[0_0_10px_rgba(251,191,36,0.2)]",
    title: "Job Match Found",
    time: "3h ago",
    desc: "98% match: Staff Engineer at Meta — Remote.",
    dot: "bg-yellow-400",
  },
  {
    icon: Eye,
    color: "text-violet-400",
    bg: "bg-violet-500/12 border-violet-500/20",
    glow: "shadow-[0_0_10px_rgba(139,44,245,0.25)]",
    title: "Profile Viewed",
    time: "5h ago",
    desc: "A startup founder checked your GitHub portfolio.",
    dot: "bg-violet-400",
  },
];

export function ActivityFeed() {
  const [hasNewNotif, setHasNewNotif] = useState(true);

  return (
    <aside
      className="flex w-[85vw] sm:w-80 shrink-0 snap-center flex-col gap-5 p-5 h-[100dvh] sticky top-0 overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, rgb(7 9 26 / 92%), rgb(10 13 30 / 95%))",
        backdropFilter: "blur(20px) saturate(1.4)",
        borderLeft: "1px solid rgb(255 255 255 / 6%)",
        boxShadow: "inset 1px 0 0 rgb(255 255 255 / 4%), -8px 0 32px rgb(2 6 23 / 30%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white">Live Activity</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Real-time updates</p>
        </div>
        <button
          onClick={() => setHasNewNotif(false)}
          aria-label="View notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <Bell className="h-4 w-4" />
          <AnimatePresence>
            {hasNewNotif && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-400 text-[7px] font-black text-black shadow-[0_0_8px_rgba(34,211,238,0.7)]"
              >
                3
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Profile Strength */}
      <div
        className="rounded-xl border border-white/8 p-4"
        style={{ background: "linear-gradient(135deg, rgb(139 44 245 / 10%), rgb(34 211 238 / 6%))" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-black text-white">Profile Strength</h4>
          </div>
          <span className="text-xs font-black text-cyan-400">85%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "85%" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #8b2cf5, #22d3ee)", boxShadow: "0 0 8px rgba(34,211,238,0.5)" }}
          />
        </div>

        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
          You&apos;re in the{" "}
          <span className="font-bold text-cyan-400">top 15%</span> of candidates for React roles.
        </p>

        {/* Quick stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { label: "Views", value: "142", icon: Eye },
            { label: "Matches", value: "28", icon: Zap },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-white/6 bg-white/4 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <s.icon className="h-3 w-3 text-slate-500" />
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-base font-black text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Events feed */}
      <div>
        <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-slate-600">
          Recent Events
        </p>
        <div className="flex flex-col gap-2">
          {EVENTS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="group flex items-start gap-3 rounded-xl border border-transparent p-3 cursor-pointer transition-all hover:border-white/8 hover:bg-white/4"
            >
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${item.bg} ${item.glow}`}>
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                  <span className="shrink-0 text-[9px] text-slate-600 font-medium">{item.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
              <div className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${item.dot} opacity-80`} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Quick tip */}
      <div className="rounded-xl border border-yellow-500/15 bg-yellow-500/6 p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="h-3.5 w-3.5 text-yellow-400" />
          <p className="text-xs font-black text-yellow-300">Pro Tip</p>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Complete your skills section to get <span className="font-bold text-yellow-400">3× more</span> recruiter views.
        </p>
      </div>
    </aside>
  );
}
