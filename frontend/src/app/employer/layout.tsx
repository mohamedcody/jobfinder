import { ReactNode } from "react";
import { EmployerSidebar } from "@/components/employer/employer-sidebar";
import { motion } from "framer-motion";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] bg-[#050914] overflow-hidden text-slate-200">
      {/* Deep Dynamic Background Mesh for SaaS feel */}
      <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex w-full">
        <EmployerSidebar />
        
        <main className="flex-1 min-h-screen overflow-x-hidden custom-scrollbar relative px-6 py-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
