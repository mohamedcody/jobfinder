import type { JobSearchFormState } from "@/components/jobs/job-search-filter";

export const isFilterActive = (filters: JobSearchFormState, key: keyof JobSearchFormState) => {
  if (key === "datePreset") return filters.datePreset !== "any";
  return Boolean(filters[key]?.trim?.() || filters[key]);
};

export const formatDatePresetLabel = (preset: JobSearchFormState["datePreset"]) => {
  if (preset === "any") return "Anytime";
  if (preset === "24h") return "Last 24h";
  if (preset === "week") return "This week";
  return "This month";
};
