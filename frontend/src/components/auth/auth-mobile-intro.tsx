import {
  BadgeCheck,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import { AuthBrandMark } from "@/components/auth/auth-brand-mark";

export function AuthMobileIntro() {
  return (
    <section className="relative w-full overflow-hidden rounded-[2.5rem] p-6 lg:hidden bg-[#0a0c24] border border-white/5 shadow-2xl">
      {/* Decorative Glows */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-violet-600/20 rounded-full blur-[50px] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-[50px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <AuthBrandMark compact />
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[9px] font-black tracking-widest text-emerald-400 uppercase">
            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            Live Platform
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-black leading-tight text-white tracking-tight">
            Elevate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">career journey.</span>
          </h2>
          <p className="mt-2 text-xs font-medium text-slate-400 leading-relaxed max-w-[280px]">
            Join 12K+ professionals finding elite roles with JobFinder PRO.
          </p>
        </div>

        {/* Quick Compact Stats Bar */}
        <div className="mt-6 flex items-center gap-4 py-3 border-y border-white/5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <BadgeCheck className="h-4 w-4 text-violet-400" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">98% Success</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-700 shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">AI Insights</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-700 shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <MessageCircle className="h-4 w-4 text-fuchsia-400" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">24/7 Support</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-6 rounded-full border-2 border-[#0a0c24] bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                U{i}
              </div>
            ))}
          </div>
          <a
            href="https://wa.me/201148415128"
            className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors"
          >
            <Phone size={12} />
            Support
          </a>
        </div>
      </div>
    </section>
  );
}
