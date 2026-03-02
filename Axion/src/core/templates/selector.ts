import { join } from "node:path";
import { readJson } from "../../utils/fs.js";

export interface TemplateIndexEntry {
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

export interface TemplateIndex {
  $schema: string;
  template_library_version: string;
  template_index_version: string;
  generated_at: string;
  templates: TemplateIndexEntry[];
}

export interface SelectedTemplate {
  template_id: string;
  template_version: string;
  source_file_path: string;
  source_abs_path: string;
  output_path: string;
}

export function selectTemplates(baseDir: string, profile: string = "default"): {
  selected: SelectedTemplate[];
  index: TemplateIndex;
} {
  const indexPath = join(baseDir, "libraries", "templates", "template_index.json");
  const index = readJson<TemplateIndex>(indexPath);

  let filtered: TemplateIndexEntry[];
  if (profile === "default") {
    filtered = index.templates.filter(
      (t) => t.status === "active" && t.requiredness === "always",
    );
  } else {
    filtered = index.templates.filter((t) => t.status === "active");
  }

  filtered.sort((a, b) => a.template_id.localeCompare(b.template_id));

  const selected: SelectedTemplate[] = filtered.map((t) => ({
    template_id: t.template_id,
    template_version: t.template_version,
    source_file_path: t.file_path,
    source_abs_path: `libraries/templates/${t.file_path}`,
    output_path: t.output_path,
  }));

  return { selected, index };
}
