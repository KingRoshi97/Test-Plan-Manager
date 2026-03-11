import fs from "node:fs";
import path from "node:path";

const KNOWLEDGE_ROOT = path.resolve("Axion/libraries/knowledge");
const CONTENT_ITEMS_DIR = path.join(KNOWLEDGE_ROOT, "CONTENT", "ITEMS");
const REGISTRIES_DIR = path.join(KNOWLEDGE_ROOT, "SYSTEM", "registries");
const OUTPUT_PATH = path.join(REGISTRIES_DIR, "knowledge.index.json");

interface KnowledgeIndexEntry {
  kid: string;
  title: string;
  path: string;
  content_type: string;
  primary_domain: string;
  secondary_domains?: string[];
  industry_refs: string[];
  stack_family_refs: string[];
  pillar_refs: string[];
  status: string;
  authority_tier: string;
  freshness_class?: string;
  bundle_refs?: string[];
  tags?: string[];
}

function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const yamlStr = match[1];
  const data: Record<string, unknown> = {};
  let currentArrayKey = "";

  for (const line of yamlStr.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("- ") && currentArrayKey) {
      const val = trimmed.slice(2).trim().replace(/^["']|["']$/g, "");
      if (!Array.isArray(data[currentArrayKey])) data[currentArrayKey] = [];
      (data[currentArrayKey] as string[]).push(val);
      continue;
    }

    const kvMatch = trimmed.match(/^(\w[\w_]*):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const rawVal = kvMatch[2].trim();

      if (rawVal === "" || rawVal === "[]") {
        currentArrayKey = key;
        if (rawVal === "[]") {
          data[key] = [];
          currentArrayKey = "";
        }
        continue;
      }

      currentArrayKey = "";
      data[key] = rawVal.replace(/^["']|["']$/g, "");
    }
  }

  return data;
}

function ensureArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  return [];
}

function main() {
  if (!fs.existsSync(CONTENT_ITEMS_DIR)) {
    console.error(`CONTENT/ITEMS directory not found: ${CONTENT_ITEMS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(CONTENT_ITEMS_DIR).filter((f) => f.endsWith(".md"));
  console.log(`Found ${files.length} items in CONTENT/ITEMS/`);

  const index: KnowledgeIndexEntry[] = [];

  for (const file of files) {
    const fullPath = path.join(CONTENT_ITEMS_DIR, file);
    const content = fs.readFileSync(fullPath, "utf8");
    const fm = parseFrontmatter(content);

    if (!fm.kid || typeof fm.kid !== "string") {
      console.warn(`  SKIP ${file}: no valid kid`);
      continue;
    }

    const entry: KnowledgeIndexEntry = {
      kid: fm.kid as string,
      title: (fm.title as string) || fm.kid as string,
      path: `Axion/libraries/knowledge/CONTENT/ITEMS/${file}`,
      content_type: (fm.content_type as string) || "reference",
      primary_domain: (fm.primary_domain as string) || "general",
      industry_refs: ensureArray(fm.industry_refs),
      stack_family_refs: ensureArray(fm.stack_family_refs),
      pillar_refs: ensureArray(fm.pillar_refs),
      status: (fm.status as string) || "active",
      authority_tier: (fm.authority_tier as string) || "draft",
    };

    const secondaryDomains = ensureArray(fm.secondary_domains);
    if (secondaryDomains.length > 0) entry.secondary_domains = secondaryDomains;

    if (fm.freshness_class) entry.freshness_class = fm.freshness_class as string;

    const bundleRefs = ensureArray(fm.bundle_refs);
    if (bundleRefs.length > 0) entry.bundle_refs = bundleRefs;

    const tags = ensureArray(fm.tags);
    if (tags.length > 0) entry.tags = tags;

    index.push(entry);
  }

  index.sort((a, b) => a.kid.localeCompare(b.kid));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2));
  console.log(`\nKnowledge index written: ${index.length} entries`);
  console.log(`Output: ${OUTPUT_PATH}`);

  const stats = {
    total: index.length,
    by_status: {} as Record<string, number>,
    by_authority: {} as Record<string, number>,
    by_content_type: {} as Record<string, number>,
    domains: new Set<string>(),
  };

  for (const e of index) {
    stats.by_status[e.status] = (stats.by_status[e.status] || 0) + 1;
    stats.by_authority[e.authority_tier] = (stats.by_authority[e.authority_tier] || 0) + 1;
    stats.by_content_type[e.content_type] = (stats.by_content_type[e.content_type] || 0) + 1;
    stats.domains.add(e.primary_domain);
  }

  console.log(`\nStats:`);
  console.log(`  Status: ${JSON.stringify(stats.by_status)}`);
  console.log(`  Authority: ${JSON.stringify(stats.by_authority)}`);
  console.log(`  Content types: ${JSON.stringify(stats.by_content_type)}`);
  console.log(`  Unique domains: ${stats.domains.size}`);
}

main();
