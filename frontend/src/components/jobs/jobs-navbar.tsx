"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, LogOut, Sparkles, User, Zap } from "lucide-react";
import { useAuthSession } from "@/lib/auth/use-auth-session";

export function JobsNavbar() {
  const { isAuthenticated, logout } = useAuthSession();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/5 backdrop-blur-3xl">
      <div className="h-px w-full bg-gradient-to-r from-white/20 via-cyan-200/30 to-white/20" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/jobs" className="group flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#A020F0]/50 to-[#4B0082]/60 opacity-0 blur-lg transition-opacity group-hover:opacity-70" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[inset_0_-6px_16px_rgba(10,15,31,0.35)] transition-transform group-hover:scale-105">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  JobFinder <span className="text-white">PRO</span>
                </span>
                <div className="hidden rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white sm:block">
                  <span className="text-white">JobFinder </span>
                  <span className="bg-gradient-to-r from-[#A020F0] to-[#FF69B4] bg-clip-text text-transparent">P</span>
                  <span className="text-white">RO</span>
                </div>
              </div>
              <span className="hidden text-xs font-medium text-[#D1D5DB] sm:block">
                Find your dream role faster
              </span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Live Indicator (Desktop) */}
                <div className="live-session-pill hidden items-center gap-2 rounded-full bg-[#00FF00]/10 px-4 py-2 text-sm font-bold text-white lg:flex">
                  <div className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF00] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00FF00]" />
                  </div>
                  Live Session
                </div>

                {/* User Status */}
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-[inset_0_-6px_16px_rgba(10,15,31,0.35)]">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Active</span>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#EE82EE] bg-white/10 shadow-[0_0_12px_rgba(238,130,238,0.35)]">
                  <span className="text-xs font-bold text-white">MS</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  aria-label="Logout from current session"
                  className="group/logout inline-flex items-center gap-2 rounded-full border border-[#EE82EE]/40 bg-[#4B0082] px-4 py-2 text-sm font-bold text-white shadow-[0_0_12px_rgba(160,32,240,0.35)] transition-all hover:brightness-110 active:scale-95"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover/logout:translate-x-0.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link
                  href="/login"
                  aria-label="Go to login page"
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>

                {/* Register Button */}
                <Link
                  href="/register"
                  aria-label="Create a new account"
                  className="btn-primary inline-flex items-center gap-2 text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
