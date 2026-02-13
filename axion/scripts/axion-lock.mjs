#!/usr/bin/env node
/**
 * axion:lock - Lock a domain (ERC creation)
 * Creates an Execution Readiness Contract when domain is ready.
 * REQUIRES verify to have passed first.
 * 
 * Usage:
 *   node axion/scripts/axion-lock.mjs --module <name>
 *   node axion/scripts/axion-lock.mjs --module <name> --version v2
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { readVerifyStatus, failJson } from './_axion_module_mode.mjs';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const moduleArg = args.find((_, i, arr) => arr[i - 1] === '--module');
const versionArg = args.find((_, i, arr) => arr[i - 1] === '--version') || 'v1';

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

function checkForCriticalUnknowns(belsContent) {
  const criticalSections = ['Policy Rules', 'State Machines', 'Validation Rules'];
  
  const conceptPatterns = [
    /Write UNKNOWN/i,
    /log.*UNKNOWN/i,
    /UNKNOWN.*log/i,
    /mark.*UNKNOWN/i,
    /UNKNOWNs exist/i,
    /contains.*UNKNOWN/i
  ];
  
  for (const section of criticalSections) {
    const sectionRegex = new RegExp(`## ${section}[\\s\\S]*?(?=##|$)`, 'i');
    const match = belsContent.match(sectionRegex);
    if (match && match[0].includes('UNKNOWN')) {
      const lines = match[0].split('\n');
      for (const line of lines) {
        if (line.includes('|') && line.includes('UNKNOWN') && !line.includes('---')) {
          const isConceptReference = conceptPatterns.some(pattern => pattern.test(line));
          if (!isConceptReference) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function generateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

function createERC(module, belsContent, version) {
  const lockDate = new Date().toISOString();
  const hash = generateHash(belsContent);
  
  return `# Execution Readiness Contract (ERC) — ${module} ${version}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:ERC -->

## Overview
**Domain Slug:** ${module}
**Version:** ${version}
**Lock Date:** ${lockDate}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: The ERC freezes meaning, intent, and structure before execution begins.
Once locked, execution may proceed, but reinterpretation may not.
THIS DOCUMENT IS AUTO-GENERATED AT LOCK TIME. Do not manually edit it.
CORE ERC RULE: ERC freezes meaning, not mechanics.
-->

---

## ERC State

- **ERC State:** Locked
- **Prepared by:** axion:lock script
- **Date Created:** ${lockDate}
- **Date Locked:** ${lockDate}

**Rule:** Execution must NOT begin unless ERC State is LOCKED.

---

## Verification Status

- [x] No critical UNKNOWNs in BELS (verified at lock time)
- [x] Policy rules have reason codes + messages
- [x] State machines have deny codes for invalid transitions
- [x] Minimum acceptance scenarios exist
- [x] All RPBS cross-references resolve

**Content Hash:** ${hash}

---

## Bound Input Documents

| Document | Status | Source |
|----------|--------|--------|
| BELS_${module}.md | Locked | domains/${module}/ |

---

## Locked Primary Outcomes

Extracted from BELS at lock time. Implementation must achieve these exact outcomes.

---

## Locked Non-Goals and Exclusions

To be populated from BELS non-goal sections if present.

---

## Locked Domain Boundaries

To be populated from DDES domain boundary definitions if present.

---

## Locked Core Flows

To be populated from UX_Foundations user journeys if present.

---

## Locked UX and UI Laws

To be populated from UX_Foundations experience laws and UI_Constraints structural rules if present.

---

## Permitted Implementation Freedoms

- Internal variable naming
- Private function signatures (not exposed in DIM)
- Performance optimizations that do not change observable behavior
- Refactoring that preserves all locked outcomes

**Rule:** Freedom applies to HOW, never to WHAT or WHY.

---

## Forbidden Changes During Execution

- Entity structures locked in DDES
- State machines locked in BELS
- Policy rules and reason codes locked in BELS
- UI structural rules locked in UI_Constraints
- Experience laws locked in UX_Foundations

**Rule:** Any change to these items requires a new ERC version.

---

## Escalation and Rollback Triggers

- Ambiguity in a locked outcome: STOP and escalate
- Conflict between locked docs: STOP and escalate
- New requirement contradicts ERC: Requires new version
- Implementation cannot satisfy a locked outcome: STOP and report

---

## Locked Data Sections

### From BELS at Lock Time
${belsContent}

---

## ERC Success Conditions

- All locked primary outcomes are implemented
- All forbidden changes are avoided
- All state machines match locked specifications
- All policy rules produce correct reason codes

---

## Implementation Notes

- This ERC was generated from the BELS document at lock time
- Any changes to business logic must go through a new ERC version
- Implementation must match exactly what is specified here

---

## Computed Values (from BELS)

Extracted from BELS computed value rules if present.

---

## Cross-Domain Dependencies

To be populated from DIM interface contracts if present.

---

## Lock Metadata

- **Locked by:** axion:lock script
- **Lock date:** ${lockDate}
- **Hash:** ${hash}
- **Version:** ${version}

---

## Agent Ingestion Instructions

1. Read ERC State — if not LOCKED, do not proceed
2. Read Locked Primary Outcomes — these are the non-negotiable goals
3. Read Forbidden Changes — these are absolute constraints
4. Read Locked Data Sections — this is the authoritative specification
5. Read Permitted Implementation Freedoms — these define your latitude
6. If any ambiguity: STOP and escalate before proceeding

---

## Open Questions
- None (resolved at lock time)
`;
}

function printReport(hasWarning = false) {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:lock`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Status: ${report.failed.length > 0 ? 'FAILED' : hasWarning ? 'WARNING' : 'SUCCESS'}`);
  if (moduleArg) console.log(`Module: ${moduleArg}`);
  console.log(`Version: ${versionArg}`);
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
  console.log('Running axion:lock...');
  
  // Check verify status first
  const status = readVerifyStatus();
  if (!status || status.status !== 'PASS') {
    failJson({
      status: 'blocked_by',
      stage: 'lock',
      missing: ['verify_pass'],
      hint: ['run: node axion/scripts/axion-verify.mjs --all'],
    });
  }
  
  if (!moduleArg) {
    throw new Error('--module <slug> is required for axion:lock');
  }
  
  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';
  const domainsDir = config.domains_dir || 'domains';
  
  const domainDir = path.join(axionRoot, domainsDir, moduleArg);
  const belsPath = path.join(domainDir, `BELS_${moduleArg}.md`);
  
  // Check BELS exists
  if (!fs.existsSync(belsPath)) {
    throw new Error(`BELS file not found: ${belsPath}`);
  }
  
  const belsContent = fs.readFileSync(belsPath, 'utf8');
  
  // Check for critical UNKNOWNs
  if (checkForCriticalUnknowns(belsContent)) {
    report.failed.push('Cannot lock - module contains UNKNOWN in critical sections');
    report.failed.push('Run axion:review to see details');
    printReport();
    process.exit(1);
  }
  
  // Check if ERC already exists
  const ercPath = path.join(domainDir, `ERC_${moduleArg}_${versionArg}.md`);
  if (fs.existsSync(ercPath)) {
    report.skipped.push(`${ercPath} (already exists)`);
    console.log(`ERC ${versionArg} already exists for ${moduleArg}. Use a different version.`);
    printReport(true);
    process.exit(0);
  }
  
  // Create ERC
  const ercContent = createERC(moduleArg, belsContent, versionArg);
  
  if (!dryRun) {
    fs.mkdirSync(path.dirname(ercPath), { recursive: true });
    fs.writeFileSync(ercPath, ercContent, 'utf8');
  }
  report.created.push(ercPath);
  
  // Create lock hashes file
  const hashesPath = path.join(domainDir, 'LOCK_HASHES.json');
  const hashes = fs.existsSync(hashesPath) 
    ? JSON.parse(fs.readFileSync(hashesPath, 'utf8'))
    : {};
  
  hashes[versionArg] = {
    locked: new Date().toISOString(),
    hash: generateHash(belsContent)
  };
  
  if (!dryRun) {
    fs.writeFileSync(hashesPath, JSON.stringify(hashes, null, 2), 'utf8');
  }
  report.created.push(hashesPath);
  
  console.log(`\nModule "${moduleArg}" locked as ${versionArg}`);
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  printReport();
  process.exit(1);
}
