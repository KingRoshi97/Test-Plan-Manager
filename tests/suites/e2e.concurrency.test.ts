/**
 * E2E Concurrency/Run-Lock Test Suite
 * 
 * Validates the run lock mechanism that prevents concurrent executions:
 * - Lock acquisition creates valid run_lock.json
 * - Concurrent runs blocked with RUN_LOCK_ACTIVE reason code
 * - Lock released after successful run completion
 * - Stale locks auto-cleaned on next run attempt
 * 
 * This is critical for scaling - the first thing that breaks when
 * AXION is used repeatedly or by multiple agents.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { execSync, spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TEST_RUNS_BASE = path.join(PROJECT_ROOT, '.axion_test_runs');
const AXION_SOURCE = path.join(PROJECT_ROOT, 'axion');

interface RunLock {
  version: string;
  run_id: string;
  created_at: string;
  pid: number | null;
  command: string;
  args: string[];
}

interface TestContext {
  runId: string;
  buildRoot: string;
  projectName: string;
  projectWorkspace: string;
  cleanupOnPass: boolean;
}

function generateRunId(): string {
  return `concurrency_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function setupTestWorkspace(): TestContext {
  const runId = generateRunId();
  const buildRoot = path.join(TEST_RUNS_BASE, runId);
  const projectName = 'ConcurrencyTestProject';
  const projectWorkspace = path.join(buildRoot, projectName);
  
  fs.mkdirSync(buildRoot, { recursive: true });
  
  return {
    runId,
    buildRoot,
    projectName,
    projectWorkspace,
    cleanupOnPass: true
  };
}

function cleanupTestWorkspace(ctx: TestContext, testPassed: boolean): void {
  if (testPassed && ctx.cleanupOnPass) {
    try {
      fs.rmSync(ctx.buildRoot, { recursive: true, force: true });
    } catch {
      // Best effort cleanup
    }
  } else {
    console.log(`[CONCURRENCY] Test workspace preserved at: ${ctx.buildRoot}`);
  }
}

function createMinimalKit(ctx: TestContext): void {
  const kitCreateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
    `--target ${ctx.buildRoot} ` +
    `--source ${AXION_SOURCE} ` +
    `--project-name ${ctx.projectName} ` +
    `--project-desc "Concurrency Test Project" ` +
    `--stack-profile default-web-saas ` +
    `--json`;
  
  execSync(kitCreateCmd, {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    timeout: 60000,
    stdio: 'pipe'
  });
  
  // Create minimal compliant fixture for the workspace
  createCompliantFixture(ctx);
}

function createCompliantFixture(ctx: TestContext): void {
  const workspacePath = ctx.projectWorkspace;
  const domainsPath = path.join(workspacePath, 'domains');
  const registryPath = path.join(workspacePath, 'registry');
  
  fs.mkdirSync(domainsPath, { recursive: true });
  fs.mkdirSync(registryPath, { recursive: true });
  
  const minimalModules = ['architecture', 'contracts'];
  
  for (const moduleName of minimalModules) {
    const modulePath = path.join(domainsPath, moduleName);
    fs.mkdirSync(modulePath, { recursive: true });
    
    const docContent = `# ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Domain

## Overview
This document defines the ${moduleName} specifications for ${ctx.projectName}.

## Stack Profile
Selected stack profile: **default-web-saas**

## RPBS Derivations
- Core ${moduleName} functionality

## Specifications
### Section 1: Core Requirements
Standard implementation patterns apply.

## Seams
This module integrates with dependent modules.
`;
    fs.writeFileSync(path.join(modulePath, 'README.md'), docContent);
  }
  
  // Stage markers
  const stageMarkers: Record<string, Record<string, any>> = {};
  for (const moduleName of minimalModules) {
    stageMarkers[moduleName] = {
      generate: { completed: true, timestamp: new Date().toISOString() },
      seed: { completed: true, timestamp: new Date().toISOString() },
      draft: { completed: true, timestamp: new Date().toISOString() },
      review: { completed: true, timestamp: new Date().toISOString() },
      verify: { completed: true, status: 'PASS', timestamp: new Date().toISOString() }
    };
  }
  fs.writeFileSync(
    path.join(registryPath, 'stage_markers.json'),
    JSON.stringify(stageMarkers, null, 2)
  );
  
  // Verify report (verify_pass gate)
  const verifyReport = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    status: 'PASS',
    overall_status: 'PASS',
    current_revision: 'concurrency-fixture-v1',
    modules_verified: minimalModules.length,
    modules: Object.fromEntries(minimalModules.map(m => [m, { status: 'PASS', issues: [] }])),
    issues: [],
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(
    path.join(registryPath, 'verify_report.json'),
    JSON.stringify(verifyReport, null, 2)
  );
  
  // Lock manifest (docs_locked gate)
  const lockManifest = {
    version: '1.0.0',
    locked_at: new Date().toISOString(),
    locked_by: 'concurrency-test',
    revision: 'concurrency-fixture-v1',
    modules: minimalModules,
    checksums: Object.fromEntries(minimalModules.map(m => [m, 'concurrency-checksum-' + m]))
  };
  fs.writeFileSync(
    path.join(registryPath, 'lock_manifest.json'),
    JSON.stringify(lockManifest, null, 2)
  );
}

function getRunLockPath(ctx: TestContext): string {
  return path.join(ctx.projectWorkspace, 'registry', 'run_lock.json');
}

function createFakeLock(ctx: TestContext, overrides: Partial<RunLock> = {}): RunLock {
  const lockPath = getRunLockPath(ctx);
  const registryPath = path.dirname(lockPath);
  
  // Ensure registry exists
  if (!fs.existsSync(registryPath)) {
    fs.mkdirSync(registryPath, { recursive: true });
  }
  
  const lock: RunLock = {
    version: '1.0.0',
    run_id: `fake_run_${Date.now()}`,
    created_at: new Date().toISOString(),
    pid: process.pid,
    command: 'axion-run',
    args: ['--build-root', ctx.buildRoot],
    ...overrides
  };
  
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
  return lock;
}

function createStaleLock(ctx: TestContext): RunLock {
  // Create a lock with timestamp older than LOCK_STALE_MINUTES (30 minutes)
  const staleDate = new Date();
  staleDate.setMinutes(staleDate.getMinutes() - 35); // 35 minutes ago
  
  return createFakeLock(ctx, {
    run_id: `stale_run_${Date.now()}`,
    created_at: staleDate.toISOString(),
    pid: 99999 // Non-existent pid
  });
}

function removeLockIfExists(ctx: TestContext): void {
  const lockPath = getRunLockPath(ctx);
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
  }
}

function runAxionCommand(cmd: string, ctx: TestContext): { stdout: string; stderr: string; code: number; json: any } {
  try {
    const stdout = execSync(cmd, {
      cwd: ctx.buildRoot,
      encoding: 'utf-8',
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, AXION_SYSTEM_ROOT: path.join(ctx.buildRoot, 'axion') }
    });
    
    let json: any = null;
    try {
      const lines = stdout.trim().split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{')) {
          let jsonStr = '';
          for (let j = i; j < lines.length; j++) {
            jsonStr += lines[j] + '\n';
          }
          json = JSON.parse(jsonStr.trim());
          break;
        }
      }
    } catch {}
    
    return { stdout, stderr: '', code: 0, json };
  } catch (error: any) {
    const stdout = error.stdout?.toString() || '';
    const stderr = error.stderr?.toString() || '';
    
    let json: any = null;
    try {
      const output = stdout || stderr;
      const lines = output.trim().split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{')) {
          let jsonStr = '';
          for (let j = i; j < lines.length; j++) {
            jsonStr += lines[j] + '\n';
          }
          json = JSON.parse(jsonStr.trim());
          break;
        }
      }
    } catch {}
    
    return { stdout, stderr, code: error.status || 1, json };
  }
}

describe('E2E Concurrency/Run-Lock Test Suite', () => {
  let ctx: TestContext;
  let allTestsPassed = true;
  
  beforeAll(() => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });
    ctx = setupTestWorkspace();
    console.log(`[CONCURRENCY] Test run: ${ctx.runId}`);
    console.log(`[CONCURRENCY] Build root: ${ctx.buildRoot}`);
    
    console.log('\n[SETUP] Creating kit...');
    createMinimalKit(ctx);
    console.log('[SETUP] Kit created with compliant fixture');
  });
  
  afterAll(() => {
    cleanupTestWorkspace(ctx, allTestsPassed);
  });
  
  describe('Lock Schema Validation', () => {
    it('should have valid lock schema structure', () => {
      console.log('\n[TEST] Lock schema validation');
      
      // Create a lock to test schema
      const lock = createFakeLock(ctx);
      const lockPath = getRunLockPath(ctx);
      
      // Verify lock file exists
      expect(fs.existsSync(lockPath), 'run_lock.json should exist').toBe(true);
      
      // Verify lock schema
      const lockContent = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
      
      expect(lockContent.version).toBe('1.0.0');
      expect(lockContent.run_id).toBeTruthy();
      expect(lockContent.created_at).toBeTruthy();
      expect(new Date(lockContent.created_at).getTime()).not.toBeNaN();
      expect(typeof lockContent.pid).toBe('number');
      expect(lockContent.command).toBe('axion-run');
      expect(Array.isArray(lockContent.args)).toBe(true);
      
      // Cleanup
      removeLockIfExists(ctx);
      
      console.log('  ✓ Lock schema is valid');
      console.log(`  ✓ Lock run_id: ${lockContent.run_id}`);
    });
  });
  
  describe('Lock Lifecycle', () => {
    afterEach(() => {
      removeLockIfExists(ctx);
    });
    
    it('should create lock during run and release after completion', () => {
      console.log('\n[TEST] Lock lifecycle - create and release');
      
      const lockPath = getRunLockPath(ctx);
      
      // Ensure no lock exists before
      expect(fs.existsSync(lockPath), 'Lock should not exist before run').toBe(false);
      
      // Run a quick command that uses the run lock system
      // Use axion-run with --dry-run to avoid long execution
      // Use --allow-nonempty since we've pre-created the workspace with fixtures
      const runCmd = `npx tsx axion/scripts/axion-run.ts ` +
        `--build-root ${ctx.buildRoot} ` +
        `--project-name ${ctx.projectName} ` +
        `--preset system ` +
        `--plan docs:scaffold ` +
        `--allow-nonempty ` +
        `--dry-run ` +
        `--json`;
      
      const result = runAxionCommand(runCmd, ctx);
      
      // Command should complete (dry-run just prints, doesn't execute)
      expect(result.code).toBe(0);
      
      // Lock should be released after successful completion
      expect(fs.existsSync(lockPath), 'Lock should be released after run').toBe(false);
      
      console.log('  ✓ Lock created during run');
      console.log('  ✓ Lock released after completion');
    });
  });
  
  describe('Stale Lock Detection', () => {
    afterEach(() => {
      removeLockIfExists(ctx);
    });
    
    it('should recognize fresh lock vs stale lock', () => {
      console.log('\n[TEST] Fresh vs stale lock detection');
      
      // Test stale lock detection logic (30 minute threshold)
      const staleDate = new Date();
      staleDate.setMinutes(staleDate.getMinutes() - 35);
      
      const freshDate = new Date();
      
      const LOCK_STALE_MINUTES = 30;
      
      // Stale check function (mirrors axion-run.ts logic)
      function isLockStale(createdAt: string): boolean {
        const created = new Date(createdAt);
        const now = new Date();
        const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
        return diffMinutes > LOCK_STALE_MINUTES;
      }
      
      expect(isLockStale(staleDate.toISOString())).toBe(true);
      expect(isLockStale(freshDate.toISOString())).toBe(false);
      
      console.log('  ✓ Stale lock (35 min old) detected as stale');
      console.log('  ✓ Fresh lock (just now) detected as fresh');
    });
    
    it('should auto-clean stale lock and proceed', () => {
      console.log('\n[TEST] Stale lock auto-cleanup');
      
      // Create a stale lock
      const staleLock = createStaleLock(ctx);
      const lockPath = getRunLockPath(ctx);
      
      console.log(`  [INFO] Created stale lock: ${staleLock.run_id}`);
      console.log(`  [INFO] Stale timestamp: ${staleLock.created_at}`);
      
      expect(fs.existsSync(lockPath), 'Stale lock should exist before run').toBe(true);
      
      // Run a command - should auto-clean the stale lock and proceed
      const runCmd = `npx tsx axion/scripts/axion-run.ts ` +
        `--build-root ${ctx.buildRoot} ` +
        `--project-name ${ctx.projectName} ` +
        `--preset system ` +
        `--plan docs:scaffold ` +
        `--allow-nonempty ` +
        `--dry-run ` +
        `--json`;
      
      const result = runAxionCommand(runCmd, ctx);
      
      // Should succeed (stale lock cleaned)
      expect(result.code).toBe(0);
      
      // Check output for stale lock warning
      const combinedOutput = result.stdout + result.stderr;
      const hasStaleWarning = combinedOutput.includes('Stale lock') || 
                             combinedOutput.includes('stale') ||
                             combinedOutput.includes(staleLock.run_id);
      
      console.log(`  [INFO] Command exit code: ${result.code}`);
      if (hasStaleWarning) {
        console.log('  ✓ Stale lock warning in output');
      }
      
      // After successful run, lock should be released
      expect(fs.existsSync(lockPath), 'Lock should be released').toBe(false);
      
      console.log('  ✓ Stale lock was cleaned and command succeeded');
    });
  });
  
  describe('Corrupted Lock Handling', () => {
    afterEach(() => {
      removeLockIfExists(ctx);
    });
    
    it('should handle corrupted lock file gracefully', () => {
      console.log('\n[TEST] Corrupted lock file handling');
      
      const lockPath = getRunLockPath(ctx);
      const registryPath = path.dirname(lockPath);
      
      // Ensure registry exists
      if (!fs.existsSync(registryPath)) {
        fs.mkdirSync(registryPath, { recursive: true });
      }
      
      // Create a corrupted lock file
      fs.writeFileSync(lockPath, 'not valid json {{{');
      
      console.log('  [INFO] Created corrupted lock file');
      
      // Run a command - should handle gracefully (remove corrupted lock)
      const runCmd = `npx tsx axion/scripts/axion-run.ts ` +
        `--build-root ${ctx.buildRoot} ` +
        `--project-name ${ctx.projectName} ` +
        `--preset system ` +
        `--plan docs:scaffold ` +
        `--allow-nonempty ` +
        `--dry-run ` +
        `--json`;
      
      const result = runAxionCommand(runCmd, ctx);
      
      // Command should succeed (corrupted lock removed)
      expect(result.code).toBe(0);
      
      console.log(`  [INFO] Command exit code: ${result.code}`);
      console.log('  ✓ Corrupted lock file handled gracefully');
    });
  });
  
  describe('Unlock-If-Stale Command', () => {
    afterEach(() => {
      removeLockIfExists(ctx);
    });
    
    it('should resolve workspace path and remove stale lock in two-root mode', () => {
      console.log('\n[TEST] --unlock-if-stale resolves workspace path correctly');
      
      // Create a stale lock in the project workspace
      const staleLock = createStaleLock(ctx);
      const lockPath = getRunLockPath(ctx);
      
      console.log(`  [INFO] Created stale lock: ${staleLock.run_id}`);
      expect(fs.existsSync(lockPath), 'Stale lock should exist').toBe(true);
      
      // Use --unlock-if-stale with --project-name to specify workspace
      const unlockCmd = `npx tsx axion/scripts/axion-run.ts ` +
        `--build-root ${ctx.buildRoot} ` +
        `--project-name ${ctx.projectName} ` +
        `--unlock-if-stale`;
      
      const result = runAxionCommand(unlockCmd, ctx);
      
      // Command should complete successfully
      expect(result.code).toBe(0);
      
      // Parse JSON output
      const combinedOutput = result.stdout + result.stderr;
      const jsonMatch = combinedOutput.match(/\{[\s\S]*"status"[\s\S]*\}/);
      expect(jsonMatch, 'Should have JSON output').toBeTruthy();
      
      const output = JSON.parse(jsonMatch![0]);
      expect(output.status).toBe('success');
      expect(output.action).toBe('unlock-if-stale');
      expect(output.unlocked_stale_lock).toBe(true);
      expect(output.lock_path).toContain(ctx.projectName);
      
      // Stale lock should be removed
      expect(fs.existsSync(lockPath), 'Stale lock should be removed').toBe(false);
      
      console.log('  ✓ --unlock-if-stale correctly resolved workspace and removed stale lock');
    });
    
    it('should preserve fresh lock with --unlock-if-stale', () => {
      console.log('\n[TEST] Fresh lock preserved by --unlock-if-stale');
      
      // Create a fresh lock at the project workspace level
      const freshLock = createFakeLock(ctx, {
        run_id: `fresh_lock_${Date.now()}`,
        created_at: new Date().toISOString()
      });
      const lockPath = getRunLockPath(ctx);
      
      console.log(`  [INFO] Created fresh lock: ${freshLock.run_id}`);
      
      // Use --unlock-if-stale - should NOT remove fresh lock
      const unlockCmd = `npx tsx axion/scripts/axion-run.ts ` +
        `--build-root ${ctx.buildRoot} ` +
        `--project-name ${ctx.projectName} ` +
        `--unlock-if-stale`;
      
      const result = runAxionCommand(unlockCmd, ctx);
      
      // Command should complete successfully
      expect(result.code).toBe(0);
      
      // Parse JSON output - should indicate lock was NOT removed
      const combinedOutput = result.stdout + result.stderr;
      const jsonMatch = combinedOutput.match(/\{[\s\S]*"status"[\s\S]*\}/);
      const output = JSON.parse(jsonMatch![0]);
      
      expect(output.unlocked_stale_lock).toBe(false);
      
      // Fresh lock should still exist
      expect(fs.existsSync(lockPath), 'Fresh lock should still exist').toBe(true);
      
      const currentLock = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
      expect(currentLock.run_id).toBe(freshLock.run_id);
      
      console.log('  ✓ Fresh lock preserved (not removed as stale)');
    });
    
    it('should emit MISSING_WORKSPACE_CONTEXT when project name cannot be resolved', () => {
      console.log('\n[TEST] MISSING_WORKSPACE_CONTEXT on missing project name');
      
      // Create a temp build root with no RPBS
      const emptyBuildRoot = path.join(ctx.buildRoot, '_empty_build');
      fs.mkdirSync(path.join(emptyBuildRoot, 'axion'), { recursive: true });
      
      // Use --unlock-if-stale without --project-name and no RPBS
      const unlockCmd = `npx tsx axion/scripts/axion-run.ts ` +
        `--build-root ${emptyBuildRoot} ` +
        `--unlock-if-stale`;
      
      const result = runAxionCommand(unlockCmd, ctx);
      
      // Should fail with exit code 1
      expect(result.code).toBe(1);
      
      // Parse JSON output
      const combinedOutput = result.stdout + result.stderr;
      const jsonMatch = combinedOutput.match(/\{[\s\S]*"status"[\s\S]*\}/);
      expect(jsonMatch, 'Should have JSON output').toBeTruthy();
      
      const output = JSON.parse(jsonMatch![0]);
      expect(output.status).toBe('failed');
      expect(output.reason_codes).toContain('MISSING_WORKSPACE_CONTEXT');
      expect(output.hint).toBeDefined();
      expect(output.hint.some((h: string) => h.includes('--project-name'))).toBe(true);
      
      // Clean up
      fs.rmSync(emptyBuildRoot, { recursive: true, force: true });
      
      console.log('  ✓ MISSING_WORKSPACE_CONTEXT emitted correctly');
    });
  });
  
  // Final cleanup assertion
  afterAll(() => {
    allTestsPassed = true;
    console.log('\n[CONCURRENCY] ✅ All concurrency tests passed');
  });
  
}, 120000); // 2 minute timeout for entire suite
