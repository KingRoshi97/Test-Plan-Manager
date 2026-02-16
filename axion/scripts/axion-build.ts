#!/usr/bin/env node
/**
 * AXION Build
 * 
 * Invokes AI to implement code from locked documentation.
 * Gate: Blocked unless scaffold-app complete
 * 
 * Two-Root Model Support:
 * - System Root: <BUILD_ROOT>/axion/ (configs, templates)
 * - Workspace Root: <BUILD_ROOT>/<PROJECT_NAME>/ (outputs, app)
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-build.ts --build-root <path> --project-name <name>
 *   node --import tsx axion/scripts/axion-build.ts --app-path ./axion-app  (legacy mode)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');
const startTime = Date.now();

const receipt = {
  stage: 'build',
  ok: true,
  modulesProcessed: [] as string[],
  createdFiles: [] as string[],
  modifiedFiles: [] as string[],
  skippedFiles: [] as string[],
  warnings: [] as string[],
  errors: [] as string[],
  elapsedMs: 0,
  dryRun,
};

function emitOutput() {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    return;
  }
  if (receipt.ok) {
    console.log(JSON.stringify({
      status: 'success',
      stage: 'build',
      app_path: receipt.createdFiles[0] || undefined,
      modules_implemented: receipt.modulesProcessed,
    }, null, 2));
  } else {
    console.log(JSON.stringify({
      status: 'failed',
      stage: 'build',
      errors: receipt.errors,
    }, null, 2));
  }
}

let AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
let WORKSPACE_ROOT = AXION_ROOT;
let STAGE_MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');
let DOMAINS_PATH = path.join(AXION_ROOT, 'domains');

function setupTwoRootPaths(buildRoot: string, projectName: string): void {
  AXION_ROOT = path.join(buildRoot, 'axion');
  WORKSPACE_ROOT = path.join(buildRoot, projectName);
  STAGE_MARKERS_PATH = path.join(WORKSPACE_ROOT, 'registry', 'stage_markers.json');
  const wsDomainsPath = path.join(WORKSPACE_ROOT, 'domains');
  const wsAxionDomainsPath = path.join(WORKSPACE_ROOT, 'axion', 'domains');
  DOMAINS_PATH = fs.existsSync(wsDomainsPath) ? wsDomainsPath : wsAxionDomainsPath;
}

interface StageMarkers {
  [module: string]: {
    [stage: string]: {
      completed_at: string;
      status: 'success' | 'failed';
    };
  };
}

interface BuildResult {
  status: 'success' | 'blocked_by' | 'failed';
  stage: string;
  app_path?: string;
  modules_implemented?: string[];
  missing?: string[];
  hint?: string[];
}

function loadStageMarkers(): StageMarkers {
  if (!fs.existsSync(STAGE_MARKERS_PATH)) return {};
  return JSON.parse(fs.readFileSync(STAGE_MARKERS_PATH, 'utf-8'));
}

function saveStageMarkers(markers: StageMarkers): void {
  const dir = path.dirname(STAGE_MARKERS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STAGE_MARKERS_PATH, JSON.stringify(markers, null, 2));
}

function isScaffoldComplete(): boolean {
  const markers = loadStageMarkers();
  const globalMarkers = markers['global'] || {};
  return globalMarkers['scaffold-app']?.status === 'success';
}

function findAppPath(workspaceRoot: string): string | null {
  const candidates = [
    path.join(workspaceRoot, 'app'),
    path.join(workspaceRoot, 'axion-app'),
    path.join(workspaceRoot, 'src'),
    path.join(process.cwd(), 'axion-app'),
    path.join(process.cwd(), 'app'),
  ];
  
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
  }
  
  return null;
}

function getLockedDocs(): string[] {
  const docs: string[] = [];
  
  if (!fs.existsSync(DOMAINS_PATH)) return docs;
  
  const modules = fs.readdirSync(DOMAINS_PATH, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  for (const module of modules) {
    const readmePath = path.join(DOMAINS_PATH, module, 'README.md');
    if (fs.existsSync(readmePath)) {
      docs.push(readmePath);
    }
  }
  
  return docs;
}

function generateBuildPrompt(appPath: string, docs: string[]): string {
  let prompt = `# AXION Build Prompt\n\n`;
  prompt += `You are implementing an application from AXION locked documentation.\n\n`;
  prompt += `## App Location\n\`${appPath}\`\n\n`;
  prompt += `## Source Documents\n`;
  
  for (const doc of docs) {
    const moduleName = path.basename(path.dirname(doc));
    prompt += `- ${moduleName}: ${doc}\n`;
  }
  
  prompt += `\n## Instructions\n`;
  prompt += `1. Read each module's README.md for specifications\n`;
  prompt += `2. Implement features strictly from documented contracts\n`;
  prompt += `3. Follow the stack profile defined in architecture module\n`;
  prompt += `4. Create database migrations from database module schema\n`;
  prompt += `5. Implement API routes from contracts module\n`;
  prompt += `6. Build UI components from frontend module\n`;
  prompt += `7. Do not invent features not in documentation\n`;
  
  return prompt;
}

function main() {
  const args = process.argv.slice(2);
  const appPathIdx = args.indexOf('--app-path');
  const buildRootIdx = args.indexOf('--build-root');
  const projectNameIdx = args.indexOf('--project-name');
  const overrideFlag = args.includes('--override');

  const isTwoRootMode = buildRootIdx !== -1 && projectNameIdx !== -1;

  let appPath: string | null = appPathIdx !== -1 ? args[appPathIdx + 1] : null;
  let projectName: string | undefined;

  if (isTwoRootMode) {
    const buildRoot = path.resolve(args[buildRootIdx + 1]);
    projectName = args[projectNameIdx + 1];
    setupTwoRootPaths(buildRoot, projectName);

    if (!jsonMode) {
      console.log('\n[AXION] Build (Two-Root Mode)\n');
      console.log(`[INFO] Build root: ${buildRoot}`);
      console.log(`[INFO] Project: ${projectName}`);
      console.log(`[INFO] Workspace: ${WORKSPACE_ROOT}`);
    }
  } else {
    if (!jsonMode) {
      console.log('\n[AXION] Build\n');
    }
  }
  
  if (!isScaffoldComplete() && !overrideFlag) {
    receipt.ok = false;
    receipt.errors.push('build blocked unless scaffold-app complete');
    receipt.warnings.push('Run scaffold-app first', 'Or use --override flag');
    if (!jsonMode) {
      const result: BuildResult = {
        status: 'blocked_by',
        stage: 'build',
        missing: ['scaffold-app'],
        hint: [
          'build blocked unless scaffold-app complete',
          'Run scaffold-app first',
          'Or use --override flag',
        ],
      };
      console.log(JSON.stringify(result, null, 2));
    } else {
      emitOutput();
    }
    process.exit(1);
  }
  
  if (!appPath) {
    appPath = findAppPath(WORKSPACE_ROOT);
  }
  
  if (!appPath || !fs.existsSync(appPath)) {
    receipt.ok = false;
    receipt.errors.push('Could not find app directory');
    receipt.warnings.push('Use --app-path to specify location', 'Or run scaffold-app first');
    if (!jsonMode) {
      const result: BuildResult = {
        status: 'failed',
        stage: 'build',
        hint: [
          'Could not find app directory',
          'Use --app-path to specify location',
          'Or run scaffold-app first',
        ],
      };
      console.log(JSON.stringify(result, null, 2));
    } else {
      emitOutput();
    }
    process.exit(1);
  }
  
  const docs = getLockedDocs();
  if (docs.length === 0) {
    receipt.ok = false;
    receipt.errors.push(`No locked documentation found in ${DOMAINS_PATH}`);
    if (!jsonMode) {
      const result: BuildResult = {
        status: 'failed',
        stage: 'build',
        hint: [`No locked documentation found in ${DOMAINS_PATH}`],
      };
      console.log(JSON.stringify(result, null, 2));
    } else {
      emitOutput();
    }
    process.exit(1);
  }

  receipt.modulesProcessed = docs.map(d => path.basename(path.dirname(d)));
  
  if (!jsonMode) {
    console.log(`App path: ${appPath}`);
    console.log(`Docs: ${docs.length} modules`);
    console.log('');
  }

  if (dryRun) {
    if (!jsonMode) {
      console.log('[DRY-RUN] Would generate build prompt and write stage markers.');
      console.log(`[DRY-RUN] Modules: ${receipt.modulesProcessed.join(', ')}`);
    }
    emitOutput();
    return;
  }
  
  const buildPrompt = generateBuildPrompt(appPath, docs);
  const registryDir = path.join(WORKSPACE_ROOT, 'registry');
  if (!fs.existsSync(registryDir)) {
    fs.mkdirSync(registryDir, { recursive: true });
  }
  const promptPath = path.join(registryDir, 'build_prompt.md');
  fs.writeFileSync(promptPath, buildPrompt);
  receipt.createdFiles.push(promptPath);
  
  if (!jsonMode) {
    console.log(`[INFO] Build prompt written to: ${promptPath}`);
    console.log('');
    console.log('[INFO] Build stage prepares the prompt for AI implementation.');
    console.log('[INFO] The actual implementation should be done by an AI agent');
    console.log('[INFO] reading the build_prompt.md and locked documentation.');
    console.log('');
  }
  
  const markers = loadStageMarkers();
  markers['global'] = markers['global'] || {};
  markers['global']['build'] = {
    completed_at: new Date().toISOString(),
    status: 'success',
  };
  saveStageMarkers(markers);
  
  emitOutput();
}

try {
  main();
} catch (err: any) {
  receipt.ok = false;
  receipt.errors.push(err?.message || String(err));
  emitOutput();
  process.exit(1);
}
