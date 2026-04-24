import { ReactNode } from "react";
import { JobsSidebar } from "@/components/jobs/jobs-sidebar";
import { ActivityFeed } from "@/components/jobs/activity-feed";

export default function JobsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] bg-[#050914] overflow-hidden text-slate-200">
      {/* Deep Dynamic Background Mesh for SaaS feel */}
      <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-teal-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-[100vw] overflow-x-auto snap-x snap-mandatory custom-scrollbar">
        <JobsSidebar />
        
        <main className="w-[100vw] lg:w-auto lg:flex-1 h-[100dvh] overflow-y-auto custom-scrollbar relative shrink-0 snap-center">
          {children}
        </main>

        <ActivityFeed />
      </div>
    </div>
  );
}
