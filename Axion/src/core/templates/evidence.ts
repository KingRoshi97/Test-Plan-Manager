import { join, dirname } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { readJson, ensureDir } from "../../utils/fs.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { selectTemplates } from "./selector.js";
import { renderTemplate, countPlaceholders, scanUnresolvedPlaceholders, buildAutoContext } from "./renderer.js";

export function writeSelectionResult(runDir: string, runId: string, generatedAt: string, baseDir: string): void {
  const { selected, index } = selectTemplates(baseDir);

  writeCanonicalJson(join(runDir, "templates", "selection_result.json"), {
    generated_at: generatedAt,
    profile_id: "default",
    run_id: runId,
    selected_templates: selected,
    template_index_version: index.template_index_version,
    template_library_version: index.template_library_version,
  });

  writeCanonicalJson(join(runDir, "templates", "selection_report.json"), {
    generated_at: generatedAt,
    notes: [{ level: "info", message: `Selected ${selected.length} templates with profile "default" (status=active, requiredness=always)` }],
    run_id: runId,
    selected_count: selected.length,
    selection_profile: "default",
    total_in_index: index.templates.length,
  });
}

interface SelectionResultFile {
  run_id: string;
  generated_at: string;
  selected_templates: Array<{
    template_id: string;
    template_version: string;
    source_file_path: string;
    source_abs_path: string;
    output_path: string;
  }>;
}

export function writeRenderedDocs(runDir: string, runId: string, generatedAt: string, baseDir: string): void {
  const selectionPath = join(runDir, "templates", "selection_result.json");
  const selection = readJson<SelectionResultFile>(selectionPath);

  const templateContents: string[] = [];

  for (const tmpl of selection.selected_templates) {
    const absPath = join(baseDir, tmpl.source_abs_path);
    const content = readFileSync(absPath, "utf-8");
    templateContents.push(content);
  }

  const context = buildAutoContext(templateContents, {
    run_id: runId,
    generated_at: generatedAt,
  });

  const files: Array<{
    template_id: string;
    source_path: string;
    output_path: string;
    placeholders_total: number;
    placeholders_unresolved: number;
    unresolved: string[];
  }> = [];

  const allUnresolved: Array<{
    template_id: string;
    output_path: string;
    key: string;
    occurrences: number;
  }> = [];

  for (let i = 0; i < selection.selected_templates.length; i++) {
    const tmpl = selection.selected_templates[i];
    const rawContent = templateContents[i];
    const totalPlaceholders = countPlaceholders(rawContent);
    const rendered = renderTemplate(rawContent, context);
    const unresolved = scanUnresolvedPlaceholders(rendered);

    const outputRelPath = `templates/rendered_docs/${tmpl.template_id}.md`;
    const outputAbsPath = join(runDir, outputRelPath);

    ensureDir(dirname(outputAbsPath));
    writeFileSync(outputAbsPath, rendered, "utf-8");

    files.push({
      template_id: tmpl.template_id,
      source_path: tmpl.source_abs_path,
      output_path: outputRelPath,
      placeholders_total: totalPlaceholders,
      placeholders_unresolved: unresolved.length,
      unresolved: unresolved.map((u) => u.key),
    });

    for (const u of unresolved) {
      allUnresolved.push({
        template_id: tmpl.template_id,
        output_path: outputRelPath,
        key: u.key,
        occurrences: u.occurrences,
      });
    }
  }

  writeCanonicalJson(join(runDir, "templates", "render_report.json"), {
    files,
    generated_at: generatedAt,
    run_id: runId,
    templates_rendered: files.length,
    unresolved_placeholders: allUnresolved,
    unresolved_placeholders_count: allUnresolved.length,
  });
}
