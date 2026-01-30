#!/usr/bin/env node
/**
 * roshi-reset.mjs v2.1
 * 
 * Purpose: Reset and regenerate the Roshi workspace (Model B)
 * 
 * MUST: Archive existing workspace docs/roshi_v2/** to _archive/roshi_resets/<timestamp>/
 * MUST: Restore Project Overview as authoritative and regenerate domains from it
 * 
 * Optional flag: --wipe-frontend
 *   Archives src/** to _archive/legacy_frontend/<timestamp>/src/**
 *   Preserves src/theme/**, src/assets/brand/**, assets/**
 *   Leaves minimal boot shell so app runs
 */

import { readdirSync, statSync, mkdirSync, renameSync, copyFileSync, writeFileSync, existsSync, readFileSync, rmSync } from 'fs';
import { join, resolve, dirname, relative } from 'path';
import { loadProtectedPaths, isProtected, assertNoProtectedTouches } from './lib/protected-paths.mjs';
import { parseProjectOverview, generateDomainsJson } from './lib/project-overview-parse.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const WIPE_FRONTEND = process.argv.includes('--wipe-frontend');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

const WORKSPACE_V1 = 'docs/assembler_v1';
const WORKSPACE_V2 = 'docs/roshi_v2';
const ARCHIVE_ROOT = '_archive/roshi_resets';
const FRONTEND_ARCHIVE = '_archive/legacy_frontend';

const WORKSPACE_SKELETON = {
  '00_product': ['PROJECT_OVERVIEW.md'],
  '00_registry': ['terminology.md', 'DOMAIN_BUILD_ORDER.md', 'PURGE_POLICY.md'],
  '01_templates': [],
  '02_domains': [],
  '03_workflows': []
};

const FRONTEND_PRESERVE = [
  'src/theme',
  'src/assets/brand',
  'assets'
];

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function log(msg, level = 'info') {
  const prefix = {
    info: '  ',
    success: '✓ ',
    warn: '⚠ ',
    error: '✗ ',
    skip: '○ '
  };
  console.log(`${prefix[level] || '  '}${msg}`);
}

function walkDir(dir, fileList = [], baseDir = dir) {
  if (!existsSync(dir)) return fileList;
  
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const relativePath = relative(baseDir, fullPath);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath, fileList, baseDir);
    } else {
      fileList.push({
        path: fullPath,
        relativePath,
        name: entry
      });
    }
  }
  
  return fileList;
}

function copyDirRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src);
  
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function shouldPreserveFrontend(path) {
  for (const preserve of FRONTEND_PRESERVE) {
    if (path.startsWith(preserve) || path === preserve) {
      return true;
    }
  }
  return false;
}

// Domain parsing now uses the centralized project-overview-parse.mjs module
// This ensures Model B deterministic parsing is enforced consistently

function generateSkeletonFiles() {
  return {
    'PROJECT_OVERVIEW.md': `# Project Overview

> This is the canonical project overview. Regenerate domains from this document.

## Project Name

UNKNOWN

## Description

UNKNOWN

## Domains

- UNKNOWN

## Open Questions

- Define domain list
`,
    'terminology.md': `# Terminology Registry

> No new term without registration.

## Roles

| Term | Definition |
|------|------------|
| UNKNOWN | UNKNOWN |

## Domains

| Term | Definition |
|------|------------|
| UNKNOWN | UNKNOWN |

## Entities

| Term | Definition |
|------|------------|
| UNKNOWN | UNKNOWN |

## Statuses

| Term | Definition |
|------|------------|
| UNKNOWN | UNKNOWN |

## Copy Keys

| Key | Value |
|-----|-------|
| UNKNOWN | UNKNOWN |
`,
    'DOMAIN_BUILD_ORDER.md': `# Domain Build Order

> Defines which domains are foundation-critical and prerequisite rules.

## Foundation Domains

1. UNKNOWN

## Build Order

| Order | Domain | Prerequisites | Status |
|-------|--------|---------------|--------|
| 1 | UNKNOWN | none | pending |

## Rules

- Foundation domains MUST be built first
- No lock/build of a domain before its prerequisites are drafted and verified
`,
    'PURGE_POLICY.md': `# Purge Policy

> Governs what can be permanently deleted after consolidation + verify passes.

## Allowed Purge (only after consolidation + verify)

- \`_archive/legacy_frontend/**\`
- \`_archive/legacy_misc/**\`
- Raw \`attached_assets/**\` (only after roshi:consolidate)

## Never Purge

- Database: \`server/db/**\`, \`migrations/**\`, \`shared/schema.ts\`
- Brand: \`src/theme/**\`, \`src/assets/brand/**\`, \`assets/**\`
- Engine: \`roshi/**\`, \`scripts/**\`, \`assembler/**\`
- Evidence: \`docs/legacy/**\` (unless intentionally discarding)
`
  };
}

async function main() {
  console.log('\n🔄 ROSHI RESET v2.1\n');
  
  if (DRY_RUN) {
    console.log('   [DRY RUN MODE - No changes will be made]\n');
  }
  
  if (WIPE_FRONTEND) {
    console.log('   [WIPE FRONTEND MODE - Will archive src/**]\n');
  }
  
  try {
    loadProtectedPaths();
  } catch (err) {
    log(`Failed to load protected paths: ${err.message}`, 'error');
    process.exit(1);
  }
  
  const timestamp = getTimestamp();
  const archivePath = join(ARCHIVE_ROOT, timestamp);
  
  const archived = [];
  const created = [];
  const failed = [];
  
  const workspaceToArchive = existsSync(WORKSPACE_V2) ? WORKSPACE_V2 : 
                              existsSync(WORKSPACE_V1) ? WORKSPACE_V1 : null;
  
  if (workspaceToArchive) {
    log(`Archiving workspace: ${workspaceToArchive}`, 'info');
    
    if (!DRY_RUN) {
      mkdirSync(archivePath, { recursive: true });
      copyDirRecursive(workspaceToArchive, join(archivePath, 'workspace'));
      archived.push(workspaceToArchive);
      log(`Archived to: ${archivePath}/workspace`, 'success');
    } else {
      log(`Would archive: ${workspaceToArchive} → ${archivePath}/workspace`, 'info');
      archived.push(workspaceToArchive);
    }
  } else {
    log('No existing workspace found to archive', 'skip');
  }
  
  if (WIPE_FRONTEND && existsSync('src')) {
    const frontendArchivePath = join(FRONTEND_ARCHIVE, timestamp, 'src');
    log('Archiving frontend (preserving theme/brand)...', 'info');
    
    if (!DRY_RUN) {
      mkdirSync(frontendArchivePath, { recursive: true });
      
      const srcEntries = walkDir('src', [], 'src');
      for (const entry of srcEntries) {
        if (!shouldPreserveFrontend(entry.relativePath)) {
          const targetPath = join(frontendArchivePath, entry.relativePath);
          mkdirSync(dirname(targetPath), { recursive: true });
          copyFileSync(entry.path, targetPath);
        }
      }
      
      archived.push('src (partial)');
      log(`Frontend archived to: ${frontendArchivePath}`, 'success');
    } else {
      log(`Would archive frontend to: ${frontendArchivePath}`, 'info');
      archived.push('src (partial)');
    }
  }
  
  log('Building workspace skeleton...', 'info');
  
  if (!DRY_RUN) {
    mkdirSync(WORKSPACE_V2, { recursive: true });
    
    for (const [dir, files] of Object.entries(WORKSPACE_SKELETON)) {
      mkdirSync(join(WORKSPACE_V2, dir), { recursive: true });
    }
    
    created.push(WORKSPACE_V2);
    log(`Created: ${WORKSPACE_V2}/`, 'success');
  } else {
    log(`Would create: ${WORKSPACE_V2}/`, 'info');
  }
  
  const skeletonFiles = generateSkeletonFiles();
  
  let projectOverviewContent = null;
  const possibleOverviews = [
    join(workspaceToArchive || WORKSPACE_V2, '00_product', 'PROJECT_OVERVIEW.md'),
    join(archivePath, 'workspace', '00_product', 'PROJECT_OVERVIEW.md'),
    'docs/inputs/TARGET_OUTLINE.md'
  ];
  
  for (const overviewPath of possibleOverviews) {
    if (existsSync(overviewPath)) {
      projectOverviewContent = readFileSync(overviewPath, 'utf-8');
      log(`Found Project Overview at: ${overviewPath}`, 'success');
      break;
    }
  }
  
  if (!DRY_RUN) {
    if (projectOverviewContent) {
      writeFileSync(join(WORKSPACE_V2, '00_product', 'PROJECT_OVERVIEW.md'), projectOverviewContent);
    } else {
      writeFileSync(join(WORKSPACE_V2, '00_product', 'PROJECT_OVERVIEW.md'), skeletonFiles['PROJECT_OVERVIEW.md']);
    }
    created.push(join(WORKSPACE_V2, '00_product', 'PROJECT_OVERVIEW.md'));
    
    writeFileSync(join(WORKSPACE_V2, '00_registry', 'terminology.md'), skeletonFiles['terminology.md']);
    created.push(join(WORKSPACE_V2, '00_registry', 'terminology.md'));
    
    writeFileSync(join(WORKSPACE_V2, '00_registry', 'DOMAIN_BUILD_ORDER.md'), skeletonFiles['DOMAIN_BUILD_ORDER.md']);
    created.push(join(WORKSPACE_V2, '00_registry', 'DOMAIN_BUILD_ORDER.md'));
    
    writeFileSync(join(WORKSPACE_V2, '00_registry', 'PURGE_POLICY.md'), skeletonFiles['PURGE_POLICY.md']);
    created.push(join(WORKSPACE_V2, '00_registry', 'PURGE_POLICY.md'));
  }
  
  log('Regenerating domains.json from Project Overview (Model B)...', 'info');
  
  // Use the centralized project-overview-parse module for Model B compliance
  const overviewPath = existsSync(join(WORKSPACE_V2, '00_product', 'PROJECT_OVERVIEW.md'))
    ? join(WORKSPACE_V2, '00_product', 'PROJECT_OVERVIEW.md')
    : null;
  
  const domainResult = parseProjectOverview(overviewPath);
  
  if (domainResult.found) {
    log(`Found domains: ${domainResult.domains.join(', ')}`, 'success');
    log(`Parsed using pattern: ${domainResult.pattern}`, 'info');
    
    if (!DRY_RUN) {
      const domainsJson = generateDomainsJson(domainResult.domains);
      writeFileSync('roshi/domains.json', JSON.stringify(domainsJson, null, 2));
      created.push('roshi/domains.json');
      log('Regenerated: roshi/domains.json', 'success');
    }
  } else {
    log('No domain list found in Project Overview - writing UNKNOWN', 'warn');
    if (domainResult.openQuestions.length > 0) {
      domainResult.openQuestions.forEach(q => log(`  Open Question: ${q}`, 'warn'));
    }
    
    if (!DRY_RUN) {
      const unknownDomains = generateDomainsJson(['unknown']);
      writeFileSync('roshi/domains.json', JSON.stringify(unknownDomains, null, 2));
      created.push('roshi/domains.json');
    }
  }
  
  const resetReport = {
    version: '2.1',
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN,
    wipeFrontend: WIPE_FRONTEND,
    archived,
    created,
    failed,
    domainsFound: domainResult.found,
    domains: domainResult.domains
  };
  
  if (!DRY_RUN) {
    mkdirSync(archivePath, { recursive: true });
    writeFileSync(join(archivePath, 'RESET_REPORT.json'), JSON.stringify(resetReport, null, 2));
    log(`Report saved: ${archivePath}/RESET_REPORT.json`, 'success');
  }
  
  console.log('\n📊 ROSHI_REPORT');
  console.log(`   Archived: ${archived.length}`);
  console.log(`   Created: ${DRY_RUN ? 0 : created.length}`);
  console.log(`   Failed: ${failed.length}`);
  console.log(`   Domains: ${domainResult.found ? domainResult.domains.length : 'UNKNOWN'}\n`);
  
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
