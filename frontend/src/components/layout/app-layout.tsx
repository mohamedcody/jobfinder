"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/use-auth-session";
import { APP_CONSTANTS } from "@/constants";
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  User,
  FileText,
  Settings,
  ChevronLeft,
  Sparkles,
  Search,
  Bell,
  LogOut,
  ArrowUpRight,
  X,
  CheckCircle2,
  Users,
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
  <Link href={href} className="block">
    <div
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
        isActive
          ? "bg-white/[0.08] text-white font-medium border border-white/[0.08] shadow-xs"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-violet-400" : "text-slate-400 group-hover:text-slate-200"}`} />
      {!isCollapsed && (
        <span className="truncate">{label}</span>
      )}
      {isActive && !isCollapsed && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
      )}
    </div>
  </Link>
);

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

import dynamic from "next/dynamic";
const AiChatbot = dynamic(() => import("@/features/ai/components/ai-chatbot"), { ssr: false });

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(APP_CONSTANTS.SIDEBAR_COLLAPSED_KEY) === "true";
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthSession();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(APP_CONSTANTS.SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("global-search-input");
        input?.focus();
        setIsSearching(true);
      }
      if (e.key === "Escape") {
        setIsSearching(false);
        setShowNotifications(false);
        (document.activeElement as HTMLElement)?.blur();
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
    { icon: FileText, label: "CV Parser", href: "/profile/cv-upload" },
    { icon: Users, label: "Recruiter ATS", href: "/employer/ats" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const mobileMenuItems = [
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
    { icon: FileText, label: "Upload CV (AI Parse)", href: "/profile/cv-upload" },
    { icon: Users, label: "Open Recruiter ATS (Hire Talent)", href: "/employer/ats" },
    { icon: Sparkles, label: "Talk to AI", action: () => window.dispatchEvent(new CustomEvent("trigger-ai-chat", { detail: { text: "", autoSend: false } })) },
  ].filter(cmd => cmd.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-[#080913] text-slate-200 selection:bg-violet-500/30">
      <AiChatbot />
      
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-white/[0.07] bg-[#0b0d1e]/90 backdrop-blur-xl transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex h-16 items-center px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-600/20 shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                JobFinder <span className="text-[10px] uppercase font-bold tracking-widest bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded">PRO</span>
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              isCollapsed={isCollapsed}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>

          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Universal Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/[0.07] bg-[#080913]/85 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3 sm:gap-6 flex-1">
            {/* Mobile Brand Mark & Search Trigger */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-600/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white"
                aria-label="Open mobile search"
              >
                <Search className="h-3.5 w-3.5 text-violet-400" />
                <span>Search (⌘K)</span>
              </button>
            </div>

            {/* Omni-Search System */}
            <div className="hidden md:block flex-1 max-w-xl relative">
              <div className="relative group">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? "text-violet-400" : "text-slate-400"}`} />
                <input
                  id="global-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearching(true)}
                  onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && COMMANDS.length > 0) {
                      e.preventDefault();
                      const firstCmd = COMMANDS[0];
                      if (firstCmd.href) {
                        router.push(firstCmd.href);
                        setIsSearching(false);
                      } else {
                        firstCmd.action?.();
                        setIsSearching(false);
                      }
                    }
                    if (e.key === "Escape") {
                      setIsSearching(false);
                      (document.activeElement as HTMLElement)?.blur();
                    }
                  }}
                  placeholder="Type a command or search... (⌘K)"
                  aria-label="Global command and search input"
                  className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] rounded-xl py-2 pl-10 pr-12 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-slate-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  ⌘K
                </div>

                {/* Intelligent Dropdown */}
                <AnimatePresence>
                  {isSearching && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f24] p-2 shadow-2xl backdrop-blur-2xl z-50"
                    >
                      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 mb-1">
                        Platform Commands
                      </div>
                      <div className="max-h-[340px] overflow-y-auto space-y-1 custom-scrollbar">
                        {COMMANDS.length > 0 ? COMMANDS.map((cmd, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (cmd.href) {
                                router.push(cmd.href);
                                setIsSearching(false);
                              } else {
                                cmd.action?.();
                              }
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white transition-all group/cmd text-left cursor-pointer"
                          >
                            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/cmd:bg-violet-600/20 group-hover/cmd:text-violet-400 transition-colors">
                              <cmd.icon className="h-4 w-4" />
                            </div>
                            {cmd.label}
                            <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover/cmd:opacity-60 group-hover/cmd:translate-x-0 transition-all" />
                          </button>
                        )) : (
                          <div className="px-4 py-6 text-center text-slate-400 text-sm italic">
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

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-violet-600/5 border border-violet-500/10">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">AI Ready</span>
            </div>

            {/* Interactive Notifications Button & Popover */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer"
                aria-label="Toggle notifications"
                aria-expanded={showNotifications}
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-emerald-400 border border-[#07091a]" aria-hidden="true" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#0a0c24] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-violet-400" />
                        <h4 className="text-sm font-bold text-white">Notifications</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNotifications(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        aria-label="Close notifications"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="py-3 space-y-3">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-slate-200">Daily Digest Active</p>
                          <p className="text-slate-400 mt-0.5 leading-relaxed">
                            Matched opportunities are prepared daily according to your threshold.
                          </p>
                          <Link
                            href="/settings"
                            onClick={() => setShowNotifications(false)}
                            className="inline-block mt-2 text-violet-400 hover:text-violet-300 font-semibold text-xs"
                          >
                            Manage Alert Preferences →
                          </Link>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="h-4 w-4 text-cyan-400" />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-slate-200">AI Job Indexer Online</p>
                          <p className="text-slate-400 mt-0.5 leading-relaxed">
                            Latest roles verified across top companies.
                          </p>
                          <Link
                            href="/jobs"
                            onClick={() => setShowNotifications(false)}
                            className="inline-block mt-2 text-cyan-400 hover:text-cyan-300 font-semibold text-xs"
                          >
                            Explore Fresh Roles →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Link 
              href="/profile" 
              className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-violet-500/20 flex items-center justify-center shadow-lg hover:border-violet-400/40 transition-all" 
              title="My Profile"
              aria-label="Navigate to your profile"
            >
              <User className="h-5 w-5 text-violet-400" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* Mobile Search & Command Modal */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#07091a]/95 backdrop-blur-xl p-4 flex flex-col md:hidden"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <Search className="h-5 w-5 text-violet-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or page..."
                  className="w-full bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none"
                  aria-label="Search and command input"
                />
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-2 custom-scrollbar">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
                  Commands & Destinations
                </p>
                {COMMANDS.length > 0 ? (
                  COMMANDS.map((cmd, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (cmd.href) {
                          router.push(cmd.href);
                          setIsMobileSearchOpen(false);
                        } else {
                          cmd.action?.();
                          setIsMobileSearchOpen(false);
                        }
                      }}
                      className="flex w-full items-center gap-4 rounded-xl p-3 text-sm font-semibold text-slate-200 hover:bg-white/5 hover:text-white transition-all text-left"
                    >
                      <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-violet-400">
                        <cmd.icon className="h-5 w-5" />
                      </div>
                      <span className="flex-1">{cmd.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-slate-500" />
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 px-2 italic">
                    No results found for &quot;{searchQuery}&quot;
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>

        <MobileBottomNav items={mobileMenuItems} />
      </div>
    </div>
  );
}
