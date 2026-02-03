#!/usr/bin/env node
/**
 * AXION Prepare Root
 * 
 * Stage 0: Creates the project workspace root before any other stage runs.
 * Reads project name from axion/source_docs/product/RPBS_Product.md and creates
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
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PrepareRootResult {
  status: 'success' | 'failed' | 'blocked_by';
  stage: 'prepare-root';
  root?: string;
  project_name?: string;
  created?: boolean;
  dirs_created?: string[];
  archived?: boolean;
  archive_path?: string;
  dry_run?: boolean;
  reason_codes?: string[];
  hint?: string[];
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
  'source_docs',
  'domains',
  'registry',
  'app'
];

function parseArgs(args: string[]): PrepareRootOptions {
  const options: PrepareRootOptions = {
    buildRoot: process.cwd(),
    projectName: undefined,
    refuseIfExists: false,
    refuseIfNonempty: true,  // Default: fail if non-empty
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
  const rpbsPath = path.join(buildRoot, 'axion', 'source_docs', 'product', 'RPBS_Product.md');
  
  if (!fs.existsSync(rpbsPath)) {
    return null;
  }

  const content = fs.readFileSync(rpbsPath, 'utf-8');
  
  // Look for **Project:** field
  const projectMatch = content.match(/\*\*Project:\*\*\s*(.+)/);
  if (projectMatch) {
    const name = projectMatch[1].trim();
    // If it's a placeholder, return null
    if (name.startsWith('{{') && name.endsWith('}}')) {
      return null;
    }
    // Sanitize: lowercase, replace spaces/special chars with dashes
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  return null;
}

function isUnsafeRoot(workspaceRoot: string, buildRoot: string): boolean {
  const axionSystemPath = path.resolve(buildRoot, 'axion');
  const resolvedWorkspace = path.resolve(workspaceRoot);
  
  // Workspace must not be inside axion/ or equal to axion/
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
    
    // Move contents
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

function createWorkspaceStructure(workspaceRoot: string, dryRun: boolean): string[] {
  const created: string[] = [];
  
  for (const subdir of REQUIRED_SUBDIRS) {
    const fullPath = path.join(workspaceRoot, subdir);
    if (!fs.existsSync(fullPath)) {
      if (!dryRun) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      created.push(subdir);
    }
  }
  
  return created;
}

function outputJson(result: PrepareRootResult): void {
  console.log(JSON.stringify(result, null, 2));
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  console.log('\n[AXION] Prepare Root\n');
  
  const buildRoot = path.resolve(options.buildRoot);
  
  // Check axion system folder exists
  const axionSystemPath = path.join(buildRoot, 'axion');
  if (!fs.existsSync(axionSystemPath)) {
    outputJson({
      status: 'failed',
      stage: 'prepare-root',
      reason_codes: ['AXION_SYSTEM_NOT_FOUND'],
      hint: [
        `axion/ system folder not found at ${buildRoot}`,
        'Ensure --build-root points to the directory containing axion/'
      ]
    });
    process.exit(1);
  }
  
  // Determine project name
  let projectName: string | undefined = options.projectName;
  if (!projectName) {
    const extracted = extractProjectName(buildRoot);
    if (!extracted) {
      outputJson({
        status: 'failed',
        stage: 'prepare-root',
        reason_codes: ['PROJECT_NAME_MISSING'],
        hint: [
          'Could not extract project name from axion/source_docs/product/RPBS_Product.md',
          'Ensure **Project:** field is populated (not a placeholder)',
          'Or provide --project-name <name> explicitly'
        ]
      });
      process.exit(1);
    }
    projectName = extracted;
  }
  
  const workspaceRoot = path.join(buildRoot, projectName);
  
  console.log(`[INFO] Build root: ${buildRoot}`);
  console.log(`[INFO] Project name: ${projectName}`);
  console.log(`[INFO] Workspace root: ${workspaceRoot}`);
  
  // Safety check: workspace must not be inside axion/
  if (isUnsafeRoot(workspaceRoot, buildRoot)) {
    outputJson({
      status: 'failed',
      stage: 'prepare-root',
      reason_codes: ['UNSAFE_ROOT'],
      hint: [
        'Workspace root cannot be inside axion/ system folder',
        'Choose a different project name or build root'
      ]
    });
    process.exit(1);
  }
  
  const workspaceExists = fs.existsSync(workspaceRoot);
  const isEmpty = isDirectoryEmpty(workspaceRoot);
  
  // Check refuse-if-exists
  if (options.refuseIfExists && workspaceExists) {
    outputJson({
      status: 'failed',
      stage: 'prepare-root',
      reason_codes: ['ROOT_EXISTS_REFUSED'],
      hint: [
        `Workspace root already exists at ${workspaceRoot}`,
        'Remove --refuse-if-exists to proceed',
        'Or use --archive-existing to move existing contents'
      ]
    });
    process.exit(1);
  }
  
  // Check refuse-if-nonempty
  if (options.refuseIfNonempty && workspaceExists && !isEmpty && !options.allowNonempty && !options.archiveExisting) {
    outputJson({
      status: 'failed',
      stage: 'prepare-root',
      reason_codes: ['ROOT_EXISTS_NONEMPTY'],
      hint: [
        `Workspace root exists and is not empty: ${workspaceRoot}`,
        'Use --archive-existing to move existing contents to archive',
        'Or use --allow-nonempty to build on top of existing files'
      ]
    });
    process.exit(1);
  }
  
  // Archive existing if requested
  let archivedPath: string | null = null;
  if (options.archiveExisting && workspaceExists && !isEmpty) {
    console.log('[INFO] Archiving existing workspace contents...');
    if (!options.dryRun) {
      archivedPath = archiveDirectory(workspaceRoot, buildRoot);
      if (!archivedPath) {
        outputJson({
          status: 'failed',
          stage: 'prepare-root',
          reason_codes: ['ARCHIVE_FAILED'],
          hint: ['Failed to archive existing workspace contents']
        });
        process.exit(1);
      }
      console.log(`[INFO] Archived to: ${archivedPath}`);
    } else {
      console.log('[DRY-RUN] Would archive existing contents');
    }
  }
  
  // Create workspace root if needed
  let created = false;
  if (!fs.existsSync(workspaceRoot)) {
    if (!options.dryRun) {
      fs.mkdirSync(workspaceRoot, { recursive: true });
    }
    created = true;
    console.log(`[INFO] Created workspace root: ${workspaceRoot}`);
  }
  
  // Check writable
  if (!options.dryRun) {
    try {
      const testFile = path.join(workspaceRoot, '.axion_write_test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (err) {
      outputJson({
        status: 'failed',
        stage: 'prepare-root',
        reason_codes: ['ROOT_NOT_WRITABLE'],
        hint: [`Workspace root is not writable: ${workspaceRoot}`]
      });
      process.exit(1);
    }
  }
  
  // Create subdirectories
  const dirsCreated = createWorkspaceStructure(workspaceRoot, options.dryRun);
  if (dirsCreated.length > 0) {
    console.log(`[INFO] Created subdirectories: ${dirsCreated.join(', ')}`);
  }
  
  console.log('\n[PASS] Workspace root prepared\n');
  
  const result: PrepareRootResult = {
    status: 'success',
    stage: 'prepare-root',
    root: workspaceRoot,
    project_name: projectName,
    created,
    dirs_created: dirsCreated,
    archived: archivedPath !== null,
  };
  
  if (archivedPath) {
    result.archive_path = archivedPath;
  }
  
  if (options.dryRun) {
    result.dry_run = true;
  }
  
  outputJson(result);
}

main();
