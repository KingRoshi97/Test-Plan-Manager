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
 *   --json                    Output only JSON receipt
 *   --skip-lint               Skip lint checks
 *   --skip-typecheck          Skip typecheck
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, ExecSyncOptions } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');
const startTime = Date.now();

const receipt: Record<string, any> = {
  ok: true,
  stage: 'test',
  dryRun,
  errors: [] as string[],
  warnings: [] as string[],
  testsRun: 0,
  testsPassed: 0,
  testsFailed: 0,
  lintErrors: 0,
  typecheckErrors: 0,
  lintSkipped: false,
  testSkipped: false,
  appPath: null as string | null,
  elapsedMs: 0,
};

function emitOutput(): void {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  } else {
    const result: Record<string, any> = {
      status: receipt.ok ? 'success' : 'failed',
      stage: receipt.stage,
    };
    if (receipt.appPath) result.app_path = receipt.appPath;
    if (receipt.testsPassed > 0) result.tests_passed = receipt.testsPassed;
    if (receipt.testsFailed > 0) result.tests_failed = receipt.testsFailed;
    if (receipt.lintErrors > 0) result.lint_errors = receipt.lintErrors;
    if (receipt.typecheckErrors > 0) result.typecheck_errors = receipt.typecheckErrors;
    const hints: string[] = [];
    if (!receipt.ok) {
      hints.push('Some checks failed. Review the output above.');
      if (receipt.testsFailed > 0) hints.push(`${receipt.testsFailed} test(s) failed`);
      if (receipt.lintErrors > 0) hints.push(`${receipt.lintErrors} lint error(s)`);
      if (receipt.typecheckErrors > 0) hints.push(`${receipt.typecheckErrors} TypeScript error(s)`);
    }
    if (receipt.lintSkipped) hints.push('Lint was skipped (no config found)');
    if (receipt.testSkipped) hints.push('Unit tests were skipped (no test files found)');
    if (receipt.dryRun) hints.push('Dry run - would run tests');
    if (receipt.errors.length > 0) hints.push(...receipt.errors);
    if (hints.length > 0) result.hint = hints;
    console.log(JSON.stringify(result, null, 2));
  }
}

let AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
let WORKSPACE_ROOT = AXION_ROOT;
let STAGE_MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');

function setupTwoRootPaths(buildRoot: string, projectName: string): void {
  AXION_ROOT = path.join(buildRoot, 'axion');
  WORKSPACE_ROOT = path.join(buildRoot, projectName);
  STAGE_MARKERS_PATH = path.join(WORKSPACE_ROOT, 'registry', 'stage_markers.json');
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
  const dir = path.dirname(STAGE_MARKERS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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

function runCommand(command: string, cwd: string, timeoutMs?: number): { success: boolean; output: string } {
  const options: ExecSyncOptions = {
    cwd,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: '/bin/sh' as any,
    ...(timeoutMs ? { timeout: timeoutMs } : {}),
  };
  
  try {
    const output = execSync(command, options) as string;
    return { success: true, output };
  } catch (error: any) {
    const combined = [error.stdout, error.stderr, error.message].filter(Boolean).join('\n');
    return { 
      success: false, 
      output: combined
    };
  }
}

function ensureDependencies(appPath: string): { installed: boolean; error?: string } {
  const nodeModulesPath = path.join(appPath, 'node_modules');
  const packageJsonPath = path.join(appPath, 'package.json');

  if (fs.existsSync(nodeModulesPath)) {
    if (!jsonMode) console.log('[INFO] node_modules already exists, skipping install');
    return { installed: true };
  }

  if (!fs.existsSync(packageJsonPath)) {
    return { installed: false, error: 'No package.json found in app directory' };
  }

  if (!jsonMode) console.log('[INFO] node_modules not found, running npm install...');
  const result = runCommand('npm install', appPath, 120000);
  if (!result.success) {
    if (!jsonMode) {
      console.log('[WARN] npm install failed:');
      console.log(result.output.slice(0, 500));
    }
    return { installed: false, error: 'npm install failed' };
  }

  if (!jsonMode) console.log('[PASS] npm install completed');
  return { installed: true };
}

function hasScript(appPath: string, scriptName: string): boolean {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(appPath, 'package.json'), 'utf-8'));
    return !!(pkg.scripts && pkg.scripts[scriptName]);
  } catch {
    return false;
  }
}

function hasLintConfig(appPath: string): boolean {
  const configs = [
    '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', '.eslintrc.yml',
    'eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', 'eslint.config.ts',
  ];
  return configs.some(c => fs.existsSync(path.join(appPath, c)));
}

function hasTestConfig(appPath: string): boolean {
  const configs = [
    'vitest.config.ts', 'vitest.config.js', 'vitest.config.mts',
    'jest.config.ts', 'jest.config.js', 'jest.config.mjs',
  ];
  return configs.some(c => fs.existsSync(path.join(appPath, c)));
}

function main() {
  const args = process.argv.slice(2);
  const appPathIdx = args.indexOf('--app-path');
  const buildRootIdx = args.indexOf('--build-root');
  const projectNameIdx = args.indexOf('--project-name');
  const skipLint = args.includes('--skip-lint');
  const skipTypecheck = args.includes('--skip-typecheck');
  
  const buildRoot = buildRootIdx !== -1 ? args[buildRootIdx + 1] : null;
  const projectName = projectNameIdx !== -1 ? args[projectNameIdx + 1] : null;
  
  let appPath = appPathIdx !== -1 ? args[appPathIdx + 1] : null;
  
  if (!jsonMode) console.log('\n[AXION] Test\n');
  
  if (buildRoot && projectName) {
    setupTwoRootPaths(buildRoot, projectName);
    appPath = path.join(WORKSPACE_ROOT, 'app');
    if (!jsonMode) console.log(`[INFO] Two-root mode: ${buildRoot}/${projectName}`);
  } else if (appPath) {
    const appParent = path.dirname(appPath);
    WORKSPACE_ROOT = appParent;
    AXION_ROOT = path.join(appParent, 'axion');
    STAGE_MARKERS_PATH = path.join(appParent, 'axion', 'registry', 'stage_markers.json');
    if (!jsonMode) console.log(`[INFO] App-path mode: ${appPath}`);
  }
  
  if (!appPath) {
    appPath = findAppPath();
  }
  
  if (!appPath || !fs.existsSync(appPath)) {
    receipt.ok = false;
    receipt.errors.push('Could not find app directory');
    receipt.errors.push('Use --app-path to specify location, or --build-root and --project-name');
    emitOutput();
    process.exit(1);
  }
  
  receipt.appPath = appPath;
  
  if (dryRun) {
    receipt.ok = true;
    emitOutput();
    return;
  }
  
  if (!jsonMode) {
    console.log(`App path: ${appPath}`);
    console.log('');
  }
  
  const depResult = ensureDependencies(appPath);
  if (!depResult.installed) {
    receipt.ok = false;
    receipt.errors.push(depResult.error || 'Could not install dependencies');
    receipt.errors.push('Ensure package.json is valid and npm is available');
    emitOutput();
    process.exit(1);
  }
  if (!jsonMode) console.log('');
  
  let totalPassed = 0;
  let totalFailed = 0;
  let lintErrors = 0;
  let typecheckErrors = 0;
  let lintSkipped = false;
  let testSkipped = false;
  
  if (!skipTypecheck) {
    if (!hasScript(appPath, 'typecheck')) {
      if (!jsonMode) console.log('[SKIP] No "typecheck" script in package.json');
    } else {
      if (!jsonMode) console.log('[RUN] TypeScript check...');
      const tsResult = runCommand('npm run typecheck', appPath);
      if (!tsResult.success) {
        if (!jsonMode) console.log('[WARN] TypeScript errors found');
        typecheckErrors = (tsResult.output.match(/error TS/g) || []).length || 1;
      } else {
        if (!jsonMode) console.log('[PASS] TypeScript check');
      }
    }
  }
  
  if (!skipLint) {
    if (!hasScript(appPath, 'lint')) {
      if (!jsonMode) console.log('[SKIP] No "lint" script in package.json');
      lintSkipped = true;
    } else if (!hasLintConfig(appPath)) {
      if (!jsonMode) console.log('[SKIP] Lint: no ESLint config found (skipping, not counted as failure)');
      lintSkipped = true;
    } else {
      if (!jsonMode) console.log('[RUN] Lint check...');
      const lintResult = runCommand('npm run lint', appPath);
      if (!lintResult.success) {
        if (lintResult.output.includes("couldn't find") || lintResult.output.includes('no eslint.config')) {
          if (!jsonMode) console.log('[SKIP] Lint: ESLint could not find config (skipping, not counted as failure)');
          lintSkipped = true;
        } else {
          if (!jsonMode) console.log('[WARN] Lint errors found');
          const ruleErrors = lintResult.output.match(/^\s*\d+:\d+\s+error\s/gm);
          lintErrors = ruleErrors ? ruleErrors.length : 1;
        }
      } else {
        if (!jsonMode) console.log('[PASS] Lint check');
      }
    }
  }
  
  if (!hasScript(appPath, 'test')) {
    if (!jsonMode) console.log('[SKIP] No "test" script in package.json');
    testSkipped = true;
  } else if (!hasTestConfig(appPath)) {
    if (!jsonMode) console.log('[SKIP] Unit tests: no test config found (skipping, not counted as failure)');
    testSkipped = true;
  } else {
    if (!jsonMode) console.log('[RUN] Unit tests...');
    const testResult = runCommand('npm test', appPath);
    if (testResult.output.includes('No test files found')) {
      if (!jsonMode) console.log('[SKIP] No test files found (not counted as failure)');
      testSkipped = true;
    } else if (testResult.success) {
      if (!jsonMode) console.log('[PASS] Unit tests');
      const passMatch = testResult.output.match(/(\d+) pass/i);
      if (passMatch) totalPassed = parseInt(passMatch[1], 10);
    } else {
      if (!jsonMode) console.log('[WARN] Some tests failed');
      const passMatch = testResult.output.match(/(\d+) pass/i);
      const failMatch = testResult.output.match(/(\d+) fail/i);
      if (passMatch) totalPassed = parseInt(passMatch[1], 10);
      if (failMatch) totalFailed = parseInt(failMatch[1], 10);
    }
  }
  
  if (!jsonMode) console.log('');
  
  const markers = loadStageMarkers();
  markers['global'] = markers['global'] || {};
  
  const overallSuccess = totalFailed === 0 && lintErrors === 0 && typecheckErrors === 0;
  
  markers['global']['test'] = {
    completed_at: new Date().toISOString(),
    status: overallSuccess ? 'success' : 'failed',
  };
  saveStageMarkers(markers);
  
  const testReport = {
    generated_at: new Date().toISOString(),
    status: overallSuccess ? 'PASS' : 'FAIL',
    tests_passed: totalPassed,
    tests_failed: totalFailed,
    lint_errors: lintErrors,
    typecheck_errors: typecheckErrors,
    duration_ms: Date.now() - startTime
  };
  const reportDir = path.join(WORKSPACE_ROOT, 'registry');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(path.join(reportDir, 'test_report.json'), JSON.stringify(testReport, null, 2));
  
  receipt.ok = overallSuccess;
  receipt.testsPassed = totalPassed;
  receipt.testsFailed = totalFailed;
  receipt.lintErrors = lintErrors;
  receipt.typecheckErrors = typecheckErrors;
  receipt.lintSkipped = lintSkipped;
  receipt.testSkipped = testSkipped;
  
  if (!overallSuccess) {
    if (totalFailed > 0) receipt.warnings.push(`${totalFailed} test(s) failed`);
    if (lintErrors > 0) receipt.warnings.push(`${lintErrors} lint error(s)`);
    if (typecheckErrors > 0) receipt.warnings.push(`${typecheckErrors} TypeScript error(s)`);
  }
  
  emitOutput();
  
  if (!overallSuccess) {
    process.exit(1);
  }
}

try {
  main();
} catch (err: any) {
  receipt.ok = false;
  receipt.errors.push(err?.message || String(err));
  emitOutput();
  process.exit(1);
}
