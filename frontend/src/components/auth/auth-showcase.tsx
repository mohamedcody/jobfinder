"use client";

import {
  BadgeCheck,
  Clock3,
  MessageCircle,
  Phone,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AuthBrandMark } from "@/components/auth/auth-brand-mark";
import { motion } from "framer-motion";

const stats = [
  {
    label: "Active opportunities",
    value: "12K+",
    icon: TrendingUp,
    color: "text-cyan-400",
    borderGlow: "group-hover:border-t-cyan-400/60",
  },
  {
    label: "Positive experience",
    value: "98%",
    icon: BadgeCheck,
    color: "text-violet-400",
    borderGlow: "group-hover:border-t-violet-400/60",
  },
  {
    label: "Application tracking",
    value: "24/7",
    icon: Clock3,
    color: "text-blue-400",
    borderGlow: "group-hover:border-t-blue-400/60",
  },
  {
    label: "Secure verification",
    value: "OTP",
    icon: ShieldCheck,
    color: "text-fuchsia-400",
    borderGlow: "group-hover:border-t-fuchsia-400/60",
  },
];

export function AuthShowcase() {
  return (
    <aside className="relative flex h-full flex-col rounded-[2.5rem] p-8 overflow-hidden bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl">
      {/* Background Glow inside showcase */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px] pointer-events-none" />

      <AuthBrandMark />

      <motion.span
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mt-8 inline-flex self-start items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Trusted by modern teams
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-5 text-4xl font-black leading-[1.1] tracking-tight bg-gradient-to-br from-white via-cyan-50 to-slate-400 bg-clip-text text-transparent sm:text-[2.75rem]"
      >
        Find better jobs,
        <br />
        faster than ever.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base font-light"
      >
        Smart search, clean experience, and seamless authentication to help you move
        from signup to application in minutes.
      </motion.p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5">
        {stats.map((item, idx) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className={`group relative rounded-[1.25rem] border-t-2 border-transparent border-l border-r border-b border-white/5 bg-white/[0.02] p-5 backdrop-blur-md transition-all duration-300 ${item.borderGlow} hover:bg-white/[0.04] hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] overflow-hidden`}
            >
              {/* Continuous Breathing Float */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: idx * 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner transition-colors group-hover:bg-white/10 ${item.color}`}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <p className="text-2xl font-extrabold text-white">{item.value}</p>
                <p className="mt-1 text-[0.8rem] font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{item.label}</p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
        className="mt-10 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-cyan-500/20 rounded-full blur-2xl" />
        <p className="text-sm font-semibold text-cyan-100 relative z-10">Need help getting started?</p>
        <a
          href="https://wa.me/201148415128"
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:scale-105 relative z-10 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <Phone size={16} aria-hidden="true" className="text-cyan-300" />
          <MessageCircle size={16} aria-hidden="true" className="text-cyan-300" />
          Contact Support on WhatsApp
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="mt-auto pt-6 flex justify-center"
      >
        <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-[0.65rem] font-medium tracking-wide text-slate-400 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
          Developed by <span className="ml-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300 font-extrabold">Mohamed Saad Abdallah</span>
        </p>
      </motion.div>
    </aside>
  );
}
