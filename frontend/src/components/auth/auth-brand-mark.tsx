import { Briefcase } from "lucide-react";

interface AuthBrandMarkProps {
  compact?: boolean;
}

export const AuthBrandMark = ({ compact = false }: AuthBrandMarkProps) => {
  return (
    <div className={`inline-flex items-center gap-3 ${compact ? "scale-95" : ""}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 via-fuchsia-600 to-sky-500 shadow-lg shadow-violet-500/30">
        <Briefcase className="h-6 w-6 text-white" aria-hidden="true" />
      </div>

      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-100">JobFinder</h2>
          <span className="rounded-full bg-linear-to-r from-fuchsia-500 to-rose-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-sm">
            PRO
          </span>
        </div>
      </div>
    </div>
  );
};

