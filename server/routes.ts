import { type Express, type Request, type Response } from 'express';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { RunResult, FileEntry, FileContent, WorkspaceInfo } from '../shared/schema.js';

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
};

export function registerRoutes(app: Express) {
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/workspaces', (_req: Request, res: Response) => {
    ensureWorkspacesDir();
    try {
      const entries = fs.readdirSync(WORKSPACES_DIR, { withFileTypes: true });
      const workspaces: WorkspaceInfo[] = entries
        .filter(e => e.isDirectory())
        .map(e => {
          const wsPath = path.join(WORKSPACES_DIR, e.name);
          return {
            path: wsPath,
            projectName: e.name,
            exists: true,
            hasManifest: fs.existsSync(path.join(wsPath, 'manifest.json')),
            hasRegistry: fs.existsSync(path.join(wsPath, e.name, 'registry')),
            hasDomains: fs.existsSync(path.join(wsPath, e.name, 'domains')),
            hasApp: fs.existsSync(path.join(wsPath, e.name, 'app')),
          };
        });
      res.json(workspaces);
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
        res.write(`event: done\ndata: ${JSON.stringify(result)}\n\n`);
        res.end();
      });

      req.on('close', () => {
        child.kill();
      });
    });
  }

  app.get('/api/reports/:projectName/:reportType', (req: Request, res: Response) => {
    const projectName = req.params.projectName as string;
    const reportType = req.params.reportType as string;
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
          res.json({ found: true, path: resolved, data: JSON.parse(content) });
          return;
        } catch {
          continue;
        }
      }
    }

    res.json({ found: false, data: null });
  });

  app.get('/api/reports/:projectName/all', (req: Request, res: Response) => {
    const projectName = req.params.projectName as string;
    const buildRoot = path.join(WORKSPACES_DIR, projectName);
    const registryDirs = [
      path.join(buildRoot, projectName, 'registry'),
      path.join(buildRoot, 'registry'),
    ];

    const reports: Record<string, unknown> = {};

    for (const dir of registryDirs) {
      if (!fs.existsSync(dir)) continue;
      const resolved = path.resolve(dir);
      if (!resolved.startsWith(WORKSPACES_DIR)) continue;
      try {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          if (!entry.endsWith('.json')) continue;
          const key = entry.replace('.json', '');
          if (reports[key]) continue;
          try {
            const content = fs.readFileSync(path.join(dir, entry), 'utf-8');
            reports[key] = JSON.parse(content);
          } catch {}
        }
      } catch {}
    }

    res.json(reports);
  });

  app.get('/api/status/:projectName', (req: Request, res: Response) => {
    const projectName = req.params.projectName as string;
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

    const moduleStatus: Record<string, Record<string, string>> = {};

    for (const mod of modules) {
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
