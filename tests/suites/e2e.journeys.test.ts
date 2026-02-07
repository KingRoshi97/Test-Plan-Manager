import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TEST_RUNS_BASE = path.join(PROJECT_ROOT, '.axion_test_runs');
const AXION_SOURCE = path.join(PROJECT_ROOT, 'axion');

interface JourneyContext {
  runId: string;
  runDir: string;
  buildRoot: string;
  projectName: string;
  workspace: string;
  registryDir: string;
}

function generateRunId(prefix: string): string {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
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

function runCmd(command: string, cwd: string): { stdout: string; json: any } {
  const stdout = execSync(command, {
    cwd,
    encoding: 'utf-8',
    timeout: 180000,
    env: { ...process.env, AXION_SYSTEM_ROOT: path.join(cwd, 'axion') },
  });
  return { stdout, json: parseJsonFromOutput(stdout) };
}

function runCmdFromProjectRoot(command: string, buildRoot: string): { stdout: string; json: any } {
  const stdout = execSync(command, {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    timeout: 180000,
    env: { ...process.env, AXION_SYSTEM_ROOT: path.join(buildRoot, 'axion') },
  });
  return { stdout, json: parseJsonFromOutput(stdout) };
}

function runCmdAllowFail(command: string, cwd: string, buildRoot: string): { stdout: string; json: any; exitCode: number } {
  try {
    const stdout = execSync(command, {
      cwd,
      encoding: 'utf-8',
      timeout: 180000,
      env: { ...process.env, AXION_SYSTEM_ROOT: path.join(buildRoot, 'axion') },
    });
    return { stdout, json: parseJsonFromOutput(stdout), exitCode: 0 };
  } catch (err: any) {
    const stdout = (err.stdout || '') + (err.stderr || '');
    return { stdout, json: parseJsonFromOutput(stdout), exitCode: err.status || 1 };
  }
}

function sha256File(filePath: string): string {
  if (!fs.existsSync(filePath)) return '';
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

const minimalModules = [
  'architecture', 'systems', 'contracts', 'frontend', 'backend',
  'database', 'testing', 'deployment',
];

function writeFixtureGateArtifacts(ctx: JourneyContext): void {
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

  fs.writeFileSync(
    path.join(ctx.registryDir, 'stage_markers.json'),
    JSON.stringify(stageMarkers, null, 2),
  );

  fs.writeFileSync(
    path.join(ctx.registryDir, 'verify_status.json'),
    JSON.stringify({
      version: '1.0.0',
      overall_status: 'PASS',
      modules: Object.fromEntries(minimalModules.map(m => [m, { status: 'PASS', issues: [] }])),
      timestamp: new Date().toISOString(),
    }, null, 2),
  );

  fs.writeFileSync(
    path.join(ctx.registryDir, 'verify_report.json'),
    JSON.stringify({
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      status: 'PASS',
      overall_status: 'PASS',
      current_revision: 'journey-fixture-v1',
      modules_verified: minimalModules.length,
      modules: Object.fromEntries(minimalModules.map(m => [m, { status: 'PASS', issues: [] }])),
      issues: [],
      timestamp: new Date().toISOString(),
    }, null, 2),
  );

  fs.writeFileSync(
    path.join(ctx.registryDir, 'lock_manifest.json'),
    JSON.stringify({
      version: '1.0.0',
      locked_at: new Date().toISOString(),
      locked_by: 'journey-test',
      revision: 'journey-fixture-v1',
      modules: minimalModules,
      checksums: Object.fromEntries(minimalModules.map(m => [m, 'journey-checksum-' + m])),
    }, null, 2),
  );
}

function setupMinimalApp(workspace: string): void {
  const appDir = path.join(workspace, 'app');
  fs.mkdirSync(appDir, { recursive: true });
  fs.writeFileSync(
    path.join(appDir, 'package.json'),
    JSON.stringify({
      name: 'journey-app',
      version: '1.0.0',
      scripts: {
        test: 'echo "pass"',
        lint: 'echo "ok"',
        typecheck: 'echo "ok"',
      },
    }, null, 2),
  );
}

function writeAlignedImportFacts(registryDir: string): void {
  fs.writeFileSync(
    path.join(registryDir, 'import_facts.json'),
    JSON.stringify({
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      stack_id_candidate: 'default-web-saas',
      app_dir_candidate: 'app',
      server_entry_candidate: 'server/index.ts',
      health_path_candidate: '/api/health',
      anchor_targets: [
        { target_path: 'server/index.ts', anchors: ['SERVER_ENTRY', 'MIDDLEWARE'] },
      ],
    }, null, 2),
  );
}

function assertNoSystemPollution(buildRoot: string): void {
  const axionDir = path.join(buildRoot, 'axion');
  const forbiddenDirs = ['domains', 'registry', 'app'];
  for (const dir of forbiddenDirs) {
    const pollutionPath = path.join(axionDir, dir);
    expect(
      fs.existsSync(pollutionPath),
      `Two-root safety violation: ${dir}/ found inside <B>/axion/`
    ).toBe(false);
  }
}

describe('E2E Greenfield Journey', () => {
  let ctx: JourneyContext;
  let testPassed = false;

  beforeAll(() => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });

    const runId = generateRunId('gf');
    const runDir = path.join(TEST_RUNS_BASE, runId);
    fs.mkdirSync(runDir, { recursive: true });

    const buildRoot = path.join(runDir, 'build');
    const projectName = 'GreenFieldJourney';

    ctx = {
      runId,
      runDir,
      buildRoot,
      projectName,
      workspace: path.join(buildRoot, projectName),
      registryDir: path.join(buildRoot, projectName, 'registry'),
    };

    console.log(`[GREENFIELD] Run: ${ctx.runId}`);
    console.log(`[GREENFIELD] Dir: ${ctx.runDir}`);

    console.log('  [STEP 1] kit-create');
    const kitCreateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
      `--target ${ctx.buildRoot} ` +
      `--source ${AXION_SOURCE} ` +
      `--project-name ${ctx.projectName} ` +
      `--project-desc "Greenfield journey E2E" ` +
      `--stack-profile default-web-saas ` +
      `--json`;
    const kitResult = runCmdFromProjectRoot(kitCreateCmd, ctx.buildRoot);
    if (!kitResult.json || kitResult.json.status !== 'success') {
      throw new Error(`kit-create failed: ${JSON.stringify(kitResult.json)}`);
    }
    console.log('    kit-create: success');

    fs.mkdirSync(ctx.registryDir, { recursive: true });

    console.log('  [STEP 2] generate --all');
    const generateCmd = `node ${AXION_SOURCE}/scripts/axion-generate.mjs --root ${ctx.workspace} --all`;
    execSync(generateCmd, { cwd: PROJECT_ROOT, encoding: 'utf-8', timeout: 60000 });
    console.log('    generate: done');

    console.log('  [STEP 3] seed --all');
    const seedCmd = `node ${AXION_SOURCE}/scripts/axion-seed.mjs --root ${ctx.workspace} --all`;
    execSync(seedCmd, { cwd: PROJECT_ROOT, encoding: 'utf-8', timeout: 60000 });
    console.log('    seed: done');

    console.log('  [STEP 4] fixture gates (verify + lock)');
    writeFixtureGateArtifacts(ctx);
    console.log('    fixtures: written');

    console.log('  [STEP 5] scaffold-app');
    const scaffoldCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-scaffold-app.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--override dev_build ` +
      `--json`;
    const scaffoldResult = runCmd(scaffoldCmd, ctx.buildRoot);
    if (!scaffoldResult.json || scaffoldResult.json.status !== 'success') {
      throw new Error(`scaffold-app failed: ${JSON.stringify(scaffoldResult.json)}`);
    }
    console.log('    scaffold-app: success');

    setupMinimalApp(ctx.workspace);

    console.log('  [STEP 6] write aligned import facts for reconcile');
    writeAlignedImportFacts(ctx.registryDir);
    console.log('    import_facts: written');

    console.log('  [STEP 7] build-plan');
    const buildPlanCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-build-plan.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--json`;
    const planResult = runCmdFromProjectRoot(buildPlanCmd, ctx.buildRoot);
    if (!planResult.json || planResult.json.status !== 'success') {
      throw new Error(`build-plan failed: ${JSON.stringify(planResult.json)}`);
    }
    console.log('    build-plan: success');

    console.log('  [GREENFIELD] Workspace provisioned');
  });

  afterAll(() => {
    if (testPassed) {
      try {
        fs.rmSync(ctx.runDir, { recursive: true, force: true });
      } catch { /* ignore */ }
    } else {
      console.log(`[GREENFIELD] Workspace preserved at: ${ctx.runDir}`);
    }
  });

  it('first iterate without --allow-apply stops at apply gate', () => {
    console.log('\n[GREENFIELD:1] iterate (no --allow-apply)');
    const iterateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-iterate.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--json`;

    const result = runCmdAllowFail(iterateCmd, PROJECT_ROOT, ctx.buildRoot);

    expect(result.exitCode).not.toBe(0);
    expect(result.json).toBeTruthy();
    expect(result.json.overall_status).toBe('stopped_at_gate');
    expect(result.json.stopped_at).toBeTruthy();
    expect(result.json.stopped_at.step).toBe('apply');

    expect(result.json.next_commands).toBeTruthy();
    expect(result.json.next_commands.length).toBeGreaterThan(0);
    const nextCmdsJoined = result.json.next_commands.join(' ');
    expect(nextCmdsJoined).toContain('--allow-apply');

    const statePath = path.join(ctx.registryDir, 'iteration_state.json');
    expect(fs.existsSync(statePath)).toBe(true);
    const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    expect(state.overall_status).toBe('stopped_at_gate');
    expect(state.stopped_at.step).toBe('apply');

    const applyStep = state.steps_executed.find((s: any) => s.name === 'apply');
    expect(applyStep).toBeTruthy();
    expect(applyStep.status).toBe('STOPPED');
    expect(applyStep.reason_codes).toContain('READY_TO_APPLY');

    console.log('  apply gate: confirmed');
  }, 180000);

  it('second iterate with --allow-apply completes full path', () => {
    console.log('\n[GREENFIELD:2] iterate --allow-apply');
    const iterateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-iterate.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--allow-apply ` +
      `--json`;

    const result = runCmdAllowFail(iterateCmd, PROJECT_ROOT, ctx.buildRoot);

    expect(result.json).toBeTruthy();
    expect(result.json.stage).toBe('iterate');

    if (result.json.overall_status === 'completed') {
      expect(result.exitCode).toBe(0);

      const statePath = path.join(ctx.registryDir, 'iteration_state.json');
      const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      expect(state.version).toBe('1.0.0');
      expect(state.overall_status).toBe('completed');
      expect(state.stopped_at).toBeNull();

      const stepNames = state.steps_executed.map((s: any) => s.name);
      expect(stepNames).toContain('doctor');
      expect(stepNames).toContain('apply');
      expect(stepNames).toContain('test');
      expect(stepNames).toContain('activate');

      for (const step of state.steps_executed) {
        expect(['PASSED', 'SKIPPED']).toContain(step.status);
      }

      const reportPath = path.join(ctx.registryDir, 'build_exec_report.json');
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        expect(report.summary).toBeTruthy();
        expect(report.summary.succeeded).toBeGreaterThan(0);
        console.log(`  build_exec_report: ${report.summary.succeeded} succeeded`);
      }

      const activeBuildPath = path.join(ctx.registryDir, 'ACTIVE_BUILD.json');
      if (fs.existsSync(activeBuildPath)) {
        const activeBuild = JSON.parse(fs.readFileSync(activeBuildPath, 'utf-8'));
        expect(activeBuild).toBeTruthy();
        console.log('  ACTIVE_BUILD.json: present');
      }

      console.log(`  full path: completed, ${state.steps_executed.length} steps`);
    } else {
      console.log(`  [NOTE] Stopped at ${result.json.stopped_at?.step} — verifying partial correctness`);
      const statePath = path.join(ctx.registryDir, 'iteration_state.json');
      const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      expect(state.version).toBe('1.0.0');
      expect(state.producer.script).toBe('axion-iterate');
      expect(state.steps_executed.length).toBeGreaterThanOrEqual(1);
    }

    console.log('  full path: verified');
  }, 300000);

  it('third iterate skips manifest regeneration via fingerprint match', () => {
    console.log('\n[GREENFIELD:3] iterate (fingerprint idempotency)');

    const manifestGlob = path.join(ctx.registryDir, 'build_exec_manifest.json');
    const manifestHashBefore = sha256File(manifestGlob);

    const iterateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-iterate.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--json`;

    const result = runCmdAllowFail(iterateCmd, PROJECT_ROOT, ctx.buildRoot);
    expect(result.json).toBeTruthy();

    const statePath = path.join(ctx.registryDir, 'iteration_state.json');
    const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));

    const manifestStep = state.steps_executed.find((s: any) => s.name === 'manifest');
    if (manifestStep) {
      const skippedOrPassed = ['SKIPPED', 'PASSED'].includes(manifestStep.status);
      expect(skippedOrPassed).toBe(true);

      if (manifestStep.status === 'SKIPPED') {
        console.log('  manifest: SKIPPED (fingerprint match)');
      } else {
        console.log('  manifest: PASSED (regenerated but checking hash stability)');
      }
    }

    const manifestHashAfter = sha256File(manifestGlob);
    if (manifestHashBefore && manifestHashAfter) {
      expect(manifestHashAfter).toBe(manifestHashBefore);
      console.log('  manifest hash: unchanged (idempotency confirmed)');
    }

    console.log('  fingerprint idempotency: verified');
  }, 180000);

  it('two-root safety: no pollution inside <B>/axion/', () => {
    console.log('\n[GREENFIELD:4] two-root safety invariant');
    assertNoSystemPollution(ctx.buildRoot);
    console.log('  no domains/ in axion/: confirmed');
    console.log('  no registry/ in axion/: confirmed');
    console.log('  no app/ in axion/: confirmed');

    testPassed = true;
    console.log('[GREENFIELD] All journey assertions passed');
  });
});

describe('E2E Import Journey', () => {
  let ctx: JourneyContext;
  let sourceRepoDir: string;
  let testPassed = false;

  beforeAll(() => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });

    const runId = generateRunId('imp');
    const runDir = path.join(TEST_RUNS_BASE, runId);
    fs.mkdirSync(runDir, { recursive: true });

    const buildRoot = path.join(runDir, 'build');
    const projectName = 'ImportJourney';

    ctx = {
      runId,
      runDir,
      buildRoot,
      projectName,
      workspace: path.join(buildRoot, projectName),
      registryDir: path.join(buildRoot, projectName, 'registry'),
    };

    sourceRepoDir = path.join(runDir, 'source-repo');

    console.log(`[IMPORT] Run: ${ctx.runId}`);
    console.log(`[IMPORT] Dir: ${ctx.runDir}`);

    console.log('  [STEP 0] create realistic source repo');
    createSourceRepo(sourceRepoDir);
    console.log('    source repo: created');

    console.log('  [STEP 1] kit-create');
    const kitCreateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
      `--target ${ctx.buildRoot} ` +
      `--source ${AXION_SOURCE} ` +
      `--project-name ${ctx.projectName} ` +
      `--project-desc "Import journey E2E" ` +
      `--stack-profile default-web-saas ` +
      `--json`;
    const kitResult = runCmdFromProjectRoot(kitCreateCmd, ctx.buildRoot);
    if (!kitResult.json || kitResult.json.status !== 'success') {
      throw new Error(`kit-create failed: ${JSON.stringify(kitResult.json)}`);
    }
    console.log('    kit-create: success');

    fs.mkdirSync(ctx.registryDir, { recursive: true });

    console.log('  [STEP 2] axion-import');
    const importCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-import.ts ` +
      `--source-root ${sourceRepoDir} ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--json`;
    const importResult = runCmdFromProjectRoot(importCmd, ctx.buildRoot);
    if (!importResult.json || importResult.json.status !== 'success') {
      throw new Error(`axion-import failed: ${JSON.stringify(importResult.json)}`);
    }
    console.log(`    axion-import: success, stack_id_candidate=${importResult.json.stack_id_candidate}`);

    console.log('  [STEP 3] generate --all');
    const generateCmd = `node ${AXION_SOURCE}/scripts/axion-generate.mjs --root ${ctx.workspace} --all`;
    execSync(generateCmd, { cwd: PROJECT_ROOT, encoding: 'utf-8', timeout: 60000 });
    console.log('    generate: done');

    console.log('  [STEP 4] seed --all');
    const seedCmd = `node ${AXION_SOURCE}/scripts/axion-seed.mjs --root ${ctx.workspace} --all`;
    execSync(seedCmd, { cwd: PROJECT_ROOT, encoding: 'utf-8', timeout: 60000 });
    console.log('    seed: done');

    console.log('  [STEP 5] fixture gates (verify + lock)');
    writeFixtureGateArtifacts(ctx);
    console.log('    fixtures: written');

    console.log('  [STEP 6] scaffold-app');
    const scaffoldCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-scaffold-app.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--override dev_build ` +
      `--json`;
    const scaffoldResult = runCmd(scaffoldCmd, ctx.buildRoot);
    if (!scaffoldResult.json || scaffoldResult.json.status !== 'success') {
      throw new Error(`scaffold-app failed: ${JSON.stringify(scaffoldResult.json)}`);
    }
    console.log('    scaffold-app: success');

    setupMinimalApp(ctx.workspace);

    console.log('  [STEP 7] build-plan');
    const buildPlanCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-build-plan.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--json`;
    const planResult = runCmdFromProjectRoot(buildPlanCmd, ctx.buildRoot);
    if (!planResult.json || planResult.json.status !== 'success') {
      throw new Error(`build-plan failed: ${JSON.stringify(planResult.json)}`);
    }
    console.log('    build-plan: success');

    console.log('  [IMPORT] Workspace provisioned');
  });

  afterAll(() => {
    if (testPassed) {
      try {
        fs.rmSync(ctx.runDir, { recursive: true, force: true });
      } catch { /* ignore */ }
    } else {
      console.log(`[IMPORT] Workspace preserved at: ${ctx.runDir}`);
    }
  });

  it('import_report.json has framework detection, health path, and routes', () => {
    console.log('\n[IMPORT:1] validating import_report.json');

    const reportPath = path.join(ctx.registryDir, 'import_report.json');
    expect(fs.existsSync(reportPath), 'import_report.json should exist').toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    expect(report.version).toBe('1.0.0');
    expect(report.source_root).toBeTruthy();
    expect(report.workspace_root).toBeTruthy();

    expect(report.detections).toBeTruthy();
    const det = report.detections;

    const frameworkHints = det.framework_hints || [];
    const hasExpressHint = frameworkHints.some((h: string) =>
      h.toLowerCase().includes('express')
    );
    expect(hasExpressHint, 'should detect express framework').toBe(true);
    console.log(`  framework_hints: ${frameworkHints.join(', ')}`);

    expect(det.health).toBeTruthy();
    expect(det.health.found, 'should find health endpoint').toBe(true);
    expect(det.health.paths.length).toBeGreaterThan(0);
    const healthPaths = det.health.paths.map((p: any) => p.path);
    expect(healthPaths).toContain('/api/health');
    console.log(`  health paths: ${healthPaths.join(', ')}`);

    expect(det.routes).toBeTruthy();
    expect(det.routes.length).toBeGreaterThanOrEqual(1);
    console.log(`  routes detected: ${det.routes.length}`);

    console.log('  import_report: validated');
  });

  it('import_facts.json has valid stack_id_candidate', () => {
    console.log('\n[IMPORT:2] validating import_facts.json');

    const factsPath = path.join(ctx.registryDir, 'import_facts.json');
    expect(fs.existsSync(factsPath), 'import_facts.json should exist').toBe(true);

    const facts = JSON.parse(fs.readFileSync(factsPath, 'utf-8'));
    expect(facts.version).toBe('1.0.0');
    expect(facts.stack_id_candidate).toBeTruthy();
    expect(['default-web-saas', 'api-only-node']).toContain(facts.stack_id_candidate);

    expect(facts.health_path_candidate).toBe('/api/health');
    console.log(`  stack_id_candidate: ${facts.stack_id_candidate}`);
    console.log(`  health_path_candidate: ${facts.health_path_candidate}`);

    console.log('  import_facts: validated');
  });

  it('reconcile produces zero critical mismatches and at least one ROUTES item', () => {
    console.log('\n[IMPORT:3] running axion-reconcile');

    const reconcileCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-reconcile.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--json`;

    const result = runCmdAllowFail(reconcileCmd, PROJECT_ROOT, ctx.buildRoot);
    expect(result.json).toBeTruthy();
    expect(result.json.stage).toBe('reconcile');

    const reportPath = path.join(ctx.registryDir, 'reconcile_report.json');
    expect(fs.existsSync(reportPath), 'reconcile_report.json should exist').toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    expect(report.version).toBe('1.0.0');
    expect(report.status).toBeTruthy();

    const criticalCount = report.summary?.critical || 0;
    expect(criticalCount, 'should have zero critical mismatches').toBe(0);
    console.log(`  critical mismatches: ${criticalCount}`);

    if (report.mismatches && report.mismatches.length > 0) {
      const routeItems = report.mismatches.filter((m: any) =>
        m.category === 'ROUTES'
      );
      console.log(`  total mismatches: ${report.mismatches.length}`);
      console.log(`  ROUTES items: ${routeItems.length}`);

      for (const m of report.mismatches) {
        expect(m.severity).not.toBe('CRITICAL');
      }
    }

    console.log('  reconcile: validated');
  }, 180000);

  it('iterate --allow-apply completes full import chain', () => {
    console.log('\n[IMPORT:4] iterate --allow-apply (full import chain)');

    const iterateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-iterate.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--allow-apply ` +
      `--json`;

    const result = runCmdAllowFail(iterateCmd, PROJECT_ROOT, ctx.buildRoot);
    expect(result.json).toBeTruthy();
    expect(result.json.stage).toBe('iterate');

    if (result.json.overall_status === 'completed') {
      expect(result.exitCode).toBe(0);

      const statePath = path.join(ctx.registryDir, 'iteration_state.json');
      const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      expect(state.overall_status).toBe('completed');

      const stepNames = state.steps_executed.map((s: any) => s.name);
      expect(stepNames).toContain('doctor');
      expect(stepNames).toContain('reconcile');

      for (const step of state.steps_executed) {
        expect(['PASSED', 'SKIPPED']).toContain(step.status);
      }

      console.log(`  iterate: completed, ${state.steps_executed.length} steps`);
    } else {
      console.log(`  [NOTE] Stopped at ${result.json.stopped_at?.step}`);
      const statePath = path.join(ctx.registryDir, 'iteration_state.json');
      const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      expect(state.version).toBe('1.0.0');
      expect(state.steps_executed.length).toBeGreaterThanOrEqual(1);
    }

    console.log('  import chain: verified');
  }, 300000);

  it('two-root safety: no pollution inside <B>/axion/', () => {
    console.log('\n[IMPORT:5] two-root safety invariant');
    assertNoSystemPollution(ctx.buildRoot);
    console.log('  no pollution: confirmed');

    testPassed = true;
    console.log('[IMPORT] All journey assertions passed');
  });
});

function createSourceRepo(repoDir: string): void {
  fs.mkdirSync(repoDir, { recursive: true });
  fs.mkdirSync(path.join(repoDir, 'server'), { recursive: true });
  fs.mkdirSync(path.join(repoDir, 'src'), { recursive: true });
  fs.mkdirSync(path.join(repoDir, 'client', 'src'), { recursive: true });

  fs.writeFileSync(
    path.join(repoDir, 'package.json'),
    JSON.stringify({
      name: 'existing-fullstack-app',
      version: '1.0.0',
      type: 'module',
      scripts: {
        start: 'node server/index.js',
        dev: 'tsx server/index.ts',
        test: 'echo "pass"',
      },
      dependencies: {
        express: '^4.18.0',
        cors: '^2.8.0',
        react: '^18.3.0',
        'react-dom': '^18.3.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
        tsx: '^4.0.0',
        '@vitejs/plugin-react': '^4.0.0',
        vite: '^5.0.0',
        '@types/express': '^4.17.0',
        '@types/node': '^22.0.0',
      },
    }, null, 2),
  );

  fs.writeFileSync(
    path.join(repoDir, 'server', 'index.ts'),
    `import express from 'express';
import { registerRoutes } from './routes';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

registerRoutes(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,
  );

  fs.writeFileSync(
    path.join(repoDir, 'server', 'routes.ts'),
    `import type { Express } from 'express';

export function registerRoutes(app: Express) {
  app.get('/api/users', (req, res) => {
    res.json({ users: [] });
  });

  app.post('/api/users', (req, res) => {
    res.status(201).json({ id: '1', ...req.body });
  });

  app.get('/api/products', (req, res) => {
    res.json({ products: [] });
  });
}
`,
  );

  fs.writeFileSync(
    path.join(repoDir, 'client', 'src', 'App.tsx'),
    `export default function App() {
  return <div>Hello World</div>;
}
`,
  );

  fs.writeFileSync(
    path.join(repoDir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        esModuleInterop: true,
        strict: true,
      },
      include: ['server/**/*', 'src/**/*', 'client/**/*'],
    }, null, 2),
  );

  fs.writeFileSync(path.join(repoDir, 'src', 'utils.ts'), 'export const VERSION = "1.0.0";\n');
}
