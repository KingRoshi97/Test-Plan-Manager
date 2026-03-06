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
  unknownAllowedFields?: string[],
): TemplateCompletenessEntry {
  const resolved = totalPlaceholders - unresolvedFields.length;

  const allowedSet = new Set(unknownAllowedFields ?? []);

  const requiredUnresolved = unresolvedFields.filter((f) => {
    if (f.endsWith("|OPTIONAL") || f.endsWith("|UNKNOWN_ALLOWED")) return false;
    if (allowedSet.has(f)) return false;
    return true;
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

export interface TemplateGateIssue {
  rule_id: string;
  pointer: string;
  error_code: string;
  message: string;
  remediation: string;
}

export interface TemplateGateEntry {
  template_id: string;
  template_version: string;
  status: "pass" | "fail";
  issues: TemplateGateIssue[];
}

export interface TemplateGateReport {
  run_id: string;
  checked_at: string;
  total_templates: number;
  pass_count: number;
  fail_count: number;
  overall_status: "pass" | "fail";
  entries: TemplateGateEntry[];
}

function extractTopLevelSections(content: string): string[] {
  const headingRegex = /^(#{1,2})\s+(.+)$/gm;
  const sections: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(content)) !== null) {
    sections.push(match[2].trim());
  }
  return sections;
}

function findUnresolvedPlaceholders(content: string): string[] {
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  const unresolved: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = placeholderRegex.exec(content)) !== null) {
    unresolved.push(match[1].trim());
  }
  return unresolved;
}

function findEmptyRequiredSections(content: string): string[] {
  const lines = content.split("\n");
  const emptySections: string[] = [];
  let currentHeading: string | null = null;
  let hasContent = false;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      if (currentHeading && !hasContent) {
        emptySections.push(currentHeading);
      }
      currentHeading = headingMatch[2].trim();
      hasContent = false;
      continue;
    }

    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed !== "---" && !trimmed.startsWith("<!--")) {
      hasContent = true;
    }
  }

  if (currentHeading && !hasContent) {
    emptySections.push(currentHeading);
  }

  return emptySections;
}

function extractReferencedEntityIds(content: string): string[] {
  const idRegex = /\b(FEAT-\d{3,}|ROLE-\d{3,}|WF-\d{3,})\b/g;
  const ids: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = idRegex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  return [...new Set(ids)];
}

function extractUnknownBlockIds(content: string): string[] {
  const unknownRegex = /\bunk_[a-z0-9_]+\b/gi;
  const ids: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = unknownRegex.exec(content)) !== null) {
    ids.push(match[0]);
  }
  return [...new Set(ids)];
}

function buildCanonicalIdSet(canonicalSpec: Record<string, unknown>): Set<string> {
  const ids = new Set<string>();
  const entities = (canonicalSpec.entities ?? {}) as Record<string, unknown>;
  const index = (canonicalSpec.index ?? {}) as Record<string, unknown>;

  for (const [, arr] of Object.entries(entities)) {
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (typeof item === "object" && item !== null) {
          const record = item as Record<string, unknown>;
          for (const key of ["feature_id", "role_id", "workflow_id"]) {
            if (typeof record[key] === "string") {
              ids.add(record[key] as string);
            }
          }
        }
      }
    }
  }

  for (const [, arr] of Object.entries(index)) {
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (typeof item === "string") {
          ids.add(item);
        } else if (typeof item === "object" && item !== null) {
          const record = item as Record<string, unknown>;
          if (typeof record.id === "string") ids.add(record.id);
        }
      }
    }
  }

  return ids;
}

export function runTemplateGate(
  templateId: string,
  templateVersion: string,
  renderedContent: string,
  canonicalSpec: Record<string, unknown>,
): TemplateGateEntry {
  const issues: TemplateGateIssue[] = [];

  const sections = extractTopLevelSections(renderedContent);
  if (sections.length < 2) {
    issues.push({
      rule_id: "TMP5-STRUCT-01",
      pointer: `/${templateId}`,
      error_code: "MISSING_SECTIONS",
      message: `Template has ${sections.length} top-level section(s); expected at least a header and content sections.`,
      remediation: "Add required top-level markdown heading sections (e.g., ## Header, ## Content).",
    });
  }

  const unresolvedPlaceholders = findUnresolvedPlaceholders(renderedContent);
  if (unresolvedPlaceholders.length > 0) {
    for (const placeholder of unresolvedPlaceholders) {
      issues.push({
        rule_id: "TMP5-FILL-01",
        pointer: `/${templateId}/placeholder/${placeholder}`,
        error_code: "UNRESOLVED_PLACEHOLDER",
        message: `Unresolved placeholder: {{${placeholder}}}`,
        remediation: `Resolve placeholder '${placeholder}' by providing the required data in canonical spec or fill context.`,
      });
    }
  }

  const emptySections = findEmptyRequiredSections(renderedContent);
  if (emptySections.length > 0) {
    for (const section of emptySections) {
      issues.push({
        rule_id: "TMP5-FILL-02",
        pointer: `/${templateId}/section/${section}`,
        error_code: "EMPTY_SECTION",
        message: `Required section "${section}" has no content.`,
        remediation: `Populate the "${section}" section with project-specific content.`,
      });
    }
  }

  const referencedIds = extractReferencedEntityIds(renderedContent);
  if (referencedIds.length > 0) {
    const canonicalIds = buildCanonicalIdSet(canonicalSpec);
    for (const id of referencedIds) {
      if (!canonicalIds.has(id)) {
        issues.push({
          rule_id: "TMP5-REF-01",
          pointer: `/${templateId}/ref/${id}`,
          error_code: "DANGLING_ENTITY_REF",
          message: `Entity ID "${id}" referenced but not found in canonical spec indexes.`,
          remediation: `Verify entity "${id}" exists in the canonical spec or remove the reference.`,
        });
      }
    }
  }

  const unknownIds = extractUnknownBlockIds(renderedContent);
  const validUnknownPattern = /^unk_[a-z0-9_]+$/;
  for (const unkId of unknownIds) {
    if (!validUnknownPattern.test(unkId)) {
      issues.push({
        rule_id: "TMP5-UNK-01",
        pointer: `/${templateId}/unknown/${unkId}`,
        error_code: "INVALID_UNKNOWN_ID",
        message: `Unknown block ID "${unkId}" does not follow the required unk_ prefix pattern.`,
        remediation: `Rename unknown block to use format: unk_<descriptive_slug> (lowercase, alphanumeric with underscores).`,
      });
    }
  }

  return {
    template_id: templateId,
    template_version: templateVersion,
    status: issues.length === 0 ? "pass" : "fail",
    issues,
  };
}

export function buildTemplateGateReport(
  runId: string,
  checkedAt: string,
  entries: TemplateGateEntry[],
): TemplateGateReport {
  const passCount = entries.filter((e) => e.status === "pass").length;
  const failCount = entries.length - passCount;

  return {
    run_id: runId,
    checked_at: checkedAt,
    total_templates: entries.length,
    pass_count: passCount,
    fail_count: failCount,
    overall_status: failCount === 0 ? "pass" : "fail",
    entries,
  };
}
