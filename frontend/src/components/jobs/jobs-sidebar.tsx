"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Briefcase,
  Home,
  LogOut,
  Settings,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { icon: Home, label: "Dashboard", href: "/jobs" },
  { icon: Briefcase, label: "All Jobs", href: "/jobs/search" },
  { icon: Bookmark, label: "Saved Matches", href: "/jobs/saved" },
  { icon: User, label: "My Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function JobsSidebar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuthSession();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className="flex w-[85vw] sm:w-64 shrink-0 snap-center flex-col gap-4 p-5 h-[100dvh] sticky top-0 overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, rgb(7 9 26 / 92%), rgb(10 13 30 / 95%))",
        backdropFilter: "blur(20px) saturate(1.4)",
        borderRight: "1px solid rgb(255 255 255 / 6%)",
        boxShadow: "inset -1px 0 0 rgb(255 255 255 / 4%), 8px 0 32px rgb(2 6 23 / 30%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-2 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-[0_0_18px_rgba(139,44,245,0.45)]">
          <Sparkles className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <span className="text-base font-black text-white tracking-tight">
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
          <span className="ml-1.5 rounded-md border border-violet-500/30 bg-violet-500/15 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-violet-300">
            PRO
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        <p className="mb-1 px-2 text-[9px] font-bold uppercase tracking-widest text-slate-600">
          Navigation
        </p>
        {NAV_ITEMS.map((item, i) => {
          const isActive =
            item.href === "/jobs"
              ? pathname === "/jobs"
              : pathname?.startsWith(item.href);

          return (
            <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-violet-300" : "text-slate-600"}`} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,44,245,0.8)]" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Profile quick card */}
      {isAuthenticated && (
        <div className="rounded-xl border border-white/8 bg-white/4 p-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/40 to-cyan-600/30 border border-violet-500/25">
              <User className="h-4 w-4 text-violet-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Active Session</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
                <p className="text-[9px] text-emerald-400 font-semibold">Online</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost-premium w-full flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      )}

      {/* Upgrade Card */}
      <div className="mt-auto relative overflow-hidden rounded-xl border border-violet-500/20 p-4"
        style={{ background: "linear-gradient(135deg, rgb(139 44 245 / 12%), rgb(34 211 238 / 6%))" }}
      >
        {/* Glow orb */}
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-violet-600/30 blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="mb-2 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            <h4 className="text-xs font-black text-white">Upgrade to PRO</h4>
          </div>
          <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
            Unlimited applications, AI resume critique &amp; priority matching.
          </p>
          <button className="btn-glow-primary btn-shine w-full rounded-lg py-2 text-xs font-bold">
            Upgrade Now ✦
          </button>
        </div>
      </div>
    </aside>
  );
}
