import { join } from "node:path";
import { existsSync } from "node:fs";
import { readJson } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { canonicalJsonString } from "../../utils/canonicalJson.js";
import type { KnowledgeContext } from "../knowledge/resolver.js";

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
  feature_pack?: string;
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

interface FeaturePackCondition {
  field: string;
  values?: string[];
  equals?: unknown;
  contains?: string;
  not_empty?: boolean;
  greater_than?: number;
}

interface FeaturePack {
  pack_id: string;
  name: string;
  description: string;
  template_prefixes: string[];
  activation: {
    always?: boolean;
    match_any?: FeaturePackCondition[];
  };
}

interface FeaturePacksFile {
  packs: FeaturePack[];
}

function resolveDotPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function evaluateCondition(
  condition: FeaturePackCondition,
  context: Record<string, unknown>,
): boolean {
  const value = resolveDotPath(context, condition.field);

  if (condition.values !== undefined) {
    if (typeof value === "string") {
      return condition.values.includes(value);
    }
    return false;
  }

  if (condition.equals !== undefined) {
    return value === condition.equals || String(value) === String(condition.equals);
  }

  if (condition.contains !== undefined) {
    if (Array.isArray(value)) {
      return value.some((v) => String(v).toLowerCase().includes(condition.contains!.toLowerCase()));
    }
    if (typeof value === "string") {
      return value.toLowerCase().includes(condition.contains.toLowerCase());
    }
    return false;
  }

  if (condition.not_empty === true) {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && value !== null) return Object.keys(value).length > 0;
    return value !== undefined && value !== null && value !== "";
  }

  if (condition.greater_than !== undefined) {
    return typeof value === "number" && value > condition.greater_than;
  }

  return false;
}

function resolveActivePacks(
  packs: FeaturePack[],
  routing: Record<string, unknown>,
  constraints: Record<string, unknown>,
  normalizedInput: Record<string, unknown>,
): Map<string, string> {
  const context: Record<string, unknown> = {
    routing,
    constraints,
    features: (normalizedInput as Record<string, unknown>).features ?? {},
  };

  const activeMap = new Map<string, string>();

  for (const pack of packs) {
    if (pack.activation.always) {
      activeMap.set(pack.pack_id, "always");
      continue;
    }

    if (pack.activation.match_any) {
      for (const condition of pack.activation.match_any) {
        if (evaluateCondition(condition, context)) {
          activeMap.set(pack.pack_id, `matched: ${condition.field}`);
          break;
        }
      }
    }
  }

  return activeMap;
}

function matchesAppliesWhen(
  appliesWhen: Record<string, unknown>,
  routing: Record<string, unknown>,
  constraints: Record<string, unknown>,
): boolean {
  if (!appliesWhen || typeof appliesWhen !== "object") return true;
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

export function selectTemplates(
  baseDir: string,
  routing?: Record<string, unknown>,
  constraints?: Record<string, unknown>,
  canonicalSpec?: Record<string, unknown>,
  standardsSnapshot?: Record<string, unknown>,
  knowledgeContext?: KnowledgeContext,
  normalizedInput?: Record<string, unknown>,
): {
  selected: SelectedTemplate[];
  index: TemplateIndex;
  knowledgeBoostedIds: string[];
  activePacks: Record<string, string>;
} {
  const indexPath = join(baseDir, "libraries", "templates", "template_index.json");
  const index = readJson<TemplateIndex>(indexPath);

  const packsPath = join(baseDir, "libraries", "templates", "feature_packs.json");
  let featurePacks: FeaturePack[] = [];
  if (existsSync(packsPath)) {
    const packsFile = readJson<FeaturePacksFile>(packsPath);
    featurePacks = packsFile.packs;
  }

  const skillLevel = (routing?.skill_level as string) ?? "intermediate";
  const routingLookup = routing ?? {};
  const constraintsLookup = constraints ?? {};
  const normalizedLookup = normalizedInput ?? {};

  const activePacks = resolveActivePacks(featurePacks, routingLookup, constraintsLookup, normalizedLookup);
  const activePackIds = new Set(activePacks.keys());

  const filtered: TemplateIndexEntry[] = [];

  for (const t of index.templates) {
    if (t.status !== "active") continue;

    if (t.requiredness === "always") {
      filtered.push(t);
      continue;
    }

    if (t.feature_pack && activePackIds.size > 0) {
      if (!activePackIds.has(t.feature_pack)) continue;
    }

    if (t.requiredness === "conditional") {
      const appliesWhen = (typeof t.applies_when === "object" && t.applies_when !== null) ? t.applies_when : {};
      const appliesWhenMatched = matchesAppliesWhen(appliesWhen, routingLookup, constraintsLookup);
      if (!appliesWhenMatched && Object.keys(appliesWhen).length > 0) continue;

      const skillReq = t.required_by_skill_level[skillLevel];
      if (skillReq === "omit") continue;

      filtered.push(t);
    }
  }

  filtered.sort((a, b) => a.template_id.localeCompare(b.template_id));

  const activePacksRecord: Record<string, string> = {};
  activePacks.forEach((reason, packId) => { activePacksRecord[packId] = reason; });

  const selected: SelectedTemplate[] = filtered.map((t) => {
    const appliesWhen = (typeof t.applies_when === "object" && t.applies_when !== null) ? t.applies_when : {};
    const appliesWhenMatched = matchesAppliesWhen(appliesWhen, routingLookup, constraintsLookup);
    const parts: string[] = [];

    if (t.requiredness === "always") {
      parts.push("requiredness=always");
    } else {
      if (t.feature_pack) parts.push(`pack=${t.feature_pack}`);
      if (appliesWhenMatched && Object.keys(appliesWhen).length > 0) parts.push("applies_when matched");
    }
    parts.push(`status=${t.status}`);

    return {
      template_id: t.template_id,
      template_version: t.template_version,
      source_file_path: t.file_path,
      source_abs_path: `libraries/templates/${t.file_path}`,
      output_path: t.output_path,
      rationale: parts.join("; "),
      requiredness: t.requiredness,
    };
  });

  return { selected, index, knowledgeBoostedIds: [], activePacks: activePacksRecord };
}

export function computeSelectionHash(selected: SelectedTemplate[]): string {
  const ids = selected.map((s) => `${s.template_id}@${s.template_version}`).sort();
  return sha256(canonicalJsonString(ids)).slice(0, 16);
}
