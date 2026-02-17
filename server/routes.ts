import { type Express, type Request, type Response } from 'express';
import { spawn, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';
import AdmZip from 'adm-zip';
import type { RunResult, FileEntry, FileContent, WorkspaceInfo, Assembly, SourceFile, SkipBreakdown, UploadResult } from '../shared/schema.js';
import * as tarStream from 'tar-stream';
import { createGunzip } from 'zlib';
import { storage } from './storage.js';
import { scanAllModulesForUnknowns, fillAllModulesUnknowns, findNextTarget, getAllTargets, generateQuestionsForTarget, fillFileWithContext, cascadeFill, upgradeDocumentWithAI, generateUpgradeSuggestions } from './ai-content-fill.js';

const PROJECT_ROOT = process.cwd();
const AXION_ROOT = path.join(PROJECT_ROOT, 'axion');
const WORKSPACES_DIR = path.join(PROJECT_ROOT, 'workspaces');
const EXCLUDED_ROOT_DIRS = new Set(['node_modules', 'server', 'client', 'shared', 'dist', '.git', '.replit', '.config', 'attached_assets']);

function isProjectDir(name: string): boolean {
  if (name.startsWith('.')) return false;
  const fullPath = path.join(WORKSPACES_DIR, name);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) return false;
  return fs.existsSync(path.join(fullPath, 'manifest.json')) ||
         fs.existsSync(path.join(fullPath, 'axion', 'domains')) ||
         fs.existsSync(path.join(fullPath, 'app'));
}

function getProjectPath(projectName: string): string {
  return path.join(WORKSPACES_DIR, projectName);
}

function getAllModulesInWorkspace(buildRoot: string): string[] {
  const domainsDir = path.join(buildRoot, 'axion', 'domains');
  if (!fs.existsSync(domainsDir)) return [];
  return fs.readdirSync(domainsDir).filter(d => {
    const full = path.join(domainsDir, d);
    return fs.statSync(full).isDirectory() && !d.startsWith('.');
  });
}

function expandModulesWithDependencies(modules: string[], includeDeps: boolean): string[] {
  if (!includeDeps || modules.length === 0) return modules;

  const domainsPath = path.join(AXION_ROOT, 'config', 'domains.json');
  let domainsConfig: { modules?: Array<{ slug: string; dependencies?: string[] }> };
  try {
    domainsConfig = JSON.parse(fs.readFileSync(domainsPath, 'utf8'));
  } catch {
    return modules;
  }

  const allDomains = domainsConfig.modules || [];
  const depMap: Record<string, string[]> = {};
  for (const mod of allDomains) {
    depMap[mod.slug] = mod.dependencies || [];
  }

  const expanded = new Set<string>();
  function collectDeps(slug: string) {
    if (expanded.has(slug)) return;
    for (const dep of depMap[slug] || []) {
      collectDeps(dep);
    }
    expanded.add(slug);
  }

  for (const mod of modules) {
    collectDeps(mod);
  }

  return Array.from(expanded);
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
    args: (pn, _br, body) => {
      const a = ['tsx', 'axion/scripts/axion-kit-create.ts', '--target', path.join(WORKSPACES_DIR, pn), '--project-name', pn, '--source', path.join(PROJECT_ROOT, 'axion'), '--force', '--json'];
      if (body.idea) a.push('--project-context', String(body.idea));
      if (body.context) a.push('--project-desc', String(body.context));
      if (body.mode) a.push('--project-mode', String(body.mode));
      if (body.category) a.push('--project-category', String(body.category));
      return a;
    },
    label: 'Kit Create',
    cwd: () => PROJECT_ROOT,
    group: 'setup',
    desc: 'Initialize workspace',
  },
  'generate': {
    cmd: 'node',
    args: (_pn, _br, body) => {
      const a = ['axion/scripts/axion-generate.mjs'];
      if (body.module && typeof body.module === 'string') {
        a.push('--module', body.module);
      } else {
        a.push('--all');
      }
      return a;
    },
    label: 'Generate',
    cwd: (br) => br,
    group: 'setup',
    desc: 'Generate doc structure',
  },
  'seed': {
    cmd: 'node',
    args: (_pn, _br, body) => {
      const a = ['axion/scripts/axion-seed.mjs'];
      if (body.module && typeof body.module === 'string') {
        a.push('--module', body.module);
      } else {
        a.push('--all');
      }
      return a;
    },
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
  'content-fill': {
    cmd: 'npx',
    args: (pn) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-content-fill.ts'), '--project', pn, '--fill', '--json'],
    label: 'Content Fill',
    cwd: (br) => br,
    group: 'docs',
    desc: 'AI-fill UNKNOWN placeholders',
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
    args: (_pn, br) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-scaffold-app.ts'), '--output', path.join(br, 'app'), '--override', 'dev_build', '--json'],
    label: 'Scaffold App',
    cwd: () => PROJECT_ROOT,
    group: 'build',
    desc: 'App boilerplate',
  },
  'build-plan': {
    cmd: 'npx',
    args: (pn) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-build-plan.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
    label: 'Build Plan',
    cwd: () => PROJECT_ROOT,
    group: 'build',
    desc: 'Generate task list',
  },
  'iterate': {
    cmd: 'npx',
    args: (pn, _br, body) => {
      const a = ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-iterate.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'];
      if (body.allowApply) a.push('--allow-apply');
      return a;
    },
    label: 'Iterate',
    cwd: () => PROJECT_ROOT,
    group: 'build',
    desc: 'Run build loop',
  },
  'test': {
    cmd: 'npx',
    args: (pn) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-test.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
    label: 'Test',
    cwd: () => PROJECT_ROOT,
    group: 'build',
    desc: 'Run workspace tests',
  },
  'activate': {
    cmd: 'npx',
    args: (pn) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-activate.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
    label: 'Activate',
    cwd: () => PROJECT_ROOT,
    group: 'build',
    desc: 'Set active build',
  },
  'import': {
    cmd: 'npx',
    args: (pn, _br, body) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-import.ts'), '--source-root', String(body.sourcePath || ''), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
    label: 'Import',
    cwd: () => PROJECT_ROOT,
    group: 'analysis',
    desc: 'Analyze existing repo',
  },
  'reconcile': {
    cmd: 'npx',
    args: (pn) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-reconcile.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
    label: 'Reconcile',
    cwd: () => PROJECT_ROOT,
    group: 'analysis',
    desc: 'Check drift',
  },
  'doctor': {
    cmd: 'npx',
    args: () => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-doctor.ts'), '--json'],
    label: 'Doctor',
    cwd: () => PROJECT_ROOT,
    group: 'analysis',
    desc: 'System health check',
  },
  'status': {
    cmd: 'npx',
    args: (pn) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-status.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
    label: 'Status',
    cwd: () => PROJECT_ROOT,
    group: 'analysis',
    desc: 'Module status',
  },
  'next': {
    cmd: 'npx',
    args: (pn) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-next.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
    label: 'Next Steps',
    cwd: () => PROJECT_ROOT,
    group: 'analysis',
    desc: 'Recommended actions',
  },
  'docs-check': {
    cmd: 'npx',
    args: () => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-docs-check.ts'), '--json'],
    label: 'Docs Check',
    cwd: () => PROJECT_ROOT,
    group: 'analysis',
    desc: 'Check doc health',
  },
  'clean': {
    cmd: 'npx',
    args: (pn) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-clean.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'],
    label: 'Clean',
    cwd: () => PROJECT_ROOT,
    group: 'ops',
    desc: 'Clean artifacts',
  },
  'package': {
    cmd: 'npx',
    args: (_pn, br) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-package.ts'), '--build-root', br, '--mode', 'full', '--json'],
    label: 'Package',
    cwd: () => PROJECT_ROOT,
    group: 'ops',
    desc: 'Bundle Agent Kit',
  },
  'build': {
    cmd: 'npx',
    args: (pn, _br, body) => {
      const a = ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-build.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn, '--json'];
      if (body.allowApply) a.push('--allow-apply');
      return a;
    },
    label: 'Build',
    cwd: () => PROJECT_ROOT,
    group: 'build',
    desc: 'Execute build',
  },
  'build-exec': {
    cmd: 'npx',
    args: (pn, _br, body) => {
      const a = ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-build-exec.ts'), '--build-root', WORKSPACES_DIR, '--project-name', pn];
      if (body.dryRun) {
        a.push('--dry-run');
      } else {
        a.push('--apply');
        const manifestPath = path.join(WORKSPACES_DIR, pn, 'registry', 'build_plan.json');
        a.push('--manifest', manifestPath);
      }
      a.push('--json');
      return a;
    },
    label: 'Build Exec',
    cwd: () => PROJECT_ROOT,
    group: 'build',
    desc: 'Execute build plan',
  },
  'deploy': {
    cmd: 'npx',
    args: (_pn, br) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-deploy.ts'), '--app-path', path.join(br, 'app'), '--build-root', br, '--override', '--json'],
    label: 'Deploy',
    cwd: () => PROJECT_ROOT,
    group: 'ops',
    desc: 'Deploy application',
  },
  'overhaul': {
    cmd: 'npx',
    args: (pn, br) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-overhaul.ts'), '--build-root', br, '--project-name', pn, '--json'],
    label: 'Overhaul',
    cwd: () => PROJECT_ROOT,
    group: 'ops',
    desc: 'System overhaul',
  },
  'validate-templates': {
    cmd: 'npx',
    args: () => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-validate-templates.ts'), '--json'],
    label: 'Validate Templates',
    cwd: () => PROJECT_ROOT,
    group: 'analysis',
    desc: 'Check template integrity',
  },
  'knowledge-coverage': {
    cmd: 'npx',
    args: (_pn, _br, body) => {
      const a = ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-knowledge-coverage.ts'), '--json'];
      if (body.stack && typeof body.stack === 'string') a.push('--stack', body.stack);
      return a;
    },
    label: 'Knowledge Coverage',
    cwd: () => PROJECT_ROOT,
    group: 'analysis',
    desc: 'Analyze knowledge map coverage',
  },
  'kit-preview': {
    cmd: 'npx',
    args: () => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-kit-preview.ts'), '--json'],
    label: 'Kit Preview',
    cwd: () => PROJECT_ROOT,
    group: 'analysis',
    desc: 'Dry-run kit packaging',
  },
  'kit-validate': {
    cmd: 'npx',
    args: (_pn, br) => ['tsx', path.join(PROJECT_ROOT, 'axion/scripts/axion-kit-validate.ts'), '--kit', br || PROJECT_ROOT, '--json'],
    label: 'Kit Validate',
    cwd: () => PROJECT_ROOT,
    group: 'analysis',
    desc: 'Post-package integrity check',
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
    hasRegistry: (fs.existsSync(path.join(projectPath, 'axion', 'registry')) || fs.existsSync(path.join(projectPath, 'registry'))) ? 1 : 0,
    hasDomains: (fs.existsSync(path.join(projectPath, 'axion', 'domains')) || fs.existsSync(path.join(projectPath, 'domains'))) ? 1 : 0,
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
    path.join(projectPath, 'axion', 'registry'),
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
  'build-exec': ['build-exec'],
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
  'validate-templates': [],
  'knowledge-coverage': [],
  'kit-preview': [],
  'kit-validate': [],
};

async function syncReportsToDb(projectName: string, stepId: string) {
  const reportTypes = STEP_TO_REPORTS[stepId] || [];
  const projectPath = getProjectPath(projectName);

  for (const reportType of reportTypes) {
    const fileNames = REPORT_FILE_MAP[reportType];
    if (!fileNames) continue;

    for (const fileName of fileNames) {
      const candidates = [
        path.join(projectPath, 'axion', 'registry', fileName),
        path.join(projectPath, 'registry', fileName),
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

function writeStageMarker(buildRoot: string, stage: string, status: 'success' | 'failed'): void {
  const paths = [
    path.join(buildRoot, 'registry', 'stage_markers.json'),
    path.join(buildRoot, 'axion', 'registry', 'stage_markers.json'),
  ];
  for (const markersPath of paths) {
    const registryDir = path.dirname(markersPath);
    if (!fs.existsSync(registryDir)) {
      fs.mkdirSync(registryDir, { recursive: true });
    }
    let markers: Record<string, Record<string, { completed_at: string; status: string }>> = {};
    if (fs.existsSync(markersPath)) {
      try { markers = JSON.parse(fs.readFileSync(markersPath, 'utf-8')); } catch { markers = {}; }
    }
    if (!markers['global']) markers['global'] = {};
    markers['global'][stage] = {
      completed_at: new Date().toISOString(),
      status,
    };
    fs.writeFileSync(markersPath, JSON.stringify(markers, null, 2), 'utf-8');
  }
}

function ensureArchitectureReadme(buildRoot: string, assembly: any): void {
  const readmePath = path.join(buildRoot, 'axion', 'domains', 'architecture', 'README.md');
  if (fs.existsSync(readmePath)) return;

  const archDir = path.join(buildRoot, 'axion', 'domains', 'architecture');
  if (!fs.existsSync(archDir)) return;

  const projectName = assembly?.projectName || 'Project';
  const idea = assembly?.idea || '';

  let stackHints = 'React, Express, PostgreSQL, Drizzle, TypeScript, Tailwind CSS';
  const belsPath = path.join(archDir, 'BELS_architecture.md');
  if (fs.existsSync(belsPath)) {
    const belsContent = fs.readFileSync(belsPath, 'utf-8');
    if (belsContent.includes('Vue')) stackHints = stackHints.replace('React', 'Vue');
    if (belsContent.includes('Svelte')) stackHints = stackHints.replace('React', 'Svelte');
    if (belsContent.includes('Fastify')) stackHints = stackHints.replace('Express', 'Fastify');
    if (belsContent.includes('Hono')) stackHints = stackHints.replace('Express', 'Hono');
    if (belsContent.includes('MySQL')) stackHints = stackHints.replace('PostgreSQL', 'MySQL');
    if (belsContent.includes('SQLite')) stackHints = stackHints.replace('PostgreSQL', 'SQLite');
    if (belsContent.includes('Prisma')) stackHints = stackHints.replace('Drizzle', 'Prisma');
  }

  const content = `# Architecture — ${projectName}\n\n## Overview\n${idea || 'A full-stack web application.'}\n\n## Technology Stack\n${stackHints}\n\n## Stack Details\n- **Frontend**: React with TypeScript and Tailwind CSS\n- **Backend**: Express.js with TypeScript\n- **Database**: PostgreSQL with Drizzle ORM\n- **Deployment**: Replit\n`;

  fs.writeFileSync(readmePath, content, 'utf-8');
}

function runSingleStep(
  step: PipelineStep,
  args: string[],
  cwd: string,
  aborted: boolean,
  onOutput: (event: string, data: string) => void,
  extraEnv?: Record<string, string>,
): Promise<RunResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    let stdout = '';
    let stderr = '';

    const child = spawn(step.cmd, args, {
      cwd,
      env: { ...process.env, ...(extraEnv || {}) },
      timeout: 300000,
      shell: true,
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

async function runSingleStepWithRetry(
  step: PipelineStep,
  args: string[],
  cwd: string,
  aborted: boolean,
  onOutput: (event: string, data: string) => void,
  maxRetries = 2,
  backoffMs = 1000,
  extraEnv?: Record<string, string>,
): Promise<RunResult> {
  let lastResult: RunResult | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (aborted) {
      return { status: 'error' as const, command: step.label, exitCode: 1, stdout: '', stderr: 'Aborted before execution', durationMs: 0 };
    }
    lastResult = await runSingleStep(step, args, cwd, aborted, onOutput, extraEnv);
    if (lastResult.status === 'success') return lastResult;
    const isTransient = lastResult.stderr.includes('ENOENT') ||
      lastResult.stderr.includes('ETIMEDOUT') ||
      lastResult.stderr.includes('ECONNRESET') ||
      lastResult.exitCode === 137;
    if (!isTransient || attempt >= maxRetries) break;
    const delay = backoffMs * Math.pow(2, attempt);
    onOutput('stderr', `[retry] Attempt ${attempt + 1} failed (transient error), retrying in ${delay}ms...`);
    await new Promise((r) => setTimeout(r, delay));
  }
  return lastResult!;
}

export function registerRoutes(app: Express) {
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/doc-inventory', (_req: Request, res: Response) => {
    try {
      const collectMdFiles = (dir: string, prefix: string): Array<{ name: string; path: string; exists: boolean }> => {
        if (!fs.existsSync(dir)) return [];
        const results: Array<{ name: string; path: string; exists: boolean }> = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = path.join(prefix, entry.name);
          if (entry.isDirectory()) {
            results.push(...collectMdFiles(fullPath, relPath));
          } else if (entry.name.endsWith('.md')) {
            results.push({ name: entry.name, path: relPath, exists: true });
          }
        }
        return results;
      };

      const systemDocs = collectMdFiles(path.join(AXION_ROOT, 'docs'), 'axion/docs');
      const productSourceDocs = collectMdFiles(path.join(AXION_ROOT, 'docs', 'product'), 'axion/docs/product');
      const registrySourceDocs = collectMdFiles(path.join(AXION_ROOT, 'docs', 'registry'), 'axion/docs/registry');
      const coreTemplates = collectMdFiles(path.join(AXION_ROOT, 'templates', 'core'), 'axion/templates/core');

      const domainTemplatesDir = path.join(AXION_ROOT, 'templates');
      const domainTemplates: Array<{ domain: string; name: string; path: string; exists: boolean }> = [];
      if (fs.existsSync(domainTemplatesDir)) {
        for (const entry of fs.readdirSync(domainTemplatesDir, { withFileTypes: true })) {
          if (entry.isDirectory() && entry.name !== 'core') {
            const domainDir = path.join(domainTemplatesDir, entry.name);
            const files = collectMdFiles(domainDir, `axion/templates/${entry.name}`);
            for (const f of files) {
              domainTemplates.push({ domain: entry.name, ...f });
            }
          }
        }
      }

      const generatedDomainsDir = path.join(AXION_ROOT, 'domains');
      const generatedDomains: Array<{ domain: string; files: Array<{ name: string; path: string; exists: boolean }> }> = [];
      if (fs.existsSync(generatedDomainsDir)) {
        for (const entry of fs.readdirSync(generatedDomainsDir, { withFileTypes: true })) {
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            const domainDir = path.join(generatedDomainsDir, entry.name);
            const files = collectMdFiles(domainDir, `axion/domains/${entry.name}`);
            generatedDomains.push({ domain: entry.name, files });
          }
        }
      }

      res.json({
        systemDocs,
        productSourceDocs,
        registrySourceDocs,
        coreTemplates,
        domainTemplates,
        generatedDomains,
        totals: {
          systemDocs: systemDocs.length,
          productSourceDocs: productSourceDocs.length,
          registrySourceDocs: registrySourceDocs.length,
          coreTemplates: coreTemplates.length,
          domainTemplates: domainTemplates.length,
          generatedDomains: generatedDomains.reduce((sum, d) => sum + d.files.length, 0),
        },
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: errMsg });
    }
  });

  app.post('/api/doc-upgrade/suggest', async (req: Request, res: Response) => {
    const { file } = req.body as { file?: string };
    if (!file || typeof file !== 'string') {
      res.status(400).json({ error: 'file path is required' });
      return;
    }
    if (file.includes('..') || !file.startsWith('axion/')) {
      res.status(400).json({ error: 'Invalid file path' });
      return;
    }
    const resolved = path.resolve(PROJECT_ROOT, file);
    if (!resolved.startsWith(AXION_ROOT)) {
      res.status(400).json({ error: 'Path escapes axion root' });
      return;
    }

    const parts = file.split('/');
    const moduleName = parts.length >= 3 ? parts[2] : parts[parts.length - 2] || 'system';

    try {
      const result = await generateUpgradeSuggestions(resolved, moduleName);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ suggestions: [], error: err?.message || 'Failed to generate suggestions' });
    }
  });

  app.post('/api/doc-upgrade', async (req: Request, res: Response) => {
    const { files, userInstructions } = req.body as { files?: string[]; userInstructions?: string };
    if (!files || !Array.isArray(files) || files.length === 0) {
      res.status(400).json({ error: 'files array is required' });
      return;
    }

    for (const f of files) {
      if (f.includes('..') || !f.startsWith('axion/')) {
        res.status(400).json({ error: `Invalid file path: ${f}` });
        return;
      }
      const resolved = path.resolve(PROJECT_ROOT, f);
      if (!resolved.startsWith(AXION_ROOT)) {
        res.status(400).json({ error: `Path escapes axion root: ${f}` });
        return;
      }
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const total = files.length;
    let completed = 0;
    let upgraded = 0;
    let skipped = 0;
    let errored = 0;

    res.write(`event: start\ndata: ${JSON.stringify({ total })}\n\n`);

    for (const relPath of files) {
      const fullPath = path.join(PROJECT_ROOT, relPath);
      const fileName = path.basename(relPath);
      const parts = relPath.split('/');
      const moduleName = parts.length >= 3 ? parts[2] : parts[parts.length - 2] || 'system';

      const result = await upgradeDocumentWithAI(fullPath, moduleName, (msg) => {
        res.write(`event: progress\ndata: ${JSON.stringify({ file: relPath, message: msg })}\n\n`);
      }, userInstructions);

      completed++;
      if (result.status === 'upgraded') upgraded++;
      else if (result.status === 'skipped') skipped++;
      else errored++;

      res.write(`event: file-done\ndata: ${JSON.stringify({ file: relPath, status: result.status, error: result.error, completed, total, upgraded, skipped, errored })}\n\n`);
    }

    res.write(`event: done\ndata: ${JSON.stringify({ total, upgraded, skipped, errored })}\n\n`);
    res.end();
  });

  app.post('/api/docs/create', (req: Request, res: Response) => {
    const { section, filename, domain } = req.body as { section?: string; filename?: string; domain?: string };

    if (!section || !filename) {
      res.status(400).json({ error: 'section and filename are required' });
      return;
    }

    const safeName = filename.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    if (!safeName) {
      res.status(400).json({ error: 'Invalid filename' });
      return;
    }

    const finalName = safeName.endsWith('.md') ? safeName : `${safeName}.md`;

    const sectionDirMap: Record<string, string> = {
      'section-system-docs': path.join(AXION_ROOT, 'docs'),
      'section-product-docs': path.join(AXION_ROOT, 'docs', 'product'),
      'section-registry-docs': path.join(AXION_ROOT, 'docs', 'registry'),
      'section-core-templates': path.join(AXION_ROOT, 'templates', 'core'),
      'section-domain-templates': domain ? path.join(AXION_ROOT, 'templates', domain) : '',
      'section-generated-output': domain ? path.join(AXION_ROOT, 'domains', domain) : '',
    };

    const targetDir = sectionDirMap[section];
    if (!targetDir) {
      res.status(400).json({ error: `Unknown section: ${section}. Domain may be required for domain sections.` });
      return;
    }

    const resolved = path.resolve(targetDir, finalName);
    if (!resolved.startsWith(AXION_ROOT)) {
      res.status(400).json({ error: 'Path escapes axion root' });
      return;
    }

    if (fs.existsSync(resolved)) {
      res.status(409).json({ error: `File already exists: ${finalName}` });
      return;
    }

    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const title = finalName.replace(/\.md$/, '').replace(/[_\-]/g, ' ');
      fs.writeFileSync(resolved, `# ${title}\n\n<!-- Add content here -->\n`, 'utf-8');
      const relPath = path.relative(PROJECT_ROOT, resolved);
      res.json({ path: relPath, name: finalName, created: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to create file' });
    }
  });

  app.get('/api/assemblies', async (_req: Request, res: Response) => {
    try {
      const list = await storage.getAssemblies();
      const allRuns = await storage.getAllPipelineRuns(10000);
      const runsByProject: Record<string, typeof allRuns> = {};
      for (const run of allRuns) {
        if (!runsByProject[run.projectName]) runsByProject[run.projectName] = [];
        runsByProject[run.projectName].push(run);
      }

      const enriched = list.map(a => {
        const projectPath = a.projectName ? getProjectPath(a.projectName) : null;
        const wsExists = projectPath ? fs.existsSync(projectPath) : false;
        const hasRegistry = projectPath ? (fs.existsSync(path.join(projectPath, 'axion', 'registry')) || fs.existsSync(path.join(projectPath, 'registry'))) : false;
        const hasDomains = projectPath ? (fs.existsSync(path.join(projectPath, 'axion', 'domains')) || fs.existsSync(path.join(projectPath, 'domains'))) : false;
        const hasApp = projectPath ? fs.existsSync(path.join(projectPath, 'app')) : false;

        let verifyStatus = 'unknown';
        if (projectPath) {
          const vPaths = [
            path.join(projectPath, 'axion', 'registry', 'verify_report.json'),
            path.join(projectPath, 'registry', 'verify_report.json'),
          ];
          for (const vPath of vPaths) {
            if (fs.existsSync(vPath)) {
              try {
                const vr = JSON.parse(fs.readFileSync(vPath, 'utf-8'));
                verifyStatus = vr.overall_status || vr.status || 'unknown';
              } catch {}
              break;
            }
          }
        }

        let lockEligible = verifyStatus === 'PASS';

        const projectRuns = a.projectName ? (runsByProject[a.projectName] || []) : [];
        const lastRunAt = projectRuns.length > 0 ? projectRuns[0].createdAt.toISOString() : null;
        const totalRuns = projectRuns.length;
        const completedStepIds = new Set(projectRuns.filter(r => r.status === 'success').map(r => r.stepId));
        const completedSteps = completedStepIds.size;
        const totalDuration = projectRuns.reduce((sum, r) => sum + (r.durationMs || 0), 0);

        return {
          ...a,
          wsExists,
          hasRegistry,
          hasDomains,
          hasApp,
          verifyStatus,
          lockEligible,
          lastRunAt,
          totalRuns,
          completedSteps,
          totalDuration,
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
      const hasRegistry = projectPath ? (fs.existsSync(path.join(projectPath, 'axion', 'registry')) || fs.existsSync(path.join(projectPath, 'registry'))) : false;
      const hasDomains = projectPath ? (fs.existsSync(path.join(projectPath, 'axion', 'domains')) || fs.existsSync(path.join(projectPath, 'domains'))) : false;
      const hasApp = projectPath ? fs.existsSync(path.join(projectPath, 'app')) : false;

      let verifyStatus = 'unknown';
      if (projectPath) {
        const vPaths = [
          path.join(projectPath, 'axion', 'registry', 'verify_report.json'),
          path.join(projectPath, 'registry', 'verify_report.json'),
        ];
        for (const vPath of vPaths) {
          if (fs.existsSync(vPath)) {
            try {
              const vr = JSON.parse(fs.readFileSync(vPath, 'utf-8'));
              verifyStatus = vr.overall_status || vr.status || 'unknown';
            } catch {}
            break;
          }
        }
      }

      const projectRuns = assembly.projectName ? await storage.getPipelineRuns(assembly.projectName, 10000) : [];
      const lastRunAt = projectRuns.length > 0 ? projectRuns[0].createdAt.toISOString() : null;
      const totalRuns = projectRuns.length;
      const completedStepIds = new Set(projectRuns.filter(r => r.status === 'success').map(r => r.stepId));
      const completedSteps = completedStepIds.size;
      const totalDuration = projectRuns.reduce((sum, r) => sum + (r.durationMs || 0), 0);

      res.json({
        ...assembly,
        wsExists,
        hasRegistry,
        hasDomains,
        hasApp,
        verifyStatus,
        lockEligible: verifyStatus === 'PASS',
        lastRunAt,
        totalRuns,
        completedSteps,
        totalDuration,
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch assembly' });
    }
  });

  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

  const TEXT_EXTENSIONS = new Set([
    '.txt', '.md', '.json', '.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.less',
    '.html', '.htm', '.xml', '.svg', '.yaml', '.yml', '.toml', '.ini', '.cfg',
    '.sh', '.bash', '.zsh', '.fish', '.bat', '.cmd', '.ps1',
    '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift', '.c', '.cpp', '.h', '.hpp',
    '.cs', '.php', '.lua', '.r', '.sql', '.graphql', '.gql',
    '.env', '.gitignore', '.dockerignore', '.editorconfig', '.prettierrc', '.eslintrc',
    '.lock', '.csv', '.tsv', '.log', '.conf', '.properties', '.gradle',
    '.makefile', '.cmake', '.dockerfile',
    '.mdx', '.astro', '.vue', '.svelte',
  ]);

  const SKIP_DIRS = new Set(['node_modules', '.git', '__pycache__', '.next', 'dist', '.cache', 'coverage', '.vscode', '.idea']);

  const EXT_LANGUAGE_MAP: Record<string, string> = {
    '.ts': 'typescript', '.tsx': 'typescript', '.js': 'javascript', '.jsx': 'javascript', '.mjs': 'javascript',
    '.py': 'python', '.rb': 'ruby', '.go': 'go', '.rs': 'rust', '.java': 'java', '.kt': 'kotlin',
    '.swift': 'swift', '.c': 'c', '.cpp': 'cpp', '.h': 'c', '.hpp': 'cpp', '.cs': 'csharp',
    '.php': 'php', '.lua': 'lua', '.r': 'r', '.sql': 'sql', '.graphql': 'graphql', '.gql': 'graphql',
    '.css': 'css', '.scss': 'scss', '.less': 'less', '.html': 'html', '.htm': 'html',
    '.xml': 'xml', '.svg': 'svg', '.json': 'json', '.yaml': 'yaml', '.yml': 'yaml',
    '.toml': 'toml', '.ini': 'ini', '.md': 'markdown', '.mdx': 'mdx',
    '.sh': 'shell', '.bash': 'shell', '.zsh': 'shell', '.bat': 'batch', '.ps1': 'powershell',
    '.vue': 'vue', '.svelte': 'svelte', '.astro': 'astro',
    '.dockerfile': 'dockerfile', '.makefile': 'makefile',
  };

  function detectLanguage(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    if (EXT_LANGUAGE_MAP[ext]) return EXT_LANGUAGE_MAP[ext];
    const base = path.basename(filename).toLowerCase();
    if (base === 'dockerfile') return 'dockerfile';
    if (base === 'makefile') return 'makefile';
    if (base === 'gemfile' || base === 'rakefile') return 'ruby';
    return 'text';
  }

  function isTextFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    if (TEXT_EXTENSIONS.has(ext)) return true;
    const base = path.basename(filename).toLowerCase();
    return ['makefile', 'dockerfile', 'rakefile', 'gemfile', 'procfile', 'readme', 'license', 'changelog', 'contributing'].includes(base);
  }

  function shouldSkipEntry(entryPath: string): boolean {
    const parts = entryPath.split('/');
    return parts.some(p => SKIP_DIRS.has(p));
  }

  const MAX_TOTAL_UNCOMPRESSED = 200 * 1024 * 1024;
  const MAX_ENTRIES = 5000;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  function sanitizeEntryName(name: string): string | null {
    const normalized = name.replace(/\\/g, '/');
    if (normalized.includes('..') || path.isAbsolute(normalized)) return null;
    const cleaned = normalized.replace(/^\/+/, '');
    if (cleaned.length === 0) return null;
    return cleaned;
  }

  function processExtractedEntry(
    entryName: string,
    rawSize: number,
    getData: () => Buffer,
    files: SourceFile[],
    skipped: SkipBreakdown,
    totalSizeRef: { value: number }
  ): 'ok' | 'size_limit' {
    const safeName = sanitizeEntryName(entryName);
    if (!safeName) { skipped.traversal++; return 'ok'; }
    if (shouldSkipEntry(safeName)) { skipped.excludedDir++; return 'ok'; }
    if (!isTextFile(safeName)) { skipped.binary++; return 'ok'; }
    if (rawSize > MAX_FILE_SIZE) { skipped.tooLarge++; return 'ok'; }

    totalSizeRef.value += rawSize;
    if (totalSizeRef.value > MAX_TOTAL_UNCOMPRESSED) return 'size_limit';

    try {
      const content = getData().toString('utf8');
      if (content.length === 0) { skipped.empty++; return 'ok'; }
      files.push({
        path: safeName,
        language: detectLanguage(safeName),
        content,
        size: content.length,
      });
    } catch {
      skipped.readError++;
    }
    return 'ok';
  }

  function extractZipFiles(buffer: Buffer): { files: SourceFile[]; skipped: SkipBreakdown } {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    if (entries.length > MAX_ENTRIES) {
      throw new Error(`Archive contains too many entries (${entries.length}). Maximum is ${MAX_ENTRIES}.`);
    }

    const files: SourceFile[] = [];
    const skipped: SkipBreakdown = { binary: 0, tooLarge: 0, excludedDir: 0, traversal: 0, readError: 0, empty: 0 };
    const totalSizeRef = { value: 0 };

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      const result = processExtractedEntry(
        entry.entryName, entry.header.size,
        () => entry.getData(), files, skipped, totalSizeRef
      );
      if (result === 'size_limit') {
        throw new Error('Archive contents exceed maximum uncompressed size (200MB).');
      }
    }
    return { files, skipped };
  }

  function extractTarGzFiles(buffer: Buffer): Promise<{ files: SourceFile[]; skipped: SkipBreakdown }> {
    return new Promise((resolve, reject) => {
      const files: SourceFile[] = [];
      const skipped: SkipBreakdown = { binary: 0, tooLarge: 0, excludedDir: 0, traversal: 0, readError: 0, empty: 0 };
      const totalSizeRef = { value: 0 };
      let entryCount = 0;

      const extract = tarStream.extract();

      extract.on('entry', (header, stream, next) => {
        entryCount++;
        if (entryCount > MAX_ENTRIES) {
          stream.resume();
          reject(new Error(`Archive contains too many entries (>${MAX_ENTRIES}).`));
          return;
        }

        if (header.type !== 'file') {
          stream.resume();
          next();
          return;
        }

        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => {
          const buf = Buffer.concat(chunks);
          const result = processExtractedEntry(
            header.name, header.size || buf.length,
            () => buf, files, skipped, totalSizeRef
          );
          if (result === 'size_limit') {
            reject(new Error('Archive contents exceed maximum uncompressed size (200MB).'));
            return;
          }
          next();
        });
        stream.on('error', () => { skipped.readError++; next(); });
      });

      extract.on('finish', () => resolve({ files, skipped }));
      extract.on('error', (err) => reject(err));

      const { Readable } = require('stream');
      const readable = Readable.from(buffer);
      readable.pipe(createGunzip()).pipe(extract);
    });
  }

  app.post('/api/upload-context', upload.single('archive'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const originalName = req.file.originalname || 'unknown';
      const lowerName = originalName.toLowerCase();
      let archiveType: 'zip' | 'tar.gz';
      let extracted: { files: SourceFile[]; skipped: SkipBreakdown };

      if (lowerName.endsWith('.tar.gz') || lowerName.endsWith('.tgz')) {
        archiveType = 'tar.gz';
        extracted = await extractTarGzFiles(req.file.buffer);
      } else if (lowerName.endsWith('.zip')) {
        archiveType = 'zip';
        extracted = extractZipFiles(req.file.buffer);
      } else {
        res.status(400).json({ error: 'Unsupported archive format. Please upload a .zip, .tar.gz, or .tgz file.' });
        return;
      }

      if (extracted.files.length === 0) {
        res.status(400).json({ error: 'No readable text files found in the archive.' });
        return;
      }

      const totalSkipped = Object.values(extracted.skipped).reduce((a, b) => a + b, 0);

      const result: UploadResult = {
        files: extracted.files,
        skipped: extracted.skipped,
        totalExtracted: extracted.files.length,
        totalSkipped,
        archiveType,
        originalName,
      };

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to process archive' });
    }
  });

  app.post('/api/upload-context-zip', upload.single('zipfile'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const extracted = extractZipFiles(req.file.buffer);

      if (extracted.files.length === 0) {
        res.status(400).json({ error: 'No readable text files found in the zip archive.' });
        return;
      }

      const content = extracted.files.map(f => `--- FILE: ${f.path} ---\n${f.content}`).join('\n\n');
      const totalSkipped = Object.values(extracted.skipped).reduce((a, b) => a + b, 0);
      res.json({ content, fileCount: extracted.files.length, skippedCount: totalSkipped });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to process zip file' });
    }
  });

  app.post('/api/upload-context-github', async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        res.status(400).json({ error: 'A GitHub repository URL is required.' });
        return;
      }

      const ghMatch = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/);
      if (!ghMatch) {
        res.status(400).json({ error: 'Invalid GitHub URL. Expected format: https://github.com/owner/repo' });
        return;
      }

      const [, owner, repo] = ghMatch;
      let branch = 'main';
      const branchMatch = url.match(/\/tree\/([^/]+)/);
      if (branchMatch) branch = branchMatch[1];

      const tarballUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.tar.gz`;
      const resp = await fetch(tarballUrl);
      if (!resp.ok) {
        if (resp.status === 404) {
          const fallbackUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/master.tar.gz`;
          const fallbackResp = await fetch(fallbackUrl);
          if (!fallbackResp.ok) {
            res.status(404).json({ error: `Repository not found or not public: ${owner}/${repo}` });
            return;
          }
          const buf = Buffer.from(await fallbackResp.arrayBuffer());
          const extracted = await extractTarGzFiles(buf);
          if (extracted.files.length === 0) {
            res.status(400).json({ error: 'No readable text files found in the repository.' });
            return;
          }
          const totalSkipped = Object.values(extracted.skipped).reduce((a, b) => a + b, 0);
          const result: UploadResult = {
            files: extracted.files, skipped: extracted.skipped,
            totalExtracted: extracted.files.length, totalSkipped,
            archiveType: 'github', originalName: `${owner}/${repo}`,
          };
          res.json(result);
          return;
        }
        res.status(resp.status).json({ error: `Failed to fetch repository: ${resp.statusText}` });
        return;
      }

      const buf = Buffer.from(await resp.arrayBuffer());
      const extracted = await extractTarGzFiles(buf);
      if (extracted.files.length === 0) {
        res.status(400).json({ error: 'No readable text files found in the repository.' });
        return;
      }

      const totalSkipped = Object.values(extracted.skipped).reduce((a, b) => a + b, 0);
      const result: UploadResult = {
        files: extracted.files, skipped: extracted.skipped,
        totalExtracted: extracted.files.length, totalSkipped,
        archiveType: 'github', originalName: `${owner}/${repo}`,
      };
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch GitHub repository' });
    }
  });

  app.post('/api/assembly-autofill', async (req: Request, res: Response) => {
    try {
      const { projectName, idea, category, typeName, typeFields: typeFieldDefs, fullProductFields: fpFieldDefs } = req.body;
      if (!projectName || !idea) {
        res.status(400).json({ error: 'projectName and idea are required' });
        return;
      }

      let cleanIdea = typeof idea === 'string' ? idea : '';
      const fileMarkerIdx = cleanIdea.indexOf('--- FILE:');
      if (fileMarkerIdx >= 0) {
        cleanIdea = cleanIdea.substring(0, fileMarkerIdx).trim();
      }
      if (!cleanIdea) {
        cleanIdea = projectName;
      }
      const truncatedIdea = cleanIdea.length > 3000
        ? cleanIdea.substring(0, 3000) + '...'
        : cleanIdea;

      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      let sectionNumber = 0;
      const sectionLines: string[] = [];
      const sectionKeys: string[] = [];

      if (Array.isArray(typeFieldDefs) && typeFieldDefs.length > 0) {
        for (const f of typeFieldDefs) {
          sectionNumber++;
          sectionLines.push(`${sectionNumber}. ${f.key} - ${f.label}`);
          sectionKeys.push(f.key);
        }
      }

      if (Array.isArray(fpFieldDefs) && fpFieldDefs.length > 0) {
        for (const f of fpFieldDefs) {
          sectionNumber++;
          sectionLines.push(`${sectionNumber}. ${f.key} - ${f.label}`);
          sectionKeys.push(f.key);
        }
      }

      const standardSections = [
        { key: 'visionProblem', label: 'What problem does this solve?' },
        { key: 'visionTargetUsers', label: 'Who is this for?' },
        { key: 'visionGoals', label: 'Primary goals (what should this achieve?)' },
        { key: 'visionSuccess', label: 'What does success look like?' },
        { key: 'coreFeatures', label: 'Core features (must-haves), as a bulleted list' },
        { key: 'niceToHaveFeatures', label: 'Nice-to-have features, as a bulleted list' },
        { key: 'coreEntities', label: 'Main entities/data objects in the system, as a bulleted list with descriptions' },
        { key: 'userJourneys', label: 'Key user workflows, as numbered steps' },
        { key: 'platform', label: 'Platform targets (short, comma-separated)' },
        { key: 'integrations', label: 'External integrations needed, as a bulleted list' },
        { key: 'techConstraints', label: 'Technical constraints or preferences, as a bulleted list' },
        { key: 'dataSensitivity', label: 'Data sensitivity level (respond with exactly one of: "low", "medium", or "high")' },
      ];

      for (const s of standardSections) {
        if (!sectionKeys.includes(s.key)) {
          sectionNumber++;
          sectionLines.push(`${sectionNumber}. ${s.key} - ${s.label}`);
          sectionKeys.push(s.key);
        }
      }

      const exampleKeys = sectionKeys.slice(0, 3).map(k => `    "${k}": { "autofill": "...", "suggestions": ["option1", "option2", "option3"] }`).join(',\n');

      const prompt = `You are helping a user set up a new software project. Based on their project name and idea, generate helpful suggestions for different aspects of the project.

Project Name: ${projectName}
Project Idea: ${truncatedIdea}
${category ? `Category: ${category}` : ''}
${typeName ? `Project Type: ${typeName}` : ''}

Generate suggestions for each of the following sections. For each section, provide exactly 3 short options (each 1-3 sentences). Also provide a recommended "autofill" value that combines the best aspects into a thorough response.

Sections:
${sectionLines.join('\n')}

Respond in this exact JSON format:
{
  "fields": {
${exampleKeys},
    ...same for all ${sectionKeys.length} sections
  }
}

IMPORTANT: Return ONLY valid JSON, no markdown fences.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a product planning assistant. You generate concise, practical suggestions for software project planning. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        max_completion_tokens: 8192,
      });

      const raw = response.choices[0]?.message?.content || '{}';
      let parsed: any;
      try {
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        res.status(500).json({ error: 'Failed to parse AI response' });
        return;
      }

      res.json(parsed);
    } catch (err: any) {
      console.error('Assembly autofill error:', err);
      res.status(500).json({ error: err?.message || 'Failed to generate suggestions' });
    }
  });

  const AI_STEP_IDS = new Set(['draft', 'content-fill', 'generate', 'seed', 'review', 'build-plan', 'build-exec', 'build']);

  app.get('/api/performance-stats', async (_req: Request, res: Response) => {
    try {
      const allRuns = await storage.getAllPipelineRuns(10000);
      if (!allRuns || allRuns.length === 0) {
        res.json({
          totalRuns: 0,
          successCount: 0,
          errorCount: 0,
          successRate: 0,
          avgDurationMs: 0,
          totalDurationMs: 0,
          stepBreakdown: [],
          failureHotspots: [],
          aiStepMetrics: { totalAiRuns: 0, avgAiDurationMs: 0, aiSteps: [] },
          runsOverTime: [],
          projectBreakdown: [],
        });
        return;
      }

      const totalRuns = allRuns.length;
      const successRuns = allRuns.filter(r => r.status === 'success');
      const errorRuns = allRuns.filter(r => r.status === 'error');
      const successCount = successRuns.length;
      const errorCount = errorRuns.length;
      const successRate = totalRuns > 0 ? Math.round((successCount / totalRuns) * 100) : 0;
      const totalDurationMs = allRuns.reduce((s, r) => s + (r.durationMs || 0), 0);
      const avgDurationMs = totalRuns > 0 ? Math.round(totalDurationMs / totalRuns) : 0;

      const stepMap = new Map<string, { total: number; success: number; error: number; totalMs: number; maxMs: number }>();
      for (const run of allRuns) {
        const sid = run.stepId;
        let entry = stepMap.get(sid);
        if (!entry) { entry = { total: 0, success: 0, error: 0, totalMs: 0, maxMs: 0 }; stepMap.set(sid, entry); }
        entry.total++;
        if (run.status === 'success') entry.success++;
        if (run.status === 'error') entry.error++;
        entry.totalMs += (run.durationMs || 0);
        entry.maxMs = Math.max(entry.maxMs, run.durationMs || 0);
      }

      const stepBreakdown = Array.from(stepMap.entries())
        .map(([stepId, s]) => ({
          stepId,
          label: s.total > 0 ? (allRuns.find(r => r.stepId === stepId)?.stepLabel || stepId) : stepId,
          totalRuns: s.total,
          successCount: s.success,
          errorCount: s.error,
          successRate: s.total > 0 ? Math.round((s.success / s.total) * 100) : 0,
          avgDurationMs: s.total > 0 ? Math.round(s.totalMs / s.total) : 0,
          maxDurationMs: s.maxMs,
          totalDurationMs: s.totalMs,
          isAiStep: AI_STEP_IDS.has(stepId),
        }))
        .sort((a, b) => b.avgDurationMs - a.avgDurationMs);

      const failureHotspots = stepBreakdown
        .filter(s => s.errorCount > 0)
        .sort((a, b) => b.errorCount - a.errorCount)
        .slice(0, 10);

      const aiSteps = stepBreakdown.filter(s => s.isAiStep);
      const totalAiRuns = aiSteps.reduce((s, a) => s + a.totalRuns, 0);
      const totalAiMs = aiSteps.reduce((s, a) => s + a.totalDurationMs, 0);
      const aiStepMetrics = {
        totalAiRuns,
        avgAiDurationMs: totalAiRuns > 0 ? Math.round(totalAiMs / totalAiRuns) : 0,
        aiSteps: aiSteps.sort((a, b) => b.totalDurationMs - a.totalDurationMs),
      };

      const dateMap = new Map<string, { total: number; success: number; error: number }>();
      for (const run of allRuns) {
        const d = new Date(run.createdAt).toISOString().slice(0, 10);
        let entry = dateMap.get(d);
        if (!entry) { entry = { total: 0, success: 0, error: 0 }; dateMap.set(d, entry); }
        entry.total++;
        if (run.status === 'success') entry.success++;
        if (run.status === 'error') entry.error++;
      }
      const runsOverTime = Array.from(dateMap.entries())
        .map(([date, v]) => ({ date, ...v }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const projMap = new Map<string, { total: number; success: number; error: number; totalMs: number }>();
      for (const run of allRuns) {
        const p = run.projectName;
        let entry = projMap.get(p);
        if (!entry) { entry = { total: 0, success: 0, error: 0, totalMs: 0 }; projMap.set(p, entry); }
        entry.total++;
        if (run.status === 'success') entry.success++;
        if (run.status === 'error') entry.error++;
        entry.totalMs += (run.durationMs || 0);
      }
      const projectBreakdown = Array.from(projMap.entries())
        .map(([projectName, v]) => ({
          projectName,
          totalRuns: v.total,
          successCount: v.success,
          errorCount: v.error,
          successRate: v.total > 0 ? Math.round((v.success / v.total) * 100) : 0,
          avgDurationMs: v.total > 0 ? Math.round(v.totalMs / v.total) : 0,
          totalDurationMs: v.totalMs,
        }))
        .sort((a, b) => b.totalRuns - a.totalRuns);

      res.json({
        totalRuns,
        successCount,
        errorCount,
        successRate,
        avgDurationMs,
        totalDurationMs,
        stepBreakdown,
        failureHotspots,
        aiStepMetrics,
        runsOverTime,
        projectBreakdown,
      });
    } catch (err: any) {
      console.error('Performance stats error:', err);
      res.status(500).json({ error: err?.message || 'Failed to compute performance stats' });
    }
  });

  app.post('/api/assemblies', async (req: Request, res: Response) => {
    try {
      const { projectName, idea, preset, presetId, mode, domains, context, category, input, sourceFiles, archiveUrl } = req.body;
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
        input: input || null,
        sourceFiles: sourceFiles || null,
        archiveUrl: archiveUrl || null,
        state: 'queued',
        step: null,
        progress: null,
        errors: null,
        kit: null,
        kitPath: null,
        logsTail: null,
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

  app.post('/api/assemblies/:id/upgrade', async (req: Request, res: Response) => {
    try {
      const assembly = await storage.getAssembly(req.params.id as string);
      if (!assembly) {
        res.status(404).json({ error: 'Assembly not found' });
        return;
      }
      if (!assembly.projectName) {
        res.status(400).json({ error: 'Assembly has no project name' });
        return;
      }

      const allowedStates = ['completed', 'exported', 'failed'];
      if (!allowedStates.includes(assembly.state)) {
        res.status(400).json({ error: `Cannot upgrade assembly in state "${assembly.state}". Must be completed, exported, or failed.` });
        return;
      }

      const { upgradeNotes } = req.body;
      if (!upgradeNotes || typeof upgradeNotes !== 'string' || upgradeNotes.trim().length === 0) {
        res.status(400).json({ error: 'upgradeNotes is required' });
        return;
      }
      if (upgradeNotes.length > 10000) {
        res.status(400).json({ error: 'upgradeNotes must be under 10000 characters' });
        return;
      }

      const currentRevision = assembly.revision ?? 1;
      const newRevision = currentRevision + 1;

      const updated = await storage.updateAssembly(req.params.id as string, {
        state: 'queued',
        step: null,
        progress: null,
        errors: null,
        kit: null,
        kitPath: null,
        logsTail: null,
        revision: newRevision,
        upgradeNotes: upgradeNotes.trim(),
        kitType: 'upgrade',
      });

      res.json({ ok: true, assembly: updated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to upgrade assembly' });
    }
  });

  app.patch('/api/assemblies/:id', async (req: Request, res: Response) => {
    try {
      const assembly = await storage.getAssembly(req.params.id as string);
      if (!assembly) {
        res.status(404).json({ error: 'Assembly not found' });
        return;
      }

      const allowedStates = ['queued', 'completed', 'exported', 'failed'];
      if (!allowedStates.includes(assembly.state)) {
        res.status(400).json({ error: `Cannot update assembly in state '${assembly.state}'. Allowed states: ${allowedStates.join(', ')}` });
        return;
      }

      if (!assembly.projectName) {
        res.status(400).json({ error: 'Assembly has no projectName' });
        return;
      }

      const { idea, context, input } = req.body;
      const updates: Record<string, unknown> = {};
      if (idea !== undefined) updates.idea = idea;
      if (context !== undefined) updates.context = context;
      if (input !== undefined) updates.input = input;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No valid fields to update. Allowed fields: idea, context, input' });
        return;
      }

      const updated = await storage.updateAssembly(req.params.id as string, updates);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update assembly' });
    }
  });

  app.get('/api/workspace-tree/:projectName', async (req: Request, res: Response) => {
    try {
      const projectName = req.params.projectName as string;

      if (projectName.includes('..') || projectName.includes('/') || projectName.includes('\\')) {
        res.status(400).json({ error: 'Invalid project name' });
        return;
      }

      const workspacePath = path.join(WORKSPACES_DIR, projectName);
      if (!fs.existsSync(workspacePath) || !fs.statSync(workspacePath).isDirectory()) {
        res.status(404).json({ error: 'Workspace not found' });
        return;
      }

      const SKIP_TREE_DIRS = new Set(['node_modules', '.git', '__pycache__', 'dist', '.cache', 'coverage']);
      const MAX_DEPTH = 4;

      interface TreeNode {
        name: string;
        path: string;
        type: 'file' | 'directory';
        children?: TreeNode[];
        size?: number;
      }

      function walkDir(dirPath: string, relativePath: string, depth: number): TreeNode[] {
        if (depth > MAX_DEPTH) return [];
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        const nodes: TreeNode[] = [];

        for (const entry of entries) {
          if (SKIP_TREE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
          const fullPath = path.join(dirPath, entry.name);
          const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

          if (entry.isDirectory()) {
            const children = walkDir(fullPath, relPath, depth + 1);
            nodes.push({ name: entry.name, path: relPath, type: 'directory', children });
          } else if (entry.isFile()) {
            const stat = fs.statSync(fullPath);
            nodes.push({ name: entry.name, path: relPath, type: 'file', size: stat.size });
          }
        }

        return nodes.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      }

      const tree = walkDir(workspacePath, '', 0);
      res.json({ projectName, tree });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to read workspace tree' });
    }
  });

  const activeRuns = new Map<string, boolean>();

  app.get('/api/assemblies/:id/run/stream', async (req: Request, res: Response) => {
    const assemblyId = req.params.id as string;
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
    const startFromStep = req.query.startFromStep as string | undefined;
    const presetsData = loadPresets();
    if (!presetsData) {
      res.status(500).json({ error: 'Could not load presets.json' });
      return;
    }

    const stagePlans = presetsData.stage_plans as Record<string, { label?: string; description?: string; steps: string[] } | string[]>;
    const presets = presetsData.presets as Record<string, { label: string; modules: string[]; include_dependencies?: boolean; guards?: Record<string, boolean> }>;

    const rawPlan = stagePlans[stagePlanId];
    const stageSteps = Array.isArray(rawPlan) ? rawPlan : rawPlan?.steps;
    if (!stageSteps) {
      res.status(400).json({ error: `Unknown stage plan: ${stagePlanId}` });
      return;
    }

    const presetId = assembly.presetId || assembly.preset || 'system';
    const preset = presets[presetId] || presets['system'];
    const presetModules = expandModulesWithDependencies(preset?.modules || [], preset?.include_dependencies ?? false);
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

    let skipUntilIndex = 0;
    if (startFromStep) {
      const idx = fullSteps.indexOf(startFromStep);
      if (idx > 0) skipUntilIndex = idx;
    }

    if (fullSteps.length === 0) {
      res.status(400).json({ error: 'No valid steps for this stage plan' });
      return;
    }

    const projectName = assembly.projectName;
    const buildRoot = getProjectPath(projectName);

    const assemblyRevision = assembly.revision ?? 1;
    const assemblyUpgradeNotes = assembly.upgradeNotes || '';
    const assemblyKitType = assembly.kitType || 'original';

    const assemblyEnv: Record<string, string> = {
      AXION_PROJECT_NAME: projectName,
      AXION_PROJECT_IDEA: (assembly as any).idea || '',
      AXION_REVISION: String(assemblyRevision),
      AXION_UPGRADE_NOTES: assemblyUpgradeNotes,
      AXION_KIT_TYPE: assemblyKitType,
    };

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    activeRuns.set(assemblyId, true);

    const stagePlanLabel = !Array.isArray(rawPlan) && rawPlan.label ? rawPlan.label : stagePlanId;

    await storage.updateAssembly(assemblyId, {
      state: 'running',
      step: fullSteps[0],
      progress: { currentIndex: 0, totalSteps: fullSteps.length, steps: fullSteps, stagePlanId, stagePlanLabel },
    });

    res.write(`event: plan\ndata: ${JSON.stringify({ assemblyId, presetId, stagePlan: stagePlanId, stagePlanLabel, steps: fullSteps, modules: presetModules, totalSteps: fullSteps.length, skipUntilIndex })}\n\n`);

    let aborted = false;
    let finished = false;
    let currentStepId: string | null = null;
    req.on('close', () => {
      aborted = true;
      activeRuns.delete(assemblyId);
      if (!finished) {
        storage.updateAssembly(assemblyId, {
          state: 'interrupted',
          errors: [`Pipeline interrupted: browser connection lost during step "${currentStepId || 'unknown'}". You can retry from this step.`],
        }).catch(() => {});
      }
    });

    const orchestrate = async () => {
      const allResults: RunResult[] = [];
      let verifyPassed = true;
      let lastError: string | null = null;
      let guardFailures = 0;

      for (let i = 0; i < fullSteps.length; i++) {
        if (aborted) break;
        const stepId = fullSteps[i];
        const step = pipelineSteps[stepId];
        currentStepId = stepId;

        if (i < skipUntilIndex) {
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: 'skipped', durationMs: 0, reason: 'Previously completed' })}\n\n`);
          continue;
        }

        await storage.updateAssembly(assemblyId as string, {
          step: stepId,
          progress: { currentIndex: i, totalSteps: fullSteps.length, steps: fullSteps, status: 'running' },
        });

        res.write(`event: step-start\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, total: fullSteps.length })}\n\n`);

        if (presetGuards.disallow_lock && stepId === 'lock') {
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: 'skipped', durationMs: 0, reason: 'Locking is disabled for this preset' })}\n\n`);
          continue;
        }
        if (presetGuards.lock_requires_verify_pass && stepId === 'lock' && !verifyPassed) {
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: 'error', durationMs: 0, reason: 'Documentation must pass verification before it can be locked. Run "Generate Documentation" first.' })}\n\n`);
          guardFailures++;
          continue;
        }

        if (stepId === 'content-fill') {
          const cfStart = Date.now();
          try {
            const modulesToFill = presetModules.length > 0 ? presetModules : getAllModulesInWorkspace(buildRoot);
            const idea = (assembly as any).idea || projectName;
            const structuredInput = (assembly as any).input as Record<string, string> | null;
            res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: `Scanning ${modulesToFill.length} modules for UNKNOWN placeholders...${structuredInput ? ' (with detailed project context)' : ''}` })}\n\n`);

            const fillReport = await fillAllModulesUnknowns(buildRoot, modulesToFill, projectName, idea, (msg) => {
              if (!aborted) {
                res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: msg })}\n\n`);
              }
            }, structuredInput);

            const cfDuration = Date.now() - cfStart;
            const summary = `Content Fill complete: ${fillReport.totalFilesFilled} filled, ${fillReport.totalFilesSkipped} skipped, ${fillReport.totalFilesErrored} errors`;
            res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: summary })}\n\n`);

            const cfStatus = fillReport.totalFilesErrored > 0 && fillReport.totalFilesFilled === 0 ? 'error' : 'success';
            res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: cfStatus, durationMs: cfDuration })}\n\n`);

            if (cfStatus === 'error') {
              lastError = 'Content fill failed for all files';
              break;
            }
          } catch (cfErr: unknown) {
            const cfDuration = Date.now() - cfStart;
            const cfErrMsg = cfErr instanceof Error ? cfErr.message : String(cfErr);
            res.write(`event: stderr\ndata: ${JSON.stringify({ index: i, stepId, text: `Content fill error: ${cfErrMsg}` })}\n\n`);
            res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: 'error', durationMs: cfDuration })}\n\n`);
            lastError = `Content fill failed: ${cfErrMsg}`;
            break;
          }
          continue;
        }

        const stepBody: Record<string, unknown> = {
          projectName,
          idea: (assembly as any).idea || '',
          context: (assembly as any).context || '',
          mode: (assembly as any).mode || '',
          category: (assembly as any).category || '',
        };
        if (presetModules.length > 0 && presetModules.length < 19) {
          stepBody.module = presetModules.join(',');
        }

        const perModuleSteps = ['generate', 'seed', 'review', 'draft', 'verify', 'lock'];
        if (perModuleSteps.includes(stepId) && presetModules.length > 0 && presetModules.length < 19) {
          const perModStart = Date.now();
          let modSucceeded = 0;
          let modFailed = 0;
          let modStdout = '';
          let modStderr = '';
          const failedModules: string[] = [];

          for (const mod of presetModules) {
            if (aborted) break;
            const modBody = { ...stepBody, module: mod };
            const modArgs = step.args(projectName, buildRoot, modBody);
            const modCwd = step.cwd ? step.cwd(buildRoot) : buildRoot;

            if (!aborted) {
              res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: `${step.label} module: ${mod}` })}\n\n`);
            }

            const modResult = await runSingleStep(step, modArgs, modCwd, aborted, (event, data) => {
              if (!aborted) res.write(`event: ${event}\ndata: ${JSON.stringify({ index: i, stepId, text: data })}\n\n`);
            }, assemblyEnv);

            modStdout += modResult.stdout;
            modStderr += modResult.stderr;
            if (modResult.status === 'success') {
              modSucceeded++;
            } else {
              if (stepId === 'lock') {
                const hasUnknowns = modResult.stdout.includes('UNKNOWN') || modResult.stderr.includes('UNKNOWN') || modResult.stderr.includes('critical unknowns');
                if (hasUnknowns) {
                  failedModules.push(mod);
                }
              }
              modFailed++;
            }
          }

          if (stepId === 'lock' && failedModules.length > 0 && !aborted) {
            const scanReport = scanAllModulesForUnknowns(buildRoot, failedModules);
            const fileList = scanReport.filesWithUnknowns.map(f => `  - ${f.relativePath} (${f.unknownCount} UNKNOWNs in: ${f.sections.join(', ')})`).join('\n');
            res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: `\n--- UNKNOWN Content Detected ---\nLock failed for ${failedModules.length} module(s) due to UNKNOWN placeholders.\nTotal UNKNOWNs: ${scanReport.totalUnknowns}\nFiles needing content:\n${fileList}\n\nThe workspace agent can fill these files using the project description. Use the /api/scan-unknowns endpoint to get the full report.` })}\n\n`);
          }

          const combinedResult: RunResult = {
            status: modFailed === 0 ? 'success' : 'error',
            command: step.label,
            exitCode: modFailed === 0 ? 0 : 1,
            stdout: modStdout,
            stderr: modStderr,
            durationMs: Date.now() - perModStart,
          };

          persistRunResult(stepId, step, projectName, combinedResult).catch(() => {});
          allResults.push(combinedResult);
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: combinedResult.status, exitCode: combinedResult.exitCode, durationMs: combinedResult.durationMs })}\n\n`);

          if (combinedResult.status === 'error') {
            if (stepId === 'verify') {
              verifyPassed = false;
            } else {
              lastError = `${step.label} failed for some modules (${modFailed} failed, ${modSucceeded} succeeded)`;
              break;
            }
          }
          continue;
        }

        if (stepId === 'scaffold-app') {
          ensureArchitectureReadme(buildRoot, assembly);
        }

        const args = step.args(projectName, buildRoot, stepBody);
        const cwd = step.cwd ? step.cwd(buildRoot) : buildRoot;

        const result = await runSingleStep(step, args, cwd, aborted, (event, data) => {
          if (!aborted) res.write(`event: ${event}\ndata: ${JSON.stringify({ index: i, stepId, text: data })}\n\n`);
        }, assemblyEnv);

        persistRunResult(stepId, step, projectName, result).catch(() => {});
        allResults.push(result);

        if (stepId === 'scaffold-app' && result.status === 'success') {
          writeStageMarker(buildRoot, 'scaffold-app', 'success');
        }

        if (stepId === 'build-plan') {
          writeStageMarker(buildRoot, 'build-plan', result.status === 'success' ? 'success' : 'failed');
        }

        if (stepId === 'build-exec') {
          writeStageMarker(buildRoot, 'build-exec', result.status === 'success' ? 'success' : 'failed');
        }

        if (stepId === 'test') {
          writeStageMarker(buildRoot, 'test', result.status === 'success' ? 'success' : 'failed');
        }

        if (stepId === 'deploy') {
          writeStageMarker(buildRoot, 'deploy', result.status === 'success' ? 'success' : 'failed');
        }

        if (stepId === 'package') {
          writeStageMarker(buildRoot, 'package', result.status === 'success' ? 'success' : 'failed');
        }

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

      finished = true;
      activeRuns.delete(assemblyId);

      if (!aborted) {
        const succeeded = allResults.filter(r => r.status === 'success').length;
        const failed = allResults.filter(r => r.status === 'error').length;
        const finalState = failed === 0 ? 'completed' : 'failed';

        await storage.updateAssembly(assemblyId, {
          state: finalState,
          step: fullSteps[fullSteps.length - 1],
          progress: { currentIndex: fullSteps.length, totalSteps: fullSteps.length, steps: fullSteps, status: finalState },
          errors: lastError ? [lastError] : undefined,
        });

        res.write(`event: done\ndata: ${JSON.stringify({ assemblyId, totalSteps: fullSteps.length, succeeded, failed, state: finalState })}\n\n`);
        res.end();
      }
    };

    orchestrate().catch((err) => {
      finished = true;
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

    const packageBuildRoot = getProjectPath(assembly.projectName);
    const args = step.args(assembly.projectName, packageBuildRoot, {});
    const result = await runCommand(step.cmd, args, 'Package');
    await persistRunResult('package', step, assembly.projectName, result);

    let zipPath: string | null = null;
    if (result.status === 'success') {
      await storage.updateAssembly(req.params.id as string, { state: 'exported' });
      try {
        const jsonMatch = result.stdout.match(/\{[\s\S]*"output_path"\s*:\s*"([^"]+)"[\s\S]*\}/);
        if (jsonMatch && jsonMatch[1]) {
          zipPath = jsonMatch[1];
        }
      } catch {}
      if (!zipPath) {
        const distDir = path.join(projectPath, 'dist');
        if (fs.existsSync(distDir)) {
          const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip')).sort().reverse();
          if (zips.length > 0) {
            zipPath = path.join(distDir, zips[0]);
          }
        }
      }
    }

    const kitMeta = {
      kitType: assembly.kitType || 'original',
      revision: assembly.revision ?? 1,
    };

    res.json({ ...result, zipPath: zipPath || null, kitMeta });
  });

  app.get('/api/assemblies/:id/download', async (req: Request, res: Response) => {
    const assembly = await storage.getAssembly(req.params.id as string);
    if (!assembly || !assembly.projectName) {
      res.status(404).json({ error: 'Assembly not found' });
      return;
    }

    const projectPath = getProjectPath(assembly.projectName);
    const distDir = path.join(projectPath, 'dist');

    let zipFile: string | null = null;
    if (req.query.file && typeof req.query.file === 'string') {
      const requested = path.basename(req.query.file);
      const candidate = path.join(distDir, requested);
      if (fs.existsSync(candidate) && requested.endsWith('.zip')) {
        zipFile = candidate;
      }
    }

    if (!zipFile && fs.existsSync(distDir)) {
      const zips = fs.readdirSync(distDir).filter(f => f.endsWith('.zip')).sort().reverse();
      if (zips.length > 0) {
        zipFile = path.join(distDir, zips[0]);
      }
    }

    if (!zipFile || !fs.existsSync(zipFile)) {
      res.status(404).json({ error: 'No exported zip file found. Run export first.' });
      return;
    }

    const resolvedZip = path.resolve(zipFile);
    const resolvedDist = path.resolve(distDir);
    if (!resolvedZip.startsWith(resolvedDist + path.sep)) {
      res.status(400).json({ error: 'Invalid file path' });
      return;
    }

    const filename = path.basename(zipFile);
    const stat = fs.statSync(zipFile);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stat.size);
    const stream = fs.createReadStream(zipFile);
    stream.pipe(res);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to read zip file' });
      }
    });
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

      const wsDir = WORKSPACES_DIR;
      if (!fs.existsSync(wsDir)) fs.mkdirSync(wsDir, { recursive: true });
      const entries = fs.readdirSync(wsDir, { withFileTypes: true });
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
            hasRegistry: fs.existsSync(path.join(projectPath, 'axion', 'registry')) || fs.existsSync(path.join(projectPath, 'registry')),
            hasDomains: fs.existsSync(path.join(projectPath, 'axion', 'domains')) || fs.existsSync(path.join(projectPath, 'domains')),
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

  app.delete('/api/workspaces/:projectName', async (req: Request, res: Response) => {
    const projectName = req.params.projectName as string;
    if (!projectName || /[\/\\]/.test(projectName) || projectName === '.' || projectName === '..') {
      res.status(400).json({ error: 'Invalid projectName' });
      return;
    }
    const projectPath = getProjectPath(projectName);
    const resolvedPath = path.resolve(projectPath);
    const resolvedWsDir = path.resolve(WORKSPACES_DIR);
    if (!resolvedPath.startsWith(resolvedWsDir + path.sep)) {
      res.status(400).json({ error: 'Invalid workspace path' });
      return;
    }
    try {
      if (fs.existsSync(resolvedPath)) {
        fs.rmSync(resolvedPath, { recursive: true, force: true });
      }
      await storage.deleteWorkspace(projectName);
      res.json({ status: 'deleted', projectName });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete workspace' });
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
      const buildRoot = getProjectPath(projectName);

      if (stepId === 'content-fill') {
        const cfStart = Date.now();
        try {
          const modulesToFill = getAllModulesInWorkspace(buildRoot);
          const idea = (req.body.idea as string) || projectName;
          const assemblyForFill = (await storage.getAssemblies()).find(a => a.projectName === projectName);
          const structuredInput = (assemblyForFill as any)?.input as Record<string, string> | null;
          const fillReport = await fillAllModulesUnknowns(buildRoot, modulesToFill, projectName, idea, undefined, structuredInput);
          const cfDuration = Date.now() - cfStart;
          const summary = `Content Fill: ${fillReport.totalFilesFilled} filled, ${fillReport.totalFilesSkipped} skipped, ${fillReport.totalFilesErrored} errors`;
          const cfResult: RunResult = {
            status: fillReport.totalFilesErrored > 0 && fillReport.totalFilesFilled === 0 ? 'error' : 'success',
            command: 'Content Fill',
            exitCode: 0,
            stdout: summary + '\n' + fillReport.results.map(r => `  ${r.module}/${path.basename(r.file)}: ${r.status} (${r.unknownsBefore}→${r.unknownsAfter})`).join('\n'),
            stderr: fillReport.results.filter(r => r.error).map(r => `${r.module}: ${r.error}`).join('\n'),
            durationMs: cfDuration,
          };
          await persistRunResult(stepId, step, projectName, cfResult);
          res.json(cfResult);
        } catch (cfErr: unknown) {
          const cfDuration = Date.now() - cfStart;
          const cfErrMsg = cfErr instanceof Error ? cfErr.message : String(cfErr);
          const cfResult: RunResult = {
            status: 'error',
            command: 'Content Fill',
            exitCode: 1,
            stdout: '',
            stderr: cfErrMsg,
            durationMs: cfDuration,
          };
          await persistRunResult(stepId, step, projectName, cfResult);
          res.json(cfResult);
        }
        return;
      }

      if (stepId === 'scaffold-app') {
        ensureArchitectureReadme(buildRoot, { projectName });
      }
      const args = step.args(projectName, buildRoot, req.body);
      const cwd = step.cwd ? step.cwd(buildRoot) : buildRoot;
      const result = await runCommand(step.cmd, args, step.label, cwd);
      if (stepId === 'scaffold-app' && result.status === 'success') {
        writeStageMarker(buildRoot, 'scaffold-app', 'success');
      }
      if (stepId === 'test') {
        writeStageMarker(buildRoot, 'test', result.status === 'success' ? 'success' : 'failed');
      }
      if (stepId === 'deploy') {
        writeStageMarker(buildRoot, 'deploy', result.status === 'success' ? 'success' : 'failed');
      }
      if (stepId === 'package') {
        writeStageMarker(buildRoot, 'package', result.status === 'success' ? 'success' : 'failed');
      }
      await persistRunResult(stepId, step, projectName, result);
      res.json(result);
    });

    app.get(`/api/pipeline/${stepId}/stream`, async (req: Request, res: Response) => {
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

      const buildRoot = getProjectPath(projectName);

      if (stepId === 'content-fill') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        });
        const cfStart = Date.now();
        try {
          const modulesToFill = getAllModulesInWorkspace(buildRoot);
          const idea = (body.idea as string) || projectName;
          res.write(`event: stdout\ndata: Scanning ${modulesToFill.length} modules for UNKNOWN placeholders...\n\n`);
          const fillReport = await fillAllModulesUnknowns(buildRoot, modulesToFill, projectName, idea, (msg) => {
            res.write(`event: stdout\ndata: ${msg}\n\n`);
          });
          const cfDuration = Date.now() - cfStart;
          const summary = `Content Fill complete: ${fillReport.totalFilesFilled} filled, ${fillReport.totalFilesSkipped} skipped, ${fillReport.totalFilesErrored} errors`;
          res.write(`event: stdout\ndata: ${summary}\n\n`);
          res.write(`event: done\ndata: ${JSON.stringify({ status: 'success', durationMs: cfDuration })}\n\n`);
        } catch (cfErr: unknown) {
          const cfErrMsg = cfErr instanceof Error ? cfErr.message : String(cfErr);
          res.write(`event: stderr\ndata: ${cfErrMsg}\n\n`);
          res.write(`event: done\ndata: ${JSON.stringify({ status: 'error', durationMs: Date.now() - cfStart })}\n\n`);
        }
        res.end();
        return;
      }

      if (stepId === 'scaffold-app') {
        ensureArchitectureReadme(buildRoot, { projectName });
      }
      const args = step.args(projectName, buildRoot, body);
      const cwd = step.cwd ? step.cwd(buildRoot) : buildRoot;

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
        shell: true,
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
        if (stepId === 'scaffold-app' && result.status === 'success') {
          writeStageMarker(buildRoot, 'scaffold-app', 'success');
        }
        if (stepId === 'test') {
          writeStageMarker(buildRoot, 'test', result.status === 'success' ? 'success' : 'failed');
        }
        if (stepId === 'deploy') {
          writeStageMarker(buildRoot, 'deploy', result.status === 'success' ? 'success' : 'failed');
        }
        if (stepId === 'package') {
          writeStageMarker(buildRoot, 'package', result.status === 'success' ? 'success' : 'failed');
        }
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
    const presets = presetsData.presets as Record<string, { label: string; modules: string[]; include_dependencies?: boolean; guards?: Record<string, boolean> }> | undefined;
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

    const presetModules = expandModulesWithDependencies(preset.modules || [], preset.include_dependencies ?? false);
    const presetGuards = preset.guards || {};

    const buildRoot = getProjectPath(projectName);

    const assemblyEnv2: Record<string, string> = {
      AXION_PROJECT_NAME: projectName,
      AXION_PROJECT_IDEA: (body.idea as string) || '',
    };

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
      let guardFailures = 0;
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
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: 'skipped', durationMs: 0, reason: 'Locking is disabled for this preset' })}\n\n`);
          continue;
        }
        if (presetGuards.lock_requires_verify_pass && stepId === 'lock' && !verifyPassed) {
          res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: 'error', durationMs: 0, reason: 'Documentation must pass verification before it can be locked. Run "Generate Documentation" first.' })}\n\n`);
          guardFailures++;
          continue;
        }

        if (stepId === 'content-fill') {
          const cfStart2 = Date.now();
          try {
            const modulesToFill2 = presetModules.length > 0 ? presetModules : getAllModulesInWorkspace(buildRoot);
            const idea2 = (body.idea as string) || projectName;
            res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: `Scanning ${modulesToFill2.length} modules for UNKNOWN placeholders...` })}\n\n`);

            const fillReport2 = await fillAllModulesUnknowns(buildRoot, modulesToFill2, projectName, idea2, (msg) => {
              if (!aborted) {
                res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: msg })}\n\n`);
              }
            });

            const cfDuration2 = Date.now() - cfStart2;
            const summary2 = `Content Fill complete: ${fillReport2.totalFilesFilled} filled, ${fillReport2.totalFilesSkipped} skipped, ${fillReport2.totalFilesErrored} errors`;
            res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: summary2 })}\n\n`);

            const cfStatus2 = fillReport2.totalFilesErrored > 0 && fillReport2.totalFilesFilled === 0 ? 'error' : 'success';
            res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: cfStatus2, durationMs: cfDuration2 })}\n\n`);

            if (cfStatus2 === 'error' && !body.continueOnError) {
              break;
            }
          } catch (cfErr2: unknown) {
            const cfDuration2 = Date.now() - cfStart2;
            const cfErrMsg2 = cfErr2 instanceof Error ? cfErr2.message : String(cfErr2);
            res.write(`event: stderr\ndata: ${JSON.stringify({ index: i, stepId, text: `Content fill error: ${cfErrMsg2}` })}\n\n`);
            res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: step.label, status: 'error', durationMs: cfDuration2 })}\n\n`);
            if (!body.continueOnError) break;
          }
          continue;
        }

        const perModuleSteps2 = ['generate', 'seed', 'review', 'draft', 'verify', 'lock'];
        if (perModuleSteps2.includes(stepId) && presetModules.length > 0 && presetModules.length < 19) {
          const perModStart = Date.now();
          let modSucceeded = 0;
          let modFailed = 0;
          let modStdout = '';
          let modStderr = '';
          const failedModules2: string[] = [];

          for (const mod of presetModules) {
            if (aborted) break;
            const modBody = { ...stepBody, module: mod };
            const modArgs = step.args(projectName, buildRoot, modBody);
            const modCwd = step.cwd ? step.cwd(buildRoot) : buildRoot;

            if (!aborted) {
              res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: `${step.label} module: ${mod}` })}\n\n`);
            }

            const modResult = await runSingleStep(step, modArgs, modCwd, aborted, (event, data) => {
              if (!aborted) res.write(`event: ${event}\ndata: ${JSON.stringify({ index: i, stepId, text: data })}\n\n`);
            }, assemblyEnv2);

            modStdout += modResult.stdout;
            modStderr += modResult.stderr;
            if (modResult.status === 'success') {
              modSucceeded++;
            } else {
              if (stepId === 'lock') {
                const hasUnknowns = modResult.stdout.includes('UNKNOWN') || modResult.stderr.includes('UNKNOWN') || modResult.stderr.includes('critical unknowns');
                if (hasUnknowns) {
                  failedModules2.push(mod);
                }
              }
              modFailed++;
              if (!aborted) {
                res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: `${step.label} for ${mod}: failed (exit ${modResult.exitCode})` })}\n\n`);
              }
            }
          }

          if (stepId === 'lock' && failedModules2.length > 0 && !aborted) {
            const scanReport = scanAllModulesForUnknowns(buildRoot, failedModules2);
            const fileList = scanReport.filesWithUnknowns.map(f => `  - ${f.relativePath} (${f.unknownCount} UNKNOWNs in: ${f.sections.join(', ')})`).join('\n');
            res.write(`event: stdout\ndata: ${JSON.stringify({ index: i, stepId, text: `\n--- UNKNOWN Content Detected ---\nLock failed for ${failedModules2.length} module(s) due to UNKNOWN placeholders.\nTotal UNKNOWNs: ${scanReport.totalUnknowns}\nFiles needing content:\n${fileList}\n\nThe workspace agent can fill these files using the project description. Use the /api/scan-unknowns endpoint to get the full report.` })}\n\n`);
          }

          const combinedResult: RunResult = {
            status: modFailed === 0 ? 'success' : 'error',
            command: step.label,
            exitCode: modFailed === 0 ? 0 : 1,
            stdout: modStdout,
            stderr: modStderr,
            durationMs: Date.now() - perModStart,
          };

          persistRunResult(stepId, step, projectName, combinedResult).catch(() => {});
          allResults.push(combinedResult);

          if (!aborted) {
            const reason = `${modSucceeded} succeeded, ${modFailed} failed`;
            res.write(`event: step-done\ndata: ${JSON.stringify({ index: i, stepId, label: `${step.label} (${presetModules.length} modules)`, status: combinedResult.status, exitCode: combinedResult.exitCode, durationMs: combinedResult.durationMs, reason })}\n\n`);
          }

          if (combinedResult.status === 'error') {
            if (stepId === 'verify') {
              verifyPassed = false;
            } else if (!body.continueOnError) {
              break;
            }
          }
          continue;
        }

        if (stepId === 'scaffold-app') {
          ensureArchitectureReadme(buildRoot, { projectName });
        }

        const args = step.args(projectName, buildRoot, stepBody);
        const cwd = step.cwd ? step.cwd(buildRoot) : buildRoot;

        const result = await new Promise<RunResult>((resolve) => {
          const start = Date.now();
          let stdout = '';
          let stderr = '';

          const child = spawn(step.cmd, args, {
            cwd,
            env: { ...process.env, ...assemblyEnv2 },
            timeout: 300000,
            shell: true,
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

        if (stepId === 'scaffold-app' && result.status === 'success') {
          writeStageMarker(buildRoot, 'scaffold-app', 'success');
        }

        if (stepId === 'build-plan') {
          writeStageMarker(buildRoot, 'build-plan', result.status === 'success' ? 'success' : 'failed');
        }

        if (stepId === 'build-exec') {
          writeStageMarker(buildRoot, 'build-exec', result.status === 'success' ? 'success' : 'failed');
        }

        if (stepId === 'test') {
          writeStageMarker(buildRoot, 'test', result.status === 'success' ? 'success' : 'failed');
        }

        if (stepId === 'deploy') {
          writeStageMarker(buildRoot, 'deploy', result.status === 'success' ? 'success' : 'failed');
        }

        if (stepId === 'package') {
          writeStageMarker(buildRoot, 'package', result.status === 'success' ? 'success' : 'failed');
        }

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
    const wsAxionRegistry = path.join(projectPath, 'axion', 'registry');
    const projectRegistry = path.join(projectPath, 'registry');
    const reportPaths: Record<string, string[]> = {
      'import-report': [
        path.join(wsAxionRegistry, 'import_report.json'),
        path.join(projectRegistry, 'import_report.json'),
      ],
      'import-facts': [
        path.join(wsAxionRegistry, 'import_facts.json'),
        path.join(projectRegistry, 'import_facts.json'),
      ],
      'reconcile': [
        path.join(wsAxionRegistry, 'reconcile_report.json'),
        path.join(projectRegistry, 'reconcile_report.json'),
      ],
      'iteration-state': [
        path.join(wsAxionRegistry, 'iteration_state.json'),
        path.join(projectRegistry, 'iteration_state.json'),
      ],
      'build-plan': [
        path.join(wsAxionRegistry, 'build_plan.json'),
        path.join(projectRegistry, 'build_plan.json'),
      ],
      'build-exec': [
        path.join(wsAxionRegistry, 'build_exec_report.json'),
        path.join(projectRegistry, 'build_exec_report.json'),
      ],
      'stack-profile': [
        path.join(wsAxionRegistry, 'stack_profile.json'),
        path.join(projectRegistry, 'stack_profile.json'),
      ],
      'verify': [
        path.join(wsAxionRegistry, 'verify_report.json'),
        path.join(projectRegistry, 'verify_report.json'),
      ],
      'verify-status': [
        path.join(wsAxionRegistry, 'verify_status.json'),
        path.join(projectRegistry, 'verify_status.json'),
      ],
      'test': [
        path.join(wsAxionRegistry, 'test_report.json'),
        path.join(projectRegistry, 'test_report.json'),
      ],
      'active-build': [
        path.join(projectPath, 'ACTIVE_BUILD.json'),
      ],
      'lock-manifest': [
        path.join(wsAxionRegistry, 'lock_manifest.json'),
        path.join(projectRegistry, 'lock_manifest.json'),
      ],
      'stage-markers': [
        path.join(wsAxionRegistry, 'stage_markers.json'),
        path.join(projectRegistry, 'stage_markers.json'),
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
        path.join(projectPath, 'axion', 'registry'),
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
      if (fs.existsSync(path.join(projectPath, 'axion', 'registry', file)) ||
          fs.existsSync(path.join(projectPath, 'registry', file))) {
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
      hasDomains: fs.existsSync(path.join(projectPath, 'axion', 'domains')) || fs.existsSync(path.join(projectPath, 'domains')),
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

    const wsAxionDomainsDir = path.join(projectPath, 'axion', 'domains');
    const projectDomainsDir = path.join(projectPath, 'domains');

    const moduleDirs = new Set<string>();
    for (const dir of [wsAxionDomainsDir, projectDomainsDir]) {
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
    const wsRegistryDir = path.join(projectPath, 'axion', 'registry');
    const projectRegistryDir = path.join(projectPath, 'registry');

    for (const mod of moduleDirs) {
      const stageStatuses: Record<string, string> = {};
      for (const stage of stages) {
        let status = 'pending';
        for (const dir of [wsRegistryDir, projectRegistryDir]) {
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
      for (const dir of [wsAxionDomainsDir, projectDomainsDir]) {
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

  app.get('/api/scan-unknowns', (req: Request, res: Response) => {
    const modules = req.query.modules as string | undefined;
    const projectName = req.query.projectName as string | undefined;
    const scanRoot = projectName ? getProjectPath(projectName) : PROJECT_ROOT;
    let moduleList: string[] = [];

    if (modules) {
      moduleList = modules.split(',').map(m => m.trim()).filter(Boolean);
    } else {
      const domainsDir = path.join(scanRoot, 'axion', 'domains');
      if (fs.existsSync(domainsDir)) {
        try {
          const entries = fs.readdirSync(domainsDir, { withFileTypes: true });
          moduleList = entries.filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name);
        } catch {}
      }
    }

    if (moduleList.length === 0) {
      res.json({ totalUnknowns: 0, totalFiles: 0, filesWithUnknowns: [] });
      return;
    }

    const report = scanAllModulesForUnknowns(scanRoot, moduleList);
    res.json(report);
  });

  app.post('/api/revise-unknowns/start', async (req: Request, res: Response) => {
    try {
      const { projectName } = req.body;
      const scanRoot = projectName ? getProjectPath(projectName) : PROJECT_ROOT;
      const target = findNextTarget(scanRoot);

      if (!target) {
        res.json({ done: true, message: 'No UNKNOWNs remaining', target: null, questions: [], remainingUnknowns: 0, totalFilesWithUnknowns: 0 });
        return;
      }

      const assembly = projectName
        ? (await storage.getAssemblies()).find(a => a.projectName === projectName)
        : null;
      const projectIdea = assembly?.idea || projectName || 'software project';

      const questions = await generateQuestionsForTarget(target, projectName || 'project', projectIdea);

      const allTargets = getAllTargets(scanRoot);
      const totalUnknowns = allTargets.reduce((s, t) => s + t.unknownCount, 0);

      res.json({
        done: false,
        target,
        questions,
        remainingUnknowns: totalUnknowns,
        totalFilesWithUnknowns: allTargets.length,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: errMsg });
    }
  });

  app.post('/api/revise-unknowns/fill', async (req: Request, res: Response) => {
    try {
      const { projectName, targetFile, targetModule, answers } = req.body;
      const scanRoot = projectName ? getProjectPath(projectName) : PROJECT_ROOT;

      const assembly = projectName
        ? (await storage.getAssemblies()).find(a => a.projectName === projectName)
        : null;
      const projName = projectName || 'project';
      const projectIdea = assembly?.idea || projectName || 'software project';
      const assemblyStructuredInput = (assembly as any)?.input as Record<string, string> | null;

      const result = await cascadeFill(
        scanRoot,
        targetFile,
        targetModule,
        projName,
        projectIdea,
        answers || {},
        undefined,
        assemblyStructuredInput,
      );

      res.json({
        targetFilled: result.targetFilled,
        cascadeResults: result.cascadeResults,
        remainingScan: result.remainingScan,
        nextTarget: result.nextTarget,
        done: result.nextTarget === null,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: errMsg });
    }
  });

  // ── Test Suite API ──────────────────────────────────────────────
  let lastTestResult: {
    timestamp: string;
    durationMs: number;
    status: 'pass' | 'fail' | 'error' | 'cancelled';
    summary: { total: number; passed: number; failed: number; skipped: number };
    testFiles: Array<{
      file: string;
      status: 'pass' | 'fail';
      durationMs: number;
      tests: Array<{
        name: string;
        fullName: string;
        status: 'pass' | 'fail' | 'skip';
        durationMs: number;
        error?: string;
      }>;
    }>;
    errorOutput?: string;
    rawOutput?: string;
  } | null = null;

  let testRunning = false;
  let testChildProcess: ReturnType<typeof spawn> | null = null;
  let testCancelled = false;

  app.get('/api/tests/files', (_req: Request, res: Response) => {
    const testsDir = path.join(PROJECT_ROOT, 'tests');
    if (!fs.existsSync(testsDir)) {
      res.json({ files: [] });
      return;
    }
    const files: { path: string; name: string; dir: string }[] = [];
    function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'fixtures' && entry.name !== 'helpers' && entry.name !== 'temp') {
          walk(full);
        } else if (entry.isFile() && /\.(test|spec)\.\w+$/.test(entry.name)) {
          const rel = path.relative(PROJECT_ROOT, full);
          const dirPart = path.relative(PROJECT_ROOT, dir);
          files.push({ path: rel, name: entry.name, dir: dirPart });
        }
      }
    }
    walk(testsDir);
    files.sort((a, b) => a.path.localeCompare(b.path));
    res.json({ files });
  });

  app.get('/api/tests/last', (_req: Request, res: Response) => {
    res.json({ running: testRunning, result: lastTestResult });
  });

  function killProcessTree(pid: number) {
    try { process.kill(-pid, 'SIGTERM'); } catch {}
    try { process.kill(pid, 'SIGTERM'); } catch {}
    setTimeout(() => {
      try { process.kill(-pid, 'SIGKILL'); } catch {}
      try { process.kill(pid, 'SIGKILL'); } catch {}
    }, 1000);
    try {
      const children = execSync(`pgrep -P ${pid} 2>/dev/null || true`, { encoding: 'utf-8' }).trim();
      if (children) {
        for (const cpid of children.split('\n').filter(Boolean)) {
          const n = parseInt(cpid, 10);
          if (!isNaN(n)) {
            try { process.kill(n, 'SIGTERM'); } catch {}
            setTimeout(() => { try { process.kill(n, 'SIGKILL'); } catch {} }, 1000);
          }
        }
      }
    } catch {}
  }

  app.post('/api/tests/cancel', (_req: Request, res: Response) => {
    if (!testRunning || !testChildProcess) {
      res.status(400).json({ error: 'No test run in progress' });
      return;
    }
    testCancelled = true;
    const pid = testChildProcess.pid;
    if (pid) {
      killProcessTree(pid);
    } else {
      try { testChildProcess.kill('SIGKILL'); } catch {}
    }
    setTimeout(() => {
      if (testRunning) {
        testRunning = false;
        testChildProcess = null;
        testCancelled = false;
      }
    }, 10000);
    res.json({ ok: true, message: 'Test run cancellation requested' });
  });

  app.post('/api/tests/run', (req: Request, res: Response) => {
    if (testRunning) {
      res.status(409).json({ error: 'A test run is already in progress' });
      return;
    }

    const filterFile = req.body?.file as string | undefined;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    testRunning = true;
    testCancelled = false;
    let aborted = false;
    req.on('close', () => {
      aborted = true;
      clearInterval(heartbeat);
    });

    res.write(`event: start\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);

    const heartbeat = setInterval(() => {
      if (!aborted) {
        res.write(`event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`);
      }
    }, 10000);

    const jsonOutFile = `/tmp/vitest-results-${Date.now()}.json`;
    const args = ['--run', '--reporter=default', '--reporter=json', `--outputFile.json=${jsonOutFile}`];
    if (filterFile) {
      args.push(filterFile);
    }

    const start = Date.now();
    let stdoutBuffer = '';
    let stderrOutput = '';
    let filesCompleted = 0;

    const stripAnsi = (str: string) => str.replace(/\u001b\[[0-9;]*m/g, '');

    const vitestBin = path.join(PROJECT_ROOT, 'node_modules', '.bin', 'vitest');
    const child = spawn(vitestBin, args, {
      cwd: PROJECT_ROOT,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
      timeout: 300000,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    testChildProcess = child;

    child.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      stdoutBuffer += text;

      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop() || '';

      for (const line of lines) {
        const clean = stripAnsi(line).trim();
        if (!clean) continue;

        const filePassMatch = clean.match(/^[✓✔√]\s+([\w/.-]+\.(?:test|spec)\.\w+)\s+\((\d+)\s+tests?\)\s+(\d+m?s)/);
        const fileFailMatch = clean.match(/^[❯✗✘×x]\s+([\w/.-]+\.(?:test|spec)\.\w+)\s+\((\d+)\s+tests?\s*(?:\|\s*\d+\s+failed)?\)\s+(\d+m?s)/);
        const filePassMatch2 = clean.match(/^[✓✔√]\s+([\w/.-]+\.(?:test|spec)\.\w+)\s+(\d+m?s)/);
        const fileFailMatch2 = clean.match(/^[❯✗✘×x]\s+([\w/.-]+\.(?:test|spec)\.\w+)\s+(\d+m?s)/);

        if (!filePassMatch && !fileFailMatch && !filePassMatch2 && !fileFailMatch2) {
          const altMatch = clean.match(/^[❯✗✘×x✓✔√]\s+(.+?\.(?:test|spec)\.\w+)\s+\((\d+)\s+test/);
          if (altMatch) {
            const isPass = /^[✓✔√]/.test(clean);
            const durMatch = clean.match(/(\d+m?s)\s*$/);
            filesCompleted++;
            if (!aborted) {
              res.write(`event: file-complete\ndata: ${JSON.stringify({
                file: altMatch[1].trim(),
                status: isPass ? 'pass' : 'fail',
                testCount: parseInt(altMatch[2]),
                duration: durMatch ? durMatch[1] : '',
                index: filesCompleted,
              })}\n\n`);
            }
            continue;
          }
        }

        if (filePassMatch || fileFailMatch) {
          const m = filePassMatch || fileFailMatch;
          filesCompleted++;
          if (!aborted) {
            res.write(`event: file-complete\ndata: ${JSON.stringify({
              file: m![1].trim(),
              status: filePassMatch ? 'pass' : 'fail',
              testCount: parseInt(m![2]),
              duration: m![3].trim(),
              index: filesCompleted,
            })}\n\n`);
          }
        } else if (filePassMatch2 || fileFailMatch2) {
          const m = filePassMatch2 || fileFailMatch2;
          filesCompleted++;
          if (!aborted) {
            res.write(`event: file-complete\ndata: ${JSON.stringify({
              file: m![1].trim(),
              status: filePassMatch2 ? 'pass' : 'fail',
              testCount: 0,
              duration: m![2].trim(),
              index: filesCompleted,
            })}\n\n`);
          }
        }
      }

      if (!aborted) {
        res.write(`event: progress\ndata: ${JSON.stringify({ type: 'stdout', text: stripAnsi(text).substring(0, 500) })}\n\n`);
      }
    });

    child.stderr.on('data', (data: Buffer) => {
      stderrOutput += data.toString();
      if (!aborted) {
        res.write(`event: progress\ndata: ${JSON.stringify({ type: 'stderr', text: data.toString().substring(0, 500) })}\n\n`);
      }
    });

    child.on('close', (code: number | null) => {
      clearInterval(heartbeat);
      const durationMs = Date.now() - start;
      testRunning = false;
      testChildProcess = null;
      const wasCancelled = testCancelled;
      testCancelled = false;

      let parsed: any = null;
      try {
        const jsonContent = fs.readFileSync(jsonOutFile, 'utf-8');
        parsed = JSON.parse(jsonContent);
        try { fs.unlinkSync(jsonOutFile); } catch {}
      } catch {}

      if (parsed && parsed.testResults && Array.isArray(parsed.testResults)) {
        try {
          const testFiles: typeof lastTestResult extends null ? never : NonNullable<typeof lastTestResult>['testFiles'] = [];

          for (const fileResult of parsed.testResults) {
            const relFile = (fileResult.name as string).replace(PROJECT_ROOT + '/', '');
            const tests: Array<{ name: string; fullName: string; status: 'pass' | 'fail' | 'skip'; durationMs: number; error?: string }> = [];

            if (fileResult.assertionResults && Array.isArray(fileResult.assertionResults)) {
              for (const t of fileResult.assertionResults) {
                const status = t.status === 'passed' ? 'pass' as const
                  : t.status === 'failed' ? 'fail' as const
                  : 'skip' as const;
                tests.push({
                  name: t.title || t.ancestorTitles?.join(' > ') || 'unknown',
                  fullName: t.fullName || t.title || 'unknown',
                  status,
                  durationMs: t.duration || 0,
                  error: t.failureMessages?.join('\n') || undefined,
                });
              }
            }

            testFiles.push({
              file: relFile,
              status: fileResult.status === 'passed' ? 'pass' : 'fail',
              durationMs: fileResult.endTime - fileResult.startTime || 0,
              tests,
            });
          }

          const passed = testFiles.reduce((sum, f) => sum + f.tests.filter(t => t.status === 'pass').length, 0);
          const failed = testFiles.reduce((sum, f) => sum + f.tests.filter(t => t.status === 'fail').length, 0);
          const skipped = testFiles.reduce((sum, f) => sum + f.tests.filter(t => t.status === 'skip').length, 0);

          lastTestResult = {
            timestamp: new Date().toISOString(),
            durationMs,
            status: wasCancelled ? 'cancelled' : (failed > 0 ? 'fail' : 'pass'),
            summary: { total: passed + failed + skipped, passed, failed, skipped },
            testFiles,
          };

          if (!aborted) {
            const eventName = wasCancelled ? 'cancelled' : 'done';
            res.write(`event: ${eventName}\ndata: ${JSON.stringify(lastTestResult)}\n\n`);
            res.end();
          }
          return;
        } catch {}
      }

      if (wasCancelled) {
        const cancelledResult = {
          timestamp: new Date().toISOString(),
          durationMs,
          status: 'cancelled' as const,
          summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
          testFiles: [] as NonNullable<typeof lastTestResult>['testFiles'],
          rawOutput: 'Test run was cancelled by user.',
        };
        lastTestResult = cancelledResult;
        if (!aborted) {
          res.write(`event: cancelled\ndata: ${JSON.stringify(cancelledResult)}\n\n`);
          res.end();
        }
        return;
      }

      const errorResult = {
        timestamp: new Date().toISOString(),
        durationMs,
        status: 'error' as const,
        summary: { total: 0, passed: 0, failed: 0, skipped: 0 },
        testFiles: [] as NonNullable<typeof lastTestResult>['testFiles'],
        errorOutput: stderrOutput.substring(0, 5000),
        rawOutput: stdoutBuffer.substring(0, 5000),
      };
      lastTestResult = errorResult;

      if (!aborted) {
        res.write(`event: done\ndata: ${JSON.stringify(errorResult)}\n\n`);
        res.end();
      }
    });

    child.on('error', (err: Error) => {
      clearInterval(heartbeat);
      testRunning = false;
      testChildProcess = null;
      if (!aborted) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    });
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
      shell: true,
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
