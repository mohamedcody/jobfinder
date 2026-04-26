"use client";

import { useMemo } from "react";
import { 
  JobSearchFilter, 
  type JobSearchFormState 
} from "@/components/jobs/job-search-filter";
import { useJobsSearch } from "@/hooks/use-jobs-search";
import { JobsResultsSection } from "./jobs-results-section";
import { formatDatePresetLabel, isFilterActive } from "@/lib/jobs/jobs-utils";

export function JobsList() {
  const {
    jobs,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    draftFilters,
    appliedFilters,
    stats,
    setDraftFilters,
    handleSearch,
    handleClearAll,
    handleRemoveFilter,
    handleLoadMore,
    handleRetrySearch,
    handleRefresh,
  } = useJobsSearch();

  const activeChips = useMemo(
    () => [
      isFilterActive(appliedFilters, "title") && { key: "title" as const, label: `Title: ${appliedFilters.title.trim()}` },
      isFilterActive(appliedFilters, "location") && { key: "location" as const, label: `Location: ${appliedFilters.location.trim()}` },
      isFilterActive(appliedFilters, "datePreset") && { key: "datePreset" as const, label: `Posted: ${formatDatePresetLabel(appliedFilters.datePreset)}` },
      isFilterActive(appliedFilters, "empType") && { key: "empType" as const, label: `Type: ${appliedFilters.empType}` },
    ].filter(Boolean) as Array<{ key: keyof JobSearchFormState; label: string }>,
    [appliedFilters],
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="sticky top-[64px] z-40 -mx-4 px-4 py-3 bg-[#07091a]/80 backdrop-blur-xl border-b border-white/5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <JobSearchFilter
          value={draftFilters}
          onChange={setDraftFilters}
          onSearch={handleSearch}
          onClear={handleClearAll}
          isLoading={isLoading || isLoadingMore}
        />
      </div>

      <JobsResultsSection
        jobs={jobs}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        stats={stats}
        activeChips={activeChips}
        onRetrySearch={handleRetrySearch}
        onLoadMore={handleLoadMore}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAll}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
