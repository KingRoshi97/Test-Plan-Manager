import { type ViteDevServer } from 'vite';
import { spawn } from 'child_process';
import { readdir, readFile, stat, mkdir } from 'fs/promises';
import { join, resolve, normalize } from 'path';
import { randomBytes } from 'crypto';

const AXION_DIR = resolve(import.meta.dirname, '../../Axion');
const AXION_RUNS = join(AXION_DIR, '.axion', 'runs');

const STAGE_ORDER = [
  'S1_INGEST_NORMALIZE',
  'S2_VALIDATE_INTAKE',
  'S3_BUILD_CANONICAL',
  'S4_VALIDATE_CANONICAL',
  'S5_RESOLVE_STANDARDS',
  'S6_SELECT_TEMPLATES',
  'S7_RENDER_DOCS',
  'S8_BUILD_PLAN',
  'S9_VERIFY_PROOF',
  'S10_PACKAGE',
];

interface ExecResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function execAxion(args: string[]): Promise<ExecResult> {
  return new Promise((resolve) => {
    const child = spawn('npx', ['tsx', 'src/cli/axion.ts', ...args], {
      cwd: AXION_DIR,
      env: { ...process.env },
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    child.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    child.on('close', (code) => {
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });

    child.on('error', (err) => {
      resolve({ exitCode: 1, stdout, stderr: stderr + '\n' + err.message });
    });
  });
}

function makeActionRef(actionType: string, outcome: string) {
  const actionId = `ACT-${Date.now()}-${randomBytes(2).toString('hex')}`;
  return {
    action_id: actionId,
    timestamp: new Date().toISOString(),
    action_type: actionType,
    outcome,
  };
}

function classifyOutcome(exitCode: number): 'PASS' | 'FAIL' | 'ERROR' {
  if (exitCode === 0) return 'PASS';
  return 'FAIL';
}

function parseRunId(stdout: string): string | null {
  const match = stdout.match(/RUN-\d{6}/);
  return match ? match[0] : null;
}

async function dirExists(p: string): Promise<boolean> {
  try {
    const s = await stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const s = await stat(p);
    return s.isFile();
  } catch {
    return false;
  }
}

async function readJsonSafe(p: string): Promise<unknown> {
  try {
    const raw = await readFile(p, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function listRunsData() {
  if (!(await dirExists(AXION_RUNS))) return [];

  const entries = await readdir(AXION_RUNS);
  const runs = [];

  for (const entry of entries) {
    if (!entry.startsWith('RUN-')) continue;
    const manifestPath = join(AXION_RUNS, entry, 'run_manifest.json');
    const manifest = await readJsonSafe(manifestPath) as Record<string, unknown> | null;

    if (manifest) {
      const pipeline = manifest.pipeline as Record<string, unknown> | undefined;
      const stages = pipeline?.stages as Record<string, unknown>[] | undefined;
      let currentStage: string | undefined;
      if (stages) {
        const inProgress = stages.find((s: Record<string, unknown>) => s.status === 'in_progress' || s.status === 'IN_PROGRESS');
        if (inProgress) currentStage = inProgress.stage_id as string;
        else {
          const lastPass = [...stages].reverse().find((s: Record<string, unknown>) => s.status === 'pass' || s.status === 'PASS');
          if (lastPass) currentStage = lastPass.stage_id as string;
        }
      }

      runs.push({
        run_id: entry,
        status: (pipeline?.status as string || manifest.status as string || 'RUNNING').toUpperCase(),
        risk_class: (manifest.run_context as Record<string, unknown>)?.risk_class ?? 'prototype',
        current_stage: currentStage,
        updated_at: manifest.updated_at as string || manifest.created_at as string || '',
      });
    }
  }

  return runs.sort((a, b) => b.run_id.localeCompare(a.run_id));
}

async function getRunDetailData(runId: string) {
  const runDir = join(AXION_RUNS, runId);
  if (!(await dirExists(runDir))) return null;

  const manifest = await readJsonSafe(join(runDir, 'run_manifest.json')) as Record<string, unknown> | null;
  if (!manifest) return null;

  const stageReports: { kind: string; path: string }[] = [];
  const stageReportsDir = join(runDir, 'stage_reports');
  if (await dirExists(stageReportsDir)) {
    const files = await readdir(stageReportsDir);
    for (const f of files.filter((f: string) => f.endsWith('.json')).sort()) {
      stageReports.push({ kind: 'artifact', path: `.axion/runs/${runId}/stage_reports/${f}` });
    }
  }

  const gateReports: { kind: string; path: string }[] = [];
  const gatesDir = join(runDir, 'gates');
  if (await dirExists(gatesDir)) {
    const files = await readdir(gatesDir);
    for (const f of files.filter((f: string) => f.endsWith('.json')).sort()) {
      gateReports.push({ kind: 'artifact', path: `.axion/runs/${runId}/gates/${f}` });
    }
  }

  const pipeline = manifest.pipeline as Record<string, unknown> | undefined;
  const stages = pipeline?.stages as Record<string, unknown>[] | undefined;
  let currentStage: string | undefined;
  if (stages) {
    const inProgress = stages.find((s: Record<string, unknown>) => s.status === 'in_progress' || s.status === 'IN_PROGRESS');
    if (inProgress) currentStage = inProgress.stage_id as string;
    else {
      const lastPass = [...stages].reverse().find((s: Record<string, unknown>) => s.status === 'pass' || s.status === 'PASS');
      if (lastPass) currentStage = lastPass.stage_id as string;
    }
  }

  return {
    run: {
      run_id: runId,
      status: (pipeline?.status as string || manifest.status as string || 'RUNNING').toUpperCase(),
      risk_class: (manifest.run_context as Record<string, unknown>)?.risk_class ?? 'prototype',
      current_stage: currentStage,
      updated_at: manifest.updated_at as string || manifest.created_at as string || '',
    },
    manifest: { kind: 'artifact', path: `.axion/runs/${runId}/run_manifest.json` },
    stage_reports: stageReports,
    gate_reports: gateReports,
  };
}

function isAllowedPath(requestedPath: string): boolean {
  if (!requestedPath || requestedPath.startsWith('/')) return false;
  const normalized = normalize(requestedPath);
  if (normalized.includes('..')) return false;
  const allowed = ['.axion/', 'registries/', 'libraries/', 'features/'];
  if (!allowed.some((prefix) => normalized.startsWith(prefix))) return false;
  const absResolved = resolve(AXION_DIR, normalized);
  if (!absResolved.startsWith(AXION_DIR)) return false;
  return true;
}

export function axionApiPlugin() {
  return {
    name: 'axion-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const json = body ? JSON.parse(body) : {};
            await handleApi(pathname, url.searchParams, json, res);
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
      });
    },
  };
}

async function handleApi(
  pathname: string,
  params: URLSearchParams,
  body: Record<string, unknown>,
  res: import('http').ServerResponse
) {
  res.setHeader('Content-Type', 'application/json');

  if (pathname === '/api/doctor' && body !== undefined) {
    const result = await execAxion(['init']);
    const outcome = classifyOutcome(result.exitCode);
    res.end(JSON.stringify({
      action: makeActionRef('doctor', outcome),
      stdout: result.stdout,
      stderr: result.stderr,
      report: { kind: 'log', path: '_stdout' },
      logs: [],
    }));
    return;
  }

  if (pathname === '/api/run/start') {
    const result = await execAxion(['run', 'start']);
    const outcome = classifyOutcome(result.exitCode);
    const runId = parseRunId(result.stdout);

    let run = null;
    if (runId) {
      const detail = await getRunDetailData(runId);
      run = detail?.run ?? { run_id: runId, status: 'RUNNING', updated_at: new Date().toISOString() };
    }

    res.end(JSON.stringify({
      action: makeActionRef('run_start', outcome),
      run,
      stdout: result.stdout,
      stderr: result.stderr,
      manifest: runId ? { kind: 'artifact', path: `.axion/runs/${runId}/run_manifest.json` } : null,
    }));
    return;
  }

  if (pathname === '/api/run/advance') {
    const runId = body.run_id as string;
    if (!runId) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'run_id required' }));
      return;
    }

    const detail = await getRunDetailData(runId);
    if (!detail) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: `Run ${runId} not found` }));
      return;
    }

    const completedStages = new Set(detail.stage_reports.map((r) => {
      const parts = r.path.split('/');
      return parts[parts.length - 1].replace('.json', '');
    }));
    const nextStage = STAGE_ORDER.find((s) => !completedStages.has(s));

    if (!nextStage) {
      res.end(JSON.stringify({
        action: makeActionRef('run_advance', 'PASS'),
        run: detail.run,
        stdout: 'All stages already completed.',
        stderr: '',
        manifest: detail.manifest,
        stage_reports: detail.stage_reports,
        gate_reports: detail.gate_reports,
      }));
      return;
    }

    const result = await execAxion(['run', 'stage', runId, nextStage]);
    const outcome = classifyOutcome(result.exitCode);
    const refreshed = await getRunDetailData(runId);

    res.end(JSON.stringify({
      action: makeActionRef('run_advance', outcome),
      run: refreshed?.run ?? detail.run,
      stdout: result.stdout,
      stderr: result.stderr,
      advanced_stage: nextStage,
      manifest: refreshed?.manifest ?? detail.manifest,
      stage_reports: refreshed?.stage_reports ?? detail.stage_reports,
      gate_reports: refreshed?.gate_reports ?? detail.gate_reports,
    }));
    return;
  }

  if (pathname === '/api/run/stage') {
    const runId = body.run_id as string;
    const stageId = body.stage_id as string;
    if (!runId || !stageId) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'run_id and stage_id required' }));
      return;
    }
    const result = await execAxion(['run', 'stage', runId, stageId]);
    const outcome = classifyOutcome(result.exitCode);
    const detail = await getRunDetailData(runId);

    res.end(JSON.stringify({
      action: makeActionRef('run_stage', outcome),
      run: detail?.run,
      stdout: result.stdout,
      stderr: result.stderr,
      manifest: detail?.manifest,
      stage_report: { kind: 'artifact', path: `.axion/runs/${runId}/stage_reports/${stageId}.json` },
      gate_reports: detail?.gate_reports,
    }));
    return;
  }

  if (pathname === '/api/run/gates') {
    const runId = body.run_id as string;
    const stageId = body.stage_id as string;
    if (!runId || !stageId) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'run_id and stage_id required' }));
      return;
    }
    const result = await execAxion(['run', 'gates', runId, stageId]);
    const outcome = classifyOutcome(result.exitCode);

    res.end(JSON.stringify({
      action: makeActionRef('run_gates', outcome),
      stdout: result.stdout,
      stderr: result.stderr,
    }));
    return;
  }

  if (pathname === '/api/run/full') {
    const result = await execAxion(['run']);
    const outcome = classifyOutcome(result.exitCode);
    const runId = parseRunId(result.stdout);
    let detail = null;
    if (runId) detail = await getRunDetailData(runId);

    res.end(JSON.stringify({
      action: makeActionRef('run_full', outcome),
      run: detail?.run,
      run_id: runId,
      stdout: result.stdout,
      stderr: result.stderr,
      manifest: detail?.manifest,
      stage_reports: detail?.stage_reports,
      gate_reports: detail?.gate_reports,
    }));
    return;
  }

  if (pathname === '/api/runs') {
    const runs = await listRunsData();
    res.end(JSON.stringify({ runs }));
    return;
  }

  if (pathname.match(/^\/api\/runs\/[^/]+$/)) {
    const runId = pathname.split('/').pop()!;
    const detail = await getRunDetailData(runId);
    if (!detail) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: `Run ${runId} not found` }));
      return;
    }
    res.end(JSON.stringify(detail));
    return;
  }

  if (pathname === '/api/artifact') {
    const filePath = params.get('path');
    if (!filePath) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'path query parameter required' }));
      return;
    }
    if (!isAllowedPath(filePath)) {
      res.statusCode = 403;
      res.end(JSON.stringify({ error: 'Path not allowed' }));
      return;
    }
    const absPath = join(AXION_DIR, filePath);
    if (!(await fileExists(absPath))) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: `File not found: ${filePath}` }));
      return;
    }

    const raw = await readFile(absPath, 'utf-8');
    let content: unknown;
    let contentType = 'text/plain';
    try {
      content = JSON.parse(raw);
      contentType = 'application/json';
    } catch {
      content = raw;
    }

    res.end(JSON.stringify({ path: filePath, content_type: contentType, content }));
    return;
  }

  if (pathname === '/api/log') {
    const filePath = params.get('path');
    if (!filePath) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'path query parameter required' }));
      return;
    }
    if (!isAllowedPath(filePath)) {
      res.statusCode = 403;
      res.end(JSON.stringify({ error: 'Path not allowed' }));
      return;
    }
    const absPath = join(AXION_DIR, filePath);
    if (!(await fileExists(absPath))) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: `File not found: ${filePath}` }));
      return;
    }

    const raw = await readFile(absPath, 'utf-8');
    const tail = params.get('tail') === 'true';
    const content = tail ? raw.split('\n').slice(-100).join('\n') : raw;

    res.end(JSON.stringify({ path: filePath, content_type: 'text/plain', tail, content }));
    return;
  }

  if (pathname === '/api/stages') {
    res.end(JSON.stringify({ stages: STAGE_ORDER }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: `Unknown endpoint: ${pathname}` }));
}
