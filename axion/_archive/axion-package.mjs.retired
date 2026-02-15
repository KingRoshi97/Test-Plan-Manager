// scripts/assembler-package.mjs
// Creates a distributable Agent Handoff Bundle zip
// Adapted from Roshi spec - uses root-level paths (docs/assembler_v1, assembler/) not workspace/

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import archiver from "archiver";

const ROOT = process.cwd();

function parseArgs(argv) {
  const args = { domain: null, dryRun: false, force: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--force") args.force = true;
    else if (a === "--domain") args.domain = argv[++i] ?? null;
  }
  return args;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).replaceAll("\\", "/");
}

function collectFiles({ domain }) {
  const files = [];

  const mustRoots = [
    "assembler/domains.json",
    "assembler/sources.json",
    "docs/assembler_v1/README.md",
    "docs/assembler_v1/00_product",
    "docs/assembler_v1/00_registry",
    "docs/assembler_v1/01_templates"
  ];

  if (domain) {
    mustRoots.push(`docs/assembler_v1/02_domains/${domain}`);
  } else {
    mustRoots.push("docs/assembler_v1/02_domains");
  }

  const optionalRoots = [
    "docs/inputs/TARGET_OUTLINE.md"
  ];

  const addRoot = (r, required) => {
    const abs = path.join(ROOT, r);
    if (!exists(abs)) {
      if (required) throw new Error(`Missing required path: ${r}`);
      return;
    }
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      for (const f of walk(abs)) files.push(f);
    } else {
      files.push(abs);
    }
  };

  for (const r of mustRoots) addRoot(r, true);
  for (const r of optionalRoots) addRoot(r, false);

  return [...new Set(files)].sort();
}

function scanOpenQuestions(domain) {
  const base = domain
    ? path.join(ROOT, "docs/assembler_v1/02_domains", domain)
    : path.join(ROOT, "docs/assembler_v1/02_domains");

  if (!exists(base)) return { count: 0, paths: [] };

  const allFiles = walk(base);
  const oqFiles = allFiles.filter(f => f.includes("OPEN_QUESTIONS"));
  
  let unknownCount = 0;
  for (const f of oqFiles) {
    const content = fs.readFileSync(f, "utf8");
    const matches = content.match(/UNKNOWN/g);
    if (matches) unknownCount += matches.length;
  }

  return {
    count: unknownCount,
    paths: oqFiles.map(rel)
  };
}

function countUnknownsInDomains(domain) {
  const base = domain
    ? path.join(ROOT, "docs/assembler_v1/02_domains", domain)
    : path.join(ROOT, "docs/assembler_v1/02_domains");

  if (!exists(base)) return 0;

  const allFiles = walk(base).filter(f => f.endsWith(".md"));
  let count = 0;
  for (const f of allFiles) {
    const content = fs.readFileSync(f, "utf8");
    const matches = content.match(/UNKNOWN/g);
    if (matches) count += matches.length;
  }
  return count;
}

function printRoshiReport(report) {
  console.log("\n========== ASSEMBLER_REPORT ==========");
  console.log(`Script: roshi:package`);
  console.log(`Mode: ${report.dryRun ? "DRY-RUN" : "EXECUTE"}`);
  console.log(`Domain: ${report.domain || "ALL"}`);
  console.log(`Status: ${report.ok ? "SUCCESS" : "FAILED"}`);
  console.log("");
  console.log(`Created (${report.created.length}):`);
  for (const c of report.created) console.log(`  + ${c}`);
  console.log("");
  console.log(`Modified (${report.modified.length}):`);
  for (const m of report.modified) console.log(`  ~ ${m}`);
  console.log("");
  console.log(`Skipped (${report.skipped.length}):`);
  for (const s of report.skipped) console.log(`  - ${s}`);
  console.log("");
  console.log(`Failed (${report.failed}):`);
  for (const f of report.failures) console.log(`  ! ${f}`);
  console.log("");
  if (report.outputs.zipSha256) {
    console.log(`Zip SHA256: ${report.outputs.zipSha256}`);
  }
  if (report.outputs.fileCount !== undefined) {
    console.log(`Files in bundle: ${report.outputs.fileCount}`);
  }
  if (report.outputs.unknownCount !== undefined) {
    console.log(`UNKNOWN tokens: ${report.outputs.unknownCount}`);
  }
  console.log("===================================\n");
}

(async function main() {
  const args = parseArgs(process.argv);

  const report = {
    command: "roshi:package",
    ok: false,
    failed: 0,
    failures: [],
    created: [],
    modified: [],
    skipped: [],
    dryRun: args.dryRun,
    domain: args.domain,
    outputs: {}
  };

  try {
    const domainsPath = path.join(ROOT, "assembler/domains.json");
    if (!exists(domainsPath)) throw new Error("Missing assembler/domains.json");

    const domainsData = readJson(domainsPath);
    const domainSlugs = Array.isArray(domainsData.domains)
      ? domainsData.domains.map(d => d.slug)
      : [];

    if (args.domain && !domainSlugs.includes(args.domain)) {
      throw new Error(`Invalid domain '${args.domain}'. Must be one of: ${domainSlugs.join(", ")}`);
    }

    const distDir = path.join(ROOT, "dist");
    const bundleDir = path.join(distDir, "axiom_kit");
    const zipOut = path.join(distDir, "axiom_kit.zip");

    if (exists(zipOut) && !args.force) {
      report.skipped.push(rel(zipOut));
      report.ok = true;
      printRoshiReport(report);
      return;
    }

    const openQ = scanOpenQuestions(args.domain);
    const unknownCount = countUnknownsInDomains(args.domain);

    const manifest = {
      bundleVersion: "0.1.0",
      createdAt: new Date().toISOString(),
      project: {
        name: "Roshi Studio",
        intent: "api+web powered by @assembler/core"
      },
      pipeline: {
        state: "draft",
        domains: args.domain ? [args.domain] : domainSlugs
      },
      entryDocs: [
        "docs/assembler_v1/README.md",
        "docs/assembler_v1/00_product/PROJECT_OVERVIEW.md",
        "docs/assembler_v1/00_registry/domain-map.md"
      ],
      commandsToRun: [
        "npm run roshi:review",
        "npm run roshi:verify",
        "npm run roshi:lock"
      ],
      doNotTouch: [
        "docs/assembler_v1/00_registry/**"
      ],
      openQuestions: openQ,
      implementationPlan: [
        {
          step: 1,
          title: "Scaffold API skeleton",
          outputs: ["server entrypoint", "routes folder", "run storage model"],
          acceptance: ["GET /health returns 200", "POST /v1/runs returns runId"]
        },
        {
          step: 2,
          title: "Implement runs + bundle metadata endpoints",
          outputs: ["run CRUD", "bundle metadata", "signed URLs"],
          acceptance: ["GET /v1/runs/:id returns status", "GET /v1/runs/:id/bundle returns checksums + signed url"]
        },
        {
          step: 3,
          title: "Implement handoffs (pull, webhook, git)",
          outputs: ["handoff entity", "adapters", "delivery logic"],
          acceptance: ["POST handoff works for each type", "retry works", "webhook signature verified"]
        },
        {
          step: 4,
          title: "Build web UI",
          outputs: ["home page", "run history", "status display"],
          acceptance: ["can submit idea", "can see progress", "can download bundle"]
        }
      ],
      artifacts: {
        zipPath: "dist/axiom_kit.zip",
        workspaceRoot: "./"
      }
    };

    const agentPrompt = `# Roshi Agent Handoff

You are receiving a Roshi bundle generated by roshi:package.

## What this bundle contains
- Roshi v2 docs under /docs/assembler_v1
- Registry/product docs and domain packs
- manifest.json is the source of truth

## Non-negotiable rules
- No invention: missing info stays UNKNOWN + logged to Open Questions
- Verify before lock
- No overwrite unless explicitly allowed
- Always output ASSEMBLER_REPORT at the end of each run

## What to do next
1) Read:
   - docs/assembler_v1/README.md
   - docs/assembler_v1/00_product/PROJECT_OVERVIEW.md
   - docs/assembler_v1/00_registry/domain-map.md
2) Run:
   - npm run roshi:review
   - npm run roshi:verify
   - npm run roshi:lock

## Current Open Questions
UNKNOWN Count: ${unknownCount}
Open Question Files:
${openQ.paths.map(p => `- ${p}`).join("\n") || "- (none)"}
`;

    const files = collectFiles({ domain: args.domain });
    report.outputs.fileCount = files.length;
    report.outputs.unknownCount = unknownCount;

    if (args.dryRun) {
      report.ok = true;
      report.outputs.wouldWrite = [
        "dist/axiom_kit/manifest.json",
        "dist/axiom_kit/agent_prompt.md",
        "dist/axiom_kit.zip"
      ];
      printRoshiReport(report);
      return;
    }

    ensureDir(bundleDir);

    const manifestPath = path.join(bundleDir, "manifest.json");
    const promptPath = path.join(bundleDir, "agent_prompt.md");

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    fs.writeFileSync(promptPath, agentPrompt);

    report.created.push(rel(manifestPath), rel(promptPath));

    const output = fs.createWriteStream(zipOut);
    const archive = archiver("zip", { zlib: { level: 9 } });

    const done = new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
      archive.on("warning", (err) => { if (err.code !== "ENOENT") reject(err); });
      archive.on("error", reject);
    });

    archive.pipe(output);

    archive.file(manifestPath, { name: "axiom_kit/manifest.json" });
    archive.file(promptPath, { name: "axiom_kit/agent_prompt.md" });

    for (const abs of files) {
      const inside = path.posix.join("axiom_kit", rel(abs));
      archive.file(abs, { name: inside });
    }

    await archive.finalize();
    await done;

    report.created.push(rel(zipOut));
    report.outputs.zipSha256 = sha256(fs.readFileSync(zipOut));
    report.ok = true;

    printRoshiReport(report);
  } catch (e) {
    report.failed = 1;
    report.failures.push(String(e?.message || e));
    printRoshiReport(report);
    process.exit(1);
  }
})();
