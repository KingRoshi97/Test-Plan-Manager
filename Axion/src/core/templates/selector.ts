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

export type OmissionReason = "not_applicable" | "skill_level_omit" | "policy_excluded" | "pack_not_active";

export interface OmittedTemplate {
  template_id: string;
  template_version: string;
  type: string;
  reason: OmissionReason;
  detail: string;
}

export interface BaselineWarning {
  level: string;
  slot: string;
  message: string;
}

export interface TemplateSelectionResult {
  run_id: string;
  selected_at: string;
  selection_hash: string;
  template_index_version: string;
  template_library_version: string;
  selected: SelectedTemplate[];
  omitted_templates: OmittedTemplate[];
  na_slots: string[];
  baseline_warnings: BaselineWarning[];
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

const GLOBAL_TYPE_ORDER: string[] = [
  "product",
  "design",
  "architecture",
  "data",
  "api",
  "security",
  "implementation",
  "quality",
  "ops",
  "release",
  "governance",
  "analytics",
];

const TYPE_TO_SLOT: Record<string, string> = {
  "Product / Requirements": "product",
  "Product / Business Rules": "product",
  "Product / Domain Model": "product",
  "Product / Metrics": "product",
  "Product / Risk": "product",
  "Product / Roadmap": "product",
  "Product / Stakeholders": "product",
  "Product / User Research": "product",
  "Design / Accessibility": "design",
  "Design / Content": "design",
  "Design / Information Architecture": "design",
  "Design / Interaction": "design",
  "Design / Responsive Layout": "design",
  "Design / System": "design",
  "Design / UX": "design",
  "Design / Visual Assets": "design",
  "Experience Design": "design",
  "Architecture / API Governance": "architecture",
  "Architecture / Authorization": "architecture",
  "Architecture / Deployment": "architecture",
  "Architecture / Error Model": "architecture",
  "Architecture / Interfaces": "architecture",
  "Architecture / Realtime": "architecture",
  "Architecture / System": "architecture",
  "Architecture / Workflow": "architecture",
  "Data & Information": "data",
  "Data / Architecture": "data",
  "Data / Caching": "data",
  "Data / Governance": "data",
  "Data / Lifecycle": "data",
  "Data / Quality": "data",
  "Data / Reporting": "data",
  "Data / Search": "data",
  "Build / API": "api",
  "Integration / CRM & ERP": "api",
  "Integration / External Systems": "api",
  "Integration / File & Media Storage": "api",
  "Integration / Notifications": "api",
  "Integration / Payments": "api",
  "Integration / SSO & Identity": "api",
  "Integration / Webhooks": "api",
  "Security / Audit": "security",
  "Security / Compliance": "security",
  "Security / Compliance Programs": "security",
  "Security / Core": "security",
  "Security / Identity & Access": "security",
  "Security / Privacy": "security",
  "Security / Secrets & Keys": "security",
  "Security / Threat Modeling": "security",
  "Build / Admin Tools": "implementation",
  "Build / Background Jobs": "implementation",
  "Build / Client Error Recovery": "implementation",
  "Build / Deep Links": "implementation",
  "Build / Events": "implementation",
  "Build / Feature Flags": "implementation",
  "Build / File Processing": "implementation",
  "Build / Forms": "implementation",
  "Build / Frontend": "implementation",
  "Build / Mobile": "implementation",
  "Build / Mobile Capabilities": "implementation",
  "Build / Mobile Performance": "implementation",
  "Build / Offline Support": "implementation",
  "Build / Pagination & Filtering": "implementation",
  "Build / Playbook Patterns": "implementation",
  "Build / Push Notifications": "implementation",
  "Build / Rate Limiting": "implementation",
  "Build / Routing": "implementation",
  "Build / State Management": "implementation",
  "Build / UI Composition": "implementation",
  "Build / Release & Signing": "release",
  "Operations / Alerting": "ops",
  "Operations / Cost Management": "ops",
  "Operations / Load Testing": "ops",
  "Operations / Logging & Tracing": "ops",
  "Operations / Observability": "ops",
  "Operations / Performance": "ops",
  "Operations / SLOs & Reliability": "ops",
  "Operations / Analytics": "analytics",
};

const ALWAYS_REQUIRED_SLOTS: string[] = [
  "product",
  "architecture",
  "implementation",
  "security",
  "quality",
];

interface ConditionalSlotCheck {
  slot: string;
  condition: (routing: Record<string, unknown>, constraints: Record<string, unknown>) => boolean;
  trigger: string;
}

const CONDITIONAL_SLOTS: ConditionalSlotCheck[] = [
  {
    slot: "design",
    condition: (r, c) => {
      const appType = String(r.app_type ?? r.platform ?? "");
      return appType.includes("web") || appType.includes("mobile") || appType.includes("desktop") || appType.includes("consumer") || appType.includes("ui");
    },
    trigger: "UI/consumer application detected",
  },
  {
    slot: "data",
    condition: (_r, c) => {
      const dataEnabled = c.data_enabled ?? c.has_database ?? c.data;
      return dataEnabled === true || dataEnabled === "true" || String(dataEnabled) === "yes";
    },
    trigger: "data.enabled is true",
  },
  {
    slot: "api",
    condition: (r, c) => {
      const appType = String(r.app_type ?? r.platform ?? "");
      return appType.includes("api") || appType.includes("service") || appType.includes("backend") || c.has_api === true;
    },
    trigger: "service/API application detected",
  },
  {
    slot: "ops",
    condition: (r, c) => {
      const deployable = c.deployable ?? c.is_deployable ?? r.deployment_target;
      return deployable !== undefined && deployable !== false && deployable !== "false";
    },
    trigger: "deployable application detected",
  },
];

function resolveSlot(templateType: string): string {
  return TYPE_TO_SLOT[templateType] ?? "implementation";
}

function getSlotOrder(slot: string): number {
  const idx = GLOBAL_TYPE_ORDER.indexOf(slot);
  return idx >= 0 ? idx : GLOBAL_TYPE_ORDER.length;
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

function checkBaselineCoverage(
  selectedSlots: Set<string>,
  routing: Record<string, unknown>,
  constraints: Record<string, unknown>,
): BaselineWarning[] {
  const warnings: BaselineWarning[] = [];

  for (const slot of ALWAYS_REQUIRED_SLOTS) {
    if (!selectedSlots.has(slot)) {
      warnings.push({
        level: "warning",
        slot,
        message: `Baseline coverage gap: no templates selected for always-required slot "${slot}"`,
      });
    }
  }

  for (const check of CONDITIONAL_SLOTS) {
    if (check.condition(routing, constraints) && !selectedSlots.has(check.slot)) {
      warnings.push({
        level: "warning",
        slot: check.slot,
        message: `Baseline coverage gap: no templates selected for conditional slot "${check.slot}" (${check.trigger})`,
      });
    }
  }

  return warnings;
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
  omitted_templates: OmittedTemplate[];
  na_slots: string[];
  baseline_warnings: BaselineWarning[];
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
  const omitted: OmittedTemplate[] = [];

  for (const t of index.templates) {
    if (t.status !== "active") continue;

    if (t.requiredness === "always") {
      filtered.push(t);
      continue;
    }

    if (t.feature_pack && activePackIds.size > 0) {
      if (!activePackIds.has(t.feature_pack)) {
        omitted.push({
          template_id: t.template_id,
          template_version: t.template_version,
          type: t.type,
          reason: "pack_not_active",
          detail: `Feature pack "${t.feature_pack}" is not active`,
        });
        continue;
      }
    }

    if (t.requiredness === "conditional") {
      const appliesWhen = (typeof t.applies_when === "object" && t.applies_when !== null) ? t.applies_when : {};
      const appliesWhenMatched = matchesAppliesWhen(appliesWhen, routingLookup, constraintsLookup);
      if (!appliesWhenMatched && Object.keys(appliesWhen).length > 0) {
        omitted.push({
          template_id: t.template_id,
          template_version: t.template_version,
          type: t.type,
          reason: "not_applicable",
          detail: `applies_when conditions not met: ${JSON.stringify(appliesWhen)}`,
        });
        continue;
      }

      const skillReq = t.required_by_skill_level[skillLevel];
      if (skillReq === "omit") {
        omitted.push({
          template_id: t.template_id,
          template_version: t.template_version,
          type: t.type,
          reason: "skill_level_omit",
          detail: `Omitted for skill level "${skillLevel}"`,
        });
        continue;
      }

      filtered.push(t);
    }
  }

  filtered.sort((a, b) => {
    const slotA = resolveSlot(a.type);
    const slotB = resolveSlot(b.type);
    const orderA = getSlotOrder(slotA);
    const orderB = getSlotOrder(slotB);
    if (orderA !== orderB) return orderA - orderB;
    return a.template_id.localeCompare(b.template_id);
  });

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

  const selectedSlots = new Set<string>();
  for (const t of filtered) {
    selectedSlots.add(resolveSlot(t.type));
  }

  const naSlots: string[] = [];
  for (const slot of GLOBAL_TYPE_ORDER) {
    if (!selectedSlots.has(slot)) {
      naSlots.push(slot);
    }
  }

  const baselineWarnings = checkBaselineCoverage(selectedSlots, routingLookup, constraintsLookup);

  return {
    selected,
    index,
    knowledgeBoostedIds: [],
    activePacks: activePacksRecord,
    omitted_templates: omitted,
    na_slots: naSlots,
    baseline_warnings: baselineWarnings,
  };
}

export function computeSelectionHash(selected: SelectedTemplate[]): string {
  const ids = selected.map((s) => `${s.template_id}@${s.template_version}`).sort();
  return sha256(canonicalJsonString(ids)).slice(0, 16);
}
