import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface MusMode {
  mode_id: string;
  version: string;
  status: string;
  name: string;
  execution_class: string;
  allowed_triggers: string[];
  allowed_scopes: { asset_classes: string[] };
  allowed_detector_packs: string[];
  outputs: Record<string, boolean>;
  default_budgets: {
    token_cap: number;
    time_cap_ms: number;
    max_findings: number;
    max_proposals: number;
    max_assets_touched: number;
  };
  required_gates: string[];
  hard_constraints: { no_apply: boolean; no_publish: boolean };
  updated_at: string;
}

export interface MusGateRule {
  gate_rule_id: string;
  version: string;
  status: string;
  name: string;
  predicate: { type: string; clauses?: Array<{ type: string; [k: string]: unknown }> };
  evidence_requirements: string[];
  applies_to: string[];
  updated_at: string;
}

export interface MusDetectorPack {
  detector_pack_id: string;
  version: string;
  status: string;
  name: string;
  checks: unknown[];
  allowed_scopes: { asset_classes: string[] };
  default_budgets: Record<string, number>;
  outputs: Record<string, boolean>;
  updated_at: string;
}

export interface MusPatchType {
  patch_type_id: string;
  version: string;
  status: string;
  name: string;
  description?: string;
  allowed_targets: string[];
  schema: Record<string, unknown>;
  validators: string[];
  risk_class_default: string;
  updated_at: string;
}

export interface MusSchedule {
  schedule_id: string;
  version: string;
  status: string;
  rrule: string;
  allowed_modes: string[];
  allowed_detector_packs: string[];
  allowed_scopes: { asset_classes: string[] };
  budgets: Record<string, number>;
  blackout_windows: unknown[];
  updated_at: string;
}

export interface MusPolicy {
  policy_id: string;
  version: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface MusRegistry {
  registry_id: string;
  schema_version: string;
  registry_version: string;
  description: string;
  items: unknown[];
  [key: string]: unknown;
}

export interface MusSchema {
  filename: string;
  content: Record<string, unknown>;
}

export interface MusDoc {
  filename: string;
  frontmatter: Record<string, string>;
  content: string;
}

export interface MaintenanceLibrary {
  modes: MusMode[];
  gates: MusGateRule[];
  detectorPacks: MusDetectorPack[];
  patchTypes: MusPatchType[];
  schedules: MusSchedule[];
  policies: MusPolicy[];
  registryCount: number;
  schemaCount: number;
}

function readJsonSafe<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: raw };
  const lines = match[1].split("\n");
  const fm: Record<string, string> = {};
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    }
  }
  return { frontmatter: fm, content: match[2] };
}

const MUS_LIB_REL = "Axion/libraries/maintenance";

let cached: MaintenanceLibrary | null = null;
let cacheRoot: string | null = null;

function libDir(repoRoot: string): string {
  if (repoRoot.includes("Axion")) {
    const axionIdx = repoRoot.indexOf("Axion");
    return join(repoRoot.slice(0, axionIdx), MUS_LIB_REL);
  }
  return join(repoRoot, MUS_LIB_REL);
}

export function loadMaintenanceLibrary(repoRoot: string): MaintenanceLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = libDir(repoRoot);
  const regDir = join(base, "registries");

  const modesReg = readJsonSafe<MusRegistry>(join(regDir, "REG-MAINTENANCE-MODES.json"));
  const gatesReg = readJsonSafe<MusRegistry>(join(regDir, "REG-GATES-MUS.json"));
  const detectorsReg = readJsonSafe<MusRegistry>(join(regDir, "REG-DETECTOR-PACKS.json"));
  const patchesReg = readJsonSafe<MusRegistry>(join(regDir, "REG-PATCH-TYPES.json"));
  const schedulesReg = readJsonSafe<MusRegistry>(join(regDir, "REG-SCHEDULES.json"));

  const policies = loadMaintenancePolicies(repoRoot);

  let registryCount = 0;
  if (existsSync(regDir)) {
    registryCount = readdirSync(regDir).filter((f) => f.endsWith(".json")).length;
  }

  let schemaCount = 0;
  const contractsDir = join(base, "contracts");
  if (existsSync(contractsDir)) {
    schemaCount = readdirSync(contractsDir).filter((f) => f.endsWith(".json") && f !== "contract.meta.json").length;
  }

  cached = {
    modes: (modesReg?.items ?? []) as MusMode[],
    gates: (gatesReg?.items ?? []) as MusGateRule[],
    detectorPacks: (detectorsReg?.items ?? []) as MusDetectorPack[],
    patchTypes: (patchesReg?.items ?? []) as MusPatchType[],
    schedules: (schedulesReg?.items ?? []) as MusSchedule[],
    policies,
    registryCount,
    schemaCount,
  };
  cacheRoot = repoRoot;
  return cached;
}

export function loadMaintenanceDocs(repoRoot: string): MusDoc[] {
  const base = libDir(repoRoot);
  const docs: MusDoc[] = [];
  if (!existsSync(base)) return docs;

  for (const f of readdirSync(base)) {
    if (!f.endsWith(".md")) continue;
    try {
      const raw = readFileSync(join(base, f), "utf-8");
      const { frontmatter, content } = parseFrontmatter(raw);
      docs.push({ filename: f, frontmatter, content });
    } catch { /* skip */ }
  }
  return docs;
}

export function loadMaintenanceSchemas(repoRoot: string): MusSchema[] {
  const contractsDir = join(libDir(repoRoot), "contracts");
  const schemas: MusSchema[] = [];
  if (!existsSync(contractsDir)) return schemas;

  for (const f of readdirSync(contractsDir)) {
    if (!f.endsWith(".json")) continue;
    const content = readJsonSafe<Record<string, unknown>>(join(contractsDir, f));
    if (content) schemas.push({ filename: f, content });
  }
  return schemas;
}

export function loadMaintenanceRegistries(repoRoot: string): MusRegistry[] {
  const regDir = join(libDir(repoRoot), "registries");
  const registries: MusRegistry[] = [];
  if (!existsSync(regDir)) return registries;

  for (const f of readdirSync(regDir)) {
    if (!f.endsWith(".json")) continue;
    const content = readJsonSafe<MusRegistry>(join(regDir, f));
    if (content) registries.push(content);
  }
  return registries;
}

export function loadMaintenancePolicies(repoRoot: string): MusPolicy[] {
  const polDir = join(libDir(repoRoot), "policies");
  const policies: MusPolicy[] = [];
  if (!existsSync(polDir)) return policies;

  for (const f of readdirSync(polDir)) {
    if (!f.endsWith(".json")) continue;
    const content = readJsonSafe<MusPolicy>(join(polDir, f));
    if (content) policies.push(content);
  }
  return policies;
}

export function getMaintenanceModes(repoRoot: string): MusMode[] {
  return loadMaintenanceLibrary(repoRoot).modes;
}

export function getGates(repoRoot: string): MusGateRule[] {
  return loadMaintenanceLibrary(repoRoot).gates;
}

export function getDetectorPacks(repoRoot: string): MusDetectorPack[] {
  return loadMaintenanceLibrary(repoRoot).detectorPacks;
}

export function getPatchTypes(repoRoot: string): MusPatchType[] {
  return loadMaintenanceLibrary(repoRoot).patchTypes;
}

export function getSchedules(repoRoot: string): MusSchedule[] {
  return loadMaintenanceLibrary(repoRoot).schedules;
}

export function getMusPolicy(repoRoot: string): MusPolicy | null {
  const policies = loadMaintenanceLibrary(repoRoot).policies;
  return policies.find((p) => p.policy_id === "MUS-POLICY") ?? null;
}
