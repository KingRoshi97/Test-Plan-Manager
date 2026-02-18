// scripts/assembler-package-workspace.mjs
// Creates a distributable Agent Handoff Bundle from a workspace directory

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import archiver from "archiver";

function parseArgs(argv) {
  const args = { workspace: null, dryRun: false, force: true, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--force") args.force = true;
    else if (a === "--json") args.json = true;
    else if (a === "--workspace") args.workspace = argv[++i] ?? null;
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
  if (!exists(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function rel(base, p) {
  return path.relative(base, p).replaceAll("\\", "/");
}

function collectFiles(workspaceRoot) {
  const files = [];
  
  const roots = [
    "assembler/domains.json",
    "assembler/sources.json",
    "docs/assembler_v1",
    "docs/inputs",
    "handoff"
  ];
  
  for (const r of roots) {
    const abs = path.join(workspaceRoot, r);
    if (!exists(abs)) continue;
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      for (const f of walk(abs)) files.push(f);
    } else {
      files.push(abs);
    }
  }
  
  return [...new Set(files)].sort();
}

function scanOpenQuestions(workspaceRoot) {
  const domainsDir = path.join(workspaceRoot, "docs/assembler_v1/02_domains");
  if (!exists(domainsDir)) return { count: 0, paths: [] };

  const allFiles = walk(domainsDir);
  const oqFiles = allFiles.filter(f => f.includes("OPEN_QUESTIONS"));
  
  let unknownCount = 0;
  for (const f of oqFiles) {
    const content = fs.readFileSync(f, "utf8");
    const matches = content.match(/UNKNOWN/g);
    if (matches) unknownCount += matches.length;
  }

  return {
    count: unknownCount,
    paths: oqFiles.map(f => rel(workspaceRoot, f))
  };
}

function countUnknownsInDocs(workspaceRoot) {
  const docsDir = path.join(workspaceRoot, "docs/assembler_v1");
  if (!exists(docsDir)) return 0;

  const allFiles = walk(docsDir).filter(f => f.endsWith(".md"));
  let count = 0;
  for (const f of allFiles) {
    const content = fs.readFileSync(f, "utf8");
    const matches = content.match(/UNKNOWN/g);
    if (matches) count += matches.length;
  }
  return count;
}

(async function main() {
  const args = parseArgs(process.argv);
  const jsonMode = args.json;
  const startTime = Date.now();
  
  const workspaceRoot = args.workspace || process.env.ASSEMBLER_WORKSPACE;
  
  if (!workspaceRoot) {
    if (jsonMode) {
      const errReceipt = {
        stage: 'package-workspace',
        ok: false,
        createdFiles: [],
        modifiedFiles: [],
        skippedFiles: [],
        warnings: [],
        errors: ['--workspace path or ASSEMBLER_WORKSPACE env var required'],
        elapsedMs: Date.now() - startTime,
        dryRun: args.dryRun,
        packageSummary: { workspace: null, fileCount: 0, unknownCount: 0, zipSha256: null },
      };
      process.stdout.write(JSON.stringify(errReceipt, null, 2) + '\n');
    } else {
      console.error("Error: --workspace path or ASSEMBLER_WORKSPACE env var required");
    }
    process.exit(1);
  }

  const receipt = {
    stage: 'package-workspace',
    ok: true,
    createdFiles: [],
    modifiedFiles: [],
    skippedFiles: [],
    warnings: [],
    errors: [],
    elapsedMs: 0,
    dryRun: args.dryRun,
    packageSummary: {
      workspace: workspaceRoot,
      fileCount: 0,
      unknownCount: 0,
      zipSha256: null,
    },
  };

  function emitOutput() {
    receipt.elapsedMs = Date.now() - startTime;
    if (jsonMode) {
      process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    } else {
      console.log("\n========== ASSEMBLER_REPORT ==========");
      console.log(`Script: assembler:package-workspace`);
      console.log(`Mode: ${receipt.dryRun ? "DRY-RUN" : "EXECUTE"}`);
      console.log(`Workspace: ${receipt.packageSummary.workspace}`);
      console.log(`Status: ${receipt.ok ? "SUCCESS" : "FAILED"}`);
      console.log("");
      console.log(`Created (${receipt.createdFiles.length}):`);
      for (const c of receipt.createdFiles) console.log(`  + ${c}`);
      console.log("");
      if (receipt.packageSummary.zipSha256) {
        console.log(`Zip SHA256: ${receipt.packageSummary.zipSha256}`);
      }
      if (receipt.packageSummary.fileCount !== undefined) {
        console.log(`Files in bundle: ${receipt.packageSummary.fileCount}`);
      }
      if (receipt.packageSummary.unknownCount !== undefined) {
        console.log(`UNKNOWN tokens: ${receipt.packageSummary.unknownCount}`);
      }
      if (receipt.errors.length > 0) {
        console.log(`Errors: ${receipt.errors.join(', ')}`);
      }
      console.log("===================================\n");
    }
  }

  try {
    if (!exists(workspaceRoot)) {
      throw new Error(`Workspace not found: ${workspaceRoot}`);
    }
    
    const domainsPath = path.join(workspaceRoot, "assembler/domains.json");
    let domainSlugs = [];
    let projectName = "Generated Project";
    
    if (exists(domainsPath)) {
      const domainsData = readJson(domainsPath);
      domainSlugs = Array.isArray(domainsData.domains)
        ? domainsData.domains.map(d => d.slug)
        : [];
    }
    
    const overviewPath = path.join(workspaceRoot, "docs/assembler_v1/00_product/PROJECT_OVERVIEW.md");
    if (exists(overviewPath)) {
      const overview = fs.readFileSync(overviewPath, "utf8");
      const titleMatch = overview.match(/^#\s+(.+)/m);
      if (titleMatch) {
        projectName = titleMatch[1].replace(/\s*-.*$/, "").trim();
      }
    }

    const distDir = path.join(workspaceRoot, "dist");
    const bundleDir = path.join(distDir, "axiom_kit");
    const zipOut = path.join(distDir, "axiom_kit.zip");

    const openQ = scanOpenQuestions(workspaceRoot);
    const unknownCount = countUnknownsInDocs(workspaceRoot);

    const inputPath = path.join(workspaceRoot, "handoff/input.json");
    const aiContextPath = path.join(workspaceRoot, "handoff/ai_context.json");
    
    let inputData = {};
    let aiContextData = {};
    let generationMode = "ai";
    
    if (exists(inputPath)) {
      inputData = readJson(inputPath);
    }
    
    if (exists(aiContextPath)) {
      aiContextData = readJson(aiContextPath);
    }
    
    const inputSummary = {
      projectName: aiContextData.projectName || projectName,
      description: aiContextData.description || "",
      featureCount: (aiContextData.features || []).length,
      userTypeCount: (aiContextData.users || []).length,
      techStackProvided: !!(aiContextData.techStack && Object.keys(aiContextData.techStack).length > 0),
      hasStructuredInput: !!(inputData.features?.length || inputData.users?.length),
    };
    
    const inputArtifacts = [];
    const inputsDir = path.join(workspaceRoot, "docs/assembler_v1/inputs");
    if (exists(inputsDir)) {
      const compiledPath = path.join(inputsDir, "USER_UPLOADS_COMPILED.md");
      if (exists(compiledPath)) {
        const content = fs.readFileSync(compiledPath, "utf8");
        const fileCountMatch = content.match(/\*\*Files processed:\*\* (\d+)/);
        const charsMatch = content.match(/\*\*Total characters:\*\* ([\d,]+)/);
        inputArtifacts.push({
          type: "uploaded_docs",
          path: "docs/assembler_v1/inputs/USER_UPLOADS_COMPILED.md",
          stats: {
            fileCount: fileCountMatch ? parseInt(fileCountMatch[1], 10) : 0,
            totalChars: charsMatch ? parseInt(charsMatch[1].replace(/,/g, ""), 10) : 0
          }
        });
        
        const uploadsDir = path.join(inputsDir, "uploads");
        if (exists(uploadsDir)) {
          const uploadFiles = fs.readdirSync(uploadsDir).filter(f => f.endsWith(".txt"));
          for (const uf of uploadFiles) {
            inputArtifacts.push({
              type: "uploaded_doc_text",
              path: `docs/assembler_v1/inputs/uploads/${uf}`
            });
          }
        }
      }
    }
    
    const p0Features = (inputData.features || []).filter(f => f.priority === "P0");
    const p1Features = (inputData.features || []).filter(f => f.priority === "P1");
    const p2Features = (inputData.features || []).filter(f => f.priority === "P2");

    const manifest = {
      bundleVersion: "0.2.0",
      createdAt: new Date().toISOString(),
      generationMode,
      project: {
        name: projectName,
        intent: "Generated by Axiom Assembler"
      },
      inputSummary,
      pipeline: {
        state: "generated",
        domains: domainSlugs
      },
      entryDocs: [
        "docs/assembler_v1/README.md",
        "docs/assembler_v1/00_product/PROJECT_OVERVIEW.md",
        "docs/assembler_v1/00_product/RPBS_Product.md",
        "docs/assembler_v1/00_product/REBS_Product.md"
      ],
      commandsToRun: [
        "npm run assembler:gen",
        "npm run assembler:seed",
        "npm run assembler:draft",
        "npm run assembler:review",
        "npm run assembler:verify",
        "npm run assembler:lock"
      ],
      doNotTouch: [
        "docs/assembler_v1/00_registry/**"
      ],
      openQuestions: openQ,
      implementationPlan: [
        {
          step: 1,
          title: "Implement P0 features",
          source: "features[P0]",
          features: p0Features.map(f => f.name),
          outputs: ["Core functionality working"],
          acceptance: ["P0 features pass acceptance criteria"]
        },
        {
          step: 2,
          title: "Implement P1 features",
          source: "features[P1]",
          features: p1Features.map(f => f.name),
          outputs: ["Secondary features working"],
          acceptance: ["P1 features pass acceptance criteria"]
        },
        {
          step: 3,
          title: "Implement P2 features",
          source: "features[P2]",
          features: p2Features.map(f => f.name),
          outputs: ["Nice-to-have features working"],
          acceptance: ["P2 features complete if time permits"]
        },
        {
          step: 4,
          title: "Verify and finalize",
          outputs: ["All tests passing", "Documentation complete"],
          acceptance: ["assembler:verify passes", "All domains locked"]
        }
      ],
      artifacts: {
        zipPath: "dist/axiom_kit.zip",
        workspaceRoot: "./",
        inputJson: "handoff/input.json",
        aiContextJson: "handoff/ai_context.json"
      },
      inputArtifacts: inputArtifacts.length > 0 ? inputArtifacts : undefined
    };

    const axionDomainsJsonPath = path.join(workspaceRoot, "axion", "config", "domains.json");
    const sysDomainsJsonPath = path.resolve("axion", "config", "domains.json");
    let domainsConfig = null;
    for (const dp of [axionDomainsJsonPath, sysDomainsJsonPath]) {
      if (exists(dp)) {
        try { domainsConfig = readJson(dp); break; } catch { /* ignore */ }
      }
    }
    const buildPhaseMap = domainsConfig?.build_phase_map || {
      foundation: 2, data: 2, security: 2,
      core: 3, frontend: 3, integration: 3, platform: 3,
      quality: 4, crosscutting: 4, operations: 4, developer: 4
    };

    const assemblerDomainsDir = path.join(workspaceRoot, "docs/assembler_v1/02_domains");
    const phaseGroups = { 2: [], 3: [], 4: [] };
    const presentDomainSet = new Set(domainSlugs);
    for (const mod of (domainsConfig?.modules || [])) {
      if (!presentDomainSet.has(mod.slug)) continue;
      const phase = buildPhaseMap[mod.type] || 4;
      if (!phaseGroups[phase]) phaseGroups[phase] = [];
      phaseGroups[phase].push(mod);
    }

    function domainDocList(slug) {
      const domDir = path.join(assemblerDomainsDir, slug);
      if (!exists(domDir)) return [];
      try {
        return fs.readdirSync(domDir).filter(f => f.endsWith(".md"));
      } catch { return []; }
    }

    function docSizeKb(filePath) {
      try { return Math.round(fs.statSync(filePath).size / 1024); } catch { return 0; }
    }

    let phaseSections = "";
    const phaseLabels = {
      2: { title: "Phase 2: Foundation Domains", goal: "Build database, contracts, auth — the invisible foundation." },
      3: { title: "Phase 3: Core Features & User Interface", goal: "Build everything the user can see and interact with. This is the MOST IMPORTANT phase." },
      4: { title: "Phase 4: Polish, Testing & Hardening", goal: "Add testing, security hardening, and operational readiness." },
    };

    for (const phaseNum of [2, 3, 4]) {
      const domains = phaseGroups[phaseNum] || [];
      if (domains.length === 0) continue;
      const info = phaseLabels[phaseNum];
      phaseSections += `\n### ${info.title}\n**Goal:** ${info.goal}\n\n`;

      if (phaseNum === 3) {
        phaseSections += `**IMPORTANT: Build visual/UI domains FIRST.** The user should see working screens before you perfect backend logic.\n\n`;
      }

      for (const dom of domains) {
        const docs = domainDocList(dom.slug);
        let totalKb = 0;
        for (const f of docs) totalKb += docSizeKb(path.join(assemblerDomainsDir, dom.slug, f));
        phaseSections += `- **${dom.name}** (\`docs/assembler_v1/02_domains/${dom.slug}/\`) — ${totalKb} KB, ${docs.length} docs\n`;
        phaseSections += `  ${dom.description}\n`;
        if (dom.dependencies?.length > 0) phaseSections += `  Dependencies: ${dom.dependencies.join(", ")}\n`;
      }
      phaseSections += `\n`;
    }

    const agentPrompt = `# AXION Agent Kit — ${projectName}

## Your Role

You are an AI coding agent building the **${projectName}** application from this Agent Kit.
You work in **phases**. Each phase has specific documents to read, specific things to build,
and a clear definition of "done." Complete one phase fully before moving to the next.
**Prioritize what the user can see** — visible features before invisible correctness.

## Critical Operating Rules

1. **Documentation is authoritative.** Every decision must trace to a document in this kit.
2. **Do not invent requirements.** If not specified, ask the user — never guess.
3. **Work in phases.** Read ONLY the docs listed for your current phase.
4. **Visible progress first.** Working screens > perfect backend logic the user cannot see.
5. **Checkpoint after every phase.** Show the user what you built before proceeding.
6. **Do not read ahead.** Loading all docs at once exceeds context limits and causes drift.
7. **Report UNKNOWNs.** If a document has UNKNOWN placeholders, flag them to the user.

## Kit Contents

- \`docs/assembler_v1/00_product/\` — RPBS (what to build), REBS (how to build), PROJECT_OVERVIEW
- \`docs/assembler_v1/02_domains/\` — ${domainSlugs.length} domain modules with detailed specifications
- \`docs/assembler_v1/00_registry/\` — Domain map, glossary, reason codes
- \`assembler/domains.json\` — Domain list and configuration
- \`handoff/input.json\` — Original project input
- \`handoff/ai_context.json\` — AI-enriched project context
- \`manifest.json\` — Source of truth for bundle contents

## Document Priority Guide

| Priority | Documents | When to Read |
|----------|-----------|-------------|
| **Tier 1** (Required) | README, BELS, DDES, DIM | Before implementing ANY domain |
| **Tier 2** (Visual) | SCREENMAP, COMPONENT_LIBRARY, UI_Constraints, UX_Foundations, COPY_GUIDE | Phase 3 for UI domains — READ BEFORE coding UI |
| **Tier 3** (Testing) | TESTPLAN, ERC | Phase 4 for verification |

## Phased Build Plan

### Phase 1: Project Setup & Product Understanding
**Goal:** Understand what you are building and set up the project skeleton.

**Read ONLY these files:**
- \`docs/assembler_v1/00_product/RPBS_Product.md\` — What to build (features, actors, journeys)
- \`docs/assembler_v1/00_product/REBS_Product.md\` — How to build (engineering standards, patterns)
- \`docs/assembler_v1/00_product/PROJECT_OVERVIEW.md\` — Project summary
- \`handoff/ai_context.json\` — Tech stack, features, user types
- \`docs/assembler_v1/00_registry/domain-map.md\` — Domain overview

**What to build:**
1. Initialize the project with the specified tech stack
2. Set up project directory structure
3. Install core dependencies
4. Create database schema if specified
5. Ensure the app runs (even a blank page)

**Done when:** Project runs without errors, tech stack matches spec.
**Checkpoint:** Tell the user what you are building and that scaffolding is ready.
${phaseSections}
## Anti-Drift Rules

1. **Do NOT go deep on backend before UI is visible.** Working screens > perfect validation.
2. **Do NOT read all documentation up front.** Load only docs for your current phase.
3. **Do NOT implement infrastructure before features.** CI/CD comes in Phase 4.
4. **Do NOT invent requirements.** If not in docs, ask the user.
5. **Do NOT skip checkpoints.** Show the user after each phase.
6. **Do NOT treat all domains equally.** Visual/frontend domains deserve the most attention.
7. **Do NOT ignore SCREENMAP and COMPONENT_LIBRARY.** Read these BEFORE writing frontend code.

## Quick Reference

| Question | Where to Find Answer |
|----------|---------------------|
| What am I building? | \`docs/assembler_v1/00_product/RPBS_Product.md\` |
| How should I build it? | \`docs/assembler_v1/00_product/REBS_Product.md\` |
| What is the tech stack? | \`handoff/ai_context.json\` |
| What screens exist? | \`docs/assembler_v1/02_domains/frontend/SCREENMAP_frontend.md\` |
| Business rules for X? | \`docs/assembler_v1/02_domains/{domain}/BELS_{domain}.md\` |
| Data entities in X? | \`docs/assembler_v1/02_domains/{domain}/DDES_{domain}.md\` |
| APIs for X? | \`docs/assembler_v1/02_domains/{domain}/DIM_{domain}.md\` |
| Components to use? | \`docs/assembler_v1/02_domains/frontend/COMPONENT_LIBRARY_frontend.md\` |
| Is feature required? | Check RPBS — if not mentioned, ask user |

## Domains (${domainSlugs.length} total)
${domainSlugs.map(d => `- ${d}`).join("\n") || "- (none defined yet)"}

## Current Status
- UNKNOWN tokens remaining: ${unknownCount}
- Open Question files: ${openQ.paths.length}
`;

    const files = collectFiles(workspaceRoot);
    receipt.packageSummary.fileCount = files.length;
    receipt.packageSummary.unknownCount = unknownCount;

    if (args.dryRun) {
      receipt.ok = true;
      receipt.skippedFiles = [
        path.join(bundleDir, "manifest.json"),
        path.join(bundleDir, "agent_prompt.md"),
        zipOut
      ];
      emitOutput();
      return;
    }

    ensureDir(bundleDir);

    const manifestPath = path.join(bundleDir, "manifest.json");
    const promptPath = path.join(bundleDir, "agent_prompt.md");

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    fs.writeFileSync(promptPath, agentPrompt);

    receipt.createdFiles.push(rel(workspaceRoot, manifestPath), rel(workspaceRoot, promptPath));

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
      const inside = path.posix.join("axiom_kit", rel(workspaceRoot, abs));
      archive.file(abs, { name: inside });
    }

    await archive.finalize();
    await done;

    receipt.createdFiles.push(rel(workspaceRoot, zipOut));
    receipt.packageSummary.zipSha256 = sha256(fs.readFileSync(zipOut));
    receipt.ok = true;

    emitOutput();
  } catch (e) {
    receipt.ok = false;
    receipt.errors.push(e?.message || String(e));
    if (!jsonMode) {
      console.error("Package error:", e?.message || e);
    }
    emitOutput();
    process.exit(1);
  }
})();
