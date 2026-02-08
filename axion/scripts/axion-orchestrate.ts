#!/usr/bin/env node
/**
 * AXION Pipeline Orchestrator
 * 
 * Standalone CLI for chaining pipeline steps with retry, gate enforcement,
 * per-module iteration, and structured JSON output.
 * 
 * This script mirrors the orchestration logic from server/routes.ts but
 * runs independently for CLI execution without the dashboard server.
 * 
 * Usage:
 *   npx tsx axion/scripts/axion-orchestrate.ts --project <name> --plan <plan-id>
 *   npx tsx axion/scripts/axion-orchestrate.ts --project <name> --plan docs:full --start-from draft
 *   npx tsx axion/scripts/axion-orchestrate.ts --project <name> --steps seed,generate,draft
 *   npx tsx axion/scripts/axion-orchestrate.ts --project <name> --plan docs:full --modules architecture,systems
 *   npx tsx axion/scripts/axion-orchestrate.ts --list-plans
 * 
 * Environment:
 *   AXION_PROJECT_IDEA       — Project idea/description
 *   AXION_PROJECT_NAME       — Project name (fallback for --project)
 *   AXION_REVISION           — Current revision number
 *   AXION_UPGRADE_NOTES      — Upgrade notes
 *   AXION_KIT_TYPE           — 'original' or 'upgrade'
 *   AXION_BUILD_ROOT         — Workspaces root directory
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { isTransientError, type ProcessResult } from './lib/retry';

const PROJECT_ROOT = process.cwd();

interface StepDef {
  id: string;
  cmd: string;
  args: (projectName: string, buildRoot: string, modules?: string[]) => string[];
  label: string;
  cwd: (buildRoot: string) => string;
  group: string;
  desc: string;
  perModule?: boolean;
  inline?: boolean;
}

interface StagePlan {
  label: string;
  description: string;
  steps: string[];
}

interface OrchestrateResult {
  plan: string;
  project: string;
  totalSteps: number;
  succeeded: number;
  failed: number;
  skipped: number;
  state: 'completed' | 'failed';
  steps: StepResult[];
  durationMs: number;
}

interface StepResult {
  stepId: string;
  label: string;
  status: 'success' | 'error' | 'skipped';
  durationMs: number;
  reason?: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
}

function findProjectRoot(): string {
  let dir = process.cwd();
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, 'axion/config/domains.json'))) return dir;
    dir = path.dirname(dir);
  }
  return process.cwd();
}

function loadPresetsFile(root: string): Record<string, unknown> | null {
  const presetsPath = path.join(root, 'axion/config/presets.json');
  try {
    return JSON.parse(fs.readFileSync(presetsPath, 'utf-8'));
  } catch {
    return null;
  }
}

const STAGE_PLAN_ALIASES: Record<string, string> = {
  'docs:scaffold': 'docs:full',
  'docs:content': 'docs:full',
  'app:bootstrap': 'app:full',
  'app:build': 'app:full',
  'app:test': 'app:full',
  'app:ship': 'system:full',
  'system:overhaul': 'system:full',
};

function resolvePlanId(id: string): string {
  return STAGE_PLAN_ALIASES[id] || id;
}

const WORKSPACES_DIR = process.env.AXION_BUILD_ROOT || path.join(findProjectRoot(), '..');

function buildStepDefs(projectRoot: string): Record<string, StepDef> {
  return {
    'kit-create': {
      id: 'kit-create',
      cmd: 'npx',
      args: (pn) => ['tsx', 'axion/scripts/axion-kit-create.ts', '--target', path.join(WORKSPACES_DIR, pn), '--project-name', pn, '--source', path.join(projectRoot, 'axion'), '--force', '--json'],
      label: 'Kit Create',
      cwd: () => projectRoot,
      group: 'setup',
      desc: 'Initialize workspace',
    },
    'generate': {
      id: 'generate',
      cmd: 'node',
      args: () => ['axion/scripts/axion-generate.mjs', '--all'],
      label: 'Generate',
      cwd: (br) => br,
      group: 'setup',
      desc: 'Generate doc structure',
    },
    'seed': {
      id: 'seed',
      cmd: 'node',
      args: () => ['axion/scripts/axion-seed.mjs', '--all'],
      label: 'Seed',
      cwd: (br) => br,
      group: 'setup',
      desc: 'Seed baseline docs',
    },
    'draft': {
      id: 'draft',
      cmd: 'node',
      args: (_pn, _br, modules) => {
        const a = ['axion/scripts/axion-draft.mjs'];
        if (modules && modules.length === 1) a.push('--module', modules[0]);
        else a.push('--all');
        return a;
      },
      label: 'Draft',
      cwd: (br) => br,
      group: 'docs',
      desc: 'Draft documentation',
      perModule: true,
    },
    'review': {
      id: 'review',
      cmd: 'node',
      args: (_pn, _br, modules) => {
        const a = ['axion/scripts/axion-review.mjs'];
        if (modules && modules.length === 1) a.push('--module', modules[0]);
        else a.push('--all');
        return a;
      },
      label: 'Review',
      cwd: (br) => br,
      group: 'docs',
      desc: 'Review for issues',
      perModule: true,
    },
    'verify': {
      id: 'verify',
      cmd: 'node',
      args: (_pn, _br, modules) => {
        const a = ['axion/scripts/axion-verify.mjs'];
        if (modules && modules.length === 1) a.push('--module', modules[0]);
        else a.push('--all');
        return a;
      },
      label: 'Verify',
      cwd: (br) => br,
      group: 'docs',
      desc: 'Verify completeness',
      perModule: true,
    },
    'content-fill': {
      id: 'content-fill',
      cmd: 'npx',
      args: (pn) => ['tsx', path.join(projectRoot, 'axion/scripts/axion-content-fill.ts'), '--project', pn, '--fill'],
      label: 'Content Fill',
      cwd: (br) => br,
      group: 'docs',
      desc: 'AI-fill UNKNOWN placeholders',
      inline: true,
    },
    'lock': {
      id: 'lock',
      cmd: 'node',
      args: (_pn, _br, modules) => {
        const a = ['axion/scripts/axion-lock.mjs'];
        if (modules && modules.length === 1) a.push('--module', modules[0]);
        return a;
      },
      label: 'Lock',
      cwd: (br) => br,
      group: 'docs',
      desc: 'Lock for build',
      perModule: true,
    },
    'scaffold-app': {
      id: 'scaffold-app',
      cmd: 'npx',
      args: (_pn, br) => ['tsx', path.join(projectRoot, 'axion/scripts/axion-scaffold-app.ts'), '--output', path.join(br, 'app'), '--override', 'dev_build', '--json'],
      label: 'Scaffold App',
      cwd: () => projectRoot,
      group: 'build',
      desc: 'App boilerplate',
    },
    'build-plan': {
      id: 'build-plan',
      cmd: 'npx',
      args: (pn) => ['tsx', path.join(projectRoot, 'axion/scripts/axion-build-plan.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
      label: 'Build Plan',
      cwd: () => projectRoot,
      group: 'build',
      desc: 'Generate task list',
    },
    'build-exec': {
      id: 'build-exec',
      cmd: 'npx',
      args: (pn) => ['tsx', path.join(projectRoot, 'axion/scripts/axion-build-exec.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
      label: 'Build Exec',
      cwd: () => projectRoot,
      group: 'build',
      desc: 'Execute build plan',
    },
    'test': {
      id: 'test',
      cmd: 'npx',
      args: (pn) => ['tsx', path.join(projectRoot, 'axion/scripts/axion-test.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
      label: 'Test',
      cwd: () => projectRoot,
      group: 'build',
      desc: 'Run workspace tests',
    },
    'activate': {
      id: 'activate',
      cmd: 'npx',
      args: (pn) => ['tsx', path.join(projectRoot, 'axion/scripts/axion-activate.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
      label: 'Activate',
      cwd: () => projectRoot,
      group: 'build',
      desc: 'Set active build',
    },
    'package': {
      id: 'package',
      cmd: 'npx',
      args: (_pn, br) => ['tsx', path.join(projectRoot, 'axion/scripts/axion-package.ts'), '--build-root', br, '--mode', 'full', '--json'],
      label: 'Package',
      cwd: () => projectRoot,
      group: 'ops',
      desc: 'Package agent kit',
    },
    'clean': {
      id: 'clean',
      cmd: 'npx',
      args: (pn) => ['tsx', path.join(projectRoot, 'axion/scripts/axion-clean.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
      label: 'Clean',
      cwd: () => projectRoot,
      group: 'ops',
      desc: 'Clean artifacts',
    },
    'import': {
      id: 'import',
      cmd: 'npx',
      args: (pn) => ['tsx', path.join(projectRoot, 'axion/scripts/axion-import.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
      label: 'Import',
      cwd: () => projectRoot,
      group: 'analysis',
      desc: 'Analyze existing repo',
    },
    'reconcile': {
      id: 'reconcile',
      cmd: 'npx',
      args: (pn) => ['tsx', path.join(projectRoot, 'axion/scripts/axion-reconcile.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
      label: 'Reconcile',
      cwd: () => projectRoot,
      group: 'analysis',
      desc: 'Check drift',
    },
    'status': {
      id: 'status',
      cmd: 'npx',
      args: (pn) => ['tsx', path.join(projectRoot, 'axion/scripts/axion-status.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
      label: 'Status',
      cwd: () => projectRoot,
      group: 'analysis',
      desc: 'Module status',
    },
  };
}

function runStep(
  step: StepDef,
  projectName: string,
  buildRoot: string,
  modules?: string[],
  extraEnv?: Record<string, string>,
): Promise<ProcessResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    let stdout = '';
    let stderr = '';

    const args = step.args(projectName, buildRoot, modules);
    const cwd = step.cwd(buildRoot);

    const child: ChildProcess = spawn(step.cmd, args, {
      cwd,
      env: { ...process.env, ...(extraEnv || {}) },
      timeout: 300000,
      shell: true,
    });

    child.stdout?.on('data', (data: Buffer) => {
      const text = data.toString();
      stdout += text;
      process.stderr.write(`  [${step.label}] ${text}`);
    });

    child.stderr?.on('data', (data: Buffer) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(`  [${step.label}] ${text}`);
    });

    child.on('close', (code) => {
      resolve({
        status: code === 0 ? 'success' : 'error',
        exitCode: code ?? 1,
        stdout,
        stderr,
        durationMs: Date.now() - start,
      });
    });

    child.on('error', (err) => {
      resolve({
        status: 'error',
        exitCode: 1,
        stdout,
        stderr: stderr + '\n' + err.message,
        durationMs: Date.now() - start,
      });
    });
  });
}

async function runStepWithRetry(
  step: StepDef,
  projectName: string,
  buildRoot: string,
  modules?: string[],
  extraEnv?: Record<string, string>,
  maxRetries = 2,
  backoffMs = 1000,
): Promise<ProcessResult> {
  let lastResult: ProcessResult | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    lastResult = await runStep(step, projectName, buildRoot, modules, extraEnv);
    if (lastResult.status === 'success') return lastResult;

    if (!isTransientError(lastResult.stderr, lastResult.exitCode) || attempt >= maxRetries) {
      break;
    }

    const delay = backoffMs * Math.pow(2, attempt);
    process.stderr.write(`  [retry] ${step.label} failed with transient error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})\n`);
    await new Promise((r) => setTimeout(r, delay));
  }

  return lastResult!;
}

function getAllModulesInWorkspace(buildRoot: string): string[] {
  const domainsDir = path.join(buildRoot, 'axion', 'domains');
  if (!fs.existsSync(domainsDir)) return [];
  return fs.readdirSync(domainsDir).filter((d) => {
    const stat = fs.statSync(path.join(domainsDir, d));
    return stat.isDirectory() && !d.startsWith('.');
  });
}

function parseArgs(): {
  project: string;
  plan: string;
  steps: string[];
  modules: string[];
  startFrom: string;
  listPlans: boolean;
  dryRun: boolean;
  json: boolean;
} {
  const args = process.argv.slice(2);
  const result = {
    project: '',
    plan: '',
    steps: [] as string[],
    modules: [] as string[],
    startFrom: '',
    listPlans: false,
    dryRun: false,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--project':
        result.project = args[++i] || '';
        break;
      case '--plan':
        result.plan = args[++i] || '';
        break;
      case '--steps':
        result.steps = (args[++i] || '').split(',').filter(Boolean);
        break;
      case '--modules':
        result.modules = (args[++i] || '').split(',').filter(Boolean);
        break;
      case '--start-from':
        result.startFrom = args[++i] || '';
        break;
      case '--list-plans':
        result.listPlans = true;
        break;
      case '--dry-run':
        result.dryRun = true;
        break;
      case '--json':
        result.json = true;
        break;
    }
  }

  if (!result.project) {
    result.project = process.env.AXION_PROJECT_NAME || '';
  }

  return result;
}

async function main() {
  const opts = parseArgs();
  const projectRoot = findProjectRoot();
  const presetsData = loadPresetsFile(projectRoot);
  const stepDefs = buildStepDefs(projectRoot);

  if (opts.listPlans) {
    if (!presetsData) {
      console.error('No presets.json found');
      process.exit(1);
    }
    const plans = presetsData.stage_plans as Record<string, StagePlan>;
    if (opts.json) {
      console.log(JSON.stringify({ plans }, null, 2));
    } else {
      console.log('\nAvailable Stage Plans:');
      console.log('='.repeat(60));
      for (const [id, plan] of Object.entries(plans)) {
        console.log(`  ${id}`);
        console.log(`    Label: ${plan.label}`);
        console.log(`    Steps: ${plan.steps.join(' → ')}`);
        if (plan.description) console.log(`    Desc:  ${plan.description}`);
        console.log();
      }
    }
    process.exit(0);
  }

  if (!opts.project) {
    console.error('Error: --project <name> or AXION_PROJECT_NAME required');
    process.exit(1);
  }

  let fullSteps: string[] = [];

  if (opts.steps.length > 0) {
    fullSteps = opts.steps.filter((s) => stepDefs[s]);
    const invalid = opts.steps.filter((s) => !stepDefs[s]);
    if (invalid.length > 0) {
      process.stderr.write(`Warning: Unknown steps ignored: ${invalid.join(', ')}\n`);
    }
  } else if (opts.plan) {
    const resolvedPlan = resolvePlanId(opts.plan);
    if (!presetsData) {
      console.error('Error: presets.json not found');
      process.exit(1);
    }
    const plans = presetsData.stage_plans as Record<string, StagePlan>;
    const plan = plans[resolvedPlan];
    if (!plan) {
      console.error(`Error: Unknown plan '${resolvedPlan}'`);
      process.exit(1);
    }
    fullSteps = plan.steps.filter((s) => stepDefs[s]);
  } else {
    console.error('Error: --plan <id> or --steps <step1,step2,...> required');
    process.exit(1);
  }

  if (opts.startFrom) {
    const idx = fullSteps.indexOf(opts.startFrom);
    if (idx === -1) {
      console.error(`Error: --start-from step '${opts.startFrom}' not in plan`);
      process.exit(1);
    }
    const skippedSteps = fullSteps.slice(0, idx);
    fullSteps = fullSteps.slice(idx);
    if (skippedSteps.length > 0) {
      process.stderr.write(`Skipping already-completed steps: ${skippedSteps.join(', ')}\n`);
    }
  }

  const buildRoot = path.join(WORKSPACES_DIR, opts.project);
  const modules = opts.modules.length > 0 ? opts.modules : getAllModulesInWorkspace(buildRoot);
  const perModuleSteps = ['review', 'draft', 'verify', 'lock'];

  const upgradeEnv: Record<string, string> = {};
  if (process.env.AXION_PROJECT_IDEA) upgradeEnv.AXION_PROJECT_IDEA = process.env.AXION_PROJECT_IDEA;
  if (process.env.AXION_PROJECT_NAME) upgradeEnv.AXION_PROJECT_NAME = process.env.AXION_PROJECT_NAME;
  if (process.env.AXION_REVISION) upgradeEnv.AXION_REVISION = process.env.AXION_REVISION;
  if (process.env.AXION_UPGRADE_NOTES) upgradeEnv.AXION_UPGRADE_NOTES = process.env.AXION_UPGRADE_NOTES;
  if (process.env.AXION_KIT_TYPE) upgradeEnv.AXION_KIT_TYPE = process.env.AXION_KIT_TYPE;

  process.stderr.write(`\nAXION Pipeline Orchestrator\n`);
  process.stderr.write(`${'='.repeat(50)}\n`);
  process.stderr.write(`  Project:  ${opts.project}\n`);
  process.stderr.write(`  Plan:     ${opts.plan || 'custom'}\n`);
  process.stderr.write(`  Steps:    ${fullSteps.join(' → ')}\n`);
  process.stderr.write(`  Modules:  ${modules.length > 0 ? modules.join(', ') : '(auto-detect)'}\n`);
  if (upgradeEnv.AXION_KIT_TYPE === 'upgrade') {
    process.stderr.write(`  Mode:     UPGRADE (revision ${upgradeEnv.AXION_REVISION || '1'})\n`);
  }
  process.stderr.write(`${'='.repeat(50)}\n\n`);

  if (opts.dryRun) {
    console.log(JSON.stringify({
      dryRun: true,
      project: opts.project,
      plan: opts.plan || 'custom',
      steps: fullSteps.map((s) => ({ id: s, label: stepDefs[s]?.label, desc: stepDefs[s]?.desc })),
      modules,
    }, null, 2));
    process.exit(0);
  }

  const pipelineStart = Date.now();
  const allResults: StepResult[] = [];
  let verifyPassed = true;
  let lastError = '';

  for (let i = 0; i < fullSteps.length; i++) {
    const stepId = fullSteps[i];
    const step = stepDefs[stepId];
    if (!step) {
      allResults.push({ stepId, label: stepId, status: 'skipped', durationMs: 0, reason: 'Unknown step' });
      continue;
    }

    process.stderr.write(`[${i + 1}/${fullSteps.length}] ${step.label} — ${step.desc}\n`);

    if (stepId === 'lock' && !verifyPassed) {
      process.stderr.write(`  Skipped: verify must pass before lock\n`);
      allResults.push({ stepId, label: step.label, status: 'skipped', durationMs: 0, reason: 'Verify must pass before lock' });
      continue;
    }

    if (perModuleSteps.includes(stepId) && modules.length > 0) {
      const perModStart = Date.now();
      let modSucceeded = 0;
      let modFailed = 0;
      const failedModules: string[] = [];

      for (const mod of modules) {
        process.stderr.write(`  Module: ${mod}\n`);
        const result = await runStepWithRetry(step, opts.project, buildRoot, [mod], upgradeEnv);
        if (result.status === 'success') {
          modSucceeded++;
        } else {
          modFailed++;
          failedModules.push(mod);
        }
      }

      const perModDuration = Date.now() - perModStart;
      const status = modFailed === 0 ? 'success' as const : 'error' as const;

      if (stepId === 'verify' && modFailed > 0) {
        verifyPassed = false;
        process.stderr.write(`  Verify: ${modFailed} module(s) failed, pipeline continues (non-blocking)\n`);
        allResults.push({
          stepId, label: step.label, status: 'success', durationMs: perModDuration,
          reason: `${modSucceeded} passed, ${modFailed} failed (non-blocking): ${failedModules.join(', ')}`,
        });
        continue;
      }

      allResults.push({
        stepId, label: step.label, status, durationMs: perModDuration,
        reason: modFailed > 0 ? `Failed modules: ${failedModules.join(', ')}` : `${modSucceeded} modules processed`,
      });

      if (status === 'error') {
        lastError = `${step.label} failed for modules: ${failedModules.join(', ')}`;
        process.stderr.write(`  FAILED — stopping pipeline\n`);
        break;
      }
    } else {
      const result = await runStepWithRetry(step, opts.project, buildRoot, modules, upgradeEnv);

      allResults.push({
        stepId,
        label: step.label,
        status: result.status,
        durationMs: result.durationMs,
        exitCode: result.exitCode,
      });

      if (result.status === 'error') {
        lastError = `${step.label} failed (exit ${result.exitCode})`;
        process.stderr.write(`  FAILED — stopping pipeline\n`);
        break;
      }
    }

    process.stderr.write(`  Done (${allResults[allResults.length - 1].durationMs}ms)\n\n`);
  }

  const totalDuration = Date.now() - pipelineStart;
  const succeeded = allResults.filter((r) => r.status === 'success').length;
  const failed = allResults.filter((r) => r.status === 'error').length;
  const skipped = allResults.filter((r) => r.status === 'skipped').length;
  const state = failed === 0 ? 'completed' : 'failed';

  const result: OrchestrateResult = {
    plan: opts.plan || 'custom',
    project: opts.project,
    totalSteps: fullSteps.length,
    succeeded,
    failed,
    skipped,
    state,
    steps: allResults,
    durationMs: totalDuration,
  };

  process.stderr.write(`\n${'='.repeat(50)}\n`);
  process.stderr.write(`Pipeline ${state.toUpperCase()}\n`);
  process.stderr.write(`  Succeeded: ${succeeded}, Failed: ${failed}, Skipped: ${skipped}\n`);
  process.stderr.write(`  Duration:  ${totalDuration}ms\n`);
  if (lastError) process.stderr.write(`  Last error: ${lastError}\n`);
  process.stderr.write(`${'='.repeat(50)}\n`);

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Orchestrator fatal error:', err);
  process.exit(1);
});
