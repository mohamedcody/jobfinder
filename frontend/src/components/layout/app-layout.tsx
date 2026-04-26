"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  User,
  Settings,
  ChevronLeft,
  Menu,
  Sparkles,
  Search,
  Bell,
  LogOut,
  ArrowUpRight,
  Command,
  Home
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, isCollapsed, isActive }: SidebarItemProps) => (
  <Link href={href}>
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all ${isActive
          ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-white shadow-[inset_0_0_20px_rgba(139,44,245,0.15)] border border-violet-500/20"
          : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
        }`}
    >
      <Icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-violet-400" : "group-hover:text-violet-400"}`} />
      {!isCollapsed && (
        <span className="text-sm font-black tracking-tight whitespace-nowrap">{label}</span>
      )}
      {isActive && !isCollapsed && (
        <motion.div
          layoutId="active-sidebar-pill"
          className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_#a855f7]"
        />
      )}
    </motion.div>
  </Link>
);

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

import dynamic from "next/dynamic";
const AiChatbot = dynamic(() => import("@/components/ai/ai-chatbot"), { ssr: false });

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) setIsCollapsed(saved === "true");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed, isMounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Briefcase, label: "Explore Jobs", href: "/jobs" },
    { icon: Bookmark, label: "Saved Matches", href: "/saved" },
    { icon: User, label: "My Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const COMMANDS = [
    { icon: LayoutDashboard, label: "Go to Dashboard", href: "/dashboard" },
    { icon: Briefcase, label: "Search All Jobs", href: "/jobs" },
    { icon: Bookmark, label: "View Saved", href: "/saved" },
    { icon: User, label: "Manage Profile", href: "/profile" },
    { icon: Sparkles, label: "Talk to AI", action: () => window.dispatchEvent(new CustomEvent("trigger-ai-chat", { detail: { text: "", autoSend: false } })) },
  ].filter(cmd => cmd.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-[#07091a] text-slate-200 selection:bg-violet-500/30">
      <AiChatbot />
      
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-white/5 bg-[#0a0c24]/80 backdrop-blur-3xl transition-all duration-500 ease-in-out ${isCollapsed ? "w-20" : "w-68"}`}
      >
        <div className="flex h-24 items-center px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-600/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-black tracking-tighter text-white">
                Job<span className="text-violet-400">Finder</span>
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              isCollapsed={isCollapsed}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-slate-500 hover:bg-white/5 hover:text-white transition-all"
          >
            <ChevronLeft className={`h-5 w-5 transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""}`} />
            {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest">Collapse</span>}
          </button>

          <button className="w-full flex items-center gap-4 rounded-2xl px-4 py-3 text-slate-600 hover:bg-rose-500/10 hover:text-rose-400 transition-all">
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Universal Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-[#07091a]/90 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-8 flex-1">
            {/* Mobile Brand Mark */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 lg:hidden shadow-lg shadow-violet-600/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>

            {/* Omni-Search System */}
            <div className="hidden md:block flex-1 max-w-2xl relative">
              <div className="relative group">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? "text-violet-400" : "text-slate-500"}`} />
                <input
                  id="global-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearching(true)}
                  onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                  placeholder="Type a command or search... (⌘K)"
                  className="w-full bg-[#0a0c24] border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  ⌘K
                </div>

                {/* Intelligent Dropdown */}
                <AnimatePresence>
                  {isSearching && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.98 }}
                      className="absolute top-full left-0 right-0 mt-4 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a0c24] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
                    >
                      <div className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 mb-2">
                        Platform Commands
                      </div>
                      <div className="max-height-[400px] overflow-y-auto space-y-1">
                        {COMMANDS.length > 0 ? COMMANDS.map((cmd, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (cmd.href) {
                                router.push(cmd.href);
                                setIsSearching(false);
                              } else {
                                cmd.action?.();
                              }
                            }}
                            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all group/cmd"
                          >
                            <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center group-hover/cmd:bg-violet-600/20 group-hover/cmd:text-violet-400 transition-colors">
                              <cmd.icon className="h-5 w-5" />
                            </div>
                            {cmd.label}
                            <ArrowUpRight className="ml-auto h-4 w-4 opacity-0 -translate-x-4 group-hover/cmd:opacity-40 group-hover/cmd:translate-x-0 transition-all" />
                          </button>
                        )) : (
                          <div className="px-4 py-8 text-center text-slate-600 text-sm italic">
                            No commands found for &quot;{searchQuery}&quot;
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-violet-600/5 border border-violet-500/10">
              <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_10px_#8b5cf6]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Neural Link Active</span>
            </div>

            <button className="relative h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 border-2 border-[#07091a]" />
            </button>
            
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/20 flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-violet-400" />
            </div>
          </div>
        </header>

        {/* Global Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-24 lg:pb-0">
          <div className="mx-auto max-w-7xl px-8 py-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.div>
          </div>
        </main>

        <MobileBottomNav items={menuItems} pathname={pathname} />
      </div>
    </div>
  );
}
