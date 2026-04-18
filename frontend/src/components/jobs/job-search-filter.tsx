"use client";

import { Search, MapPin, Calendar, Sparkles, Briefcase } from "lucide-react";
import { useCallback, useState, type FormEvent } from "react";
import type { DatePreset, JobFilterParams } from "@/lib/jobs/types";

interface JobSearchFilterProps {
  onSearch: (filters: JobFilterParams) => void;
  isLoading?: boolean;
}

export function JobSearchFilter({ onSearch, isLoading }: JobSearchFilterProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("any");
  const [empType, setEmpType] = useState<string>("");

  const getSubtractedDate = (preset: DatePreset): string | undefined => {
    if (preset === "any") return undefined;
    const date = new Date();
    if (preset === "24h") date.setDate(date.getDate() - 1);
    if (preset === "week") date.setDate(date.getDate() - 7);
    if (preset === "month") date.setMonth(date.getMonth() - 1);
    // Keep date-only filters in local calendar format to avoid UTC day shifting.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const applyFilters = useCallback((next: { title: string; location: string; datePreset: DatePreset; empType: string }) => {
    onSearch({
      title: next.title.trim() || undefined,
      location: next.location.trim() || undefined,
      postedAfter: getSubtractedDate(next.datePreset),
      employmentType: next.empType || undefined,
    });
  }, [onSearch]);

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    applyFilters({ title, location, datePreset, empType });
  };

  const handleDatePresetClick = (preset: DatePreset) => {
    setDatePreset(preset);
    applyFilters({ title, location, datePreset: preset, empType });
  };

  const handleEmploymentTypeClick = (type: string) => {
    const nextEmpType = empType === type ? "" : type;
    setEmpType(nextEmpType);
    applyFilters({ title, location, datePreset, empType: nextEmpType });
  };

  const handleClear = () => {
    setTitle("");
    setLocation("");
    setDatePreset("any");
    setEmpType("");
    onSearch({});
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSearch} className="relative flex flex-col gap-5">
        {/* Main Inputs */}
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D1D5DB]" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job title or keywords..."
              aria-label="Search by job title or keywords"
              className="field-input w-full rounded-2xl py-4 pl-12 pr-4 text-sm"
            />
          </div>

          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#D1D5DB]" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-8 px-1 py-1.5">
          <div className="flex flex-wrap items-center gap-5">
            {/* Date Presets */}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-[#D1D5DB]" />
              <div className="flex flex-wrap gap-2.5">
                {(["any", "24h", "week", "month"] as DatePreset[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleDatePresetClick(p)}
                    aria-label={`Filter by posted date: ${p === "any" ? "Anytime" : p}`}
                    aria-pressed={datePreset === p}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all border ${
                      datePreset === p ? "border-[#00FFFF] bg-[#00FFFF]/10 text-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.2)]" : "border-white/10 bg-white/5 text-[#D1D5DB]"
                    }`}
                  >
                    {p === "any" ? "Anytime" : p === "24h" ? "24h" : p === "week" ? "Week" : "Month"}
                  </button>
                ))}
              </div>
            </div>

            {/* Employment Type Presets */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-5">
              <Briefcase className="h-4 w-4 text-[#D1D5DB]" />
              <div className="flex flex-wrap gap-2.5">
                {["Remote", "Full-time", "Contract"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleEmploymentTypeClick(t)}
                    aria-label={`Filter by employment type: ${t}`}
                    aria-pressed={empType === t}
                    className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all border ${
                      empType === t ? "border-[#A020F0] bg-[#A020F0]/10 text-[#A020F0] shadow-[0_0_10px_rgba(160,32,240,0.2)]" : "border-white/10 bg-white/5 text-[#D1D5DB]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(title || location || datePreset !== "any" || empType) && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Reset all job filters"
              className="px-2 py-1 text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              Reset All
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
