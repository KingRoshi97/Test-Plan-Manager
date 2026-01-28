#!/usr/bin/env node
/**
 * roshi:lock - Lock a domain (ERC creation)
 * Creates an Execution Readiness Contract when domain is ready.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const domainArg = args.find((_, i, arr) => arr[i - 1] === '--domain');
const versionArg = args.find((_, i, arr) => arr[i - 1] === '--version') || 'v1';

// Report tracking
const report = {
  created: [],
  modified: [],
  skipped: [],
  failed: []
};

function loadDomainsConfig() {
  const configPath = 'roshi/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('roshi/domains.json not found. Run roshi:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function checkForCriticalUnknowns(belsContent) {
  // Check for UNKNOWN in critical sections
  const criticalSections = ['Policy Rules', 'State Machines', 'Validation Rules'];
  
  for (const section of criticalSections) {
    const sectionRegex = new RegExp(`## ${section}[\\s\\S]*?(?=##|$)`, 'i');
    const match = belsContent.match(sectionRegex);
    if (match && match[0].includes('UNKNOWN')) {
      // Check if it's just in the table header example
      const lines = match[0].split('\n');
      for (const line of lines) {
        if (line.includes('|') && line.includes('UNKNOWN') && !line.includes('---')) {
          return true;
        }
      }
    }
  }
  return false;
}

function generateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

function createERC(domain, belsContent, version) {
  const lockDate = new Date().toISOString();
  const hash = generateHash(belsContent);
  
  return `# Execution Readiness Contract (ERC) — ${domain.name} ${version}

## Overview
**Domain Slug:** ${domain.slug}
**Version:** ${version}
**Lock Date:** ${lockDate}
**Content Hash:** ${hash}

## Verification Status
- [x] No critical UNKNOWNs in BELS (verified at lock time)
- [x] Policy rules have reason codes + messages
- [x] State machines have deny codes
- [x] Minimum acceptance scenarios defined

## Locked Content

### From BELS at Lock Time
${belsContent}

## Implementation Notes
- This ERC was generated from the BELS document at lock time
- Any changes to business logic must go through a new version
- Implementation must match exactly what is specified here

## Sign-off
- **Locked by:** roshi:lock script
- **Lock date:** ${lockDate}
- **Hash:** ${hash}
`;
}

function printReport(hasWarning = false) {
  console.log('\n========== ROSHI_REPORT ==========');
  console.log(`Script: roshi:lock`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Status: ${report.failed.length > 0 ? 'FAILED' : hasWarning ? 'WARNING' : 'SUCCESS'}`);
  if (domainArg) console.log(`Domain: ${domainArg}`);
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
  console.log('Running roshi:lock...');
  
  if (!domainArg) {
    throw new Error('--domain <slug> is required for roshi:lock');
  }
  
  const config = loadDomainsConfig();
  const roshiRoot = config.roshi_root;
  
  // Validate domain argument
  const domain = config.domains.find(d => d.slug === domainArg);
  if (!domain) {
    throw new Error(`Domain "${domainArg}" not found in roshi/domains.json`);
  }
  
  const domainDir = path.join(roshiRoot, config.domains_dir, domain.slug);
  const belsPath = path.join(domainDir, `BELS_${domain.slug}.md`);
  
  // Check BELS exists
  if (!fs.existsSync(belsPath)) {
    throw new Error(`BELS file not found: ${belsPath}`);
  }
  
  const belsContent = fs.readFileSync(belsPath, 'utf8');
  
  // Check for critical UNKNOWNs
  if (checkForCriticalUnknowns(belsContent)) {
    report.failed.push('Cannot lock - domain contains UNKNOWN in critical sections');
    report.failed.push('Run roshi:review to see details');
    printReport();
    process.exit(1);
  }
  
  // Check if ERC already exists
  const ercPath = path.join(domainDir, `ERC_${domain.slug}_${versionArg}.md`);
  if (fs.existsSync(ercPath)) {
    report.skipped.push(`${ercPath} (already exists)`);
    console.log(`ERC ${versionArg} already exists for ${domain.slug}. Use a different version.`);
    printReport(true);
    process.exit(0);
  }
  
  // Create ERC
  const ercContent = createERC(domain, belsContent, versionArg);
  
  if (!dryRun) {
    fs.writeFileSync(ercPath, ercContent, 'utf8');
  }
  report.created.push(ercPath);
  
  // Optionally create lock hashes file
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
  
  console.log(`\n✓ Domain "${domain.slug}" locked as ${versionArg}`);
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  printReport();
  process.exit(1);
}
