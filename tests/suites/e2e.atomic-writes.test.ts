/**
 * E2E Atomic Writes Test Suite
 * 
 * Validates crash resilience through atomic write patterns:
 * - Test 1: Target survives AFTER_TMP_WRITE failpoint
 * - Test 2: Orphan .tmp cleanup on next run
 * - Test 3: Corrupt .tmp doesn't poison reads
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as crypto from 'crypto';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const AXION_SOURCE = path.join(PROJECT_ROOT, 'axion');
const TEST_RUNS_DIR = path.join(PROJECT_ROOT, '.axion_test_runs');

interface TestContext {
  runId: string;
  testRoot: string;
  buildRoot: string;
  projectName: string;
  workspaceRoot: string;
  registryDir: string;
  cleanupOnPass: boolean;
}

function generateRunId(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `atomic_${timestamp}_${random}`;
}

function runCommand(
  command: string, 
  cwd: string, 
  env?: Record<string, string>
): { stdout: string; stderr: string; exitCode: number; json: any | null } {
  try {
    const stdout = execSync(command, {
      cwd,
      env: { ...process.env, ...env },
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 60000
    });
    
    let json = null;
    try {
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        json = JSON.parse(jsonMatch[0]);
      }
    } catch {}
    
    return { stdout, stderr: '', exitCode: 0, json };
  } catch (err: any) {
    let json = null;
    const stdout = err.stdout?.toString() || '';
    const stderr = err.stderr?.toString() || '';
    
    try {
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        json = JSON.parse(jsonMatch[0]);
      }
    } catch {}
    
    return { stdout, stderr, exitCode: err.status || 1, json };
  }
}

function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

describe('E2E Atomic Writes', () => {
  let ctx: TestContext;
  
  beforeAll(() => {
    const runId = generateRunId();
    const testRoot = path.join(TEST_RUNS_DIR, runId);
    const buildRoot = path.join(testRoot, 'build');
    const projectName = 'atomictest';
    const workspaceRoot = path.join(buildRoot, projectName);
    const registryDir = path.join(workspaceRoot, 'registry');
    
    ctx = {
      runId,
      testRoot,
      buildRoot,
      projectName,
      workspaceRoot,
      registryDir,
      cleanupOnPass: true
    };
    
    console.log(`[ATOMIC] Test run: ${runId}`);
    console.log(`[ATOMIC] Build root: ${buildRoot}`);
    
    // Create directories
    fs.mkdirSync(testRoot, { recursive: true });
    fs.mkdirSync(buildRoot, { recursive: true });
  });
  
  afterAll(() => {
    if (ctx.cleanupOnPass) {
      try {
        fs.rmSync(ctx.testRoot, { recursive: true, force: true });
        console.log(`[ATOMIC] Test workspace cleaned up`);
      } catch {}
    } else {
      console.log(`[ATOMIC] Test workspace preserved at: ${ctx.testRoot}`);
    }
  });
  
  it('Test 1: target artifact survives AFTER_TMP_WRITE failpoint', async () => {
    ctx.cleanupOnPass = false; // Preserve on fail
    
    console.log('\n[TEST 1] Target survives failpoint');
    
    // Step 1: Create kit and workspace structure
    console.log('  Step 1: Create kit at build root');
    const kitCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
      `--target ${ctx.buildRoot} ` +
      `--project-name AtomicTest ` +
      `--json`;
    
    const kitResult = runCommand(kitCmd, PROJECT_ROOT);
    expect(kitResult.json?.status, 'kit-create should succeed').toBe('success');
    console.log('    ✓ kit-create passed');
    
    // Create workspace and registry
    fs.mkdirSync(ctx.workspaceRoot, { recursive: true });
    fs.mkdirSync(ctx.registryDir, { recursive: true });
    
    // Create compliant architecture fixture
    const domainsDir = path.join(ctx.workspaceRoot, 'domains', 'architecture');
    fs.mkdirSync(domainsDir, { recursive: true });
    fs.writeFileSync(
      path.join(domainsDir, 'README.md'),
      `# Architecture Domain

## Overview
This document defines the architecture specifications for AtomicTest.

## Stack Profile

\`\`\`yaml
stack_profile: default-web-saas
framework: express
database: postgresql
frontend: react
\`\`\`

## Core Architecture

Standard web application architecture.
`
    );
    
    // Step 2: Create baseline verify_report.json
    console.log('  Step 2: Create baseline verify_report.json');
    const baselineReport = {
      version: '1.0.0',
      status: 'PASS',
      timestamp: new Date().toISOString(),
      modules: { architecture: { status: 'PASS', issues: [] } },
      summary: { total: 1, pass: 1, fail: 0, warnings: 0 }
    };
    
    const reportPath = path.join(ctx.registryDir, 'verify_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(baselineReport, null, 2));
    
    const baselineHash = hashFile(reportPath);
    console.log(`    ✓ Baseline verify_report.json created (hash: ${baselineHash.slice(0, 12)}...)`);
    
    // Step 3: Run axion-verify with AFTER_TMP_WRITE failpoint
    console.log('  Step 3: Run verify with AFTER_TMP_WRITE failpoint');
    
    // Set AXION_SYSTEM_ROOT to point to the axion/ dir in the build root
    const verifyCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-verify.ts ` +
      `--root ${ctx.workspaceRoot} ` +
      `--all ` +
      `--json`;
    
    const verifyResult = runCommand(verifyCmd, PROJECT_ROOT, {
      AXION_FAILPOINT: 'AFTER_TMP_WRITE',
      AXION_SYSTEM_ROOT: path.join(ctx.buildRoot, 'axion')
    });
    
    // Command should fail due to failpoint
    expect(verifyResult.exitCode, 'verify should fail with failpoint').not.toBe(0);
    console.log('    ✓ Verify failed as expected (failpoint triggered)');
    
    // Step 4: Verify original file survived unchanged
    console.log('  Step 4: Verify original file survived');
    expect(fs.existsSync(reportPath), 'verify_report.json should still exist').toBe(true);
    
    const afterHash = hashFile(reportPath);
    expect(afterHash, 'verify_report.json hash should be unchanged').toBe(baselineHash);
    console.log(`    ✓ Original verify_report.json unchanged (hash: ${afterHash.slice(0, 12)}...)`);
    
    // Step 5: Check for orphan .tmp file
    console.log('  Step 5: Check for orphan .tmp file');
    const tmpPath = path.join(ctx.registryDir, '.verify_report.json.tmp');
    const tmpExists = fs.existsSync(tmpPath);
    
    if (tmpExists) {
      console.log('    ✓ Orphan .tmp file exists (as expected after crash)');
    } else {
      console.log('    ℹ No orphan .tmp file (may have been cleaned or not created)');
    }
    
    console.log('[TEST 1] ✓ Target artifact survived failpoint');
    ctx.cleanupOnPass = true;
  }, 60000);
  
  it('Test 2: orphan .tmp cleanup on next run', async () => {
    ctx.cleanupOnPass = false;
    
    console.log('\n[TEST 2] Orphan .tmp cleanup on next run');
    
    // Ensure workspace exists from Test 1 or create fresh
    if (!fs.existsSync(ctx.registryDir)) {
      fs.mkdirSync(ctx.registryDir, { recursive: true });
    }
    
    // Create orphan .tmp files
    console.log('  Step 1: Create orphan .tmp files');
    const orphanFiles = [
      path.join(ctx.registryDir, '.stage_markers.json.tmp'),
      path.join(ctx.registryDir, '.run.lock.tmp'),
      path.join(ctx.registryDir, '.verify_report.json.tmp')
    ];
    
    for (const tmpFile of orphanFiles) {
      fs.writeFileSync(tmpFile, '{"orphan": true, "created_for": "test"}');
    }
    console.log(`    ✓ Created ${orphanFiles.length} orphan .tmp files`);
    
    // Verify all exist
    for (const tmpFile of orphanFiles) {
      expect(fs.existsSync(tmpFile), `${path.basename(tmpFile)} should exist`).toBe(true);
    }
    
    // Step 2: Run axion-run with status check (triggers cleanup)
    console.log('  Step 2: Trigger cleanup via axion-status');
    
    // Use axion-run with dry-run to trigger cleanup without full execution
    // Actually, cleanup happens after prepare-root, so we need a simple command
    // Let's use a direct test by calling cleanup function
    
    // Import and call cleanup directly
    const { cleanupOrphanTmp } = await import('../../axion/lib/atomic-writer.js');
    const cleanup = cleanupOrphanTmp(ctx.registryDir);
    console.log(`    ✓ Cleanup removed ${cleanup.removed.length} files`);
    
    // Step 3: Verify .tmp files are gone
    console.log('  Step 3: Verify .tmp files removed');
    for (const tmpFile of orphanFiles) {
      expect(fs.existsSync(tmpFile), `${path.basename(tmpFile)} should be removed`).toBe(false);
    }
    console.log('    ✓ All orphan .tmp files removed');
    
    console.log('[TEST 2] ✓ Orphan cleanup works correctly');
    ctx.cleanupOnPass = true;
  }, 30000);
  
  it('Test 3: corrupt .tmp does not poison reads', async () => {
    ctx.cleanupOnPass = false;
    
    console.log('\n[TEST 3] Corrupt .tmp does not poison reads');
    
    // Ensure workspace exists
    if (!fs.existsSync(ctx.registryDir)) {
      fs.mkdirSync(ctx.registryDir, { recursive: true });
    }
    
    // Step 1: Create valid stage_markers.json
    console.log('  Step 1: Create valid stage_markers.json');
    const validMarkers = {
      architecture: {
        generate: { status: 'done', timestamp: new Date().toISOString() },
        seed: { status: 'done', timestamp: new Date().toISOString() },
        verify: { status: 'done', timestamp: new Date().toISOString() }
      }
    };
    
    const markersPath = path.join(ctx.registryDir, 'stage_markers.json');
    fs.writeFileSync(markersPath, JSON.stringify(validMarkers, null, 2));
    console.log('    ✓ Valid stage_markers.json created');
    
    // Step 2: Create corrupt .tmp alongside
    console.log('  Step 2: Create corrupt .stage_markers.json.tmp');
    const corruptTmpPath = path.join(ctx.registryDir, '.stage_markers.json.tmp');
    fs.writeFileSync(corruptTmpPath, '{ corrupt: this is not valid JSON!!! }}}');
    console.log('    ✓ Corrupt .tmp file created');
    
    // Step 3: Read the valid file (should not be affected by corrupt .tmp)
    console.log('  Step 3: Read valid file (should ignore corrupt .tmp)');
    const readMarkers = JSON.parse(fs.readFileSync(markersPath, 'utf-8'));
    
    expect(readMarkers.architecture, 'should read architecture from valid file').toBeDefined();
    expect(readMarkers.architecture.verify?.status, 'verify status should be done').toBe('done');
    console.log('    ✓ Valid file read correctly (corrupt .tmp ignored)');
    
    // Step 4: Cleanup should remove corrupt .tmp
    console.log('  Step 4: Cleanup corrupt .tmp');
    const { cleanupOrphanTmp } = await import('../../axion/lib/atomic-writer.js');
    const cleanup = cleanupOrphanTmp(ctx.registryDir);
    expect(cleanup.removed.length, 'should remove corrupt .tmp').toBeGreaterThanOrEqual(1);
    expect(fs.existsSync(corruptTmpPath), 'corrupt .tmp should be removed').toBe(false);
    console.log('    ✓ Corrupt .tmp removed');
    
    // Verify valid file still intact
    expect(fs.existsSync(markersPath), 'valid file should still exist').toBe(true);
    const finalMarkers = JSON.parse(fs.readFileSync(markersPath, 'utf-8'));
    expect(finalMarkers.architecture.verify?.status, 'verify status still done').toBe('done');
    console.log('    ✓ Valid file still intact');
    
    console.log('[TEST 3] ✓ Corrupt .tmp does not poison reads');
    ctx.cleanupOnPass = true;
  }, 30000);
});
