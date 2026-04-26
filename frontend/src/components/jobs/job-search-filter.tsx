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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Title input */}
          <div className="relative flex-1 group">
            <div
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 ${
                focusedField === "title" ? "text-cyan-400 scale-110" : "text-slate-500"
              }`}
            >
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={value.title}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              placeholder="Job title, keywords, or company"
              className="w-full bg-[#0a0c24] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all"
            />
          </div>

          {/* Location input */}
          <div className="relative flex-1 group">
            <div
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 ${
                focusedField === "location" ? "text-violet-400 scale-110" : "text-slate-500"
              }`}
            >
              <MapPin className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={value.location}
              onFocus={() => setFocusedField("location")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => onChange({ ...value, location: e.target.value })}
              placeholder="City, country, or remote"
              className="w-full bg-[#0a0c24] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-600/20 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="uppercase tracking-widest">Search</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </motion.button>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all border ${
                showAdvanced
                  ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                  : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>

      {/* Advanced Filters: Premium Glassmorphism Container */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative overflow-hidden rounded-3xl bg-[#0a0c24]/80 border border-white/5 p-6 backdrop-blur-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative flex flex-col sm:flex-row flex-wrap items-start gap-8">
              {/* Date filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Posting Date</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DATE_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleDatePreset(preset.value)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all relative ${
                        value.datePreset === preset.value
                          ? "text-cyan-400"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {value.datePreset === preset.value && (
                        <motion.div layoutId="active-date" className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/20 rounded-xl" />
                      )}
                      <span className="relative z-10">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden sm:block h-12 w-px bg-white/5" />

              {/* Type filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3 w-3 text-slate-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Employment Type</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {EMP_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleEmpType(type)}
                      className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all relative ${
                        value.empType === type
                          ? "text-violet-400"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {value.empType === type && (
                        <motion.div layoutId="active-type" className="absolute inset-0 bg-violet-500/10 border border-violet-500/20 rounded-xl" />
                      )}
                      <span className="relative z-10">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear all */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="sm:ml-auto mt-2 sm:mt-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <X className="h-3 w-3" />
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
