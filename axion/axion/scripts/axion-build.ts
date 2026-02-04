#!/usr/bin/env node
/**
 * AXION Build
 * 
 * Invokes AI to implement code from locked documentation.
 * Gate: Blocked unless scaffold-app complete
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-build.ts
 *   node --import tsx axion/scripts/axion-build.ts --app-path ./axion-app
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
const STAGE_MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');
const DOMAINS_PATH = path.join(AXION_ROOT, 'domains');

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

function isScaffoldComplete(): boolean {
  const markers = loadStageMarkers();
  const globalMarkers = markers['global'] || {};
  return globalMarkers['scaffold-app']?.status === 'success';
}

function findAppPath(): string | null {
  const candidates = [
    path.join(process.cwd(), 'axion-app'),
    path.join(process.cwd(), 'app'),
    path.join(process.cwd(), 'src'),
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
  const overrideFlag = args.includes('--override');
  
  let appPath = appPathIdx !== -1 ? args[appPathIdx + 1] : null;
  
  console.log('\n[AXION] Build\n');
  
  if (!isScaffoldComplete() && !overrideFlag) {
    const result: BuildResult = {
      status: 'blocked_by',
      stage: 'build',
      missing: ['scaffold-app'],
      hint: [
        'build blocked unless scaffold-app complete',
        'Run: node --import tsx axion/scripts/axion-scaffold-app.ts',
        'Or use --override flag',
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  
  if (!appPath) {
    appPath = findAppPath();
  }
  
  if (!appPath || !fs.existsSync(appPath)) {
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
    process.exit(1);
  }
  
  const docs = getLockedDocs();
  if (docs.length === 0) {
    const result: BuildResult = {
      status: 'failed',
      stage: 'build',
      hint: ['No locked documentation found in axion/domains/'],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  
  console.log(`App path: ${appPath}`);
  console.log(`Docs: ${docs.length} modules`);
  console.log('');
  
  const buildPrompt = generateBuildPrompt(appPath, docs);
  const promptPath = path.join(AXION_ROOT, 'registry', 'build_prompt.md');
  fs.writeFileSync(promptPath, buildPrompt);
  
  console.log(`[INFO] Build prompt written to: ${promptPath}`);
  console.log('');
  console.log('[INFO] Build stage prepares the prompt for AI implementation.');
  console.log('[INFO] The actual implementation should be done by an AI agent');
  console.log('[INFO] reading the build_prompt.md and locked documentation.');
  console.log('');
  
  const markers = loadStageMarkers();
  markers['global'] = markers['global'] || {};
  markers['global']['build'] = {
    completed_at: new Date().toISOString(),
    status: 'success',
  };
  fs.writeFileSync(STAGE_MARKERS_PATH, JSON.stringify(markers, null, 2));
  
  const result: BuildResult = {
    status: 'success',
    stage: 'build',
    app_path: appPath,
    modules_implemented: docs.map(d => path.basename(path.dirname(d))),
  };
  
  console.log(JSON.stringify(result, null, 2));
}

main();
