"use client";

import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import type { SavedJobResponse } from "@/lib/saved-jobs/types";
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
  Loader2,
  ExternalLink,
  Trash2,
  StickyNote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/jobs/time-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type KanbanStatus = "saved" | "applied" | "interview" | "offer";

interface KanbanJob extends SavedJobResponse {
  /** Local-only Kanban stage — not persisted to backend */
  kanbanStatus: KanbanStatus;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMN_CONFIG = [
  { id: "saved" as KanbanStatus,     title: "Saved",     icon: Bookmark,      color: "text-slate-400",   bg: "bg-slate-400/10",   border: "border-slate-400/20" },
  { id: "applied" as KanbanStatus,   title: "Applied",   icon: Send,          color: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "border-cyan-400/20" },
  { id: "interview" as KanbanStatus, title: "Interview", icon: MessageSquare, color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/20" },
  { id: "offer" as KanbanStatus,     title: "Offer",     icon: Trophy,        color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
];

// ─── Job Card Component ────────────────────────────────────────────────────────

const JobCard = ({
  job,
  onMove,
  onUnsave,
  isUnsaving,
}: {
  job: KanbanJob;
  onMove: (savedJobId: number, newStatus: KanbanStatus) => void;
  onUnsave: (jobId: number) => void;
  isUnsaving: boolean;
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-2xl bg-white/[0.03] border border-white/5 p-4 mb-3 hover:bg-white/[0.06] transition-all shadow-sm"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 shrink-0">
          {job.companyLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.companyLogo}
              alt={job.companyName ?? "Company"}
              className="h-6 w-6 object-contain rounded"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Building2 className="h-4 w-4 text-slate-400" />
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Unsave button */}
          <button
            onClick={() => onUnsave(job.jobId)}
            disabled={isUnsaving}
            aria-label="Remove from saved"
            title="Remove from saved"
            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUnsaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Move menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              aria-label="Move to stage"
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            <AnimatePresence>
              {showMoveMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl bg-slate-900 border border-white/10 p-1 shadow-2xl"
                >
                  {COLUMN_CONFIG.filter((c) => c.id !== job.kanbanStatus).map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        onMove(job.savedJobId, col.id);
                        setShowMoveMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
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
      </div>

      {/* Content */}
      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-violet-400 transition-colors leading-tight line-clamp-2">
        {job.jobTitle}
      </h4>
      {job.companyName && (
        <p className="text-xs text-slate-400 mb-3 truncate">{job.companyName}</p>
      )}

      {/* Notes preview */}
      {job.notes && (
        <div className="flex items-start gap-1.5 mb-3 rounded-lg bg-violet-500/5 border border-violet-500/10 px-2.5 py-2">
          <StickyNote className="h-3 w-3 text-violet-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{job.notes}</p>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
        {job.location && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[10px] text-violet-400 font-bold uppercase tracking-wider">
          <Calendar className="h-3 w-3 shrink-0" />
          {formatRelativeTime(job.savedAt)}
        </div>
      </div>

      {/* External link */}
      {job.jobUrl && (
        <a
          href={job.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-xl border border-white/5 bg-white/5 py-2 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Open job posting"
        >
          <ExternalLink className="h-3 w-3" />
          View Posting
        </a>
      )}
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SavedMatchesPage() {
  const { savedJobDetails, isSyncing, fetchSavedJobs, toggleSaveJob, isPending } = useSavedJobs();

  // Local Kanban state — maps savedJobId → KanbanStatus
  const [kanbanMap, setKanbanMap] = useState<Record<number, KanbanStatus>>({});

  // Fetch saved jobs from backend on mount
  useEffect(() => {
    const controller = new AbortController();
    void fetchSavedJobs(controller.signal);
    return () => controller.abort();
  }, [fetchSavedJobs]);

  // Build the Kanban job list by merging API data with local stage overrides
  const kanbanJobs = useMemo<KanbanJob[]>(() =>
    savedJobDetails.map((job) => ({
      ...job,
      kanbanStatus: kanbanMap[job.savedJobId] ?? "saved",
    })),
    [savedJobDetails, kanbanMap],
  );

  const handleMoveJob = (savedJobId: number, newStatus: KanbanStatus) => {
    setKanbanMap((prev) => ({ ...prev, [savedJobId]: newStatus }));
    const label = COLUMN_CONFIG.find((c) => c.id === newStatus)?.title ?? newStatus;
    toast.success(`Moved to ${label}`);
  };

  const handleUnsave = async (jobId: number) => {
    await toggleSaveJob(jobId);
  };

  // Stats for the header
  const totalSaved = kanbanJobs.filter((j) => j.kanbanStatus === "saved").length;
  const totalApplied = kanbanJobs.filter((j) => j.kanbanStatus === "applied").length;

  return (
    <AppLayout>
      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Saved Matches</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your job applications and move them through stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSyncing && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
              Syncing…
            </div>
          )}
          <button
            className="btn-glow-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold opacity-60 cursor-not-allowed"
            disabled
            aria-disabled
            title="Manual application tracking coming soon"
          >
            <Plus className="h-4 w-4" />
            Add Manual Application
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {COLUMN_CONFIG.map((col) => {
          const count = kanbanJobs.filter((j) => j.kanbanStatus === col.id).length;
          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.border} ${col.bg} p-4 flex flex-col gap-1`}
            >
              <div className="flex items-center gap-2">
                <col.icon className={`h-4 w-4 ${col.color}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {col.title}
                </span>
              </div>
              <p className={`text-2xl font-black ${col.color}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {!isSyncing && kanbanJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-24 px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
            <Bookmark className="h-7 w-7 text-violet-400" />
          </div>
          <h2 className="text-lg font-black text-white mb-2">No Saved Jobs Yet</h2>
          <p className="text-sm text-slate-400 max-w-sm">
            Click the heart icon on any job card to save it here and track your application
            progress.
          </p>
        </div>
      )}

      {/* ── Kanban Board ── */}
      {kanbanJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {COLUMN_CONFIG.map((col) => {
            const colJobs = kanbanJobs.filter((j) => j.kanbanStatus === col.id);
            return (
              <div key={col.id} className="flex flex-col min-h-[400px]">
                {/* Column header */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${col.bg}`}>
                      <col.icon className={`h-4 w-4 ${col.color}`} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                      {col.title}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                      {colJobs.length}
                    </span>
                  </div>
                </div>

                {/* Column body */}
                <div className="flex-1 rounded-2xl bg-white/[0.015] border border-white/5 p-2 min-h-[200px]">
                  <AnimatePresence>
                    {colJobs.map((job) => (
                      <JobCard
                        key={job.savedJobId}
                        job={job}
                        onMove={handleMoveJob}
                        onUnsave={handleUnsave}
                        isUnsaving={isPending(job.jobId)}
                      />
                    ))}
                  </AnimatePresence>

                  {colJobs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <div className="h-10 w-10 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center mb-3">
                        <Plus className="h-4 w-4 text-slate-600" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        {col.id === "saved" ? "Save a job to start" : `Move jobs here`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
