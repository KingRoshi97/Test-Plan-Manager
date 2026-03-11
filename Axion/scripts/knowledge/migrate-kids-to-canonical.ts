import fs from "node:fs";
import path from "node:path";

const KNOWLEDGE_ROOT = path.resolve("Axion/libraries/knowledge");
const PILLARS_DIR = path.join(KNOWLEDGE_ROOT, "PILLARS");
const CONTENT_ITEMS_DIR = path.join(KNOWLEDGE_ROOT, "CONTENT", "ITEMS");
const REGISTRIES_DIR = path.join(KNOWLEDGE_ROOT, "SYSTEM", "registries");
const ALIASES_PATH = path.join(REGISTRIES_DIR, "aliases.index.json");
const RELATIONSHIPS_PATH = path.join(REGISTRIES_DIR, "relationships.index.json");

const PILLAR_MAP: Record<string, string> = {
  IT_END_TO_END: "solution_patterns",
  INDUSTRY_PLAYBOOKS: "industry_knowledge",
  LANGUAGES_AND_LIBRARIES: "technology_knowledge",
};

const CONTENT_TYPE_MAP: Record<string, string> = {
  concept: "concept",
  concepts: "concept",
  pattern: "pattern",
  patterns: "pattern",
  checklist: "checklist",
  checklists: "checklist",
  workflow: "workflow",
  workflows: "workflow",
  reference: "reference",
  references: "reference",
  standard: "standard",
  standards: "standard",
  playbook: "playbook",
  playbooks: "playbook",
  integration: "integration",
  integrations: "integration",
  compliance: "compliance",
  data_model: "data_model",
  security_risk: "security_risk",
  kpi_metric: "kpi_metric",
  pitfalls: "reference",
  pitfall: "reference",
  procedures: "workflow",
  procedure: "workflow",
  examples: "reference",
  example: "reference",
};

const AUTHORITY_MAP: Record<string, string> = {
  golden: "golden",
  verified: "verified",
  reviewed: "reviewed",
  draft: "draft",
};

interface FrontmatterData {
  kid?: string;
  title?: string;
  type?: string;
  pillar?: string;
  domains?: string[];
  subdomains?: string[];
  tags?: string[];
  maturity?: string;
  use_policy?: string;
  executor_access?: string;
  license?: string;
  allowed_excerpt?: { max_words: number; max_lines: number };
  supersedes?: string;
  deprecated_by?: string;
  created_at?: string;
  updated_at?: string;
  owner?: string;
  [key: string]: unknown;
}

interface MigrationEntry {
  kid: string;
  title: string;
  legacy_path: string;
  canonical_path: string;
  content_type: string;
  primary_domain: string;
  pillar_refs: string[];
  industry_refs: string[];
  stack_family_refs: string[];
  tags: string[];
  status: string;
  authority_tier: string;
}

function parseFrontmatter(content: string): { data: FrontmatterData; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const yamlStr = match[1];
  const body = match[2];
  const data: FrontmatterData = {};

  let currentKey = "";
  let currentArrayKey = "";
  const lines = yamlStr.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("- ") && currentArrayKey) {
      const val = trimmed.slice(2).trim().replace(/^["']|["']$/g, "");
      if (!Array.isArray(data[currentArrayKey])) {
        (data as Record<string, unknown>)[currentArrayKey] = [];
      }
      (data[currentArrayKey] as string[]).push(val);
      continue;
    }

    const kvMatch = trimmed.match(/^(\w[\w_]*):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const rawVal = kvMatch[2].trim();

      if (rawVal === "" || rawVal === "[]") {
        currentArrayKey = currentKey;
        if (rawVal === "[]") {
          (data as Record<string, unknown>)[currentKey] = [];
          currentArrayKey = "";
        }
        continue;
      }

      currentArrayKey = "";
      let val: string | number | boolean = rawVal.replace(/^["']|["']$/g, "");
      if (val === "true") val = true as unknown as string;
      else if (val === "false") val = false as unknown as string;
      else if (/^\d+$/.test(val)) val = parseInt(val, 10) as unknown as string;

      (data as Record<string, unknown>)[currentKey] = val;
    }
  }

  return { data, body };
}

function inferFromPath(
  relPath: string
): {
  pillar_refs: string[];
  content_type: string;
  primary_domain: string;
  industry_refs: string[];
  stack_family_refs: string[];
} {
  const parts = relPath.split("/");
  const pillarName = parts[0] || "";
  const pillarRef = PILLAR_MAP[pillarName] || "unknown";

  let domain = "general";
  let contentType = "reference";
  const industryRefs: string[] = [];
  const stackFamilyRefs: string[] = [];

  if (pillarName === "INDUSTRY_PLAYBOOKS") {
    if (parts[1]) {
      domain = parts[1];
      industryRefs.push(parts[1]);
    }
    if (parts[2]) {
      contentType = CONTENT_TYPE_MAP[parts[2]] || parts[2];
    }
  } else if (pillarName === "LANGUAGES_AND_LIBRARIES") {
    if (parts[2]) {
      domain = parts[2];
      stackFamilyRefs.push(parts[2]);
    } else if (parts[1]) {
      domain = parts[1];
    }
    if (parts[3]) {
      contentType = CONTENT_TYPE_MAP[parts[3]] || parts[3];
    }
  } else if (pillarName === "IT_END_TO_END") {
    if (parts[2]) {
      domain = parts[2];
    } else if (parts[1]) {
      domain = parts[1];
    }
    if (parts[3]) {
      contentType = CONTENT_TYPE_MAP[parts[3]] || parts[3];
    }
  }

  return {
    pillar_refs: [pillarRef],
    content_type: contentType,
    primary_domain: domain,
    industry_refs: industryRefs,
    stack_family_refs: stackFamilyRefs,
  };
}

function buildNewFrontmatter(
  fm: FrontmatterData,
  inferred: ReturnType<typeof inferFromPath>,
  legacyPath: string
): string {
  const kid = fm.kid!;
  const title = fm.title || kid;
  const contentType = CONTENT_TYPE_MAP[fm.type || ""] || inferred.content_type;
  const primaryDomain =
    fm.domains && fm.domains.length > 0 ? fm.domains[0] : inferred.primary_domain;
  const secondaryDomains =
    fm.domains && fm.domains.length > 1 ? fm.domains.slice(1) : [];
  const industryRefs = inferred.industry_refs;
  const stackFamilyRefs = inferred.stack_family_refs;
  const pillarRefs = inferred.pillar_refs;
  const status =
    fm.deprecated_by && fm.deprecated_by !== "" ? "deprecated" : "active";
  const authorityTier = AUTHORITY_MAP[fm.maturity || ""] || "draft";
  const tags = fm.tags || [];
  const bundleRefs: string[] = [];

  const lines = [
    "---",
    `kid: "${kid}"`,
    `title: "${title.replace(/"/g, '\\"')}"`,
    `content_type: "${contentType}"`,
    `primary_domain: "${primaryDomain}"`,
  ];

  if (secondaryDomains.length > 0) {
    lines.push("secondary_domains:");
    for (const d of secondaryDomains) lines.push(`  - "${d}"`);
  }

  lines.push("industry_refs:");
  if (industryRefs.length > 0) {
    for (const r of industryRefs) lines.push(`  - "${r}"`);
  } else {
    lines[lines.length - 1] = "industry_refs: []";
  }

  lines.push("stack_family_refs:");
  if (stackFamilyRefs.length > 0) {
    for (const r of stackFamilyRefs) lines.push(`  - "${r}"`);
  } else {
    lines[lines.length - 1] = "stack_family_refs: []";
  }

  lines.push("pillar_refs:");
  for (const r of pillarRefs) lines.push(`  - "${r}"`);

  lines.push(`status: "${status}"`);
  lines.push(`authority_tier: "${authorityTier}"`);

  if (fm.maturity === "golden") {
    lines.push(`freshness_class: "versioned_stable"`);
  }

  lines.push("bundle_refs: []");

  lines.push("tags:");
  if (tags.length > 0) {
    for (const t of tags) lines.push(`  - "${t}"`);
  } else {
    lines[lines.length - 1] = "tags: []";
  }

  lines.push(`legacy_path: "${legacyPath}"`);

  if (fm.supersedes && fm.supersedes !== "") {
    lines.push("supersedes:");
    lines.push(`  - "${fm.supersedes}"`);
  }

  if (fm.deprecated_by && fm.deprecated_by !== "") {
    lines.push("replaced_by:");
    lines.push(`  - "${fm.deprecated_by}"`);
  }

  if (fm.created_at) lines.push(`created_at: "${fm.created_at}"`);
  if (fm.updated_at) lines.push(`updated_at: "${fm.updated_at}"`);
  if (fm.owner) lines.push(`owner: "${fm.owner}"`);

  lines.push("---");
  return lines.join("\n");
}

function walkDir(dir: string, base: string, results: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, base, results);
    } else if (entry.name.endsWith(".md") && entry.name !== "_meta.md" && entry.name !== "README_LEGACY_MIGRATION.md") {
      results.push(path.relative(base, full));
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const applyMode = args.includes("--apply");
  const dryRun = !applyMode;

  console.log(`Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`PILLARS_DIR: ${PILLARS_DIR}`);
  console.log(`CONTENT_ITEMS_DIR: ${CONTENT_ITEMS_DIR}`);

  const allFiles: string[] = [];
  walkDir(PILLARS_DIR, PILLARS_DIR, allFiles);
  console.log(`Found ${allFiles.length} .md files in PILLARS/`);

  const withKid: { relPath: string; fm: FrontmatterData; body: string }[] = [];
  const missingKid: { relPath: string; reason: string }[] = [];

  for (const relPath of allFiles) {
    const fullPath = path.join(PILLARS_DIR, relPath);
    const content = fs.readFileSync(fullPath, "utf8");
    const { data, body } = parseFrontmatter(content);

    if (data.kid && typeof data.kid === "string" && data.kid.startsWith("KID-")) {
      withKid.push({ relPath, fm: data, body });
    } else {
      missingKid.push({ relPath, reason: data.kid ? `Invalid kid format: ${data.kid}` : "No kid field" });
    }
  }

  console.log(`Files with valid KID: ${withKid.length}`);
  console.log(`Files missing KID: ${missingKid.length}`);

  const kidMap = new Map<string, string[]>();
  for (const entry of withKid) {
    const kid = entry.fm.kid!;
    if (!kidMap.has(kid)) kidMap.set(kid, []);
    kidMap.get(kid)!.push(entry.relPath);
  }

  const collisions: { kid: string; paths: string[] }[] = [];
  for (const [kid, paths] of kidMap) {
    if (paths.length > 1) {
      collisions.push({ kid, paths });
    }
  }

  if (collisions.length > 0) {
    console.log(`\nWARNING: ${collisions.length} KID collisions detected:`);
    for (const c of collisions) {
      console.log(`  ${c.kid}: ${c.paths.join(", ")}`);
    }
  }

  const aliases: Record<string, string> = {};
  const relationships: Record<string, {
    legacy_path: string;
    current_path: string;
    depends_on: string[];
    related_kids: string[];
    supersedes: string[];
    replaced_by: string[];
    collection_keys: string[];
  }> = {};

  const migrated: MigrationEntry[] = [];
  const seenKids = new Set<string>();

  for (const entry of withKid) {
    const kid = entry.fm.kid!;
    if (seenKids.has(kid)) continue;
    seenKids.add(kid);

    const inferred = inferFromPath(entry.relPath);
    const legacyPath = `PILLARS/${entry.relPath}`;
    const canonicalFilename = `${kid}.md`;
    const canonicalPath = path.join(CONTENT_ITEMS_DIR, canonicalFilename);
    const canonicalRelPath = `Axion/libraries/knowledge/CONTENT/ITEMS/${canonicalFilename}`;

    const newFrontmatter = buildNewFrontmatter(entry.fm, inferred, legacyPath);
    const newContent = newFrontmatter + "\n" + entry.body;

    if (!dryRun) {
      fs.writeFileSync(canonicalPath, newContent, "utf8");
    }

    const oldBasename = path.basename(entry.relPath, ".md");
    if (oldBasename !== kid) {
      aliases[oldBasename.toLowerCase()] = kid;
    }

    const contentType = CONTENT_TYPE_MAP[entry.fm.type || ""] || inferred.content_type;
    const primaryDomain =
      entry.fm.domains && entry.fm.domains.length > 0
        ? entry.fm.domains[0]
        : inferred.primary_domain;

    const collectionKeys: string[] = [];
    if (primaryDomain && primaryDomain !== "general") {
      collectionKeys.push(`domain.${primaryDomain}`);
    }
    for (const p of inferred.pillar_refs) {
      collectionKeys.push(`pillar.${p}`);
    }
    for (const i of inferred.industry_refs) {
      collectionKeys.push(`industry.${i}`);
    }
    for (const s of inferred.stack_family_refs) {
      collectionKeys.push(`stack.${s}`);
    }

    relationships[kid] = {
      legacy_path: legacyPath,
      current_path: canonicalRelPath,
      depends_on: [],
      related_kids: [],
      supersedes: entry.fm.supersedes && entry.fm.supersedes !== "" ? [entry.fm.supersedes] : [],
      replaced_by: entry.fm.deprecated_by && entry.fm.deprecated_by !== "" ? [entry.fm.deprecated_by] : [],
      collection_keys: collectionKeys,
    };

    migrated.push({
      kid,
      title: entry.fm.title || kid,
      legacy_path: legacyPath,
      canonical_path: canonicalRelPath,
      content_type: contentType,
      primary_domain: primaryDomain,
      pillar_refs: inferred.pillar_refs,
      industry_refs: inferred.industry_refs,
      stack_family_refs: inferred.stack_family_refs,
      tags: entry.fm.tags || [],
      status: entry.fm.deprecated_by && entry.fm.deprecated_by !== "" ? "deprecated" : "active",
      authority_tier: AUTHORITY_MAP[entry.fm.maturity || ""] || "draft",
    });
  }

  const reportDir = path.join(KNOWLEDGE_ROOT, "OUTPUTS");
  fs.mkdirSync(reportDir, { recursive: true });

  const report = {
    timestamp: new Date().toISOString(),
    mode: dryRun ? "dry_run" : "apply",
    total_files: allFiles.length,
    with_kid: withKid.length,
    missing_kid: missingKid.length,
    collisions: collisions.length,
    migrated: migrated.length,
    aliases_created: Object.keys(aliases).length,
  };

  fs.writeFileSync(
    path.join(reportDir, "migration_report.json"),
    JSON.stringify(report, null, 2)
  );
  fs.writeFileSync(
    path.join(reportDir, "migration_collisions.json"),
    JSON.stringify(collisions, null, 2)
  );
  fs.writeFileSync(
    path.join(reportDir, "migration_missing_kid.json"),
    JSON.stringify(missingKid, null, 2)
  );
  fs.writeFileSync(
    path.join(reportDir, "migration_moved.json"),
    JSON.stringify(migrated, null, 2)
  );

  if (!dryRun) {
    fs.writeFileSync(ALIASES_PATH, JSON.stringify(aliases, null, 2));
    fs.writeFileSync(RELATIONSHIPS_PATH, JSON.stringify(relationships, null, 2));
    console.log(`\nRegistries written:`);
    console.log(`  aliases.index.json: ${Object.keys(aliases).length} entries`);
    console.log(`  relationships.index.json: ${Object.keys(relationships).length} entries`);
  }

  console.log(`\nMigration Report:`);
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nReports written to ${reportDir}/`);

  if (dryRun) {
    console.log(`\nRun with --apply to execute migration.`);
  }
}

main();
