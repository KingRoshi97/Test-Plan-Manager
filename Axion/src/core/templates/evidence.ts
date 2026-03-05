import { join, dirname, resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { readJson, ensureDir } from "../../utils/fs.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import { selectTemplates, computeSelectionHash } from "./selector.js";
import type { SelectedTemplate, TemplateSelectionResult } from "./selector.js";
import { renderTemplate, countPlaceholders, scanUnresolvedPlaceholders, buildAutoContext } from "./renderer.js";
import {
  loadPlaceholderCatalog,
  checkTemplateCompleteness,
  buildCompletenessReport,
} from "./completeness.js";
import type { TemplateCompletenessEntry } from "./completeness.js";
import { fillTemplate, type FillContext } from "./filler.js";

export function writeSelectionResult(
  runDir: string,
  runId: string,
  generatedAt: string,
  baseDir: string,
  canonicalSpec?: Record<string, unknown>,
  standardsSnapshot?: Record<string, unknown>,
): void {
  const routing = loadRoutingFromRun(runDir);
  const constraints = loadConstraintsFromRun(runDir);

  const { selected, index } = selectTemplates(baseDir, routing, constraints, canonicalSpec, standardsSnapshot);
  const selectionHash = computeSelectionHash(selected);
  const now = isoNow();

  const result = {
    run_id: runId,
    selected_at: now,
    selection_hash: selectionHash,
    template_index_version: index.template_index_version,
    template_library_version: index.template_library_version,
    selected,
    selected_templates: selected,
  };

  writeCanonicalJson(join(runDir, "templates", "selection_result.json"), result);

  writeCanonicalJson(join(runDir, "templates", "selection_report.json"), {
    generated_at: now,
    notes: [
      {
        level: "info",
        message: `Selected ${selected.length} templates with registry-driven selection (selection_hash=${selectionHash})`,
      },
    ],
    run_id: runId,
    selected_count: selected.length,
    selection_hash: selectionHash,
    selection_profile: "registry-driven",
    total_in_index: index.templates.length,
  });
}

function loadRoutingFromRun(runDir: string): Record<string, unknown> {
  try {
    const normalized = readJson<Record<string, unknown>>(join(runDir, "intake", "normalized_input.json"));
    return (normalized.routing ?? {}) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function loadConstraintsFromRun(runDir: string): Record<string, unknown> {
  try {
    const normalized = readJson<Record<string, unknown>>(join(runDir, "intake", "normalized_input.json"));
    return (normalized.constraints ?? {}) as Record<string, unknown>;
  } catch {
    return {};
  }
}

interface SelectionResultFile {
  run_id: string;
  selected_at: string;
  selection_hash: string;
  selected: Array<{
    template_id: string;
    template_version: string;
    source_file_path: string;
    source_abs_path: string;
    output_path: string;
    rationale?: string;
    requiredness?: string;
  }>;
}

function assertNotTemplateLibrary(targetPath: string, baseDir: string): void {
  const templateLibDir = resolve(baseDir, "libraries", "templates");
  const absTarget = resolve(targetPath);
  if (absTarget.startsWith(templateLibDir)) {
    throw new Error(
      `GUARDRAIL VIOLATION: Attempted write to template library at ${absTarget}. ` +
      `Source templates in libraries/templates/ are read-only. ` +
      `Rendered output must go to runs/<runId>/templates/rendered_docs/.`
    );
  }
}

export function writeRenderedDocs(runDir: string, runId: string, generatedAt: string, baseDir: string): void {
  assertNotTemplateLibrary(runDir, baseDir);

  const selectionPath = join(runDir, "templates", "selection_result.json");
  const selection = readJson<SelectionResultFile>(selectionPath);
  const catalog = loadPlaceholderCatalog(baseDir);

  let canonicalSpec: Record<string, unknown> = {};
  try {
    canonicalSpec = readJson<Record<string, unknown>>(join(runDir, "canonical", "canonical_spec.json"));
  } catch { /* empty */ }

  let standardsSnapshot: Record<string, unknown> = {};
  try {
    standardsSnapshot = readJson<Record<string, unknown>>(join(runDir, "standards", "resolved_standards_snapshot.json"));
  } catch { /* empty */ }

  let normalizedInput: Record<string, unknown> = {};
  try {
    normalizedInput = readJson<Record<string, unknown>>(join(runDir, "intake", "normalized_input.json"));
  } catch { /* empty */ }

  let workBreakdown: Record<string, unknown> = {};
  try {
    workBreakdown = readJson<Record<string, unknown>>(join(runDir, "planning", "work_breakdown.json"));
  } catch { /* empty */ }

  let acceptanceMap: Record<string, unknown> = {};
  try {
    acceptanceMap = readJson<Record<string, unknown>>(join(runDir, "planning", "acceptance_map.json"));
  } catch { /* empty */ }

  const specMeta = (canonicalSpec.meta as Record<string, unknown>) ?? {};
  const derivedSpecId = (specMeta.spec_id as string) ?? "SPEC-UNKNOWN";
  const standardsId = String(
    (standardsSnapshot as Record<string, unknown>).snapshot_id ??
    (standardsSnapshot as Record<string, unknown>).standards_snapshot_id ??
    "STD-UNKNOWN"
  );

  const fillCtx: FillContext = {
    spec: canonicalSpec,
    standards: standardsSnapshot,
    work: workBreakdown,
    acceptance: acceptanceMap,
    normalizedInput,
    submission_id: String(specMeta.submission_id ?? (normalizedInput as Record<string, unknown>).submission_id ?? "unknown"),
    spec_id: derivedSpecId,
    standards_id: standardsId,
    run_id: runId,
  };

  const envelopes: Array<{
    template_id: string;
    template_version: string;
    rendered_at: string;
    output_path: string;
    placeholders_total: number;
    placeholders_resolved: number;
    placeholders_unresolved: number;
    unresolved_fields: string[];
    content_hash: string;
  }> = [];

  const completenessEntries: TemplateCompletenessEntry[] = [];
  const now = isoNow();

  for (const tmpl of selection.selected) {
    let rawContent = "";
    try {
      const absPath = join(baseDir, tmpl.source_abs_path);
      rawContent = readFileSync(absPath, "utf-8");
    } catch {
      rawContent = "";
    }

    const filled = fillTemplate(
      {
        template_id: tmpl.template_id,
        template_version: tmpl.template_version,
        source_file_path: tmpl.source_file_path,
        source_abs_path: tmpl.source_abs_path,
        output_path: tmpl.output_path,
        rationale: tmpl.rationale ?? "",
        requiredness: tmpl.requiredness ?? "conditional",
      },
      rawContent,
      fillCtx,
    );

    const outputRelPath = `templates/rendered_docs/${tmpl.template_id}.md`;
    const outputAbsPath = join(runDir, outputRelPath);

    assertNotTemplateLibrary(outputAbsPath, baseDir);
    ensureDir(dirname(outputAbsPath));
    writeFileSync(outputAbsPath, filled.content, "utf-8");

    const totalFields = filled.placeholders_resolved + filled.placeholders_unknown;
    const unresolvedFields = filled.unknowns.map((u) => u.placeholder);
    const unknownAllowedFields = filled.unknowns
      .filter((u) => u.status === "UNKNOWN_ALLOWED")
      .map((u) => u.placeholder);

    envelopes.push({
      template_id: tmpl.template_id,
      template_version: tmpl.template_version,
      rendered_at: now,
      output_path: outputRelPath,
      placeholders_total: totalFields,
      placeholders_resolved: filled.placeholders_resolved,
      placeholders_unresolved: filled.placeholders_unknown,
      unresolved_fields: unresolvedFields,
      content_hash: sha256(filled.content).slice(0, 16),
    });

    const completenessEntry = checkTemplateCompleteness(
      tmpl.template_id,
      tmpl.requiredness ?? "conditional",
      totalFields,
      unresolvedFields,
      catalog,
      unknownAllowedFields,
    );
    completenessEntries.push(completenessEntry);
  }

  writeCanonicalJson(join(runDir, "templates", "render_envelopes.json"), {
    run_id: runId,
    rendered_at: now,
    envelopes,
  });

  writeCanonicalJson(join(runDir, "templates", "render_report.json"), {
    files: envelopes.map((e) => ({
      template_id: e.template_id,
      source_path: selection.selected.find((s) => s.template_id === e.template_id)?.source_abs_path ?? "",
      output_path: e.output_path,
      placeholders_total: e.placeholders_total,
      placeholders_unresolved: e.placeholders_unresolved,
      unresolved: e.unresolved_fields,
    })),
    generated_at: now,
    run_id: runId,
    templates_rendered: envelopes.length,
    unresolved_placeholders: envelopes.flatMap((e) =>
      e.unresolved_fields.map((key) => ({
        template_id: e.template_id,
        output_path: e.output_path,
        key,
        occurrences: 1,
      })),
    ),
    unresolved_placeholders_count: envelopes.reduce((sum, e) => sum + e.unresolved_fields.length, 0),
  });

  const completenessReport = buildCompletenessReport(runId, now, completenessEntries);
  writeCanonicalJson(join(runDir, "templates", "template_completeness_report.json"), completenessReport);
}
