import OpenAI from "openai";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, basename } from "node:path";
import { existsSync } from "node:fs";

const client = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const PILLARS_DIR = "Axion/libraries/knowledge/PILLARS";
const CONCURRENCY = 8;
const TARGET_PILLAR = process.argv[2];
const KIDS_PER_DOMAIN = 3;

if (!TARGET_PILLAR) {
  console.error("Usage: node scripts/create-new-kids.mjs <PILLAR_NAME>");
  process.exit(1);
}

const ID_PREFIXES = {
  IT_END_TO_END: "IT",
  LANGUAGES_AND_LIBRARIES: "LANG",
  INDUSTRY_PLAYBOOKS: "IND",
};

const DOMAIN_ABBREVS = {};

function makeDomainAbbrev(domain) {
  if (DOMAIN_ABBREVS[domain]) return DOMAIN_ABBREVS[domain];
  const parts = domain.split(/[_-]/).filter(Boolean);
  let abbrev;
  if (parts.length === 1) {
    abbrev = parts[0].slice(0, 4).toUpperCase();
  } else if (parts.length === 2) {
    abbrev = (parts[0].slice(0, 2) + parts[1].slice(0, 2)).toUpperCase();
  } else {
    abbrev = parts.map(p => p[0]).join("").toUpperCase().slice(0, 5);
  }
  DOMAIN_ABBREVS[domain] = abbrev;
  return abbrev;
}

const TYPE_CONFIGS = [
  { type: "concept", folder: "concepts", suffix: "CONCEPT", titleTemplate: (domain) => `${formatDomain(domain)} Fundamentals and Mental Model` },
  { type: "pattern", folder: "patterns", suffix: "PATTERN", titleTemplate: (domain) => `${formatDomain(domain)} Common Implementation Patterns` },
  { type: "checklist", folder: "checklists", suffix: "CHECK", titleTemplate: (domain) => `${formatDomain(domain)} Production Readiness Checklist` },
];

function formatDomain(slug) {
  return slug.replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const TYPE_FOLDERS = new Set(["concepts", "patterns", "checklists", "procedures", "pitfalls", "references", "examples"]);
const PLAYBOOK_FOLDERS = new Set(["workflows", "data_models", "integrations", "compliance", "security_risk", "kpis_metrics"]);
const SKIP_DIRS = new Set([...TYPE_FOLDERS, ...PLAYBOOK_FOLDERS, "_meta"]);

async function countKidsRecursive(dir) {
  let count = 0;
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && e.name.startsWith("KID-") && e.name.endsWith(".md")) count++;
      else if (e.isDirectory()) count += await countKidsRecursive(join(dir, e.name));
    }
  } catch {}
  return count;
}

async function findEmptyDomains(pillarDir) {
  const empty = [];
  async function walk(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
    const subdirs = entries.filter(e => e.isDirectory());
    const isLeafDomain = subdirs.some(d => TYPE_FOLDERS.has(d.name) || PLAYBOOK_FOLDERS.has(d.name));
    
    if (isLeafDomain) {
      const kidCount = await countKidsRecursive(dir);
      if (kidCount === 0) {
        empty.push(dir);
      }
      return;
    }
    
    for (const sd of subdirs) {
      if (!SKIP_DIRS.has(sd.name)) {
        await walk(join(dir, sd.name));
      }
    }
  }
  await walk(pillarDir);
  return empty;
}

function buildPrompt(title, type, domain, pillar) {
  const typeGuide = {
    concept: "Write a clear explanatory article. Define the concept, explain why it matters, and describe how it fits into the broader domain. Include concrete examples.",
    pattern: "Write a practical how-to guide for this pattern. Describe the problem it solves, the solution approach with concrete implementation steps, tradeoffs, and when to use alternatives.",
    checklist: "Write an actionable checklist. Each item should be a concrete, verifiable action. Group related items. Include rationale for critical items.",
  };

  return `You are a senior technical writer creating a knowledge article for a software engineering knowledge base.

Topic: "${title}"
Type: ${type}
Domain: ${domain}
Pillar: ${pillar}

${typeGuide[type] || typeGuide.concept}

Write the following sections in markdown. Be specific, technical, and practical. Avoid filler. Target 300-500 words total.

## Summary
(2-3 sentence overview)

## When to Use
(Specific scenarios where this applies)

## Do / Don't
(Concrete do/don't pairs, at least 3 of each)

## Core Content
(The main body — thorough and specific)

## Links
(2-4 related topics or references, descriptive text)

## Proof / Confidence
(Evidence: industry standards, benchmarks, or common practice)`;
}

async function generateAndCreateKid(domainDir, typeConfig, pillar, domain, counter) {
  const prefix = ID_PREFIXES[pillar] || "XX";
  const abbrev = makeDomainAbbrev(domain);
  const kidId = `KID-${prefix}${abbrev}-${typeConfig.suffix}-${String(counter).padStart(4, "0")}`;
  const title = typeConfig.titleTemplate(domain);
  
  const typeDir = join(domainDir, typeConfig.folder);
  if (!existsSync(typeDir)) {
    await mkdir(typeDir, { recursive: true });
  }
  
  const filePath = join(typeDir, `${kidId}.md`);
  if (existsSync(filePath)) return { kidId, filePath, skipped: true };

  const prompt = buildPrompt(title, typeConfig.type, domain, pillar);
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  let generated;
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1200,
    }, { signal: controller.signal });
    generated = response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error(`  ERROR generating ${kidId}: ${err.message}`);
    return { kidId, filePath, error: true };
  } finally {
    clearTimeout(timeout);
  }

  const frontmatter = `---
kid: "${kidId}"
title: "${title}"
type: "${typeConfig.type}"
pillar: "${pillar}"
domains:
  - "${domain}"
subdomains: []
tags:
  - "${domain}"
  - "${typeConfig.type}"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# ${title}

${generated}
`;

  await writeFile(filePath, frontmatter, "utf-8");
  return { kidId, filePath, created: true };
}

async function processDomain(domainDir, pillar) {
  const domain = basename(domainDir);
  const results = [];
  for (let i = 0; i < TYPE_CONFIGS.length; i++) {
    const r = await generateAndCreateKid(domainDir, TYPE_CONFIGS[i], pillar, domain, 1);
    results.push(r);
  }
  return results;
}

async function main() {
  const pillarDir = join(PILLARS_DIR, TARGET_PILLAR);
  console.log(`\nFinding empty domains in ${pillarDir}...`);
  const emptyDomains = await findEmptyDomains(pillarDir);
  console.log(`Found ${emptyDomains.length} empty domains\n`);

  if (emptyDomains.length === 0) {
    console.log("No empty domains found.");
    return;
  }

  let created = 0, errors = 0, skipped = 0;
  for (let i = 0; i < emptyDomains.length; i += CONCURRENCY) {
    const batch = emptyDomains.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map(d => processDomain(d, TARGET_PILLAR))
    );
    for (const br of batchResults) {
      if (br.status === "fulfilled") {
        for (const r of br.value) {
          if (r.created) created++;
          else if (r.skipped) skipped++;
          else errors++;
        }
      } else {
        errors += 3;
      }
    }
    console.log(`  Progress: ${i + batch.length}/${emptyDomains.length} domains (${created} created, ${errors} errors, ${skipped} skipped)`);
  }

  console.log(`\nDone! ${created} KIDs created, ${errors} errors, ${skipped} skipped.`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
