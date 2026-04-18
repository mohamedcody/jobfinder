"use client";

import { Briefcase, Calendar, MapPin, Search, Sparkles } from "lucide-react";
import { type FormEvent } from "react";
import type { DatePreset } from "@/lib/jobs/types";

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
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D1D5DB]" />
            <input
              type="text"
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              placeholder="Job title or keywords..."
              aria-label="Search by job title or keywords"
              className="field-input w-full rounded-2xl py-4 pl-12 pr-4 text-sm"
            />
          </div>

          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D1D5DB]" />
            <input
              type="text"
              value={value.location}
              onChange={(e) => onChange({ ...value, location: e.target.value })}
              placeholder="Location or Remote..."
              aria-label="Filter jobs by location"
              className="field-input w-full rounded-2xl py-4 pl-12 pr-4 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            aria-label="Apply job search filters"
            className="cta-button flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold text-white disabled:opacity-50"
          >
            {isLoading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Sparkles className="h-5 w-5" />}
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-8 px-1 py-1.5">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-[#D1D5DB]" />
              <div className="flex flex-wrap gap-2.5">
                {(["any", "24h", "week", "month"] as DatePreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleDatePresetClick(preset)}
                    aria-label={`Filter by posted date: ${preset === "any" ? "Anytime" : preset}`}
                    aria-pressed={value.datePreset === preset}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all border ${
                      value.datePreset === preset
                        ? "border-[#00FFFF] bg-[#00FFFF]/10 text-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                        : "border-white/10 bg-white/5 text-[#D1D5DB]"
                    }`}
                  >
                    {preset === "any" ? "Anytime" : preset === "24h" ? "24h" : preset === "week" ? "Week" : "Month"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-white/10 pl-5">
              <Briefcase className="h-4 w-4 text-[#D1D5DB]" />
              <div className="flex flex-wrap gap-2.5">
                {['Remote', 'Full-time', 'Contract'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleEmploymentTypeClick(type)}
                    aria-label={`Filter by employment type: ${type}`}
                    aria-pressed={value.empType === type}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all border ${
                      value.empType === type
                        ? "border-[#A020F0] bg-[#A020F0]/10 text-[#A020F0] shadow-[0_0_10px_rgba(160,32,240,0.2)]"
                        : "border-white/10 bg-white/5 text-[#D1D5DB]"
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
              className="px-2 py-1 text-sm font-bold text-red-400 transition-colors hover:text-red-300"
            >
              Reset All
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
