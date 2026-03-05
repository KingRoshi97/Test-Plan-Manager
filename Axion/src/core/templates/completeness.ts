import { readJson } from "../../utils/fs.js";
import { join } from "node:path";

export interface PlaceholderCatalog {
  version: string;
  roots: string[];
  flags: string[];
  syntax: Record<string, string>;
  derived_functions: Array<{ name: string; args: string[]; returns: string }>;
}

export interface TemplateCompletenessEntry {
  template_id: string;
  complete: boolean;
  total_placeholders: number;
  resolved: number;
  unresolved: number;
  unresolved_fields: string[];
  blocking: boolean;
  requiredness: string;
}

export interface TemplateCompletenessReport {
  run_id: string;
  checked_at: string;
  total_templates: number;
  complete_count: number;
  incomplete_count: number;
  pass: boolean;
  templates: TemplateCompletenessEntry[];
}

export function loadPlaceholderCatalog(baseDir: string): PlaceholderCatalog {
  const catalogPath = join(baseDir, "libraries", "templates", "placeholder_catalog.v1.json");
  return readJson<PlaceholderCatalog>(catalogPath);
}

export function checkTemplateCompleteness(
  templateId: string,
  requiredness: string,
  totalPlaceholders: number,
  unresolvedFields: string[],
  catalog: PlaceholderCatalog,
): TemplateCompletenessEntry {
  const resolved = totalPlaceholders - unresolvedFields.length;
  const hasUnresolved = unresolvedFields.length > 0;

  const optionalFields = unresolvedFields.filter((f) => {
    return f.endsWith("|OPTIONAL") || f.endsWith("|UNKNOWN_ALLOWED");
  });
  const requiredUnresolved = unresolvedFields.filter((f) => {
    return !f.endsWith("|OPTIONAL") && !f.endsWith("|UNKNOWN_ALLOWED");
  });

  const blocking = requiredness === "always" && requiredUnresolved.length > 0;
  const complete = requiredUnresolved.length === 0;

  return {
    template_id: templateId,
    complete,
    total_placeholders: totalPlaceholders,
    resolved,
    unresolved: unresolvedFields.length,
    unresolved_fields: unresolvedFields,
    blocking,
    requiredness,
  };
}

export function buildCompletenessReport(
  runId: string,
  checkedAt: string,
  entries: TemplateCompletenessEntry[],
): TemplateCompletenessReport {
  const completeCount = entries.filter((e) => e.complete).length;
  const incompleteCount = entries.length - completeCount;
  const hasBlocking = entries.some((e) => e.blocking);

  return {
    run_id: runId,
    checked_at: checkedAt,
    total_templates: entries.length,
    complete_count: completeCount,
    incomplete_count: incompleteCount,
    pass: !hasBlocking,
    templates: entries,
  };
}
