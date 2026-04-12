import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <section className="surface-card dashboard-panel page-fade w-full rounded-3xl p-6 sm:max-w-[540px] sm:p-8 lg:h-full">
      <header className="mb-7 sm:mb-8">
        <span className="status-chip mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold">
          Secure access
        </span>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
      </header>
      {children}
    </section>
  );
}
