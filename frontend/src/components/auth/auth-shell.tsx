import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  prelude?: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, description, children, prelude, footer }: AuthShellProps) {
  return (
    <section className="surface-card dashboard-panel page-fade relative w-full overflow-hidden rounded-3xl p-6 sm:max-w-140 sm:p-9 lg:min-h-190">
      {prelude ? <div className="mb-6">{prelude}</div> : null}

      <header className="mb-7 sm:mb-8">
        <span className="status-chip mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold">
          Secure access
        </span>
        <h1 className="text-3xl font-black tracking-tight text-slate-100">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">{description}</p>
      </header>

      <div className="relative pb-14">{children}</div>

      {footer ? <div className="absolute bottom-6 left-6">{footer}</div> : null}
    </section>
  );
}
