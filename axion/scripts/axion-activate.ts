#!/usr/bin/env node
/**
 * AXION Activate
 * 
 * Sets the active build pointer (ACTIVE_BUILD.json) to route runtime/deploy
 * to a specific build root. This is the only way to "switch routing" to a new build.
 * 
 * Default Gates (all must pass to activate):
 * - Docs must be locked (lock_manifest.json exists)
 * - Verify must PASS (verify_report.json status = PASS)
 * - Tests must PASS if test_report.json exists (unless --allow-no-tests)
 * 
 * The ACTIVE_BUILD.json pointer file is written to a stable location (kits directory
 * or a specified pointer path) and is the single source of truth for what build is active.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-activate.ts --build-root <path> --project-name <name>
 *   node --import tsx axion/scripts/axion-activate.ts --build-root ./kits/build-001 --project-name myapp --pointer ./kits/ACTIVE_BUILD.json
 * 
 * Flags:
 *   --build-root <path>       Build root containing the kit to activate
 *   --project-name <name>     Project name (workspace folder name)
 *   --pointer <path>          Path for ACTIVE_BUILD.json (default: <build-root>/ACTIVE_BUILD.json)
 *   --allow-no-tests          Allow activation even if tests haven't run
 *   --force                   Skip all gates (not recommended)
 *   --dry-run                 Show what would be done without changes
 *   --json                    Output only JSON (no human-readable text)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { writeJsonAtomic } from '../lib/atomic-writer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ActivateResult {
  status: 'success' | 'failed' | 'blocked_by';
  stage: 'activate';
  active_build_root?: string;
  project_name?: string;
  app_path?: string;
  pointer_path?: string;
  activated_at?: string;
  dry_run?: boolean;
  reason_codes?: string[];
  hint?: string[];
  gates_passed?: string[];
  gates_failed?: string[];
}

interface ActivateOptions {
  buildRoot: string;
  projectName: string;
  pointerPath?: string;
  allowNoTests: boolean;
  force: boolean;
  dryRun: boolean;
  jsonOutput: boolean;
}

interface ActiveBuildPointer {
  active_build_root: string;
  project_name: string;
  app_path: string;
  activated_at: string;
  activated_by: string;
  docs_locked: boolean;
  verify_passed: boolean;
  tests_passed: boolean | null;
}

interface VerifyReport {
  generated_at: string;
  status: 'PASS' | 'FAIL';
  current_revision: string;
  modules: Record<string, unknown>;
}

function parseArgs(args: string[]): ActivateOptions {
  const options: ActivateOptions = {
    buildRoot: '',
    projectName: '',
    pointerPath: undefined,
    allowNoTests: false,
    force: false,
    dryRun: false,
    jsonOutput: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--build-root':
        options.buildRoot = args[++i] || '';
        break;
      case '--project-name':
        options.projectName = args[++i] || '';
        break;
      case '--pointer':
        options.pointerPath = args[++i];
        break;
      case '--allow-no-tests':
        options.allowNoTests = true;
        break;
      case '--force':
        options.force = true;
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

function log(msg: string, jsonOutput: boolean): void {
  if (!jsonOutput) {
    console.log(msg);
  }
}

function checkLockExists(workspaceRoot: string): boolean {
  const lockPath = path.join(workspaceRoot, 'registry', 'lock_manifest.json');
  return fs.existsSync(lockPath);
}

function checkVerifyPass(workspaceRoot: string): boolean {
  const verifyPath = path.join(workspaceRoot, 'registry', 'verify_report.json');
  if (!fs.existsSync(verifyPath)) {
    return false;
  }
  
  try {
    const content = fs.readFileSync(verifyPath, 'utf-8');
    const report: VerifyReport = JSON.parse(content);
    return report.status === 'PASS';
  } catch {
    return false;
  }
}

function checkTestsPass(workspaceRoot: string): boolean | null {
  const testReportPath = path.join(workspaceRoot, 'registry', 'test_report.json');
  if (!fs.existsSync(testReportPath)) {
    return null; // No test report means tests haven't run
  }
  
  try {
    const content = fs.readFileSync(testReportPath, 'utf-8');
    const report = JSON.parse(content);
    return report.status === 'PASS';
  } catch {
    return false;
  }
}

function writeActiveBuildPointer(pointerPath: string, pointer: ActiveBuildPointer, dryRun: boolean): void {
  if (!dryRun) {
    const dir = path.dirname(pointerPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    writeJsonAtomic(pointerPath, pointer);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  log('\n[AXION] Activate\n', options.jsonOutput);

  // Validate required args
  if (!options.buildRoot) {
    const result: ActivateResult = {
      status: 'failed',
      stage: 'activate',
      reason_codes: ['BUILD_ROOT_MISSING'],
      hint: ['Provide --build-root <path> to specify the kit to activate']
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  if (!options.projectName) {
    const result: ActivateResult = {
      status: 'failed',
      stage: 'activate',
      reason_codes: ['PROJECT_NAME_MISSING'],
      hint: ['Provide --project-name <name> to specify the project workspace']
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const buildRoot = path.resolve(options.buildRoot);
  const projectName = options.projectName;
  const workspaceRoot = path.join(buildRoot, projectName);
  const appPath = path.join(workspaceRoot, 'app');
  
  // Default pointer path is inside the build root
  const pointerPath = options.pointerPath 
    ? path.resolve(options.pointerPath)
    : path.join(buildRoot, 'ACTIVE_BUILD.json');

  log(`[INFO] Build root: ${buildRoot}`, options.jsonOutput);
  log(`[INFO] Project name: ${projectName}`, options.jsonOutput);
  log(`[INFO] Workspace root: ${workspaceRoot}`, options.jsonOutput);
  log(`[INFO] App path: ${appPath}`, options.jsonOutput);
  log(`[INFO] Pointer path: ${pointerPath}`, options.jsonOutput);

  // Check workspace exists
  if (!fs.existsSync(workspaceRoot)) {
    const result: ActivateResult = {
      status: 'failed',
      stage: 'activate',
      reason_codes: ['WORKSPACE_NOT_FOUND'],
      hint: [
        `Workspace not found at ${workspaceRoot}`,
        'Run workspace-create or prepare-root first'
      ]
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  // Gate checks
  const gatesPassed: string[] = [];
  const gatesFailed: string[] = [];
  const hints: string[] = [];

  // Gate 1: Lock exists
  const lockExists = checkLockExists(workspaceRoot);
  if (lockExists) {
    gatesPassed.push('docs_locked');
    log('[PASS] Docs are locked', options.jsonOutput);
  } else {
    gatesFailed.push('docs_locked');
    hints.push('Run lock stage to lock docs before activation');
    log('[FAIL] Docs are not locked', options.jsonOutput);
  }

  // Gate 2: Verify PASS
  const verifyPass = checkVerifyPass(workspaceRoot);
  if (verifyPass) {
    gatesPassed.push('verify_pass');
    log('[PASS] Verify passed', options.jsonOutput);
  } else {
    gatesFailed.push('verify_pass');
    hints.push('Run verify stage and ensure all checks pass');
    log('[FAIL] Verify did not pass', options.jsonOutput);
  }

  // Gate 3: Tests PASS (if test_report.json exists, tests must pass unless --allow-no-tests)
  let testsPass: boolean | null = checkTestsPass(workspaceRoot);
  if (testsPass === null) {
    // No test report exists
    if (options.allowNoTests) {
      log('[SKIP] Tests not run (--allow-no-tests)', options.jsonOutput);
    } else {
      gatesFailed.push('tests_not_run');
      hints.push('Run test stage before activation, or use --allow-no-tests to skip');
      log('[FAIL] Tests have not run', options.jsonOutput);
    }
  } else if (testsPass === true) {
    gatesPassed.push('tests_pass');
    log('[PASS] Tests passed', options.jsonOutput);
  } else {
    // Tests ran but failed
    if (options.allowNoTests) {
      log('[WARN] Tests failed (--allow-no-tests, continuing)', options.jsonOutput);
    } else {
      gatesFailed.push('tests_fail');
      hints.push('Fix failing tests before activation');
      log('[FAIL] Tests failed', options.jsonOutput);
    }
  }

  // Check gates
  if (gatesFailed.length > 0 && !options.force) {
    const result: ActivateResult = {
      status: 'blocked_by',
      stage: 'activate',
      reason_codes: gatesFailed.map(g => g.toUpperCase() + '_FAILED'),
      hint: hints,
      gates_passed: gatesPassed,
      gates_failed: gatesFailed
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  if (options.force && gatesFailed.length > 0) {
    log(`[WARN] Forcing activation despite failed gates: ${gatesFailed.join(', ')}`, options.jsonOutput);
  }

  // Create pointer
  const activatedAt = new Date().toISOString();
  const pointer: ActiveBuildPointer = {
    active_build_root: buildRoot,
    project_name: projectName,
    app_path: appPath,
    activated_at: activatedAt,
    activated_by: 'axion-activate',
    docs_locked: lockExists,
    verify_passed: verifyPass,
    tests_passed: testsPass
  };

  writeActiveBuildPointer(pointerPath, pointer, options.dryRun);

  log('\n[PASS] Build activated successfully\n', options.jsonOutput);

  const result: ActivateResult = {
    status: 'success',
    stage: 'activate',
    active_build_root: buildRoot,
    project_name: projectName,
    app_path: appPath,
    pointer_path: pointerPath,
    activated_at: activatedAt,
    gates_passed: gatesPassed,
    gates_failed: gatesFailed.length > 0 ? gatesFailed : undefined
  };

  if (options.dryRun) {
    result.dry_run = true;
  }

  console.log(JSON.stringify(result, null, 2));
}

main();
