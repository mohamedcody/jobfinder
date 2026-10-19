"use client";

import { Briefcase, Calendar, MapPin, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { type FormEvent, useState, useEffect } from "react";
import type { DatePreset } from "@/types/jobs.types";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  // Mistake prevention / easy dismissal via Escape key
  useEffect(() => {
    if (!showAdvanced) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAdvanced(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAdvanced]);

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
    const emptyState = createEmptyJobSearchState();
    onChange(emptyState);
    onClear();
  };

  const hasActiveFilters =
    value.title || value.location || value.datePreset !== "any" || value.empType;

  return (
    <div className="w-full space-y-3">
      {/* Main search row */}
      <form onSubmit={handleSearch}>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          {/* Title input */}
          <div className="relative flex-1 group">
            <div
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 ${
                focusedField === "title" ? "text-violet-400" : "text-slate-500"
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
              placeholder="Job title, keywords, or company..."
              className="w-full h-12 bg-[#0b0e22] border border-white/[0.08] rounded-xl pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
            />
          </div>

          {/* Location input */}
          <div className="relative flex-1 group">
            <div
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 ${
                focusedField === "location" ? "text-violet-400" : "text-slate-500"
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
              placeholder="City, country, or remote..."
              className="w-full h-12 bg-[#0b0e22] border border-white/[0.08] rounded-xl pl-10 pr-4 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              loadingText="Searching"
              variant="primary"
              className="h-12 flex-1 sm:flex-none px-6 text-xs font-bold uppercase tracking-wider gap-2 shadow-md shadow-violet-600/25"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Search</span>
            </Button>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                showAdvanced
                  ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                  : "bg-[#0b0e22] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
              title="Advanced Filters"
              aria-label="Toggle advanced filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {(value.datePreset !== "any" || Boolean(value.empType)) && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-[#0b0e22]" />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-slate-400">Filters:</span>
          {value.title && (
            <Badge
              variant="info"
              removable
              onRemove={() => {
                const next = { ...value, title: "" };
                onChange(next);
                onSearch(next);
              }}
            >
              Role: {value.title}
            </Badge>
          )}
          {value.location && (
            <Badge
              variant="primary"
              removable
              onRemove={() => {
                const next = { ...value, location: "" };
                onChange(next);
                onSearch(next);
              }}
            >
              Location: {value.location}
            </Badge>
          )}
          {value.datePreset !== "any" && (
            <Badge
              variant="info"
              removable
              onRemove={() => handleDatePreset("any")}
            >
              Date: {DATE_PRESETS.find((p) => p.value === value.datePreset)?.label}
            </Badge>
          )}
          {value.empType && (
            <Badge
              variant="primary"
              removable
              onRemove={() => handleEmpType(value.empType)}
            >
              Type: {value.empType}
            </Badge>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-slate-400 hover:text-white underline underline-offset-4 ml-1 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Advanced Filters Container */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="relative overflow-hidden rounded-2xl bg-[#0b0e22] border border-white/[0.08] p-5 shadow-lg shadow-black/20"
          >
            <div className="relative flex flex-col sm:flex-row flex-wrap items-start gap-6">
              {/* Date filter */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Posting Date</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DATE_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleDatePreset(preset.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                        value.datePreset === preset.value
                          ? "text-cyan-300 bg-cyan-500/15 border border-cyan-500/30"
                          : "text-slate-400 hover:text-slate-200 bg-white/[0.02] border border-white/[0.05]"
                      }`}
                    >
                      <span className="relative z-10">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden sm:block h-10 w-px bg-white/[0.06] self-center" />

              {/* Type filter */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Employment Type</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EMP_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleEmpType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                        value.empType === type
                          ? "text-violet-300 bg-violet-500/15 border border-violet-500/30"
                          : "text-slate-400 hover:text-slate-200 bg-white/[0.02] border border-white/[0.05]"
                      }`}
                    >
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
                  className="sm:ml-auto mt-2 sm:mt-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all border border-red-500/20"
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
