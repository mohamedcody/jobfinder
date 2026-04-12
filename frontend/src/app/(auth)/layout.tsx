import type { ReactNode } from "react";
import { AuthMobileIntro } from "@/components/auth/auth-mobile-intro";
import { AuthShowcase } from "@/components/auth/auth-showcase";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page-background bg-linear-to-br relative flex min-h-screen items-center justify-center from-blue-50 to-purple-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-stretch gap-7 lg:flex-row lg:gap-10">
        <div className="w-full lg:hidden">
          <AuthMobileIntro />
        </div>

        <div className="hidden w-full lg:block lg:flex-5">
          <AuthShowcase />
        </div>
        <div className="flex w-full items-center justify-center lg:flex-4">{children}</div>
      </div>
    </main>
  );
}

