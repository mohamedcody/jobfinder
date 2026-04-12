"use client";

import { Search, Sparkles, X } from "lucide-react";
import { useState, type FormEvent } from "react";

interface JobSearchFilterProps {
  onSearch: (title: string) => void;
  isLoading?: boolean;
}

export function JobSearchFilter({ onSearch, isLoading }: JobSearchFilterProps) {
  const [searchTitle, setSearchTitle] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchTitle.trim());
  };

  const handleClear = () => {
    setSearchTitle("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="group relative flex-1">
          {/* Glow Effect */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 blur transition duration-300 group-focus-within:opacity-20" />
          
          <div className="relative flex items-center">
            {/* Search Icon */}
            <div className="absolute left-4 flex h-10 w-10 items-center justify-center">
              <Search className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-purple-500" />
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Search by job title, skills, or keywords..."
              className="w-full rounded-2xl border-2 border-slate-200 bg-white py-4 pl-14 pr-14 text-sm font-medium text-slate-900 shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
            />

            {/* Clear Button */}
            {searchTitle && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-700 active:scale-90"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {/* Shimmer Effect */}
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

      {/* Quick Suggestions (Optional) */}
      {!searchTitle && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-slate-500">Popular:</span>
          {["React Developer", "Backend Engineer", "Product Manager", "UI/UX Designer"].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setSearchTitle(term);
                onSearch(term);
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
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
