"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, LogOut, Sparkles, User, Zap } from "lucide-react";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { motion } from "framer-motion";

export function JobsNavbar() {
  const { isAuthenticated, logout } = useAuthSession();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50">
      {/* Top shimmer line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

      <div
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(135deg, rgb(7 9 26 / 85%), rgb(13 17 40 / 80%))",
          backdropFilter: "blur(20px) saturate(1.5)",
          borderBottom: "1px solid rgb(255 255 255 / 8%)",
          boxShadow: "0 8px 32px rgb(2 6 23 / 40%), inset 0 -1px 0 rgb(255 255 255 / 5%)",
        }}
      >
        {/* Logo */}
        <Link href="/jobs" className="group flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/60 to-cyan-600/40 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/20 border border-white/15 transition-transform group-hover:scale-105">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">
                Job
                <span
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #22d3ee)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Finder
                </span>
              </span>
              <span className="rounded-md border border-violet-500/30 bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-violet-300 shadow-[0_0_8px_rgba(139,44,245,0.3)]">
                PRO
              </span>
            </div>
            <p className="hidden text-[10px] font-medium text-slate-500 sm:block">
              Find your dream role faster
            </p>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {/* Live indicator */}
              <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 lg:flex">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                </div>
                <span className="text-xs font-bold text-emerald-400">Live Session</span>
              </div>

              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-600/30 to-cyan-600/20 shadow-[0_0_14px_rgba(139,44,245,0.25)]"
              >
                <User className="h-4 w-4 text-violet-300" />
              </motion.div>

              {/* Logout */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleLogout}
                aria-label="Logout"
                className="btn-ghost-premium inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-ghost-premium inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <Link
                href="/register"
                className="btn-glow-primary btn-shine inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
