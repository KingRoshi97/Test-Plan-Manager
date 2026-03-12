import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface TemplateRegistryEntry {
  template_id: string;
  version: string;
  path: string;
  hash?: string;
  category: string;
  subcategory?: string;
  required_inputs: string[];
  tags: string[];
  domains?: string[];
  profiles?: string[];
  risk_classes?: string[];
  maturity: string;
  deprecated_by?: string;
}

export interface TemplateRegistryV1 {
  schema_version: string;
  registry_id: string;
  templates: TemplateRegistryEntry[];
}

export interface CategoryOrderV1 {
  schema_version: string;
  registry_id: string;
  order: string[];
}

export interface CompletenessPolicyV1 {
  schema_version: string;
  registry_id: string;
  thresholds: Record<string, { required_placeholders_min_pct: number; allow_tbd: boolean }>;
}

export interface TemplatesLibrary {
  templateRegistry: TemplateRegistryV1 | null;
  categoryOrder: CategoryOrderV1 | null;
  completenessPolicy: CompletenessPolicyV1 | null;
}

export interface TemplatesDoc {
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

const TEMPLATES_LIB_REL = "Axion/libraries/templates";

let cached: TemplatesLibrary | null = null;
let cacheRoot: string | null = null;

function resolveDir(primary: string, fallback: string): string {
  if (existsSync(primary)) return primary;
  return fallback;
}

export function loadTemplatesLibrary(repoRoot: string): TemplatesLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = resolveDir(
    join(repoRoot, TEMPLATES_LIB_REL, "SYSTEM", "registries"),
    join(repoRoot, TEMPLATES_LIB_REL, "registries"),
  );
  const templateRegistry = readJsonSafe<TemplateRegistryV1>(join(base, "template_registry.v1.json"));
  const categoryOrder = readJsonSafe<CategoryOrderV1>(join(base, "template_category_order.v1.json"));
  const completenessPolicy = readJsonSafe<CompletenessPolicyV1>(join(base, "template_completeness_policy.v1.json"));

  cached = { templateRegistry, categoryOrder, completenessPolicy };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getTemplateRegistry(repoRoot: string): TemplateRegistryV1 | null {
  return loadTemplatesLibrary(repoRoot).templateRegistry;
}

export function getCategoryOrder(repoRoot: string): CategoryOrderV1 | null {
  return loadTemplatesLibrary(repoRoot).categoryOrder;
}

export function getCompletenessPolicy(repoRoot: string): CompletenessPolicyV1 | null {
  return loadTemplatesLibrary(repoRoot).completenessPolicy;
}

export function loadTemplatesDocs(repoRoot: string): TemplatesDoc[] {
  const base = join(repoRoot, TEMPLATES_LIB_REL);
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

export function loadTemplatesSchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, TEMPLATES_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadTemplatesRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = resolveDir(
    join(repoRoot, TEMPLATES_LIB_REL, "SYSTEM", "registries"),
    join(repoRoot, TEMPLATES_LIB_REL, "registries"),
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
