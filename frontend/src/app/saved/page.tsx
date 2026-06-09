"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { 
  Bookmark, 
  Send, 
  MessageSquare, 
  Trophy, 
  MoreHorizontal,
  Plus,
  MapPin,
  Building2,
  Calendar,
  Database,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface KanbanJob {
  id: string;
  title: string;
  company: string;
  location: string;
  status: "saved" | "applied" | "interview" | "offer";
  date: string;
}

const COLUMN_CONFIG = [
  { id: "saved", title: "Saved", icon: Bookmark, color: "text-slate-400", bg: "bg-slate-400/10" },
  { id: "applied", title: "Applied", icon: Send, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { id: "interview", title: "Interview", icon: MessageSquare, color: "text-violet-400", bg: "bg-violet-400/10" },
  { id: "offer", title: "Offer", icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-400/10" },
];

const EXPECTED_FIELDS = [
  "id",
  "title",
  "company",
  "location",
  "status",
  "appliedDate",
  "jobUrl",
  "notes",
];

const JobCard = ({ job, onMove }: { job: KanbanJob; onMove: (id: string, newStatus: KanbanJob["status"]) => void }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl bg-white/[0.03] border border-white/5 p-4 mb-3 hover:bg-white/[0.06] transition-all shadow-sm"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10">
          <Building2 className="h-4 w-4 text-slate-400" />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          <AnimatePresence>
            {showMoveMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 z-50 w-32 rounded-xl bg-slate-900 border border-white/10 p-1 shadow-2xl"
              >
                {COLUMN_CONFIG.filter(c => c.id !== job.status).map(col => (
                  <button
                    key={col.id}
                    onClick={() => {
                      onMove(job.id, col.id as KanbanJob["status"]);
                      setShowMoveMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <col.icon className={`h-3 w-3 ${col.color}`} />
                    Move to {col.title}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-violet-400 transition-colors leading-tight">
        {job.title}
      </h4>
      <p className="text-xs text-slate-400 mb-3">{job.company}</p>
      
      <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
          <MapPin className="h-3 w-3" />
          {job.location}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-violet-400 font-bold uppercase tracking-wider">
          <Calendar className="h-3 w-3" />
          {job.date}
        </div>
      </div>
    </motion.div>
  );
};

export default function SavedMatchesPage() {
  const [jobs, setJobs] = useState<KanbanJob[]>([]);
  const { savedJobs } = useSavedJobs();

  const savedIds = useMemo(() => {
    return Object.keys(savedJobs)
      .map((key) => Number(key))
      .filter((id) => Number.isFinite(id) && savedJobs[id]);
  }, [savedJobs]);

  const handleMoveJob = (id: string, newStatus: KanbanJob["status"]) => {
    setJobs((prev) => prev.map((job) => 
      job.id === id ? { ...job, status: newStatus } : job
    ));
    const statusLabel = COLUMN_CONFIG.find((col) => col.id === newStatus)?.title ?? newStatus;
    toast.success(`Moved to ${statusLabel}`);
  };

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Saved Matches</h1>
          <p className="text-slate-400 text-sm mt-1">Track your job applications and move them through stages.</p>
        </div>
        <button
          className="btn-glow-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold opacity-60 cursor-not-allowed"
          disabled
          aria-disabled
          title="Connect backend to enable manual applications"
        >
          <Plus className="h-4 w-4" />
          Add Manual Application
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-violet-400" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Data Source Status</h2>
              </div>
              <p className="text-sm text-slate-400">
                Backend is not connected yet, so this board shows no fake jobs. Once the API is ready, real saved jobs will appear here.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold text-amber-300">
              <ShieldCheck className="h-3 w-3" />
              Waiting for API
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-bold text-slate-300">Saved IDs:</span>
            {savedIds.length > 0 ? (
              savedIds.slice(0, 6).map((id) => (
                <span key={id} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                  #{id}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-500">No saved jobs yet</span>
            )}
            {savedIds.length > 6 && (
              <span className="text-slate-500">+{savedIds.length - 6} more</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Expected Data Shape</h2>
          </div>
          <p className="text-xs text-slate-400 mb-3">These fields will be filled from backend later.</p>
          <div className="flex flex-wrap gap-2">
            {EXPECTED_FIELDS.map((field) => (
              <span key={field} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                {field}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {COLUMN_CONFIG.map((col) => (
          <div key={col.id} className="flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${col.bg}`}>
                  <col.icon className={`h-4 w-4 ${col.color}`} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                  {col.title}
                </h3>
                <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                  {jobs.filter((j) => j.status === col.id).length}
                </span>
              </div>
            </div>

            <div className="flex-1 rounded-2xl bg-white/[0.015] border border-white/5 p-2 min-h-[200px]">
              {jobs
                .filter((j) => j.status === col.id)
                .map((job) => (
                  <JobCard key={job.id} job={job} onMove={handleMoveJob} />
                ))}
              
              {jobs.filter((j) => j.status === col.id).length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="h-10 w-10 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center mb-3">
                    <Plus className="h-4 w-4 text-slate-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No real data yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
