// scripts/assembler-package-workspace.mjs
// Creates a distributable Agent Handoff Bundle from a workspace directory

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import archiver from "archiver";

function parseArgs(argv) {
  const args = { workspace: null, dryRun: false, force: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--force") args.force = true;
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

function printAssemblerReport(report) {
  console.log("\n========== ASSEMBLER_REPORT ==========");
  console.log(`Script: assembler:package-workspace`);
  console.log(`Mode: ${report.dryRun ? "DRY-RUN" : "EXECUTE"}`);
  console.log(`Workspace: ${report.workspace}`);
  console.log(`Status: ${report.ok ? "SUCCESS" : "FAILED"}`);
  console.log("");
  console.log(`Created (${report.created.length}):`);
  for (const c of report.created) console.log(`  + ${c}`);
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
  
  const workspaceRoot = args.workspace || process.env.ASSEMBLER_WORKSPACE;
  
  if (!workspaceRoot) {
    console.error("Error: --workspace path or ASSEMBLER_WORKSPACE env var required");
    process.exit(1);
  }

  const report = {
    command: "assembler:package-workspace",
    ok: false,
    created: [],
    dryRun: args.dryRun,
    workspace: workspaceRoot,
    outputs: {}
  };

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

    const agentPrompt = `# Axiom Assembler Agent Handoff

You are receiving an Agent Kit bundle generated by Axiom Assembler.

## Project
${projectName}

## What this bundle contains
- Complete Axiom Assembler documentation under /docs/assembler_v1
- Product specifications (RPBS, REBS)
- Registry files (domain map, reason codes, glossary)
- manifest.json is the source of truth for bundle contents

## Non-negotiable rules
- No invention: missing info stays UNKNOWN + logged to Open Questions
- Verify before lock
- No overwrite unless explicitly allowed
- Always output ASSEMBLER_REPORT at the end of each script run

## What to do next
1) Read the key documents:
   - docs/assembler_v1/README.md
   - docs/assembler_v1/00_product/PROJECT_OVERVIEW.md
   - docs/assembler_v1/00_product/RPBS_Product.md (Product requirements)
   - docs/assembler_v1/00_product/REBS_Product.md (Engineering specs)
   - docs/assembler_v1/00_registry/domain-map.md

2) If you want to extend the documentation:
   - npm run assembler:gen (generate domain packs)
   - npm run assembler:seed (seed starter content)
   - npm run assembler:draft (extract truth from sources)
   - npm run assembler:review (review for issues)
   - npm run assembler:verify (validate completeness)
   - npm run assembler:lock (finalize domains)

3) Or jump straight to implementation:
   - The RPBS contains product requirements
   - The REBS contains technical architecture
   - Use these as your guide for building

## Domains
${domainSlugs.map(d => `- ${d}`).join("\n") || "- (none defined yet)"}

## Current Status
- UNKNOWN tokens in docs: ${unknownCount}
- Open Question files: ${openQ.paths.length}
`;

    const files = collectFiles(workspaceRoot);
    report.outputs.fileCount = files.length;
    report.outputs.unknownCount = unknownCount;

    if (args.dryRun) {
      report.ok = true;
      report.outputs.wouldWrite = [
        path.join(bundleDir, "manifest.json"),
        path.join(bundleDir, "agent_prompt.md"),
        zipOut
      ];
      printAssemblerReport(report);
      return;
    }

    ensureDir(bundleDir);

    const manifestPath = path.join(bundleDir, "manifest.json");
    const promptPath = path.join(bundleDir, "agent_prompt.md");

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    fs.writeFileSync(promptPath, agentPrompt);

    report.created.push(rel(workspaceRoot, manifestPath), rel(workspaceRoot, promptPath));

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

    report.created.push(rel(workspaceRoot, zipOut));
    report.outputs.zipSha256 = sha256(fs.readFileSync(zipOut));
    report.ok = true;

    printAssemblerReport(report);
  } catch (e) {
    report.ok = false;
    console.error("Package error:", e?.message || e);
    printAssemblerReport(report);
    process.exit(1);
  }
})();
