#!/usr/bin/env node
/**
 * AXION Prepare Root
 * 
 * Stage 0: Creates the project workspace root before any other stage runs.
 * Reads project name from axion/docs/product/RPBS_Product.md and creates
 * the workspace at <BUILD_ROOT>/<PROJECT_NAME>/ with required subdirectories.
 * 
 * Two-Root Model:
 * - System Root: <BUILD_ROOT>/axion/ (immutable, scripts/templates/configs)
 * - Project Workspace Root: <BUILD_ROOT>/<PROJECT_NAME>/ (mutable, all outputs)
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-prepare-root.ts --build-root <path>
 *   node --import tsx axion/scripts/axion-prepare-root.ts --build-root . --project-name my-app
 * 
 * Flags:
 *   --build-root <path>     Build root containing axion/ system folder
 *   --project-name <name>   Override project name (default: read from RPBS)
 *   --refuse-if-exists      Fail if workspace root already exists
 *   --refuse-if-nonempty    Fail if workspace root exists and has files
 *   --allow-nonempty        Allow building on existing non-empty workspace
 *   --archive-existing      Archive existing workspace contents
 *   --dry-run               Show what would be done without changes
 *   --json                  Emit structured JSON receipt to stdout
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');
const startTime = Date.now();

interface PrepareRootReceipt {
  ok: boolean;
  stage: 'prepare-root';
  status: 'success' | 'failed' | 'blocked_by';
  root?: string;
  project_name?: string;
  created?: boolean;
  dirs_created?: string[];
  archived?: boolean;
  archive_path?: string;
  dry_run?: boolean;
  reason_codes?: string[];
  hint?: string[];
  errors: string[];
  elapsedMs?: number;
}

const receipt: PrepareRootReceipt = {
  ok: true,
  stage: 'prepare-root',
  status: 'success',
  errors: [],
};

function emitOutput(): void {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  } else {
    if (receipt.ok) {
      console.log(JSON.stringify({
        status: receipt.status,
        stage: receipt.stage,
        root: receipt.root,
        project_name: receipt.project_name,
        created: receipt.created,
        dirs_created: receipt.dirs_created,
        archived: receipt.archived,
        archive_path: receipt.archive_path,
        dry_run: receipt.dry_run,
        reason_codes: receipt.reason_codes,
        hint: receipt.hint,
      }, null, 2));
    } else {
      console.log(JSON.stringify({
        status: receipt.status,
        stage: receipt.stage,
        reason_codes: receipt.reason_codes,
        hint: receipt.hint,
        errors: receipt.errors,
      }, null, 2));
    }
  }
}

interface PrepareRootOptions {
  buildRoot: string;
  projectName?: string;
  refuseIfExists: boolean;
  refuseIfNonempty: boolean;
  allowNonempty: boolean;
  archiveExisting: boolean;
  dryRun: boolean;
}

const REQUIRED_SUBDIRS = [
  'docs',
  'domains',
  'registry',
  'app'
];

function parseArgs(args: string[]): PrepareRootOptions {
  const options: PrepareRootOptions = {
    buildRoot: process.cwd(),
    projectName: undefined,
    refuseIfExists: false,
    refuseIfNonempty: true,
    allowNonempty: false,
    archiveExisting: false,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--build-root':
        options.buildRoot = args[++i] || options.buildRoot;
        break;
      case '--project-name':
        options.projectName = args[++i];
        break;
      case '--refuse-if-exists':
        options.refuseIfExists = true;
        break;
      case '--refuse-if-nonempty':
        options.refuseIfNonempty = true;
        break;
      case '--allow-nonempty':
        options.allowNonempty = true;
        options.refuseIfNonempty = false;
        break;
      case '--archive-existing':
        options.archiveExisting = true;
        options.refuseIfNonempty = false;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
    }
  }

  return options;
}

function extractProjectName(buildRoot: string): string | null {
  const rpbsPath = path.join(buildRoot, 'axion', 'docs', 'product', 'RPBS_Product.md');
  
  if (!fs.existsSync(rpbsPath)) {
    return null;
  }

  const content = fs.readFileSync(rpbsPath, 'utf-8');
  
  const projectMatch = content.match(/\*\*Project:\*\*\s*(.+)/);
  if (projectMatch) {
    const name = projectMatch[1].trim();
    if (name.startsWith('{{') && name.endsWith('}}')) {
      return null;
    }
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  return null;
}

function isUnsafeRoot(workspaceRoot: string, buildRoot: string): boolean {
  const axionSystemPath = path.resolve(buildRoot, 'axion');
  const resolvedWorkspace = path.resolve(workspaceRoot);
  
  return resolvedWorkspace.startsWith(axionSystemPath);
}

function isDirectoryEmpty(dirPath: string): boolean {
  if (!fs.existsSync(dirPath)) return true;
  const entries = fs.readdirSync(dirPath);
  return entries.length === 0;
}

function archiveDirectory(srcPath: string, buildRoot: string): string | null {
  if (!fs.existsSync(srcPath)) return null;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const archiveDir = path.join(buildRoot, '_axion_archive', timestamp);
  
  try {
    fs.mkdirSync(archiveDir, { recursive: true });
    
    const entries = fs.readdirSync(srcPath);
    for (const entry of entries) {
      const srcEntry = path.join(srcPath, entry);
      const destEntry = path.join(archiveDir, entry);
      fs.renameSync(srcEntry, destEntry);
    }
    
    return archiveDir;
  } catch (err) {
    return null;
  }
}

function createWorkspaceStructure(workspaceRoot: string, isDryRun: boolean): string[] {
  const created: string[] = [];
  
  for (const subdir of REQUIRED_SUBDIRS) {
    const fullPath = path.join(workspaceRoot, subdir);
    if (!fs.existsSync(fullPath)) {
      if (!isDryRun) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      created.push(subdir);
    }
  }
  
  return created;
}

function failWithReceipt(reasonCodes: string[], hints: string[]): never {
  receipt.ok = false;
  receipt.status = 'failed';
  receipt.reason_codes = reasonCodes;
  receipt.hint = hints;
  receipt.errors.push(reasonCodes.join(', '));
  emitOutput();
  process.exit(1);
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  if (!jsonMode) console.log('\n[AXION] Prepare Root\n');
  
  const buildRoot = path.resolve(options.buildRoot);
  
  const axionSystemPath = path.join(buildRoot, 'axion');
  if (!fs.existsSync(axionSystemPath)) {
    failWithReceipt(
      ['AXION_SYSTEM_NOT_FOUND'],
      [
        `axion/ system folder not found at ${buildRoot}`,
        'Ensure --build-root points to the directory containing axion/'
      ]
    );
  }
  
  let projectName: string | undefined = options.projectName;
  if (!projectName) {
    const extracted = extractProjectName(buildRoot);
    if (!extracted) {
      failWithReceipt(
        ['PROJECT_NAME_MISSING'],
        [
          'Could not extract project name from axion/docs/product/RPBS_Product.md',
          'Ensure **Project:** field is populated (not a placeholder)',
          'Or provide --project-name <name> explicitly'
        ]
      );
    }
    projectName = extracted;
  }
  
  const workspaceRoot = path.join(buildRoot, projectName);
  
  if (!jsonMode) console.log(`[INFO] Build root: ${buildRoot}`);
  if (!jsonMode) console.log(`[INFO] Project name: ${projectName}`);
  if (!jsonMode) console.log(`[INFO] Workspace root: ${workspaceRoot}`);
  
  if (isUnsafeRoot(workspaceRoot, buildRoot)) {
    failWithReceipt(
      ['UNSAFE_ROOT'],
      [
        'Workspace root cannot be inside axion/ system folder',
        'Choose a different project name or build root'
      ]
    );
  }
  
  const workspaceExists = fs.existsSync(workspaceRoot);
  const isEmpty = isDirectoryEmpty(workspaceRoot);
  
  if (options.refuseIfExists && workspaceExists) {
    failWithReceipt(
      ['ROOT_EXISTS_REFUSED'],
      [
        `Workspace root already exists at ${workspaceRoot}`,
        'Remove --refuse-if-exists to proceed',
        'Or use --archive-existing to move existing contents'
      ]
    );
  }
  
  if (options.refuseIfNonempty && workspaceExists && !isEmpty && !options.allowNonempty && !options.archiveExisting) {
    failWithReceipt(
      ['ROOT_EXISTS_NONEMPTY'],
      [
        `Workspace root exists and is not empty: ${workspaceRoot}`,
        'Use --archive-existing to move existing contents to archive',
        'Or use --allow-nonempty to build on top of existing files'
      ]
    );
  }
  
  let archivedPath: string | null = null;
  if (options.archiveExisting && workspaceExists && !isEmpty) {
    if (!jsonMode) console.log('[INFO] Archiving existing workspace contents...');
    if (!options.dryRun) {
      archivedPath = archiveDirectory(workspaceRoot, buildRoot);
      if (!archivedPath) {
        failWithReceipt(
          ['ARCHIVE_FAILED'],
          ['Failed to archive existing workspace contents']
        );
      }
      if (!jsonMode) console.log(`[INFO] Archived to: ${archivedPath}`);
    } else {
      if (!jsonMode) console.log('[DRY-RUN] Would archive existing contents');
    }
  }
  
  let created = false;
  if (!fs.existsSync(workspaceRoot)) {
    if (!options.dryRun) {
      fs.mkdirSync(workspaceRoot, { recursive: true });
    }
    created = true;
    if (!jsonMode) console.log(`[INFO] Created workspace root: ${workspaceRoot}`);
  }
  
  if (!options.dryRun) {
    try {
      const testFile = path.join(workspaceRoot, '.axion_write_test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (err) {
      failWithReceipt(
        ['ROOT_NOT_WRITABLE'],
        [`Workspace root is not writable: ${workspaceRoot}`]
      );
    }
  }
  
  const dirsCreated = createWorkspaceStructure(workspaceRoot, options.dryRun);
  if (dirsCreated.length > 0) {
    if (!jsonMode) console.log(`[INFO] Created subdirectories: ${dirsCreated.join(', ')}`);
  }
  
  if (!jsonMode) console.log('\n[PASS] Workspace root prepared\n');
  
  receipt.ok = true;
  receipt.status = 'success';
  receipt.root = workspaceRoot;
  receipt.project_name = projectName;
  receipt.created = created;
  receipt.dirs_created = dirsCreated;
  receipt.archived = archivedPath !== null;
  
  if (archivedPath) {
    receipt.archive_path = archivedPath;
  }
  
  if (options.dryRun) {
    receipt.dry_run = true;
  }
  
  emitOutput();
}

try {
  main();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  receipt.ok = false;
  receipt.status = 'failed';
  receipt.errors.push(message);
  emitOutput();
  process.exit(1);
}
