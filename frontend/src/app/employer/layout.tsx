import { ReactNode } from "react";
import { EmployerSidebar } from "@/components/employer/employer-sidebar";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] bg-[#050914] overflow-hidden text-slate-200">
      {/* Deep Dynamic Background Mesh for SaaS feel */}
      <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-[100vw]">
        <EmployerSidebar />
        
        <main className="flex-1 h-screen overflow-y-auto custom-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
}
