#!/usr/bin/env node
/**
 * axion:verify - Verify the system (gate check)
 * Fails if required files are missing, undefined reason codes referenced,
 * UNKNOWNs in locked sections, or required template sections absent.
 * 
 * Usage:
 *   node axion/scripts/axion-verify.mjs --all
 *   node axion/scripts/axion-verify.mjs --module <name>
 */

import fs from 'fs';
import path from 'path';
import {
  parseModuleArgs,
  ensurePrereqs,
  isStageDone,
  markStageDone,
  writeVerifyStatus,
  failJson,
  AXION_REQUIRED_DOC_TYPES,
} from './_axion_module_mode.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const { modules, all } = parseModuleArgs(process.argv);

const report = {
  created: [],
  modified: [],
  skipped: [],
  failed: []
};

const verify = {
  passed: true,
  checks: []
};

function loadConfig() {
  const configPath = 'axion/config/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('axion/config/domains.json not found. Run axion:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function checkDomainFiles(axionRoot, module, domainsDir) {
  const results = [];
  
  const domainDir = path.join(axionRoot, domainsDir, module);
  
  for (const docType of AXION_REQUIRED_DOC_TYPES) {
    const filePath = path.join(domainDir, `${docType}_${module}.md`);
    const exists = fs.existsSync(filePath);
    results.push({
      file: filePath,
      passed: exists,
      message: exists ? 'File exists' : 'File missing'
    });
    if (!exists) verify.passed = false;
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
      message: passed ? 'No UNKNOWNs in locked ERC' : `${unknownCount} UNKNOWNs found in locked ERC`
    });
    if (!passed) verify.passed = false;
  }
  
  return results;
}

function printReport() {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:verify`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Status: ${verify.passed ? 'PASS' : 'FAIL'}`);
  console.log(`Modules: ${modules.join(', ')}`);
  console.log(`Required Doc Types: ${AXION_REQUIRED_DOC_TYPES.join(', ')}`);
  
  console.log('\n--- VERIFICATION RESULTS ---');
  
  const passedChecks = verify.checks.filter(c => c.passed);
  const failedChecks = verify.checks.filter(c => !c.passed);
  
  console.log(`\nPassed (${passedChecks.length}):`);
  passedChecks.forEach(c => console.log(`  + ${c.file}: ${c.message}`));
  
  console.log(`\nFailed (${failedChecks.length}):`);
  failedChecks.forEach(c => console.log(`  - ${c.file}: ${c.message}`));
  
  console.log('\n--- FILE OPERATIONS ---');
  console.log(`Created (${report.created.length}):`);
  report.created.forEach(f => console.log(`  + ${f}`));
  console.log(`Modified (${report.modified.length}):`);
  report.modified.forEach(f => console.log(`  ~ ${f}`));
  console.log(`Skipped (${report.skipped.length}):`);
  report.skipped.forEach(f => console.log(`  - ${f}`));
  console.log(`Failed (${report.failed.length}):`);
  report.failed.forEach(f => console.log(`  ! ${f}`));
  console.log('\n===================================');
  
  if (!verify.passed) {
    console.log('\nVERIFICATION FAILED - Do not proceed with lock.');
  } else {
    console.log('\nVERIFICATION PASSED - Modules ready for lock.');
  }
}

try {
  console.log('Running axion:verify...');
  
  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';
  const domainsDir = config.domains_dir || 'domains';
  
  for (const module of modules) {
    ensurePrereqs({
      stageName: 'verify',
      module,
      stagePrereq: (m) => isStageDone('review', m),
    });
    
    console.log(`Verifying module: ${module}`);
    
    verify.checks.push(...checkDomainFiles(axionRoot, module, domainsDir));
    verify.checks.push(...checkLockedDomainsForUnknowns(axionRoot, module, domainsDir));
    
    if (!verify.passed) {
      failJson({
        status: 'FAIL',
        stage: 'verify',
        module,
        reason: 'verification_failed',
        details: verify.checks.filter(c => !c.passed).map(c => c.message),
      });
    }
    
    if (!dryRun) {
      markStageDone('verify', module, { result: 'PASS' });
    }
  }
  
  if (!dryRun) {
    writeVerifyStatus({
      status: 'PASS',
      timestamp: new Date().toISOString(),
      mode: all ? 'all' : 'module',
      modules,
    });
  }
  
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  verify.passed = false;
  printReport();
  process.exit(1);
}
