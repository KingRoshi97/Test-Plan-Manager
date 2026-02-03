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
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface KitCreateResult {
  status: 'success' | 'failed';
  stage: 'kit-create';
  kit_root?: string;
  axion_snapshot?: string;
  manifest_path?: string;
  files_copied?: number;
  project_name?: string;
  stack_profile?: string;
  dry_run?: boolean;
  reason_codes?: string[];
  hint?: string[];
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
}

const AXION_SNAPSHOT_DIRS = [
  'config',
  'scripts',
  'templates',
  'source_docs'
];

const AXION_SNAPSHOT_FILES = [
  'QUICKSTART.md'
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

function log(msg: string, jsonOutput: boolean): void {
  if (!jsonOutput) {
    console.log(msg);
  }
}

function copyDirRecursive(src: string, dest: string, dryRun: boolean): number {
  let count = 0;
  
  if (!fs.existsSync(src)) {
    return 0;
  }

  if (!dryRun && !fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      count += copyDirRecursive(srcPath, destPath, dryRun);
    } else if (entry.isFile()) {
      if (!dryRun) {
        fs.copyFileSync(srcPath, destPath);
      }
      count++;
    }
  }
  
  return count;
}

function seedRPBS(targetAxion: string, projectName: string, projectDesc: string, dryRun: boolean): void {
  const rpbsDir = path.join(targetAxion, 'source_docs', 'product');
  const rpbsPath = path.join(rpbsDir, 'RPBS_Product.md');
  
  if (!dryRun) {
    fs.mkdirSync(rpbsDir, { recursive: true });
  }
  
  // Check if RPBS already exists and has content
  if (fs.existsSync(rpbsPath)) {
    const content = fs.readFileSync(rpbsPath, 'utf-8');
    // If it has a real project name (not placeholder), don't overwrite
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

  if (!dryRun) {
    fs.writeFileSync(rpbsPath, rpbsContent, 'utf-8');
  }
}

function seedREBS(targetAxion: string, stackProfile: string, dryRun: boolean): void {
  const rebsDir = path.join(targetAxion, 'source_docs', 'product');
  const rebsPath = path.join(rebsDir, 'REBS_Product.md');
  
  if (!dryRun) {
    fs.mkdirSync(rebsDir, { recursive: true });
  }
  
  // Check if REBS already exists and has content
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

  if (!dryRun) {
    fs.writeFileSync(rebsPath, rebsContent, 'utf-8');
  }
}

function writeManifest(kitRoot: string, manifest: KitManifest, dryRun: boolean): void {
  const manifestPath = path.join(kitRoot, 'manifest.json');
  if (!dryRun) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  log('\n[AXION] Kit Create\n', options.jsonOutput);

  // Validate target
  if (!options.target) {
    const result: KitCreateResult = {
      status: 'failed',
      stage: 'kit-create',
      reason_codes: ['TARGET_MISSING'],
      hint: [
        'Provide --target <path> to specify where to create the kit',
        'Example: --target ./kits/build-001'
      ]
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const targetPath = path.resolve(options.target);
  const sourcePath = path.resolve(options.source);

  log(`[INFO] Source axion: ${sourcePath}`, options.jsonOutput);
  log(`[INFO] Target kit: ${targetPath}`, options.jsonOutput);

  // Check source exists
  if (!fs.existsSync(sourcePath)) {
    const result: KitCreateResult = {
      status: 'failed',
      stage: 'kit-create',
      reason_codes: ['SOURCE_NOT_FOUND'],
      hint: [
        `Source axion/ folder not found at ${sourcePath}`,
        'Provide --source <path> to specify axion location'
      ]
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  // Check target doesn't exist (if refuse-if-exists)
  if (options.refuseIfExists && fs.existsSync(targetPath)) {
    const result: KitCreateResult = {
      status: 'failed',
      stage: 'kit-create',
      reason_codes: ['TARGET_EXISTS'],
      hint: [
        `Target already exists: ${targetPath}`,
        'Remove --refuse-if-exists or choose a different target'
      ]
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  // Create target directory
  if (!options.dryRun) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
  log(`[INFO] Created kit root: ${targetPath}`, options.jsonOutput);

  // Create axion snapshot
  const targetAxion = path.join(targetPath, 'axion');
  if (!options.dryRun) {
    fs.mkdirSync(targetAxion, { recursive: true });
  }

  let totalFiles = 0;

  // Copy directories
  for (const dir of AXION_SNAPSHOT_DIRS) {
    const srcDir = path.join(sourcePath, dir);
    const destDir = path.join(targetAxion, dir);
    if (fs.existsSync(srcDir)) {
      const count = copyDirRecursive(srcDir, destDir, options.dryRun);
      totalFiles += count;
      log(`[INFO] Copied ${dir}/ (${count} files)`, options.jsonOutput);
    }
  }

  // Copy files
  for (const file of AXION_SNAPSHOT_FILES) {
    const srcFile = path.join(sourcePath, file);
    const destFile = path.join(targetAxion, file);
    if (fs.existsSync(srcFile)) {
      if (!options.dryRun) {
        fs.copyFileSync(srcFile, destFile);
      }
      totalFiles++;
      log(`[INFO] Copied ${file}`, options.jsonOutput);
    }
  }

  // Seed RPBS if project name provided
  if (options.projectName) {
    seedRPBS(targetAxion, options.projectName, options.projectDesc || '', options.dryRun);
    log(`[INFO] Seeded RPBS_Product.md with project: ${options.projectName}`, options.jsonOutput);
  }

  // Seed REBS with stack profile
  seedREBS(targetAxion, options.stackProfile, options.dryRun);
  log(`[INFO] Seeded REBS_Product.md with stack: ${options.stackProfile}`, options.jsonOutput);

  // Write manifest
  const manifest: KitManifest = {
    version: '1.0.0',
    created_at: new Date().toISOString(),
    source_axion: sourcePath,
    project_name: options.projectName,
    stack_profile: options.stackProfile,
    status: 'created'
  };
  writeManifest(targetPath, manifest, options.dryRun);
  log(`[INFO] Created manifest.json`, options.jsonOutput);

  log('\n[PASS] Kit created successfully\n', options.jsonOutput);

  const result: KitCreateResult = {
    status: 'success',
    stage: 'kit-create',
    kit_root: targetPath,
    axion_snapshot: targetAxion,
    manifest_path: path.join(targetPath, 'manifest.json'),
    files_copied: totalFiles,
    project_name: options.projectName,
    stack_profile: options.stackProfile
  };

  if (options.dryRun) {
    result.dry_run = true;
  }

  console.log(JSON.stringify(result, null, 2));
}

main();
