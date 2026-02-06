import { type Express, type Request, type Response } from 'express';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { RunResult, FileEntry, FileContent, WorkspaceInfo } from '../shared/schema.js';

const PROJECT_ROOT = process.cwd();
const WORKSPACES_DIR = path.join(PROJECT_ROOT, 'workspaces');

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
}

const pipelineSteps: Record<string, PipelineStep> = {
  'kit-create': {
    cmd: 'npx',
    args: (pn, _br) => ['tsx', 'axion/scripts/axion-kit-create.ts', '--target', path.join(WORKSPACES_DIR, pn), '--project-name', pn, '--source', path.join(PROJECT_ROOT, 'axion'), '--force', '--json'],
    label: 'kit-create',
  },
  'generate': {
    cmd: 'node',
    args: () => ['axion/scripts/axion-generate.mjs', '--all'],
    label: 'generate',
    cwd: (br) => br,
  },
  'seed': {
    cmd: 'node',
    args: () => ['axion/scripts/axion-seed.mjs', '--all'],
    label: 'seed',
    cwd: (br) => br,
  },
  'scaffold-app': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-scaffold-app.ts', '--build-root', br, '--project-name', pn, '--override', 'dev_build', '--json'],
    label: 'scaffold-app',
  },
  'build-plan': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-build-plan.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'build-plan',
  },
  'iterate': {
    cmd: 'npx',
    args: (pn, br, body) => {
      const a = ['tsx', 'axion/scripts/axion-iterate.ts', '--build-root', br, '--project-name', pn, '--json'];
      if (body.allowApply) a.push('--allow-apply');
      return a;
    },
    label: 'iterate',
  },
  'import': {
    cmd: 'npx',
    args: (pn, br, body) => ['tsx', 'axion/scripts/axion-import.ts', '--source-root', String(body.sourcePath || ''), '--build-root', br, '--project-name', pn, '--json'],
    label: 'import',
  },
  'reconcile': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', 'axion/scripts/axion-reconcile.ts', '--build-root', br, '--project-name', pn, '--json'],
    label: 'reconcile',
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
