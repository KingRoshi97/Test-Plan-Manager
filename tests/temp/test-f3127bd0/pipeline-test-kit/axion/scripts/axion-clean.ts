#!/usr/bin/env node
/**
 * AXION Clean (Janitor)
 * 
 * Cleans up build artifacts to reclaim storage space.
 * Safe by default - only removes regenerable build junk.
 * 
 * Safe deletions (default):
 * - node_modules inside builds
 * - Build caches (.next, dist, .vite, .cache)
 * - Old exports/zips
 * - Lock files (package-lock.json, pnpm-lock.yaml)
 * 
 * Aggressive deletions (--aggressive):
 * - All of the above
 * - Old test reports
 * - Old run history entries
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-clean.ts --builds-dir ./kits
 *   node --import tsx axion/scripts/axion-clean.ts --builds-dir ./kits --older-than 14d
 *   node --import tsx axion/scripts/axion-clean.ts --builds-dir ./kits --dry-run
 * 
 * Flags:
 *   --builds-dir <path>      Directory containing build roots to clean
 *   --build-root <path>      Clean a specific build root
 *   --older-than <duration>  Only clean items older than duration (e.g., 7d, 24h)
 *   --aggressive             Also clean docs artifacts (not recommended)
 *   --dry-run                Show what would be deleted without deleting
 *   --json                   Output only JSON (no human-readable text)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CleanResult {
  status: 'success' | 'failed';
  stage: 'clean';
  paths_deleted?: string[];
  bytes_freed?: number;
  items_count?: number;
  dry_run?: boolean;
  reason_codes?: string[];
  hint?: string[];
}

interface CleanOptions {
  buildsDir?: string;
  buildRoot?: string;
  olderThan?: number;  // milliseconds
  aggressive: boolean;
  dryRun: boolean;
  jsonOutput: boolean;
}

const SAFE_DELETE_DIRS = [
  'node_modules',
  '.next',
  'dist',
  '.vite',
  '.cache',
  '.turbo',
  '.parcel-cache',
  'coverage',
  '__pycache__',
  '.pytest_cache'
];

const SAFE_DELETE_FILES = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock'
];

const AGGRESSIVE_DELETE_PATTERNS = [
  'run_history',
  'exports',
  '*.zip',
  '*.tar.gz'
];

function parseArgs(args: string[]): CleanOptions {
  const options: CleanOptions = {
    buildsDir: undefined,
    buildRoot: undefined,
    olderThan: undefined,
    aggressive: false,
    dryRun: false,
    jsonOutput: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--builds-dir':
        options.buildsDir = args[++i];
        break;
      case '--build-root':
        options.buildRoot = args[++i];
        break;
      case '--older-than':
        options.olderThan = parseDuration(args[++i]);
        break;
      case '--aggressive':
        options.aggressive = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--json':
        options.jsonOutput = true;
        break;
    }
  }

  return options;
}

function parseDuration(duration: string): number {
  if (!duration) return 0;
  
  const match = duration.match(/^(\d+)(d|h|m|s)?$/);
  if (!match) return 0;
  
  const value = parseInt(match[1], 10);
  const unit = match[2] || 'd';
  
  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: return value * 24 * 60 * 60 * 1000;
  }
}

function log(msg: string, jsonOutput: boolean): void {
  if (!jsonOutput) {
    console.log(msg);
  }
}

function getDirectorySize(dirPath: string): number {
  let size = 0;
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += getDirectorySize(fullPath);
      } else {
        try {
          const stats = fs.statSync(fullPath);
          size += stats.size;
        } catch {
          // Skip inaccessible files
        }
      }
    }
  } catch {
    // Skip inaccessible directories
  }
  
  return size;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function isOlderThan(itemPath: string, olderThanMs: number): boolean {
  if (!olderThanMs) return true;
  
  try {
    const stats = fs.statSync(itemPath);
    const age = Date.now() - stats.mtimeMs;
    return age > olderThanMs;
  } catch {
    return false;
  }
}

function findCleanableItems(rootPath: string, options: CleanOptions): { dirs: string[], files: string[] } {
  const dirs: string[] = [];
  const files: string[] = [];
  
  function walkDir(currentPath: string): void {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          // Check if this is a safe-delete directory
          if (SAFE_DELETE_DIRS.includes(entry.name)) {
            if (isOlderThan(fullPath, options.olderThan || 0)) {
              dirs.push(fullPath);
            }
            continue; // Don't recurse into these
          }
          
          // Check aggressive patterns
          if (options.aggressive && AGGRESSIVE_DELETE_PATTERNS.some(p => entry.name === p || entry.name.match(new RegExp(p.replace('*', '.*'))))) {
            if (isOlderThan(fullPath, options.olderThan || 0)) {
              dirs.push(fullPath);
            }
            continue;
          }
          
          // Recurse into subdirectories
          walkDir(fullPath);
        } else {
          // Check if this is a safe-delete file
          if (SAFE_DELETE_FILES.includes(entry.name)) {
            if (isOlderThan(fullPath, options.olderThan || 0)) {
              files.push(fullPath);
            }
          }
          
          // Check aggressive patterns
          if (options.aggressive) {
            for (const pattern of AGGRESSIVE_DELETE_PATTERNS) {
              if (pattern.includes('*')) {
                const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
                if (regex.test(entry.name) && isOlderThan(fullPath, options.olderThan || 0)) {
                  files.push(fullPath);
                }
              }
            }
          }
        }
      }
    } catch {
      // Skip inaccessible directories
    }
  }
  
  walkDir(rootPath);
  return { dirs, files };
}

function deleteItems(dirs: string[], files: string[], dryRun: boolean, jsonOutput: boolean): number {
  let bytesFreed = 0;
  
  // Delete directories first
  for (const dir of dirs) {
    const size = getDirectorySize(dir);
    bytesFreed += size;
    
    if (!dryRun) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        log(`  [DEL] ${dir} (${formatBytes(size)})`, jsonOutput);
      } catch (err) {
        log(`  [ERR] Could not delete ${dir}`, jsonOutput);
      }
    } else {
      log(`  [DRY] Would delete ${dir} (${formatBytes(size)})`, jsonOutput);
    }
  }
  
  // Delete files
  for (const file of files) {
    try {
      const stats = fs.statSync(file);
      bytesFreed += stats.size;
      
      if (!dryRun) {
        fs.unlinkSync(file);
        log(`  [DEL] ${file} (${formatBytes(stats.size)})`, jsonOutput);
      } else {
        log(`  [DRY] Would delete ${file} (${formatBytes(stats.size)})`, jsonOutput);
      }
    } catch {
      // Skip
    }
  }
  
  return bytesFreed;
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  log('\n[AXION] Clean\n', options.jsonOutput);

  // Determine what to clean
  let rootsToClean: string[] = [];
  
  if (options.buildRoot) {
    const buildRoot = path.resolve(options.buildRoot);
    if (!fs.existsSync(buildRoot)) {
      const result: CleanResult = {
        status: 'failed',
        stage: 'clean',
        reason_codes: ['BUILD_ROOT_NOT_FOUND'],
        hint: [`Build root not found: ${buildRoot}`]
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }
    rootsToClean.push(buildRoot);
  } else if (options.buildsDir) {
    const buildsDir = path.resolve(options.buildsDir);
    if (!fs.existsSync(buildsDir)) {
      const result: CleanResult = {
        status: 'failed',
        stage: 'clean',
        reason_codes: ['BUILDS_DIR_NOT_FOUND'],
        hint: [`Builds directory not found: ${buildsDir}`]
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }
    
    // Find all subdirectories that look like build roots
    const entries = fs.readdirSync(buildsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const potentialRoot = path.join(buildsDir, entry.name);
        // Check if it has axion/ or manifest.json
        if (fs.existsSync(path.join(potentialRoot, 'axion')) || 
            fs.existsSync(path.join(potentialRoot, 'manifest.json'))) {
          rootsToClean.push(potentialRoot);
        }
      }
    }
    
    if (rootsToClean.length === 0) {
      log('[INFO] No build roots found to clean', options.jsonOutput);
      const result: CleanResult = {
        status: 'success',
        stage: 'clean',
        paths_deleted: [],
        bytes_freed: 0,
        items_count: 0
      };
      console.log(JSON.stringify(result, null, 2));
      return;
    }
  } else {
    // Default: clean current directory
    rootsToClean.push(process.cwd());
  }

  log(`[INFO] Cleaning ${rootsToClean.length} build root(s)`, options.jsonOutput);
  if (options.dryRun) {
    log('[INFO] Dry run mode - no changes will be made', options.jsonOutput);
  }
  if (options.aggressive) {
    log('[WARN] Aggressive mode - may delete docs artifacts', options.jsonOutput);
  }

  let totalBytesFreed = 0;
  let totalItemsDeleted = 0;
  const allDeletedPaths: string[] = [];

  for (const root of rootsToClean) {
    log(`\n[INFO] Scanning: ${root}`, options.jsonOutput);
    
    const { dirs, files } = findCleanableItems(root, options);
    const itemCount = dirs.length + files.length;
    
    if (itemCount === 0) {
      log('  Nothing to clean', options.jsonOutput);
      continue;
    }
    
    log(`  Found ${dirs.length} directories, ${files.length} files to clean`, options.jsonOutput);
    
    const bytesFreed = deleteItems(dirs, files, options.dryRun, options.jsonOutput);
    totalBytesFreed += bytesFreed;
    totalItemsDeleted += itemCount;
    allDeletedPaths.push(...dirs, ...files);
  }

  log('\n' + '─'.repeat(50), options.jsonOutput);
  log(`Total: ${totalItemsDeleted} items, ${formatBytes(totalBytesFreed)} ${options.dryRun ? 'would be ' : ''}freed`, options.jsonOutput);
  log('', options.jsonOutput);

  const result: CleanResult = {
    status: 'success',
    stage: 'clean',
    paths_deleted: options.dryRun ? [] : allDeletedPaths,
    bytes_freed: totalBytesFreed,
    items_count: totalItemsDeleted
  };

  if (options.dryRun) {
    result.dry_run = true;
    result.hint = [`Would delete ${totalItemsDeleted} items, freeing ${formatBytes(totalBytesFreed)}`];
  }

  console.log(JSON.stringify(result, null, 2));
}

main();
