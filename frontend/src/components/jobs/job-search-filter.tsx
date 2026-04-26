"use client";

import { Briefcase, Calendar, MapPin, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { DatePreset } from "@/lib/jobs/types";
import { motion, AnimatePresence } from "framer-motion";

export interface JobSearchFormState {
  title: string;
  location: string;
  datePreset: DatePreset;
  empType: string;
}

export const createEmptyJobSearchState = (): JobSearchFormState => ({
  title: "",
  location: "",
  datePreset: "any",
  empType: "",
});

interface JobSearchFilterProps {
  value: JobSearchFormState;
  onChange: (next: JobSearchFormState) => void;
  onSearch: (filters: JobSearchFormState) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export const getPostedAfterFromPreset = (preset: DatePreset): string | undefined => {
  if (preset === "any") return undefined;
  const date = new Date();
  if (preset === "24h") date.setDate(date.getDate() - 1);
  if (preset === "week") date.setDate(date.getDate() - 7);
  if (preset === "month") date.setMonth(date.getMonth() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "any", label: "Anytime" },
  { value: "24h", label: "24 Hours" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const EMP_TYPES = ["Remote", "Full-time", "Part-time", "Contract"];

export function JobSearchFilter({
  value,
  onChange,
  onSearch,
  onClear,
  isLoading,
}: JobSearchFilterProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(true);

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    onSearch(value);
  };

  const handleDatePreset = (preset: DatePreset) => {
    const next = { ...value, datePreset: preset };
    onChange(next);
    onSearch(next);
  };

  const handleEmpType = (type: string) => {
    const next = { ...value, empType: value.empType === type ? "" : type };
    onChange(next);
    onSearch(next);
  };

  const handleClear = () => {
    onChange(createEmptyJobSearchState());
    onClear();
  };

  const hasActiveFilters =
    value.title || value.location || value.datePreset !== "any" || value.empType;

  return (
    <div className="w-full space-y-4">
      {/* Main search row */}
      <form onSubmit={handleSearch}>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {/* Title input */}
          <div className="relative flex-1">
            <div
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 ${
                focusedField === "title" ? "text-cyan-400" : "text-slate-400"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={value.title}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              placeholder="Keywords..."
              aria-label="Search by job title or keywords"
              className="search-input-premium w-full rounded-xl py-3 pl-11 pr-4 text-sm"
            />
          </div>

          {/* Location input */}
          <div className="relative flex-1">
            <div
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 ${
                focusedField === "location" ? "text-cyan-400" : "text-slate-400"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={value.location}
              onFocus={() => setFocusedField("location")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => onChange({ ...value, location: e.target.value })}
              placeholder="Location..."
              aria-label="Filter jobs by location"
              className="search-input-premium w-full rounded-xl py-3 pl-11 pr-4 text-sm"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-glow-accent btn-shine flex items-center gap-2 rounded-xl px-5 py-3 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="font-bold">Search</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all border ${
                showAdvanced
                  ? "border-violet-500/40 bg-violet-500/12 text-violet-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
              title="Advanced Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-black/20 p-3.5 mt-1 border border-white/5">
              <div className="flex flex-wrap items-start gap-5">
                {/* Date filter */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Posted Date</span>
                  <div className="flex flex-wrap gap-1.5">
                    {DATE_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleDatePreset(preset.value)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          value.datePreset === preset.value 
                          ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.1)]" 
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden h-10 w-px self-center bg-white/5 lg:block" />

                {/* Type filter */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Job Type</span>
                  <div className="flex flex-wrap gap-1.5">
                    {EMP_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleEmpType(type)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          value.empType === type 
                          ? "bg-violet-500/20 text-violet-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]" 
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear all */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="ml-auto self-center text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
