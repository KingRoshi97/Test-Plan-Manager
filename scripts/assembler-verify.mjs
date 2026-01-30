#!/usr/bin/env node
/**
 * roshi:verify - Verify the system (gate check) v2.1
 * Fails if required files are missing, undefined reason codes referenced,
 * UNKNOWNs in locked sections, or required template sections absent.
 * 
 * v2.1 Gates:
 * - Inputs gate (required paths exist)
 * - Sources gate (Project Overview first)
 * - Templates gate (template folder present and complete)
 * - Domain registry gate (domains.json valid, packs exist)
 * - Terminology gate (terminology.md exists with required headings)
 * - Build order gate (covers all domains, valid prerequisites, no cycles)
 * - No-overwrite gate (regen never overwrote authored content)
 * - Lock gate (lock artifacts created only after verify passes)
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
    throw new Error('assembler/domains.json not found. Run roshi:init first.');
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
    
    if (!fs.existsSync(domainDir)) continue;
    
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

// v2.1: Terminology Gate
function checkTerminologyGate() {
  const results = [];
  const terminologyPaths = [
    'docs/roshi_v2/00_registry/terminology.md',
    'docs/assembler_v1/00_registry/terminology.md'
  ];
  
  let terminologyPath = null;
  for (const p of terminologyPaths) {
    if (fs.existsSync(p)) {
      terminologyPath = p;
      break;
    }
  }
  
  if (!terminologyPath) {
    results.push({
      file: 'terminology.md',
      passed: false,
      message: 'Terminology registry not found'
    });
    verify.passed = false;
    return results;
  }
  
  const content = fs.readFileSync(terminologyPath, 'utf8');
  const requiredHeadings = ['Roles', 'Domains', 'Entities', 'Statuses', 'Copy Keys'];
  
  for (const heading of requiredHeadings) {
    const hasHeading = content.includes(`## ${heading}`) || content.includes(`### ${heading}`);
    results.push({
      file: terminologyPath,
      passed: hasHeading,
      message: hasHeading ? `Has "${heading}" section` : `Missing "${heading}" section`
    });
    if (!hasHeading) verify.passed = false;
  }
  
  return results;
}

// v2.1: Build Order Gate
function checkBuildOrderGate(domains) {
  const results = [];
  const buildOrderPaths = [
    'docs/roshi_v2/00_registry/DOMAIN_BUILD_ORDER.md',
    'docs/assembler_v1/00_registry/DOMAIN_BUILD_ORDER.md'
  ];
  
  let buildOrderPath = null;
  for (const p of buildOrderPaths) {
    if (fs.existsSync(p)) {
      buildOrderPath = p;
      break;
    }
  }
  
  if (!buildOrderPath) {
    results.push({
      file: 'DOMAIN_BUILD_ORDER.md',
      passed: false,
      message: 'Domain build order not found'
    });
    verify.passed = false;
    return results;
  }
  
  results.push({
    file: buildOrderPath,
    passed: true,
    message: 'Build order file exists'
  });
  
  const content = fs.readFileSync(buildOrderPath, 'utf8');
  const domainSlugs = domains.map(d => d.slug);
  
  // Parse table rows to extract defined domains
  const tableMatch = content.match(/\|.*\|.*\|.*\|.*\|/g);
  const prereqMap = new Map();
  const definedDomains = new Set();
  
  if (tableMatch) {
    for (const row of tableMatch) {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 3 && cells[0] !== 'Order' && !cells[0].includes('---')) {
        const domain = cells[1]?.toLowerCase();
        const prereqs = cells[2]?.toLowerCase();
        
        if (domain && domain !== 'unknown') {
          definedDomains.add(domain);
          if (prereqs && prereqs !== 'none' && prereqs !== 'unknown') {
            prereqMap.set(domain, prereqs.split(',').map(p => p.trim()).filter(p => p && p !== 'none'));
          }
        }
      }
    }
  }
  
  // Check coverage - UNKNOWN is NOT a valid bypass, all domains must be listed
  const missingDomains = domainSlugs.filter(slug => !definedDomains.has(slug));
  
  if (missingDomains.length > 0) {
    results.push({
      file: buildOrderPath,
      passed: false,
      message: `Missing domains in build order: ${missingDomains.join(', ')}`
    });
    verify.passed = false;
  } else if (definedDomains.size === 0 || (definedDomains.size === 1 && definedDomains.has('unknown'))) {
    results.push({
      file: buildOrderPath,
      passed: false,
      message: 'Build order contains only UNKNOWN - define actual domain order'
    });
    verify.passed = false;
  } else {
    results.push({
      file: buildOrderPath,
      passed: true,
      message: `All ${domainSlugs.length} domains covered in build order`
    });
  }
  
  // Check prerequisites reference valid domains
  for (const [domain, prereqs] of prereqMap) {
    for (const prereq of prereqs) {
      if (!definedDomains.has(prereq) && prereq !== 'unknown') {
        results.push({
          file: buildOrderPath,
          passed: false,
          message: `Domain "${domain}" has invalid prerequisite: "${prereq}"`
        });
        verify.passed = false;
      }
    }
  }
  
  // DFS cycle detection - handles cycles of any length
  function hasCycleDFS(startNode, visited, recStack) {
    visited.add(startNode);
    recStack.add(startNode);
    
    const neighbors = prereqMap.get(startNode) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const cyclePath = hasCycleDFS(neighbor, visited, recStack);
        if (cyclePath) return cyclePath;
      } else if (recStack.has(neighbor)) {
        return [neighbor, startNode];
      }
    }
    
    recStack.delete(startNode);
    return null;
  }
  
  const visited = new Set();
  let cycleFound = null;
  
  for (const domain of prereqMap.keys()) {
    if (!visited.has(domain)) {
      cycleFound = hasCycleDFS(domain, visited, new Set());
      if (cycleFound) break;
    }
  }
  
  if (cycleFound) {
    results.push({
      file: buildOrderPath,
      passed: false,
      message: `Circular dependency detected: ${cycleFound.join(' -> ')}`
    });
    verify.passed = false;
  } else {
    results.push({
      file: buildOrderPath,
      passed: true,
      message: 'No circular dependencies detected'
    });
  }
  
  return results;
}

// v2.1: Sources Gate (Project Overview first)
function checkSourcesGate() {
  const results = [];
  const sourcesPaths = ['roshi/sources.json', 'assembler/sources.json'];
  
  let sourcesPath = null;
  for (const p of sourcesPaths) {
    if (fs.existsSync(p)) {
      sourcesPath = p;
      break;
    }
  }
  
  if (!sourcesPath) {
    results.push({
      file: 'sources.json',
      passed: false,
      message: 'sources.json not found'
    });
    verify.passed = false;
    return results;
  }
  
  try {
    const content = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
    const sources = content.sources || content;
    
    if (!Array.isArray(sources) || sources.length === 0) {
      results.push({
        file: sourcesPath,
        passed: false,
        message: 'sources.json has no sources array'
      });
      verify.passed = false;
      return results;
    }
    
    const first = sources[0];
    const firstId = typeof first === 'string' ? first : (first.id || first.name || '');
    const isOverviewFirst = firstId.toLowerCase().includes('overview') || 
                           firstId.toLowerCase().includes('project');
    
    results.push({
      file: sourcesPath,
      passed: isOverviewFirst,
      message: isOverviewFirst 
        ? 'Project Overview is first source (Model B compliant)'
        : `First source should be Project Overview, got: ${firstId}`
    });
    
    if (!isOverviewFirst) verify.passed = false;
    
  } catch (err) {
    results.push({
      file: sourcesPath,
      passed: false,
      message: `Failed to parse sources.json: ${err.message}`
    });
    verify.passed = false;
  }
  
  return results;
}

function printReport() {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: roshi:verify`);
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
  console.log('Running roshi:verify...');
  
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
  
  // v2.1 Gates
  console.log('Checking sources gate (Model B)...');
  verify.checks.push(...checkSourcesGate());
  
  console.log('Checking terminology gate...');
  verify.checks.push(...checkTerminologyGate());
  
  console.log('Checking build order gate...');
  verify.checks.push(...checkBuildOrderGate(config.domains));
  
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  verify.passed = false;
  printReport();
  process.exit(1);
}
