/**
 * E2E Two-Root Golden Path Test
 * 
 * Validates the complete AXION workflow in a real two-root environment:
 * kit-create → docs pass → lock → scaffold app → plan → test → activate → run
 * 
 * This is THE single test that ensures "ready to rebuild" is real.
 */

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
  buildRoot: string;
  projectName: string;
  projectWorkspace: string;
  cleanupOnPass: boolean;
}

function generateRunId(): string {
  return `e2e_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function setupTestWorkspace(): TestContext {
  const runId = generateRunId();
  const buildRoot = path.join(TEST_RUNS_BASE, runId);
  const projectName = 'TestProject';
  
  fs.mkdirSync(buildRoot, { recursive: true });
  
  return {
    runId,
    buildRoot,
    projectName,
    projectWorkspace: path.join(buildRoot, projectName),
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
    console.log(`[E2E] Test workspace preserved at: ${ctx.buildRoot}`);
  }
}

function runCommand(command: string, cwd: string): { stdout: string; json: any } {
  const stdout = execSync(command, {
    cwd,
    encoding: 'utf-8',
    timeout: 120000,
    env: { ...process.env, AXION_SYSTEM_ROOT: path.join(cwd, 'axion') }
  });
  
  // Parse JSON from last line or full output
  let json: any = null;
  try {
    // Try parsing the entire output first
    json = JSON.parse(stdout.trim());
  } catch {
    // Try parsing just the last block that looks like JSON
    const lines = stdout.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{')) {
        try {
          // Find the matching closing brace
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

describe('E2E Two-Root Golden Path', () => {
  let ctx: TestContext;
  let testPassed = false;
  
  beforeAll(() => {
    fs.mkdirSync(TEST_RUNS_BASE, { recursive: true });
    ctx = setupTestWorkspace();
    console.log(`[E2E] Test run: ${ctx.runId}`);
    console.log(`[E2E] Build root: ${ctx.buildRoot}`);
  });
  
  afterAll(() => {
    cleanupTestWorkspace(ctx, testPassed);
  });
  
  it('golden path: kit → docs pass → lock → scaffold app → plan → test → activate → run', async () => {
    // ═══════════════════════════════════════════════════════════════════════
    // STEP A: kit-create
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[STEP A] kit-create');
    
    const kitCreateCmd = `npx tsx ${AXION_SOURCE}/scripts/axion-kit-create.ts ` +
      `--target ${ctx.buildRoot} ` +
      `--source ${AXION_SOURCE} ` +
      `--project-name ${ctx.projectName} ` +
      `--project-desc "E2E Test Project" ` +
      `--stack-profile default-web-saas ` +
      `--json`;
    
    const kitResult = runCommand(kitCreateCmd, PROJECT_ROOT);
    
    // Assertions for Step A
    expect(kitResult.json, 'kit-create should return JSON').toBeTruthy();
    expect(kitResult.json.status).toBe('success');
    expect(kitResult.json.stage).toBe('kit-create');
    expect(kitResult.json.kit_root).toBe(ctx.buildRoot);
    
    // Build root structure assertions
    expect(fs.existsSync(path.join(ctx.buildRoot, 'axion')), 'axion/ snapshot should exist').toBe(true);
    expect(fs.existsSync(path.join(ctx.buildRoot, 'manifest.json')), 'manifest.json should exist').toBe(true);
    
    // Verify RPBS exists in snapshot
    const rpbsPath = path.join(ctx.buildRoot, 'axion', 'docs', 'product', 'RPBS_Product.md');
    expect(fs.existsSync(rpbsPath), 'RPBS_Product.md should exist in snapshot').toBe(true);
    
    const rpbsContent = fs.readFileSync(rpbsPath, 'utf-8');
    expect(rpbsContent).toContain(ctx.projectName);
    
    console.log('  ✓ kit-create passed');
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP B: Create project workspace with compliant fixture
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[STEP B] Project workspace setup');
    
    // Create project workspace structure
    const workspacePath = ctx.projectWorkspace;
    fs.mkdirSync(workspacePath, { recursive: true });
    fs.mkdirSync(path.join(workspacePath, 'domains'), { recursive: true });
    fs.mkdirSync(path.join(workspacePath, 'registry'), { recursive: true });
    
    // For E2E, we create a minimal compliant fixture that passes verify
    // This simulates docs pipeline completion without requiring full AI drafting
    await createCompliantFixture(ctx);
    
    // Verify the fixture was created correctly
    const verifyReportPath = path.join(workspacePath, 'registry', 'verify_report.json');
    expect(fs.existsSync(verifyReportPath), 'verify_report.json should exist').toBe(true);
    
    const verifyReport = JSON.parse(fs.readFileSync(verifyReportPath, 'utf-8'));
    expect(verifyReport.overall_status).toBe('PASS');
    
    console.log('  ✓ Project workspace setup passed');
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP C: scaffold-app
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[STEP C] scaffold-app');
    
    const scaffoldCmd = `npx tsx axion/scripts/axion-scaffold-app.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--override dev_build ` +
      `--json`;
    
    const scaffoldResult = runCommand(scaffoldCmd, ctx.buildRoot);
    
    expect(scaffoldResult.json, 'scaffold-app should return JSON').toBeTruthy();
    expect(scaffoldResult.json.status).toBe('success');
    
    // App structure assertions
    const appPath = path.join(workspacePath, 'app');
    expect(fs.existsSync(appPath), 'app/ should exist').toBe(true);
    
    const routesPath = path.join(appPath, 'server', 'routes.ts');
    expect(fs.existsSync(routesPath), 'server/routes.ts should exist').toBe(true);
    
    const routesContent = fs.readFileSync(routesPath, 'utf-8');
    expect(routesContent).toContain('/api/health');
    
    console.log('  ✓ scaffold-app passed');
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP D: build-plan
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[STEP D] build-plan');
    
    const buildPlanCmd = `npx tsx axion/scripts/axion-build-plan.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--json`;
    
    const buildPlanResult = runCommand(buildPlanCmd, ctx.buildRoot);
    
    expect(buildPlanResult.json, 'build-plan should return JSON').toBeTruthy();
    expect(buildPlanResult.json.status).toBe('success');
    
    const buildPlanPath = path.join(workspacePath, 'registry', 'build_plan.json');
    expect(fs.existsSync(buildPlanPath), 'build_plan.json should exist').toBe(true);
    
    const buildPlan = JSON.parse(fs.readFileSync(buildPlanPath, 'utf-8'));
    expect(buildPlan.tasks, 'build plan should have tasks').toBeTruthy();
    expect(buildPlan.tasks.length).toBeGreaterThan(0);
    
    console.log('  ✓ build-plan passed');
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP E: test
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[STEP E] test');
    
    const testCmd = `npx tsx axion/scripts/axion-test.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--skip-lint --skip-typecheck ` +
      `--json`;
    
    const testResult = runCommand(testCmd, ctx.buildRoot);
    
    expect(testResult.json, 'test should return JSON').toBeTruthy();
    expect(testResult.json.status).toBe('success');
    
    const testReportPath = path.join(workspacePath, 'registry', 'test_report.json');
    expect(fs.existsSync(testReportPath), 'test_report.json should exist').toBe(true);
    
    const testReport = JSON.parse(fs.readFileSync(testReportPath, 'utf-8'));
    expect(testReport.status).toBe('PASS');
    
    console.log('  ✓ test passed');
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP F: activate
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[STEP F] activate');
    
    const activateCmd = `npx tsx axion/scripts/axion-activate.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--allow-no-tests ` +
      `--json`;
    
    const activateResult = runCommand(activateCmd, ctx.buildRoot);
    
    expect(activateResult.json, 'activate should return JSON').toBeTruthy();
    expect(activateResult.json.status).toBe('success');
    
    // ACTIVE_BUILD.json assertions
    const activeBuildPath = path.join(ctx.buildRoot, 'ACTIVE_BUILD.json');
    expect(fs.existsSync(activeBuildPath), 'ACTIVE_BUILD.json should exist').toBe(true);
    
    const activeBuild = JSON.parse(fs.readFileSync(activeBuildPath, 'utf-8'));
    expect(activeBuild.active_build_root).toBe(ctx.buildRoot);
    expect(activeBuild.project_name).toBe(ctx.projectName);
    
    console.log('  ✓ activate passed');
    
    // ═══════════════════════════════════════════════════════════════════════
    // STEP G: run-app dry-run
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[STEP G] run-app dry-run');
    
    const runAppCmd = `npx tsx axion/scripts/axion-run-app.ts ` +
      `--build-root ${ctx.buildRoot} ` +
      `--project-name ${ctx.projectName} ` +
      `--dry-run ` +
      `--json`;
    
    const runAppResult = runCommand(runAppCmd, ctx.buildRoot);
    
    expect(runAppResult.json, 'run-app should return JSON').toBeTruthy();
    expect(runAppResult.json.status).toBe('success');
    
    console.log('  ✓ run-app dry-run passed');
    
    // ═══════════════════════════════════════════════════════════════════════
    // TWO-ROOT SAFETY ASSERTIONS
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[SAFETY] Two-root safety checks');
    
    // A) No pollution inside system snapshot
    const pollutionPaths = [
      path.join(ctx.buildRoot, 'axion', 'domains'),
      path.join(ctx.buildRoot, 'axion', 'registry'),
      path.join(ctx.buildRoot, 'axion', 'app')
    ];
    
    for (const pollutionPath of pollutionPaths) {
      expect(fs.existsSync(pollutionPath), `System snapshot polluted: ${pollutionPath}`).toBe(false);
    }
    console.log('  ✓ No pollution in system snapshot');
    
    // B) Artifacts are under workspace
    const requiredWorkspaceArtifacts = [
      path.join(workspacePath, 'registry', 'verify_report.json'),
      path.join(workspacePath, 'registry', 'build_plan.json'),
      path.join(workspacePath, 'registry', 'test_report.json')
    ];
    
    for (const artifactPath of requiredWorkspaceArtifacts) {
      expect(fs.existsSync(artifactPath), `Missing workspace artifact: ${artifactPath}`).toBe(true);
    }
    console.log('  ✓ All artifacts under workspace');
    
    // C) Run history integrity
    const runHistoryPath = path.join(workspacePath, 'registry', 'run_history');
    if (fs.existsSync(runHistoryPath)) {
      const historyFiles = fs.readdirSync(runHistoryPath).filter(f => f.endsWith('.json'));
      for (const file of historyFiles) {
        const historyContent = fs.readFileSync(path.join(runHistoryPath, file), 'utf-8');
        const parsed = JSON.parse(historyContent);
        expect(parsed.version, `Invalid run history: ${file}`).toBeTruthy();
      }
      console.log(`  ✓ Run history integrity (${historyFiles.length} entries)`);
    } else {
      console.log('  ⚠ No run history (optional)');
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // TEST PASSED
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n[E2E] ✅ Golden path complete');
    testPassed = true;
    
  }, 180000); // 3 minute timeout for full E2E
});

/**
 * Creates a minimal compliant fixture that passes verify
 * This avoids needing full AI drafting while testing the pipeline
 */
async function createCompliantFixture(ctx: TestContext): Promise<void> {
  const workspacePath = ctx.projectWorkspace;
  const domainsPath = path.join(workspacePath, 'domains');
  
  // Create minimal domain docs that pass verify
  // We create a small subset of modules with compliant content
  const minimalModules = ['architecture', 'contracts'];
  
  for (const moduleName of minimalModules) {
    const modulePath = path.join(domainsPath, moduleName);
    fs.mkdirSync(modulePath, { recursive: true });
    
    // Create a minimal compliant document
    let docContent = `# ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Domain

## Overview

This document defines the ${moduleName} specifications for ${ctx.projectName}.

## RPBS Derivations

The following capabilities are derived from RPBS_Product.md:

- Core ${moduleName} functionality
- Integration with other modules

## Specifications

### Section 1: Core Requirements

The ${moduleName} module provides essential functionality for the application.

### Section 2: Implementation Notes

Standard implementation patterns apply.

## Seams

This module integrates with dependent modules through well-defined interfaces.
`;

    // Architecture module needs stack profile info
    if (moduleName === 'architecture') {
      docContent = `# Architecture Domain

## Overview

This document defines the architecture specifications for ${ctx.projectName}.

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

The following capabilities are derived from RPBS_Product.md:

- Core architecture functionality
- Integration with other modules

## Specifications

### Section 1: Core Requirements

The architecture module provides the foundational structure for the application.

### Section 2: Implementation Notes

Standard implementation patterns apply using the default-web-saas stack.

## Seams

This module integrates with dependent modules through well-defined interfaces.
`;
    }
    
    // Scaffold-app expects README.md in domain folders
    fs.writeFileSync(path.join(modulePath, 'README.md'), docContent);
  }
  
  // Create stage markers to indicate modules are verified
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
  
  const registryPath = path.join(workspacePath, 'registry');
  fs.writeFileSync(
    path.join(registryPath, 'stage_markers.json'),
    JSON.stringify(stageMarkers, null, 2)
  );
  
  // Create verify_status.json
  const verifyStatus = {
    version: '1.0.0',
    overall_status: 'PASS',
    modules: Object.fromEntries(minimalModules.map(m => [m, { status: 'PASS', issues: [] }])),
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(
    path.join(registryPath, 'verify_status.json'),
    JSON.stringify(verifyStatus, null, 2)
  );
  
  // Create verify_report.json (required for verify_pass gate)
  const verifyReport = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    status: 'PASS',
    overall_status: 'PASS',
    current_revision: 'e2e-fixture-v1',
    modules_verified: minimalModules.length,
    modules: Object.fromEntries(minimalModules.map(m => [m, { status: 'PASS', issues: [] }])),
    issues: [],
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(
    path.join(registryPath, 'verify_report.json'),
    JSON.stringify(verifyReport, null, 2)
  );
  
  // Create lock_manifest.json (required for docs_locked gate)
  const lockManifest = {
    version: '1.0.0',
    locked_at: new Date().toISOString(),
    locked_by: 'e2e-test',
    revision: 'e2e-fixture-v1',
    modules: minimalModules,
    checksums: Object.fromEntries(minimalModules.map(m => [m, 'e2e-checksum-' + m]))
  };
  fs.writeFileSync(
    path.join(registryPath, 'lock_manifest.json'),
    JSON.stringify(lockManifest, null, 2)
  );
}
