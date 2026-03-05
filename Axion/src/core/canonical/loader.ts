import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface RelationshipConstraint {
  type: string;
  from_types: string[];
  to_types: string[];
}

export interface RelationshipConstraintsRegistryV1 {
  schema_version: string;
  registry_id: string;
  constraints: RelationshipConstraint[];
}

export interface IdRulesRegistryV1 {
  schema_version: string;
  registry_id: string;
  id_algo_version: string;
  namespace_mode: string;
  entity_prefix: string;
  relationship_prefix: string;
  canonical_key_templates: Record<string, string>;
}

export interface CanonicalLibrary {
  idRules: IdRulesRegistryV1 | null;
  relationshipConstraints: RelationshipConstraintsRegistryV1 | null;
}

export interface CanonicalDoc {
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

const CANONICAL_LIB_REL = "Axion/libraries/canonical";

let cached: CanonicalLibrary | null = null;
let cacheRoot: string | null = null;

export function loadCanonicalLibrary(repoRoot: string): CanonicalLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = join(repoRoot, CANONICAL_LIB_REL, "registries");

  const idRules = readJsonSafe<IdRulesRegistryV1>(join(base, "id_rules.v1.json"));
  const relationshipConstraints = readJsonSafe<RelationshipConstraintsRegistryV1>(join(base, "relationship_constraints.v1.json"));

  cached = { idRules, relationshipConstraints };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getIdRules(repoRoot: string): IdRulesRegistryV1 | null {
  return loadCanonicalLibrary(repoRoot).idRules;
}

export function getRelationshipConstraints(repoRoot: string): RelationshipConstraintsRegistryV1 | null {
  return loadCanonicalLibrary(repoRoot).relationshipConstraints;
}

export function loadCanonicalDocs(repoRoot: string): CanonicalDoc[] {
  const base = join(repoRoot, CANONICAL_LIB_REL);
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

export function loadCanonicalSchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, CANONICAL_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadCanonicalRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, CANONICAL_LIB_REL, "registries");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}
