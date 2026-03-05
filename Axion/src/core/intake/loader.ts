import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface EnumOption {
  value: string;
  label: string;
  aliases?: string[];
}

export interface EnumDef {
  enum_id: string;
  title: string;
  options: EnumOption[];
}

export interface EnumRegistryV1 {
  schema_version: string;
  registry_id: string;
  enums: EnumDef[];
}

export interface CrossFieldCondition {
  field_id: string;
  op: string;
  value: unknown;
}

export interface CrossFieldRule {
  rule_id: string;
  if: CrossFieldCondition[];
  then: { require_fields?: string[]; forbid_fields?: string[] };
  message: string;
}

export interface CrossFieldRulesRegistryV1 {
  schema_version: string;
  ruleset_id: string;
  rules: CrossFieldRule[];
}

export interface NormalizationTransform {
  kind: string;
}

export interface NormalizationRule {
  rule_id: string;
  applies_to: { field_ids: string[] };
  transform: NormalizationTransform;
}

export interface NormalizationRulesRegistryV1 {
  schema_version: string;
  rules_id: string;
  rules: NormalizationRule[];
}

export interface IntakeLibrary {
  enums: EnumRegistryV1 | null;
  crossFieldRules: CrossFieldRulesRegistryV1 | null;
  normalizationRules: NormalizationRulesRegistryV1 | null;
}

export interface IntakeDoc {
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

const INTAKE_LIB_REL = "Axion/libraries/intake";

let cached: IntakeLibrary | null = null;
let cacheRoot: string | null = null;

export function loadIntakeLibrary(repoRoot: string): IntakeLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = join(repoRoot, INTAKE_LIB_REL, "registries");

  const enums = readJsonSafe<EnumRegistryV1>(join(base, "intake_enums.v1.json"));
  const crossFieldRules = readJsonSafe<CrossFieldRulesRegistryV1>(join(base, "intake_cross_field_rules.v1.json"));
  const normalizationRules = readJsonSafe<NormalizationRulesRegistryV1>(join(base, "normalization_rules.v1.json"));

  cached = { enums, crossFieldRules, normalizationRules };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getEnumRegistry(repoRoot: string): EnumRegistryV1 | null {
  return loadIntakeLibrary(repoRoot).enums;
}

export function getCrossFieldRules(repoRoot: string): CrossFieldRulesRegistryV1 | null {
  return loadIntakeLibrary(repoRoot).crossFieldRules;
}

export function getNormalizationRules(repoRoot: string): NormalizationRulesRegistryV1 | null {
  return loadIntakeLibrary(repoRoot).normalizationRules;
}

export function loadIntakeDocs(repoRoot: string): IntakeDoc[] {
  const base = join(repoRoot, INTAKE_LIB_REL);
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

export function loadIntakeSchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, INTAKE_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadIntakeRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, INTAKE_LIB_REL, "registries");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}
