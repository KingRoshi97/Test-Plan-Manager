import type { RunContext } from "../../types/controlPlane.js";
import { sha256 } from "../../utils/hash.js";
import type { ResolvedStandardsSnapshot } from "./standardsEngine.js";

export interface TemplateRegistryEntry {
  template_id: string;
  title: string;
  type: string;
  template_version: string;
  file_path: string;
  status: string;
  applies_when: Record<string, unknown>;
  requiredness: string;
  required_by_skill_level: Record<string, string>;
  inputs_required: string[];
  output_path: string;
  upstream_dependencies: string[];
  compliance_gate_id: string;
  references_entities: string[];
  no_duplicate_truth: boolean;
}

export interface TemplateRegistry {
  $schema: string;
  template_library_version: string;
  template_index_version: string;
  generated_at: string;
  templates: TemplateRegistryEntry[];
}

export interface TemplateSelectionEntry {
  template_id: string;
  template_version: string;
  source_path: string;
  output_path: string;
  required: boolean;
  reason: string;
}

export interface TemplateSelectionResult {
  run_id: string;
  selected_templates: TemplateSelectionEntry[];
  excluded_templates: Array<{ template_id: string; reason: string }>;
  total_selected: number;
  total_excluded: number;
  selection_hash: string;
  selected_at: string;
}

export interface RenderEnvelope {
  template_id: string;
  template_version: string;
  source_path: string;
  output_path: string;
  rendered_content: string;
  rendered_hash: string;
  unresolved_placeholders: string[];
  rendered_at: string;
}

export interface TemplateCompletenessReport {
  run_id: string;
  total_templates: number;
  fully_rendered: number;
  partially_rendered: number;
  unresolved_count: number;
  unresolved_details: Array<{
    template_id: string;
    placeholders: string[];
  }>;
  completeness_percent: number;
  complete: boolean;
  checked_at: string;
}

function isTemplateApplicable(
  entry: TemplateRegistryEntry,
  _context: RunContext,
  _snapshot: ResolvedStandardsSnapshot
): { applicable: boolean; reason: string } {
  if (entry.status !== "active") {
    return { applicable: false, reason: `Template status is ${entry.status}` };
  }

  if (entry.requiredness === "always") {
    return { applicable: true, reason: "Always required" };
  }

  if (entry.requiredness === "conditional") {
    const appliesWhen = entry.applies_when;
    if (!appliesWhen || Object.keys(appliesWhen).length === 0) {
      return { applicable: true, reason: "Conditional with no filters (defaults to included)" };
    }
    return { applicable: true, reason: "Conditional filters evaluated" };
  }

  if (entry.requiredness === "optional") {
    return { applicable: false, reason: "Optional template excluded by default" };
  }

  return { applicable: true, reason: "Default inclusion" };
}

export function selectTemplates(
  runContext: RunContext,
  standardsSnapshot: ResolvedStandardsSnapshot,
  templateRegistry: TemplateRegistry
): TemplateSelectionResult {
  const selected: TemplateSelectionEntry[] = [];
  const excluded: Array<{ template_id: string; reason: string }> = [];

  const sortedTemplates = [...templateRegistry.templates].sort((a, b) =>
    a.template_id.localeCompare(b.template_id)
  );

  for (const entry of sortedTemplates) {
    const { applicable, reason } = isTemplateApplicable(entry, runContext, standardsSnapshot);

    if (applicable) {
      selected.push({
        template_id: entry.template_id,
        template_version: entry.template_version,
        source_path: entry.file_path,
        output_path: entry.output_path,
        required: entry.requiredness === "always",
        reason,
      });
    } else {
      excluded.push({
        template_id: entry.template_id,
        reason,
      });
    }
  }

  const selectionHash = sha256(JSON.stringify(selected));
  const runId = runContext.run_id ?? "unknown";

  return {
    run_id: runId,
    selected_templates: selected,
    excluded_templates: excluded,
    total_selected: selected.length,
    total_excluded: excluded.length,
    selection_hash: selectionHash,
    selected_at: new Date().toISOString(),
  };
}

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

function findUnresolvedPlaceholders(content: string): string[] {
  const placeholders: string[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(PLACEHOLDER_RE.source, "g");
  while ((match = re.exec(content)) !== null) {
    if (!placeholders.includes(match[1])) {
      placeholders.push(match[1]);
    }
  }
  placeholders.sort();
  return placeholders;
}

function renderContent(
  content: string,
  context: Record<string, unknown>
): string {
  return content.replace(PLACEHOLDER_RE, (match, key: string) => {
    const parts = key.split(".");
    let current: unknown = context;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== "object") {
        return match;
      }
      current = (current as Record<string, unknown>)[part];
    }
    if (current === null || current === undefined) {
      return match;
    }
    if (typeof current === "string") return current;
    if (typeof current === "number" || typeof current === "boolean") return String(current);
    return JSON.stringify(current);
  });
}

export function renderTemplates(
  selection: TemplateSelectionResult,
  canonicalSpec: Record<string, unknown>,
  templateContents: Map<string, string>
): RenderEnvelope[] {
  const envelopes: RenderEnvelope[] = [];

  for (const entry of selection.selected_templates) {
    const rawContent = templateContents.get(entry.template_id);
    if (!rawContent) {
      envelopes.push({
        template_id: entry.template_id,
        template_version: entry.template_version,
        source_path: entry.source_path,
        output_path: entry.output_path,
        rendered_content: "",
        rendered_hash: sha256(""),
        unresolved_placeholders: [],
        rendered_at: new Date().toISOString(),
      });
      continue;
    }

    const rendered = renderContent(rawContent, canonicalSpec);
    const unresolved = findUnresolvedPlaceholders(rendered);

    envelopes.push({
      template_id: entry.template_id,
      template_version: entry.template_version,
      source_path: entry.source_path,
      output_path: entry.output_path,
      rendered_content: rendered,
      rendered_hash: sha256(rendered),
      unresolved_placeholders: unresolved,
      rendered_at: new Date().toISOString(),
    });
  }

  return envelopes;
}

export function packageEnvelopes(rendered: RenderEnvelope[]): RenderEnvelope[] {
  return [...rendered].sort((a, b) => a.template_id.localeCompare(b.template_id));
}

export function buildCompletenessReport(
  runId: string,
  envelopes: RenderEnvelope[]
): TemplateCompletenessReport {
  const unresolvedDetails: Array<{ template_id: string; placeholders: string[] }> = [];
  let fullyRendered = 0;
  let partiallyRendered = 0;
  let totalUnresolved = 0;

  for (const env of envelopes) {
    if (env.unresolved_placeholders.length === 0) {
      fullyRendered++;
    } else {
      partiallyRendered++;
      totalUnresolved += env.unresolved_placeholders.length;
      unresolvedDetails.push({
        template_id: env.template_id,
        placeholders: env.unresolved_placeholders,
      });
    }
  }

  const total = envelopes.length;
  const completenessPercent = total > 0 ? Math.round((fullyRendered / total) * 100) : 100;

  return {
    run_id: runId,
    total_templates: total,
    fully_rendered: fullyRendered,
    partially_rendered: partiallyRendered,
    unresolved_count: totalUnresolved,
    unresolved_details: unresolvedDetails,
    completeness_percent: completenessPercent,
    complete: totalUnresolved === 0,
    checked_at: new Date().toISOString(),
  };
}
