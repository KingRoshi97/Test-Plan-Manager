#!/usr/bin/env node
/**
 * axion:draft - Draft truth candidates
 * Reads from sources and produces initial domain logic candidates.
 * FAILS if required input files are missing.
 * 
 * Usage:
 *   node axion/scripts/axion-draft.mjs --all
 *   node axion/scripts/axion-draft.mjs --module <name>
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

function loadConfig() {
  const configPath = 'axion/config/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('axion/config/domains.json not found. Run axion:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function loadSourcesConfig() {
  const configPath = 'axion/config/sources.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('axion/config/sources.json not found. Run axion:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function ensureFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    if (!dryRun) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  if (fs.existsSync(filePath)) {
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    report.modified.push(filePath);
    return true;
  }
  
  if (!dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  report.created.push(filePath);
  return true;
}

function generateBELSCandidates(module) {
  return `# Business Entity Logic Specification (BELS) — ${module}

## Overview
**Domain Slug:** ${module}
**Status:** DRAFT - Truth Candidates

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| ${module}_001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

## State Machines (Candidates)

### Entity: UNKNOWN
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| UNKNOWN | UNKNOWN | UNKNOWN |

## Open Questions
- Entity ownership needs clarification
- State transitions need validation
- Specific implementation details: UNKNOWN
`;
}

function generateOpenQuestions(module) {
  return `# Open Questions — ${module}

## Overview
**Domain Slug:** ${module}
**Generated:** ${new Date().toISOString()}

## Unresolved Questions

### From Draft Process
- State machine transitions need stakeholder validation
- Specific error messages need confirmation
- Implementation details are UNKNOWN

### Entity-Specific
- Entity ownership boundaries need clarification
- Cross-domain interactions need definition

### Implementation
- Specific technical requirements: UNKNOWN
- Performance requirements: UNKNOWN
- Integration details: UNKNOWN

## Resolution Tracking

| Question ID | Question | Status | Resolution |
|-------------|----------|--------|------------|
| Q001 | Entity ownership | OPEN | UNKNOWN |
| Q002 | State transitions | OPEN | UNKNOWN |
| Q003 | Error handling | OPEN | UNKNOWN |
`;
}

function printReport(hasFailed = false) {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:draft`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Status: ${hasFailed ? 'FAILED' : 'SUCCESS'}`);
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
  console.log('Running axion:draft...');
  
  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';
  const domainsDir = path.join(axionRoot, config.domains_dir || 'domains');
  
  // Process each module
  for (const module of modules) {
    // Check prereqs: seed must be done for this module
    ensurePrereqs({
      stageName: 'draft',
      module,
      stagePrereq: (m) => isStageDone('seed', m),
    });
    
    console.log(`Drafting module: ${module}`);
    
    const domainDir = path.join(domainsDir, module);
    
    // Generate BELS candidates
    const belsContent = generateBELSCandidates(module);
    const belsPath = path.join(domainDir, `BELS_${module}.md`);
    ensureFile(belsPath, belsContent);
    
    // Generate Open Questions doc
    const openQuestionsContent = generateOpenQuestions(module);
    const openQuestionsPath = path.join(domainDir, `OPEN_QUESTIONS_${module}.md`);
    ensureFile(openQuestionsPath, openQuestionsContent);
    
    // Mark stage done for this module
    if (!dryRun) {
      markStageDone('draft', module);
    }
  }
  
  printReport(false);
  
} catch (error) {
  report.failed.push(error.message);
  printReport(true);
  process.exit(1);
}
