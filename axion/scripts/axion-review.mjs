#!/usr/bin/env node
/**
 * axion:review - Review packet
 * Summarizes UNKNOWNs, conflicts, missing reason codes, and missing sections.
 * 
 * Usage:
 *   node axion/scripts/axion-review.mjs --all
 *   node axion/scripts/axion-review.mjs --module <name>
 */

import fs from 'fs';
import path from 'path';
import {
  parseModuleArgs,
  ensurePrereqs,
  isStageDone,
  markStageDone,
  failJson,
  AXION_DOC_TYPES,
  AXION_REVIEWED_DOC_TYPES,
} from './_axion_module_mode.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const { modules } = parseModuleArgs(process.argv);

const report = {
  created: [],
  modified: [],
  skipped: [],
  failed: []
};

const review = {
  unknownCounts: {},
  conflicts: [],
  missingReasonCodes: [],
  missingSections: []
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

function printReport() {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:review`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Modules: ${modules.join(', ')}`);
  
  console.log('\n--- REVIEW SUMMARY ---');
  
  console.log('\nUNKNOWN Counts by Module:');
  for (const [module, count] of Object.entries(review.unknownCounts)) {
    console.log(`  ${module}: ${count} UNKNOWNs`);
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
  
  const totalUnknowns = Object.values(review.unknownCounts).reduce((a, b) => a + b, 0);
  if (totalUnknowns > 0 || review.conflicts.length > 0 || review.missingReasonCodes.length > 0) {
    console.log('\nRECOMMENDATION: Do not lock modules until issues are resolved.');
  } else {
    console.log('\nAll modules ready for verify.');
  }
}

try {
  console.log('Running axion:review...');
  
  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';
  const domainsDir = path.join(axionRoot, config.domains_dir || 'domains');
  
  for (const module of modules) {
    ensurePrereqs({
      stageName: 'review',
      module,
      stagePrereq: (m) => isStageDone('draft', m),
    });
    
    console.log(`Reviewing module: ${module}`);
    
    const domainDir = path.join(domainsDir, module);
    let totalUnknowns = 0;
    
    const belsPath = path.join(domainDir, `BELS_${module}.md`);
    if (fs.existsSync(belsPath)) {
      const content = fs.readFileSync(belsPath, 'utf8');
      totalUnknowns += countUnknowns(content);
      
      const missingSections = checkRequiredSections(content, 'BELS');
      missingSections.forEach(s => {
        review.missingSections.push(`${module}/BELS: Missing section "${s}"`);
      });
    } else {
      review.missingSections.push(`${module}: BELS file missing`);
    }
    
    for (const docType of AXION_DOC_TYPES) {
      const docPath = path.join(domainDir, `${docType}_${module}.md`);
      if (fs.existsSync(docPath)) {
        const content = fs.readFileSync(docPath, 'utf8');
        totalUnknowns += countUnknowns(content);
        
        const missingSections = checkRequiredSections(content, docType);
        missingSections.forEach(s => {
          review.missingSections.push(`${module}/${docType}: Missing section "${s}"`);
        });
      }
    }
    
    review.unknownCounts[module] = totalUnknowns;
    
    if (!dryRun) {
      markStageDone('review', module);
    }
  }
  
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  printReport();
  process.exit(1);
}
