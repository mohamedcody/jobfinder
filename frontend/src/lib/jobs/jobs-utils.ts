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

export const getPostedAfterFromPreset = (preset: JobSearchFormState["datePreset"]): string | undefined => {
  if (preset === "any") return undefined;

  const now = new Date();
  if (preset === "24h") now.setHours(now.getHours() - 24);
  else if (preset === "week") now.setDate(now.getDate() - 7);
  else if (preset === "month") now.setDate(now.getDate() - 30);

  return now.toISOString().split("T")[0]; // Returns YYYY-MM-DD
};
