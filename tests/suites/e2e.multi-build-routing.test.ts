/**
 * E2E Multi-Build Routing Test
 * 
 * Validates that ACTIVE_BUILD.json pointer-explicit routing is deterministic
 * and that switching between multiple builds via --pointer produces correct,
 * isolated behavior with no cross-contamination.
 * 
 * Why pointer-explicit mode is required:
 *   axion-run-app defaults to CWD-relative ACTIVE_BUILD.json, which makes
 *   multi-build routing inherently flaky under automation. Using --pointer
 *   guarantees deterministic resolution regardless of working directory.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TEST_RUNS_BASE = path.join(PROJECT_ROOT, '.axion_test_runs');
const AXION_SOURCE = path.join(PROJECT_ROOT, 'axion');

interface BuildContext {
  buildRoot: string;
  projectName: string;
  workspace: string;
  pointerPath: string;
}

interface TestContext {
  runId: string;
  runDir: string;
  buildA: BuildContext;
  buildB: BuildContext;
  cleanupOnPass: boolean;
}

function generateRunId(): string {
  return `mb_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function setupTestContext(): TestContext {
  const runId = generateRunId();
  const runDir = path.join(TEST_RUNS_BASE, runId);
  fs.mkdirSync(runDir, { recursive: true });

  const buildRootA = path.join(runDir, 'buildA');
  const buildRootB = path.join(runDir, 'buildB');
  fs.mkdirSync(buildRootA, { recursive: true });
  fs.mkdirSync(buildRootB, { recursive: true });

  return {
    runId,
    runDir,
    buildA: {
      buildRoot: buildRootA,
      projectName: 'ProjectAlpha',
      workspace: path.join(buildRootA, 'ProjectAlpha'),
      pointerPath: path.join(buildRootA, 'ACTIVE_BUILD.json'),
    },
    buildB: {
      buildRoot: buildRootB,
      projectName: 'ProjectBeta',
      workspace: path.join(buildRootB, 'ProjectBeta'),
      pointerPath: path.join(buildRootB, 'ACTIVE_BUILD.json'),
    },
    cleanupOnPass: true,
  };
}

function cleanupTestContext(ctx: TestContext, passed: boolean): void {
  if (passed && ctx.cleanupOnPass) {
    try {
      fs.rmSync(ctx.runDir, { recursive: true, force: true });
    } catch {
      // Best effort
    }
  } else {
    console.log(`[MULTI-BUILD] Workspace preserved at: ${ctx.runDir}`);
  }
}

function runCommand(command: string, cwd: string): { stdout: string; json: any } {
  const stdout = execSync(command, {
    cwd,
    encoding: 'utf-8',
    timeout: 120000,
    env: { ...process.env, AXION_SYSTEM_ROOT: path.join(cwd, 'axion') },
  });

  let json: any = null;
  try {
    json = JSON.parse(stdout.trim());
  } catch {
    const lines = stdout.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{')) {
        try {
          let jsonStr = '';
          for (let j = i; j < lines.length; j++) {
            jsonStr += lines[j] + '\n';
          }
          json = JSON.parse(jsonStr.trim());
          break;
        } catch {
          continue;
        }
      }
    }
  }

  return { stdout, json };
}

function createCompliantFixture(build: BuildContext): void {
  const workspace = build.workspace;
  fs.mkdirSync(path.join(workspace, 'domains'), { recursive: true });
  fs.mkdirSync(path.join(workspace, 'registry'), { recursive: true });

  const minimalModules = ['architecture', 'contracts'];

  for (const moduleName of minimalModules) {
    const modulePath = path.join(workspace, 'domains', moduleName);
    fs.mkdirSync(modulePath, { recursive: true });

    let docContent = `# ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Domain

## Overview

This document defines the ${moduleName} specifications for ${build.projectName}.

## RPBS Derivations

- Core ${moduleName} functionality
- Integration with other modules

## Specifications

### Section 1: Core Requirements

The ${moduleName} module provides essential functionality.

### Section 2: Implementation Notes

Standard implementation patterns apply.

## Seams

This module integrates with dependent modules through well-defined interfaces.
`;

    if (moduleName === 'architecture') {
      docContent = `# Architecture Domain

## Overview

This document defines the architecture specifications for ${build.projectName}.

## Stack Profile

Selected stack profile: **default-web-saas**

### Technology Stack

- **Runtime**: Node.js + TypeScript
- **Backend**: Express.js
- **Frontend**: React + Vite
- **Database**: PostgreSQL with Drizzle ORM
- **Testing**: Vitest
- **Deployment**: Replit

## RPBS Derivations

- Core architecture functionality
- Integration with other modules

## Specifications

### Section 1: Core Requirements

The architecture module provides the foundational structure.

### Section 2: Implementation Notes

Standard implementation patterns apply using the default-web-saas stack.

## Seams

This module integrates with dependent modules through well-defined interfaces.
`;
    }

    fs.writeFileSync(path.join(modulePath, 'README.md'), docContent);
  }

  const stageMarkers: Record<string, Record<string, any>> = {};
  for (const moduleName of minimalModules) {
    stageMarkers[moduleName] = {
      generate: { completed: true, timestamp: new Date().toISOString() },
      seed: { completed: true, timestamp: new Date().toISOString() },
      draft: { completed: true, timestamp: new Date().toISOString() },
      review: { completed: true, timestamp: new Date().toISOString() },
      verify: { completed: true, status: 'PASS', timestamp: new Date().toISOString() },
    };
  }

  const registryPath = path.join(workspace, 'registry');

  fs.writeFileSync(
    path.join(registryPath, 'stage_markers.json'),
    JSON.stringify(stageMarkers, null, 2),
  );

  fs.writeFileSync(
    path.join(registryPath, 'verify_status.json'),
    JSON.stringify({
      version: '1.0.0',
      overall_status: 'PASS',
      modules: Object.fromEntries(minimalModules.map(m => [m, { status: 'PASS', issues: [] }])),
      timestamp: new Date().toISOString(),
    }, null, 2),
  );

  fs.writeFileSync(
    path.join(registryPath, 'verify_report.json'),
    JSON.stringify({
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      status: 'PASS',
      overall_status: 'PASS',
      current_revision: 'e2e-fixture-v1',
      modules_verified: minimalModules.length,
      modules: Object.fromEntries(minimalModules.map(m => [m, { status: 'PASS', issues: [] }])),
      issues: [],
      timestamp: new Date().toISOString(),
    }, null, 2),
  );

  fs.writeFileSync(
    path.join(registryPath, 'lock_manifest.json'),
    JSON.stringify({
      version: '1.0.0',
      locked_at: new Date().toISOString(),
      locked_by: 'e2e-test',
      revision: 'e2e-fixture-v1',
      modules: minimalModules,
      checksums: Object.fromEntries(minimalModules.map(m => [m, 'e2e-checksum-' + m])),
    }, null, 2),
  );
}

function provisionBuild(build: BuildContext): void {
  console.log(`  [PROVISION] ${build.projectName} at ${build.buildRoot}`);

  const kitCreateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
    `--target ${build.buildRoot} ` +
    `--source ${AXION_SOURCE} ` +
    `--project-name ${build.projectName} ` +
    `--project-desc "Multi-build E2E: ${build.projectName}" ` +
    `--stack-profile default-web-saas ` +
    `--json`;

  const kitResult = runCommand(kitCreateCmd, PROJECT_ROOT);
  if (!kitResult.json || kitResult.json.status !== 'success') {
    throw new Error(`kit-create failed for ${build.projectName}: ${JSON.stringify(kitResult.json)}`);
  }

  createCompliantFixture(build);

  const scaffoldCmd = `npx tsx axion/scripts/axion-scaffold-app.ts ` +
    `--build-root ${build.buildRoot} ` +
    `--project-name ${build.projectName} ` +
    `--override dev_build ` +
    `--json`;

  const scaffoldResult = runCommand(scaffoldCmd, build.buildRoot);
  if (!scaffoldResult.json || scaffoldResult.json.status !== 'success') {
    throw new Error(`scaffold-app failed for ${build.projectName}: ${JSON.stringify(scaffoldResult.json)}`);
  }

  const activateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-activate.ts ` +
    `--build-root ${build.buildRoot} ` +
    `--project-name ${build.projectName} ` +
    `--allow-no-tests ` +
    `--json`;

  const activateResult = runCommand(activateCmd, PROJECT_ROOT);
  if (!activateResult.json || activateResult.json.status !== 'success') {
    throw new Error(`activate failed for ${build.projectName}: ${JSON.stringify(activateResult.json)}`);
  }

  if (!fs.existsSync(build.pointerPath)) {
    throw new Error(`ACTIVE_BUILD.json not found at ${build.pointerPath}`);
  }

  console.log(`  [PROVISION] ${build.projectName} ready`);
}

describe('E2E Multi-Build Routing', () => {
  let ctx: TestContext;
  let testPassed = false;

  beforeAll(() => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });
    ctx = setupTestContext();
    console.log(`[MULTI-BUILD] Run: ${ctx.runId}`);
    console.log(`[MULTI-BUILD] Dir: ${ctx.runDir}`);
  });

  afterAll(() => {
    cleanupTestContext(ctx, testPassed);
  });

  it('pointer-explicit switching resolves correct build each time', () => {
    console.log('\n[STEP 1] Provisioning build A and B');
    provisionBuild(ctx.buildA);
    provisionBuild(ctx.buildB);

    const pointerA = JSON.parse(fs.readFileSync(ctx.buildA.pointerPath, 'utf-8'));
    const pointerB = JSON.parse(fs.readFileSync(ctx.buildB.pointerPath, 'utf-8'));

    expect(pointerA.active_build_root).toBe(ctx.buildA.buildRoot);
    expect(pointerA.project_name).toBe(ctx.buildA.projectName);
    expect(pointerA.docs_locked).toBe(true);
    expect(pointerA.verify_passed).toBe(true);

    expect(pointerB.active_build_root).toBe(ctx.buildB.buildRoot);
    expect(pointerB.project_name).toBe(ctx.buildB.projectName);
    expect(pointerB.docs_locked).toBe(true);
    expect(pointerB.verify_passed).toBe(true);

    const hashABefore = hashFile(ctx.buildA.pointerPath);
    const hashBBefore = hashFile(ctx.buildB.pointerPath);

    console.log('\n[STEP 2] Four pointer-explicit dry-runs');

    const absPointerA = path.resolve(ctx.buildA.pointerPath);
    const absPointerB = path.resolve(ctx.buildB.pointerPath);

    const runAppBase = `npx tsx ${AXION_SOURCE}/scripts/axion-run-app.ts --dry-run --json`;

    console.log('  Run 1: pointer → A');
    const run1 = runCommand(`${runAppBase} --pointer ${absPointerA}`, PROJECT_ROOT);
    expect(run1.json).toBeTruthy();
    expect(run1.json.status).toBe('success');
    expect(run1.json.pointer_path).toBe(absPointerA);
    expect(run1.json.active_build_root).toBe(ctx.buildA.buildRoot);
    expect(run1.json.resolved_app_path).toBeTruthy();
    expect(run1.json.resolved_app_path.startsWith(ctx.buildA.buildRoot)).toBe(true);
    expect(run1.json.resolved_app_path).toContain('/app');
    expect(run1.json.dry_run).toBe(true);

    console.log('  Run 2: pointer → B');
    const run2 = runCommand(`${runAppBase} --pointer ${absPointerB}`, PROJECT_ROOT);
    expect(run2.json).toBeTruthy();
    expect(run2.json.status).toBe('success');
    expect(run2.json.pointer_path).toBe(absPointerB);
    expect(run2.json.active_build_root).toBe(ctx.buildB.buildRoot);
    expect(run2.json.resolved_app_path).toBeTruthy();
    expect(run2.json.resolved_app_path.startsWith(ctx.buildB.buildRoot)).toBe(true);
    expect(run2.json.resolved_app_path).toContain('/app');
    expect(run2.json.dry_run).toBe(true);

    console.log('  Run 3: pointer → A (re-run, proves no global sticky state)');
    const run3 = runCommand(`${runAppBase} --pointer ${absPointerA}`, PROJECT_ROOT);
    expect(run3.json).toBeTruthy();
    expect(run3.json.status).toBe('success');
    expect(run3.json.pointer_path).toBe(absPointerA);
    expect(run3.json.active_build_root).toBe(ctx.buildA.buildRoot);
    expect(run3.json.resolved_app_path.startsWith(ctx.buildA.buildRoot)).toBe(true);

    console.log('  Run 4: pointer → B (re-run, proves no global sticky state)');
    const run4 = runCommand(`${runAppBase} --pointer ${absPointerB}`, PROJECT_ROOT);
    expect(run4.json).toBeTruthy();
    expect(run4.json.status).toBe('success');
    expect(run4.json.pointer_path).toBe(absPointerB);
    expect(run4.json.active_build_root).toBe(ctx.buildB.buildRoot);
    expect(run4.json.resolved_app_path.startsWith(ctx.buildB.buildRoot)).toBe(true);

    console.log('\n[STEP 3] Cross-contamination safety');

    const hashAAfter = hashFile(ctx.buildA.pointerPath);
    const hashBAfter = hashFile(ctx.buildB.pointerPath);

    expect(hashAAfter).toBe(hashABefore);
    expect(hashBAfter).toBe(hashBBefore);
    console.log('  No cross-contamination: pointer hashes unchanged');

    const pollutionPathsA = [
      path.join(ctx.buildA.buildRoot, 'axion', 'domains'),
      path.join(ctx.buildA.buildRoot, 'axion', 'registry'),
      path.join(ctx.buildA.buildRoot, 'axion', 'app'),
    ];
    const pollutionPathsB = [
      path.join(ctx.buildB.buildRoot, 'axion', 'domains'),
      path.join(ctx.buildB.buildRoot, 'axion', 'registry'),
      path.join(ctx.buildB.buildRoot, 'axion', 'app'),
    ];

    for (const p of [...pollutionPathsA, ...pollutionPathsB]) {
      expect(fs.existsSync(p), `System snapshot polluted: ${p}`).toBe(false);
    }
    console.log('  No pollution in system snapshots');

    testPassed = true;
    console.log('\n[MULTI-BUILD] All assertions passed');
  }, 180000);

  it('CWD-relative default pointer resolves correctly', () => {
    const runAppCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-run-app.ts --dry-run --json`;

    console.log('\n[CWD TEST] Run with cwd=buildA, no --pointer');
    const resultA = runCommand(runAppCmd, ctx.buildA.buildRoot);

    expect(resultA.json).toBeTruthy();
    expect(resultA.json.status).toBe('success');
    expect(resultA.json.pointer_path).toBe(path.resolve(ctx.buildA.buildRoot, 'ACTIVE_BUILD.json'));
    expect(resultA.json.active_build_root).toBe(ctx.buildA.buildRoot);
    expect(resultA.json.resolved_app_path.startsWith(ctx.buildA.buildRoot)).toBe(true);

    console.log('[CWD TEST] Run with cwd=buildB, no --pointer');
    const resultB = runCommand(runAppCmd, ctx.buildB.buildRoot);

    expect(resultB.json).toBeTruthy();
    expect(resultB.json.status).toBe('success');
    expect(resultB.json.pointer_path).toBe(path.resolve(ctx.buildB.buildRoot, 'ACTIVE_BUILD.json'));
    expect(resultB.json.active_build_root).toBe(ctx.buildB.buildRoot);
    expect(resultB.json.resolved_app_path.startsWith(ctx.buildB.buildRoot)).toBe(true);

    console.log('[CWD TEST] CWD-relative resolution is correct');
  }, 60000);
});
