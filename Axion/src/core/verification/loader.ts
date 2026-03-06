import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface ProofTypeEntry {
  proof_type: string;
  description: string;
  required_fields: string[];
}

export interface ProofTypesV1 {
  schema_version: string;
  registry_id: string;
  types: ProofTypeEntry[];
}

export interface CompletionRequirement {
  kind: "proof" | "artifact" | "gate_pass" | "manual_attestation";
  ref: string;
  notes?: string;
}

export interface CompletionCriteriaV1 {
  schema_version: string;
  criteria_id: string;
  unit_done: { requires: CompletionRequirement[] };
  run_done: { requires: CompletionRequirement[] };
}

export interface CommandPolicyRule {
  rule_id: string;
  match: {
    pattern: string;
    profiles?: string[];
    risk_classes?: string[];
    adapter_types?: string[];
  };
  decision: {
    outcome: "allow" | "deny" | "require_approval";
    reason?: string;
  };
}

export interface CommandPolicyV1 {
  schema_version: string;
  policy_id: string;
  rules: CommandPolicyRule[];
}

export interface VerificationLibrary {
  proofTypes: ProofTypesV1 | null;
  completionCriteria: CompletionCriteriaV1 | null;
  commandPolicy: CommandPolicyV1 | null;
}

export interface VerificationDoc {
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

const VERIFICATION_LIB_REL = "Axion/libraries/verification";

let cached: VerificationLibrary | null = null;
let cacheRoot: string | null = null;

export function loadVerificationLibrary(repoRoot: string): VerificationLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = join(repoRoot, VERIFICATION_LIB_REL, "registries");
  const proofTypes = readJsonSafe<ProofTypesV1>(join(base, "proof_types.v1.json"));
  const completionCriteria = readJsonSafe<CompletionCriteriaV1>(join(base, "completion_criteria.v1.json"));
  const commandPolicy = readJsonSafe<CommandPolicyV1>(join(base, "verification_command_policy.v1.json"));

  cached = { proofTypes, completionCriteria, commandPolicy };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getProofTypes(repoRoot: string): ProofTypesV1 | null {
  return loadVerificationLibrary(repoRoot).proofTypes;
}

export function getCompletionCriteria(repoRoot: string): CompletionCriteriaV1 | null {
  return loadVerificationLibrary(repoRoot).completionCriteria;
}

export function getCommandPolicy(repoRoot: string): CommandPolicyV1 | null {
  return loadVerificationLibrary(repoRoot).commandPolicy;
}

export function loadVerificationDocs(repoRoot: string): VerificationDoc[] {
  const base = join(repoRoot, VERIFICATION_LIB_REL);
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

export function loadVerificationSchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, VERIFICATION_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadVerificationRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, VERIFICATION_LIB_REL, "registries");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}
