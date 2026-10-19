"use client";

import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Tabs } from "@/components/ui/tabs";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import type { SavedJobResponse } from "@/types/saved-jobs.types";
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
  Sparkles,
  Search,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatRelativeTime } from "@/utils/time-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type KanbanStatus = "saved" | "applied" | "interview" | "offer";

interface KanbanJob extends SavedJobResponse {
  /** Local-only Kanban stage */
  kanbanStatus: KanbanStatus;
}

const KANBAN_STORAGE_KEY = "jobfinder:kanban-stages";
const KANBAN_STAGE_EVENT = "jobfinder:kanban-stages-changed";

const readCachedKanban = (): Record<string | number, KanbanStatus> => {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(KANBAN_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

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
  onMove: (identifier: number, newStatus: KanbanStatus) => void;
  onUnsave: (job: KanbanJob) => void;
  isUnsaving: boolean;
}) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const nextAction = useMemo(() => {
    if (job.kanbanStatus === "saved") {
      return { status: "applied" as KanbanStatus, label: "Mark Applied →", color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20" };
    }
    if (job.kanbanStatus === "applied") {
      return { status: "interview" as KanbanStatus, label: "Interviewing →", color: "bg-violet-500/10 text-violet-300 border-violet-500/30 hover:bg-violet-500/20" };
    }
    if (job.kanbanStatus === "interview") {
      return { status: "offer" as KanbanStatus, label: "Got Offer 🎉", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20" };
    }
    return null;
  }, [job.kanbanStatus]);

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
            onClick={() => onUnsave(job)}
            disabled={isUnsaving}
            aria-label={`Remove ${job.jobTitle} from saved pipeline`}
            title="Remove from saved pipeline"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            <AnimatePresence>
              {showMoveMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl bg-[#0a0c24] border border-white/10 p-1 shadow-2xl"
                >
                  {COLUMN_CONFIG.filter((c) => c.id !== job.kanbanStatus).map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        onMove(job.jobId, col.id);
                        setShowMoveMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <col.icon className={`h-3.5 w-3.5 ${col.color}`} />
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
          <StickyNote className="h-3.5 w-3.5 text-violet-400 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{job.notes}</p>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
        {job.location && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-violet-400 font-bold uppercase tracking-wider">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          {formatRelativeTime(job.savedAt)}
        </div>
      </div>

      {/* Quick Action & External link */}
      <div className="mt-3 flex items-center gap-2">
        {nextAction && (
          <button
            type="button"
            onClick={() => onMove(job.jobId, nextAction.status)}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${nextAction.color}`}
          >
            {nextAction.label}
          </button>
        )}
        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/5 bg-white/5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all shrink-0"
            aria-label="Open job posting"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Posting</span>
          </a>
        )}
      </div>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SavedMatchesPage() {
  const { savedJobDetails, isSyncing, fetchSavedJobs, toggleSaveJob, isPending } = useSavedJobs();

  // Local & Persisted Kanban state — maps jobId/savedJobId → KanbanStatus
  const [kanbanMap, setKanbanMap] = useState<Record<string | number, KanbanStatus>>(() => readCachedKanban());
  const [searchFilter, setSearchFilter] = useState("");
  const [activeMobileStage, setActiveMobileStage] = useState<"all" | KanbanStatus>("all");

  // Sync with localStorage & custom events
  useEffect(() => {
    const handleStageEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Record<string | number, KanbanStatus>>;
      if (customEvent.detail) {
        setKanbanMap(customEvent.detail);
      }
    };
    window.addEventListener(KANBAN_STAGE_EVENT, handleStageEvent);
    return () => window.removeEventListener(KANBAN_STAGE_EVENT, handleStageEvent);
  }, []);

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
      kanbanStatus: kanbanMap[job.jobId] ?? kanbanMap[job.savedJobId] ?? "saved",
    })),
    [savedJobDetails, kanbanMap],
  );

  const filteredKanbanJobs = useMemo(() => {
    if (!searchFilter.trim()) return kanbanJobs;
    const q = searchFilter.toLowerCase();
    return kanbanJobs.filter(
      (j) =>
        j.jobTitle?.toLowerCase().includes(q) ||
        j.companyName?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q)
    );
  }, [kanbanJobs, searchFilter]);

  const handleMoveJob = (identifier: number, newStatus: KanbanStatus) => {
    setKanbanMap((prev) => {
      const next = { ...prev, [identifier]: newStatus };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent(KANBAN_STAGE_EVENT, { detail: next }));
      }
      return next;
    });
    const label = COLUMN_CONFIG.find((c) => c.id === newStatus)?.title ?? newStatus;
    toast.success(`Moved to ${label}`);
  };

  const handleUnsave = async (job: KanbanJob) => {
    const previousStage = job.kanbanStatus;
    await toggleSaveJob(job.jobId);
    toast.success(`Removed "${job.jobTitle}"`, {
      description: "You can undo this action to restore it to your pipeline.",
      action: {
        label: "Undo",
        onClick: () => {
          void toggleSaveJob(job.jobId);
          setKanbanMap((prev) => {
            const next = { ...prev, [job.jobId]: previousStage };
            if (typeof window !== "undefined") {
              window.localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(next));
              window.dispatchEvent(new CustomEvent(KANBAN_STAGE_EVENT, { detail: next }));
            }
            return next;
          });
        },
      },
      duration: 6000,
    });
  };

  const mobileStageTabs = useMemo(() => [
    { id: "all", label: "All Stages", count: kanbanJobs.length },
    ...COLUMN_CONFIG.map((col) => ({
      id: col.id,
      label: col.title,
      count: kanbanJobs.filter((j) => j.kanbanStatus === col.id).length,
      icon: <col.icon className={`h-3.5 w-3.5 ${col.color}`} />,
    })),
  ], [kanbanJobs]);

  return (
    <AppLayout>
      {/* ── Page Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Saved Matches & Pipeline</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Track your job applications and advance them through your personal career pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSyncing && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
              <span>Syncing…</span>
            </div>
          )}
          <button
            className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-400 opacity-60 cursor-not-allowed"
            disabled
            aria-disabled
            title="Manual application tracking coming soon"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Manual Application</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        {COLUMN_CONFIG.map((col) => {
          const count = kanbanJobs.filter((j) => j.kanbanStatus === col.id).length;
          return (
            <div
              key={col.id}
              className="rounded-2xl border border-white/[0.08] bg-[#0c0f24] p-4 flex flex-col gap-1 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {col.title}
                </span>
                <div className={`p-1.5 rounded-lg ${col.bg}`}>
                  <col.icon className={`h-3.5 w-3.5 ${col.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${col.color} tabular-nums`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* ── Search & Filter Bar ── */}
      {kanbanJobs.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter saved roles by title, company, or location..."
            className="w-full h-11 bg-[#0b0e22] border border-white/[0.08] rounded-xl pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
          />
        </div>
      )}

      {/* ── Empty State ── */}
      {!isSyncing && kanbanJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-[#0c0f24]/50 py-16 px-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
            <Bookmark className="h-6 w-6 text-violet-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1.5">No Saved Jobs Yet</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-5 leading-relaxed">
            Click the bookmark icon on any job card to save it here and track your application progress.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-md shadow-violet-600/25 transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Explore Opportunities</span>
          </Link>
        </div>
      )}

      {/* ── Mobile Stage Selector (Visible only on < md) ── */}
      {kanbanJobs.length > 0 && (
        <div className="md:hidden mb-4 -mx-4 px-4">
          <Tabs
            tabs={mobileStageTabs}
            activeId={activeMobileStage}
            onChange={(id) => setActiveMobileStage(id as KanbanStatus | "all")}
            variant="pills"
          />
        </div>
      )}

      {/* ── Kanban Board ── */}
      {kanbanJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMN_CONFIG.map((col) => {
            const colJobs = filteredKanbanJobs.filter((j) => j.kanbanStatus === col.id);
            const isVisibleOnMobile = activeMobileStage === "all" || activeMobileStage === col.id;
            return (
              <div
                key={col.id}
                className={`${isVisibleOnMobile ? "flex" : "hidden md:flex"} flex-col min-h-[380px]`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-md ${col.bg}`}>
                      <col.icon className={`h-3.5 w-3.5 ${col.color}`} />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {col.title}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-full tabular-nums">
                    {colJobs.length}
                  </span>
                </div>

                {/* Column body */}
                <div className="flex-1 rounded-2xl bg-[#090b1c]/80 border border-white/[0.06] p-2.5 min-h-[180px]">
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
                    <div className="flex flex-col items-center justify-center py-10 px-3 text-center">
                      <div className="h-8 w-8 rounded-full bg-white/[0.03] border border-dashed border-white/[0.08] flex items-center justify-center mb-2">
                        <Plus className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <p className="text-xs font-semibold text-slate-300">
                        {col.id === "saved"
                          ? "No saved roles"
                          : col.id === "applied"
                          ? "No applications yet"
                          : col.id === "interview"
                          ? "No active interviews"
                          : "No offers recorded"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-[190px] leading-relaxed">
                        {col.id === "saved"
                          ? "Bookmark roles from Explore or Dashboard to compare here."
                          : col.id === "applied"
                          ? "Click 'Apply Now' on any job card to auto-track here."
                          : col.id === "interview"
                          ? "Advance roles here when you receive interview invites."
                          : "Track and compare received job offers here."}
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
