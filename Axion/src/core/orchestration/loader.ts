import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface StageDef {
  stage_id: string;
  name: string;
  consumes: string[];
  produces: string[];
  activation?: { mode: string; requires: string[] };
  can_rerun: boolean;
  failure_policy: string;
}

export interface GatePoint {
  after_stage: string;
  gate_id: string;
  severity?: string;
}

export interface PipelineDefinition {
  schema_version: string;
  pipeline_id: string;
  version: string;
  stage_order: string[];
  stages: Record<string, StageDef>;
  gate_points: GatePoint[];
  created_at: string;
  updated_at: string;
  owner: string;
}

export interface StageIOContract {
  contract_id: string;
  kind: string;
  description: string;
  schema_ref: { schema_id: string; schema_version: string };
  required_fields: string[];
  validation?: { mode: string; rules_ref?: string };
}

export interface StageIORegistry {
  schema_version: string;
  registry_id: string;
  contracts: StageIOContract[];
}

export interface RerunRule {
  stage_id: string;
  can_rerun: boolean;
  invalidates: string[];
}

export interface RerunPolicies {
  schema_version: string;
  registry_id: string;
  rules: RerunRule[];
}

export interface OrchestrationLibrary {
  pipelineDefinition: PipelineDefinition | null;
  stageIOContracts: StageIOContract[];
  rerunPolicies: RerunRule[];
}

export interface OrcDoc {
  filename: string;
  frontmatter: Record<string, string>;
  content: string;
}

function readJsonSafe<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
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

const ORC_LIB_REL = "Axion/libraries/orchestration";

let cached: OrchestrationLibrary | null = null;
let cacheRoot: string | null = null;

export function loadOrchestrationLibrary(repoRoot: string): OrchestrationLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = join(repoRoot, ORC_LIB_REL, "registries");

  const pipelineFile = readJsonSafe<PipelineDefinition>(join(base, "pipeline_definition.axion.v1.json"));
  const ioFile = readJsonSafe<StageIORegistry>(join(base, "stage_io_registry.axion.v1.json"));
  const rerunFile = readJsonSafe<RerunPolicies>(join(base, "rerun_policies.axion.v1.json"));

  cached = {
    pipelineDefinition: pipelineFile,
    stageIOContracts: ioFile?.contracts ?? [],
    rerunPolicies: rerunFile?.rules ?? [],
  };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getPipelineDefinition(repoRoot: string): PipelineDefinition | null {
  return loadOrchestrationLibrary(repoRoot).pipelineDefinition;
}

export function getStageIOContract(repoRoot: string, contractId: string): StageIOContract | null {
  const lib = loadOrchestrationLibrary(repoRoot);
  return lib.stageIOContracts.find((c) => c.contract_id === contractId) ?? null;
}

export function getRerunPolicy(repoRoot: string, stageId: string): RerunRule | null {
  const lib = loadOrchestrationLibrary(repoRoot);
  return lib.rerunPolicies.find((r) => r.stage_id === stageId) ?? null;
}

export function validateStageConsumes(
  repoRoot: string,
  stageId: string,
): { valid: boolean; missing: string[] } {
  const lib = loadOrchestrationLibrary(repoRoot);
  const pipeline = lib.pipelineDefinition;
  if (!pipeline) return { valid: false, missing: [] };

  const stageDef = pipeline.stages[stageId];
  if (!stageDef) return { valid: false, missing: [] };

  const contractIds = new Set(lib.stageIOContracts.map((c) => c.contract_id));
  const missing = stageDef.consumes.filter((id) => !contractIds.has(id));

  return { valid: missing.length === 0, missing };
}

export function getInvalidatedContracts(repoRoot: string, stageId: string): string[] {
  const rule = getRerunPolicy(repoRoot, stageId);
  if (!rule) return [];
  return rule.invalidates;
}

export function loadOrchestrationDocs(repoRoot: string): OrcDoc[] {
  const base = join(repoRoot, ORC_LIB_REL);
  if (!existsSync(base)) return [];

  const files = readdirSync(base)
    .filter((f) => f.endsWith(".md") || f.endsWith(".txt") || (f.endsWith(".json") && f.startsWith("ORC-")))
    .sort();
  return files.map((filename) => {
    const raw = readFileSync(join(base, filename), "utf-8");
    const { frontmatter, content } = parseFrontmatter(raw);
    return { filename, frontmatter, content };
  });
}

export function loadOrchestrationSchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, ORC_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadOrchestrationRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, ORC_LIB_REL, "registries");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}
