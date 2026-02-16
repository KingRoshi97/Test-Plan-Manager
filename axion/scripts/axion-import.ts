#!/usr/bin/env node
// AXION Import Mode v1
//
// Read-only analysis of an existing repo, producing an Import Report + Doc Seeds
// that the existing docs pipeline can refine. Never modifies the source repo.
//
// Modes:
//   --analyze (default)      Read-only scan, produce reports + doc seeds
//   --emit-manifest          Also emit import_patch_manifest.json with suggested anchor insertions
//
// Outputs:
//   WORKSPACE/registry/import_report.json    Full analysis report
//   WORKSPACE/registry/import_facts.json     Normalized subset for downstream stages
//   WORKSPACE/registry/import_patch_manifest.json  (optional, with --emit-manifest)
//   WORKSPACE/domains/*/README.md            Doc seeds (architecture, systems, contracts, frontend, backend)
//
// Safety:
//   - Never writes to source-root (read-only guarantee)
//   - Assumes kit/workspace already exists (run kit-create first)
//
// Usage:
//   npx tsx axion/scripts/axion-import.ts --source-root PATH --build-root PATH --project-name NAME
//   npx tsx axion/scripts/axion-import.ts --source-root PATH --build-root PATH --project-name NAME --emit-manifest

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { writeJsonAtomic, writeTextAtomic } from './lib/atomic-writer.js';

interface ImportOptions {
  sourceRoot: string;
  buildRoot: string;
  projectName: string;
  emitManifest: boolean;
  jsonOutput: boolean;
  dryRun: boolean;
}

interface ImportResult {
  status: 'success' | 'failed' | 'blocked_by';
  stage: string;
  workspace_root?: string;
  source_root?: string;
  stack_id_candidate?: string;
  signals?: number;
  artifacts_written?: string[];
  reason_codes?: string[];
  hint?: string[];
}

interface RouteInfo {
  method: string;
  path: string;
  file: string;
  line: number;
}

interface HealthInfo {
  found: boolean;
  paths: Array<{ path: string; file: string; line: number }>;
}

interface AnchorSuggestion {
  file: string;
  anchor_id: string;
  insertion_hint: string;
}

interface ImportReport {
  version: string;
  generated_at: string;
  source_root: string;
  workspace_root: string;
  signals: {
    files_scanned: number;
    package_json_found: boolean;
    lockfile_found: string | null;
    directories: string[];
    file_extensions: Record<string, number>;
  };
  detections: {
    languages: string[];
    framework_hints: string[];
    package_manager_hint: string | null;
    stack_id_candidate: string;
    confidence: number;
    entrypoints: string[];
    routes: RouteInfo[];
    health: HealthInfo;
    anchor_suggestions: AnchorSuggestion[];
    warnings: string[];
  };
}

interface ImportFacts {
  version: string;
  generated_at: string;
  stack_id_candidate: string;
  app_dir_candidate: string | null;
  server_entry_candidate: string | null;
  health_path_candidate: string | null;
  anchor_targets: Array<{ target_path: string; anchors: string[] }>;
}

interface PatchManifestOp {
  op_id: string;
  type: 'patch_file';
  target_path: string;
  anchor: {
    type: 'marker';
    value: string;
    occurrence: number;
  };
  patch: {
    mode: 'insert_after';
    content: string;
  };
}

interface ImportPatchManifest {
  version: string;
  generated_at: string;
  producer: { script: string; revision: number };
  workspace_root: string;
  project_name: string;
  source_root: string;
  stack_id_candidate: string;
  ops: PatchManifestOp[];
}

function parseArgs(args: string[]): ImportOptions {
  const options: ImportOptions = {
    sourceRoot: '',
    buildRoot: '',
    projectName: '',
    emitManifest: false,
    jsonOutput: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--source-root':
        options.sourceRoot = args[++i] || '';
        break;
      case '--build-root':
        options.buildRoot = args[++i] || '';
        break;
      case '--project-name':
        options.projectName = args[++i] || '';
        break;
      case '--emit-manifest':
        options.emitManifest = true;
        break;
      case '--analyze':
        break;
      case '--json':
        options.jsonOutput = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
    }
  }

  return options;
}

function hashDirectoryTree(dirPath: string, maxDepth: number = 5): string {
  const hash = crypto.createHash('sha256');
  collectTreeHashes(dirPath, hash, 0, maxDepth);
  return hash.digest('hex');
}

function collectTreeHashes(dirPath: string, hash: crypto.Hash, depth: number, maxDepth: number): void {
  if (depth > maxDepth) return;
  if (!fs.existsSync(dirPath)) return;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return;
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.axion_test_runs') continue;
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isFile()) {
      hash.update(`F:${path.relative(dirPath, fullPath)}:`);
      try {
        const content = fs.readFileSync(fullPath);
        hash.update(content);
      } catch {
        hash.update('UNREADABLE');
      }
    } else if (entry.isDirectory()) {
      hash.update(`D:${entry.name}:`);
      collectTreeHashes(fullPath, hash, depth + 1, maxDepth);
    }
  }
}

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.github', '.vscode', '.idea',
  'dist', 'build', 'out', '.next', '.nuxt', '__pycache__',
  'coverage', '.nyc_output', '.cache', '.axion_test_runs',
]);

function scanDirectory(rootDir: string, maxDepth: number = 4): {
  files: string[];
  dirs: string[];
  extensions: Record<string, number>;
} {
  const files: string[] = [];
  const dirs: string[] = [];
  const extensions: Record<string, number> = {};

  function walk(dir: string, depth: number): void {
    if (depth > maxDepth) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const rel = path.relative(rootDir, path.join(dir, entry.name));

      if (entry.isDirectory()) {
        dirs.push(rel);
        walk(path.join(dir, entry.name), depth + 1);
      } else if (entry.isFile()) {
        files.push(rel);
        const ext = path.extname(entry.name).toLowerCase();
        if (ext) {
          extensions[ext] = (extensions[ext] || 0) + 1;
        }
      }
    }
  }

  walk(rootDir, 0);
  return { files, dirs, extensions };
}

interface PackageJsonData {
  name?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function detectPackageJson(sourceRoot: string): PackageJsonData | null {
  const pkgPath = path.join(sourceRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch {
    return null;
  }
}

function detectLockfile(sourceRoot: string): string | null {
  if (fs.existsSync(path.join(sourceRoot, 'package-lock.json'))) return 'npm';
  if (fs.existsSync(path.join(sourceRoot, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(sourceRoot, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(sourceRoot, 'bun.lockb'))) return 'bun';
  return null;
}

function detectLanguages(extensions: Record<string, number>, files: string[]): string[] {
  const langs: string[] = [];
  if (extensions['.ts'] || extensions['.tsx']) langs.push('typescript');
  if (extensions['.js'] || extensions['.jsx']) langs.push('javascript');
  if (extensions['.py']) langs.push('python');
  if (extensions['.go']) langs.push('go');
  if (extensions['.rs']) langs.push('rust');
  if (extensions['.java']) langs.push('java');
  if (extensions['.rb']) langs.push('ruby');
  if (extensions['.php']) langs.push('php');
  if (extensions['.cs']) langs.push('csharp');
  if (files.some(f => f.endsWith('.html') || f.endsWith('.htm'))) {
    if (!langs.includes('html')) langs.push('html');
  }
  if (extensions['.css'] || extensions['.scss'] || extensions['.sass']) langs.push('css');
  return langs;
}

function detectFrameworks(pkg: PackageJsonData | null, files: string[], dirs: string[]): string[] {
  const hints: string[] = [];
  if (!pkg) return hints;

  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  if (allDeps['next']) hints.push('next');
  if (allDeps['react']) hints.push('react');
  if (allDeps['vue']) hints.push('vue');
  if (allDeps['svelte'] || allDeps['@sveltejs/kit']) hints.push('svelte');
  if (allDeps['express']) hints.push('express');
  if (allDeps['fastify']) hints.push('fastify');
  if (allDeps['@nestjs/core']) hints.push('nestjs');
  if (allDeps['hono']) hints.push('hono');
  if (allDeps['koa']) hints.push('koa');
  if (allDeps['vite']) hints.push('vite');
  if (allDeps['webpack']) hints.push('webpack');
  if (allDeps['remix'] || allDeps['@remix-run/react']) hints.push('remix');
  if (allDeps['drizzle-orm']) hints.push('drizzle');
  if (allDeps['prisma'] || allDeps['@prisma/client']) hints.push('prisma');
  if (allDeps['sequelize']) hints.push('sequelize');
  if (allDeps['typeorm']) hints.push('typeorm');
  if (allDeps['mongoose']) hints.push('mongoose');
  if (allDeps['tailwindcss']) hints.push('tailwindcss');

  if (dirs.includes('pages') && (dirs.includes('pages/api') || files.some(f => f.startsWith('pages/api/')))) {
    if (!hints.includes('next')) hints.push('next-like');
  }
  if (dirs.includes('app') && (dirs.includes('app/api') || files.some(f => f.startsWith('app/api/')))) {
    if (!hints.includes('next')) hints.push('next-app-router');
  }

  return hints;
}

function detectEntrypoints(files: string[], pkg: PackageJsonData | null): string[] {
  const candidates: string[] = [];
  const entrypointPatterns = [
    'server/index.ts', 'server/index.js',
    'src/server.ts', 'src/server.js',
    'src/index.ts', 'src/index.js',
    'src/main.ts', 'src/main.js',
    'src/app.ts', 'src/app.js',
    'index.ts', 'index.js',
    'app.ts', 'app.js',
    'server.ts', 'server.js',
    'main.ts', 'main.js',
    'src/App.tsx', 'src/App.jsx',
    'client/src/App.tsx', 'client/src/App.jsx',
    'pages/index.tsx', 'pages/index.jsx',
    'pages/index.ts', 'pages/index.js',
    'app/page.tsx', 'app/page.jsx',
    'manage.py',
    'main.go',
    'cmd/main.go',
  ];

  for (const pattern of entrypointPatterns) {
    if (files.includes(pattern)) {
      candidates.push(pattern);
    }
  }

  if (pkg?.scripts) {
    const startScript = pkg.scripts.start || pkg.scripts.dev || '';
    const match = startScript.match(/(?:tsx?|node|ts-node)\s+(\S+)/);
    if (match && files.includes(match[1])) {
      if (!candidates.includes(match[1])) {
        candidates.push(match[1]);
      }
    }
  }

  return candidates;
}

function detectRoutes(sourceRoot: string, files: string[]): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const routePatterns = [
    { regex: /\bapp\.(get|post|put|delete|patch)\(\s*["'`](.*?)["'`]/g, type: 'express' },
    { regex: /\bfastify\.(get|post|put|delete|patch)\(\s*["'`](.*?)["'`]/g, type: 'fastify' },
    { regex: /\brouter\.(get|post|put|delete|patch)\(\s*["'`](.*?)["'`]/g, type: 'router' },
    { regex: /\bserver\.(get|post|put|delete|patch)\(\s*["'`](.*?)["'`]/g, type: 'server' },
  ];

  const codeExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!codeExts.has(ext)) continue;

    const fullPath = path.join(sourceRoot, file);
    let content: string;
    try {
      content = fs.readFileSync(fullPath, 'utf-8');
    } catch {
      continue;
    }

    const lines = content.split('\n');
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      for (const pattern of routePatterns) {
        pattern.regex.lastIndex = 0;
        let match;
        while ((match = pattern.regex.exec(line)) !== null) {
          routes.push({
            method: match[1].toUpperCase(),
            path: match[2],
            file,
            line: lineIdx + 1,
          });
        }
      }
    }
  }

  const nextApiFiles = files.filter(f =>
    f.startsWith('pages/api/') || f.startsWith('app/api/')
  );
  for (const file of nextApiFiles) {
    const routePath = '/' + file
      .replace(/^pages\//, '')
      .replace(/^app\//, '')
      .replace(/\/route\.(ts|js|tsx|jsx)$/, '')
      .replace(/\.(ts|js|tsx|jsx)$/, '')
      .replace(/\/index$/, '');
    routes.push({
      method: 'ANY',
      path: routePath,
      file,
      line: 1,
    });
  }

  return routes;
}

function detectHealth(sourceRoot: string, files: string[]): HealthInfo {
  const healthPaths: Array<{ path: string; file: string; line: number }> = [];
  const healthPatterns = [
    /["'`]\/api\/health["'`]/,
    /["'`]\/health["'`]/,
    /["'`]\/healthz["'`]/,
    /["'`]\/api\/healthz["'`]/,
  ];

  const codeExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!codeExts.has(ext)) continue;

    const fullPath = path.join(sourceRoot, file);
    let content: string;
    try {
      content = fs.readFileSync(fullPath, 'utf-8');
    } catch {
      continue;
    }

    const lines = content.split('\n');
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      for (const pattern of healthPatterns) {
        if (pattern.test(line)) {
          const pathMatch = line.match(/["'`](\/(?:api\/)?health[z]?)["'`]/);
          if (pathMatch) {
            healthPaths.push({
              path: pathMatch[1],
              file,
              line: lineIdx + 1,
            });
          }
        }
      }
    }
  }

  return {
    found: healthPaths.length > 0,
    paths: healthPaths,
  };
}

interface StackCandidate {
  stack_id: string;
  confidence: number;
}

function inferStackCandidate(
  frameworks: string[],
  languages: string[],
  files: string[],
  dirs: string[],
  entrypoints: string[],
): StackCandidate {
  const hasFrontend = frameworks.some(f =>
    ['react', 'vue', 'svelte', 'next', 'next-app-router', 'next-like', 'remix', 'vite'].includes(f)
  ) || files.some(f =>
    f.endsWith('App.tsx') || f.endsWith('App.jsx') || f.endsWith('App.vue')
  );

  const hasBackend = frameworks.some(f =>
    ['express', 'fastify', 'nestjs', 'hono', 'koa'].includes(f)
  ) || entrypoints.some(e =>
    e.includes('server') || e === 'app.ts' || e === 'app.js'
  );

  if (hasFrontend && hasBackend) {
    return { stack_id: 'default-web-saas', confidence: 0.9 };
  }
  if (hasFrontend) {
    return { stack_id: 'default-web-saas', confidence: 0.6 };
  }
  if (hasBackend && !hasFrontend) {
    return { stack_id: 'api-only-node', confidence: 0.9 };
  }

  if (languages.includes('typescript') || languages.includes('javascript')) {
    if (files.some(f => f.includes('server') || f.includes('api'))) {
      return { stack_id: 'api-only-node', confidence: 0.3 };
    }
    return { stack_id: 'default-web-saas', confidence: 0.3 };
  }

  return { stack_id: 'unknown', confidence: 0.0 };
}

function suggestAnchors(
  stackCandidate: StackCandidate,
  files: string[],
  entrypoints: string[],
): AnchorSuggestion[] {
  const suggestions: AnchorSuggestion[] = [];

  const serverFiles = files.filter(f =>
    f.match(/server\/(index|routes|app)\.(ts|js)$/) ||
    f.match(/^(routes|router)\.(ts|js)$/) ||
    f.match(/src\/(server|app|routes)\.(ts|js)$/)
  );

  for (const file of serverFiles) {
    if (file.includes('route')) {
      suggestions.push({
        file,
        anchor_id: 'ROUTES',
        insertion_hint: 'Insert after existing route definitions',
      });
    }
    if (file.includes('index') || file.includes('app') || file.includes('server')) {
      suggestions.push({
        file,
        anchor_id: 'MIDDLEWARE',
        insertion_hint: 'Insert after middleware setup',
      });
      suggestions.push({
        file,
        anchor_id: 'SERVER_CONFIG',
        insertion_hint: 'Insert after server configuration',
      });
    }
  }

  const clientEntries = files.filter(f =>
    f.match(/App\.(tsx|jsx)$/) ||
    f.match(/client\/.*App\.(tsx|jsx)$/) ||
    f.match(/src\/App\.(tsx|jsx)$/)
  );

  for (const file of clientEntries) {
    suggestions.push({
      file,
      anchor_id: 'CLIENT_ROUTES',
      insertion_hint: 'Insert after existing route definitions',
    });
  }

  return suggestions;
}

function generateWarnings(
  health: HealthInfo,
  routes: RouteInfo[],
  pkg: PackageJsonData | null,
  files: string[],
  frameworks: string[],
): string[] {
  const warnings: string[] = [];

  if (!health.found) {
    warnings.push('No health endpoint detected. Consider adding /api/health for monitoring.');
  }
  if (routes.length === 0) {
    warnings.push('No API routes detected. Route detection is best-effort via regex patterns.');
  }
  if (pkg && !pkg.scripts?.test) {
    warnings.push('No test script found in package.json.');
  }
  if (pkg && !pkg.scripts?.start && !pkg.scripts?.dev) {
    warnings.push('No start or dev script found in package.json.');
  }
  if (!files.some(f => f.match(/\.(test|spec)\.(ts|js|tsx|jsx)$/))) {
    warnings.push('No test files detected in the project.');
  }
  if (frameworks.length === 0) {
    warnings.push('No frameworks detected. Stack inference may be inaccurate.');
  }

  return warnings;
}

function inferAppDir(files: string[], dirs: string[]): string | null {
  if (dirs.includes('app')) return 'app';
  if (dirs.includes('src')) return 'src';
  if (dirs.includes('client')) return 'client';
  return null;
}

function inferServerEntry(entrypoints: string[]): string | null {
  const serverEntries = entrypoints.filter(e =>
    e.includes('server') || e === 'index.ts' || e === 'index.js' ||
    e === 'app.ts' || e === 'app.js'
  );
  return serverEntries.length > 0 ? serverEntries[0] : null;
}

function inferHealthPath(health: HealthInfo): string | null {
  if (health.found && health.paths.length > 0) {
    return health.paths[0].path;
  }
  return null;
}

function buildImportReport(
  sourceRoot: string,
  workspaceRoot: string,
  scan: { files: string[]; dirs: string[]; extensions: Record<string, number> },
  pkg: PackageJsonData | null,
  lockfile: string | null,
  languages: string[],
  frameworks: string[],
  entrypoints: string[],
  routes: RouteInfo[],
  health: HealthInfo,
  stackCandidate: StackCandidate,
  anchorSuggestions: AnchorSuggestion[],
  warnings: string[],
): ImportReport {
  return {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    source_root: sourceRoot,
    workspace_root: workspaceRoot,
    signals: {
      files_scanned: scan.files.length,
      package_json_found: pkg !== null,
      lockfile_found: lockfile,
      directories: scan.dirs.slice(0, 50),
      file_extensions: scan.extensions,
    },
    detections: {
      languages,
      framework_hints: frameworks,
      package_manager_hint: lockfile || (pkg ? 'npm' : null),
      stack_id_candidate: stackCandidate.stack_id,
      confidence: stackCandidate.confidence,
      entrypoints,
      routes: routes.slice(0, 100),
      health,
      anchor_suggestions: anchorSuggestions,
      warnings,
    },
  };
}

function buildImportFacts(
  report: ImportReport,
  files: string[],
  dirs: string[],
  entrypoints: string[],
  health: HealthInfo,
  anchorSuggestions: AnchorSuggestion[],
): ImportFacts {
  const anchorTargetMap = new Map<string, string[]>();
  for (const s of anchorSuggestions) {
    if (!anchorTargetMap.has(s.file)) {
      anchorTargetMap.set(s.file, []);
    }
    anchorTargetMap.get(s.file)!.push(s.anchor_id);
  }

  return {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    stack_id_candidate: report.detections.stack_id_candidate,
    app_dir_candidate: inferAppDir(files, dirs),
    server_entry_candidate: inferServerEntry(entrypoints),
    health_path_candidate: inferHealthPath(health),
    anchor_targets: Array.from(anchorTargetMap.entries()).map(([target_path, anchors]) => ({
      target_path,
      anchors,
    })),
  };
}

function buildPatchManifest(
  workspaceRoot: string,
  projectName: string,
  sourceRoot: string,
  report: ImportReport,
  anchorSuggestions: AnchorSuggestion[],
  health: HealthInfo,
  stackCandidate: StackCandidate,
): ImportPatchManifest {
  const ops: PatchManifestOp[] = [];
  let opIdx = 0;

  for (const suggestion of anchorSuggestions) {
    ops.push({
      op_id: `import-anchor-${opIdx++}`,
      type: 'patch_file',
      target_path: suggestion.file,
      anchor: {
        type: 'marker',
        value: `<!-- AXION:ANCHOR:${suggestion.anchor_id} -->`,
        occurrence: 1,
      },
      patch: {
        mode: 'insert_after',
        content: `<!-- AXION:ANCHOR:${suggestion.anchor_id} -->`,
      },
    });
  }

  return {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    producer: { script: 'axion-import', revision: 1 },
    workspace_root: workspaceRoot,
    project_name: projectName,
    source_root: sourceRoot,
    stack_id_candidate: stackCandidate.stack_id,
    ops,
  };
}

function generateDocSeeds(
  workspaceRoot: string,
  sourceRoot: string,
  report: ImportReport,
  facts: ImportFacts,
): string[] {
  const sourceHash = crypto.createHash('sha256').update(sourceRoot).digest('hex').slice(0, 16);
  const written: string[] = [];

  const domainsDir = path.join(workspaceRoot, 'domains');

  const architectureSeed = generateArchitectureSeed(report, facts, sourceHash);
  const archDir = path.join(domainsDir, 'architecture');
  fs.mkdirSync(archDir, { recursive: true });
  const archPath = path.join(archDir, 'README.md');
  writeTextAtomic(archPath, architectureSeed);
  written.push(path.relative(workspaceRoot, archPath));

  if (report.detections.entrypoints.length > 0 || report.signals.package_json_found) {
    const systemsSeed = generateSystemsSeed(report, facts, sourceHash);
    const sysDir = path.join(domainsDir, 'systems');
    fs.mkdirSync(sysDir, { recursive: true });
    const sysPath = path.join(sysDir, 'README.md');
    writeTextAtomic(sysPath, systemsSeed);
    written.push(path.relative(workspaceRoot, sysPath));
  }

  if (report.detections.routes.length > 0) {
    const contractsSeed = generateContractsSeed(report, facts, sourceHash);
    const ctrDir = path.join(domainsDir, 'contracts');
    fs.mkdirSync(ctrDir, { recursive: true });
    const ctrPath = path.join(ctrDir, 'README.md');
    writeTextAtomic(ctrPath, contractsSeed);
    written.push(path.relative(workspaceRoot, ctrPath));
  }

  const frontendFrameworks = ['react', 'vue', 'svelte', 'next', 'next-app-router', 'next-like', 'remix', 'vite'];
  if (report.detections.framework_hints.some(f => frontendFrameworks.includes(f))) {
    const frontendSeed = generateFrontendSeed(report, facts, sourceHash);
    const feDir = path.join(domainsDir, 'frontend');
    fs.mkdirSync(feDir, { recursive: true });
    const fePath = path.join(feDir, 'README.md');
    writeTextAtomic(fePath, frontendSeed);
    written.push(path.relative(workspaceRoot, fePath));
  }

  const backendFrameworks = ['express', 'fastify', 'nestjs', 'hono', 'koa'];
  if (report.detections.framework_hints.some(f => backendFrameworks.includes(f))) {
    const backendSeed = generateBackendSeed(report, facts, sourceHash);
    const beDir = path.join(domainsDir, 'backend');
    fs.mkdirSync(beDir, { recursive: true });
    const bePath = path.join(beDir, 'README.md');
    writeTextAtomic(bePath, backendSeed);
    written.push(path.relative(workspaceRoot, bePath));
  }

  return written;
}

function generateArchitectureSeed(report: ImportReport, facts: ImportFacts, sourceHash: string): string {
  const lines: string[] = [];
  lines.push(`<!-- AXION:IMPORTED:SOURCE_ROOT_HASH:${sourceHash} -->`);
  lines.push('');
  lines.push('# Architecture Domain');
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push(`Imported analysis of existing project. Stack candidate: **${report.detections.stack_id_candidate}** (confidence: ${report.detections.confidence}).`);
  lines.push('');
  lines.push('## Stack Profile');
  lines.push('');
  lines.push(`- **Stack ID Candidate**: ${report.detections.stack_id_candidate}`);
  lines.push(`- **Confidence**: ${report.detections.confidence}`);
  lines.push(`- **Languages**: ${report.detections.languages.join(', ') || 'none detected'}`);
  lines.push(`- **Frameworks**: ${report.detections.framework_hints.join(', ') || 'none detected'}`);
  lines.push(`- **Package Manager**: ${report.detections.package_manager_hint || 'unknown'}`);
  lines.push('');
  lines.push('## Project Structure');
  lines.push('');
  lines.push(`- **Files scanned**: ${report.signals.files_scanned}`);
  lines.push(`- **Top directories**: ${report.signals.directories.slice(0, 10).join(', ')}`);

  const topExts = Object.entries(report.signals.file_extensions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([ext, count]) => `${ext} (${count})`)
    .join(', ');
  lines.push(`- **File types**: ${topExts}`);
  lines.push('');

  lines.push('## Entrypoints');
  lines.push('');
  if (report.detections.entrypoints.length > 0) {
    for (const ep of report.detections.entrypoints) {
      lines.push(`- \`${ep}\``);
    }
  } else {
    lines.push('- No entrypoints detected');
  }
  lines.push('');

  lines.push('## Open Questions');
  lines.push('');
  if (report.detections.warnings.length > 0) {
    for (const w of report.detections.warnings) {
      lines.push(`- ${w}`);
    }
  } else {
    lines.push('- None identified');
  }
  lines.push('');

  return lines.join('\n');
}

function generateSystemsSeed(report: ImportReport, facts: ImportFacts, sourceHash: string): string {
  const lines: string[] = [];
  lines.push(`<!-- AXION:IMPORTED:SOURCE_ROOT_HASH:${sourceHash} -->`);
  lines.push('');
  lines.push('# Systems Domain');
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push('Runtime and process model inferred from imported project.');
  lines.push('');
  lines.push('## Runtime');
  lines.push('');
  lines.push(`- **Package Manager**: ${report.detections.package_manager_hint || 'unknown'}`);

  if (report.signals.package_json_found) {
    lines.push('- **package.json**: found');
  }
  if (report.signals.lockfile_found) {
    lines.push(`- **Lockfile**: ${report.signals.lockfile_found}`);
  }
  lines.push('');

  lines.push('## Entrypoints');
  lines.push('');
  if (facts.server_entry_candidate) {
    lines.push(`- **Server entry**: \`${facts.server_entry_candidate}\``);
  }
  if (facts.app_dir_candidate) {
    lines.push(`- **App directory**: \`${facts.app_dir_candidate}\``);
  }
  lines.push('');

  lines.push('## Open Questions');
  lines.push('');
  if (!facts.health_path_candidate) {
    lines.push('- No health endpoint found');
  }
  if (!facts.server_entry_candidate) {
    lines.push('- Server entry not confidently determined');
  }
  lines.push('');

  return lines.join('\n');
}

function generateContractsSeed(report: ImportReport, facts: ImportFacts, sourceHash: string): string {
  const lines: string[] = [];
  lines.push(`<!-- AXION:IMPORTED:SOURCE_ROOT_HASH:${sourceHash} -->`);
  lines.push('');
  lines.push('# Contracts Domain');
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push('API surface summary from imported project analysis.');
  lines.push('');
  lines.push('## Detected Routes');
  lines.push('');

  const topRoutes = report.detections.routes.slice(0, 20);
  if (topRoutes.length > 0) {
    lines.push('| Method | Path | File | Line |');
    lines.push('|--------|------|------|------|');
    for (const r of topRoutes) {
      lines.push(`| ${r.method} | \`${r.path}\` | \`${r.file}\` | ${r.line} |`);
    }
  } else {
    lines.push('No routes detected.');
  }
  lines.push('');

  lines.push('## Health Endpoint');
  lines.push('');
  if (report.detections.health.found) {
    for (const h of report.detections.health.paths) {
      lines.push(`- \`${h.path}\` in \`${h.file}\` (line ${h.line})`);
    }
  } else {
    lines.push('- Not detected');
  }
  lines.push('');

  lines.push('## Open Questions');
  lines.push('');
  lines.push('- Route detection is regex-based; AST parsing may reveal additional endpoints');
  if (!report.detections.health.found) {
    lines.push('- No health endpoint found');
  }
  lines.push('');

  return lines.join('\n');
}

function generateFrontendSeed(report: ImportReport, facts: ImportFacts, sourceHash: string): string {
  const lines: string[] = [];
  lines.push(`<!-- AXION:IMPORTED:SOURCE_ROOT_HASH:${sourceHash} -->`);
  lines.push('');
  lines.push('# Frontend Domain');
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push('Frontend framework and UI structure from imported project.');
  lines.push('');
  lines.push('## Detected Frameworks');
  lines.push('');
  const frontendFrameworks = ['react', 'vue', 'svelte', 'next', 'next-app-router', 'next-like', 'remix', 'vite', 'tailwindcss', 'webpack'];
  const detected = report.detections.framework_hints.filter(f => frontendFrameworks.includes(f));
  for (const f of detected) {
    lines.push(`- ${f}`);
  }
  lines.push('');

  const clientEntries = report.detections.entrypoints.filter(e =>
    e.includes('App.') || e.includes('page.') || e.includes('pages/')
  );
  if (clientEntries.length > 0) {
    lines.push('## Client Entrypoints');
    lines.push('');
    for (const e of clientEntries) {
      lines.push(`- \`${e}\``);
    }
    lines.push('');
  }

  lines.push('## Open Questions');
  lines.push('');
  lines.push('- Component inventory not yet analyzed (requires deeper scan)');
  lines.push('- State management patterns not fully detected');
  lines.push('');

  return lines.join('\n');
}

function generateBackendSeed(report: ImportReport, facts: ImportFacts, sourceHash: string): string {
  const lines: string[] = [];
  lines.push(`<!-- AXION:IMPORTED:SOURCE_ROOT_HASH:${sourceHash} -->`);
  lines.push('');
  lines.push('# Backend Domain');
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push('Backend framework and API structure from imported project.');
  lines.push('');
  lines.push('## Detected Frameworks');
  lines.push('');
  const backendFrameworks = ['express', 'fastify', 'nestjs', 'hono', 'koa', 'drizzle', 'prisma', 'sequelize', 'typeorm', 'mongoose'];
  const detected = report.detections.framework_hints.filter(f => backendFrameworks.includes(f));
  for (const f of detected) {
    lines.push(`- ${f}`);
  }
  lines.push('');

  if (facts.server_entry_candidate) {
    lines.push('## Server Entry');
    lines.push('');
    lines.push(`- \`${facts.server_entry_candidate}\``);
    lines.push('');
  }

  const routeCount = report.detections.routes.length;
  lines.push('## API Surface');
  lines.push('');
  lines.push(`- **Total routes detected**: ${routeCount}`);
  if (facts.health_path_candidate) {
    lines.push(`- **Health endpoint**: \`${facts.health_path_candidate}\``);
  }
  lines.push('');

  lines.push('## Open Questions');
  lines.push('');
  lines.push('- Database schema not yet analyzed');
  lines.push('- Middleware chain not fully mapped');
  if (!facts.health_path_candidate) {
    lines.push('- No health endpoint detected');
  }
  lines.push('');

  return lines.join('\n');
}

function main(): void {
  const startTime = Date.now();
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  const jsonMode = options.jsonOutput;
  const dryRun = options.dryRun;

  const receipt: Record<string, any> = {
    ok: true,
    script: 'axion-import',
    stage: 'import',
    dryRun,
    errors: [] as string[],
    warnings: [] as string[],
    artifacts_written: [] as string[],
    elapsedMs: 0,
  };

  function emitOutput(): void {
    receipt.elapsedMs = Date.now() - startTime;
    if (jsonMode) {
      process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    } else {
      if (receipt.ok) {
        console.log(`[axion-import] completed in ${receipt.elapsedMs}ms`);
        if (receipt.artifacts_written.length > 0) {
          console.log(`  artifacts: ${receipt.artifacts_written.join(', ')}`);
        }
        if (receipt.warnings.length > 0) {
          console.log(`  warnings: ${receipt.warnings.join('; ')}`);
        }
      } else {
        console.error(`[axion-import] failed in ${receipt.elapsedMs}ms`);
        for (const e of receipt.errors) {
          console.error(`  error: ${e}`);
        }
      }
    }
  }

  try {
    if (!options.sourceRoot) {
      receipt.ok = false;
      receipt.reason_codes = ['MISSING_SOURCE_ROOT'];
      receipt.errors.push('Missing --source-root argument');
      receipt.hint = ['Provide --source-root <path> pointing to the existing project'];
      emitOutput();
      process.exit(1);
    }

    if (!options.buildRoot || !options.projectName) {
      receipt.ok = false;
      receipt.reason_codes = ['MISSING_BUILD_CONTEXT'];
      receipt.errors.push('Missing --build-root or --project-name argument');
      receipt.hint = ['Provide --build-root <path> and --project-name <name>'];
      emitOutput();
      process.exit(1);
    }

    const sourceRoot = path.resolve(options.sourceRoot);
    const workspaceRoot = path.resolve(options.buildRoot, options.projectName);

    receipt.source_root = sourceRoot;
    receipt.workspace_root = workspaceRoot;

    if (!fs.existsSync(sourceRoot)) {
      receipt.ok = false;
      receipt.reason_codes = ['SOURCE_NOT_FOUND'];
      receipt.errors.push(`Source root does not exist: ${sourceRoot}`);
      receipt.hint = [`Source root does not exist: ${sourceRoot}`];
      emitOutput();
      process.exit(1);
    }

    if (!fs.existsSync(workspaceRoot)) {
      receipt.ok = false;
      receipt.status = 'blocked_by';
      receipt.reason_codes = ['WORKSPACE_NOT_FOUND'];
      receipt.errors.push(`Workspace does not exist: ${workspaceRoot}`);
      receipt.hint = [
        `Workspace does not exist: ${workspaceRoot}`,
        'Run kit-create first to initialize the workspace',
      ];
      emitOutput();
      process.exit(1);
    }

    const resolvedSource = fs.realpathSync(sourceRoot);
    const resolvedWorkspace = fs.realpathSync(workspaceRoot);

    if (resolvedWorkspace.startsWith(resolvedSource + path.sep) || resolvedWorkspace === resolvedSource) {
      receipt.ok = false;
      receipt.reason_codes = ['WORKSPACE_INSIDE_SOURCE'];
      receipt.errors.push('Workspace must not be inside or equal to source-root');
      receipt.hint = [
        'Workspace must not be inside or equal to source-root',
        'Use a separate build-root to ensure source safety',
      ];
      emitOutput();
      process.exit(1);
    }

    if (resolvedSource.startsWith(resolvedWorkspace + path.sep)) {
      receipt.ok = false;
      receipt.reason_codes = ['SOURCE_INSIDE_WORKSPACE'];
      receipt.errors.push('Source-root must not be inside workspace');
      receipt.hint = [
        'Source-root must not be inside workspace',
        'Use separate directories for source and workspace',
      ];
      emitOutput();
      process.exit(1);
    }

    if (!jsonMode) console.log(`[axion-import] scanning source: ${sourceRoot}`);

    const scan = scanDirectory(sourceRoot);

    const pkg = detectPackageJson(sourceRoot);
    const lockfile = detectLockfile(sourceRoot);
    const languages = detectLanguages(scan.extensions, scan.files);
    const frameworks = detectFrameworks(pkg, scan.files, scan.dirs);
    const entrypoints = detectEntrypoints(scan.files, pkg);
    const routes = detectRoutes(sourceRoot, scan.files);
    const health = detectHealth(sourceRoot, scan.files);
    const stackCandidate = inferStackCandidate(frameworks, languages, scan.files, scan.dirs, entrypoints);
    const anchorSuggestions = suggestAnchors(stackCandidate, scan.files, entrypoints);
    const importWarnings = generateWarnings(health, routes, pkg, scan.files, frameworks);

    receipt.stack_id_candidate = stackCandidate.stack_id;
    receipt.signals = scan.files.length;
    receipt.warnings = importWarnings;

    const report = buildImportReport(
      sourceRoot, workspaceRoot, scan, pkg, lockfile,
      languages, frameworks, entrypoints, routes, health,
      stackCandidate, anchorSuggestions, importWarnings,
    );

    const facts = buildImportFacts(report, scan.files, scan.dirs, entrypoints, health, anchorSuggestions);

    if (dryRun) {
      if (!jsonMode) console.log('[axion-import] dry-run mode — no files written');
      receipt.artifacts_written = [];
      emitOutput();
      return;
    }

    const registryDir = path.join(workspaceRoot, 'registry');
    fs.mkdirSync(registryDir, { recursive: true });

    const reportPath = path.join(registryDir, 'import_report.json');
    writeJsonAtomic(reportPath, report);

    const factsPath = path.join(registryDir, 'import_facts.json');
    writeJsonAtomic(factsPath, facts);

    const artifactsWritten = [
      path.relative(workspaceRoot, reportPath),
      path.relative(workspaceRoot, factsPath),
    ];

    const seedFiles = generateDocSeeds(workspaceRoot, sourceRoot, report, facts);
    artifactsWritten.push(...seedFiles);

    if (options.emitManifest) {
      const manifest = buildPatchManifest(
        workspaceRoot, options.projectName, sourceRoot,
        report, anchorSuggestions, health, stackCandidate,
      );
      const manifestPath = path.join(registryDir, 'import_patch_manifest.json');
      writeJsonAtomic(manifestPath, manifest);
      artifactsWritten.push(path.relative(workspaceRoot, manifestPath));
    }

    receipt.artifacts_written = artifactsWritten;
    emitOutput();
  } catch (err: any) {
    receipt.ok = false;
    receipt.errors.push(err?.message || String(err));
    emitOutput();
    process.exit(1);
  }
}

main();
