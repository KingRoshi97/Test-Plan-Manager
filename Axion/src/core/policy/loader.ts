import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface RiskClassThresholds {
  knowledge_min_maturity: string;
  standards_mode: string;
  template_completeness: string;
  verification_level: string;
}

export interface ExecutorRules {
  external_allowed: boolean;
  external_restrictions: string[];
}

export interface RiskClassDefinition {
  risk_class: string;
  description: string;
  thresholds: RiskClassThresholds;
  gate_strictness: Record<string, string>;
  executor_rules: ExecutorRules;
}

export interface RiskClassRegistryV1 {
  schema_version: string;
  registry_id: string;
  classes: RiskClassDefinition[];
}

export interface OverridePermissions {
  [hookPoint: string]: Record<string, boolean>;
}

export interface PolicySetRules {
  precedence_mode: string;
  override_permissions: OverridePermissions;
  max_override_duration_hours: Record<string, number>;
  deny_by_default: boolean;
}

export interface PolicySetDefinition {
  policy_set_id: string;
  rules: PolicySetRules;
  created_at: string;
  updated_at: string;
  owner: string;
}

export interface PolicySetRegistryV1 {
  schema_version: string;
  registry_id: string;
  policy_sets: PolicySetDefinition[];
}

export interface PolicyLibrary {
  riskClasses: RiskClassRegistryV1 | null;
  policySets: PolicySetRegistryV1 | null;
}

export interface PolicyDoc {
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

const POLICY_LIB_REL = "Axion/libraries/policy";

let cached: PolicyLibrary | null = null;
let cacheRoot: string | null = null;

export function loadPolicyLibrary(repoRoot: string): PolicyLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = join(repoRoot, POLICY_LIB_REL, "registries");

  const riskClasses = readJsonSafe<RiskClassRegistryV1>(join(base, "risk_classes.v1.json"));
  const policySets = readJsonSafe<PolicySetRegistryV1>(join(base, "policy_sets.v1.json"));

  cached = { riskClasses, policySets };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getRiskClass(repoRoot: string, riskClass: string): RiskClassDefinition | null {
  const lib = loadPolicyLibrary(repoRoot);
  return lib.riskClasses?.classes.find((c) => c.risk_class === riskClass) ?? null;
}

export function getAllRiskClasses(repoRoot: string): RiskClassDefinition[] {
  const lib = loadPolicyLibrary(repoRoot);
  return lib.riskClasses?.classes ?? [];
}

export function getPolicySet(repoRoot: string, policySetId: string): PolicySetDefinition | null {
  const lib = loadPolicyLibrary(repoRoot);
  return lib.policySets?.policy_sets.find((ps) => ps.policy_set_id === policySetId) ?? null;
}

export function getDefaultPolicySet(repoRoot: string): PolicySetDefinition | null {
  const lib = loadPolicyLibrary(repoRoot);
  return lib.policySets?.policy_sets[0] ?? null;
}

export function loadPolicyDocs(repoRoot: string): PolicyDoc[] {
  const base = join(repoRoot, POLICY_LIB_REL);
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

export function loadPolicySchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, POLICY_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadPolicyRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, POLICY_LIB_REL, "registries");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}
