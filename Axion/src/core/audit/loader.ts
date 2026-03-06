import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface AuditIntegrityV1 {
  schema_version: string;
  registry_id: string;
  integrity_mode: string;
  hash_algorithm: string;
  canonical_json: boolean;
  required_for_risk_classes: Record<string, string>;
}

export interface AuditOpsPolicyV1 {
  schema_version: string;
  policy_id: string;
  retention: Record<string, { active_days: number; archive_days: number }>;
  redaction: {
    deny_keys: string[];
    mask_actor_ids_on_external_export: boolean;
    strip_internal_refs_on_external_export: boolean;
  };
  export: {
    allowed_formats: string[];
    external_export_requires_approval: boolean;
    include_hashes: boolean;
  };
}

export interface AuditGate {
  gate_id: string;
  name: string;
  severity: string;
  checks: string[];
}

export interface AuditGateSpec {
  schema_version: string;
  contract_id: string;
  gates: AuditGate[];
}

export interface AuditLibrary {
  integrity: AuditIntegrityV1 | null;
  opsPolicy: AuditOpsPolicyV1 | null;
  gateSpec: AuditGateSpec | null;
}

export interface AuditDoc {
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

const AUDIT_LIB_REL = "Axion/libraries/audit";

let cached: AuditLibrary | null = null;
let cacheRoot: string | null = null;

export function loadAuditLibrary(repoRoot: string): AuditLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = join(repoRoot, AUDIT_LIB_REL, "registries");
  const integrity = readJsonSafe<AuditIntegrityV1>(join(base, "audit_integrity.v1.json"));
  const opsPolicy = readJsonSafe<AuditOpsPolicyV1>(join(base, "audit_ops_policy.v1.json"));
  const gateSpec = readJsonSafe<AuditGateSpec>(join(repoRoot, AUDIT_LIB_REL, "AUD-5_audit_gates.spec.json"));

  cached = { integrity, opsPolicy, gateSpec };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getAuditIntegrity(repoRoot: string): AuditIntegrityV1 | null {
  return loadAuditLibrary(repoRoot).integrity;
}

export function getAuditOpsPolicy(repoRoot: string): AuditOpsPolicyV1 | null {
  return loadAuditLibrary(repoRoot).opsPolicy;
}

export function getAuditGateSpec(repoRoot: string): AuditGateSpec | null {
  return loadAuditLibrary(repoRoot).gateSpec;
}

export function loadAuditSchema(repoRoot: string, schemaName: string): unknown | null {
  const filePath = join(repoRoot, AUDIT_LIB_REL, "schemas", schemaName.endsWith(".json") ? schemaName : `${schemaName}.schema.json`);
  return readJsonSafe<unknown>(filePath);
}

export function loadAuditDocs(repoRoot: string): AuditDoc[] {
  const base = join(repoRoot, AUDIT_LIB_REL);
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

export function loadAuditSchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, AUDIT_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadAuditRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, AUDIT_LIB_REL, "registries");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}
