import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface KitTreeFolder {
  path: string;
  required: boolean;
  purpose: string;
}

export interface KitTreeFile {
  path: string;
  required: boolean;
  purpose: string;
}

export interface KitTreeV1 {
  schema_version: string;
  registry_id: string;
  folders: KitTreeFolder[];
  files: KitTreeFile[];
}

export interface KitCompatibilityV1 {
  schema_version: string;
  registry_id: string;
  kit_format: {
    kit_version: string;
    requires: {
      folders: string[];
      files: string[];
    };
  };
  schema_support: {
    kit_manifest: string[];
  };
}

export interface KitExportRule {
  rule_id: string;
  export_class: string;
  deny_classifications?: string[];
  allow_classifications?: string[];
}

export interface KitExportFilterV1 {
  schema_version: string;
  registry_id: string;
  rules: KitExportRule[];
}

export interface KitLibrary {
  kitTree: KitTreeV1 | null;
  kitCompatibility: KitCompatibilityV1 | null;
  kitExportFilter: KitExportFilterV1 | null;
}

export interface KitDoc {
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

const KIT_LIB_REL = "Axion/libraries/kit";

let cached: KitLibrary | null = null;
let cacheRoot: string | null = null;

export function loadKitLibrary(repoRoot: string): KitLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = join(repoRoot, KIT_LIB_REL, "registries");
  const kitTree = readJsonSafe<KitTreeV1>(join(base, "kit_tree.v1.json"));
  const kitCompatibility = readJsonSafe<KitCompatibilityV1>(join(base, "kit_compatibility.v1.json"));
  const kitExportFilter = readJsonSafe<KitExportFilterV1>(join(base, "kit_export_filter.v1.json"));

  cached = { kitTree, kitCompatibility, kitExportFilter };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getKitTree(repoRoot: string): KitTreeV1 | null {
  return loadKitLibrary(repoRoot).kitTree;
}

export function getKitCompatibility(repoRoot: string): KitCompatibilityV1 | null {
  return loadKitLibrary(repoRoot).kitCompatibility;
}

export function getKitExportFilter(repoRoot: string): KitExportFilterV1 | null {
  return loadKitLibrary(repoRoot).kitExportFilter;
}

export function loadKitDocs(repoRoot: string): KitDoc[] {
  const base = join(repoRoot, KIT_LIB_REL);
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

export function loadKitSchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, KIT_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadKitRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, KIT_LIB_REL, "registries");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}
