"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  prelude?: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, description, children, prelude, footer }: AuthShellProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full overflow-hidden rounded-[2.5rem] p-8 sm:max-w-md sm:p-10 bg-slate-900/50 border border-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* Subtle Inner Glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-violet-500/10 rounded-full blur-[60px] pointer-events-none" />

      {prelude ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8 relative z-10"
        >
          {prelude}
        </motion.div>
      ) : null}

      <header className="mb-8 relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Secure access
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-black tracking-tight text-white"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-2 text-sm leading-relaxed text-slate-400"
        >
          {description}
        </motion.p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="relative pb-10 z-10"
      >
        {children}
      </motion.div>

      {footer ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-max z-10"
        >
          {footer}
        </motion.div>
      ) : null}
    </motion.section>
  );
}
