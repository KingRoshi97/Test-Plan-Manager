import fs from "node:fs";
import path from "node:path";

const KNOWLEDGE_ROOT = path.resolve("Axion/libraries/knowledge");
const PILLARS_DIR = path.join(KNOWLEDGE_ROOT, "PILLARS");
const COLLECTIONS_DIR = path.join(KNOWLEDGE_ROOT, "CONTENT", "META", "collections");

const PILLAR_MAP: Record<string, string> = {
  IT_END_TO_END: "solution_patterns",
  INDUSTRY_PLAYBOOKS: "industry_knowledge",
  LANGUAGES_AND_LIBRARIES: "technology_knowledge",
};

const AMBIGUOUS_NAMES = new Set([
  "01_foundations",
  "02_core",
  "03_advanced",
  "04_ecosystem",
  "05_operations",
  "concepts",
  "patterns",
  "checklists",
  "procedures",
  "pitfalls",
  "references",
  "examples",
  "workflows",
]);

interface MetaEntry {
  relPath: string;
  domain: string;
  group: string;
  pillar: string;
  description: string;
  title: string;
  body: string;
}

function parseMetaContent(content: string): {
  title: string;
  domain: string;
  group: string;
  pillar: string;
  description: string;
  body: string;
} {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const domainMatch = content.match(/## Domain\s*\n\s*`([^`]+)`/);
  const groupMatch = content.match(/## Group\s*\n\s*(\S+)/);
  const pillarMatch = content.match(/## Pillar\s*\n\s*(\S+)/);
  const descMatch = content.match(/## Description\s*\n\s*([\s\S]*?)(?=\n## |\n---\s*$|$)/);

  return {
    title: titleMatch?.[1]?.trim() || "Untitled",
    domain: domainMatch?.[1]?.trim() || "",
    group: groupMatch?.[1]?.trim() || "",
    pillar: pillarMatch?.[1]?.trim() || "",
    description: descMatch?.[1]?.trim() || "",
    body: content,
  };
}

function inferCollectionType(pillar: string, relPath: string): string {
  if (pillar === "INDUSTRY_PLAYBOOKS") return "industry";
  if (pillar === "LANGUAGES_AND_LIBRARIES") return "stack_family";
  return "domain";
}

function generateCollectionKey(
  collectionType: string,
  domain: string,
  pillar: string
): string {
  const slug = domain
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return `${collectionType}.${slug}`;
}

function buildCollectionFrontmatter(
  key: string,
  collectionType: string,
  title: string,
  domain: string,
  pillar: string,
  legacyPath: string,
  description: string
): string {
  const pillarRef = PILLAR_MAP[pillar] || pillar.toLowerCase();

  const lines = [
    "---",
    `collection_key: "${key}"`,
    `collection_type: "${collectionType}"`,
    `title: "${title.replace(/"/g, '\\"')}"`,
    `status: "active"`,
    `legacy_path: "PILLARS/${legacyPath}"`,
    "scope:",
  ];

  if (collectionType === "industry") {
    lines.push("  industry_refs:");
    lines.push(`    - "${domain}"`);
    lines.push("  stack_family_refs: []");
    lines.push("  pillar_refs:");
    lines.push(`    - "${pillarRef}"`);
    lines.push("  primary_domain: null");
  } else if (collectionType === "stack_family") {
    lines.push("  industry_refs: []");
    lines.push("  stack_family_refs:");
    lines.push(`    - "${domain}"`);
    lines.push("  pillar_refs:");
    lines.push(`    - "${pillarRef}"`);
    lines.push("  primary_domain: null");
  } else {
    lines.push("  industry_refs: []");
    lines.push("  stack_family_refs: []");
    lines.push("  pillar_refs:");
    lines.push(`    - "${pillarRef}"`);
    lines.push(`  primary_domain: "${domain}"`);
  }

  lines.push("related_views: []");
  lines.push("related_kids: []");
  lines.push("---");

  return lines.join("\n");
}

function walkForMeta(dir: string, base: string, results: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkForMeta(full, base, results);
    } else if (entry.name === "_meta.md") {
      results.push(path.relative(base, full));
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const applyMode = args.includes("--apply");
  const dryRun = !applyMode;

  console.log(`Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);

  const metaFiles: string[] = [];
  walkForMeta(PILLARS_DIR, PILLARS_DIR, metaFiles);
  console.log(`Found ${metaFiles.length} _meta.md files`);

  const entries: MetaEntry[] = [];
  const ambiguous: { relPath: string; reason: string }[] = [];
  const written: { key: string; path: string; title: string }[] = [];

  const seenKeys = new Set<string>();

  for (const relPath of metaFiles) {
    const fullPath = path.join(PILLARS_DIR, relPath);
    const content = fs.readFileSync(fullPath, "utf8");
    const parsed = parseMetaContent(content);

    const pathParts = relPath.split("/");
    const pillar = pathParts[0] || "";
    const dirName = path.basename(path.dirname(relPath));

    if (AMBIGUOUS_NAMES.has(dirName)) {
      ambiguous.push({ relPath, reason: `Generic directory name: ${dirName}` });
      continue;
    }

    const domain = parsed.domain || dirName;
    const collectionType = inferCollectionType(pillar, relPath);
    const key = generateCollectionKey(collectionType, domain, pillar);

    if (seenKeys.has(key)) {
      ambiguous.push({ relPath, reason: `Duplicate collection key: ${key}` });
      continue;
    }
    seenKeys.add(key);

    const frontmatter = buildCollectionFrontmatter(
      key,
      collectionType,
      parsed.title,
      domain,
      pillar,
      relPath.replace(/_meta\.md$/, ""),
      parsed.description
    );

    const outputFilename = `${key}.md`;
    const outputPath = path.join(COLLECTIONS_DIR, outputFilename);

    const bodyContent = parsed.description
      ? `\n# ${parsed.title}\n\n${parsed.description}\n`
      : `\n# ${parsed.title}\n`;

    const fullContent = frontmatter + bodyContent;

    if (!dryRun) {
      fs.writeFileSync(outputPath, fullContent, "utf8");
    }

    written.push({ key, path: outputFilename, title: parsed.title });
  }

  const reportDir = path.join(KNOWLEDGE_ROOT, "OUTPUTS");
  fs.mkdirSync(reportDir, { recursive: true });

  const report = {
    timestamp: new Date().toISOString(),
    mode: dryRun ? "dry_run" : "apply",
    total_meta_files: metaFiles.length,
    collections_created: written.length,
    ambiguous_skipped: ambiguous.length,
  };

  fs.writeFileSync(
    path.join(reportDir, "meta_migration_report.json"),
    JSON.stringify(report, null, 2)
  );
  fs.writeFileSync(
    path.join(reportDir, "meta_migration_ambiguous.json"),
    JSON.stringify(ambiguous, null, 2)
  );
  fs.writeFileSync(
    path.join(reportDir, "meta_migration_written.json"),
    JSON.stringify(written, null, 2)
  );

  console.log(`\nMeta Migration Report:`);
  console.log(JSON.stringify(report, null, 2));

  if (ambiguous.length > 0) {
    console.log(`\nAmbiguous entries (${ambiguous.length}):`);
    for (const a of ambiguous) {
      console.log(`  ${a.relPath}: ${a.reason}`);
    }
  }

  console.log(`\nReports written to ${reportDir}/`);
  if (dryRun) {
    console.log(`\nRun with --apply to execute migration.`);
  }
}

main();
