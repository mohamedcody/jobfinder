import {
  BadgeCheck,
  Clock3,
  MessageCircle,
  Phone,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    label: "Active opportunities",
    value: "12K+",
    icon: TrendingUp,
  },
  {
    label: "Positive experience",
    value: "98%",
    icon: BadgeCheck,
  },
  {
    label: "Application tracking",
    value: "24/7",
    icon: Clock3,
  },
  {
    label: "Secure verification",
    value: "OTP",
    icon: ShieldCheck,
  },
];

export function AuthShowcase() {
  return (
    <aside className="showcase-panel page-fade flex h-full flex-col rounded-3xl p-6 sm:p-8">
      <span className="status-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Trusted by modern teams
      </span>

      <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
        Find better jobs,
        <br />
        faster than ever.
      </h2>

      <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
        Smart search, clean experience, and seamless authentication to help you move
        from signup to application in minutes.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="metric-chip"
            >
              <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                <Icon size={18} aria-hidden="true" />
              </div>
              <p className="text-xl font-bold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-600">{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-blue-100/80 bg-linear-to-r from-blue-50 to-indigo-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Need help getting started?</p>
        <a
          href="https://wa.me/201148415128"
          target="_blank"
          rel="noreferrer"
          className="secondary-button mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
        >
          <Phone size={16} aria-hidden="true" />
          <MessageCircle size={16} aria-hidden="true" />
          Contact Support on WhatsApp
        </a>
      </div>

      <p className="mt-8 text-center text-xs font-medium tracking-wide text-slate-400">
        Designed and developed by Mohamed Saad Abdalla
      </p>
    </aside>
  );
}
