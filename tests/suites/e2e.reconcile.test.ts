import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TEST_RUNS_BASE = path.join(PROJECT_ROOT, '.axion_test_runs');
const AXION_SOURCE = path.join(PROJECT_ROOT, 'axion');

interface TestContext {
  runId: string;
  runDir: string;
  buildRoot: string;
  projectName: string;
  workspace: string;
  registryDir: string;
  cleanupOnPass: boolean;
}

function generateRunId(): string {
  return `rc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
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

function runCommandAllowFail(command: string, cwd: string): { stdout: string; json: any; exitCode: number } {
  try {
    const stdout = execSync(command, {
      cwd,
      encoding: 'utf-8',
      timeout: 120000,
      env: { ...process.env, AXION_SYSTEM_ROOT: path.join(cwd, 'axion') },
    });
    return { stdout, json: parseJsonFromOutput(stdout), exitCode: 0 };
  } catch (err: any) {
    const stdout = (err.stdout || '') + (err.stderr || '');
    return { stdout, json: parseJsonFromOutput(stdout), exitCode: err.status || 1 };
  }
}

function writeAlignedFixtures(registryDir: string): void {
  const stackProfile = {
    stack_id: 'default-web-saas',
    label: 'Default Web SaaS',
    frontend: { framework: 'react', language: 'typescript', styling: 'tailwind', state_management: 'react-query' },
    backend: { runtime: 'node', language: 'typescript', framework: 'express', api_style: 'rest' },
    database: { engine: 'postgresql', orm: 'drizzle' },
    deployment: { platform: 'replit', ci_cd: 'none' },
    conventions: {
      app_dir: 'app/',
      server_entry: 'server/index.ts',
      health_path: '/api/health',
      anchors: {
        ROUTES: '<!-- AXION:ANCHOR:ROUTES -->',
        MIDDLEWARE: '<!-- AXION:ANCHOR:MIDDLEWARE -->',
      },
    },
  };

  const importFacts = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    stack_id_candidate: 'default-web-saas',
    app_dir_candidate: 'app',
    server_entry_candidate: 'server/index.ts',
    health_path_candidate: '/api/health',
    anchor_targets: [
      { target_path: 'server/index.ts', anchors: ['SERVER_ENTRY', 'MIDDLEWARE'] },
    ],
  };

  const buildPlan = {
    generated_at: new Date().toISOString(),
    project_name: 'ReconcileTest',
    stack_id: 'default-web-saas',
    version: '1.0.0',
    phases: ['infrastructure', 'backend', 'frontend', 'testing'],
    tasks: [
      {
        id: 'task-1',
        phase: 'infrastructure',
        title: 'Setup Database Schema',
        description: 'DB setup',
        source_module: 'database',
        dependencies: [],
        files_to_create: ['shared/schema.ts'],
        acceptance_criteria: ['Schema defined'],
        status: 'pending',
      },
      {
        id: 'task-2',
        phase: 'backend',
        title: 'Implement API Routes',
        description: 'API routes',
        source_module: 'contracts',
        dependencies: ['task-1'],
        files_to_create: ['server/routes.ts'],
        acceptance_criteria: ['Routes implemented'],
        status: 'pending',
      },
    ],
    total_tasks: 2,
  };

  fs.writeFileSync(path.join(registryDir, 'stack_profile.json'), JSON.stringify(stackProfile, null, 2));
  fs.writeFileSync(path.join(registryDir, 'import_facts.json'), JSON.stringify(importFacts, null, 2));
  fs.writeFileSync(path.join(registryDir, 'build_plan.json'), JSON.stringify(buildPlan, null, 2));
}

function writeDriftFixtures(registryDir: string): void {
  const stackProfile = {
    stack_id: 'default-web-saas',
    label: 'Default Web SaaS',
    frontend: { framework: 'react', language: 'typescript', styling: 'tailwind', state_management: 'react-query' },
    backend: { runtime: 'node', language: 'typescript', framework: 'express', api_style: 'rest' },
    database: { engine: 'postgresql', orm: 'drizzle' },
    deployment: { platform: 'replit', ci_cd: 'none' },
    conventions: {
      app_dir: 'app/',
      server_entry: 'server/index.ts',
      health_path: '/api/health',
      anchors: {},
    },
  };

  const importFacts = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    stack_id_candidate: 'api-only-node',
    app_dir_candidate: 'src',
    server_entry_candidate: 'src/main.ts',
    health_path_candidate: '/healthz',
    anchor_targets: [],
  };

  const buildPlan = {
    generated_at: new Date().toISOString(),
    project_name: 'ReconcileTest',
    stack_id: 'default-web-saas',
    version: '1.0.0',
    phases: ['infrastructure', 'backend'],
    tasks: [
      {
        id: 'task-1',
        phase: 'infrastructure',
        title: 'Setup DB',
        description: 'DB setup',
        source_module: 'database',
        dependencies: [],
        files_to_create: ['shared/schema.ts'],
        acceptance_criteria: ['Schema defined'],
        status: 'pending',
      },
    ],
    total_tasks: 1,
  };

  fs.writeFileSync(path.join(registryDir, 'stack_profile.json'), JSON.stringify(stackProfile, null, 2));
  fs.writeFileSync(path.join(registryDir, 'import_facts.json'), JSON.stringify(importFacts, null, 2));
  fs.writeFileSync(path.join(registryDir, 'build_plan.json'), JSON.stringify(buildPlan, null, 2));
}

function provisionWorkspace(ctx: TestContext): void {
  const kitCreateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
    `--target ${ctx.buildRoot} ` +
    `--source ${AXION_SOURCE} ` +
    `--project-name ${ctx.projectName} ` +
    `--project-desc "Reconcile E2E test" ` +
    `--stack-profile default-web-saas ` +
    `--json`;

  const kitResult = runCommand(kitCreateCmd, PROJECT_ROOT);
  if (!kitResult.json || kitResult.json.status !== 'success') {
    throw new Error(`kit-create failed: ${JSON.stringify(kitResult.json)}`);
  }

  fs.mkdirSync(ctx.registryDir, { recursive: true });
}

describe('E2E Reconcile', () => {
  let ctx: TestContext;
  let testPassed = false;

  beforeAll(() => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });

    const runId = generateRunId();
    const runDir = path.join(TEST_RUNS_BASE, runId);
    fs.mkdirSync(runDir, { recursive: true });

    const buildRoot = path.join(runDir, 'build');
    const projectName = 'ReconcileTest';

    ctx = {
      runId,
      runDir,
      buildRoot,
      projectName,
      workspace: path.join(buildRoot, projectName),
      registryDir: path.join(buildRoot, projectName, 'registry'),
      cleanupOnPass: true,
    };

    console.log(`[RECONCILE] Run: ${ctx.runId}`);
    console.log(`[RECONCILE] Dir: ${ctx.runDir}`);

    console.log('  [PROVISION] Creating workspace via kit-create');
    provisionWorkspace(ctx);
    console.log('  [PROVISION] Ready');
  });

  afterAll(() => {
    if (testPassed && ctx.cleanupOnPass) {
      try {
        fs.rmSync(ctx.runDir, { recursive: true, force: true });
      } catch { /* ignore */ }
    } else {
      console.log(`[RECONCILE] Workspace preserved at: ${ctx.runDir}`);
    }
  });

  it('aligned facts + profile + plan produces PASS with zero critical mismatches', () => {
    console.log('\n[ALIGNED] Writing aligned fixtures');
    writeAlignedFixtures(ctx.registryDir);

    const reconcileCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-reconcile.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--json`;

    console.log('  [ALIGNED] Running reconcile');
    const result = runCommand(reconcileCmd, PROJECT_ROOT);

    expect(result.json).toBeTruthy();
    expect(result.json.status).toBe('success');
    expect(result.json.stage).toBe('reconcile');
    expect(result.json.summary).toBeTruthy();
    expect(result.json.summary.critical).toBe(0);
    console.log(`  stdout: status=${result.json.status}, critical=${result.json.summary.critical}`);

    const reportPath = path.join(ctx.registryDir, 'reconcile_report.json');
    expect(fs.existsSync(reportPath), 'reconcile_report.json should exist').toBe(true);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

    expect(report.version).toBe('1.0.0');
    expect(report.generated_at).toBeTruthy();
    expect(report.producer.script).toBe('axion-reconcile');
    expect(report.producer.revision).toBe(1);
    expect(report.status).toBe('PASS');
    expect(report.workspace_root).toBeTruthy();

    expect(report.metadata).toBeTruthy();
    expect(typeof report.metadata.docs_locked).toBe('boolean');
    expect(typeof report.metadata.docs_verified).toBe('boolean');

    expect(report.summary.critical).toBe(0);

    const criticalMismatches = report.mismatches.filter((m: any) => m.severity === 'CRITICAL');
    expect(criticalMismatches.length).toBe(0);

    expect(Array.isArray(report.next_commands)).toBe(true);
    console.log(`  report: status=${report.status}, mismatches=${report.summary.mismatches}, critical=${report.summary.critical}`);

    console.log('[ALIGNED] Aligned test passed');
  }, 120000);

  it('deliberate drift produces exact mismatch categories and reason codes', () => {
    console.log('\n[DRIFT] Writing drift fixtures');
    writeDriftFixtures(ctx.registryDir);

    const reconcileCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-reconcile.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--json`;

    console.log('  [DRIFT] Running reconcile');
    const result = runCommand(reconcileCmd, PROJECT_ROOT);

    expect(result.json).toBeTruthy();
    expect(result.json.status).toBe('success');
    expect(result.json.stage).toBe('reconcile');
    expect(result.json.summary.critical).toBeGreaterThan(0);
    console.log(`  stdout: status=${result.json.status}, critical=${result.json.summary.critical}`);

    const reportPath = path.join(ctx.registryDir, 'reconcile_report.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

    expect(report.status).toBe('FAIL');
    expect(report.summary.mismatches).toBeGreaterThan(0);
    expect(report.summary.critical).toBeGreaterThan(0);

    const stackMismatch = report.mismatches.find((m: any) => m.reason_code === 'STACK_ID_MISMATCH');
    expect(stackMismatch).toBeTruthy();
    expect(stackMismatch.category).toBe('STACK_ID');
    expect(stackMismatch.severity).toBe('CRITICAL');
    expect(stackMismatch.imported_value.stack_id).toBe('api-only-node');
    expect(stackMismatch.expected_value.stack_id).toBe('default-web-saas');
    console.log(`  STACK_ID_MISMATCH: imported=${stackMismatch.imported_value.stack_id}, expected=${stackMismatch.expected_value.stack_id}`);

    const healthMismatch = report.mismatches.find((m: any) => m.reason_code === 'HEALTH_PATH_MISMATCH');
    expect(healthMismatch).toBeTruthy();
    expect(healthMismatch.category).toBe('HEALTH_ENDPOINT');
    expect(healthMismatch.severity).toBe('CRITICAL');
    expect(healthMismatch.imported_value.health_path).toBe('/healthz');
    expect(healthMismatch.expected_value.health_path).toBe('/api/health');
    console.log(`  HEALTH_PATH_MISMATCH: imported=${healthMismatch.imported_value.health_path}, expected=${healthMismatch.expected_value.health_path}`);

    const entryMismatch = report.mismatches.find((m: any) => m.reason_code === 'SERVER_ENTRY_MISMATCH');
    expect(entryMismatch).toBeTruthy();
    expect(entryMismatch.category).toBe('ENTRYPOINTS');
    expect(entryMismatch.severity).toBe('CRITICAL');
    expect(entryMismatch.imported_value.server_entry).toBe('src/main.ts');
    expect(entryMismatch.expected_value.server_entry).toBe('server/index.ts');
    console.log(`  SERVER_ENTRY_MISMATCH: imported=${entryMismatch.imported_value.server_entry}, expected=${entryMismatch.expected_value.server_entry}`);

    const categories = report.mismatches.map((m: any) => m.category);
    expect(categories).toContain('STACK_ID');
    expect(categories).toContain('HEALTH_ENDPOINT');
    expect(categories).toContain('ENTRYPOINTS');

    for (const m of report.mismatches) {
      expect(m.id).toBeTruthy();
      expect(m.reason_code).toMatch(/^[A-Z_]+$/);
      expect(m.suggested_action).toBeTruthy();
      expect(Array.isArray(m.hints)).toBe(true);
      expect(m.hints.length).toBeGreaterThan(0);
    }

    expect(report.next_commands.length).toBeGreaterThan(0);
    console.log(`  next_commands: ${report.next_commands.length} suggestions`);

    console.log('[DRIFT] Drift test passed');
  }, 120000);

  it('missing import_facts.json emits blocked_by with exact hint commands', () => {
    console.log('\n[BLOCKED] Testing missing prerequisites');

    const factsPath = path.join(ctx.registryDir, 'import_facts.json');
    const factsBackup = factsPath + '.bak';
    if (fs.existsSync(factsPath)) {
      fs.renameSync(factsPath, factsBackup);
    }

    try {
      const reconcileCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-reconcile.ts ` +
        `--build-root ${ctx.buildRoot} ` +
        `--project-name ${ctx.projectName} ` +
        `--json`;

      const result = runCommandAllowFail(reconcileCmd, PROJECT_ROOT);
      expect(result.exitCode).not.toBe(0);

      expect(result.json).toBeTruthy();
      expect(result.json.status).toBe('blocked_by');
      expect(result.json.stage).toBe('reconcile');
      expect(result.json.reason_codes).toContain('MISSING_IMPORT_FACTS');
      console.log(`  status: ${result.json.status}, reason_codes: ${result.json.reason_codes}`);

      expect(result.json.hint).toBeTruthy();
      expect(result.json.hint.length).toBeGreaterThan(0);

      const hintText = result.json.hint.join(' ');
      expect(hintText).toContain('axion-import');
      expect(hintText).toContain('--source-root');
      expect(hintText).toContain('--build-root');
      expect(hintText).toContain('--project-name');
      console.log(`  hint includes import command: yes`);

      testPassed = true;
      console.log('[BLOCKED] Blocked prerequisite test passed');
    } finally {
      if (fs.existsSync(factsBackup)) {
        fs.renameSync(factsBackup, factsPath);
      }
    }
  }, 120000);
});
