#!/usr/bin/env node
/**
 * AXION Overhaul Script
 * 
 * Archives an existing project and creates a fresh AXION rebuild workspace.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-overhaul.ts [options]
 * 
 * Options:
 *   --archive-dir <path>   Directory to archive current project (default: _axion_archive/<timestamp>)
 *   --new-root <path>      Directory for new workspace (default: _axion_rebuild)
 *   --strategy <type>      Archive strategy: copy (default)
 *   --force                Overwrite existing directories
 *   --dry-run              Show what would happen without making changes
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const args = process.argv.slice(2);

interface OverhaulOptions {
  archiveDir: string;
  newRoot: string;
  strategy: 'copy';
  force: boolean;
  dryRun: boolean;
  sourceDir: string;
}

interface OverhaulManifest {
  version: string;
  created_at: string;
  source_repo: string;
  archive_path: string;
  new_root: string;
  strategy: string;
  files_archived: number;
  files_excluded: number;
  exclusions: string[];
  checksums: Record<string, string>;
}

const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  '.nuxt',
  'dist',
  'build',
  '.git',
  '.cache',
  '.turbo',
  'coverage',
  '.nyc_output',
  '__pycache__',
  '.pytest_cache',
  'target',
  'vendor',
  '.venv',
  'venv',
  '.env.local',
  '.DS_Store',
  'Thumbs.db',
  '_axion_archive',
  '_axion_rebuild',
];

function parseArgs(): OverhaulOptions {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const options: OverhaulOptions = {
    archiveDir: path.join('_axion_archive', timestamp),
    newRoot: '_axion_rebuild',
    strategy: 'copy',
    force: false,
    dryRun: false,
    sourceDir: process.cwd(),
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--archive-dir' && args[i + 1]) {
      options.archiveDir = args[++i];
    } else if (arg === '--new-root' && args[i + 1]) {
      options.newRoot = args[++i];
    } else if (arg === '--strategy' && args[i + 1]) {
      options.strategy = 'copy';
      i++;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  
  return options;
}

function printHelp(): void {
  console.log(`
AXION Overhaul - Project Archive and Rebuild

Usage:
  axion-overhaul [options]

Options:
  --archive-dir <path>   Directory to archive current project
                         (default: _axion_archive/<timestamp>)
  --new-root <path>      Directory for new workspace (default: _axion_rebuild)
  --strategy <type>      Archive strategy: copy (default)
  --force                Overwrite existing directories
  --dry-run              Show what would happen without making changes
  --help                 Show this help message

What this does:
  1. Copies your current project to an archive directory
  2. Creates a fresh AXION workspace at new-root
  3. Writes a manifest documenting what was archived
  4. Excludes build artifacts (node_modules, dist, .git, etc.)

Examples:
  # Standard overhaul with defaults
  node --import tsx axion/scripts/axion-overhaul.ts

  # Custom paths
  node --import tsx axion/scripts/axion-overhaul.ts \\
    --archive-dir ./backups/v1 \\
    --new-root ./rebuild

  # Preview without making changes
  node --import tsx axion/scripts/axion-overhaul.ts --dry-run
`);
}

function shouldExclude(filePath: string): boolean {
  const parts = filePath.split(path.sep);
  return parts.some(part => EXCLUDE_PATTERNS.includes(part));
}

function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function copyDir(src: string, dest: string, dryRun: boolean): { copied: number; excluded: number; checksums: Record<string, string> } {
  let copied = 0;
  let excluded = 0;
  const checksums: Record<string, string> = {};
  
  function walk(currentSrc: string, currentDest: string): void {
    if (!fs.existsSync(currentSrc)) return;
    
    const entries = fs.readdirSync(currentSrc, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(currentSrc, entry.name);
      const destPath = path.join(currentDest, entry.name);
      const relativePath = path.relative(src, srcPath);
      
      if (shouldExclude(relativePath)) {
        excluded++;
        continue;
      }
      
      if (entry.isDirectory()) {
        if (!dryRun) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        walk(srcPath, destPath);
      } else if (entry.isFile()) {
        if (!dryRun) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.copyFileSync(srcPath, destPath);
          checksums[relativePath] = hashFile(srcPath);
        }
        copied++;
      }
    }
  }
  
  walk(src, dest);
  return { copied, excluded, checksums };
}

function createFreshWorkspace(newRoot: string, dryRun: boolean): void {
  if (dryRun) {
    console.log(`  [DRY-RUN] Would create workspace at: ${newRoot}`);
    return;
  }
  
  const { execSync } = require('child_process');
  
  fs.mkdirSync(newRoot, { recursive: true });
  
  const initScript = path.join(process.cwd(), 'axion', 'scripts', 'axion-init.ts');
  if (fs.existsSync(initScript)) {
    try {
      execSync(`node --import tsx ${initScript} --mode fresh --target ${newRoot}`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
    } catch (e) {
      console.log('  [WARN] Init script failed, creating minimal structure');
      fs.mkdirSync(path.join(newRoot, 'axion', 'config'), { recursive: true });
      fs.mkdirSync(path.join(newRoot, 'axion', 'domains'), { recursive: true });
      fs.mkdirSync(path.join(newRoot, 'axion', 'templates'), { recursive: true });
      fs.mkdirSync(path.join(newRoot, 'axion', 'registry'), { recursive: true });
    }
  }
}

function main(): void {
  const options = parseArgs();
  
  console.log('\n[AXION] Overhaul Mode\n');
  console.log(`  Source:      ${options.sourceDir}`);
  console.log(`  Archive:     ${options.archiveDir}`);
  console.log(`  New Root:    ${options.newRoot}`);
  console.log(`  Strategy:    ${options.strategy}`);
  console.log(`  Dry Run:     ${options.dryRun}`);
  console.log('');
  
  const archivePath = path.resolve(options.sourceDir, options.archiveDir);
  const newRootPath = path.resolve(options.sourceDir, options.newRoot);
  
  if (fs.existsSync(archivePath) && !options.force) {
    console.error(`[ERROR] Archive directory already exists: ${archivePath}`);
    console.error('        Use --force to overwrite');
    process.exit(1);
  }
  
  if (fs.existsSync(newRootPath) && !options.force) {
    console.error(`[ERROR] New root already exists: ${newRootPath}`);
    console.error('        Use --force to overwrite');
    process.exit(1);
  }
  
  console.log('[1/4] Preflight checks passed\n');
  
  console.log('[2/4] Archiving current project...');
  const { copied, excluded, checksums } = copyDir(options.sourceDir, archivePath, options.dryRun);
  console.log(`      Copied: ${copied} files, Excluded: ${excluded} items\n`);
  
  console.log('[3/4] Creating fresh workspace...');
  createFreshWorkspace(newRootPath, options.dryRun);
  console.log('');
  
  console.log('[4/4] Writing manifest...');
  const manifest: OverhaulManifest = {
    version: '1.0.0',
    created_at: new Date().toISOString(),
    source_repo: options.sourceDir,
    archive_path: archivePath,
    new_root: newRootPath,
    strategy: options.strategy,
    files_archived: copied,
    files_excluded: excluded,
    exclusions: EXCLUDE_PATTERNS,
    checksums: options.dryRun ? {} : checksums,
  };
  
  if (!options.dryRun) {
    const manifestPath = path.join(newRootPath, 'AXION_OVERHAUL_MANIFEST.json');
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`      Saved: ${manifestPath}`);
  } else {
    console.log('      [DRY-RUN] Would write manifest');
  }
  
  console.log('\n[AXION] Overhaul complete!\n');
  
  const result = {
    status: options.dryRun ? 'DRY_RUN' : 'SUCCESS',
    archive_dir: archivePath,
    new_root: newRootPath,
    files_archived: copied,
    files_excluded: excluded,
    next_commands: [
      `cd ${newRootPath}`,
      'Edit axion/source_docs/product/RPBS_Product.md',
      'Edit axion/source_docs/product/REBS_Product.md',
      'node --import tsx axion/scripts/axion-run.ts --preset foundation --plan scaffold',
    ],
  };
  
  console.log(JSON.stringify(result, null, 2));
}

main();
