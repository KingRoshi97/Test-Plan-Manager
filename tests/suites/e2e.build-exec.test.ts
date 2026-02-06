/**
 * E2E Build Executor Tests
 * 
 * Validates axion-build-exec.ts:
 * 1. Dry-run golden path: plan in → manifest out, no files created
 * 2. Apply creates files + writes report
 * 3. Guard refusal: refuses without locked docs (DOCS_NOT_LOCKED)
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
  return `be_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function hashDir(dir: string): string {
  if (!fs.existsSync(dir)) return 'NOT_EXISTS';
  const entries: string[] = [];
  function walk(d: string) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else {
        entries.push(full + ':' + fs.readFileSync(full, 'utf-8').length);
      }
    }
  }
  walk(dir);
  entries.sort();
  return crypto.createHash('sha256').update(entries.join('|')).digest('hex');
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

function runCommandExpectFail(command: string, cwd: string): { stdout: string; stderr: string; json: any } {
  try {
    execSync(command, {
      cwd,
      encoding: 'utf-8',
      timeout: 120000,
      env: { ...process.env, AXION_SYSTEM_ROOT: path.join(cwd, 'axion') },
    });
    throw new Error('Expected command to fail but it succeeded');
  } catch (err: any) {
    if (err.message === 'Expected command to fail but it succeeded') throw err;
    const stdout = (err.stdout || '') as string;
    const stderr = (err.stderr || '') as string;
    return { stdout, stderr, json: parseJsonFromOutput(stdout) };
  }
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
      projectName: 'ExecProject',
      workspace: path.join(buildRoot, 'ExecProject'),
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
    console.log(`[BUILD-EXEC] Workspace preserved at: ${ctx.runDir}`);
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

function provisionBuild(build: BuildContext): void {
  console.log(`  [PROVISION] ${build.projectName} at ${build.buildRoot}`);

  const kitCreateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
    `--target ${build.buildRoot} ` +
    `--source ${AXION_SOURCE} ` +
    `--project-name ${build.projectName} ` +
    `--project-desc "Build-exec E2E: ${build.projectName}" ` +
    `--stack-profile default-web-saas ` +
    `--json`;

  const kitResult = runCommand(kitCreateCmd, PROJECT_ROOT);
  if (!kitResult.json || kitResult.json.status !== 'success') {
    throw new Error(`kit-create failed: ${JSON.stringify(kitResult.json)}`);
  }

  createCompliantFixture(build);

  const scaffoldCmd = `npx tsx axion/scripts/axion-scaffold-app.ts ` +
    `--build-root ${build.buildRoot} ` +
    `--project-name ${build.projectName} ` +
    `--override dev_build ` +
    `--json`;

  const scaffoldResult = runCommand(scaffoldCmd, build.buildRoot);
  if (!scaffoldResult.json || scaffoldResult.json.status !== 'success') {
    throw new Error(`scaffold-app failed: ${JSON.stringify(scaffoldResult.json)}`);
  }

  const buildPlanCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-build-plan.ts ` +
    `--build-root ${build.buildRoot} ` +
    `--project-name ${build.projectName} ` +
    `--json`;

  const planResult = runCommand(buildPlanCmd, PROJECT_ROOT);
  if (!planResult.json || planResult.json.status !== 'success') {
    throw new Error(`build-plan failed: ${JSON.stringify(planResult.json)}`);
  }

  console.log(`  [PROVISION] ${build.projectName} ready (with build plan)`);
}

describe('E2E Build Executor', () => {
  let ctx: TestContext;
  let testPassed = false;

  beforeAll(() => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });
    ctx = setupTestContext();
    console.log(`[BUILD-EXEC] Run: ${ctx.runId}`);
    console.log(`[BUILD-EXEC] Dir: ${ctx.runDir}`);

    provisionBuild(ctx.build);
  });

  afterAll(() => {
    cleanupTestContext(ctx, testPassed);
  });

  it('dry-run golden path: manifest out, no files created', () => {
    const workspace = ctx.build.workspace;
    const appDir = path.join(workspace, 'app');
    const appHashBefore = hashDir(appDir);

    console.log('\n[DRY-RUN] Running build-exec --dry-run');

    const cmd = `npx tsx ${AXION_SOURCE}/scripts/axion-build-exec.ts ` +
      `--build-root ${ctx.build.buildRoot} ` +
      `--project-name ${ctx.build.projectName} ` +
      `--dry-run ` +
      `--json`;

    const result = runCommand(cmd, PROJECT_ROOT);

    expect(result.json, 'dry-run should return JSON').toBeTruthy();
    expect(result.json.version).toBe('1.0.0');
    expect(result.json.producer).toBeTruthy();
    expect(result.json.producer.script).toBe('axion-build-exec');
    expect(result.json.producer.revision).toBe(1);
    expect(result.json.workspace_root).toBeTruthy();
    expect(result.json.project_name).toBe(ctx.build.projectName);
    expect(result.json.stack_profile).toBeTruthy();
    expect(result.json.source_plan).toBeTruthy();
    expect(result.json.source_plan.path).toBe('registry/build_plan.json');
    expect(result.json.source_plan.hash).toBeTruthy();
    expect(typeof result.json.source_plan.hash).toBe('string');
    expect(result.json.source_plan.hash.length).toBe(64);

    expect(Array.isArray(result.json.ops)).toBe(true);
    expect(result.json.ops.length).toBeGreaterThan(0);

    for (const op of result.json.ops) {
      expect(op.op_id).toBeTruthy();
      expect(op.type).toBe('create_file');
      expect(op.target_path).toBeTruthy();
      expect(typeof op.content).toBe('string');
      expect(op.encoding).toBe('utf-8');
      expect(op.overwrite).toBe(false);
      expect(path.isAbsolute(op.target_path)).toBe(false);
    }

    const opIds = result.json.ops.map((o: any) => o.op_id);
    expect(new Set(opIds).size).toBe(opIds.length);

    const appHashAfter = hashDir(appDir);
    expect(appHashAfter).toBe(appHashBefore);
    console.log('  No files created/modified in app/ (hash match)');

    const reportPath = path.join(workspace, 'registry', 'build_exec_report.json');
    expect(fs.existsSync(reportPath)).toBe(false);
    console.log('  No report written (dry-run)');

    console.log(`  Manifest: ${result.json.ops.length} ops`);
    console.log('[DRY-RUN] Golden path passed');
  }, 120000);

  it('apply creates files and writes report', () => {
    const workspace = ctx.build.workspace;
    const manifestDir = path.join(ctx.runDir, 'manifests');
    fs.mkdirSync(manifestDir, { recursive: true });

    const testFilePath = 'app/generated/hello.ts';
    const testContent = '// Hello from build-exec\nexport const greeting = "hello";\n';

    const manifest = {
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      producer: { script: 'axion-build-exec', revision: 1 },
      workspace_root: workspace,
      project_name: ctx.build.projectName,
      stack_profile: 'default-web-saas',
      source_plan: {
        path: 'registry/build_plan.json',
        hash: 'test-hash-for-apply',
      },
      ops: [
        {
          op_id: 'op_001',
          type: 'create_file',
          target_path: testFilePath,
          content: testContent,
          encoding: 'utf-8',
          overwrite: false,
        },
      ],
    };

    const manifestPath = path.join(manifestDir, 'test_manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log('\n[APPLY] Running build-exec --apply --manifest');

    const cmd = `npx tsx ${AXION_SOURCE}/scripts/axion-build-exec.ts ` +
      `--build-root ${ctx.build.buildRoot} ` +
      `--project-name ${ctx.build.projectName} ` +
      `--apply ` +
      `--manifest ${manifestPath} ` +
      `--json`;

    const result = runCommand(cmd, PROJECT_ROOT);

    expect(result.json).toBeTruthy();
    expect(result.json.status).toBe('success');
    expect(result.json.stage).toBe('build-exec');
    expect(result.json.summary).toBeTruthy();
    expect(result.json.summary.attempted).toBe(1);
    expect(result.json.summary.succeeded).toBe(1);
    expect(result.json.summary.failed).toBe(0);

    const createdFile = path.join(workspace, testFilePath);
    expect(fs.existsSync(createdFile), 'Created file should exist').toBe(true);
    const createdContent = fs.readFileSync(createdFile, 'utf-8');
    expect(createdContent).toBe(testContent);
    console.log('  File created with correct content');

    const reportPath = path.join(workspace, 'registry', 'build_exec_report.json');
    expect(fs.existsSync(reportPath), 'Report should exist').toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    expect(report.version).toBe('1.0.0');
    expect(report.producer.script).toBe('axion-build-exec');
    expect(report.dry_run).toBe(false);
    expect(report.summary.attempted).toBe(1);
    expect(report.summary.succeeded).toBe(1);
    expect(report.summary.failed).toBe(0);
    expect(report.duration_ms).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(report.ops)).toBe(true);
    expect(report.ops.length).toBe(1);
    expect(report.ops[0].op_id).toBe('op_001');
    expect(report.ops[0].status).toBe('SUCCESS');
    expect(report.ops[0].after_hash).toBeTruthy();
    console.log('  Report written and valid');

    console.log('[APPLY] Apply test passed');
  }, 120000);

  it('guard refusal: refuses without locked docs (DOCS_NOT_LOCKED)', () => {
    const workspace = ctx.build.workspace;
    const lockPath = path.join(workspace, 'registry', 'lock_manifest.json');

    const originalLock = fs.readFileSync(lockPath, 'utf-8');
    fs.unlinkSync(lockPath);

    console.log('\n[GUARD] Running build-exec --dry-run without lock_manifest.json');

    const cmd = `npx tsx ${AXION_SOURCE}/scripts/axion-build-exec.ts ` +
      `--build-root ${ctx.build.buildRoot} ` +
      `--project-name ${ctx.build.projectName} ` +
      `--dry-run ` +
      `--json`;

    const result = runCommandExpectFail(cmd, PROJECT_ROOT);

    expect(result.json).toBeTruthy();
    expect(result.json.status).toBe('blocked_by');
    expect(result.json.stage).toBe('build-exec');
    expect(result.json.reason_codes).toContain('DOCS_NOT_LOCKED');
    expect(Array.isArray(result.json.hint)).toBe(true);
    expect(result.json.hint.length).toBeGreaterThan(0);
    console.log('  status:', result.json.status);
    console.log('  reason_codes:', result.json.reason_codes);
    console.log('  hint:', result.json.hint);

    fs.writeFileSync(lockPath, originalLock);
    console.log('  Lock manifest restored');

    testPassed = true;
    console.log('[GUARD] Guard refusal test passed');
  }, 60000);
});
