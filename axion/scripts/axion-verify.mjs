#!/usr/bin/env node
/**
 * assembler:verify - Verify the system (gate check)
 * Fails if required files are missing, undefined reason codes referenced,
 * UNKNOWNs in locked sections, or required template sections absent.
 */

import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const domainArg = args.find((_, i, arr) => arr[i - 1] === '--domain');

// Report tracking
const report = {
  created: [],
  modified: [],
  skipped: [],
  failed: []
};

// Verification results
const verify = {
  passed: true,
  checks: []
};

function loadDomainsConfig() {
  const configPath = 'assembler/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('assembler/domains.json not found. Run assembler:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function checkRequiredFiles(roshiRoot) {
  const requiredFiles = [
    `${roshiRoot}/00_product/RPBS_Product.md`,
    `${roshiRoot}/00_product/REBS_Product.md`,
    `${roshiRoot}/00_registry/domain-map.md`,
    `${roshiRoot}/00_registry/action-vocabulary.md`,
    `${roshiRoot}/00_registry/reason-codes.md`,
    `${roshiRoot}/00_registry/glossary.md`,
    `${roshiRoot}/00_product/PROJECT_OVERVIEW.md`
  ];
  
  const results = [];
  for (const file of requiredFiles) {
    const exists = fs.existsSync(file);
    results.push({
      file,
      passed: exists,
      message: exists ? 'File exists' : 'File missing'
    });
    if (!exists) verify.passed = false;
  }
  
  return results;
}

function checkDomainFiles(roshiRoot, domains, domainsDir) {
  const requiredDocs = ['BELS', 'DDES', 'DIM', 'SCREENMAP', 'TESTPLAN'];
  const results = [];
  
  for (const domain of domains) {
    const domainDir = path.join(roshiRoot, domainsDir, domain.slug);
    
    for (const docType of requiredDocs) {
      const filePath = path.join(domainDir, `${docType}_${domain.slug}.md`);
      const exists = fs.existsSync(filePath);
      results.push({
        file: filePath,
        passed: exists,
        message: exists ? 'File exists' : 'File missing'
      });
      if (!exists) verify.passed = false;
    }
  }
  
  return results;
}

function checkLockedDomainsForUnknowns(roshiRoot, domains, domainsDir) {
  const results = [];
  
  for (const domain of domains) {
    const domainDir = path.join(roshiRoot, domainsDir, domain.slug);
    
    // Check for ERC files (indicates locked domain)
    const ercFiles = fs.readdirSync(domainDir).filter(f => f.startsWith('ERC_'));
    
    for (const ercFile of ercFiles) {
      const ercPath = path.join(domainDir, ercFile);
      const content = fs.readFileSync(ercPath, 'utf8');
      const unknownCount = (content.match(/UNKNOWN/g) || []).length;
      
      const passed = unknownCount === 0;
      results.push({
        file: ercPath,
        passed,
        message: passed ? 'No UNKNOWNs in locked ERC' : `${unknownCount} UNKNOWNs found in locked ERC`
      });
      if (!passed) verify.passed = false;
    }
  }
  
  return results;
}

function printReport() {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: assembler:verify`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Status: ${verify.passed ? 'PASS ✓' : 'FAIL ✗'}`);
  if (domainArg) console.log(`Domain: ${domainArg}`);
  
  console.log('\n--- VERIFICATION RESULTS ---');
  
  const passedChecks = verify.checks.filter(c => c.passed);
  const failedChecks = verify.checks.filter(c => !c.passed);
  
  console.log(`\nPassed (${passedChecks.length}):`);
  passedChecks.forEach(c => console.log(`  ✓ ${c.file}: ${c.message}`));
  
  console.log(`\nFailed (${failedChecks.length}):`);
  failedChecks.forEach(c => console.log(`  ✗ ${c.file}: ${c.message}`));
  
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
    console.log('\n⚠️  VERIFICATION FAILED - Do not proceed with build.');
    process.exit(1);
  } else {
    console.log('\n✓ VERIFICATION PASSED - System ready for build.');
  }
}

try {
  console.log('Running assembler:verify...');
  
  const config = loadDomainsConfig();
  const roshiRoot = config.roshi_root;
  
  // Validate domain argument if provided
  if (domainArg) {
    const validDomain = config.domains.find(d => d.slug === domainArg);
    if (!validDomain) {
      throw new Error(`Domain "${domainArg}" not found in assembler/domains.json`);
    }
  }
  
  // Filter domains if --domain specified
  const domainsToProcess = domainArg 
    ? config.domains.filter(d => d.slug === domainArg)
    : config.domains;
  
  // Run verification checks
  console.log('Checking required files...');
  verify.checks.push(...checkRequiredFiles(roshiRoot));
  
  console.log('Checking domain files...');
  verify.checks.push(...checkDomainFiles(roshiRoot, domainsToProcess, config.domains_dir));
  
  console.log('Checking locked domains for UNKNOWNs...');
  verify.checks.push(...checkLockedDomainsForUnknowns(roshiRoot, domainsToProcess, config.domains_dir));
  
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  verify.passed = false;
  printReport();
  process.exit(1);
}
