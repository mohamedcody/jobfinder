import Link from "next/link";
import { Home, Briefcase, Bookmark, User, Settings, Sparkles } from "lucide-react";

export function JobsSidebar() {
  return (
    <aside className="flex w-[85vw] sm:w-64 shrink-0 snap-center flex-col gap-6 p-6 border-r border-white/10 bg-[#050914]/80 backdrop-blur-xl h-[100dvh] sticky top-0 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-cyan-600 shadow-[0_0_15px_rgba(160,32,240,0.4)]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-black text-white tracking-tight">JobFinder<span className="text-cyan-400">PRO</span></span>
      </div>

      <nav className="flex flex-col gap-2">
        {[
          { icon: Home, label: "Dashboard", href: "/jobs", active: true },
          { icon: Briefcase, label: "All Jobs", href: "/jobs/search" },
          { icon: Bookmark, label: "Saved Matches", href: "/jobs/saved" },
          { icon: User, label: "My Profile", href: "/profile" },
          { icon: Settings, label: "Settings", href: "/settings" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
              item.active 
                ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-5 rounded-2xl glass-card bg-linear-to-b from-violet-900/40 to-transparent border border-violet-500/20">
        <h4 className="text-sm font-bold text-white mb-2">Upgrade to PRO</h4>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">Get unlimited applications & AI resume critique.</p>
        <button className="w-full py-2.5 text-xs font-bold text-white bg-linear-to-r from-violet-600 to-cyan-600 rounded-lg shadow-[0_0_15px_rgba(160,32,240,0.3)] hover:scale-[1.02] transition-transform">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
