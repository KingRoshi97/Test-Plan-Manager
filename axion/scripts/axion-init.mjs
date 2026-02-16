#!/usr/bin/env node
/**
 * axion:init - Initialize AXION workspace
 * Creates the folder tree and baseline files if missing.
 *
 * Usage:
 *   node axion/scripts/axion-init.mjs
 *   node axion/scripts/axion-init.mjs --json
 *   node axion/scripts/axion-init.mjs --dry-run
 */

import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const jsonMode = args.includes('--json');

const startTime = Date.now();

const receipt = {
  stage: 'init',
  ok: true,
  createdFiles: [],
  modifiedFiles: [],
  skippedFiles: [],
  warnings: [],
  errors: [],
  elapsedMs: 0,
  dryRun,
};

function ensureDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    receipt.skippedFiles.push(dirPath);
    return false;
  }
  if (!dryRun) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  receipt.createdFiles.push(dirPath);
  return true;
}

function ensureFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    receipt.skippedFiles.push(filePath);
    return false;
  }
  if (!dryRun) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
  }
  receipt.createdFiles.push(filePath);
  return true;
}

function emitOutput() {
  receipt.elapsedMs = Date.now() - startTime;

  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    return;
  }

  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:init`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);

  if (receipt.createdFiles.length) {
    console.log(`\nCreated (${receipt.createdFiles.length}):`);
    receipt.createdFiles.forEach(f => console.log(`  + ${f}`));
  }

  if (receipt.skippedFiles.length) {
    console.log(`\nSkipped (${receipt.skippedFiles.length}):`);
    receipt.skippedFiles.forEach(f => console.log(`  - ${f}`));
  }

  if (receipt.warnings.length) {
    console.log(`\nWarnings (${receipt.warnings.length}):`);
    receipt.warnings.forEach(w => console.log(`  ? ${w}`));
  }
  if (receipt.errors.length) {
    console.log(`\nErrors (${receipt.errors.length}):`);
    receipt.errors.forEach(e => console.log(`  ! ${e}`));
  }

  console.log(`\nResult: ${receipt.ok ? 'OK' : 'FAILED'}`);
  console.log('===================================');
}

try {
  if (!jsonMode) console.log('Running axion:init...');

  const dirs = [
    'docs/assembler_v1/00_product',
    'docs/assembler_v1/00_registry',
    'docs/assembler_v1/01_templates',
    'docs/assembler_v1/02_domains',
    'docs/assembler_v1/03_workflows',
    'roshi',
  ];

  dirs.forEach(dir => ensureDir(dir));

  const readmePath = 'docs/assembler_v1/README.md';
  const readmeContent = `# Axiom Assembler Documentation Workspace

This directory contains the Axiom Assembler documentation system for the project.

## Directory Structure

\`\`\`
docs/assembler_v1/
├── 00_product/          # Product-level specifications
├── 00_registry/         # Cross-cutting registries
├── 01_templates/        # Document templates
├── 02_domains/          # Per-domain documentation
└── 03_workflows/        # Workflow documentation
\`\`\`

## Pipeline Commands

\`\`\`bash
npm run assembler:init    # Initialize workspace
npm run assembler:gen     # Generate domain doc packs
npm run assembler:seed    # Seed starter scaffolding
npm run assembler:draft   # Draft truth candidates
npm run assembler:review  # Review packet
npm run assembler:verify  # Verify system
npm run assembler:lock    # Lock a domain
\`\`\`
`;
  ensureFile(readmePath, readmeContent);

  const domainsJsonPath = 'assembler/domains.json';
  const domainsContent = JSON.stringify({
    roshi_root: 'docs/assembler_v1',
    domains_dir: '02_domains',
    templates_dir: '01_templates',
    domains: [
      { name: 'Platform', slug: 'platform', prefix: 'platform', type: 'business' },
      { name: 'API', slug: 'api', prefix: 'api', type: 'business' },
      { name: 'Web', slug: 'web', prefix: 'web', type: 'business' },
      { name: 'Infrastructure', slug: 'infra', prefix: 'infra', type: 'crosscutting' },
      { name: 'Security', slug: 'security', prefix: 'security', type: 'crosscutting' },
      { name: 'UX/UI Pack', slug: 'uxui', prefix: 'uxui', type: 'business', description: 'Information architecture, journeys, screen specs, design system tokens, component contracts, brand rules.', default: true },
    ],
  }, null, 2);
  ensureFile(domainsJsonPath, domainsContent);

  const sourcesJsonPath = 'assembler/sources.json';
  const sourcesContent = JSON.stringify({
    roshi_root: 'docs/assembler_v1',
    sources: [
      '00_product/RPBS_Product.md',
      '00_product/REBS_Product.md',
      '00_registry/domain-map.md',
      '00_registry/reason-codes.md',
      '00_registry/action-vocabulary.md',
      '00_registry/glossary.md',
    ],
    domain_notes: {
      enabled: true,
      dir: 'notes/domains',
      pattern: '{slug}.md',
    },
    sourceref: {
      required: true,
      format: 'HeadingPath',
      example: 'RPBS > Hard Rules Catalog > Permissions / AccessControl',
    },
  }, null, 2);
  ensureFile(sourcesJsonPath, sourcesContent);

  emitOutput();

} catch (error) {
  receipt.ok = false;
  receipt.errors.push(error.message);
  emitOutput();
  process.exit(1);
}
