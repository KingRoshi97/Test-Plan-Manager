import path from "node:path";
import type { SearchFilters } from "./types.js";

export function inferFiltersFromLegacyPath(input: string): SearchFilters | null {
  const normalized = input.replace(/\\/g, "/").toLowerCase();

  if (!normalized.includes("/pillars/") && !normalized.startsWith("pillars/")) return null;

  const filters: SearchFilters = {};

  if (normalized.includes("/industry_playbooks/")) {
    filters.pillar_refs = ["industry_knowledge"];
  }
  if (normalized.includes("/it_end_to_end/")) {
    filters.pillar_refs = ["solution_patterns"];
  }
  if (normalized.includes("/languages_and_libraries/")) {
    filters.pillar_refs = ["technology_knowledge"];
  }

  const base = path.basename(normalized, path.extname(normalized));
  if (base && base !== "_meta") {
    filters.text = base;
  }

  return filters;
}
