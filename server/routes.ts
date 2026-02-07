import { type Express, type Request, type Response } from 'express';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { RunResult, FileEntry, FileContent, WorkspaceInfo, Assembly } from '../shared/schema.js';
import { storage } from './storage.js';

const PROJECT_ROOT = process.cwd();
const AXION_ROOT = path.join(PROJECT_ROOT, 'axion');

const EXCLUDED_ROOT_DIRS = new Set([
  'axion', 'node_modules', '.git', '.cache', '.config', '.local',
  'tests', 'client', 'server', 'shared', 'dist', 'build',
  'attached_assets', '.replit', '.upm',
]);

function isProjectDir(name: string): boolean {
  if (EXCLUDED_ROOT_DIRS.has(name)) return false;
  if (name.startsWith('.')) return false;
  const fullPath = path.join(PROJECT_ROOT, name);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) return false;
  return fs.existsSync(path.join(fullPath, 'registry')) ||
         fs.existsSync(path.join(fullPath, 'domains')) ||
         fs.existsSync(path.join(fullPath, 'app'));
}

function getProjectPath(projectName: string): string {
  return path.join(PROJECT_ROOT, projectName);
}

interface PipelineStep {
  cmd: string;
  args: (projectName: string, buildRoot: string, body: Record<string, unknown>) => string[];
  label: string;
  cwd?: (buildRoot: string) => string;
  needsWorkspace?: boolean;
  group: 'setup' | 'docs' | 'build' | 'analysis' | 'ops';
  desc: string;
}

const pipelineSteps: Record<string, PipelineStep> = {
  'kit-create': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-kit-create.ts', '--target', br, '--project-name', pn, '--source', path.join(PROJECT_ROOT, 'axion'), '--force', '--json'],
    label: 'Kit Create',
    group: 'setup',
    desc: 'Initialize workspace',
  },
  'generate': {
    cmd: 'node',
    args: () => ['axion/scripts/axion-generate.mjs', '--all'],
    label: 'Generate',
    cwd: (br) => br,
    group: 'setup',
    desc: 'Generate doc structure',
  },
  'seed': {
    cmd: 'node',
    args: () => ['axion/scripts/axion-seed.mjs', '--all'],
    label: 'Seed',
    cwd: (br) => br,
    group: 'setup',
    desc: 'Seed baseline docs',
  },
  'draft': {
    cmd: 'node',
    args: (_pn, _br, body) => {
      const a = ['axion/scripts/axion-draft.mjs'];
      if (body.module && typeof body.module === 'string') {
        a.push('--module', body.module);
      } else {
        a.push('--all');
      }
      return a;
    },
    label: 'Draft',
    cwd: (br) => br,
    group: 'docs',
    desc: 'Draft documentation',
  },
  'review': {
    cmd: 'node',
    args: (_pn, _br, body) => {
      const a = ['axion/scripts/axion-review.mjs'];
      if (body.module && typeof body.module === 'string') {
        a.push('--module', body.module);
      } else {
        a.push('--all');
      }
      return a;
    },
    label: 'Review',
    cwd: (br) => br,
    group: 'docs',
    desc: 'Review for issues',
  },
  'verify': {
    cmd: 'node',
    args: (_pn, _br, body) => {
      const a = ['axion/scripts/axion-verify.mjs'];
      if (body.module && typeof body.module === 'string') {
        a.push('--module', body.module);
      } else {
        a.push('--all');
      }
      return a;
    },
    label: 'Verify',
    cwd: (br) => br,
    group: 'docs',
    desc: 'Verify completeness',
  },
  'lock': {
    cmd: 'node',
    args: (_pn, _br, body) => {
      const a = ['axion/scripts/axion-lock.mjs'];
      if (body.module && typeof body.module === 'string') {
        a.push('--module', body.module);
      }
      return a;
    },
    label: 'Lock',
    cwd: (br) => br,
    group: 'docs',
    desc: 'Lock for build',
  },
  'scaffold-app': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-scaffold-app.ts', '--build-root', br, '--project-name', pn, '--override', 'dev_build', '--json'],
    label: 'Scaffold App',
    group: 'build',
    desc: 'App boilerplate',
  },
  'build-plan': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-build-plan.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'Build Plan',
    group: 'build',
    desc: 'Generate task list',
  },
  'iterate': {
    cmd: 'npx',
    args: (pn, br, body) => {
      const a = ['tsx', 'axion/scripts/axion-iterate.ts', '--build-root', br, '--project-name', pn, '--json'];
      if (body.allowApply) a.push('--allow-apply');
      return a;
    },
    label: 'Iterate',
    group: 'build',
    desc: 'Run build loop',
  },
  'test': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-test.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'Test',
    group: 'build',
    desc: 'Run workspace tests',
  },
  'activate': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-activate.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'Activate',
    group: 'build',
    desc: 'Set active build',
  },
  'import': {
    cmd: 'npx',
    args: (pn, br, body) => ['tsx', 'axion/scripts/axion-import.ts', '--source-root', String(body.sourcePath || ''), '--build-root', br, '--project-name', pn, '--json'],
    label: 'Import',
    group: 'analysis',
    desc: 'Analyze existing repo',
  },
  'reconcile': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-reconcile.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'Reconcile',
    group: 'analysis',
    desc: 'Check drift',
  },
  'doctor': {
    cmd: 'npx',
    args: () => ['tsx', 'axion/scripts/axion-doctor.ts', '--json'],
    label: 'Doctor',
    group: 'analysis',
    desc: 'System health check',
  },
  'status': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-status.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'Status',
    group: 'analysis',
    desc: 'Module status',
  },
  'next': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-next.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'Next Steps',
    group: 'analysis',
    desc: 'Recommended actions',
  },
  'docs-check': {
    cmd: 'npx',
    args: () => ['tsx', 'axion/scripts/axion-docs-check.ts', '--json'],
    label: 'Docs Check',
    group: 'analysis',
    desc: 'Check doc health',
  },
  'clean': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-clean.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'Clean',
    group: 'ops',
    desc: 'Clean artifacts',
  },
  'package': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-package.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'Package',
    group: 'ops',
    desc: 'Bundle Agent Kit',
  },
  'build': {
    cmd: 'npx',
    args: (pn, br, body) => {
      const a = ['tsx', 'axion/scripts/axion-build.ts', '--build-root', br, '--project-name', pn, '--json'];
      if (body.allowApply) a.push('--allow-apply');
      return a;
    },
    label: 'Build',
    group: 'build',
    desc: 'Execute build',
  },
  'deploy': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-deploy.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'Deploy',
    group: 'ops',
    desc: 'Deploy application',
  },
  'overhaul': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-overhaul.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'Overhaul',
    group: 'ops',
    desc: 'System overhaul',
  },
};

function tryParseJson(text: string): Record<string, unknown> | null {
  try {
    const lines = text.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    return JSON.parse(lastLine);
  } catch {
    return null;
  }
}

async function persistRunResult(stepId: string, step: PipelineStep, projectName: string, result: RunResult) {
  try {
    const parsedJson = tryParseJson(result.stdout);
    await storage.createPipelineRun({
      workspaceId: null,
      projectName,
      stepId,
      stepLabel: step.label,
      stepGroup: step.group,
      status: result.status,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
      stdout: result.stdout,
      stderr: result.stderr,
      parsedJson,
    });

    await syncWorkspaceToDb(projectName);

    if (result.status === 'success') {
      await syncModuleStatusToDb(projectName);
      await syncReportsToDb(projectName, stepId);
    }
  } catch (err) {
    console.error('Failed to persist pipeline run:', err);
  }
}

async function syncWorkspaceToDb(projectName: string) {
  const projectPath = getProjectPath(projectName);
  if (!fs.existsSync(projectPath)) return;

  await storage.upsertWorkspace({
    projectName,
    path: projectPath,
    hasManifest: fs.existsSync(path.join(projectPath, 'manifest.json')) ? 1 : 0,
    hasRegistry: fs.existsSync(path.join(projectPath, 'registry')) ? 1 : 0,
    hasDomains: fs.existsSync(path.join(projectPath, 'domains')) ? 1 : 0,
    hasApp: fs.existsSync(path.join(projectPath, 'app')) ? 1 : 0,
  });
}

async function syncModuleStatusToDb(projectName: string) {
  const projectPath = getProjectPath(projectName);
  const modules = [
    'architecture', 'systems', 'contracts', 'database', 'data',
    'auth', 'backend', 'integrations', 'state', 'frontend',
    'fullstack', 'testing', 'quality', 'security', 'devops',
    'cloud', 'devex', 'mobile', 'desktop',
  ];
  const stages = ['generate', 'seed', 'draft', 'review', 'verify', 'lock'];
  const markerDirs = [
    path.join(AXION_ROOT, 'registry'),
    path.join(projectPath, 'registry'),
  ];

  const statuses: Array<{ moduleName: string; stage: string; status: string }> = [];
  for (const mod of modules) {
    for (const stage of stages) {
      let status = 'pending';
      for (const dir of markerDirs) {
        const markerPath = path.join(dir, 'stage_markers', stage, `${mod}.json`);
        if (fs.existsSync(markerPath)) {
          try {
            const data = JSON.parse(fs.readFileSync(markerPath, 'utf-8'));
            status = data?.status === 'DONE' ? 'done' : 'partial';
          } catch {
            status = 'error';
          }
          break;
        }
      }
      statuses.push({ moduleName: mod, stage, status });
    }
  }

  await storage.bulkUpsertModuleStatuses(projectName, statuses);
}

const REPORT_FILE_MAP: Record<string, string[]> = {
  'import-report': ['import_report.json'],
  'import-facts': ['import_facts.json'],
  'reconcile': ['reconcile_report.json'],
  'iteration-state': ['iteration_state.json'],
  'build-plan': ['build_plan.json'],
  'build-exec': ['build_exec_report.json'],
  'stack-profile': ['stack_profile.json'],
  'verify': ['verify_report.json'],
  'verify-status': ['verify_status.json'],
  'test': ['test_report.json'],
  'lock-manifest': ['lock_manifest.json'],
};

const STEP_TO_REPORTS: Record<string, string[]> = {
  'kit-create': [],
  'generate': [],
  'seed': [],
  'draft': [],
  'review': [],
  'verify': ['verify', 'verify-status'],
  'lock': ['lock-manifest'],
  'scaffold-app': ['stack-profile'],
  'build-plan': ['build-plan'],
  'iterate': ['iteration-state', 'build-exec'],
  'test': ['test'],
  'activate': [],
  'import': ['import-report', 'import-facts'],
  'reconcile': ['reconcile'],
  'doctor': [],
  'status': [],
  'next': [],
  'docs-check': [],
  'clean': [],
  'package': [],
};

async function syncReportsToDb(projectName: string, stepId: string) {
  const reportTypes = STEP_TO_REPORTS[stepId] || [];
  const projectPath = getProjectPath(projectName);

  for (const reportType of reportTypes) {
    const fileNames = REPORT_FILE_MAP[reportType];
    if (!fileNames) continue;

    for (const fileName of fileNames) {
      const candidates = [
        path.join(projectPath, 'registry', fileName),
        path.join(AXION_ROOT, 'registry', fileName),
      ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            const content = fs.readFileSync(candidate, 'utf-8');
            const data = JSON.parse(content);
            await storage.createReport({
              projectName,
              reportType,
              data,
              filePath: candidate,
            });
          } catch {}
          break;
        }
      }
    }
  }
}

function runSingleStep(
  step: PipelineStep,
  args: string[],
  cwd: string,
  aborted: boolean,
  onOutput: (event: string, data: string) => void,
): Promise<RunResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    let stdout = '';
    let stderr = '';

    const child = spawn(step.cmd, args, {
      cwd,
      env: { ...process.env },
      timeout: 300000,
    });

    child.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      stdout += text;
      onOutput('stdout', text.trimEnd());
    });

    child.stderr.on('data', (data: Buffer) => {
      const text = data.toString();
      stderr += text;
      onOutput('stderr', text.trimEnd());
    });

    child.on('close', (code: number | null) => {
      resolve({
        status: code === 0 ? 'success' : 'error',
        command: step.label,
        exitCode: code ?? 1,
        stdout,
        stderr,
        durationMs: Date.now() - start,
      });
    });

    child.on('error', (err: Error) => {
      resolve({
        status: 'error',
        command: step.label,
        exitCode: 1,
        stdout,
        stderr: stderr + '\n' + err.message,
        durationMs: Date.now() - start,
      });
    });

    if (aborted) child.kill();
  });
}

export function registerRoutes(app: Express) {
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/assemblies', async (_req: Request, res: Response) => {
    try {
      const list = await storage.getAssemblies();
      const enriched = list.map(a => {
        const projectPath = a.projectName ? getProjectPath(a.projectName) : null;
        const wsExists = projectPath ? fs.existsSync(projectPath) : false;
        const hasRegistry = projectPath ? fs.existsSync(path.join(projectPath, 'registry')) : false;
        const hasDomains = projectPath ? fs.existsSync(path.join(projectPath, 'domains')) : false;
        const hasApp = projectPath ? fs.existsSync(path.join(projectPath, 'app')) : false;

        let verifyStatus = 'unknown';
        if (projectPath && hasRegistry) {
          const vPath = path.join(projectPath, 'registry', 'verify_report.json');
          if (fs.existsSync(vPath)) {
            try {
              const vr = JSON.parse(fs.readFileSync(vPath, 'utf-8'));
              verifyStatus = vr.overall_status || vr.status || 'unknown';
            } catch {}
          }
        }

        let lockEligible = verifyStatus === 'PASS';

        return {
          ...a,
          wsExists,
          hasRegistry,
          hasDomains,
          hasApp,
          verifyStatus,
          lockEligible,
        };
      });
      res.json(enriched);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch assemblies' });
    }
  });

  app.get('/api/assemblies/:id', async (req: Request, res: Response) => {
    try {
      const assembly = await storage.getAssembly(req.params.id as string);
      if (!assembly) {
        res.status(404).json({ error: 'Assembly not found' });
        return;
      }
      const projectPath = assembly.projectName ? getProjectPath(assembly.projectName) : null;
      const wsExists = projectPath ? fs.existsSync(projectPath) : false;
      const hasRegistry = projectPath ? fs.existsSync(path.join(projectPath, 'registry')) : false;
      const hasDomains = projectPath ? fs.existsSync(path.join(projectPath, 'domains')) : false;
      const hasApp = projectPath ? fs.existsSync(path.join(projectPath, 'app')) : false;

      let verifyStatus = 'unknown';
      if (projectPath && hasRegistry) {
        const vPath = path.join(projectPath, 'registry', 'verify_report.json');
        if (fs.existsSync(vPath)) {
          try {
            const vr = JSON.parse(fs.readFileSync(vPath, 'utf-8'));
            verifyStatus = vr.overall_status || vr.status || 'unknown';
          } catch {}
        }
      }

      res.json({
        ...assembly,
        wsExists,
        hasRegistry,
        hasDomains,
        hasApp,
        verifyStatus,
        lockEligible: verifyStatus === 'PASS',
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch assembly' });
    }
  });

  app.post('/api/assemblies', async (req: Request, res: Response) => {
    try {
      const { projectName, idea, preset, presetId, mode, domains, context, category } = req.body;
      if (!projectName || typeof projectName !== 'string') {
        res.status(400).json({ error: 'projectName is required' });
        return;
      }
      const slug = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      const assembly = await storage.createAssembly({
        projectName: slug,
        idea: idea || null,
        preset: preset || null,
        presetId: presetId || null,
        mode: mode || null,
        domains: domains || null,
        context: context || null,
        category: category || null,
        state: 'queued',
        step: null,
        progress: null,
        errors: null,
        kit: null,
        kitPath: null,
        logsTail: null,
        input: null,
        projectPackageId: null,
      });
      res.json(assembly);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to create assembly' });
    }
  });

  app.delete('/api/assemblies/:id', async (req: Request, res: Response) => {
    try {
      await storage.deleteAssembly(req.params.id as string);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete assembly' });
    }
  });

  const activeRuns = new Map<string, boolean>();

  app.get('/api/assemblies/:id/run/stream', async (req: Request, res: Response) => {
    const assemblyId = req.params.id;
    const assembly = await storage.getAssembly(assemblyId);
    if (!assembly) {
      res.status(404).json({ error: 'Assembly not found' });
      return;
    }
    if (!assembly.projectName) {
      res.status(400).json({ error: 'Assembly has no project name' });
      return;
    }

    if (activeRuns.get(assemblyId)) {
      res.status(409).json({ error: 'Pipeline already running for this assembly' });
      return;
    }

    const stagePlanId = resolveStagePlanId((req.query.stagePlan as string) || 'docs:full');
    const presetsData = loadPresets();
    if (!presetsData) {
      res.status(500).json({ error: 'Could not load presets.json' });
      return;
    }

    const stagePlans = presetsData.stage_plans as Record<string, { label?: string; description?: string; steps: string[] } | string[]>;
    const presets = presetsData.presets as Record<string, { label: string; modules: string[]; guards?: Record<string, boolean> }>;

    const rawPlan = stagePlans[stagePlanId];
    const stageSteps = Array.isArray(rawPlan) ? rawPlan : rawPlan?.steps;
    if (!stageSteps) {
      res.status(400).json({ error: `Unknown stage plan: ${stagePlanId}` });
      return;
    }

    const presetId = assembly.presetId || assembly.preset || 'system';
    const preset = presets[presetId] || presets['system'];
    const presetModules = preset?.modules || [];
    const presetGuards = preset?.guards || {};

    const needsInit = !fs.existsSync(getProjectPath(assembly.projectName));
    const fullSteps: string[] = [];
    if (needsInit) {
      fullSteps.push('kit-create', 'generate', 'seed');
    }
    for (const s of stageSteps) {
      if (!fullSteps.includes(s) && pipelineSteps[s]) {
        fullSteps.push(s);
      }
    }

    if (fullSteps.length === 0) {
      res.status(400).json({ error: 'No valid steps for this stage plan' });
      return;
    }

    const projectName = assembly.projectName;
    const buildRoot = PROJECT_ROOT;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    activeRuns.set(assemblyId, true);

    await storage.updateAssembly(assemblyId, {
      state: 'running',
      step: fullSteps[0],
      progress: { currentIndex: 0, totalSteps: fullSteps.length, steps: fullSteps },
    });

    res.write(`event: plan\ndata: ${JSON.stringify({ assemblyId, presetId, stagePlan: stagePlanId, steps: fullSteps, modules: presetModules, totalSteps: fullSteps.length })}\n\n`);

    let aborted = false;
    req.on('close', () => { aborted = true; activeRuns.delete(assemblyId); });

    const orchestrate = async () => {
      const allResults: RunResult[] = [];
      let verifyPassed = true;
      let lastError: string | null = null;

      for (let i = 0; i < fullSteps.length; i++) {
        if (aborted) break;
        const stepId = fullSteps[i];
        const step = pipelineSteps[stepId];

        await storage.updateAssembly(assemblyId, {
          step: stepId,
          progress: { currentIndex: i, totalSteps: fullSteps.length, steps: fullSteps, status: 'running' },
        });

        res.write(`event: step-start\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, total: fullSteps.length })}\n\n`);

        if (presetGuards.disallow_lock && stepId === 'lock') {
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: 'skipped', durationMs: 0, reason: 'disallow_lock guard' })}\n\n`);
          continue;
        }
        if (presetGuards.lock_requires_verify_pass && stepId === 'lock' && !verifyPassed) {
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: 'skipped', durationMs: 0, reason: 'verify did not pass' })}\n\n`);
          continue;
        }

        const stepBody: Record<string, unknown> = { projectName };
        if (presetModules.length > 0 && presetModules.length < 19) {
          stepBody.module = presetModules.join(',');
        }

        if (stepId === 'lock' && presetModules.length > 0) {
          const lockStart = Date.now();
          let lockSucceeded = 0;
          let lockFailed = 0;
          let lockStdout = '';
          let lockStderr = '';

          for (const mod of presetModules) {
            if (aborted) break;
            const lockBody = { ...stepBody, module: mod };
            const lockArgs = step.args(projectName, buildRoot, lockBody);
            const lockCwd = step.cwd ? step.cwd(buildRoot) : PROJECT_ROOT;

            if (!aborted) {
              res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: `Locking module: ${mod}` })}\n\n`);
            }

            const lockResult = await runSingleStep(step, lockArgs, lockCwd, aborted, (event, data) => {
              if (!aborted) res.write(`event: ${event}\ndata: ${JSON.stringify({ index: i, stepId, text: data })}\n\n`);
            });

            lockStdout += lockResult.stdout;
            lockStderr += lockResult.stderr;
            if (lockResult.status === 'success') {
              lockSucceeded++;
            } else {
              lockFailed++;
            }
          }

          const combinedResult: RunResult = {
            status: lockFailed === 0 ? 'success' : 'error',
            command: step.label,
            exitCode: lockFailed === 0 ? 0 : 1,
            stdout: lockStdout,
            stderr: lockStderr,
            durationMs: Date.now() - lockStart,
          };

          persistRunResult(stepId, step, projectName, combinedResult).catch(() => {});
          allResults.push(combinedResult);
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: combinedResult.status, exitCode: combinedResult.exitCode, durationMs: combinedResult.durationMs })}\n\n`);

          if (combinedResult.status === 'error') {
            lastError = `Lock failed for some modules`;
            break;
          }
          continue;
        }

        const args = step.args(projectName, buildRoot, stepBody);
        const cwd = step.cwd ? step.cwd(buildRoot) : PROJECT_ROOT;

        const result = await runSingleStep(step, args, cwd, aborted, (event, data) => {
          if (!aborted) res.write(`event: ${event}\ndata: ${JSON.stringify({ index: i, stepId, text: data })}\n\n`);
        });

        persistRunResult(stepId, step, projectName, result).catch(() => {});
        allResults.push(result);

        if (stepId === 'verify' && result.status !== 'success') {
          verifyPassed = false;
        }

        res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: result.status, exitCode: result.exitCode, durationMs: result.durationMs })}\n\n`);

        if (result.status === 'error') {
          lastError = `Step ${step.label} failed (exit ${result.exitCode})`;
          await storage.updateAssembly(assemblyId, {
            state: 'failed',
            step: stepId,
            errors: [lastError],
            logsTail: result.stderr.slice(-500) || result.stdout.slice(-500),
          });
          break;
        }
      }

      activeRuns.delete(assemblyId);

      if (!aborted) {
        const succeeded = allResults.filter(r => r.status === 'success').length;
        const failed = allResults.filter(r => r.status === 'error').length;
        const finalState = failed === 0 ? 'completed' : 'failed';

        await storage.updateAssembly(assemblyId, {
          state: finalState,
          step: fullSteps[fullSteps.length - 1],
          progress: { currentIndex: fullSteps.length, totalSteps: fullSteps.length, steps: fullSteps, status: finalState },
          errors: lastError ? [lastError] : null,
        });

        res.write(`event: done\ndata: ${JSON.stringify({ assemblyId, totalSteps: fullSteps.length, succeeded, failed, state: finalState })}\n\n`);
        res.end();
      }
    };

    orchestrate().catch((err) => {
      activeRuns.delete(assemblyId);
      if (!aborted) {
        storage.updateAssembly(assemblyId, { state: 'failed', errors: [err?.message || 'Unknown error'] }).catch(() => {});
        res.write(`event: error\ndata: ${JSON.stringify({ error: err?.message || 'Unknown error' })}\n\n`);
        res.end();
      }
    });
  });

  app.post('/api/assemblies/:id/export', async (req: Request, res: Response) => {
    const assembly = await storage.getAssembly(req.params.id as string);
    if (!assembly || !assembly.projectName) {
      res.status(404).json({ error: 'Assembly not found' });
      return;
    }
    const projectPath = getProjectPath(assembly.projectName);
    if (!fs.existsSync(projectPath)) {
      res.status(400).json({ error: 'Workspace does not exist' });
      return;
    }

    const step = pipelineSteps['package'];
    if (!step) {
      res.status(500).json({ error: 'Package step not registered' });
      return;
    }

    const args = step.args(assembly.projectName, PROJECT_ROOT, {});
    const result = await runCommand(step.cmd, args, 'Package');
    await persistRunResult('package', step, assembly.projectName, result);

    if (result.status === 'success') {
      await storage.updateAssembly(req.params.id, { state: 'exported' });
    }

    res.json(result);
  });

  app.get('/api/workspaces', async (_req: Request, res: Response) => {
    try {
      const dbWorkspaces = await storage.getWorkspaces();
      const wsInfos: WorkspaceInfo[] = dbWorkspaces.map(ws => ({
        path: ws.path,
        projectName: ws.projectName,
        exists: fs.existsSync(ws.path),
        hasManifest: ws.hasManifest === 1,
        hasRegistry: ws.hasRegistry === 1,
        hasDomains: ws.hasDomains === 1,
        hasApp: ws.hasApp === 1,
      }));

      const entries = fs.readdirSync(PROJECT_ROOT, { withFileTypes: true });
      const diskProjects = entries.filter(e => e.isDirectory() && isProjectDir(e.name)).map(e => e.name);
      const dbProjectNames = new Set(dbWorkspaces.map(w => w.projectName));

      for (const name of diskProjects) {
        if (!dbProjectNames.has(name)) {
          const projectPath = getProjectPath(name);
          wsInfos.push({
            path: projectPath,
            projectName: name,
            exists: true,
            hasManifest: fs.existsSync(path.join(projectPath, 'manifest.json')),
            hasRegistry: fs.existsSync(path.join(projectPath, 'registry')),
            hasDomains: fs.existsSync(path.join(projectPath, 'domains')),
            hasApp: fs.existsSync(path.join(projectPath, 'app')),
          });
          await syncWorkspaceToDb(name);
        }
      }

      res.json(wsInfos);
    } catch {
      res.json([]);
    }
  });

  app.get('/api/pipeline/steps', (_req: Request, res: Response) => {
    const stepsOut = Object.entries(pipelineSteps).map(([id, step]) => ({
      id,
      label: step.label,
      group: step.group,
      desc: step.desc,
    }));
    res.json(stepsOut);
  });

  for (const [stepId, step] of Object.entries(pipelineSteps)) {
    app.post(`/api/pipeline/${stepId}`, async (req: Request, res: Response) => {
      const { projectName } = req.body;
      if (!projectName || typeof projectName !== 'string') {
        res.status(400).json({ error: 'projectName is required' });
        return;
      }
      const buildRoot = PROJECT_ROOT;
      const args = step.args(projectName, buildRoot, req.body);
      const cwd = step.cwd ? step.cwd(buildRoot) : PROJECT_ROOT;
      const result = await runCommand(step.cmd, args, step.label, cwd);
      await persistRunResult(stepId, step, projectName, result);
      res.json(result);
    });

    app.get(`/api/pipeline/${stepId}/stream`, (req: Request, res: Response) => {
      const bodyParam = req.query.body as string;
      if (!bodyParam) {
        res.status(400).json({ error: 'body query param required' });
        return;
      }

      let body: Record<string, unknown>;
      try {
        body = JSON.parse(bodyParam);
      } catch {
        res.status(400).json({ error: 'invalid JSON in body param' });
        return;
      }

      const projectName = body.projectName as string;
      if (!projectName) {
        res.status(400).json({ error: 'projectName required in body' });
        return;
      }

      const buildRoot = PROJECT_ROOT;
      const args = step.args(projectName, buildRoot, body);
      const cwd = step.cwd ? step.cwd(buildRoot) : PROJECT_ROOT;

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });

      const start = Date.now();
      let stdout = '';
      let stderr = '';

      const child = spawn(step.cmd, args, {
        cwd,
        env: { ...process.env },
        timeout: 300000,
      });

      const sendEvent = (event: string, data: string) => {
        const lines = data.split('\n');
        for (const line of lines) {
          res.write(`event: ${event}\ndata: ${line}\n\n`);
        }
      };

      child.stdout.on('data', (data: Buffer) => {
        const text = data.toString();
        stdout += text;
        sendEvent('stdout', text.trimEnd());
      });

      child.stderr.on('data', (data: Buffer) => {
        const text = data.toString();
        stderr += text;
        sendEvent('stderr', text.trimEnd());
      });

      child.on('close', (code: number | null) => {
        const result: RunResult = {
          status: code === 0 ? 'success' : 'error',
          command: step.label,
          exitCode: code ?? 1,
          stdout,
          stderr,
          durationMs: Date.now() - start,
        };
        persistRunResult(stepId, step, projectName, result).catch(() => {});
        res.write(`event: done\ndata: ${JSON.stringify(result)}\n\n`);
        res.end();
      });

      child.on('error', (err: Error) => {
        const result: RunResult = {
          status: 'error',
          command: step.label,
          exitCode: 1,
          stdout,
          stderr: stderr + '\n' + err.message,
          durationMs: Date.now() - start,
        };
        persistRunResult(stepId, step, projectName, result).catch(() => {});
        res.write(`event: done\ndata: ${JSON.stringify(result)}\n\n`);
        res.end();
      });

      req.on('close', () => {
        child.kill();
      });
    });
  }

  // --- Presets API ---
  const PRESETS_PATH = path.join(AXION_ROOT, 'config', 'presets.json');

  const STAGE_PLAN_ALIASES: Record<string, string> = {
    'docs:scaffold': 'docs:full',
    'docs:content': 'docs:full',
    'app:bootstrap': 'app:full',
    'app:build': 'app:full',
    'app:test': 'app:full',
    'app:ship': 'system:full',
    'system:overhaul': 'system:full',
  };

  function resolveStagePlanId(id: string): string {
    return STAGE_PLAN_ALIASES[id] || id;
  }

  function loadPresets(): Record<string, unknown> | null {
    try {
      return JSON.parse(fs.readFileSync(PRESETS_PATH, 'utf-8'));
    } catch {
      return null;
    }
  }

  app.get('/api/presets', (_req: Request, res: Response) => {
    const data = loadPresets();
    if (!data) {
      res.status(404).json({ error: 'presets.json not found' });
      return;
    }
    res.json(data);
  });

  app.get('/api/preset/run/stream', (req: Request, res: Response) => {
    const bodyParam = req.query.body as string;
    if (!bodyParam) {
      res.status(400).json({ error: 'body query param required' });
      return;
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(bodyParam);
    } catch {
      res.status(400).json({ error: 'invalid JSON in body param' });
      return;
    }

    const projectName = body.projectName as string;
    const presetId = body.presetId as string;
    const stagePlanId = resolveStagePlanId(body.stagePlan as string);
    if (!projectName || !presetId || !stagePlanId) {
      res.status(400).json({ error: 'projectName, presetId, and stagePlan required' });
      return;
    }

    const presetsData = loadPresets();
    if (!presetsData) {
      res.status(404).json({ error: 'presets.json not found' });
      return;
    }

    const stagePlans = presetsData.stage_plans as Record<string, { label?: string; description?: string; steps: string[] } | string[]> | undefined;
    const presets = presetsData.presets as Record<string, { label: string; modules: string[] }> | undefined;
    if (!stagePlans || !presets) {
      res.status(500).json({ error: 'Invalid presets.json format' });
      return;
    }

    const rawPlan = stagePlans[stagePlanId];
    const stageSteps = Array.isArray(rawPlan) ? rawPlan : rawPlan?.steps;
    if (!stageSteps) {
      res.status(400).json({ error: `Unknown stage plan: ${stagePlanId}` });
      return;
    }

    const preset = presets[presetId];
    if (!preset) {
      res.status(400).json({ error: `Unknown preset: ${presetId}` });
      return;
    }

    const validSteps: string[] = [];
    const skippedSteps: string[] = [];
    for (const s of stageSteps) {
      if (pipelineSteps[s]) {
        validSteps.push(s);
      } else {
        skippedSteps.push(s);
      }
    }

    if (validSteps.length === 0) {
      res.status(400).json({ error: 'No valid pipeline steps found for this stage plan', skipped: skippedSteps });
      return;
    }

    const presetModules = preset.modules || [];
    const presetGuards = (preset as any).guards || {};

    const buildRoot = PROJECT_ROOT;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(`event: plan\ndata: ${JSON.stringify({ presetId, presetLabel: preset.label, stagePlan: stagePlanId, steps: validSteps, skippedSteps, modules: presetModules, totalSteps: validSteps.length })}\n\n`);

    let aborted = false;
    req.on('close', () => { aborted = true; });

    const runStepsSequentially = async () => {
      const allResults: RunResult[] = [];
      let verifyPassed = true;
      for (let i = 0; i < validSteps.length; i++) {
        if (aborted) break;
        const stepId = validSteps[i];
        const step = pipelineSteps[stepId];

        res.write(`event: step-start\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, total: validSteps.length })}\n\n`);

        const stepBody: Record<string, unknown> = { projectName, ...body };
        if (presetModules.length > 0 && presetModules.length < 19) {
          stepBody.module = presetModules.join(',');
        }
        if (presetGuards.disallow_lock && stepId === 'lock') {
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: 'skipped', durationMs: 0, reason: 'disallow_lock guard' })}\n\n`);
          continue;
        }
        if (presetGuards.lock_requires_verify_pass && stepId === 'lock' && !verifyPassed) {
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: 'skipped', durationMs: 0, reason: 'lock_requires_verify_pass guard: verify did not pass' })}\n\n`);
          continue;
        }

        if (stepId === 'lock' && presetModules.length > 0) {
          const lockStart = Date.now();
          let lockSucceeded = 0;
          let lockFailed = 0;
          let lockStdout = '';
          let lockStderr = '';

          for (const mod of presetModules) {
            if (aborted) break;
            const lockBody = { ...stepBody, module: mod };
            const lockArgs = step.args(projectName, buildRoot, lockBody);
            const lockCwd = step.cwd ? step.cwd(buildRoot) : PROJECT_ROOT;

            if (!aborted) {
              res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: `Locking module: ${mod}` })}\n\n`);
            }

            const lockResult = await runSingleStep(step, lockArgs, lockCwd, aborted, (event, data) => {
              if (!aborted) res.write(`event: ${event}\ndata: ${JSON.stringify({ index: i, stepId, text: data })}\n\n`);
            });

            lockStdout += lockResult.stdout;
            lockStderr += lockResult.stderr;
            if (lockResult.status === 'success') {
              lockSucceeded++;
            } else {
              lockFailed++;
              if (!aborted) {
                res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: `Lock for ${mod}: failed (exit ${lockResult.exitCode})` })}\n\n`);
              }
            }
          }

          const combinedResult: RunResult = {
            status: lockFailed === 0 ? 'success' : 'error',
            command: step.label,
            exitCode: lockFailed === 0 ? 0 : 1,
            stdout: lockStdout,
            stderr: lockStderr,
            durationMs: Date.now() - lockStart,
          };

          persistRunResult(stepId, step, projectName, combinedResult).catch(() => {});
          allResults.push(combinedResult);

          if (!aborted) {
            const reason = `${lockSucceeded} locked, ${lockFailed} failed`;
            res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: `${step.label} (${presetModules.length} modules)`, status: combinedResult.status, exitCode: combinedResult.exitCode, durationMs: combinedResult.durationMs, reason })}\n\n`);
          }

          if (combinedResult.status === 'error' && !body.continueOnError) {
            break;
          }
          continue;
        }

        const args = step.args(projectName, buildRoot, stepBody);
        const cwd = step.cwd ? step.cwd(buildRoot) : PROJECT_ROOT;

        const result = await new Promise<RunResult>((resolve) => {
          const start = Date.now();
          let stdout = '';
          let stderr = '';

          const child = spawn(step.cmd, args, {
            cwd,
            env: { ...process.env },
            timeout: 300000,
          });

          child.stdout.on('data', (data: Buffer) => {
            const text = data.toString();
            stdout += text;
            if (!aborted) {
              res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: text.trimEnd() })}\n\n`);
            }
          });

          child.stderr.on('data', (data: Buffer) => {
            const text = data.toString();
            stderr += text;
            if (!aborted) {
              res.write(`event: stderr\ndata: ${JSON.stringify({ index: i, stepId, text: text.trimEnd() })}\n\n`);
            }
          });

          child.on('close', (code: number | null) => {
            resolve({
              status: code === 0 ? 'success' : 'error',
              command: step.label,
              exitCode: code ?? 1,
              stdout,
              stderr,
              durationMs: Date.now() - start,
            });
          });

          child.on('error', (err: Error) => {
            resolve({
              status: 'error',
              command: step.label,
              exitCode: 1,
              stdout,
              stderr: stderr + '\n' + err.message,
              durationMs: Date.now() - start,
            });
          });

          if (aborted) child.kill();
        });

        persistRunResult(stepId, step, projectName, result).catch(() => {});
        allResults.push(result);

        if (stepId === 'verify' && result.status !== 'success') {
          verifyPassed = false;
        }

        if (!aborted) {
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: result.status, exitCode: result.exitCode, durationMs: result.durationMs })}\n\n`);
        }

        if (result.status === 'error' && !body.continueOnError) {
          break;
        }
      }

      if (!aborted) {
        const succeeded = allResults.filter(r => r.status === 'success').length;
        const failed = allResults.filter(r => r.status === 'error').length;
        res.write(`event: done\ndata: ${JSON.stringify({ presetId, stagePlan: stagePlanId, totalSteps: validSteps.length, succeeded, failed, results: allResults })}\n\n`);
        res.end();
      }
    };

    runStepsSequentially().catch((err) => {
      if (!aborted) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: err?.message || 'Unknown error' })}\n\n`);
        res.end();
      }
    });
  });

  app.get('/api/pipeline-runs', async (req: Request, res: Response) => {
    const projectName = req.query.projectName as string | undefined;
    const limit = parseInt(req.query.limit as string || '50', 10);
    try {
      const runs = projectName
        ? await storage.getPipelineRuns(projectName, limit)
        : await storage.getAllPipelineRuns(limit);
      res.json(runs);
    } catch (err: any) {
      console.error('Failed to fetch pipeline runs:', err?.message || err);
      res.status(500).json({ error: 'Failed to fetch pipeline runs', detail: err?.message });
    }
  });

  app.get('/api/db/status/:projectName', async (req: Request, res: Response) => {
    const projectName = req.params.projectName as string;
    try {
      const moduleStatusList = await storage.getModuleStatuses(projectName);

      const modules: Record<string, Record<string, string>> = {};
      for (const ms of moduleStatusList) {
        if (!modules[ms.moduleName]) modules[ms.moduleName] = {};
        modules[ms.moduleName][ms.stage] = ms.status;
      }

      res.json({
        projectName,
        modules,
        source: 'database',
      });
    } catch {
      res.json({ projectName, modules: {}, source: 'database' });
    }
  });

  app.get('/api/db/reports/:projectName', async (req: Request, res: Response) => {
    const projectName = req.params.projectName as string;
    const reportType = req.query.type as string | undefined;
    try {
      const reports = await storage.getReports(projectName, reportType);
      res.json(reports);
    } catch {
      res.json([]);
    }
  });

  app.get('/api/db/reports/:projectName/latest/:reportType', async (req: Request, res: Response) => {
    const projectName = req.params.projectName as string;
    const reportType = req.params.reportType as string;
    try {
      const report = await storage.getLatestReport(projectName, reportType);
      if (report) {
        res.json({ found: true, data: report.data, filePath: report.filePath, createdAt: report.createdAt });
      } else {
        res.json({ found: false, data: null });
      }
    } catch {
      res.json({ found: false, data: null });
    }
  });

  app.get('/api/reports/:projectName/:reportType', async (req: Request, res: Response) => {
    const projectName = req.params.projectName as string;
    const reportType = req.params.reportType as string;

    if (reportType === 'all') {
      const projectPath = getProjectPath(projectName);
      const registryDirs = [
        path.join(projectPath, 'registry'),
      ];
      const fileReports: Record<string, unknown> = {};
      for (const dir of registryDirs) {
        if (!fs.existsSync(dir)) continue;
        const resolved = path.resolve(dir);
        if (!resolved.startsWith(PROJECT_ROOT)) continue;
        try {
          const entries = fs.readdirSync(dir);
          for (const entry of entries) {
            if (!entry.endsWith('.json')) continue;
            const key = entry.replace('.json', '');
            if (fileReports[key]) continue;
            try {
              const content = fs.readFileSync(path.join(dir, entry), 'utf-8');
              fileReports[key] = JSON.parse(content);
            } catch {}
          }
        } catch {}
      }
      res.json(fileReports);
      return;
    }

    try {
      const dbReport = await storage.getLatestReport(projectName, reportType);
      if (dbReport) {
        res.json({ found: true, path: dbReport.filePath, data: dbReport.data, source: 'database', createdAt: dbReport.createdAt });
        return;
      }
    } catch {}

    const projectPath = getProjectPath(projectName);
    const reportPaths: Record<string, string[]> = {
      'import-report': [
        path.join(projectPath, 'registry', 'import_report.json'),
      ],
      'import-facts': [
        path.join(projectPath, 'registry', 'import_facts.json'),
      ],
      'reconcile': [
        path.join(projectPath, 'registry', 'reconcile_report.json'),
      ],
      'iteration-state': [
        path.join(projectPath, 'registry', 'iteration_state.json'),
      ],
      'build-plan': [
        path.join(projectPath, 'registry', 'build_plan.json'),
      ],
      'build-exec': [
        path.join(projectPath, 'registry', 'build_exec_report.json'),
      ],
      'stack-profile': [
        path.join(projectPath, 'registry', 'stack_profile.json'),
      ],
      'verify': [
        path.join(projectPath, 'registry', 'verify_report.json'),
        path.join(AXION_ROOT, 'registry', 'verify_report.json'),
        path.join(AXION_ROOT, 'source_docs', 'registry', 'verify_report.json'),
      ],
      'verify-status': [
        path.join(projectPath, 'registry', 'verify_status.json'),
        path.join(AXION_ROOT, 'source_docs', 'registry', 'verify_status.json'),
      ],
      'test': [
        path.join(projectPath, 'registry', 'test_report.json'),
      ],
      'active-build': [
        path.join(projectPath, 'ACTIVE_BUILD.json'),
      ],
      'lock-manifest': [
        path.join(projectPath, 'registry', 'lock_manifest.json'),
      ],
      'stage-markers': [
        path.join(AXION_ROOT, 'registry', 'stage_markers.json'),
        path.join(projectPath, 'registry', 'stage_markers.json'),
      ],
    };

    const candidates = reportPaths[reportType];
    if (!candidates) {
      res.status(400).json({ error: `Unknown report type: ${reportType}` });
      return;
    }

    for (const candidate of candidates) {
      const resolved = path.resolve(candidate);
      if (!resolved.startsWith(PROJECT_ROOT)) continue;
      if (fs.existsSync(resolved)) {
        try {
          const content = fs.readFileSync(resolved, 'utf-8');
          res.json({ found: true, path: resolved, data: JSON.parse(content), source: 'filesystem' });
          return;
        } catch {
          continue;
        }
      }
    }

    res.json({ found: false, data: null });
  });

  app.get('/api/status/:projectName', async (req: Request, res: Response) => {
    const projectName = req.params.projectName as string;
    const projectPath = getProjectPath(projectName);

    const allModules = [
      'architecture', 'systems', 'contracts', 'database', 'data',
      'auth', 'backend', 'integrations', 'state', 'frontend',
      'fullstack', 'testing', 'quality', 'security', 'devops',
      'cloud', 'devex', 'mobile', 'desktop',
    ];
    const stages = ['generate', 'seed', 'draft', 'review', 'verify', 'lock'];

    let moduleStatus: Record<string, Record<string, string>> = {};
    let statusSource = 'filesystem';

    try {
      const dbStatuses = await storage.getModuleStatuses(projectName);
      if (dbStatuses.length > 0) {
        statusSource = 'database';
        for (const ms of dbStatuses) {
          if (!moduleStatus[ms.moduleName]) moduleStatus[ms.moduleName] = {};
          moduleStatus[ms.moduleName][ms.stage] = ms.status;
        }
        for (const mod of allModules) {
          if (!moduleStatus[mod]) moduleStatus[mod] = {};
          for (const stage of stages) {
            if (!moduleStatus[mod][stage]) moduleStatus[mod][stage] = 'pending';
          }
        }
      }
    } catch {}

    if (statusSource === 'filesystem') {
      const markerDirs = [
        path.join(AXION_ROOT, 'registry'),
        path.join(projectPath, 'registry'),
      ];

      for (const mod of allModules) {
        moduleStatus[mod] = {};
        for (const stage of stages) {
          let status = 'pending';
          for (const dir of markerDirs) {
            const markerPath = path.join(dir, 'stage_markers', stage, `${mod}.json`);
            if (fs.existsSync(markerPath)) {
              try {
                const data = JSON.parse(fs.readFileSync(markerPath, 'utf-8'));
                status = data?.status === 'DONE' ? 'done' : 'partial';
              } catch {
                status = 'error';
              }
              break;
            }
          }
          moduleStatus[mod][stage] = status;
        }
      }
    }

    const registryFiles: Record<string, boolean> = {};
    const checkFiles = [
      'verify_report.json', 'verify_status.json', 'lock_manifest.json',
      'build_plan.json', 'build_exec_report.json', 'iteration_state.json',
      'stack_profile.json', 'import_report.json', 'import_facts.json',
      'reconcile_report.json', 'test_report.json',
    ];

    for (const file of checkFiles) {
      registryFiles[file] = false;
      if (fs.existsSync(path.join(projectPath, 'registry', file))) {
        registryFiles[file] = true;
      }
    }

    const activeBuildPath = path.join(projectPath, 'ACTIVE_BUILD.json');
    let activeBuild: unknown = null;
    if (fs.existsSync(activeBuildPath)) {
      try {
        activeBuild = JSON.parse(fs.readFileSync(activeBuildPath, 'utf-8'));
      } catch {}
    }

    res.json({
      projectName,
      modules: moduleStatus,
      stages,
      registryFiles,
      activeBuild,
      hasManifest: fs.existsSync(path.join(projectPath, 'manifest.json')),
      hasDomains: fs.existsSync(path.join(projectPath, 'domains')),
      hasApp: fs.existsSync(path.join(projectPath, 'app')),
      statusSource,
    });
  });

  app.get('/api/files/browse', (req: Request, res: Response) => {
    const dirPath = req.query.path as string;
    if (!dirPath) { res.status(400).json({ error: 'path required' }); return; }

    const resolved = path.resolve(dirPath);
    if (!resolved.startsWith(PROJECT_ROOT) || resolved === PROJECT_ROOT) {
      res.status(403).json({ error: 'Access denied: path must be within a project directory' });
      return;
    }
    const relFromRoot = path.relative(PROJECT_ROOT, resolved);
    const topDir = relFromRoot.split(path.sep)[0];
    if (EXCLUDED_ROOT_DIRS.has(topDir) || topDir.startsWith('.')) {
      res.status(403).json({ error: 'Access denied: cannot browse system directories' });
      return;
    }
    const topDirFullPath = path.join(PROJECT_ROOT, topDir);
    if (!fs.existsSync(topDirFullPath) || !fs.statSync(topDirFullPath).isDirectory()) {
      res.status(403).json({ error: 'Access denied: not a valid project directory' });
      return;
    }

    if (!fs.existsSync(resolved)) {
      res.json([]);
      return;
    }

    try {
      const entries = fs.readdirSync(resolved, { withFileTypes: true });
      const files: FileEntry[] = entries
        .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules')
        .map(e => {
          const fullPath = path.join(resolved, e.name);
          const stat = fs.statSync(fullPath);
          return {
            name: e.name,
            path: fullPath,
            type: e.isDirectory() ? 'directory' as const : 'file' as const,
            size: e.isFile() ? stat.size : undefined,
          };
        })
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      res.json(files);
    } catch {
      res.json([]);
    }
  });

  app.get('/api/files/read', (req: Request, res: Response) => {
    const filePath = req.query.path as string;
    if (!filePath) { res.status(400).json({ error: 'path required' }); return; }

    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(PROJECT_ROOT) || resolved === PROJECT_ROOT) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const relFromRoot = path.relative(PROJECT_ROOT, resolved);
    const topDir = relFromRoot.split(path.sep)[0];
    if (EXCLUDED_ROOT_DIRS.has(topDir) || topDir.startsWith('.')) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    const topDirFullPath = path.join(PROJECT_ROOT, topDir);
    if (!fs.existsSync(topDirFullPath) || !fs.statSync(topDirFullPath).isDirectory()) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    try {
      const content = fs.readFileSync(resolved, 'utf-8');
      const stat = fs.statSync(resolved);
      const result: FileContent = { path: resolved, content, size: stat.size };
      res.json(result);
    } catch {
      res.status(500).json({ error: 'Failed to read file' });
    }
  });

  app.get('/api/release-gate', (_req: Request, res: Response) => {
    const reportPath = path.join(PROJECT_ROOT, 'axion/registry/release_gate_report.json');
    if (!fs.existsSync(reportPath)) {
      res.json(null);
      return;
    }
    try {
      const content = fs.readFileSync(reportPath, 'utf-8');
      res.json(JSON.parse(content));
    } catch {
      res.json(null);
    }
  });

  app.post('/api/release-gate/run', async (_req: Request, res: Response) => {
    const result = await runCommand('npx', [
      'tsx', 'axion/scripts/axion-release-check.ts', '--json',
    ], 'release-check');
    res.json(result);
  });

  app.get('/api/modules/:projectName', (req: Request, res: Response) => {
    const projectName = req.params.projectName as string;
    const projectPath = getProjectPath(projectName);

    const discoveredModules: Array<{ name: string; hasBels: boolean; hasErc: boolean; stages: Record<string, string> }> = [];

    const domainsDir = path.join(AXION_ROOT, 'domains');
    const projectDomainsDir = path.join(projectPath, 'domains');

    const moduleDirs = new Set<string>();
    for (const dir of [domainsDir, projectDomainsDir]) {
      if (fs.existsSync(dir)) {
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
              moduleDirs.add(entry.name);
            }
          }
        } catch {}
      }
    }

    const stages = ['generate', 'seed', 'draft', 'review', 'verify', 'lock'];
    const markerDirs = [
      path.join(AXION_ROOT, 'registry'),
      path.join(projectPath, 'registry'),
    ];

    for (const mod of moduleDirs) {
      const stageStatuses: Record<string, string> = {};
      for (const stage of stages) {
        let status = 'pending';
        for (const dir of markerDirs) {
          const markerPath = path.join(dir, 'stage_markers', stage, `${mod}.json`);
          if (fs.existsSync(markerPath)) {
            try {
              const data = JSON.parse(fs.readFileSync(markerPath, 'utf-8'));
              status = data?.status === 'DONE' ? 'done' : 'partial';
            } catch {
              status = 'error';
            }
            break;
          }
        }
        stageStatuses[stage] = status;
      }

      let hasBels = false;
      let hasErc = false;
      for (const dir of [domainsDir, projectDomainsDir]) {
        const modDir = path.join(dir, mod);
        if (fs.existsSync(modDir)) {
          try {
            const files = fs.readdirSync(modDir);
            if (files.some(f => f.startsWith('BELS_'))) hasBels = true;
            if (files.some(f => f.startsWith('ERC_'))) hasErc = true;
          } catch {}
        }
      }

      discoveredModules.push({ name: mod, hasBels, hasErc, stages: stageStatuses });
    }

    discoveredModules.sort((a, b) => a.name.localeCompare(b.name));
    res.json(discoveredModules);
  });

  app.get('/api/config/:configName', (req: Request, res: Response) => {
    const configName = req.params.configName as string;
    const allowedConfigs = ['domains', 'categories', 'presets', 'sources', 'stack_profiles', 'coverage_map', 'system'];
    if (!allowedConfigs.includes(configName)) {
      res.status(400).json({ error: `Unknown config: ${configName}` });
      return;
    }
    const configPath = path.join(AXION_ROOT, 'config', `${configName}.json`);
    if (!fs.existsSync(configPath)) {
      res.json({ found: false, data: null });
      return;
    }
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      res.json({ found: true, data: JSON.parse(content) });
    } catch {
      res.json({ found: false, data: null });
    }
  });
}

function runCommand(cmd: string, args: string[], label: string, cwd?: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    let stdout = '';
    let stderr = '';

    const child = spawn(cmd, args, {
      cwd: cwd || PROJECT_ROOT,
      env: { ...process.env },
      timeout: 300000,
    });

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('close', (code: number | null) => {
      resolve({
        status: code === 0 ? 'success' : 'error',
        command: label,
        exitCode: code ?? 1,
        stdout,
        stderr,
        durationMs: Date.now() - start,
      });
    });

    child.on('error', (err: Error) => {
      resolve({
        status: 'error',
        command: label,
        exitCode: 1,
        stdout,
        stderr: stderr + '\n' + err.message,
        durationMs: Date.now() - start,
      });
    });
  });
}
