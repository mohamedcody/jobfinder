import {
  BadgeCheck,
  Clock3,
  MessageCircle,
  Phone,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AuthBrandMark } from "@/components/auth/auth-brand-mark";
import { motion } from "framer-motion";

const mobileStats = [
  { label: "Active opportunities", value: "12K+", icon: TrendingUp, color: "text-cyan-400" },
  { label: "Positive experience", value: "98%", icon: BadgeCheck, color: "text-violet-400" },
  { label: "Application tracking", value: "24/7", icon: Clock3, color: "text-blue-400" },
  { label: "Secure verification", value: "OTP", icon: ShieldCheck, color: "text-fuchsia-400" },
];

export function AuthMobileIntro() {
  return (
    <section className="relative w-full overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:hidden bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-xl">
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-cyan-500/15 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-violet-500/15 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10">
        <AuthBrandMark compact />

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold tracking-wide text-emerald-300 uppercase shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Trusted by modern teams
        </div>

        <h2 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight bg-gradient-to-br from-white via-cyan-50 to-slate-400 bg-clip-text text-transparent sm:text-4xl">
          Find better jobs,
          <br />
          faster than ever.
        </h2>

        <p className="mt-4 max-w-xl text-[0.925rem] leading-relaxed text-slate-400 font-light">
          Smart search, clean experience, and seamless authentication to help you move
          from signup to application in minutes.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
          {mobileStats.map((item, idx) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm overflow-hidden"
              >
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner ${item.color}`}>
                  <Icon size={18} aria-hidden="true" />
                </div>
                <p className="text-xl font-bold text-white">{item.value}</p>
                <p className="mt-1 text-[0.7rem] font-medium text-slate-400">{item.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 backdrop-blur-md relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />
          <p className="text-[0.8rem] font-semibold text-cyan-100 relative z-10">Need help getting started?</p>
          <a
            href="https://wa.me/201148415128"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-white/5 border border-white/10 text-white transition-all active:scale-[0.98] relative z-10 shadow-sm"
          >
            <Phone size={14} aria-hidden="true" className="text-cyan-300" />
            <MessageCircle size={14} aria-hidden="true" className="text-cyan-300" />
            Support on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
