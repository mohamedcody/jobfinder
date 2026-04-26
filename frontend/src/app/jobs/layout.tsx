import { ReactNode } from "react";
import { JobsSidebar } from "@/components/jobs/jobs-sidebar";
import { ActivityFeed } from "@/components/jobs/activity-feed";

export default function JobsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Background Mesh - Preserved for jobs context */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </>
  );
}
