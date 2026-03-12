import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface StandardsPackRule {
  rule_id: string;
  type: string;
  severity: string;
  statement: string;
  applies_to?: { targets?: string[]; entity_types?: string[] };
  evidence?: { artifact_contract_ids?: string[]; proof_requirements?: string[] };
}

export interface StandardsPack {
  pack_id: string;
  title: string;
  version: string;
  scope: {
    profiles: string[];
    risk_classes: string[];
    stacks?: string[];
    domains?: string[];
  };
  rules: StandardsPackRule[];
  created_at: string;
  updated_at: string;
  owner: string;
}

export interface StandardsIndexEntry {
  pack_id: string;
  version: string;
  path: string;
  hash?: string;
  scope: Record<string, unknown>;
  maturity: string;
  deprecated_by?: string;
}

export interface StandardsIndexRegistryV1 {
  schema_version: string;
  index_id: string;
  packs: StandardsIndexEntry[];
}

export interface StandardsLibrary {
  standardsIndex: StandardsIndexRegistryV1 | null;
}

export interface StandardsDoc {
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

const STANDARDS_LIB_REL = "Axion/libraries/standards";

let cached: StandardsLibrary | null = null;
let cacheRoot: string | null = null;

function resolveDir(primary: string, fallback: string): string {
  if (existsSync(primary)) return primary;
  return fallback;
}

export function loadStandardsLibrary(repoRoot: string): StandardsLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = resolveDir(
    join(repoRoot, STANDARDS_LIB_REL, "SYSTEM", "registries"),
    join(repoRoot, STANDARDS_LIB_REL, "registries"),
  );
  const standardsIndex = readJsonSafe<StandardsIndexRegistryV1>(join(base, "standards_index.v1.json"));

  cached = { standardsIndex };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getStandardsIndex(repoRoot: string): StandardsIndexRegistryV1 | null {
  return loadStandardsLibrary(repoRoot).standardsIndex;
}

export function loadStandardsDocs(repoRoot: string): StandardsDoc[] {
  const base = join(repoRoot, STANDARDS_LIB_REL);
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

export function loadStandardsSchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, STANDARDS_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadStandardsRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = resolveDir(
    join(repoRoot, STANDARDS_LIB_REL, "SYSTEM", "registries"),
    join(repoRoot, STANDARDS_LIB_REL, "registries"),
  );
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadStandardsPacks(repoRoot: string): Array<{ filename: string; content: StandardsPack }> {
  const base = join(repoRoot, STANDARDS_LIB_REL, "packs");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")) as StandardsPack,
    }));
}

export function getPackById(repoRoot: string, packId: string): StandardsPack | null {
  const packs = loadStandardsPacks(repoRoot);
  const found = packs.find((p) => p.content.pack_id === packId);
  return found ? found.content : null;
}
