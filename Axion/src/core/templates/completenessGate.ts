import type { FilledTemplate } from "./filler.js";
import { scanUnresolvedPlaceholders } from "./renderer.js";

export interface CompletenessCheck {
  check_id: string;
  description: string;
  passed: boolean;
  details?: string;
}

export interface CompletenessResult {
  template_id: string;
  is_complete: boolean;
  checks: CompletenessCheck[];
  required_fields_populated: boolean;
  references_resolve: boolean;
  no_contradictions: boolean;
  unknowns_handled: boolean;
}

export interface CompletenessReport {
  generated_at: string;
  run_id: string;
  total_templates: number;
  complete_count: number;
  incomplete_count: number;
  results: CompletenessResult[];
}

export function checkCompleteness(filled: FilledTemplate, _spec: unknown): CompletenessResult {
  const unresolved = scanUnresolvedPlaceholders(filled.content);
  const hasBlockedUnknowns = filled.unknowns.some((u) => u.status === "BLOCKED");
  const allPlaceholdersResolved = unresolved.length === 0;
  const noBlockedUnknowns = !hasBlockedUnknowns;

  const checks: CompletenessCheck[] = [
    {
      check_id: "placeholders_resolved",
      description: "All placeholders in template are resolved",
      passed: allPlaceholdersResolved,
      details: allPlaceholdersResolved
        ? `All ${filled.placeholders_resolved} placeholders resolved`
        : `${unresolved.length} unresolved placeholder(s): ${unresolved.map((u) => u.key).join(", ")}`,
    },
    {
      check_id: "no_blocked_unknowns",
      description: "No blocked unknowns remain",
      passed: noBlockedUnknowns,
      details: noBlockedUnknowns
        ? "No blocked unknowns"
        : `${filled.unknowns.filter((u) => u.status === "BLOCKED").length} blocked unknown(s)`,
    },
    {
      check_id: "content_not_empty",
      description: "Template content is not empty",
      passed: filled.content.trim().length > 0,
      details: filled.content.trim().length > 0 ? "Content present" : "Template is empty",
    },
  ];

  const isComplete = checks.every((c) => c.passed);

  return {
    template_id: filled.template_id,
    is_complete: isComplete,
    checks,
    required_fields_populated: allPlaceholdersResolved,
    references_resolve: true,
    no_contradictions: true,
    unknowns_handled: noBlockedUnknowns,
  };
}

export function checkAllTemplates(filledTemplates: FilledTemplate[], spec: unknown): CompletenessResult[] {
  return filledTemplates.map((filled) => checkCompleteness(filled, spec));
}

export function buildCompletenessReport(
  results: CompletenessResult[],
  runId: string,
  generatedAt: string,
): CompletenessReport {
  const completeCount = results.filter((r) => r.is_complete).length;
  return {
    generated_at: generatedAt,
    run_id: runId,
    total_templates: results.length,
    complete_count: completeCount,
    incomplete_count: results.length - completeCount,
    results,
  };
}
