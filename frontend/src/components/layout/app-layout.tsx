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
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarItemProps {
  icon: any;
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
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
        isActive 
          ? "bg-gradient-to-r from-violet-600/20 to-cyan-600/10 text-white shadow-[inset_0_0_12px_rgba(139,44,245,0.1)] border border-violet-500/20" 
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-violet-400" : "group-hover:text-violet-400"}`} />
      {!isCollapsed && (
        <span className="text-sm font-bold tracking-tight whitespace-nowrap">{label}</span>
      )}
      {isActive && !isCollapsed && (
        <motion.div 
          layoutId="active-pill"
          className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#a855f7]"
        />
      )}
    </motion.div>
  </Link>
);

import dynamic from "next/dynamic";
const AiChatbot = dynamic(() => import("@/components/ai/ai-chatbot"), { ssr: false });

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed));
    }
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
    { icon: Briefcase, label: "All Jobs", href: "/jobs" },
    { icon: Bookmark, label: "Saved Matches", href: "/saved" },
    { icon: User, label: "My Profile", href: "/profile" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-[#07091a] text-slate-200 selection:bg-violet-500/30">
      <AiChatbot />
      {/* Sidebar - Desktop */}
      <aside 
        className={`hidden lg:flex flex-col border-r border-white/5 bg-[#0a0c24]/50 backdrop-blur-3xl transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex h-20 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-black tracking-tighter text-white">
                Job<span className="text-violet-400">Finder</span>
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-4">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.href} 
              {...item} 
              isCollapsed={isCollapsed} 
              isActive={pathname === item.href} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className={`mb-4 flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 p-2 transition-all ${isCollapsed ? "justify-center px-0" : ""}`}>
            <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-black text-white shrink-0">
              {isCollapsed ? "M" : <User className="h-4 w-4" />}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-wider">Active Session</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-tighter">Online</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-slate-400 hover:bg-white/5 transition-all mb-2"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
            {!isCollapsed && <span className="text-xs font-bold">Collapse</span>}
          </button>

          <button 
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#07091a]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-6">
            {/* Wayfinding Breadcrumbs - Desktop & Mobile Context */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20 lg:hidden">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors hidden sm:block">Platform</Link>
                <span className="text-slate-700 hidden sm:block">/</span>
                <span className="text-violet-400">{pathname.replace("/", "") || "Hub"}</span>
              </nav>
            </div>

            <div className="flex-1 max-w-xl hidden lg:block">
              <div className="relative group">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? "text-violet-400" : "text-slate-500 group-focus-within:text-violet-400"}`} />
                <input 
                  id="global-search-input"
                  type="text" 
                  onFocus={() => setIsSearching(true)}
                  onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                  placeholder="Platform Command... (⌘K)" 
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500/30 focus:bg-white/[0.08] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-black text-slate-500">
                  ⌘K
                </div>

                {/* Command Palette Dropdown */}
                <AnimatePresence>
                  {isSearching && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute top-full left-0 right-0 mt-3 overflow-hidden rounded-[24px] border border-white/10 bg-[#0a0c24]/90 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
                    >
                      <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 mb-1">
                        Quick Actions
                      </div>
                      {[
                        { icon: LayoutDashboard, label: "Navigate to Hub", href: "/dashboard" },
                        { icon: Briefcase, label: "Explore All Jobs", href: "/jobs" },
                        { icon: Bookmark, label: "View Saved Matches", href: "/saved" },
                        { icon: User, label: "Update My Profile", href: "/profile" },
                        { icon: Sparkles, label: "Ask JobBot Assistant", action: () => window.dispatchEvent(new CustomEvent("trigger-ai-chat", { detail: { text: "", autoSend: false } })) },
                      ].map((cmd, i) => (
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
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-white/5 hover:text-white group/cmd"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 group-hover/cmd:bg-violet-500/20 group-hover/cmd:text-violet-400">
                            <cmd.icon className="h-4 w-4" />
                          </div>
                          {cmd.label}
                          <ArrowUpRight className="ml-auto h-3 w-3 opacity-0 -translate-x-2 group-hover/cmd:opacity-40 group-hover/cmd:translate-x-0 transition-all" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Neural Thinking Indicator - Responsive to Search State */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${
              isSearching ? "bg-violet-500/15 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]" : "bg-violet-500/5 border-violet-500/10"
            }`}>
              <div className={`h-1.5 w-1.5 rounded-full bg-violet-400 ${isSearching ? "animate-ping" : "animate-pulse"}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isSearching ? "text-violet-200" : "text-violet-300/80"}`}>
                {isSearching ? "System Listening" : "Neural Active"}
              </span>
            </div>

            <button className="relative p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-500 border-2 border-[#07091a]" />
            </button>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/20 border border-white/10 flex items-center justify-center">
              <User className="h-4 w-4 text-violet-300" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="mx-auto max-w-7xl px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
