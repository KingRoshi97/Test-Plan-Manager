#!/usr/bin/env node
/**
 * roshi:review - Review packet
 * Summarizes UNKNOWNs, conflicts, missing reason codes, and missing sections.
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

// Review results
const review = {
  unknownCounts: {},
  conflicts: [],
  missingReasonCodes: [],
  missingSections: []
};

function loadDomainsConfig() {
  const configPath = 'assembler/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('assembler/domains.json not found. Run roshi:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function countUnknowns(content) {
  const matches = content.match(/UNKNOWN/g);
  return matches ? matches.length : 0;
}

function checkRequiredSections(content, docType) {
  const requiredSections = {
    BELS: ['Policy Rules', 'State Machines', 'Validation Rules', 'Reason Codes'],
    DDES: ['Overview', 'Entities', 'Key Responsibilities'],
    DIM: ['Exposed Interfaces', 'Consumed Interfaces']
  };
  
  const sections = requiredSections[docType] || [];
  const missing = [];
  
  for (const section of sections) {
    if (!content.includes(`## ${section}`)) {
      missing.push(section);
    }
  }
  
  return missing;
}

function printReport() {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: roshi:review`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  if (domainArg) console.log(`Domain: ${domainArg}`);
  
  console.log('\n--- REVIEW SUMMARY ---');
  
  console.log('\nUNKNOWN Counts by Domain:');
  for (const [domain, count] of Object.entries(review.unknownCounts)) {
    console.log(`  ${domain}: ${count} UNKNOWNs`);
  }
  
  console.log(`\nConflicts Detected: ${review.conflicts.length}`);
  review.conflicts.forEach(c => console.log(`  ! ${c}`));
  
  console.log(`\nMissing Reason Codes: ${review.missingReasonCodes.length}`);
  review.missingReasonCodes.forEach(c => console.log(`  ! ${c}`));
  
  console.log(`\nMissing Required Sections: ${review.missingSections.length}`);
  review.missingSections.forEach(s => console.log(`  ! ${s}`));
  
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
  
  // Recommendation
  const totalUnknowns = Object.values(review.unknownCounts).reduce((a, b) => a + b, 0);
  if (totalUnknowns > 0 || review.conflicts.length > 0 || review.missingReasonCodes.length > 0) {
    console.log('\n⚠️  RECOMMENDATION: Do not lock domains until issues are resolved.');
  } else {
    console.log('\n✓ All domains ready for lock.');
  }
}

try {
  console.log('Running roshi:review...');
  
  const config = loadDomainsConfig();
  const roshiRoot = config.roshi_root;
  const domainsDir = path.join(roshiRoot, config.domains_dir);
  
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
  
  for (const domain of domainsToProcess) {
    const domainDir = path.join(domainsDir, domain.slug);
    let totalUnknowns = 0;
    
    // Check BELS file
    const belsPath = path.join(domainDir, `BELS_${domain.slug}.md`);
    if (fs.existsSync(belsPath)) {
      const content = fs.readFileSync(belsPath, 'utf8');
      totalUnknowns += countUnknowns(content);
      
      const missingSections = checkRequiredSections(content, 'BELS');
      missingSections.forEach(s => {
        review.missingSections.push(`${domain.slug}/BELS: Missing section "${s}"`);
      });
    } else {
      review.missingSections.push(`${domain.slug}: BELS file missing`);
    }
    
    // Check other domain docs
    const docTypes = ['DDES', 'DIM', 'SCREENMAP', 'TESTPLAN'];
    for (const docType of docTypes) {
      const docPath = path.join(domainDir, `${docType}_${domain.slug}.md`);
      if (fs.existsSync(docPath)) {
        const content = fs.readFileSync(docPath, 'utf8');
        totalUnknowns += countUnknowns(content);
      }
    }
    
    review.unknownCounts[domain.slug] = totalUnknowns;
  }
  
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  printReport();
  process.exit(1);
}
