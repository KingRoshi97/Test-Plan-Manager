/**
 * E2E Kit Portability Test
 * 
 * Validates that AXION kits are truly portable/relocatable:
 * - Create kit at location A
 * - Copy entire build root to location B
 * - Re-activate in location B
 * - Run doctor and run-app dry-run on relocated kit
 * - Assert no hardcoded absolute paths from original location
 * 
 * This proves the "universal kit" claim: kits can be moved/copied and still work.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TEST_RUNS_BASE = path.join(PROJECT_ROOT, '.axion_test_runs');
const AXION_SOURCE = path.join(PROJECT_ROOT, 'axion');

interface PortabilityContext {
  runId: string;
  originalBuildRoot: string;  // Location A
  relocatedBuildRoot: string; // Location B
  projectName: string;
  cleanupOnPass: boolean;
}

function generateRunId(): string {
  return `portability_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function sanitizeProjectName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function setupTestWorkspace(): PortabilityContext {
  const runId = generateRunId();
  const testBase = path.join(TEST_RUNS_BASE, runId);
  const projectName = 'PortableKit';
  
  const originalBuildRoot = path.join(testBase, 'original');
  const relocatedBuildRoot = path.join(testBase, 'relocated');
  
  fs.mkdirSync(originalBuildRoot, { recursive: true });
  fs.mkdirSync(relocatedBuildRoot, { recursive: true });
  
  return {
    runId,
    originalBuildRoot,
    relocatedBuildRoot,
    projectName,
    cleanupOnPass: true
  };
}

function cleanupTestWorkspace(ctx: PortabilityContext, testPassed: boolean): void {
  if (testPassed && ctx.cleanupOnPass) {
    try {
      const testBase = path.dirname(ctx.originalBuildRoot);
      fs.rmSync(testBase, { recursive: true, force: true });
    } catch {
      // Best effort cleanup
    }
  } else {
    console.log(`[PORTABILITY] Test workspace preserved at: ${path.dirname(ctx.originalBuildRoot)}`);
  }
}

function runCommand(command: string, cwd: string, options?: { throwOnError?: boolean }): { 
  stdout: string; 
  stderr: string;
  code: number;
  json: any;
} {
  let stdout = '';
  let stderr = '';
  let code = 0;
  
  try {
    stdout = execSync(command, {
      cwd,
      encoding: 'utf-8',
      timeout: 120000,
      env: { ...process.env }
    });
  } catch (err: any) {
    stdout = err.stdout || '';
    stderr = err.stderr || '';
    code = err.status || 1;
    
    if (options?.throwOnError) {
      throw err;
    }
  }
  
  // Parse JSON from output
  let json: any = null;
  const combined = stdout + stderr;
  try {
    const jsonMatch = combined.match(/\{[\s\S]*"status"[\s\S]*\}/);
    if (jsonMatch) {
      json = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // No valid JSON found
  }
  
  return { stdout, stderr, code, json };
}

function copyDirectory(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function scanForOriginalPath(dir: string, originalPath: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanForOriginalPath(fullPath, originalPath, files);
    } else if (entry.name.endsWith('.json')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes(originalPath)) {
          files.push(fullPath);
        }
      } catch {
        // Skip unreadable files
      }
    }
  }
  
  return files;
}

describe('E2E Kit Portability', () => {
  let ctx: PortabilityContext;
  let testPassed = false;
  
  beforeAll(() => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });
    ctx = setupTestWorkspace();
    console.log(`[PORTABILITY] Test run: ${ctx.runId}`);
    console.log(`[PORTABILITY] Original: ${ctx.originalBuildRoot}`);
    console.log(`[PORTABILITY] Relocated: ${ctx.relocatedBuildRoot}`);
  });
  
  afterAll(() => {
    cleanupTestWorkspace(ctx, testPassed);
  });
  
  it('kit is relocatable: copied build root remains runnable', async () => {
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: Create kit at Location A
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[PHASE 1] Create kit at location A');
    
    // Step 1a: kit-create
    const kitCreateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
      `--target ${ctx.originalBuildRoot} ` +
      `--source ${AXION_SOURCE} ` +
      `--project-name ${ctx.projectName} ` +
      `--project-desc "Portability Test Kit" ` +
      `--stack-profile default-web-saas ` +
      `--json`;
    
    const kitResult = runCommand(kitCreateCmd, PROJECT_ROOT);
    expect(kitResult.json?.status, 'kit-create should succeed').toBe('success');
    console.log('  ✓ kit-create passed');
    
    // Step 1b: Create project workspace structure (same as two-root test)
    const sanitizedName = sanitizeProjectName(ctx.projectName);
    const workspaceA = path.join(ctx.originalBuildRoot, sanitizedName);
    const registryA = path.join(workspaceA, 'registry');
    fs.mkdirSync(workspaceA, { recursive: true });
    fs.mkdirSync(path.join(workspaceA, 'domains'), { recursive: true });
    fs.mkdirSync(registryA, { recursive: true });
    console.log('  ✓ Workspace structure created');
    
    // Step 1c: Create compliant fixture (domain docs, lock_manifest, verify_report)
    const domainsPath = path.join(workspaceA, 'domains');
    
    // Create architecture domain with stack profile (required by scaffold-app)
    // Note: scaffold-app looks for README.md, not architecture.md
    const archPath = path.join(domainsPath, 'architecture');
    fs.mkdirSync(archPath, { recursive: true });
    fs.writeFileSync(
      path.join(archPath, 'README.md'),
      `# Architecture Domain

## Overview
This document defines the architecture specifications for ${ctx.projectName}.

## Stack Profile

\`\`\`yaml
stack_profile: default-web-saas
framework: express
database: postgresql
frontend: react
\`\`\`

## Core Architecture

Standard web application architecture with REST API backend and React frontend.

## Seams

This module integrates with dependent modules through well-defined interfaces.
`
    );
    
    fs.writeFileSync(
      path.join(registryA, 'lock_manifest.json'),
      JSON.stringify({
        version: '1.0.0',
        created_at: new Date().toISOString(),
        modules_locked: ['architecture', 'backend', 'frontend'],
        sections_verified: 15
      }, null, 2)
    );
    
    fs.writeFileSync(
      path.join(registryA, 'verify_report.json'),
      JSON.stringify({
        status: 'PASS',
        overall_status: 'PASS',
        verified_at: new Date().toISOString(),
        modules_verified: 3,
        issues: []
      }, null, 2)
    );
    console.log('  ✓ Compliant fixtures created');
    
    // Step 1d: scaffold-app (now that workspace exists)
    // Use sanitized name to match actual workspace directory
    const scaffoldCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-scaffold-app.ts ` +
      `--build-root ${ctx.originalBuildRoot} ` +
      `--project-name ${sanitizedName} ` +
      `--override dev_build ` +
      `--json`;
    
    const scaffoldResult = runCommand(scaffoldCmd, PROJECT_ROOT);
    expect(scaffoldResult.json?.status, 'scaffold-app should succeed').toBe('success');
    
    // Verify app structure was created
    const appPath = path.join(workspaceA, 'app');
    expect(fs.existsSync(appPath), 'app/ should exist').toBe(true);
    console.log('  ✓ scaffold-app passed');
    
    // Step 1e: activate (use sanitized name to match workspace)
    const activateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-activate.ts ` +
      `--build-root ${ctx.originalBuildRoot} ` +
      `--project-name ${sanitizedName} ` +
      `--allow-no-tests ` +
      `--json`;
    
    const activateResult = runCommand(activateCmd, PROJECT_ROOT);
    expect(activateResult.json?.status, 'activate should succeed').toBe('success');
    
    // Assert ACTIVE_BUILD.json exists at A
    const activeBuildA = path.join(ctx.originalBuildRoot, 'ACTIVE_BUILD.json');
    expect(fs.existsSync(activeBuildA), 'ACTIVE_BUILD.json should exist at A').toBe(true);
    console.log('  ✓ activate passed');
    
    console.log('[PHASE 1] ✓ Kit created and activated at location A');
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: Copy entire build root to Location B
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[PHASE 2] Copy build root from A to B');
    
    // Copy all contents from A to B
    const entries = fs.readdirSync(ctx.originalBuildRoot);
    for (const entry of entries) {
      const src = path.join(ctx.originalBuildRoot, entry);
      const dest = path.join(ctx.relocatedBuildRoot, entry);
      
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        copyDirectory(src, dest);
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    // Assert structure preserved
    expect(fs.existsSync(path.join(ctx.relocatedBuildRoot, 'axion')), 'axion/ should exist at B').toBe(true);
    expect(fs.existsSync(path.join(ctx.relocatedBuildRoot, 'manifest.json')), 'manifest.json should exist at B').toBe(true);
    expect(fs.existsSync(path.join(ctx.relocatedBuildRoot, 'ACTIVE_BUILD.json')), 'ACTIVE_BUILD.json should exist at B (copied)').toBe(true);
    
    const workspaceB = path.join(ctx.relocatedBuildRoot, sanitizedName);
    expect(fs.existsSync(workspaceB), 'Project workspace should exist at B').toBe(true);
    
    console.log('[PHASE 2] ✓ Build root copied to location B');
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: Re-activate in Location B
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[PHASE 3] Re-activate in location B');
    
    const reactivateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-activate.ts ` +
      `--build-root ${ctx.relocatedBuildRoot} ` +
      `--project-name ${sanitizedName} ` +
      `--allow-no-tests ` +
      `--json`;
    
    const reactivateResult = runCommand(reactivateCmd, PROJECT_ROOT);
    expect(reactivateResult.json?.status, 'reactivate at B should succeed').toBe('success');
    
    // Verify ACTIVE_BUILD.json points to B, not A
    const activeBuildB = path.join(ctx.relocatedBuildRoot, 'ACTIVE_BUILD.json');
    const activeBuildContent = JSON.parse(fs.readFileSync(activeBuildB, 'utf-8'));
    
    expect(activeBuildContent.active_build_root).toContain('relocated');
    expect(activeBuildContent.active_build_root).not.toContain('original');
    
    console.log('[PHASE 3] ✓ Re-activated in location B');
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: Run axion-doctor on relocated kit
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[PHASE 4] Run doctor on relocated kit');
    
    const doctorCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-doctor.ts ` +
      `--root ${ctx.relocatedBuildRoot} ` +
      `--json`;
    
    const doctorResult = runCommand(doctorCmd, PROJECT_ROOT);
    
    // Doctor must pass - relocated kit must be healthy
    const doctorJson = doctorResult.json;
    expect(doctorJson, 'doctor must return JSON').toBeTruthy();
    expect(doctorJson?.status, 'doctor must succeed on relocated kit').toBe('success');
    
    // Critical failures indicate relocation broke the kit - fail the test
    const criticalFailures = doctorJson?.checks?.filter(
      (c: any) => c.status === 'FAIL' && !['POLLUTION_DETECTED', 'ACTIVE_BUILD_TARGET_EXISTS'].includes(c.reason_code)
    ) || [];
    
    expect(criticalFailures.length, 'no critical failures allowed on relocated kit').toBe(0);
    
    console.log('[PHASE 4] ✓ Doctor completed on relocated kit');
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 5: Run axion-run-app --dry-run on relocated kit
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[PHASE 5] Run run-app --dry-run on relocated kit');
    
    const runAppCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-run-app.ts ` +
      `--root ${ctx.relocatedBuildRoot} ` +
      `--dry-run ` +
      `--json`;
    
    const runAppResult = runCommand(runAppCmd, PROJECT_ROOT);
    
    // Dry-run must return valid JSON and succeed (or indicate what would happen)
    const runAppJson = runAppResult.json;
    expect(runAppJson, 'run-app dry-run must return JSON').toBeTruthy();
    
    // Success or blocked_by (missing deps) is acceptable for dry-run
    const acceptableStatuses = ['success', 'blocked_by', 'dry_run'];
    const hasAcceptableStatus = acceptableStatuses.includes(runAppJson?.status) || 
                                runAppJson?.dry_run === true;
    
    expect(hasAcceptableStatus, `run-app dry-run must complete with acceptable status, got: ${runAppJson?.status}`).toBe(true);
    
    console.log('[PHASE 5] ✓ run-app dry-run completed');
    
    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 6: Scan for original path A in artifacts
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[PHASE 6] Scan for hardcoded original paths');
    
    const originalPathResolved = path.resolve(ctx.originalBuildRoot);
    
    // Scan key artifact locations
    const artifactsToScan = [
      path.join(ctx.relocatedBuildRoot, 'ACTIVE_BUILD.json'),
      path.join(ctx.relocatedBuildRoot, 'manifest.json'),
      path.join(workspaceB, 'registry')
    ];
    
    const filesWithOriginalPath: string[] = [];
    
    for (const artifact of artifactsToScan) {
      if (fs.existsSync(artifact)) {
        const stat = fs.statSync(artifact);
        if (stat.isDirectory()) {
          const found = scanForOriginalPath(artifact, originalPathResolved);
          filesWithOriginalPath.push(...found);
        } else {
          const content = fs.readFileSync(artifact, 'utf-8');
          if (content.includes(originalPathResolved)) {
            filesWithOriginalPath.push(artifact);
          }
        }
      }
    }
    
    if (filesWithOriginalPath.length > 0) {
      console.log('  [FAIL] Files containing original path A:');
      for (const file of filesWithOriginalPath) {
        const content = fs.readFileSync(file, 'utf-8');
        const excerpt = content.substring(0, 200);
        console.log(`    - ${file}`);
        console.log(`      Excerpt: ${excerpt}...`);
      }
    }
    
    expect(filesWithOriginalPath.length, 'No artifacts should contain original path A').toBe(0);
    
    console.log('[PHASE 6] ✓ No hardcoded original paths found');
    
    // ═══════════════════════════════════════════════════════════════════════
    // SUCCESS
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[PORTABILITY] ✅ Kit is fully relocatable');
    testPassed = true;
    
  }, 180000); // 3 minute timeout
  
}, 200000); // 3+ minute timeout for entire suite
