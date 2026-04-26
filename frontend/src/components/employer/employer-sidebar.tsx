"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Briefcase, 
  Building, 
  Users, 
  Settings, 
  Sparkles, 
  PieChart, 
  PlusCircle,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function EmployerSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: PieChart, label: "Talent Hub", href: "/employer" },
    { icon: Briefcase, label: "Live Vacancies", href: "/employer/jobs" },
    { icon: Users, label: "Candidate Pool", href: "/employer/ats" },
    { icon: Building, label: "Brand Profile", href: "/employer/profile" },
    { icon: Settings, label: "HR Settings", href: "/employer/settings" },
  ];

  return (
    <aside 
      className={`hidden lg:flex flex-col border-r border-white/5 bg-[#0a0c24]/80 backdrop-blur-3xl transition-all duration-500 ease-in-out sticky top-0 h-screen z-50 ${isCollapsed ? "w-20" : "w-68"}`}
    >
      <div className="flex h-24 items-center px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-600/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-black tracking-tighter text-white">
              JobFinder<span className="text-violet-400">HR</span>
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all ${isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white shadow-[inset_0_0_20px_rgba(139,44,245,0.15)] border border-violet-500/20"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                  }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-violet-400" : "group-hover:text-violet-400"}`} />
                {!isCollapsed && (
                  <span className="text-sm font-black tracking-tight whitespace-nowrap">{item.label}</span>
                )}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="active-employer-pill"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_#a855f7]"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 space-y-4">
        {!isCollapsed && (
          <button className="group relative overflow-hidden w-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 shadow-xl shadow-violet-600/20 hover:scale-[1.02] transition-all">
            <PlusCircle className="h-4 w-4" />
            <span>Post Job</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        )}
        {isCollapsed && (
          <button className="h-12 w-12 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20 mx-auto">
            <PlusCircle className="h-6 w-6" />
          </button>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-slate-500 hover:bg-white/5 hover:text-white transition-all"
        >
          <ChevronLeft className={`h-5 w-5 transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""}`} />
          {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest">Collapse</span>}
        </button>

        <button className="w-full flex items-center gap-4 rounded-2xl px-4 py-3 text-slate-600 hover:bg-rose-500/10 hover:text-rose-400 transition-all">
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest">Exit Portal</span>}
        </button>
      </div>
    </aside>
  );
}
