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
  fixtureRoot: string;
  buildRoot: string;
  projectName: string;
  workspace: string;
  cleanupOnPass: boolean;
}

function generateRunId(): string {
  return `im_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function hashDir(dir: string): string {
  if (!fs.existsSync(dir)) return 'NOT_EXISTS';
  const entries: string[] = [];
  function walk(d: string) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (ent.name === 'node_modules' || ent.name === '.git') continue;
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else {
        const content = fs.readFileSync(full, 'utf-8');
        entries.push(path.relative(dir, full) + ':' + crypto.createHash('sha256').update(content).digest('hex'));
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

function createFixtureRepo(fixtureRoot: string): void {
  fs.mkdirSync(fixtureRoot, { recursive: true });

  fs.writeFileSync(path.join(fixtureRoot, 'package.json'), JSON.stringify({
    name: 'fixture-express-app',
    version: '1.0.0',
    scripts: {
      dev: 'tsx server/index.ts',
      start: 'node dist/server/index.js',
      test: 'vitest run',
    },
    dependencies: {
      express: '^4.18.0',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'drizzle-orm': '^0.30.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
      vite: '^5.0.0',
      vitest: '^1.0.0',
      tailwindcss: '^3.4.0',
    },
  }, null, 2));

  fs.writeFileSync(path.join(fixtureRoot, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3 }));

  fs.mkdirSync(path.join(fixtureRoot, 'server'), { recursive: true });

  fs.writeFileSync(path.join(fixtureRoot, 'server', 'index.ts'), `
import express from 'express';

const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => console.log("Server running"));
`.trim());

  fs.writeFileSync(path.join(fixtureRoot, 'server', 'routes.ts'), `
import { Router } from 'express';

const router = Router();

router.get("/api/users", (req, res) => {
  res.json([]);
});

router.post("/api/users", (req, res) => {
  res.json({ id: 1 });
});

router.get("/api/posts", (req, res) => {
  res.json([]);
});

router.delete("/api/posts/:id", (req, res) => {
  res.json({ deleted: true });
});

export default router;
`.trim());

  fs.mkdirSync(path.join(fixtureRoot, 'client', 'src'), { recursive: true });

  fs.writeFileSync(path.join(fixtureRoot, 'client', 'src', 'App.tsx'), `
function App() {
  return <div>Hello World</div>;
}
export default App;
`.trim());

  fs.writeFileSync(path.join(fixtureRoot, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      strict: true,
    },
  }, null, 2));
}

function provisionWorkspace(ctx: TestContext): void {
  const kitCreateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
    `--target ${ctx.buildRoot} ` +
    `--source ${AXION_SOURCE} ` +
    `--project-name ${ctx.projectName} ` +
    `--project-desc "Import mode E2E test" ` +
    `--stack-profile default-web-saas ` +
    `--json`;

  const kitResult = runCommand(kitCreateCmd, PROJECT_ROOT);
  if (!kitResult.json || kitResult.json.status !== 'success') {
    throw new Error(`kit-create failed: ${JSON.stringify(kitResult.json)}`);
  }

  fs.mkdirSync(path.join(ctx.workspace, 'registry'), { recursive: true });
  fs.mkdirSync(path.join(ctx.workspace, 'domains'), { recursive: true });
}

describe('E2E Import Mode', () => {
  let ctx: TestContext;
  let testPassed = false;

  beforeAll(() => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });

    const runId = generateRunId();
    const runDir = path.join(TEST_RUNS_BASE, runId);
    fs.mkdirSync(runDir, { recursive: true });

    const fixtureRoot = path.join(runDir, 'fixture-repo');
    const buildRoot = path.join(runDir, 'build');
    const projectName = 'ImportTest';

    ctx = {
      runId,
      runDir,
      fixtureRoot,
      buildRoot,
      projectName,
      workspace: path.join(buildRoot, projectName),
      cleanupOnPass: true,
    };

    console.log(`[IMPORT-MODE] Run: ${ctx.runId}`);
    console.log(`[IMPORT-MODE] Dir: ${ctx.runDir}`);

    console.log('  [FIXTURE] Creating fixture Express+React repo');
    createFixtureRepo(ctx.fixtureRoot);

    console.log('  [PROVISION] Creating workspace via kit-create');
    provisionWorkspace(ctx);

    console.log('  [PROVISION] Ready');
  });

  afterAll(() => {
    if (testPassed && ctx.cleanupOnPass) {
      try {
        fs.rmSync(ctx.runDir, { recursive: true, force: true });
      } catch {
      }
    } else {
      console.log(`[IMPORT-MODE] Workspace preserved at: ${ctx.runDir}`);
    }
  });

  it('analyze writes import_report.json and import_facts.json with required fields', () => {
    console.log('\n[ANALYZE] Running import --analyze');

    const importCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-import.ts ` +
      `--source-root ${ctx.fixtureRoot} ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--json`;

    const result = runCommand(importCmd, PROJECT_ROOT);
    expect(result.json).toBeTruthy();
    expect(result.json.status).toBe('success');
    expect(result.json.stage).toBe('import');
    expect(result.json.stack_id_candidate).toBeTruthy();
    expect(result.json.artifacts_written).toBeTruthy();
    expect(result.json.artifacts_written.length).toBeGreaterThan(0);
    console.log(`  stdout JSON: status=${result.json.status}, stack=${result.json.stack_id_candidate}`);

    const reportPath = path.join(ctx.workspace, 'registry', 'import_report.json');
    expect(fs.existsSync(reportPath), 'import_report.json should exist').toBe(true);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

    expect(report.version).toBe('1.0.0');
    expect(report.generated_at).toBeTruthy();
    expect(report.source_root).toBeTruthy();
    expect(report.workspace_root).toBeTruthy();

    expect(report.signals).toBeTruthy();
    expect(report.signals.files_scanned).toBeGreaterThan(0);
    expect(report.signals.package_json_found).toBe(true);
    expect(report.signals.lockfile_found).toBe('npm');

    expect(report.detections).toBeTruthy();
    expect(report.detections.languages).toContain('typescript');
    expect(report.detections.framework_hints).toContain('express');
    expect(report.detections.framework_hints).toContain('react');
    expect(report.detections.stack_id_candidate).toBe('default-web-saas');
    expect(report.detections.confidence).toBeGreaterThanOrEqual(0.6);
    expect(report.detections.entrypoints.length).toBeGreaterThan(0);
    expect(report.detections.routes.length).toBeGreaterThan(0);
    expect(report.detections.health.found).toBe(true);
    expect(report.detections.health.paths.length).toBeGreaterThan(0);
    expect(report.detections.health.paths[0].path).toBe('/api/health');
    expect(Array.isArray(report.detections.anchor_suggestions)).toBe(true);
    expect(Array.isArray(report.detections.warnings)).toBe(true);
    console.log(`  report: ${report.detections.routes.length} routes, ${report.detections.entrypoints.length} entrypoints`);
    console.log(`  health: ${report.detections.health.paths[0].path}`);

    const factsPath = path.join(ctx.workspace, 'registry', 'import_facts.json');
    expect(fs.existsSync(factsPath), 'import_facts.json should exist').toBe(true);
    const facts = JSON.parse(fs.readFileSync(factsPath, 'utf-8'));

    expect(facts.version).toBe('1.0.0');
    expect(facts.generated_at).toBeTruthy();
    expect(facts.stack_id_candidate).toBe('default-web-saas');
    expect(typeof facts.app_dir_candidate).toBe('string');
    expect(typeof facts.server_entry_candidate).toBe('string');
    expect(facts.health_path_candidate).toBe('/api/health');
    expect(Array.isArray(facts.anchor_targets)).toBe(true);
    console.log(`  facts: stack=${facts.stack_id_candidate}, app_dir=${facts.app_dir_candidate}`);

    const archReadme = path.join(ctx.workspace, 'domains', 'architecture', 'README.md');
    expect(fs.existsSync(archReadme), 'architecture README.md should exist').toBe(true);
    const archContent = fs.readFileSync(archReadme, 'utf-8');
    expect(archContent).toContain('AXION:IMPORTED:SOURCE_ROOT_HASH:');
    expect(archContent).toContain('default-web-saas');
    console.log('  doc seeds: architecture README written with import marker');

    const backendReadme = path.join(ctx.workspace, 'domains', 'backend', 'README.md');
    expect(fs.existsSync(backendReadme), 'backend README.md should exist').toBe(true);
    const beContent = fs.readFileSync(backendReadme, 'utf-8');
    expect(beContent).toContain('AXION:IMPORTED:SOURCE_ROOT_HASH:');
    expect(beContent).toContain('express');
    console.log('  doc seeds: backend README written with express detection');

    const frontendReadme = path.join(ctx.workspace, 'domains', 'frontend', 'README.md');
    expect(fs.existsSync(frontendReadme), 'frontend README.md should exist').toBe(true);
    const feContent = fs.readFileSync(frontendReadme, 'utf-8');
    expect(feContent).toContain('AXION:IMPORTED:SOURCE_ROOT_HASH:');
    expect(feContent).toContain('react');
    console.log('  doc seeds: frontend README written with react detection');

    console.log('[ANALYZE] Analyze mode test passed');
  }, 120000);

  it('source repo remains unchanged after import (read-only guarantee)', () => {
    console.log('\n[READ-ONLY] Hashing fixture repo before import');

    const hashBefore = hashDir(ctx.fixtureRoot);
    console.log(`  hash before: ${hashBefore.slice(0, 16)}...`);

    const importCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-import.ts ` +
      `--source-root ${ctx.fixtureRoot} ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--emit-manifest ` +
      `--json`;

    runCommand(importCmd, PROJECT_ROOT);

    const hashAfter = hashDir(ctx.fixtureRoot);
    console.log(`  hash after:  ${hashAfter.slice(0, 16)}...`);

    expect(hashAfter).toBe(hashBefore);
    console.log('[READ-ONLY] Source repo unchanged - test passed');
  }, 120000);

  it('emit-manifest produces valid workspace-relative patch ops with anchor convention', () => {
    console.log('\n[MANIFEST] Running import --emit-manifest');

    const importCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-import.ts ` +
      `--source-root ${ctx.fixtureRoot} ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--emit-manifest ` +
      `--json`;

    const result = runCommand(importCmd, PROJECT_ROOT);
    expect(result.json).toBeTruthy();
    expect(result.json.status).toBe('success');

    const manifestPath = path.join(ctx.workspace, 'registry', 'import_patch_manifest.json');
    expect(fs.existsSync(manifestPath), 'import_patch_manifest.json should exist').toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    expect(manifest.version).toBe('1.0.0');
    expect(manifest.generated_at).toBeTruthy();
    expect(manifest.producer).toBeTruthy();
    expect(manifest.producer.script).toBe('axion-import');
    expect(manifest.workspace_root).toBeTruthy();
    expect(manifest.project_name).toBe(ctx.projectName);
    expect(manifest.source_root).toBeTruthy();
    expect(manifest.stack_id_candidate).toBeTruthy();
    expect(Array.isArray(manifest.ops)).toBe(true);
    console.log(`  manifest: ${manifest.ops.length} ops, stack=${manifest.stack_id_candidate}`);

    for (const op of manifest.ops) {
      expect(op.type).toBe('patch_file');
      expect(op.op_id).toBeTruthy();
      expect(op.target_path).toBeTruthy();

      expect(path.isAbsolute(op.target_path)).toBe(false);
      console.log(`  op ${op.op_id}: target=${op.target_path}`);

      expect(op.anchor).toBeTruthy();
      expect(op.anchor.type).toBe('marker');
      expect(op.anchor.value).toMatch(/^<!-- AXION:ANCHOR:[A-Z_]+ -->$/);

      expect(op.patch).toBeTruthy();
      expect(op.patch.mode).toBe('insert_after');
      expect(op.patch.content).toContain('<!-- AXION:ANCHOR:');
    }

    testPassed = true;
    console.log('[MANIFEST] Emit-manifest test passed');
  }, 120000);
});
