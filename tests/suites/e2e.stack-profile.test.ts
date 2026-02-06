/**
 * E2E Stack Profile Contract Tests
 * 
 * Validates the stack profile wire-through: scaffold → build-plan → build-exec
 * 1. Scaffold writes registry/stack_profile.json + anchor markers in scaffolded files
 * 2. Build-plan includes stack_id from profile
 * 3. Build-exec manifest includes stack_id from profile
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
}

interface TestContext {
  runId: string;
  runDir: string;
  build: BuildContext;
  cleanupOnPass: boolean;
}

function generateRunId(): string {
  return `sp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function parseJsonFromOutput(stdout: string): any {
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
  return json;
}

function runCommand(command: string, cwd: string): { stdout: string; json: any } {
  const stdout = execSync(command, {
    cwd,
    encoding: 'utf-8',
    timeout: 120000,
    env: { ...process.env, AXION_SYSTEM_ROOT: path.join(cwd, 'axion') },
  });
  return { stdout, json: parseJsonFromOutput(stdout) };
}

function setupTestContext(): TestContext {
  const runId = generateRunId();
  const runDir = path.join(TEST_RUNS_BASE, runId);
  fs.mkdirSync(runDir, { recursive: true });

  const buildRoot = path.join(runDir, 'build');
  fs.mkdirSync(buildRoot, { recursive: true });

  return {
    runId,
    runDir,
    build: {
      buildRoot,
      projectName: 'StackTest',
      workspace: path.join(buildRoot, 'StackTest'),
    },
    cleanupOnPass: true,
  };
}

function cleanupTestContext(ctx: TestContext, passed: boolean): void {
  if (passed && ctx.cleanupOnPass) {
    try {
      fs.rmSync(ctx.runDir, { recursive: true, force: true });
    } catch {
    }
  } else {
    console.log(`[STACK-PROFILE] Workspace preserved at: ${ctx.runDir}`);
  }
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

describe('E2E Stack Profile Contract', () => {
  let ctx: TestContext;
  let testPassed = false;

  beforeAll(() => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });
    ctx = setupTestContext();
    console.log(`[STACK-PROFILE] Run: ${ctx.runId}`);
    console.log(`[STACK-PROFILE] Dir: ${ctx.runDir}`);

    console.log(`  [PROVISION] ${ctx.build.projectName} at ${ctx.build.buildRoot}`);

    const kitCreateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
      `--target ${ctx.build.buildRoot} ` +
      `--source ${AXION_SOURCE} ` +
      `--project-name ${ctx.build.projectName} ` +
      `--project-desc "Stack profile E2E: ${ctx.build.projectName}" ` +
      `--stack-profile default-web-saas ` +
      `--json`;

    const kitResult = runCommand(kitCreateCmd, PROJECT_ROOT);
    if (!kitResult.json || kitResult.json.status !== 'success') {
      throw new Error(`kit-create failed: ${JSON.stringify(kitResult.json)}`);
    }

    createCompliantFixture(ctx.build);

    console.log(`  [PROVISION] ${ctx.build.projectName} ready`);
  });

  afterAll(() => {
    cleanupTestContext(ctx, testPassed);
  });

  it('scaffold writes stack_profile.json and anchor markers in files', () => {
    console.log('\n[SCAFFOLD] Running scaffold-app');

    const scaffoldCmd = `npx tsx axion/scripts/axion-scaffold-app.ts ` +
      `--build-root ${ctx.build.buildRoot} ` +
      `--project-name ${ctx.build.projectName} ` +
      `--override dev_build ` +
      `--json`;

    const result = runCommand(scaffoldCmd, ctx.build.buildRoot);
    expect(result.json).toBeTruthy();
    expect(result.json.status).toBe('success');

    const profilePath = path.join(ctx.build.workspace, 'registry', 'stack_profile.json');
    expect(fs.existsSync(profilePath), 'stack_profile.json should exist').toBe(true);

    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    expect(profile.version).toBe('1.0.0');
    expect(profile.stack_id).toBe('default-web-saas');
    expect(profile.language).toBe('ts');
    expect(profile.runtime).toBe('node');
    expect(profile.package_manager).toBe('npm');
    expect(profile.app).toBeTruthy();
    expect(profile.app.type).toBe('web');
    expect(profile.app.framework).toBeTruthy();
    expect(profile.app.frontend).toBeTruthy();
    expect(profile.app.frontend.framework).toBeTruthy();
    expect(profile.conventions).toBeTruthy();
    expect(profile.conventions.app_dir).toBe('app');
    expect(profile.conventions.server_entry).toBe('server/index.ts');
    expect(profile.conventions.health_path).toBe('/api/health');
    expect(profile.conventions.anchors).toBeTruthy();
    expect(profile.conventions.anchors.ROUTES).toBe('<!-- AXION:ANCHOR:ROUTES -->');
    expect(profile.conventions.anchors.MIDDLEWARE).toBe('<!-- AXION:ANCHOR:MIDDLEWARE -->');
    expect(profile.conventions.anchors.CLIENT_ROUTES).toBe('<!-- AXION:ANCHOR:CLIENT_ROUTES -->');
    expect(profile.conventions.anchors.SERVER_CONFIG).toBe('<!-- AXION:ANCHOR:SERVER_CONFIG -->');
    console.log('  stack_profile.json valid with all required fields');

    const appDir = path.join(ctx.build.workspace, 'app');

    const routesFile = path.join(appDir, 'server', 'routes.ts');
    expect(fs.existsSync(routesFile), 'server/routes.ts should exist').toBe(true);
    const routesContent = fs.readFileSync(routesFile, 'utf-8');
    expect(routesContent).toContain('<!-- AXION:ANCHOR:ROUTES -->');
    console.log('  ROUTES anchor present in server/routes.ts');

    const serverIndex = path.join(appDir, 'server', 'index.ts');
    expect(fs.existsSync(serverIndex), 'server/index.ts should exist').toBe(true);
    const serverContent = fs.readFileSync(serverIndex, 'utf-8');
    expect(serverContent).toContain('<!-- AXION:ANCHOR:MIDDLEWARE -->');
    expect(serverContent).toContain('<!-- AXION:ANCHOR:SERVER_CONFIG -->');
    console.log('  MIDDLEWARE + SERVER_CONFIG anchors present in server/index.ts');

    const appTsx = path.join(appDir, 'client', 'src', 'App.tsx');
    expect(fs.existsSync(appTsx), 'client/src/App.tsx should exist').toBe(true);
    const appContent = fs.readFileSync(appTsx, 'utf-8');
    expect(appContent).toContain('<!-- AXION:ANCHOR:CLIENT_ROUTES -->');
    console.log('  CLIENT_ROUTES anchor present in client/src/App.tsx');

    console.log('[SCAFFOLD] Stack profile + anchors test passed');
  }, 120000);

  it('build-plan includes stack_id from profile', () => {
    console.log('\n[BUILD-PLAN] Running build-plan');

    const buildPlanCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-build-plan.ts ` +
      `--build-root ${ctx.build.buildRoot} ` +
      `--project-name ${ctx.build.projectName} ` +
      `--json`;

    const result = runCommand(buildPlanCmd, PROJECT_ROOT);
    expect(result.json).toBeTruthy();
    expect(result.json.status).toBe('success');

    const planPath = path.join(ctx.build.workspace, 'registry', 'build_plan.json');
    expect(fs.existsSync(planPath), 'build_plan.json should exist').toBe(true);

    const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));
    expect(plan.stack_id).toBe('default-web-saas');
    expect(plan.project_name).toBe(ctx.build.projectName);
    expect(plan.version).toBe('1.0.0');
    expect(Array.isArray(plan.tasks)).toBe(true);
    expect(plan.tasks.length).toBeGreaterThan(0);
    console.log(`  stack_id: ${plan.stack_id}`);
    console.log(`  tasks: ${plan.tasks.length}`);

    console.log('[BUILD-PLAN] Stack ID inclusion test passed');
  }, 120000);

  it('build-exec manifest includes stack_id from profile', () => {
    console.log('\n[BUILD-EXEC] Running build-exec --dry-run');

    const cmd = `npx tsx ${AXION_SOURCE}/scripts/axion-build-exec.ts ` +
      `--build-root ${ctx.build.buildRoot} ` +
      `--project-name ${ctx.build.projectName} ` +
      `--dry-run ` +
      `--json`;

    const result = runCommand(cmd, PROJECT_ROOT);
    expect(result.json).toBeTruthy();

    expect(result.json.version).toBe('1.0.0');
    expect(result.json.stack_profile).toBe('default-web-saas');
    expect(result.json.project_name).toBe(ctx.build.projectName);
    expect(result.json.producer).toBeTruthy();
    expect(result.json.producer.script).toBe('axion-build-exec');
    expect(Array.isArray(result.json.ops)).toBe(true);
    expect(result.json.ops.length).toBeGreaterThan(0);
    console.log(`  stack_profile: ${result.json.stack_profile}`);
    console.log(`  ops: ${result.json.ops.length}`);

    testPassed = true;
    console.log('[BUILD-EXEC] Stack profile in manifest test passed');
  }, 120000);
});
