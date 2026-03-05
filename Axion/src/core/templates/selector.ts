import { join } from "node:path";
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

const TEMPLATE_TYPE_DOMAIN_MAP: Record<string, string[]> = {
  "architecture": ["architecture_design"],
  "security": ["security_fundamentals", "identity_access_management"],
  "data": ["databases", "storage_fundamentals"],
  "api": ["apis_integrations"],
  "integration": ["apis_integrations"],
  "testing": ["testing_qa"],
  "deployment": ["ci_cd_devops", "cloud_fundamentals"],
  "monitoring": ["observability_sre"],
  "compliance": ["compliance_governance"],
  "caching": ["caching"],
  "search": ["search_retrieval"],
  "error": ["observability_sre"],
  "performance": ["observability_sre"],
  "reliability": ["observability_sre"],
};

function getTemplateDomains(entry: TemplateIndexEntry): string[] {
  const domains: string[] = [];
  const titleLower = entry.title.toLowerCase();
  const typeLower = entry.type.toLowerCase();
  const idLower = entry.template_id.toLowerCase();
  const combined = `${titleLower} ${typeLower} ${idLower}`;

  for (const [keyword, domainList] of Object.entries(TEMPLATE_TYPE_DOMAIN_MAP)) {
    if (combined.includes(keyword)) {
      domains.push(...domainList);
    }
  }

  return [...new Set(domains)];
}

function hasKnowledgeDomainOverlap(
  entry: TemplateIndexEntry,
  knowledgeContext: KnowledgeContext,
): boolean {
  const templateDomains = getTemplateDomains(entry);
  if (templateDomains.length === 0) return false;

  const knowledgeDomains = new Set(Object.keys(knowledgeContext.domainMap));
  for (const kid of knowledgeContext.resolvedKids) {
    const pathParts = kid.path.toLowerCase().split("/");
    pathParts.forEach((p) => knowledgeDomains.add(p));
    if (kid.domains) kid.domains.forEach((d) => knowledgeDomains.add(d));
    if (kid.tags) kid.tags.forEach((t) => knowledgeDomains.add(t));
  }

  return templateDomains.some((d) => knowledgeDomains.has(d));
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
  knowledgeBoosted: boolean,
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

  if (knowledgeBoosted) {
    parts.push("knowledge_boost");
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
  knowledgeContext?: KnowledgeContext,
): {
  selected: SelectedTemplate[];
  index: TemplateIndex;
  knowledgeBoostedIds: string[];
} {
  const indexPath = join(baseDir, "libraries", "templates", "template_index.json");
  const index = readJson<TemplateIndex>(indexPath);

  const skillLevel = (routing?.skill_level as string) ?? "intermediate";
  const routingLookup = routing ?? {};
  const constraintsLookup = constraints ?? {};

  const filtered: TemplateIndexEntry[] = [];
  const knowledgeBoostedIds: string[] = [];
  const boostedSet = new Set<string>();

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

      if (knowledgeContext && hasKnowledgeDomainOverlap(t, knowledgeContext)) {
        boostedSet.add(t.template_id);
        knowledgeBoostedIds.push(t.template_id);
      }

      filtered.push(t);
    }
  }

  filtered.sort((a, b) => a.template_id.localeCompare(b.template_id));

  const selected: SelectedTemplate[] = filtered.map((t) => {
    const appliesWhenMatched = matchesAppliesWhen(t.applies_when, routingLookup, constraintsLookup);
    const knowledgeBoosted = boostedSet.has(t.template_id);
    return {
      template_id: t.template_id,
      template_version: t.template_version,
      source_file_path: t.file_path,
      source_abs_path: `libraries/templates/${t.file_path}`,
      output_path: t.output_path,
      rationale: buildRationale(t, skillLevel, appliesWhenMatched, knowledgeBoosted),
      requiredness: t.requiredness,
    };
  });

  return { selected, index, knowledgeBoostedIds };
}

export function computeSelectionHash(selected: SelectedTemplate[]): string {
  const ids = selected.map((s) => `${s.template_id}@${s.template_version}`).sort();
  return sha256(canonicalJsonString(ids)).slice(0, 16);
}
