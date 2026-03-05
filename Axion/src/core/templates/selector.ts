import { join } from "node:path";
import { readJson } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { canonicalJsonString } from "../../utils/canonicalJson.js";

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
  rationale: string;
  requiredness: string;
}

export interface TemplateSelectionResult {
  run_id: string;
  selected_at: string;
  selection_hash: string;
  template_index_version: string;
  template_library_version: string;
  selected: SelectedTemplate[];
}

function matchesAppliesWhen(
  appliesWhen: Record<string, unknown>,
  routing: Record<string, unknown>,
  constraints: Record<string, unknown>,
): boolean {
  if (Object.keys(appliesWhen).length === 0) return true;

  for (const [key, value] of Object.entries(appliesWhen)) {
    const lookupValue = (routing as Record<string, unknown>)[key]
      ?? (constraints as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      if (!value.includes(lookupValue)) return false;
    } else if (typeof value === "boolean") {
      if (Boolean(lookupValue) !== value) return false;
    } else {
      if (lookupValue !== value) return false;
    }
  }
  return true;
}

function buildRationale(
  entry: TemplateIndexEntry,
  skillLevel: string,
  appliesWhenMatched: boolean,
): string {
  const parts: string[] = [];

  if (entry.requiredness === "always") {
    parts.push("requiredness=always");
  } else if (entry.requiredness === "conditional") {
    if (appliesWhenMatched) {
      parts.push("applies_when matched");
    }
    const skillReq = entry.required_by_skill_level[skillLevel];
    if (skillReq) {
      parts.push(`skill_level=${skillLevel}→${skillReq}`);
    }
  }

  parts.push(`status=${entry.status}`);
  return parts.join("; ");
}

export function selectTemplates(
  baseDir: string,
  routing?: Record<string, unknown>,
  constraints?: Record<string, unknown>,
  canonicalSpec?: Record<string, unknown>,
  standardsSnapshot?: Record<string, unknown>,
): {
  selected: SelectedTemplate[];
  index: TemplateIndex;
} {
  const indexPath = join(baseDir, "libraries", "templates", "template_index.json");
  const index = readJson<TemplateIndex>(indexPath);

  const skillLevel = (routing?.skill_level as string) ?? "intermediate";
  const routingLookup = routing ?? {};
  const constraintsLookup = constraints ?? {};

  const filtered: TemplateIndexEntry[] = [];
  for (const t of index.templates) {
    if (t.status !== "active") continue;

    if (t.requiredness === "always") {
      filtered.push(t);
      continue;
    }

    if (t.requiredness === "conditional") {
      const appliesWhenMatched = matchesAppliesWhen(t.applies_when, routingLookup, constraintsLookup);
      if (!appliesWhenMatched && Object.keys(t.applies_when).length > 0) continue;

      const skillReq = t.required_by_skill_level[skillLevel];
      if (skillReq === "omit") continue;

      filtered.push(t);
    }
  }

  filtered.sort((a, b) => a.template_id.localeCompare(b.template_id));

  const selected: SelectedTemplate[] = filtered.map((t) => {
    const appliesWhenMatched = matchesAppliesWhen(t.applies_when, routingLookup, constraintsLookup);
    return {
      template_id: t.template_id,
      template_version: t.template_version,
      source_file_path: t.file_path,
      source_abs_path: `libraries/templates/${t.file_path}`,
      output_path: t.output_path,
      rationale: buildRationale(t, skillLevel, appliesWhenMatched),
      requiredness: t.requiredness,
    };
  });

  return { selected, index };
}

export function computeSelectionHash(selected: SelectedTemplate[]): string {
  const ids = selected.map((s) => `${s.template_id}@${s.template_version}`).sort();
  return sha256(canonicalJsonString(ids)).slice(0, 16);
}
