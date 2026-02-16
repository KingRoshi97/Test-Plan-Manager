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
 *   --json                 Output structured JSON receipt instead of human-readable text
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const startTime = Date.now();

const receipt: Record<string, any> = {
  script: 'axion-overhaul',
  ok: true,
  dryRun: false,
  errors: [] as string[],
  warnings: [] as string[],
  filesArchived: 0,
  filesExcluded: 0,
  archiveDir: '',
  newRoot: '',
  strategy: '',
  status: '',
  nextCommands: [] as string[],
  elapsedMs: 0,
};

function emitOutput(): void {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  }
}

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
  --json                 Output structured JSON receipt
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
    if (!jsonMode) console.log(`  [DRY-RUN] Would create workspace at: ${newRoot}`);
    return;
  }
  
  const { execSync } = require('child_process');
  
  fs.mkdirSync(newRoot, { recursive: true });
  
  const initScript = path.join(process.cwd(), 'axion', 'scripts', 'axion-init.mjs');
  if (fs.existsSync(initScript)) {
    try {
      execSync(`node ${initScript} --mode fresh --target ${newRoot}`, {
        stdio: jsonMode ? 'pipe' : 'inherit',
        cwd: process.cwd(),
      });
    } catch (e) {
      if (!jsonMode) console.log('  [WARN] Init script failed, creating minimal structure');
      receipt.warnings.push('Init script failed, creating minimal structure');
      fs.mkdirSync(path.join(newRoot, 'axion', 'config'), { recursive: true });
      fs.mkdirSync(path.join(newRoot, 'axion', 'domains'), { recursive: true });
      fs.mkdirSync(path.join(newRoot, 'axion', 'templates'), { recursive: true });
      fs.mkdirSync(path.join(newRoot, 'axion', 'registry'), { recursive: true });
    }
  }
}

function main(): void {
  const options = parseArgs();
  receipt.dryRun = options.dryRun;
  
  if (!jsonMode) console.log('\n[AXION] Overhaul Mode\n');
  if (!jsonMode) console.log(`  Source:      ${options.sourceDir}`);
  if (!jsonMode) console.log(`  Archive:     ${options.archiveDir}`);
  if (!jsonMode) console.log(`  New Root:    ${options.newRoot}`);
  if (!jsonMode) console.log(`  Strategy:    ${options.strategy}`);
  if (!jsonMode) console.log(`  Dry Run:     ${options.dryRun}`);
  if (!jsonMode) console.log('');
  
  const archivePath = path.resolve(options.sourceDir, options.archiveDir);
  const newRootPath = path.resolve(options.sourceDir, options.newRoot);
  
  receipt.archiveDir = archivePath;
  receipt.newRoot = newRootPath;
  receipt.strategy = options.strategy;
  
  if (fs.existsSync(archivePath) && !options.force) {
    const msg = `Archive directory already exists: ${archivePath}. Use --force to overwrite`;
    if (!jsonMode) {
      console.error(`[ERROR] Archive directory already exists: ${archivePath}`);
      console.error('        Use --force to overwrite');
    }
    receipt.ok = false;
    receipt.errors.push(msg);
    receipt.status = 'ERROR';
    emitOutput();
    process.exit(1);
  }
  
  if (fs.existsSync(newRootPath) && !options.force) {
    const msg = `New root already exists: ${newRootPath}. Use --force to overwrite`;
    if (!jsonMode) {
      console.error(`[ERROR] New root already exists: ${newRootPath}`);
      console.error('        Use --force to overwrite');
    }
    receipt.ok = false;
    receipt.errors.push(msg);
    receipt.status = 'ERROR';
    emitOutput();
    process.exit(1);
  }
  
  if (!jsonMode) console.log('[1/4] Preflight checks passed\n');
  
  if (!jsonMode) console.log('[2/4] Archiving current project...');
  const { copied, excluded, checksums } = copyDir(options.sourceDir, archivePath, options.dryRun);
  if (!jsonMode) console.log(`      Copied: ${copied} files, Excluded: ${excluded} items\n`);
  
  receipt.filesArchived = copied;
  receipt.filesExcluded = excluded;
  
  if (!jsonMode) console.log('[3/4] Creating fresh workspace...');
  createFreshWorkspace(newRootPath, options.dryRun);
  if (!jsonMode) console.log('');
  
  if (!jsonMode) console.log('[4/4] Writing manifest...');
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
    if (!jsonMode) console.log(`      Saved: ${manifestPath}`);
  } else {
    if (!jsonMode) console.log('      [DRY-RUN] Would write manifest');
  }
  
  if (!jsonMode) console.log('\n[AXION] Overhaul complete!\n');
  
  const nextCommands = [
    `cd ${newRootPath}`,
    'Edit axion/docs/product/RPBS_Product.md',
    'Edit axion/docs/product/REBS_Product.md',
    'node --import tsx axion/scripts/axion-run.ts --preset foundation --plan scaffold',
  ];
  
  receipt.status = options.dryRun ? 'DRY_RUN' : 'SUCCESS';
  receipt.nextCommands = nextCommands;
  
  if (!jsonMode) {
    const result = {
      status: options.dryRun ? 'DRY_RUN' : 'SUCCESS',
      archive_dir: archivePath,
      new_root: newRootPath,
      files_archived: copied,
      files_excluded: excluded,
      next_commands: nextCommands,
    };
    console.log(JSON.stringify(result, null, 2));
  }
  
  emitOutput();
}

try {
  main();
} catch (err: any) {
  receipt.ok = false;
  receipt.errors.push(err?.message ?? String(err));
  receipt.status = 'ERROR';
  emitOutput();
  if (!jsonMode) {
    console.error('[FATAL]', err);
  }
  process.exit(1);
}
