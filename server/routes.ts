import { type Express, type Request, type Response } from 'express';
import { spawn, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { RunRequest, RunResult, FileEntry, FileContent, WorkspaceInfo } from '../shared/schema.js';

const PROJECT_ROOT = process.cwd();
const WORKSPACES_DIR = path.join(PROJECT_ROOT, 'workspaces');

function getWorkspacePath(projectName: string): string {
  return path.join(WORKSPACES_DIR, projectName);
}

function ensureWorkspacesDir() {
  if (!fs.existsSync(WORKSPACES_DIR)) {
    fs.mkdirSync(WORKSPACES_DIR, { recursive: true });
  }
}

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

  app.post('/api/pipeline/kit-create', async (req: Request, res: Response) => {
    const { projectName } = req.body;
    if (!projectName || typeof projectName !== 'string') {
      res.status(400).json({ error: 'projectName is required' });
      return;
    }

    ensureWorkspacesDir();
    const targetPath = path.join(WORKSPACES_DIR, projectName);

    const result = await runCommand('npx', [
      'tsx', 'axion/scripts/axion-kit-create.ts',
      '--target', targetPath,
      '--project-name', projectName,
      '--source', path.join(PROJECT_ROOT, 'axion'),
      '--force',
      '--json',
    ], 'kit-create');

    res.json(result);
  });

  app.post('/api/pipeline/generate', async (req: Request, res: Response) => {
    const { projectName } = req.body;
    if (!projectName) { res.status(400).json({ error: 'projectName required' }); return; }

    const buildRoot = path.join(WORKSPACES_DIR, projectName);
    const result = await runCommand('node', [
      'axion/scripts/axion-generate.mjs', '--all',
    ], 'generate', buildRoot);

    res.json(result);
  });

  app.post('/api/pipeline/seed', async (req: Request, res: Response) => {
    const { projectName } = req.body;
    if (!projectName) { res.status(400).json({ error: 'projectName required' }); return; }

    const buildRoot = path.join(WORKSPACES_DIR, projectName);
    const result = await runCommand('node', [
      'axion/scripts/axion-seed.mjs', '--all',
    ], 'seed', buildRoot);

    res.json(result);
  });

  app.post('/api/pipeline/scaffold-app', async (req: Request, res: Response) => {
    const { projectName } = req.body;
    if (!projectName) { res.status(400).json({ error: 'projectName required' }); return; }

    const buildRoot = path.join(WORKSPACES_DIR, projectName);
    const result = await runCommand('npx', [
      'tsx', 'axion/scripts/axion-scaffold-app.ts',
      '--build-root', buildRoot,
      '--project-name', projectName,
      '--override', 'dev_build',
      '--json',
    ], 'scaffold-app');

    res.json(result);
  });

  app.post('/api/pipeline/build-plan', async (req: Request, res: Response) => {
    const { projectName } = req.body;
    if (!projectName) { res.status(400).json({ error: 'projectName required' }); return; }

    const buildRoot = path.join(WORKSPACES_DIR, projectName);
    const result = await runCommand('npx', [
      'tsx', 'axion/scripts/axion-build-plan.ts',
      '--build-root', buildRoot,
      '--project-name', projectName,
      '--json',
    ], 'build-plan');

    res.json(result);
  });

  app.post('/api/pipeline/iterate', async (req: Request, res: Response) => {
    const { projectName, allowApply } = req.body;
    if (!projectName) { res.status(400).json({ error: 'projectName required' }); return; }

    const buildRoot = path.join(WORKSPACES_DIR, projectName);
    const args = [
      'tsx', 'axion/scripts/axion-iterate.ts',
      '--build-root', buildRoot,
      '--project-name', projectName,
      '--json',
    ];
    if (allowApply) args.push('--allow-apply');

    const result = await runCommand('npx', args, 'iterate');
    res.json(result);
  });

  app.post('/api/pipeline/import', async (req: Request, res: Response) => {
    const { projectName, sourcePath } = req.body;
    if (!projectName || !sourcePath) {
      res.status(400).json({ error: 'projectName and sourcePath required' });
      return;
    }

    const buildRoot = path.join(WORKSPACES_DIR, projectName);
    const result = await runCommand('npx', [
      'tsx', 'axion/scripts/axion-import.ts',
      '--source-root', sourcePath,
      '--build-root', buildRoot,
      '--project-name', projectName,
      '--json',
    ], 'import');

    res.json(result);
  });

  app.post('/api/pipeline/reconcile', async (req: Request, res: Response) => {
    const { projectName } = req.body;
    if (!projectName) { res.status(400).json({ error: 'projectName required' }); return; }

    const buildRoot = path.join(WORKSPACES_DIR, projectName);
    const result = await runCommand('npx', [
      'tsx', 'axion/scripts/axion-reconcile.ts',
      '--build-root', buildRoot,
      '--project-name', projectName,
      '--json',
    ], 'reconcile');

    res.json(result);
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
