"use client";

import { Briefcase, Calendar, MapPin, Search, Sparkles } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { DatePreset } from "@/lib/jobs/types";
import { motion } from "framer-motion";

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

export function JobSearchFilter({ value, onChange, onSearch, onClear, isLoading }: JobSearchFilterProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    onSearch(value);
  };

  const handleDatePresetClick = (preset: DatePreset) => {
    const next = { ...value, datePreset: preset };
    onChange(next);
    onSearch(next);
  };

  const handleEmploymentTypeClick = (type: string) => {
    const next = { ...value, empType: value.empType === type ? "" : type };
    onChange(next);
    onSearch(next);
  };

  const handleClear = () => {
    const next = createEmptyJobSearchState();
    onChange(next);
    onClear();
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSearch} className="relative flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1 group">
            <motion.div 
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 ${focusedField === "title" ? "text-cyan-400" : "text-slate-500"}`}
              animate={focusedField === "title" ? { y: ["-50%", "-65%", "-50%"] } : { y: "-50%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Search className="h-5 w-5" />
            </motion.div>
            <input
              type="text"
              value={value.title}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              placeholder="Job title or keywords..."
              aria-label="Search by job title or keywords"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 pl-12 pr-4 text-sm text-white shadow-inner placeholder:text-slate-500 transition-all focus:border-cyan-400/60 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-cyan-400/15"
            />
          </div>

          <div className="relative flex-1 group">
            <motion.div 
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-300 ${focusedField === "location" ? "text-cyan-400" : "text-slate-500"}`}
              animate={focusedField === "location" ? { y: ["-50%", "-65%", "-50%"] } : { y: "-50%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <MapPin className="h-5 w-5" />
            </motion.div>
            <input
              type="text"
              value={value.location}
              onFocus={() => setFocusedField("location")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => onChange({ ...value, location: e.target.value })}
              placeholder="Location or Remote..."
              aria-label="Filter jobs by location"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 pl-12 pr-4 text-sm text-white shadow-inner placeholder:text-slate-500 transition-all focus:border-cyan-400/60 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-cyan-400/15"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            aria-label="Apply job search filters"
            className="group/btn relative overflow-hidden flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-4 text-sm font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all disabled:opacity-50 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:scale-[1.02] active:scale-95 border border-white/10"
          >
            <motion.div 
              className="absolute top-0 -left-[100%] h-full w-[40%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
              animate={{ left: ["-100%", "250%"] }}
              transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 5 }}
            />
            {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white relative z-10" /> : <Sparkles className="h-5 w-5 relative z-10" />}
            <span className="relative z-10">Search</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-8 px-2 py-1.5 bg-slate-900/30 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["any", "24h", "week", "month"] as DatePreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleDatePresetClick(preset)}
                    aria-label={`Filter by posted date: ${preset === "any" ? "Anytime" : preset}`}
                    aria-pressed={value.datePreset === preset}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all border ${
                      value.datePreset === preset
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {preset === "any" ? "Anytime" : preset === "24h" ? "24h" : preset === "week" ? "Week" : "Month"}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden h-8 w-px bg-white/10 lg:block" />

            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <Briefcase className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex flex-wrap gap-2">
                {['Remote', 'Full-time', 'Contract'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleEmploymentTypeClick(type)}
                    aria-label={`Filter by employment type: ${type}`}
                    aria-pressed={value.empType === type}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all border ${
                      value.empType === type
                        ? "border-violet-500/50 bg-violet-500/10 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(value.title || value.location || value.datePreset !== "any" || value.empType) && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Reset all job filters"
              className="px-3 py-1.5 rounded-full bg-rose-500/10 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-500/20 border border-rose-500/20"
            >
              Reset Filters
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
