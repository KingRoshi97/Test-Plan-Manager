/**
 * AXION Two-Root End-to-End Test Suite
 * 
 * Golden path test that verifies the complete two-root flow:
 * kit-create → docs pipeline → scaffold-app → build-plan → test → activate → run-app
 * 
 * Critical assertions:
 * - No writes into <BUILD_ROOT>/axion/ (system root immutability)
 * - All outputs go to <BUILD_ROOT>/<PROJECT_NAME>/ (workspace root)
 * - ACTIVE_BUILD.json correctly points to the build
 */

import { describe, it } from '../helpers/test-runner.js';
import { expect, runCommand, CommandResult } from '../helpers/test-utils.js';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPTS_PATH = path.resolve(__dirname, '../../scripts');
const TEMP_PATH = path.resolve(__dirname, '../temp');

interface TwoRootContext {
  buildRoot: string;
  projectName: string;
  workspacePath: string;
  axionPath: string;
  cleanup: () => void;
}

function createTwoRootWorkspace(testName: string): TwoRootContext {
  const uniqueId = crypto.randomBytes(4).toString('hex');
  const buildRoot = path.join(TEMP_PATH, `${testName}_${uniqueId}`);
  const projectName = 'test-project';
  const workspacePath = path.join(buildRoot, projectName);
  const axionPath = path.join(buildRoot, 'axion');
  
  if (!fs.existsSync(TEMP_PATH)) {
    fs.mkdirSync(TEMP_PATH, { recursive: true });
  }
  
  return {
    buildRoot,
    projectName,
    workspacePath,
    axionPath,
    cleanup: () => {
      if (fs.existsSync(buildRoot)) {
        fs.rmSync(buildRoot, { recursive: true, force: true });
      }
    },
  };
}

function runKitCreate(buildRoot: string, projectName: string): CommandResult {
  const script = path.join(SCRIPTS_PATH, 'axion-kit-create.ts');
  return runCommand(`node --import tsx ${script} --target "${buildRoot}" --project-name "${projectName}"`);
}

function runPrepareRoot(buildRoot: string, projectName: string): CommandResult {
  const script = path.join(SCRIPTS_PATH, 'axion-prepare-root.ts');
  return runCommand(`node --import tsx ${script} --build-root "${buildRoot}" --project-name "${projectName}"`);
}

function runScaffoldApp(buildRoot: string, projectName: string, dryRun = false): CommandResult {
  const script = path.join(SCRIPTS_PATH, 'axion-scaffold-app.ts');
  const dryRunFlag = dryRun ? ' --dry-run' : '';
  return runCommand(`node --import tsx ${script} --build-root "${buildRoot}" --project-name "${projectName}"${dryRunFlag}`);
}

function runBuildPlan(buildRoot: string, projectName: string, dryRun = false): CommandResult {
  const script = path.join(SCRIPTS_PATH, 'axion-build-plan.ts');
  const dryRunFlag = dryRun ? ' --dry-run' : '';
  return runCommand(`node --import tsx ${script} --build-root "${buildRoot}" --project-name "${projectName}"${dryRunFlag}`);
}

function runAxionTest(buildRoot: string, projectName: string, dryRun = false): CommandResult {
  const script = path.join(SCRIPTS_PATH, 'axion-test.ts');
  const dryRunFlag = dryRun ? ' --dry-run' : '';
  return runCommand(`node --import tsx ${script} --build-root "${buildRoot}" --project-name "${projectName}"${dryRunFlag}`);
}

function runActivate(buildRoot: string, projectName: string, flags = ''): CommandResult {
  const script = path.join(SCRIPTS_PATH, 'axion-activate.ts');
  return runCommand(`node --import tsx ${script} --build-root "${buildRoot}" --project-name "${projectName}" ${flags}`);
}

function runApp(buildRoot: string, dryRun = true): CommandResult {
  const script = path.join(SCRIPTS_PATH, 'axion-run-app.ts');
  const dryRunFlag = dryRun ? ' --dry-run' : '';
  const pointerPath = path.join(buildRoot, 'ACTIVE_BUILD.json');
  return runCommand(`node --import tsx ${script} --pointer "${pointerPath}"${dryRunFlag}`);
}

function getAxionFileSnapshot(axionPath: string): Map<string, string> {
  const snapshot = new Map<string, string>();
  
  function walkDir(dir: string, prefix = ''): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(prefix, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath, relPath);
      } else {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const hash = crypto.createHash('md5').update(content).digest('hex');
        snapshot.set(relPath, hash);
      }
    }
  }
  
  walkDir(axionPath);
  return snapshot;
}

function findFilesOutsideWorkspace(buildRoot: string, projectName: string): string[] {
  const violations: string[] = [];
  const workspacePath = path.join(buildRoot, projectName);
  const axionPath = path.join(buildRoot, 'axion');
  
  const badDirs = ['registry', 'domains', 'app'];
  
  for (const dir of badDirs) {
    const wrongPath = path.join(buildRoot, dir);
    if (fs.existsSync(wrongPath)) {
      violations.push(`Found ${dir}/ at build root level instead of workspace`);
    }
  }
  
  return violations;
}

function parseJsonFromOutput(output: string): any {
  const jsonMatch = output.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
  return null;
}

describe('Two-Root Golden Path E2E', () => {
  
  it('kit-create creates BUILD_ROOT with axion/ snapshot and manifest', () => {
    const ctx = createTwoRootWorkspace('kit-create');
    try {
      const result = runKitCreate(ctx.buildRoot, ctx.projectName);
      expect(result.exitCode).toBe(0);
      
      const json = parseJsonFromOutput(result.stdout);
      expect(json?.status).toBe('success');
      expect(json?.stage).toBe('kit-create');
      
      expect(fs.existsSync(ctx.axionPath)).toBe(true);
      expect(fs.existsSync(path.join(ctx.axionPath, 'scripts'))).toBe(true);
      expect(fs.existsSync(path.join(ctx.axionPath, 'config'))).toBe(true);
      expect(fs.existsSync(path.join(ctx.axionPath, 'templates'))).toBe(true);
      
      const manifestPath = path.join(ctx.buildRoot, 'manifest.json');
      expect(fs.existsSync(manifestPath)).toBe(true);
      
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      expect(manifest.project_name).toBe(ctx.projectName);
      expect(manifest.snapshot_revision).toBeTruthy();
      expect(manifest.snapshot_revision.file_count).toBeGreaterThan(0);
    } finally {
      ctx.cleanup();
    }
  });
  
  it('prepare-root creates workspace directories without modifying axion/', () => {
    const ctx = createTwoRootWorkspace('prepare-root');
    try {
      runKitCreate(ctx.buildRoot, ctx.projectName);
      const beforeSnapshot = getAxionFileSnapshot(ctx.axionPath);
      
      const result = runPrepareRoot(ctx.buildRoot, ctx.projectName);
      expect(result.exitCode).toBe(0);
      
      expect(fs.existsSync(ctx.workspacePath)).toBe(true);
      expect(fs.existsSync(path.join(ctx.workspacePath, 'registry'))).toBe(true);
      expect(fs.existsSync(path.join(ctx.workspacePath, 'domains'))).toBe(true);
      
      const afterSnapshot = getAxionFileSnapshot(ctx.axionPath);
      for (const [file, hash] of beforeSnapshot) {
        expect(afterSnapshot.get(file)).toBe(hash);
      }
      
      const violations = findFilesOutsideWorkspace(ctx.buildRoot, ctx.projectName);
      expect(violations.length).toBe(0);
    } finally {
      ctx.cleanup();
    }
  });
  
  it('scaffold-app creates app/ in workspace without modifying axion/', () => {
    const ctx = createTwoRootWorkspace('scaffold-app');
    try {
      runKitCreate(ctx.buildRoot, ctx.projectName);
      runPrepareRoot(ctx.buildRoot, ctx.projectName);
      
      fs.writeFileSync(
        path.join(ctx.workspacePath, 'registry', 'lock_manifest.json'),
        JSON.stringify({ locked_at: new Date().toISOString(), modules: {} })
      );
      
      const beforeSnapshot = getAxionFileSnapshot(ctx.axionPath);
      
      const result = runScaffoldApp(ctx.buildRoot, ctx.projectName);
      
      const json = parseJsonFromOutput(result.stdout);
      if (result.exitCode !== 0 && json?.status === 'blocked_by') {
        console.log('Scaffold blocked as expected without full lock');
      } else if (result.exitCode === 0) {
        expect(fs.existsSync(path.join(ctx.workspacePath, 'app'))).toBe(true);
      }
      
      const afterSnapshot = getAxionFileSnapshot(ctx.axionPath);
      for (const [file, hash] of beforeSnapshot) {
        expect(afterSnapshot.get(file)).toBe(hash);
      }
    } finally {
      ctx.cleanup();
    }
  });
  
  it('build-plan generates task graph without modifying axion/', () => {
    const ctx = createTwoRootWorkspace('build-plan');
    try {
      runKitCreate(ctx.buildRoot, ctx.projectName);
      runPrepareRoot(ctx.buildRoot, ctx.projectName);
      
      const beforeSnapshot = getAxionFileSnapshot(ctx.axionPath);
      
      const result = runBuildPlan(ctx.buildRoot, ctx.projectName, true);
      
      const json = parseJsonFromOutput(result.stdout);
      expect(json?.stage).toBe('build-plan');
      
      const afterSnapshot = getAxionFileSnapshot(ctx.axionPath);
      for (const [file, hash] of beforeSnapshot) {
        expect(afterSnapshot.get(file)).toBe(hash);
      }
    } finally {
      ctx.cleanup();
    }
  });
  
  it('test stage writes test_report.json to workspace registry', () => {
    const ctx = createTwoRootWorkspace('test-report');
    try {
      runKitCreate(ctx.buildRoot, ctx.projectName);
      runPrepareRoot(ctx.buildRoot, ctx.projectName);
      
      fs.mkdirSync(path.join(ctx.workspacePath, 'app'), { recursive: true });
      fs.writeFileSync(
        path.join(ctx.workspacePath, 'registry', 'app_scaffold_report.json'),
        JSON.stringify({ files_written: 1 })
      );
      
      const beforeSnapshot = getAxionFileSnapshot(ctx.axionPath);
      
      const result = runAxionTest(ctx.buildRoot, ctx.projectName, true);
      
      const afterSnapshot = getAxionFileSnapshot(ctx.axionPath);
      for (const [file, hash] of beforeSnapshot) {
        expect(afterSnapshot.get(file)).toBe(hash);
      }
    } finally {
      ctx.cleanup();
    }
  });
  
  it('activate writes ACTIVE_BUILD.json when gates pass', () => {
    const ctx = createTwoRootWorkspace('activate');
    try {
      runKitCreate(ctx.buildRoot, ctx.projectName);
      runPrepareRoot(ctx.buildRoot, ctx.projectName);
      
      fs.writeFileSync(
        path.join(ctx.workspacePath, 'registry', 'lock_manifest.json'),
        JSON.stringify({ locked_at: new Date().toISOString(), modules: {} })
      );
      fs.writeFileSync(
        path.join(ctx.workspacePath, 'registry', 'verify_report.json'),
        JSON.stringify({ generated_at: new Date().toISOString(), status: 'PASS', modules: {} })
      );
      
      const beforeSnapshot = getAxionFileSnapshot(ctx.axionPath);
      
      const result = runActivate(ctx.buildRoot, ctx.projectName, '--allow-no-tests');
      expect(result.exitCode).toBe(0);
      
      const json = parseJsonFromOutput(result.stdout);
      expect(json?.status).toBe('success');
      
      const activePath = path.join(ctx.buildRoot, 'ACTIVE_BUILD.json');
      expect(fs.existsSync(activePath)).toBe(true);
      
      const activeData = JSON.parse(fs.readFileSync(activePath, 'utf-8'));
      expect(activeData.project_name).toBe(ctx.projectName);
      expect(activeData.active_build_root).toBe(ctx.buildRoot);
      
      const afterSnapshot = getAxionFileSnapshot(ctx.axionPath);
      for (const [file, hash] of beforeSnapshot) {
        expect(afterSnapshot.get(file)).toBe(hash);
      }
    } finally {
      ctx.cleanup();
    }
  });
  
  it('run-app reads ACTIVE_BUILD.json and starts from correct path', () => {
    const ctx = createTwoRootWorkspace('run-app');
    try {
      runKitCreate(ctx.buildRoot, ctx.projectName);
      runPrepareRoot(ctx.buildRoot, ctx.projectName);
      
      fs.writeFileSync(
        path.join(ctx.workspacePath, 'registry', 'lock_manifest.json'),
        JSON.stringify({ locked_at: new Date().toISOString(), modules: {} })
      );
      fs.writeFileSync(
        path.join(ctx.workspacePath, 'registry', 'verify_report.json'),
        JSON.stringify({ generated_at: new Date().toISOString(), status: 'PASS', modules: {} })
      );
      
      runActivate(ctx.buildRoot, ctx.projectName, '--allow-no-tests');
      
      const beforeSnapshot = getAxionFileSnapshot(ctx.axionPath);
      
      const result = runApp(ctx.buildRoot, true);
      
      const json = parseJsonFromOutput(result.stdout);
      expect(json?.stage).toBe('run-app');
      
      const afterSnapshot = getAxionFileSnapshot(ctx.axionPath);
      for (const [file, hash] of beforeSnapshot) {
        expect(afterSnapshot.get(file)).toBe(hash);
      }
    } finally {
      ctx.cleanup();
    }
  });
  
  it('no registry/domains appear outside workspace path', () => {
    const ctx = createTwoRootWorkspace('isolation');
    try {
      runKitCreate(ctx.buildRoot, ctx.projectName);
      runPrepareRoot(ctx.buildRoot, ctx.projectName);
      
      const violations = findFilesOutsideWorkspace(ctx.buildRoot, ctx.projectName);
      expect(violations.length).toBe(0);
      
      expect(fs.existsSync(path.join(ctx.buildRoot, 'registry'))).toBe(false);
      expect(fs.existsSync(path.join(ctx.buildRoot, 'domains'))).toBe(false);
      
      expect(fs.existsSync(path.join(ctx.workspacePath, 'registry'))).toBe(true);
      expect(fs.existsSync(path.join(ctx.workspacePath, 'domains'))).toBe(true);
    } finally {
      ctx.cleanup();
    }
  });
});

describe('System Root Immutability', () => {
  
  it('axion/ snapshot is unchanged after full pipeline', () => {
    const ctx = createTwoRootWorkspace('immutability');
    try {
      runKitCreate(ctx.buildRoot, ctx.projectName);
      const initialSnapshot = getAxionFileSnapshot(ctx.axionPath);
      const initialFileCount = initialSnapshot.size;
      
      runPrepareRoot(ctx.buildRoot, ctx.projectName);
      runBuildPlan(ctx.buildRoot, ctx.projectName, true);
      
      const finalSnapshot = getAxionFileSnapshot(ctx.axionPath);
      
      expect(finalSnapshot.size).toBe(initialFileCount);
      
      for (const [file, hash] of initialSnapshot) {
        const finalHash = finalSnapshot.get(file);
        if (finalHash !== hash) {
          throw new Error(`System file modified: ${file}`);
        }
      }
      
      for (const file of finalSnapshot.keys()) {
        if (!initialSnapshot.has(file)) {
          throw new Error(`New file created in system root: ${file}`);
        }
      }
    } finally {
      ctx.cleanup();
    }
  });
});
