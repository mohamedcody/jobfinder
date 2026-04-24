import Link from "next/link";
import { Briefcase, Building, Users, Settings, Sparkles, PieChart, PlusCircle } from "lucide-react";

export function EmployerSidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col gap-6 p-6 border-r border-white/10 bg-[#050914]/80 backdrop-blur-xl h-screen sticky top-0 z-50">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-cyan-600 shadow-[0_0_15px_rgba(160,32,240,0.4)]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-black text-white tracking-tight">JobFinder<span className="text-cyan-400">HR</span></span>
      </div>

      <nav className="flex flex-col gap-2">
        {[
          { icon: PieChart, label: "Dashboard", href: "/employer", active: false },
          { icon: Briefcase, label: "Active Jobs", href: "/employer/jobs", active: false },
          { icon: Users, label: "ATS / Candidates", href: "/employer/ats", active: true },
          { icon: Building, label: "Company Profile", href: "/employer/profile", active: false },
          { icon: Settings, label: "Settings", href: "/employer/settings", active: false },
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

      <div className="mt-auto">
        <button className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-white bg-linear-to-r from-violet-600 to-cyan-600 rounded-xl shadow-[0_0_15px_rgba(160,32,240,0.3)] hover:scale-[1.02] transition-transform">
          <PlusCircle className="h-5 w-5" /> Post a New Job
        </button>
      </div>
    </aside>
  );
}
