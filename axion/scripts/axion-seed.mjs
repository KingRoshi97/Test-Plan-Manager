#!/usr/bin/env node
/**
 * axion:seed - Seed starter scaffolding
 * Creates baseline registry docs if missing. Safe prefill only.
 * 
 * Usage:
 *   node axion/scripts/axion-seed.mjs --all
 *   node axion/scripts/axion-seed.mjs --module <name>
 */

import fs from 'fs';
import path from 'path';
import {
  parseModuleArgs,
  ensurePrereqs,
  isStageDone,
  markStageDone,
  failJson,
} from './_axion_module_mode.mjs';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const { modules } = parseModuleArgs(process.argv);

// Report tracking
const report = {
  created: [],
  modified: [],
  skipped: [],
  failed: []
};

function loadDomainsConfig() {
  const configPath = 'axion/config/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('axion/config/domains.json not found. Run axion:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function ensureFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    report.skipped.push(filePath);
    return false;
  }
  if (!dryRun) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }
  report.created.push(filePath);
  return true;
}

function printReport() {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:seed`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Modules: ${modules.join(', ')}`);
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
  console.log('Running axion:seed...');
  
  const config = loadDomainsConfig();
  const axionRoot = config.axion_root || 'axion';
  
  // Process each module
  for (const module of modules) {
    // Check prereqs: generate must be done for this module
    ensurePrereqs({
      stageName: 'seed',
      module,
      stagePrereq: (m) => isStageDone('generate', m),
    });
    
    console.log(`Seeding module: ${module}`);
    
    // Seed baseline registry docs (only for first module or architecture)
    if (module === 'architecture' || modules[0] === module) {
      const registryDocs = {
        [`${axionRoot}/source_docs/product/RPBS_Product.md`]: `# Requirements & Policy Baseline Specification (RPBS)

## Overview
This document defines the hard rules and policies for the product.

## Product Name
UNKNOWN

## Hard Rules Catalog

| Rule ID | Description | Domain | Severity |
|---------|-------------|--------|----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

## Policy Definitions

| Policy ID | Description | Default Value | Domain |
|-----------|-------------|---------------|--------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

## Open Questions
- UNKNOWN
`,
        [`${axionRoot}/source_docs/product/REBS_Product.md`]: `# Requirements & Entity Baseline Specification (REBS)

## Overview
This document defines the entities and their relationships for the product.

## Core Entities
UNKNOWN

## Entity Definitions

| Entity | Description | Owner Domain | Key Fields |
|--------|-------------|--------------|------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

## Entity Relationships
UNKNOWN

## Open Questions
- UNKNOWN
`,
      };
      
      for (const [filePath, content] of Object.entries(registryDocs)) {
        ensureFile(filePath, content);
      }
    }
    
    // Mark stage done for this module
    if (!dryRun) {
      markStageDone('seed', module);
    }
  }
  
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  printReport();
  process.exit(1);
}
