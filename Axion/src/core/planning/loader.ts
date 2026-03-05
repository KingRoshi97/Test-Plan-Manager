import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface CoverageRule {
  rule_id: string;
  category: "entity" | "template" | "acceptance";
  requirement: string;
  severity: "must" | "should";
}

export interface CoverageRulesV1 {
  schema_version: string;
  rules_id: string;
  rules: CoverageRule[];
}

export interface PlanningLibrary {
  coverageRules: CoverageRulesV1 | null;
}

export interface PlanningDoc {
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

const PLANNING_LIB_REL = "Axion/libraries/planning";

let cached: PlanningLibrary | null = null;
let cacheRoot: string | null = null;

export function loadPlanningLibrary(repoRoot: string): PlanningLibrary {
  if (cached && cacheRoot === repoRoot) return cached;

  const base = join(repoRoot, PLANNING_LIB_REL, "registries");
  const coverageRules = readJsonSafe<CoverageRulesV1>(join(base, "plan_coverage_rules.v1.json"));

  cached = { coverageRules };
  cacheRoot = repoRoot;
  return cached;
}

export function invalidateCache(): void {
  cached = null;
  cacheRoot = null;
}

export function getCoverageRules(repoRoot: string): CoverageRulesV1 | null {
  return loadPlanningLibrary(repoRoot).coverageRules;
}

export function loadPlanningDocs(repoRoot: string): PlanningDoc[] {
  const base = join(repoRoot, PLANNING_LIB_REL);
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

export function loadPlanningSchemas(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, PLANNING_LIB_REL, "schemas");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}

export function loadPlanningRegistries(repoRoot: string): Array<{ filename: string; content: unknown }> {
  const base = join(repoRoot, PLANNING_LIB_REL, "registries");
  if (!existsSync(base)) return [];

  return readdirSync(base)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((filename) => ({
      filename,
      content: JSON.parse(readFileSync(join(base, filename), "utf-8")),
    }));
}
