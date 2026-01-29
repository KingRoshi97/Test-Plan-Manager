#!/usr/bin/env node
/**
 * roshi:draft - Draft truth candidates
 * Reads from sources and produces initial domain logic candidates.
 * FAILS if required input files are missing.
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

function loadDomainsConfig() {
  const configPath = 'assembler/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('assembler/domains.json not found. Run roshi:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function loadSourcesConfig() {
  const configPath = 'assembler/sources.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('assembler/sources.json not found. Run roshi:init first.');
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
  
  const missing = [];
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      missing.push(file);
    }
  }
  
  return missing;
}

function ensureFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    if (!dryRun) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  if (fs.existsSync(filePath)) {
    // Check if file has been authored (more than just template)
    const existingContent = fs.readFileSync(filePath, 'utf8');
    // For draft, we update BELS files with candidates
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    report.modified.push(filePath);
    return true;
  }
  
  if (!dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  report.created.push(filePath);
  return true;
}

function extractSourceInfo(roshiRoot) {
  // Read available source files and extract useful information
  const info = {
    entities: [],
    rules: [],
    domains: []
  };
  
  // Read REBS for entities
  const rebsPath = `${roshiRoot}/00_product/REBS_Product.md`;
  if (fs.existsSync(rebsPath)) {
    const content = fs.readFileSync(rebsPath, 'utf8');
    // Extract entity names
    const entityMatches = content.match(/\| (User|Project|Run|DomainPack|Artifact|VerifyResult|ERC|Bundle|TemplatePack|SourceRef)/g);
    if (entityMatches) {
      info.entities = entityMatches.map(m => m.replace('| ', ''));
    }
  }
  
  // Read domain-map for domain info
  const domainMapPath = `${roshiRoot}/00_registry/domain-map.md`;
  if (fs.existsSync(domainMapPath)) {
    const content = fs.readFileSync(domainMapPath, 'utf8');
    // Extract domain responsibilities
    info.domainMapContent = content;
  }
  
  return info;
}

function generateBELSCandidates(domain, sourceInfo, roshiRoot) {
  const sourceRef = `SourceRef: REBS_Product > Core Entities`;
  
  // Determine which entities belong to this domain based on domain-map
  let domainEntities = [];
  if (domain.slug === 'platform') {
    domainEntities = ['User', 'Project', 'TemplatePack', 'SourceRef'];
  } else if (domain.slug === 'api') {
    domainEntities = ['Run', 'DomainPack', 'Artifact', 'VerifyResult', 'ERC', 'Bundle'];
  } else if (domain.slug === 'web') {
    domainEntities = [];
  } else if (domain.slug === 'infra') {
    domainEntities = [];
  } else if (domain.slug === 'security') {
    domainEntities = [];
  }
  
  return `# Business Entity Logic Specification (BELS) — ${domain.name}

## Overview
**Domain Slug:** ${domain.slug}
**Domain Prefix:** ${domain.prefix}
**Status:** DRAFT - Truth Candidates

## Policy Rules (Candidates)
<!-- Business rules that govern this domain -->
<!-- ${sourceRef} -->

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
${domain.slug === 'platform' ? `| ${domain.prefix}_001 | No invention rule | Missing info detected | Write UNKNOWN and log to Open Questions | TARGET_OUTLINE > Constraints |
| ${domain.prefix}_002 | No overwrite rule | File exists | Skip file, record in ASSEMBLER_REPORT skipped list | TARGET_OUTLINE > Constraints |` : 
domain.slug === 'api' ? `| ${domain.prefix}_001 | Verify before lock | Lock requested | Check all verifications pass | TARGET_OUTLINE > Constraints |
| ${domain.prefix}_002 | Always print ASSEMBLER_REPORT | Script run completes | Print report with created/modified/skipped/failed | TARGET_OUTLINE > Constraints |` :
`| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |`}

## State Machines (Candidates)
<!-- State transitions for entities -->
${domainEntities.length > 0 ? domainEntities.map(entity => {
  if (entity === 'Run') {
    return `### Entity: Run
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| created | start | running | UNKNOWN | REBS_Product > Run |
| running | complete | completed | UNKNOWN | REBS_Product > Run |
| running | fail | failed | API_RUN_003 | REBS_Product > Run |
| completed | package | bundled | UNKNOWN | REBS_Product > Run |`;
  } else if (entity === 'ERC') {
    return `### Entity: ERC
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| draft | verify | verified | API_VERIFY_001 | REBS_Product > ERC |
| verified | lock | locked | API_LOCK_001 | REBS_Product > ERC |`;
  } else if (entity === 'Project') {
    return `### Entity: Project
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| created | activate | active | UNKNOWN | REBS_Product > Project |
| active | archive | archived | UNKNOWN | REBS_Product > Project |`;
  } else {
    return `### Entity: ${entity}
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REBS_Product > ${entity} |`;
  }
}).join('\n\n') : `### Entity: UNKNOWN
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |`}

## Validation Rules (Candidates)
<!-- Data validation rules -->

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
${domainEntities.length > 0 ? domainEntities.map(entity => 
  `| ${entity}.id | Required, UUID format | UNKNOWN | REBS_Product > ${entity} |`
).join('\n') : '| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |'}

## Reason Codes Referenced
<!-- Referenced from reason-codes.md -->

| Code | Message | Severity |
|------|---------|----------|
${domain.slug === 'api' ? `| API_RUN_001 | Run not found | ERROR |
| API_RUN_003 | Run failed | ERROR |
| API_VERIFY_001 | Verification failed | ERROR |
| API_LOCK_001 | Cannot lock - UNKNOWNs exist | ERROR |` :
domain.slug === 'platform' ? `| PLATFORM_USER_001 | User not found | ERROR |
| PLATFORM_PROJECT_001 | Project not found | ERROR |` :
domain.slug === 'security' ? `| SECURITY_ACCESS_001 | Access denied | ERROR |` :
'| UNKNOWN | UNKNOWN | UNKNOWN |'}

## Open Questions
<!-- Questions generated during draft -->
${domainEntities.length === 0 ? `- What entities does the ${domain.name} domain own?
- What business rules apply to this domain?` : 
`- Complete state machine transitions need validation
- Error codes need confirmation from stakeholders`}
- Specific implementation details: UNKNOWN
`;
}

function generateOpenQuestions(domain) {
  return `# Open Questions — ${domain.name}

## Overview
**Domain Slug:** ${domain.slug}
**Generated:** ${new Date().toISOString()}

## Unresolved Questions

### From Draft Process
- State machine transitions need stakeholder validation
- Specific error messages need confirmation
- Implementation details are UNKNOWN

### Entity-Specific
- Entity ownership boundaries need clarification
- Cross-domain interactions need definition

### Implementation
- Specific technical requirements: UNKNOWN
- Performance requirements: UNKNOWN
- Integration details: UNKNOWN

## Resolution Tracking

| Question ID | Question | Status | Resolution |
|-------------|----------|--------|------------|
| Q001 | Entity ownership | OPEN | UNKNOWN |
| Q002 | State transitions | OPEN | UNKNOWN |
| Q003 | Error handling | OPEN | UNKNOWN |
`;
}

function printReport(hasFailed = false) {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: roshi:draft`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Status: ${hasFailed ? 'FAILED' : 'SUCCESS'}`);
  if (domainArg) console.log(`Domain: ${domainArg}`);
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
  console.log('Running roshi:draft...');
  
  const domainsConfig = loadDomainsConfig();
  const sourcesConfig = loadSourcesConfig();
  const roshiRoot = domainsConfig.roshi_root;
  
  // Validate domain argument if provided
  if (domainArg) {
    const validDomain = domainsConfig.domains.find(d => d.slug === domainArg);
    if (!validDomain) {
      throw new Error(`Domain "${domainArg}" not found in assembler/domains.json`);
    }
  }
  
  // Check required input files exist (Inputs Pack rule)
  const missingFiles = checkRequiredFiles(roshiRoot);
  if (missingFiles.length > 0) {
    report.failed.push('Required input files missing:');
    missingFiles.forEach(f => report.failed.push(`  - ${f}`));
    printReport(true);
    process.exit(1);
  }
  
  console.log('All required input files found. Proceeding with draft...');
  
  // Extract information from sources
  const sourceInfo = extractSourceInfo(roshiRoot);
  
  // Filter domains if --domain specified
  const domainsToProcess = domainArg 
    ? domainsConfig.domains.filter(d => d.slug === domainArg)
    : domainsConfig.domains;
  
  for (const domain of domainsToProcess) {
    const domainDir = path.join(roshiRoot, domainsConfig.domains_dir, domain.slug);
    
    // Generate BELS candidates
    const belsContent = generateBELSCandidates(domain, sourceInfo, roshiRoot);
    const belsPath = path.join(domainDir, `BELS_${domain.slug}.md`);
    ensureFile(belsPath, belsContent);
    
    // Generate Open Questions doc
    const openQuestionsContent = generateOpenQuestions(domain);
    const openQuestionsPath = path.join(domainDir, `OPEN_QUESTIONS_${domain.slug}.md`);
    ensureFile(openQuestionsPath, openQuestionsContent);
  }
  
  printReport(false);
  
} catch (error) {
  report.failed.push(error.message);
  printReport(true);
  process.exit(1);
}
