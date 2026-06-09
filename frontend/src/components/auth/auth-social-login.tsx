const providers = [
  { label: "Google", provider: "google" },
  { label: "Apple", provider: "apple" },
  { label: "LinkedIn", provider: "linkedin" },
] as const;

const ProviderIcon = ({ provider }: { provider: (typeof providers)[number]["provider"] }) => {
  if (provider === "google") return <span className="text-xl font-black text-[#4285F4]">G</span>;
  if (provider === "apple") return <span className="text-base font-black text-slate-100">A</span>;
  return <span className="text-xs font-black tracking-tight text-white">in</span>;
};

export function AuthSocialLogin() {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/20" />
        <span className="text-[11px] font-black uppercase tracking-[0.42em] text-slate-300">OR</span>
        <div className="h-px flex-1 bg-white/20" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {providers.map(({ label, provider }) => (
          <button
            key={label}
            type="button"
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 ${
              provider === "linkedin"
                ? "border-sky-400/60 bg-sky-600 text-white hover:bg-sky-700"
                : "border-white/20 bg-slate-900/45 text-slate-100 hover:border-cyan-300/40 hover:bg-slate-800/55"
            }`}
          >
            <ProviderIcon provider={provider} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
