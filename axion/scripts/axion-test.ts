#!/usr/bin/env node
/**
 * AXION Test
 * 
 * Runs test suites, lint, typecheck, and smoke tests.
 * 
 * Two-Root Model Support:
 * - System Root: <BUILD_ROOT>/axion/ (configs, templates)
 * - Workspace Root: <BUILD_ROOT>/<PROJECT_NAME>/ (outputs, app)
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-test.ts --build-root <path> --project-name <name>
 *   node --import tsx axion/scripts/axion-test.ts --app-path ./axion-app  (legacy mode)
 * 
 * Flags:
 *   --build-root <path>       Build root containing axion/ system folder (two-root mode)
 *   --project-name <name>     Project name (two-root mode)
 *   --app-path <path>         App path (legacy mode)
 *   --dry-run                 Show what would be done without running
 *   --json                    Output only JSON
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, ExecSyncOptions } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default paths (legacy mode) - will be overridden by two-root mode
let AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
let WORKSPACE_ROOT = AXION_ROOT;
let STAGE_MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');

// Setup paths for two-root mode
function setupTwoRootPaths(buildRoot: string, projectName: string): void {
  AXION_ROOT = path.join(buildRoot, 'axion');
  WORKSPACE_ROOT = path.join(buildRoot, projectName);
  STAGE_MARKERS_PATH = path.join(WORKSPACE_ROOT, 'registry', 'stage_markers.json');
}

interface TestResult {
  status: 'success' | 'blocked_by' | 'failed';
  stage: string;
  app_path?: string;
  tests_passed?: number;
  tests_failed?: number;
  lint_errors?: number;
  typecheck_errors?: number;
  missing?: string[];
  hint?: string[];
}

interface StageMarkers {
  [module: string]: {
    [stage: string]: {
      completed_at: string;
      status: 'success' | 'failed';
    };
  };
}

function loadStageMarkers(): StageMarkers {
  if (!fs.existsSync(STAGE_MARKERS_PATH)) return {};
  return JSON.parse(fs.readFileSync(STAGE_MARKERS_PATH, 'utf-8'));
}

function saveStageMarkers(markers: StageMarkers): void {
  fs.writeFileSync(STAGE_MARKERS_PATH, JSON.stringify(markers, null, 2));
}

function findAppPath(): string | null {
  const candidates = [
    path.join(process.cwd(), 'axion-app'),
    path.join(process.cwd(), 'app'),
    path.join(process.cwd(), 'src'),
  ];
  
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
  }
  
  return null;
}

function runCommand(command: string, cwd: string): { success: boolean; output: string } {
  const options: ExecSyncOptions = {
    cwd,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  };
  
  try {
    const output = execSync(command, options) as string;
    return { success: true, output };
  } catch (error: any) {
    return { 
      success: false, 
      output: error.stdout || error.stderr || error.message 
    };
  }
}

function main() {
  const args = process.argv.slice(2);
  const appPathIdx = args.indexOf('--app-path');
  const buildRootIdx = args.indexOf('--build-root');
  const projectNameIdx = args.indexOf('--project-name');
  const skipLint = args.includes('--skip-lint');
  const skipTypecheck = args.includes('--skip-typecheck');
  const dryRun = args.includes('--dry-run');
  
  // Two-root mode takes precedence
  const buildRoot = buildRootIdx !== -1 ? args[buildRootIdx + 1] : null;
  const projectName = projectNameIdx !== -1 ? args[projectNameIdx + 1] : null;
  
  let appPath = appPathIdx !== -1 ? args[appPathIdx + 1] : null;
  
  console.log('\n[AXION] Test\n');
  
  // If two-root mode, set up paths accordingly
  if (buildRoot && projectName) {
    setupTwoRootPaths(buildRoot, projectName);
    appPath = path.join(WORKSPACE_ROOT, 'app');
    console.log(`[INFO] Two-root mode: ${buildRoot}/${projectName}`);
  } else if (appPath) {
    // Legacy/--app-path mode: derive workspace root from app path
    const appParent = path.dirname(appPath);
    WORKSPACE_ROOT = appParent;
    AXION_ROOT = path.join(appParent, 'axion');
    STAGE_MARKERS_PATH = path.join(appParent, 'axion', 'registry', 'stage_markers.json');
    console.log(`[INFO] App-path mode: ${appPath}`);
  }
  
  if (!appPath) {
    appPath = findAppPath();
  }
  
  if (!appPath || !fs.existsSync(appPath)) {
    const result: TestResult = {
      status: 'failed',
      stage: 'test',
      hint: [
        'Could not find app directory',
        'Use --app-path to specify location, or --build-root and --project-name',
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  
  if (dryRun) {
    const result: TestResult = {
      status: 'success',
      stage: 'test',
      app_path: appPath,
      hint: ['Dry run - would run tests']
    };
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  
  console.log(`App path: ${appPath}`);
  console.log('');
  
  let totalPassed = 0;
  let totalFailed = 0;
  let lintErrors = 0;
  let typecheckErrors = 0;
  
  if (!skipTypecheck) {
    console.log('[RUN] TypeScript check...');
    const tsResult = runCommand('npm run typecheck', appPath);
    if (!tsResult.success) {
      console.log('[WARN] TypeScript errors found');
      typecheckErrors = (tsResult.output.match(/error TS/g) || []).length || 1;
    } else {
      console.log('[PASS] TypeScript check');
    }
  }
  
  if (!skipLint) {
    console.log('[RUN] Lint check...');
    const lintResult = runCommand('npm run lint', appPath);
    if (!lintResult.success) {
      console.log('[WARN] Lint errors found');
      lintErrors = (lintResult.output.match(/error/gi) || []).length || 1;
    } else {
      console.log('[PASS] Lint check');
    }
  }
  
  console.log('[RUN] Unit tests...');
  const testResult = runCommand('npm test', appPath);
  if (testResult.success) {
    console.log('[PASS] Unit tests');
    const passMatch = testResult.output.match(/(\d+) pass/i);
    if (passMatch) totalPassed = parseInt(passMatch[1], 10);
  } else {
    console.log('[WARN] Some tests failed');
    const passMatch = testResult.output.match(/(\d+) pass/i);
    const failMatch = testResult.output.match(/(\d+) fail/i);
    if (passMatch) totalPassed = parseInt(passMatch[1], 10);
    if (failMatch) totalFailed = parseInt(failMatch[1], 10);
  }
  
  console.log('');
  
  const markers = loadStageMarkers();
  markers['global'] = markers['global'] || {};
  
  const overallSuccess = totalFailed === 0 && lintErrors === 0 && typecheckErrors === 0;
  
  markers['global']['test'] = {
    completed_at: new Date().toISOString(),
    status: overallSuccess ? 'success' : 'failed',
  };
  saveStageMarkers(markers);
  
  // Write test_report.json for activation gate (critical for two-root mode)
  const testReport = {
    generated_at: new Date().toISOString(),
    status: overallSuccess ? 'PASS' : 'FAIL',
    tests_passed: totalPassed,
    tests_failed: totalFailed,
    lint_errors: lintErrors,
    typecheck_errors: typecheckErrors,
    duration_ms: 0
  };
  const reportDir = path.join(WORKSPACE_ROOT, 'registry');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(path.join(reportDir, 'test_report.json'), JSON.stringify(testReport, null, 2));
  
  const result: TestResult = {
    status: overallSuccess ? 'success' : 'failed',
    stage: 'test',
    app_path: appPath,
    tests_passed: totalPassed,
    tests_failed: totalFailed,
    lint_errors: lintErrors,
    typecheck_errors: typecheckErrors,
  };
  
  if (!overallSuccess) {
    result.hint = [
      'Some checks failed. Review the output above.',
      totalFailed > 0 ? `${totalFailed} test(s) failed` : '',
      lintErrors > 0 ? `${lintErrors} lint error(s)` : '',
      typecheckErrors > 0 ? `${typecheckErrors} TypeScript error(s)` : '',
    ].filter(Boolean);
  }
  
  console.log(JSON.stringify(result, null, 2));
  
  if (!overallSuccess) {
    process.exit(1);
  }
}

main();
