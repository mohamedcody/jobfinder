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
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-2xl">
      {/* Gradient Top Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/jobs" className="group flex items-center gap-3">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 opacity-0 blur-lg transition-opacity group-hover:opacity-30" />
              
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-purple-500/30 transition-transform group-hover:scale-105">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  JobFinder
                </span>
                <div className="hidden rounded-md bg-gradient-to-r from-violet-500 to-purple-600 px-2 py-0.5 text-[10px] font-bold text-white sm:block">
                  PRO
                </div>
              </div>
              <span className="hidden text-xs font-medium text-slate-500 sm:block">
                Find your dream role faster
              </span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Live Indicator (Desktop) */}
                <div className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm lg:flex">
                  <div className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  Live Session
                </div>

                {/* User Status */}
                <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Active</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="group/logout inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-red-200 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 hover:shadow-md active:scale-95"
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
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>

                {/* Register Button */}
                <Link
                  href="/register"
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
