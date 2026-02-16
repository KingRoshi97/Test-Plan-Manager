#!/usr/bin/env node
/**
 * AXION Kit Create
 * 
 * Creates a new build root (kit) with an AXION system snapshot.
 * This is the first step in creating an isolated, reproducible build environment.
 * 
 * A "kit" is a self-contained build root containing:
 * - axion/ system snapshot (scripts, templates, configs)
 * - RPBS/REBS product seeds
 * - manifest.json (kit metadata)
 * 
 * After kit-create, run workspace-create to create the project workspace.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-kit-create.ts --target <path>
 *   node --import tsx axion/scripts/axion-kit-create.ts --target ./kits/build-001
 * 
 * Flags:
 *   --target <path>           Where to create the new kit (BUILD_ROOT)
 *   --source <path>           Source axion/ folder to snapshot (default: ./axion)
 *   --project-name <name>     Project name for RPBS seed
 *   --project-desc <desc>     Project description for RPBS seed
 *   --stack-profile <name>    Stack profile to use (default: default-web-saas)
 *   --refuse-if-exists        Fail if target already exists
 *   --dry-run                 Show what would be done without changes
 *   --json                    Output only JSON (no human-readable text)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');
const startTime = Date.now();

interface KitCreateReceipt {
  ok: boolean;
  stage: 'kit-create';
  dryRun: boolean;
  kit_root?: string;
  axion_snapshot?: string;
  manifest_path?: string;
  files_copied?: number;
  project_name?: string;
  stack_profile?: string;
  reason_codes: string[];
  hint: string[];
  errors: string[];
  elapsedMs?: number;
}

const receipt: KitCreateReceipt = {
  ok: true,
  stage: 'kit-create',
  dryRun,
  reason_codes: [],
  hint: [],
  errors: [],
};

function emitOutput(): void {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  } else {
    if (receipt.ok) {
      console.log('\n[PASS] Kit created successfully\n');
      console.log(JSON.stringify({
        status: 'success',
        stage: receipt.stage,
        kit_root: receipt.kit_root,
        axion_snapshot: receipt.axion_snapshot,
        manifest_path: receipt.manifest_path,
        files_copied: receipt.files_copied,
        project_name: receipt.project_name,
        stack_profile: receipt.stack_profile,
        ...(receipt.dryRun ? { dry_run: true } : {}),
      }, null, 2));
    } else {
      console.log('\n[FAIL] Kit creation failed\n');
      for (const code of receipt.reason_codes) {
        console.log(`  Reason: ${code}`);
      }
      for (const h of receipt.hint) {
        console.log(`  Hint: ${h}`);
      }
      for (const e of receipt.errors) {
        console.log(`  Error: ${e}`);
      }
    }
  }
}

interface KitCreateOptions {
  target: string;
  source: string;
  projectName?: string;
  projectDesc?: string;
  stackProfile: string;
  refuseIfExists: boolean;
  dryRun: boolean;
  jsonOutput: boolean;
}

interface KitManifest {
  version: string;
  created_at: string;
  source_axion: string;
  project_name?: string;
  stack_profile: string;
  status: 'created' | 'docs_locked' | 'app_built' | 'activated';
  snapshot_revision?: {
    git_commit?: string;
    git_branch?: string;
    file_count: number;
    content_hash: string;
  };
  environment?: {
    node_version: string;
    platform: string;
  };
  expected_commands?: {
    docs_pipeline: string;
    scaffold_app: string;
    build: string;
    test: string;
    activate: string;
    run_app: string;
  };
}

const AXION_SNAPSHOT_DIRS = [
  'config',
  'scripts',
  'templates',
  'docs',
  'domains'
];

const AXION_SNAPSHOT_FILES = [
  'docs/system/QUICKSTART.md'
];

function parseArgs(args: string[]): KitCreateOptions {
  const options: KitCreateOptions = {
    target: '',
    source: path.resolve(process.cwd(), 'axion'),
    projectName: undefined,
    projectDesc: undefined,
    stackProfile: 'default-web-saas',
    refuseIfExists: false,
    dryRun: false,
    jsonOutput: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--target':
        options.target = args[++i] || '';
        break;
      case '--source':
        options.source = path.resolve(args[++i] || options.source);
        break;
      case '--project-name':
        options.projectName = args[++i];
        break;
      case '--project-desc':
        options.projectDesc = args[++i];
        break;
      case '--stack-profile':
        options.stackProfile = args[++i] || options.stackProfile;
        break;
      case '--refuse-if-exists':
        options.refuseIfExists = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--json':
        options.jsonOutput = true;
        break;
    }
  }

  return options;
}

function log(msg: string): void {
  if (!jsonMode) {
    console.log(msg);
  }
}

function copyDirRecursive(src: string, dest: string, isDryRun: boolean): number {
  let count = 0;
  
  if (!fs.existsSync(src)) {
    return 0;
  }

  if (!isDryRun && !fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      count += copyDirRecursive(srcPath, destPath, isDryRun);
    } else if (entry.isFile()) {
      if (!isDryRun) {
        fs.copyFileSync(srcPath, destPath);
      }
      count++;
    }
  }
  
  return count;
}

function seedRPBS(targetAxion: string, projectName: string, projectDesc: string, isDryRun: boolean): void {
  const rpbsDir = path.join(targetAxion, 'docs', 'product');
  const rpbsPath = path.join(rpbsDir, 'RPBS_Product.md');
  
  if (!isDryRun) {
    fs.mkdirSync(rpbsDir, { recursive: true });
  }
  
  if (fs.existsSync(rpbsPath)) {
    const content = fs.readFileSync(rpbsPath, 'utf-8');
    if (!content.includes('{{PROJECT_NAME}}')) {
      return;
    }
  }
  
  const rpbsContent = `# Requirements and Product Behavior Specification (RPBS)

**Project:** ${projectName}
**Version:** 0.1.0
**Status:** DRAFT

## Product Overview

${projectDesc || 'UNKNOWN — Q-01: What is the core purpose of this product?'}

## Target Users

UNKNOWN — Q-02: Who are the primary users of this product?

## Core Features

UNKNOWN — Q-03: What are the essential features for MVP?

## User Stories

UNKNOWN — Q-04: What are the key user journeys?

## Business Rules

UNKNOWN — Q-05: What business logic constraints apply?

## Success Metrics

UNKNOWN — Q-06: How will success be measured?

---
*Generated by AXION kit-create*
`;

  if (!isDryRun) {
    fs.writeFileSync(rpbsPath, rpbsContent, 'utf-8');
  }
}

function seedREBS(targetAxion: string, stackProfile: string, isDryRun: boolean): void {
  const rebsDir = path.join(targetAxion, 'docs', 'product');
  const rebsPath = path.join(rebsDir, 'REBS_Product.md');
  
  if (!isDryRun) {
    fs.mkdirSync(rebsDir, { recursive: true });
  }
  
  if (fs.existsSync(rebsPath)) {
    const content = fs.readFileSync(rebsPath, 'utf-8');
    if (!content.includes('{{STACK_PROFILE}}')) {
      return;
    }
  }
  
  const rebsContent = `# Requirements and Engineering Behavior Specification (REBS)

**Stack Profile:** ${stackProfile}
**Version:** 0.1.0
**Status:** DRAFT

## Architecture Principles

UNKNOWN — Q-07: What are the core architectural principles?

## Technology Stack

- **Stack Profile:** ${stackProfile}
- Additional stack decisions to be derived from stack profile.

## Engineering Standards

UNKNOWN — Q-08: What coding standards and patterns are required?

## Security Requirements

UNKNOWN — Q-09: What security measures are mandatory?

## Performance Requirements

UNKNOWN — Q-10: What are the performance targets?

## Infrastructure

UNKNOWN — Q-11: What infrastructure requirements exist?

---
*Generated by AXION kit-create*
`;

  if (!isDryRun) {
    fs.writeFileSync(rebsPath, rebsContent, 'utf-8');
  }
}

function writeManifest(kitRoot: string, manifest: KitManifest, isDryRun: boolean): void {
  const manifestPath = path.join(kitRoot, 'manifest.json');
  if (!isDryRun) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  }
}

function writeReadmeRun(kitRoot: string, projectName: string, isDryRun: boolean): void {
  const readmePath = path.join(kitRoot, 'README_RUN.md');
  const content = `# AXION Build Runbook

## Project: ${projectName}

This build root was created by AXION kit-create. Follow these steps to build and run.

## Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL (if using database features)

## Build Pipeline

### 1. Run Docs Pipeline (generate → seed → draft → review → verify → lock)

\`\`\`bash
npx tsx axion/scripts/axion-run.ts --build-root . --project-name ${projectName} --preset system --plan docs:full
\`\`\`

### 2. Lock Documentation

\`\`\`bash
npx tsx axion/scripts/axion-run.ts --build-root . --project-name ${projectName} --preset system --plan docs:release
\`\`\`

### 3. Scaffold Application

\`\`\`bash
npx tsx axion/scripts/axion-scaffold-app.ts --build-root . --project-name ${projectName}
\`\`\`

### 4. Generate Build Plan

\`\`\`bash
npx tsx axion/scripts/axion-build-plan.ts --build-root . --project-name ${projectName}
\`\`\`

### 5. Run Tests

\`\`\`bash
npx tsx axion/scripts/axion-test.ts --build-root . --project-name ${projectName}
\`\`\`

### 6. Activate Build

\`\`\`bash
npx tsx axion/scripts/axion-activate.ts --build-root . --project-name ${projectName}
\`\`\`

### 7. Run Application

\`\`\`bash
npx tsx axion/scripts/axion-run-app.ts
\`\`\`

## Expected Artifacts

After completion, you should have:

- \`${projectName}/registry/\` - Stage markers, verify report, lock manifest
- \`${projectName}/domains/\` - Module documentation
- \`${projectName}/app/\` - Application code
- \`ACTIVE_BUILD.json\` - Points to active build
- \`manifest.json\` - Build metadata

## Two-Root Model

- **System Root**: \`./axion/\` - Immutable scripts/templates/configs
- **Workspace Root**: \`./${projectName}/\` - All generated outputs

⚠️ Never modify files in \`axion/\` after kit creation.

---
*Generated by AXION kit-create*
`;

  if (!isDryRun) {
    fs.writeFileSync(readmePath, content, 'utf-8');
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  log('\n[AXION] Kit Create\n');

  if (!options.target) {
    receipt.ok = false;
    receipt.reason_codes.push('TARGET_MISSING');
    receipt.hint.push(
      'Provide --target <path> to specify where to create the kit',
      'Example: --target ./kits/build-001'
    );
    emitOutput();
    process.exit(1);
  }

  const targetPath = path.resolve(options.target);
  const sourcePath = path.resolve(options.source);

  log(`[INFO] Source axion: ${sourcePath}`);
  log(`[INFO] Target kit: ${targetPath}`);

  if (!fs.existsSync(sourcePath)) {
    receipt.ok = false;
    receipt.reason_codes.push('SOURCE_NOT_FOUND');
    receipt.hint.push(
      `Source axion/ folder not found at ${sourcePath}`,
      'Provide --source <path> to specify axion location'
    );
    emitOutput();
    process.exit(1);
  }

  if (options.refuseIfExists && fs.existsSync(targetPath)) {
    receipt.ok = false;
    receipt.reason_codes.push('TARGET_EXISTS');
    receipt.hint.push(
      `Target already exists: ${targetPath}`,
      'Remove --refuse-if-exists or choose a different target'
    );
    emitOutput();
    process.exit(1);
  }

  if (!options.dryRun) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
  log(`[INFO] Created kit root: ${targetPath}`);

  const targetAxion = path.join(targetPath, 'axion');
  if (!options.dryRun) {
    fs.mkdirSync(targetAxion, { recursive: true });
  }

  let totalFiles = 0;

  for (const dir of AXION_SNAPSHOT_DIRS) {
    const srcDir = path.join(sourcePath, dir);
    const destDir = path.join(targetAxion, dir);
    if (fs.existsSync(srcDir)) {
      const count = copyDirRecursive(srcDir, destDir, options.dryRun);
      totalFiles += count;
      log(`[INFO] Copied ${dir}/ (${count} files)`);
    }
  }

  for (const file of AXION_SNAPSHOT_FILES) {
    const srcFile = path.join(sourcePath, file);
    const destFile = path.join(targetAxion, file);
    if (fs.existsSync(srcFile)) {
      if (!options.dryRun) {
        fs.copyFileSync(srcFile, destFile);
      }
      totalFiles++;
      log(`[INFO] Copied ${file}`);
    }
  }

  if (options.projectName) {
    seedRPBS(targetAxion, options.projectName, options.projectDesc || '', options.dryRun);
    log(`[INFO] Seeded RPBS_Product.md with project: ${options.projectName}`);
  }

  seedREBS(targetAxion, options.stackProfile, options.dryRun);
  log(`[INFO] Seeded REBS_Product.md with stack: ${options.stackProfile}`);

  let gitCommit: string | undefined;
  let gitBranch: string | undefined;
  try {
    gitCommit = execSync('git rev-parse HEAD', { cwd: sourcePath, encoding: 'utf-8' }).trim();
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: sourcePath, encoding: 'utf-8' }).trim();
  } catch {
    // Git not available, skip
  }

  const contentHash = crypto.createHash('sha256').update(`${totalFiles}-${new Date().toISOString()}`).digest('hex').slice(0, 12);

  const projectName = options.projectName || '<PROJECT_NAME>';

  const manifest: KitManifest = {
    version: '1.0.0',
    created_at: new Date().toISOString(),
    source_axion: sourcePath,
    project_name: options.projectName,
    stack_profile: options.stackProfile,
    status: 'created',
    snapshot_revision: {
      git_commit: gitCommit,
      git_branch: gitBranch,
      file_count: totalFiles,
      content_hash: contentHash
    },
    environment: {
      node_version: process.version,
      platform: process.platform
    },
    expected_commands: {
      docs_pipeline: `npx tsx axion/scripts/axion-run.ts --build-root . --project-name ${projectName} --preset system --plan docs:full`,
      scaffold_app: `npx tsx axion/scripts/axion-scaffold-app.ts --build-root . --project-name ${projectName}`,
      build: `npx tsx axion/scripts/axion-build-plan.ts --build-root . --project-name ${projectName}`,
      test: `npx tsx axion/scripts/axion-test.ts --build-root . --project-name ${projectName}`,
      activate: `npx tsx axion/scripts/axion-activate.ts --build-root . --project-name ${projectName}`,
      run_app: `npx tsx axion/scripts/axion-run-app.ts`
    }
  };
  writeManifest(targetPath, manifest, options.dryRun);
  log(`[INFO] Created manifest.json`);

  writeReadmeRun(targetPath, projectName, options.dryRun);
  log(`[INFO] Created README_RUN.md`);

  receipt.kit_root = targetPath;
  receipt.axion_snapshot = targetAxion;
  receipt.manifest_path = path.join(targetPath, 'manifest.json');
  receipt.files_copied = totalFiles;
  receipt.project_name = options.projectName;
  receipt.stack_profile = options.stackProfile;

  emitOutput();
}

try {
  main();
} catch (err: any) {
  receipt.ok = false;
  receipt.errors.push(err?.message || String(err));
  emitOutput();
  process.exit(1);
}
