import {
  BadgeCheck,
  Clock3,
  MessageCircle,
  Phone,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AuthBrandMark } from "@/components/auth/auth-brand-mark";

const stats = [
  {
    label: "Active opportunities",
    value: "12K+",
    icon: TrendingUp,
    gradientClass: "metric-orange",
  },
  {
    label: "Positive experience",
    value: "98%",
    icon: BadgeCheck,
    gradientClass: "metric-sun",
  },
  {
    label: "Application tracking",
    value: "24/7",
    icon: Clock3,
    gradientClass: "metric-green",
  },
  {
    label: "Secure verification",
    value: "OTP",
    icon: ShieldCheck,
    gradientClass: "metric-purple",
  },
];

export function AuthShowcase() {
  return (
    <aside className="showcase-panel page-fade flex h-full flex-col rounded-3xl p-6 sm:p-8">
      <AuthBrandMark />

      <span className="status-chip mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Trusted by modern teams
      </span>

      <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-100 sm:text-4xl">
        Find better jobs,
        <br />
        faster than ever.
      </h2>

      <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
        Smart search, clean experience, and seamless authentication to help you move
        from signup to application in minutes.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`metric-chip metric-chip-gradient ${item.gradientClass}`}
            >
              <div className="metric-icon mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg shadow-sm">
                <Icon size={18} aria-hidden="true" />
              </div>
              <p className="text-xl font-bold text-white">{item.value}</p>
              <p className="mt-1 text-xs text-slate-100">{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-cyan-300/30 bg-slate-900/35 p-4">
        <p className="text-sm font-semibold text-slate-100">Need help getting started?</p>
        <a
          href="https://wa.me/201148415128"
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          className="secondary-button mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
        >
          <Phone size={16} aria-hidden="true" />
          <MessageCircle size={16} aria-hidden="true" />
          Contact Support on WhatsApp
        </a>
      </div>

      <p className="mt-8 text-center text-xs font-medium tracking-wide text-slate-400">
        Crafted with passion by Mohamed Saad Abdalfa
      </p>
    </aside>
  );
}
