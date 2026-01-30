#!/usr/bin/env node
/**
 * roshi-reorg.mjs v2.1
 * 
 * Purpose: Clean root clutter by moving it into _archive/legacy_misc/<timestamp>/
 * MUST: fail-fast if any protected path would be moved
 * Outputs: MOVE_REPORT.json + MOVE_REPORT.md
 */

import { readdirSync, statSync, mkdirSync, renameSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { loadProtectedPaths, isProtected, assertNoProtectedTouches } from './lib/protected-paths.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

const ALWAYS_KEEP = new Set([
  'client',
  'server',
  'shared',
  'scripts',
  'roshi',
  'assembler',
  'docs',
  'migrations',
  'node_modules',
  '.git',
  '_archive',
  'dist',
  'public',
  'assets',
  'src',
  'attached_assets',
  'workspaces'
]);

const ALWAYS_KEEP_FILES = new Set([
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'drizzle.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'components.json',
  '.gitignore',
  '.replit',
  'replit.nix',
  'replit.md',
  'README.md',
  '.env',
  '.env.local'
]);

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

function collectRootClutter() {
  const root = process.cwd();
  const entries = readdirSync(root);
  const clutter = [];
  const skipped = [];
  
  for (const entry of entries) {
    if (entry.startsWith('.') && entry !== '.env' && entry !== '.env.local') {
      skipped.push({ path: entry, reason: 'hidden file' });
      continue;
    }
    
    const fullPath = join(root, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (ALWAYS_KEEP.has(entry)) {
        skipped.push({ path: entry, reason: 'essential directory' });
        continue;
      }
    } else {
      if (ALWAYS_KEEP_FILES.has(entry)) {
        skipped.push({ path: entry, reason: 'essential file' });
        continue;
      }
    }
    
    if (isProtected(entry)) {
      skipped.push({ path: entry, reason: 'protected path' });
      continue;
    }
    
    clutter.push({
      path: entry,
      type: stat.isDirectory() ? 'directory' : 'file',
      size: stat.size
    });
  }
  
  return { clutter, skipped };
}

function generateReport(moved, skipped, failed, archivePath, dryRun) {
  const report = {
    version: '2.1',
    timestamp: new Date().toISOString(),
    dryRun,
    archivePath,
    summary: {
      moved: moved.length,
      skipped: skipped.length,
      failed: failed.length
    },
    moved,
    skipped,
    failed
  };
  
  const markdown = `# MOVE REPORT

**Generated:** ${report.timestamp}  
**Dry Run:** ${dryRun}  
**Archive Path:** ${archivePath || 'N/A'}

## Summary

| Status | Count |
|--------|-------|
| Moved | ${moved.length} |
| Skipped | ${skipped.length} |
| Failed | ${failed.length} |

## Moved Items

${moved.length > 0 ? moved.map(m => `- \`${m.source}\` → \`${m.target}\``).join('\n') : '_None_'}

## Skipped Items

${skipped.length > 0 ? skipped.map(s => `- \`${s.path}\` (${s.reason})`).join('\n') : '_None_'}

## Failed Items

${failed.length > 0 ? failed.map(f => `- \`${f.path}\`: ${f.error}`).join('\n') : '_None_'}
`;

  return { json: report, markdown };
}

async function main() {
  console.log('\n🗂️  ROSHI REORG v2.1\n');
  
  if (DRY_RUN) {
    console.log('   [DRY RUN MODE - No changes will be made]\n');
  }
  
  try {
    loadProtectedPaths();
  } catch (err) {
    log(`Failed to load protected paths: ${err.message}`, 'error');
    process.exit(1);
  }
  
  const { clutter, skipped } = collectRootClutter();
  
  if (clutter.length === 0) {
    log('No clutter found in root directory', 'success');
    console.log('\n');
    return;
  }
  
  log(`Found ${clutter.length} items to archive`, 'info');
  
  const operations = clutter.map(item => ({
    type: 'move',
    path: item.path,
    source: item.path
  }));
  
  try {
    assertNoProtectedTouches(operations);
  } catch (err) {
    console.log('\n');
    log(err.message, 'error');
    process.exit(1);
  }
  
  const timestamp = getTimestamp();
  const archivePath = join('_archive', 'legacy_misc', timestamp);
  
  const moved = [];
  const failed = [];
  
  if (!DRY_RUN) {
    mkdirSync(archivePath, { recursive: true });
  }
  
  for (const item of clutter) {
    const source = item.path;
    const target = join(archivePath, item.path);
    
    if (DRY_RUN) {
      log(`Would move: ${source} → ${target}`, 'info');
      moved.push({ source, target, type: item.type });
    } else {
      try {
        renameSync(source, target);
        log(`Moved: ${source} → ${target}`, 'success');
        moved.push({ source, target, type: item.type });
      } catch (err) {
        log(`Failed to move ${source}: ${err.message}`, 'error');
        failed.push({ path: source, error: err.message });
      }
    }
  }
  
  const { json, markdown } = generateReport(moved, skipped, failed, archivePath, DRY_RUN);
  
  if (!DRY_RUN && moved.length > 0) {
    writeFileSync(join(archivePath, 'MOVE_REPORT.json'), JSON.stringify(json, null, 2));
    writeFileSync(join(archivePath, 'MOVE_REPORT.md'), markdown);
    log(`Reports saved to ${archivePath}/`, 'success');
  }
  
  console.log('\n📊 ROSHI_REPORT');
  console.log(`   Created: ${DRY_RUN ? 0 : (moved.length > 0 ? 2 : 0)}`);
  console.log(`   Modified: 0`);
  console.log(`   Moved: ${moved.length}`);
  console.log(`   Skipped: ${skipped.length}`);
  console.log(`   Failed: ${failed.length}\n`);
  
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
