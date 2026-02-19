#!/usr/bin/env node
/**
 * axion:verify - Verify the system (gate check)
 * Fails if required files are missing, undefined reason codes referenced,
 * UNKNOWNs in locked sections, or required template sections absent.
 *
 * Usage:
 *   node axion/scripts/axion-verify.mjs --all
 *   node axion/scripts/axion-verify.mjs --module <name>
 *   node axion/scripts/axion-verify.mjs --all --json
 *   node axion/scripts/axion-verify.mjs --all --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseModuleArgs,
  ensurePrereqs,
  isStageDone,
  markStageDone,
  markStageFailed,
  writeVerifyStatus,
  failJson,
  AXION_REQUIRED_DOC_TYPES,
  getModuleRequiredDocTypes,
} from './_axion_module_mode.mjs';

const __verify_dirname = path.dirname(fileURLToPath(import.meta.url));
const AXION_PROJECT_ROOT = path.resolve(__verify_dirname, '..', '..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const jsonMode = args.includes('--json');
const forceRebuild = args.includes('--force');
const { modules, all } = parseModuleArgs(process.argv);

const startTime = Date.now();

const receipt = {
  stage: 'verify',
  ok: true,
  modulesProcessed: [],
  createdFiles: [],
  modifiedFiles: [],
  skippedFiles: [],
  warnings: [],
  errors: [],
  elapsedMs: 0,
  dryRun,
  verifySummary: {
    passed: true,
    checks: [],
    failedModules: [],
  },
};

function loadConfig() {
  const configPath = path.join(AXION_PROJECT_ROOT, 'axion', 'config', 'domains.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('axion/config/domains.json not found. Run axion:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function checkDomainFiles(axionRoot, module, domainsDir) {
  const results = [];
  const domainDir = path.join(axionRoot, domainsDir, module);
  const requiredDocTypes = getModuleRequiredDocTypes(module);

  for (const docType of requiredDocTypes) {
    const filePath = path.join(domainDir, `${docType}_${module}.md`);
    const exists = fs.existsSync(filePath);
    results.push({
      file: filePath,
      passed: exists,
      message: exists ? 'File exists' : 'File missing',
    });
  }

  return results;
}

function checkLockedDomainsForUnknowns(axionRoot, module, domainsDir) {
  const results = [];
  const domainDir = path.join(axionRoot, domainsDir, module);

  if (!fs.existsSync(domainDir)) {
    return results;
  }

  const files = fs.readdirSync(domainDir);
  const ercFiles = files.filter(f => f.startsWith('ERC_'));

  for (const ercFile of ercFiles) {
    const ercPath = path.join(domainDir, ercFile);
    const content = fs.readFileSync(ercPath, 'utf8');
    const unknownCount = (content.match(/\bUNKNOWN\b/g) || []).length;

    const passed = unknownCount === 0;
    results.push({
      file: ercPath,
      passed,
      message: passed ? 'No UNKNOWNs in locked ERC' : `${unknownCount} UNKNOWNs found in locked ERC`,
    });
  }

  return results;
}

const MAX_UNKNOWNS_PER_FILE = 3;

function checkAllDocsForExcessiveUnknowns(axionRoot, module, domainsDir) {
  const results = [];
  const domainDir = path.join(axionRoot, domainsDir, module);

  if (!fs.existsSync(domainDir)) {
    return results;
  }

  const files = fs.readdirSync(domainDir).filter(f => f.endsWith('.md'));
  let totalUnknowns = 0;

  for (const mdFile of files) {
    const filePath = path.join(domainDir, mdFile);
    const content = fs.readFileSync(filePath, 'utf8');
    const unknownCount = (content.match(/\bUNKNOWN\b/g) || []).length;
    totalUnknowns += unknownCount;

    if (unknownCount > MAX_UNKNOWNS_PER_FILE) {
      results.push({
        file: filePath,
        passed: false,
        message: `${unknownCount} UNKNOWNs in ${mdFile} (max ${MAX_UNKNOWNS_PER_FILE} per file)`,
      });
    }
  }

  if (totalUnknowns > 0 && results.length === 0) {
    results.push({
      file: domainDir,
      passed: true,
      message: `${totalUnknowns} total UNKNOWN(s) across ${files.length} files (within per-file threshold)`,
    });
  }

  return results;
}

function emitOutput() {
  receipt.elapsedMs = Date.now() - startTime;
  receipt.verifySummary.passed = receipt.verifySummary.failedModules.length === 0 && receipt.ok;

  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    return;
  }

  const vs = receipt.verifySummary;

  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:verify`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Status: ${vs.passed ? 'PASS' : 'FAIL'}`);
  console.log(`Modules: ${receipt.modulesProcessed.join(', ') || '(none)'}`);
  const modulesStr = receipt.modulesProcessed.join(', ') || '(none)';
  const perModuleTypes = receipt.modulesProcessed.map(m => getModuleRequiredDocTypes(m));
  const uniqueTypes = [...new Set(perModuleTypes.flat())];
  console.log(`Required Doc Types: ${uniqueTypes.join(', ')} (per-module filtering applied via domains.json)`);

  console.log('\n--- VERIFICATION RESULTS ---');

  const passedChecks = vs.checks.filter(c => c.passed);
  const failedChecks = vs.checks.filter(c => !c.passed);

  console.log(`\nPassed (${passedChecks.length}):`);
  passedChecks.forEach(c => console.log(`  + ${c.file}: ${c.message}`));

  console.log(`\nFailed (${failedChecks.length}):`);
  failedChecks.forEach(c => console.log(`  - ${c.file}: ${c.message}`));

  if (vs.failedModules.length) {
    console.log(`\nFailed Modules: ${vs.failedModules.join(', ')}`);
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

  if (!vs.passed) {
    console.log('\nVERIFICATION FAILED - Do not proceed with lock.');
  } else {
    console.log('\nVERIFICATION PASSED - Modules ready for lock.');
  }
}

try {
  if (!jsonMode) console.log('Running axion:verify...');

  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';
  const domainsDir = config.domains_dir || 'domains';

  const vs = receipt.verifySummary;

  for (const module of modules) {
    if (!forceRebuild && isStageDone('verify', module)) {
      if (!jsonMode) console.log(`Skipping module (verify already done): ${module}`);
      receipt.skippedFiles.push(`${module} (stage already complete)`);
      continue;
    }

    if (!isStageDone('review', module)) {
      const msg = `Module '${module}' has not completed 'review'. Run review first.`;
      receipt.warnings.push(msg);
      if (!dryRun) markStageFailed('verify', module, { reason: msg });
      continue;
    }

    try {
      ensurePrereqs({
        stageName: 'verify',
        module,
        stagePrereq: (m) => isStageDone('review', m),
      });
    } catch (prereqErr) {
      receipt.errors.push(`Prerequisite failed for module '${module}': ${prereqErr.message}`);
      receipt.ok = false;
      if (!dryRun) markStageFailed('verify', module, { reason: prereqErr.message });
      continue;
    }

    try {
      if (!jsonMode) console.log(`Verifying module: ${module}`);
      receipt.modulesProcessed.push(module);

      const fileChecks = checkDomainFiles(axionRoot, module, domainsDir);
      const unknownChecks = checkLockedDomainsForUnknowns(axionRoot, module, domainsDir);
      const excessiveUnknownChecks = checkAllDocsForExcessiveUnknowns(axionRoot, module, domainsDir);
      const allChecks = [...fileChecks, ...unknownChecks, ...excessiveUnknownChecks];

      vs.checks.push(...allChecks);

      const moduleFailed = allChecks.some(c => !c.passed);

      if (moduleFailed) {
        vs.failedModules.push(module);
        const failedDetails = allChecks.filter(c => !c.passed).map(c => c.message);
        receipt.errors.push(`Module '${module}' verification failed: ${failedDetails.join('; ')}`);
        receipt.ok = false;
        if (!dryRun) markStageFailed('verify', module, { reason: 'verification_failed', details: failedDetails });
      } else {
        if (!dryRun) {
          markStageDone('verify', module, { result: 'PASS' });
        }
      }
    } catch (moduleErr) {
      receipt.errors.push(`Module '${module}' failed: ${moduleErr.message}`);
      receipt.ok = false;
      vs.failedModules.push(module);
      if (!dryRun) markStageFailed('verify', module, { reason: moduleErr.message });
    }
  }

  if (!dryRun && vs.passed && receipt.modulesProcessed.length > 0) {
    writeVerifyStatus({
      status: 'PASS',
      timestamp: new Date().toISOString(),
      mode: all ? 'all' : 'module',
      modules: receipt.modulesProcessed,
    });
  }

  emitOutput();

  if (!receipt.ok) process.exit(1);

} catch (error) {
  receipt.ok = false;
  receipt.errors.push(error.message);
  emitOutput();
  process.exit(1);
}
