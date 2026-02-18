#!/usr/bin/env node
/**
 * axion:review - Review packet
 * Summarizes UNKNOWNs, conflicts, missing reason codes, and missing sections.
 *
 * Usage:
 *   node axion/scripts/axion-review.mjs --all
 *   node axion/scripts/axion-review.mjs --module <name>
 *   node axion/scripts/axion-review.mjs --all --json
 *   node axion/scripts/axion-review.mjs --all --dry-run
 */

import fs from 'fs';
import path from 'path';
import {
  parseModuleArgs,
  ensurePrereqs,
  isStageDone,
  markStageDone,
  markStageFailed,
  failJson,
  AXION_DOC_TYPES,
  AXION_REVIEWED_DOC_TYPES,
  getModuleDocTypes,
} from './_axion_module_mode.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const jsonMode = args.includes('--json');
const { modules } = parseModuleArgs(process.argv);

const startTime = Date.now();

const receipt = {
  stage: 'review',
  ok: true,
  modulesProcessed: [],
  createdFiles: [],
  modifiedFiles: [],
  skippedFiles: [],
  warnings: [],
  errors: [],
  elapsedMs: 0,
  dryRun,
  reviewSummary: {
    unknownCounts: {},
    conflicts: [],
    missingReasonCodes: [],
    missingSections: [],
  },
};

function loadConfig() {
  const configPath = 'axion/config/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('axion/config/domains.json not found. Run axion:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function countUnknowns(content) {
  const matches = content.match(/UNKNOWN/g);
  return matches ? matches.length : 0;
}

function checkRequiredSections(content, docType) {
  const sections = AXION_REVIEWED_DOC_TYPES[docType] || [];
  const missing = [];

  for (const section of sections) {
    if (!content.includes(`## ${section}`)) {
      missing.push(section);
    }
  }

  return missing;
}

function emitOutput() {
  receipt.elapsedMs = Date.now() - startTime;

  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    return;
  }

  const rv = receipt.reviewSummary;

  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:review`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Modules: ${receipt.modulesProcessed.join(', ') || '(none)'}`);

  console.log('\n--- REVIEW SUMMARY ---');

  console.log('\nUNKNOWN Counts by Module:');
  for (const [mod, count] of Object.entries(rv.unknownCounts)) {
    console.log(`  ${mod}: ${count} UNKNOWNs`);
  }

  console.log(`\nConflicts Detected: ${rv.conflicts.length}`);
  rv.conflicts.forEach(c => console.log(`  ! ${c}`));

  console.log(`\nMissing Reason Codes: ${rv.missingReasonCodes.length}`);
  rv.missingReasonCodes.forEach(c => console.log(`  ! ${c}`));

  console.log(`\nMissing Required Sections: ${rv.missingSections.length}`);
  rv.missingSections.forEach(s => console.log(`  ! ${s}`));

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

  const totalUnknowns = Object.values(rv.unknownCounts).reduce((a, b) => a + b, 0);
  if (totalUnknowns > 0 || rv.conflicts.length > 0 || rv.missingReasonCodes.length > 0) {
    console.log('\nRECOMMENDATION: Do not lock modules until issues are resolved.');
  } else {
    console.log('\nAll modules ready for verify.');
  }
}

try {
  if (!jsonMode) console.log('Running axion:review...');

  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';
  const domainsDir = path.join(axionRoot, config.domains_dir || 'domains');

  const rv = receipt.reviewSummary;

  for (const module of modules) {
    if (!isStageDone('content-fill', module)) {
      const msg = `Module '${module}' has not completed 'content-fill'. Run content-fill first.`;
      receipt.warnings.push(msg);
      if (!dryRun) markStageFailed('review', module, { reason: msg });
      continue;
    }

    try {
      ensurePrereqs({
        stageName: 'review',
        module,
        stagePrereq: (m) => isStageDone('content-fill', m),
      });
    } catch (prereqErr) {
      receipt.errors.push(`Prerequisite failed for module '${module}': ${prereqErr.message}`);
      receipt.ok = false;
      if (!dryRun) markStageFailed('review', module, { reason: prereqErr.message });
      continue;
    }

    try {
      if (!jsonMode) console.log(`Reviewing module: ${module}`);
      receipt.modulesProcessed.push(module);

      const domainDir = path.join(domainsDir, module);
      let totalUnknowns = 0;

      const moduleDocTypes = getModuleDocTypes(module);
      for (const docType of moduleDocTypes) {
        const docPath = path.join(domainDir, `${docType}_${module}.md`);
        if (fs.existsSync(docPath)) {
          const content = fs.readFileSync(docPath, 'utf8');
          totalUnknowns += countUnknowns(content);

          const missingSections = checkRequiredSections(content, docType);
          missingSections.forEach(s => {
            rv.missingSections.push(`${module}/${docType}: Missing section "${s}"`);
          });
        } else if (docType === 'BELS') {
          rv.missingSections.push(`${module}: BELS file missing`);
        }
      }

      rv.unknownCounts[module] = totalUnknowns;

      if (!dryRun) {
        markStageDone('review', module);
      }
    } catch (moduleErr) {
      receipt.errors.push(`Module '${module}' failed: ${moduleErr.message}`);
      receipt.ok = false;
      if (!dryRun) markStageFailed('review', module, { reason: moduleErr.message });
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
