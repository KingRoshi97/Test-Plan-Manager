#!/usr/bin/env node
/**
 * roshi-purge.mjs v2.1 (optional)
 * 
 * Purpose: Permanently delete allowed purge targets after consolidation + verify passes
 * MUST be governed by docs/roshi_v2/00_registry/PURGE_POLICY.md
 * 
 * Allowed purge (only after consolidation + verify):
 * - _archive/legacy_frontend/**
 * - _archive/legacy_misc/**
 * - raw attached_assets/** (only after roshi:consolidate)
 */

import { readdirSync, statSync, rmSync, existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { loadProtectedPaths, isProtected, assertNoProtectedTouches } from './lib/protected-paths.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

const ALLOWED_PURGE_TARGETS = [
  '_archive/legacy_frontend',
  '_archive/legacy_misc',
  'attached_assets'
];

const CONSOLIDATION_MARKER = 'docs/legacy/INDEX.md';

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

function getDirSize(dir) {
  let size = 0;
  let count = 0;
  
  function walk(d) {
    if (!existsSync(d)) return;
    const entries = readdirSync(d);
    
    for (const entry of entries) {
      const fullPath = join(d, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        size += stat.size;
        count++;
      }
    }
  }
  
  walk(dir);
  return { size, count };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function main() {
  console.log('\n🗑️  ROSHI PURGE v2.1\n');
  
  if (DRY_RUN) {
    console.log('   [DRY RUN MODE - No changes will be made]\n');
  }
  
  try {
    loadProtectedPaths();
  } catch (err) {
    log(`Failed to load protected paths: ${err.message}`, 'error');
    process.exit(1);
  }
  
  if (!existsSync(CONSOLIDATION_MARKER) && !FORCE) {
    log('Consolidation has not been run (docs/legacy/INDEX.md missing)', 'error');
    log('Run roshi:consolidate first, or use --force to override', 'warn');
    process.exit(1);
  }
  
  const targetsToPurge = [];
  const skipped = [];
  
  for (const target of ALLOWED_PURGE_TARGETS) {
    if (!existsSync(target)) {
      skipped.push({ path: target, reason: 'does not exist' });
      continue;
    }
    
    if (isProtected(target)) {
      skipped.push({ path: target, reason: 'protected path' });
      continue;
    }
    
    const { size, count } = getDirSize(target);
    targetsToPurge.push({
      path: target,
      size,
      count
    });
  }
  
  if (targetsToPurge.length === 0) {
    log('No targets to purge', 'success');
    console.log('\n');
    return;
  }
  
  console.log('Targets to purge:\n');
  for (const target of targetsToPurge) {
    console.log(`  📁 ${target.path}`);
    console.log(`     Files: ${target.count}, Size: ${formatBytes(target.size)}\n`);
  }
  
  const operations = targetsToPurge.map(t => ({ type: 'delete', path: t.path }));
  
  try {
    assertNoProtectedTouches(operations);
  } catch (err) {
    console.log('\n');
    log(err.message, 'error');
    process.exit(1);
  }
  
  const purged = [];
  const failed = [];
  
  for (const target of targetsToPurge) {
    if (DRY_RUN) {
      log(`Would purge: ${target.path} (${target.count} files, ${formatBytes(target.size)})`, 'info');
      purged.push(target);
    } else {
      try {
        rmSync(target.path, { recursive: true, force: true });
        log(`Purged: ${target.path} (${target.count} files, ${formatBytes(target.size)})`, 'success');
        purged.push(target);
      } catch (err) {
        log(`Failed to purge ${target.path}: ${err.message}`, 'error');
        failed.push({ path: target.path, error: err.message });
      }
    }
  }
  
  const totalSize = purged.reduce((sum, t) => sum + t.size, 0);
  const totalFiles = purged.reduce((sum, t) => sum + t.count, 0);
  
  console.log('\n📊 ROSHI_REPORT');
  console.log(`   Purged: ${purged.length} directories`);
  console.log(`   Files removed: ${totalFiles}`);
  console.log(`   Space freed: ${formatBytes(totalSize)}`);
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
