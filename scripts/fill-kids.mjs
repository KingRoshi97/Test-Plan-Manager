import OpenAI from "openai";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, basename, relative } from "node:path";

const client = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const PILLARS_DIR = "Axion/libraries/knowledge/PILLARS";
const CONCURRENCY = 10;
const TARGET_PILLAR = process.argv[2];

if (!TARGET_PILLAR) {
  console.error("Usage: node scripts/fill-kids.mjs <PILLAR_NAME>");
  console.error("  e.g. IT_END_TO_END | LANGUAGES_AND_LIBRARIES | INDUSTRY_PLAYBOOKS");
  process.exit(1);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const fm = {};
  let currentKey = null;
  let inArray = false;
  for (const line of match[1].split("\n")) {
    const kvMatch = line.match(/^(\w[\w_]*)\s*:\s*(.*)$/);
    if (kvMatch && !line.startsWith("  ")) {
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim();
      if (val === "" || val === "[]") {
        fm[currentKey] = [];
        inArray = true;
      } else {
        fm[currentKey] = val.replace(/^["']|["']$/g, "");
        inArray = false;
      }
    } else if (line.match(/^\s+-\s+/) && currentKey) {
      const item = line.replace(/^\s+-\s+/, "").replace(/^["']|["']$/g, "");
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      fm[currentKey].push(item);
    }
  }
  return { frontmatter: match[1], body: match[2], parsed: fm, raw: content };
}

async function findKidFiles(pillarDir) {
  const results = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.name.startsWith("KID-") && e.name.endsWith(".md")) results.push(full);
    }
  }
  await walk(pillarDir);
  return results;
}

function buildPrompt(parsed) {
  const title = parsed.title || "Unknown";
  const type = parsed.type || "concept";
  const domains = Array.isArray(parsed.domains) ? parsed.domains.join(", ") : parsed.domains || "";
  const pillar = parsed.pillar || "";
  const tags = Array.isArray(parsed.tags) ? parsed.tags.join(", ") : "";

  const typeGuide = {
    concept: "Write a clear explanatory article. Define the concept, explain why it matters, and describe how it fits into the broader domain. Include concrete examples.",
    pattern: "Write a practical how-to guide for this pattern. Describe the problem it solves, the solution approach with concrete implementation steps, tradeoffs, and when to use alternatives.",
    procedure: "Write a step-by-step procedure. Number each step clearly, include prerequisites, expected outcomes per step, and common failure modes.",
    checklist: "Write an actionable checklist. Each item should be a concrete, verifiable action. Group related items. Include rationale for critical items.",
    pitfall: "Write a detailed warning about this pitfall. Describe the mistake, why people make it, the consequences, how to detect it, and how to fix or avoid it. Include a real-world scenario.",
    reference: "Write a concise reference document. Include key definitions, parameters, configuration options, or lookup values. Use tables or structured lists where appropriate.",
    example: "Write a worked example/case study. Present a realistic scenario, walk through the solution step by step, and highlight key decisions and their rationale.",
    glossary_term: "Write a clear definition with context. Include etymology if relevant, related terms, and usage examples."
  };

  return `You are a senior technical writer creating a knowledge article for a software engineering knowledge base.

Topic: "${title}"
Type: ${type}
Domain: ${domains}
Pillar: ${pillar}
Tags: ${tags}

${typeGuide[type] || typeGuide.concept}

Write the following sections in markdown. Be specific, technical, and practical. Avoid filler language. Target 300-600 words total.

## Summary
(2-3 sentence overview)

## When to Use
(Specific scenarios and conditions where this applies)

## Do / Don't
(Concrete do/don't pairs, at least 3 of each)

## Core Content
(The main body — this is the most important section. Be thorough and specific.)

## Links
(List 2-4 related topics, standards, or external references. Use descriptive text, not URLs.)

## Proof / Confidence
(What evidence supports this content? Cite industry standards, benchmarks, or common practice.)`;
}

async function generateContent(parsed) {
  const prompt = buildPrompt(parsed);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1500,
    }, { signal: controller.signal });
    return response.choices[0]?.message?.content || "";
  } finally {
    clearTimeout(timeout);
  }
}

async function processKid(filePath) {
  const content = await readFile(filePath, "utf-8");
  const coreMatch = content.match(/## Core [Cc]ontent\s*\n([\s\S]*?)(?=\n## |\n$|$)/);
  const coreBody = coreMatch ? coreMatch[1].trim() : "";
  const coreLines = coreBody.split("\n").filter(l => l.trim()).length;
  const isStub = coreLines < 5;
  if (!isStub) {
    return "skip";
  }
  const result = parseFrontmatter(content);
  if (!result) {
    console.log(`  SKIP (no frontmatter): ${filePath}`);
    return false;
  }

  const updatedFrontmatter = result.frontmatter.replace(
    /^maturity:\s*"?draft"?$/m,
    'maturity: "reviewed"'
  );

  let generated;
  try {
    generated = await generateContent(result.parsed);
  } catch (err) {
    console.error(`  ERROR: ${filePath}: ${err.message}`);
    return false;
  }

  const title = result.parsed.title || basename(filePath, ".md");
  const newContent = `---\n${updatedFrontmatter}\n---\n\n# ${title}\n\n${generated}\n`;

  await writeFile(filePath, newContent, "utf-8");
  return true;
}

async function runBatch(files, concurrency) {
  let processed = 0;
  let failed = 0;
  const total = files.length;

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map(f => processKid(f))
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value === "skip") { /* already done */ }
      else if (r.status === "fulfilled" && r.value) processed++;
      else failed++;
    }
    console.log(`  Progress: ${processed + failed}/${total} (${processed} ok, ${failed} failed)`);
  }
  return { processed, failed };
}

async function main() {
  const pillarDir = join(PILLARS_DIR, TARGET_PILLAR);
  console.log(`\nFinding KID files in ${pillarDir}...`);
  const files = await findKidFiles(pillarDir);
  console.log(`Found ${files.length} KID files\n`);

  if (files.length === 0) {
    console.log("No KID files found.");
    return;
  }

  console.log(`Processing with concurrency=${CONCURRENCY}...\n`);
  const { processed, failed } = await runBatch(files, CONCURRENCY);
  console.log(`\nDone! ${processed} processed, ${failed} failed out of ${files.length} total.`);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
