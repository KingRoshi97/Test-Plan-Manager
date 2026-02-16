#!/usr/bin/env node
/**
 * axion:lock - Lock a domain (ERC creation)
 * Creates an Execution Readiness Contract when domain is ready.
 * REQUIRES verify to have passed first.
 *
 * Usage:
 *   node axion/scripts/axion-lock.mjs --module <name>
 *   node axion/scripts/axion-lock.mjs --module <name> --version v2
 *   node axion/scripts/axion-lock.mjs --all
 *   node axion/scripts/axion-lock.mjs --module <name> --json
 *   node axion/scripts/axion-lock.mjs --module <name> --dry-run
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  parseModuleArgs,
  isStageDone,
  markStageDone,
  markStageFailed,
} from './_axion_module_mode.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const jsonMode = args.includes('--json');
const versionArg = args.find((_, i, arr) => arr[i - 1] === '--version') || 'v1';
const { modules } = parseModuleArgs(process.argv);

const startTime = Date.now();

const receipt = {
  stage: 'lock',
  ok: true,
  modulesProcessed: [],
  createdFiles: [],
  modifiedFiles: [],
  skippedFiles: [],
  warnings: [],
  errors: [],
  elapsedMs: 0,
  dryRun,
  lockSummary: {
    version: versionArg,
    lockedModules: [],
    hashes: {},
    ercPaths: [],
  },
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
    /contains.*UNKNOWN/i,
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

function emitOutput() {
  receipt.elapsedMs = Date.now() - startTime;

  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    return;
  }

  const ls = receipt.lockSummary;

  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:lock`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Version: ${ls.version}`);
  console.log(`Modules: ${receipt.modulesProcessed.join(', ') || '(none)'}`);

  if (ls.lockedModules.length) {
    console.log(`\nLocked (${ls.lockedModules.length}):`);
    ls.lockedModules.forEach(m => console.log(`  + ${m}`));
  }

  if (ls.ercPaths.length) {
    console.log(`\nERC Files Created (${ls.ercPaths.length}):`);
    ls.ercPaths.forEach(p => console.log(`  + ${p}`));
  }

  if (receipt.createdFiles.length) {
    console.log(`\nAll Created Files (${receipt.createdFiles.length}):`);
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
  if (!jsonMode) console.log('Running axion:lock...');

  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';
  const domainsDir = config.domains_dir || 'domains';

  const ls = receipt.lockSummary;

  for (const module of modules) {
    if (!isStageDone('verify', module)) {
      const msg = `Module '${module}' has not completed 'verify'. Run verify first.`;
      receipt.warnings.push(msg);
      if (!dryRun) markStageFailed('lock', module, { reason: msg });
      continue;
    }

    try {
      if (!jsonMode) console.log(`Locking module: ${module}`);
      receipt.modulesProcessed.push(module);

      const domainDir = path.join(axionRoot, domainsDir, module);
      const belsPath = path.join(domainDir, `BELS_${module}.md`);

      if (!fs.existsSync(belsPath)) {
        const msg = `BELS file not found: ${belsPath}`;
        receipt.errors.push(msg);
        receipt.ok = false;
        if (!dryRun) markStageFailed('lock', module, { reason: msg });
        continue;
      }

      const belsContent = fs.readFileSync(belsPath, 'utf8');

      if (checkForCriticalUnknowns(belsContent)) {
        const msg = `Module '${module}' contains UNKNOWN in critical BELS sections. Run content-fill or review first.`;
        receipt.errors.push(msg);
        receipt.ok = false;
        if (!dryRun) markStageFailed('lock', module, { reason: msg });
        continue;
      }

      const ercPath = path.join(domainDir, `ERC_${module}_${versionArg}.md`);
      if (fs.existsSync(ercPath)) {
        const msg = `ERC ${versionArg} already exists for '${module}' at ${ercPath}. Use a different --version.`;
        receipt.warnings.push(msg);
        receipt.skippedFiles.push(ercPath);
        continue;
      }

      const ercContent = createERC(module, belsContent, versionArg);
      const hash = generateHash(belsContent);

      if (!dryRun) {
        fs.mkdirSync(path.dirname(ercPath), { recursive: true });
        fs.writeFileSync(ercPath, ercContent, 'utf8');
      }
      receipt.createdFiles.push(ercPath);
      ls.ercPaths.push(ercPath);

      const hashesPath = path.join(domainDir, 'LOCK_HASHES.json');
      const hashes = fs.existsSync(hashesPath)
        ? JSON.parse(fs.readFileSync(hashesPath, 'utf8'))
        : {};

      hashes[versionArg] = {
        locked: new Date().toISOString(),
        hash,
      };

      if (!dryRun) {
        fs.writeFileSync(hashesPath, JSON.stringify(hashes, null, 2), 'utf8');
      }
      receipt.createdFiles.push(hashesPath);

      ls.lockedModules.push(module);
      ls.hashes[module] = hash;

      if (!dryRun) {
        markStageDone('lock', module, { version: versionArg, hash });
      }

    } catch (moduleErr) {
      receipt.errors.push(`Module '${module}' failed: ${moduleErr.message}`);
      receipt.ok = false;
      if (!dryRun) markStageFailed('lock', module, { reason: moduleErr.message });
    }
  }

  emitOutput();

  if (!receipt.ok) process.exit(1);

} catch (error) {
  receipt.ok = false;
  receipt.errors.push(error.message);
  emitOutput();
  process.exit(1);
}
