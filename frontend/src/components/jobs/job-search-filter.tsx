"use client";

import { Search, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

interface JobSearchFilterProps {
  onSearch: (title: string) => void;
  isLoading?: boolean;
  debounceMs?: number;
}

export function JobSearchFilter({ onSearch, isLoading, debounceMs = 400 }: JobSearchFilterProps) {
  const [searchTitle, setSearchTitle] = useState("");
  const skipNextDebounceRef = useRef(false);
  const isFirstDebounceRef = useRef(true);

  const triggerImmediateSearch = (value: string) => {
    skipNextDebounceRef.current = true;
    onSearch(value.trim());
  };

  useEffect(() => {
    if (isFirstDebounceRef.current) {
      isFirstDebounceRef.current = false;
      return;
    }

    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onSearch(searchTitle.trim());
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [debounceMs, onSearch, searchTitle]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    triggerImmediateSearch(searchTitle);
  };

  const handleClear = () => {
    setSearchTitle("");
    triggerImmediateSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="group relative flex-1">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#A020F0]/70 to-[#4B0082]/70 opacity-0 blur transition duration-300 group-focus-within:opacity-30" />
          
          <div className="relative flex items-center">
            <div className="absolute left-4 flex h-10 w-10 items-center justify-center">
              <Search className="h-5 w-5 text-[#D1D5DB] transition-colors group-focus-within:text-[#00FFFF]" />
            </div>

            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Search by job title, skills, or keywords..."
              aria-label="Search jobs by title, skills, or keywords"
              className="search-input-glass w-full rounded-2xl border border-white/20 bg-white/10 py-4 pl-14 pr-14 text-sm font-medium text-white shadow-[inset_0_-6px_16px_rgba(10,15,31,0.35)] backdrop-blur-md transition-all placeholder:text-[#D1D5DB] hover:border-cyan-300/50 focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
            />

            {searchTitle && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search input"
                className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[#D1D5DB] transition-all hover:border-cyan-300/50 hover:text-white active:scale-90"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          aria-label="Search jobs now"
          disabled={isLoading}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#A020F0] to-[#4B0082] px-8 py-4 text-sm font-bold text-white shadow-[0_0_15px_rgba(160,32,240,0.9)] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Searching...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Search Jobs
              </>
            )}
          </span>
        </button>
      </div>

      {!searchTitle && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-[#D1D5DB]">Popular:</span>
          {["React Developer", "Backend Engineer", "Product Manager", "UI/UX Designer"].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setSearchTitle(term);
                triggerImmediateSearch(term);
              }}
              aria-label={`Search for ${term}`}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md transition-all hover:border-cyan-300/60 hover:shadow-[0_0_10px_rgba(0,255,255,0.35)]"
              disabled={isLoading}
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
