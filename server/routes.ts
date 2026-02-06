import { type Express, type Request, type Response } from 'express';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { RunResult, FileEntry, FileContent, WorkspaceInfo } from '../shared/schema.js';
import { storage } from './storage.js';

const PROJECT_ROOT = process.cwd();
const WORKSPACES_DIR = path.join(PROJECT_ROOT, 'workspaces');
const AXION_ROOT = path.join(PROJECT_ROOT, 'axion');

function ensureWorkspacesDir() {
  if (!fs.existsSync(WORKSPACES_DIR)) {
    fs.mkdirSync(WORKSPACES_DIR, { recursive: true });
  }
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
    args: (pn, _br) => ['tsx', 'axion/scripts/axion-kit-create.ts', '--target', path.join(WORKSPACES_DIR, pn), '--project-name', pn, '--source', path.join(PROJECT_ROOT, 'axion'), '--force', '--json'],
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
      } else {
        a.push('--all');
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
  const wsPath = path.join(WORKSPACES_DIR, projectName);
  if (!fs.existsSync(wsPath)) return;

  await storage.upsertWorkspace({
    projectName,
    path: wsPath,
    hasManifest: fs.existsSync(path.join(wsPath, 'manifest.json')) ? 1 : 0,
    hasRegistry: fs.existsSync(path.join(wsPath, projectName, 'registry')) ? 1 : 0,
    hasDomains: fs.existsSync(path.join(wsPath, projectName, 'domains')) ? 1 : 0,
    hasApp: fs.existsSync(path.join(wsPath, projectName, 'app')) ? 1 : 0,
  });
}

async function syncModuleStatusToDb(projectName: string) {
  const buildRoot = path.join(WORKSPACES_DIR, projectName);
  const modules = [
    'architecture', 'systems', 'contracts', 'database', 'data',
    'auth', 'backend', 'integrations', 'state', 'frontend',
    'fullstack', 'testing', 'quality', 'security', 'devops',
    'cloud', 'devex', 'mobile', 'desktop',
  ];
  const stages = ['generate', 'seed', 'draft', 'review', 'verify', 'lock'];
  const markerDirs = [
    path.join(buildRoot, 'axion', 'registry'),
    path.join(buildRoot, projectName, 'registry'),
    path.join(buildRoot, 'registry'),
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
  const buildRoot = path.join(WORKSPACES_DIR, projectName);

  for (const reportType of reportTypes) {
    const fileNames = REPORT_FILE_MAP[reportType];
    if (!fileNames) continue;

    for (const fileName of fileNames) {
      const candidates = [
        path.join(buildRoot, projectName, 'registry', fileName),
        path.join(buildRoot, 'registry', fileName),
        path.join(buildRoot, 'axion', 'registry', fileName),
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

export function registerRoutes(app: Express) {
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/workspaces', async (_req: Request, res: Response) => {
    ensureWorkspacesDir();
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

      const entries = fs.readdirSync(WORKSPACES_DIR, { withFileTypes: true });
      const diskProjects = entries.filter(e => e.isDirectory()).map(e => e.name);
      const dbProjectNames = new Set(dbWorkspaces.map(w => w.projectName));

      for (const name of diskProjects) {
        if (!dbProjectNames.has(name)) {
          const wsPath = path.join(WORKSPACES_DIR, name);
          wsInfos.push({
            path: wsPath,
            projectName: name,
            exists: true,
            hasManifest: fs.existsSync(path.join(wsPath, 'manifest.json')),
            hasRegistry: fs.existsSync(path.join(wsPath, name, 'registry')),
            hasDomains: fs.existsSync(path.join(wsPath, name, 'domains')),
            hasApp: fs.existsSync(path.join(wsPath, name, 'app')),
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
      ensureWorkspacesDir();
      const buildRoot = path.join(WORKSPACES_DIR, projectName);
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

      ensureWorkspacesDir();
      const buildRoot = path.join(WORKSPACES_DIR, projectName);
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
    const stagePlanId = body.stagePlan as string;
    if (!projectName || !presetId || !stagePlanId) {
      res.status(400).json({ error: 'projectName, presetId, and stagePlan required' });
      return;
    }

    const presetsData = loadPresets();
    if (!presetsData) {
      res.status(404).json({ error: 'presets.json not found' });
      return;
    }

    const stagePlans = presetsData.stage_plans as Record<string, string[]> | undefined;
    const presets = presetsData.presets as Record<string, { label: string; modules: string[] }> | undefined;
    if (!stagePlans || !presets) {
      res.status(500).json({ error: 'Invalid presets.json format' });
      return;
    }

    const stageSteps = stagePlans[stagePlanId];
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

    ensureWorkspacesDir();
    const buildRoot = path.join(WORKSPACES_DIR, projectName);

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
      const buildRoot = path.join(WORKSPACES_DIR, projectName);
      const registryDirs = [
        path.join(buildRoot, projectName, 'registry'),
        path.join(buildRoot, 'registry'),
      ];
      const fileReports: Record<string, unknown> = {};
      for (const dir of registryDirs) {
        if (!fs.existsSync(dir)) continue;
        const resolved = path.resolve(dir);
        if (!resolved.startsWith(WORKSPACES_DIR)) continue;
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

    const buildRoot = path.join(WORKSPACES_DIR, projectName);
    const reportPaths: Record<string, string[]> = {
      'import-report': [
        path.join(buildRoot, projectName, 'registry', 'import_report.json'),
        path.join(buildRoot, 'registry', 'import_report.json'),
      ],
      'import-facts': [
        path.join(buildRoot, projectName, 'registry', 'import_facts.json'),
        path.join(buildRoot, 'registry', 'import_facts.json'),
      ],
      'reconcile': [
        path.join(buildRoot, projectName, 'registry', 'reconcile_report.json'),
        path.join(buildRoot, 'registry', 'reconcile_report.json'),
      ],
      'iteration-state': [
        path.join(buildRoot, projectName, 'registry', 'iteration_state.json'),
        path.join(buildRoot, 'registry', 'iteration_state.json'),
      ],
      'build-plan': [
        path.join(buildRoot, projectName, 'registry', 'build_plan.json'),
        path.join(buildRoot, 'registry', 'build_plan.json'),
      ],
      'build-exec': [
        path.join(buildRoot, projectName, 'registry', 'build_exec_report.json'),
        path.join(buildRoot, 'registry', 'build_exec_report.json'),
      ],
      'stack-profile': [
        path.join(buildRoot, projectName, 'registry', 'stack_profile.json'),
        path.join(buildRoot, 'registry', 'stack_profile.json'),
      ],
      'verify': [
        path.join(buildRoot, projectName, 'registry', 'verify_report.json'),
        path.join(buildRoot, 'registry', 'verify_report.json'),
        path.join(buildRoot, 'axion', 'registry', 'verify_report.json'),
        path.join(buildRoot, 'axion', 'source_docs', 'registry', 'verify_report.json'),
      ],
      'verify-status': [
        path.join(buildRoot, projectName, 'registry', 'verify_status.json'),
        path.join(buildRoot, 'registry', 'verify_status.json'),
        path.join(buildRoot, 'axion', 'source_docs', 'registry', 'verify_status.json'),
      ],
      'test': [
        path.join(buildRoot, projectName, 'registry', 'test_report.json'),
        path.join(buildRoot, 'registry', 'test_report.json'),
      ],
      'active-build': [
        path.join(buildRoot, 'ACTIVE_BUILD.json'),
        path.join(WORKSPACES_DIR, 'ACTIVE_BUILD.json'),
      ],
      'lock-manifest': [
        path.join(buildRoot, projectName, 'registry', 'lock_manifest.json'),
        path.join(buildRoot, 'registry', 'lock_manifest.json'),
      ],
      'stage-markers': [
        path.join(buildRoot, 'axion', 'registry', 'stage_markers.json'),
        path.join(buildRoot, projectName, 'registry', 'stage_markers.json'),
        path.join(buildRoot, 'registry', 'stage_markers.json'),
      ],
    };

    const candidates = reportPaths[reportType];
    if (!candidates) {
      res.status(400).json({ error: `Unknown report type: ${reportType}` });
      return;
    }

    for (const candidate of candidates) {
      const resolved = path.resolve(candidate);
      if (!resolved.startsWith(WORKSPACES_DIR)) continue;
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
    const buildRoot = path.join(WORKSPACES_DIR, projectName);

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
        path.join(buildRoot, 'axion', 'registry'),
        path.join(buildRoot, projectName, 'registry'),
        path.join(buildRoot, 'registry'),
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
      for (const dir of [
        path.join(buildRoot, projectName, 'registry'),
        path.join(buildRoot, 'registry'),
      ]) {
        if (fs.existsSync(path.join(dir, file))) {
          registryFiles[file] = true;
          break;
        }
      }
    }

    const activeBuildPath = path.join(buildRoot, 'ACTIVE_BUILD.json');
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
      hasManifest: fs.existsSync(path.join(buildRoot, 'manifest.json')),
      hasDomains: fs.existsSync(path.join(buildRoot, projectName, 'domains')),
      hasApp: fs.existsSync(path.join(buildRoot, projectName, 'app')),
      statusSource,
    });
  });

  app.get('/api/files/browse', (req: Request, res: Response) => {
    const dirPath = req.query.path as string;
    if (!dirPath) { res.status(400).json({ error: 'path required' }); return; }

    const resolved = path.resolve(dirPath);
    if (!resolved.startsWith(WORKSPACES_DIR)) {
      res.status(403).json({ error: 'Access denied: path must be within workspaces' });
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
    if (!resolved.startsWith(WORKSPACES_DIR)) {
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
