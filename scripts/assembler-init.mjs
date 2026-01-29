#!/usr/bin/env node
/**
 * roshi:init - Initialize Roshi workspace
 * Creates the folder tree and baseline files if missing.
 */

import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Report tracking
const report = {
  created: [],
  modified: [],
  skipped: [],
  failed: []
};

function ensureDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    report.skipped.push(dirPath);
    return false;
  }
  if (!dryRun) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  report.created.push(dirPath);
  return true;
}

function ensureFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    report.skipped.push(filePath);
    return false;
  }
  if (!dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  report.created.push(filePath);
  return true;
}

function printReport() {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: roshi:init`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`\nCreated (${report.created.length}):`);
  report.created.forEach(f => console.log(`  + ${f}`));
  console.log(`\nModified (${report.modified.length}):`);
  report.modified.forEach(f => console.log(`  ~ ${f}`));
  console.log(`\nSkipped (${report.skipped.length}):`);
  report.skipped.forEach(f => console.log(`  - ${f}`));
  console.log(`\nFailed (${report.failed.length}):`);
  report.failed.forEach(f => console.log(`  ! ${f}`));
  console.log('\n===================================');
}

try {
  console.log('Running roshi:init...');
  
  // Create directory structure
  const dirs = [
    'docs/assembler_v1/00_product',
    'docs/assembler_v1/00_registry',
    'docs/assembler_v1/01_templates',
    'docs/assembler_v1/02_domains',
    'docs/assembler_v1/03_workflows',
    'roshi'
  ];
  
  dirs.forEach(dir => ensureDir(dir));
  
  // Create README.md
  const readmePath = 'docs/assembler_v1/README.md';
  const readmeContent = `# Roshi v2 Documentation Workspace

This directory contains the Roshi documentation system for the project.

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
npm run roshi:init    # Initialize workspace
npm run roshi:gen     # Generate domain doc packs
npm run roshi:seed    # Seed starter scaffolding
npm run roshi:draft   # Draft truth candidates
npm run roshi:review  # Review packet
npm run roshi:verify  # Verify system
npm run roshi:lock    # Lock a domain
\`\`\`
`;
  ensureFile(readmePath, readmeContent);
  
  // Create domains.json
  const domainsJsonPath = 'assembler/domains.json';
  const domainsContent = JSON.stringify({
    roshi_root: "docs/assembler_v1",
    domains_dir: "02_domains",
    templates_dir: "01_templates",
    domains: [
      { name: "Platform", slug: "platform", prefix: "platform", type: "business" },
      { name: "API", slug: "api", prefix: "api", type: "business" },
      { name: "Web", slug: "web", prefix: "web", type: "business" },
      { name: "Infrastructure", slug: "infra", prefix: "infra", type: "crosscutting" },
      { name: "Security", slug: "security", prefix: "security", type: "crosscutting" },
      { name: "UX/UI Pack", slug: "uxui", prefix: "uxui", type: "business", description: "Information architecture, journeys, screen specs, design system tokens, component contracts, brand rules.", default: true }
    ]
  }, null, 2);
  ensureFile(domainsJsonPath, domainsContent);
  
  // Create sources.json
  const sourcesJsonPath = 'assembler/sources.json';
  const sourcesContent = JSON.stringify({
    roshi_root: "docs/assembler_v1",
    sources: [
      "00_product/RPBS_Product.md",
      "00_product/REBS_Product.md",
      "00_registry/domain-map.md",
      "00_registry/reason-codes.md",
      "00_registry/action-vocabulary.md",
      "00_registry/glossary.md"
    ],
    domain_notes: {
      enabled: true,
      dir: "notes/domains",
      pattern: "{slug}.md"
    },
    sourceref: {
      required: true,
      format: "HeadingPath",
      example: "RPBS > Hard Rules Catalog > Permissions / AccessControl"
    }
  }, null, 2);
  ensureFile(sourcesJsonPath, sourcesContent);
  
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  printReport();
  process.exit(1);
}
