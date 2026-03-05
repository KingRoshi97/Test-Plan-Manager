import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface GatePredicate {
  predicate_id: string;
  expr: string;
  message_on_fail: string;
  evidence_tags?: string[];
}

export interface EvidencePolicy {
  mode: "minimal" | "standard" | "trace";
  include_pointers?: boolean;
  include_diff?: boolean;
  include_verification_proof?: boolean;
}

export interface OverrideHook {
  hook_point: string;
  requires_reason?: boolean;
}

export interface GateDefinitionV1 {
  gate_id: string;
  title: string;
  severity: "hard_stop" | "pause" | "warn";
  predicates: GatePredicate[];
  evidence_policy: EvidencePolicy;
  override_hook?: OverrideHook;
  created_at: string;
  updated_at: string;
  owner: string;
}

export interface GateRegistryV1 {
  registry_id: string;
  schema_version: string;
  gates: GateDefinitionV1[];
}

export interface DSLFunctionDef {
  name: string;
  args: string[];
  returns: string;
  reads: string[];
}

export interface DSLFunctionRegistry {
  schema_version: string;
  registry_id: string;
  functions: DSLFunctionDef[];
}

export interface GatesLibrary {
  gateRegistry: GateRegistryV1 | null;
  dslFunctions: DSLFunctionRegistry | null;
}

export interface GateDoc {
  filename: string;
  frontmatter: Record<string, string>;
  content: string;
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

const GATES_LIB_REL = "Axion/libraries/gates";

let cached: GatesLibrary | null = null;
let cacheRoot: string | null = null;

export function loadGatesLibrary(repoRoot: string): GatesLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = join(repoRoot, GATES_LIB_REL, "registries");

  const gateRegistry = readJsonSafe<GateRegistryV1>(join(base, "gate_registry.axion.v1.json"));
  const dslFunctions = readJsonSafe<DSLFunctionRegistry>(join(base, "gate_dsl_functions.v1.json"));

  cached = { gateRegistry, dslFunctions };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getGateDefinition(repoRoot: string, gateId: string): GateDefinitionV1 | null {
  const lib = loadGatesLibrary(repoRoot);
  return lib.gateRegistry?.gates.find((g) => g.gate_id === gateId) ?? null;
}

export function getAllGateDefinitions(repoRoot: string): GateDefinitionV1[] {
  const lib = loadGatesLibrary(repoRoot);
  return lib.gateRegistry?.gates ?? [];
}

export function getDSLFunctions(repoRoot: string): DSLFunctionDef[] {
  const lib = loadGatesLibrary(repoRoot);
  return lib.dslFunctions?.functions ?? [];
}

export function getGateRegistry(repoRoot: string): GateRegistryV1 | null {
  return loadGatesLibrary(repoRoot).gateRegistry;
}

export function loadGatesDocs(repoRoot: string): GateDoc[] {
  const base = join(repoRoot, GATES_LIB_REL);
  if (!existsSync(base)) return [];

  const files = readdirSync(base)
    .filter((f) => f.endsWith(".md") || f.endsWith(".txt"))
    .sort();
  return files.map((filename) => {
    const raw = readFileSync(join(base, filename), "utf-8");
    const { frontmatter, content } = parseFrontmatter(raw);
    return { filename, frontmatter, content };
  });
}

export function loadGatesSchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, GATES_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadGatesRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, GATES_LIB_REL, "registries");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}
