#!/usr/bin/env node
/**
 * AXION Generate Script
 * 
 * Creates module documentation from templates.
 * 
 * Usage:
 *   npx ts-node axion/scripts/axion-generate.ts --module <name>
 *   npx ts-node axion/scripts/axion-generate.ts --all
 *   npx ts-node axion/scripts/axion-generate.ts --root <workspace> --module <name>
 */

import * as fs from 'fs';
import * as path from 'path';

// Parse --root argument for two-root mode
function parseRootArg(): string | null {
  const args = process.argv.slice(2);
  const rootIdx = args.indexOf('--root');
  if (rootIdx !== -1 && args[rootIdx + 1]) {
    return path.resolve(args[rootIdx + 1]);
  }
  return null;
}

// Two-root mode: system folder for templates/config, workspace for outputs
const WORKSPACE_ROOT = parseRootArg();
const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');

// System paths (read-only, from axion/ system folder)
const CONFIG_PATH = path.join(AXION_ROOT, 'config', 'domains.json');
const TEMPLATES_PATH = path.join(AXION_ROOT, 'templates');

// Workspace paths (writable, from workspace root or axion/ for legacy mode)
const WORKSPACE_BASE = WORKSPACE_ROOT || AXION_ROOT;
const DOMAINS_PATH = path.join(WORKSPACE_BASE, WORKSPACE_ROOT ? 'domains' : 'domains');
const MARKERS_PATH = path.join(WORKSPACE_BASE, WORKSPACE_ROOT ? 'registry' : 'registry', 'stage_markers.json');
const ATTACHMENTS_PATH = path.join(WORKSPACE_BASE, WORKSPACE_ROOT ? 'source_docs' : 'source_docs', 'product', 'attachments');
const REGISTRY_PATH = path.join(WORKSPACE_BASE, WORKSPACE_ROOT ? 'registry' : 'registry');

interface Module {
  name: string;
  slug: string;
  prefix: string;
  type: string;
  description: string;
  dependencies?: string[];
}

interface Config {
  modules: Module[];
  canonical_order: string[];
}

// Flat markers structure: { moduleName: { stageName: { ... } } }
type StageMarkers = Record<string, Record<string, any>>;

function loadConfig(): Config {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('[ERROR] domains.json not found');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadMarkers(): StageMarkers {
  if (!fs.existsSync(MARKERS_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(MARKERS_PATH, 'utf-8'));
}

function saveMarkers(markers: StageMarkers): void {
  const dir = path.dirname(MARKERS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MARKERS_PATH, JSON.stringify(markers, null, 2));
}

interface AttachmentContent {
  files: string[];
  content: string;
  totalSize: number;
}

function readAttachmentsFolder(): AttachmentContent {
  const result: AttachmentContent = {
    files: [],
    content: '',
    totalSize: 0,
  };
  
  if (!fs.existsSync(ATTACHMENTS_PATH)) {
    return result;
  }
  
  const files = fs.readdirSync(ATTACHMENTS_PATH);
  const textExtensions = ['.txt', '.md', '.json', '.yaml', '.yml'];
  const contents: string[] = [];
  
  for (const file of files) {
    if (file === 'README.md' || file === 'README.txt') continue;
    
    const ext = path.extname(file).toLowerCase();
    if (textExtensions.includes(ext)) {
      const filePath = path.join(ATTACHMENTS_PATH, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.trim()) {
          result.files.push(file);
          result.totalSize += stat.size;
          contents.push(`<!-- ATTACHMENT: ${file} -->\n${content}`);
        }
      }
    }
  }
  
  result.content = contents.join('\n\n---\n\n');
  return result;
}

function saveAttachmentsContext(attachments: AttachmentContent): void {
  if (attachments.files.length === 0) return;
  
  const contextPath = path.join(REGISTRY_PATH, 'attachments_context.json');
  const context = {
    read_at: new Date().toISOString(),
    files: attachments.files,
    total_size_bytes: attachments.totalSize,
    content_preview: attachments.content.slice(0, 500) + (attachments.content.length > 500 ? '...' : ''),
  };
  
  fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));
  
  const fullContentPath = path.join(REGISTRY_PATH, 'attachments_content.md');
  fs.writeFileSync(fullContentPath, `# User Input (from attachments folder)\n\n${attachments.content}`);
}

function getTemplate(moduleSlug: string): string {
  const modulePath = path.join(TEMPLATES_PATH, moduleSlug, 'README.template.md');
  const minimalPath = path.join(TEMPLATES_PATH, '_minimal.template.md');
  
  if (fs.existsSync(modulePath)) {
    return fs.readFileSync(modulePath, 'utf-8');
  }
  if (fs.existsSync(minimalPath)) {
    return fs.readFileSync(minimalPath, 'utf-8');
  }
  
  return `# {{MODULE_NAME}} Module

## AXION Contract Header
- AXION:PREFIX: {{PREFIX}}
- AXION:PLACEHOLDER_POLICY: [TBD] must be populated

## Metadata
- Version: 0.1.0
- Status: DRAFT

## 1. Scope and Ownership
[TBD]

## 2. Interfaces and Dependencies
[TBD]

## ACCEPTANCE
- [ ] All sections populated

## OPEN_QUESTIONS
- [TBD]
`;
}

function generateModule(mod: Module): string[] {
  const template = getTemplate(mod.slug);
  
  const content = template
    .replace(/\{\{MODULE_NAME\}\}/g, mod.name)
    .replace(/\{\{SLUG\}\}/g, mod.slug)
    .replace(/\{\{PREFIX\}\}/g, mod.prefix)
    .replace(/\{\{DESCRIPTION\}\}/g, mod.description);
  
  const moduleDir = path.join(DOMAINS_PATH, mod.slug);
  if (!fs.existsSync(moduleDir)) {
    fs.mkdirSync(moduleDir, { recursive: true });
  }
  
  const docPath = path.join(moduleDir, 'README.md');
  fs.writeFileSync(docPath, content);
  
  return [path.relative(WORKSPACE_BASE, docPath)];
}

function main() {
  const args = process.argv.slice(2);
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  npx ts-node axion/scripts/axion-generate.ts --module <name>');
    console.log('  npx ts-node axion/scripts/axion-generate.ts --all');
    process.exit(1);
  }
  
  const config = loadConfig();
  const markers = loadMarkers();
  
  // Read user input from attachments folder
  const attachments = readAttachmentsFolder();
  if (attachments.files.length > 0) {
    console.log(`[INFO] Found ${attachments.files.length} attachment(s) in attachments folder:`);
    for (const file of attachments.files) {
      console.log(`       - ${file}`);
    }
    saveAttachmentsContext(attachments);
    console.log('[INFO] Saved attachments content to registry/attachments_content.md');
    console.log('[INFO] Use this content during draft stage to populate documentation.\n');
  } else {
    console.log('[INFO] No attachments found. Add your project input to:');
    console.log('       source_docs/product/attachments/START_HERE.txt\n');
  }
  
  const modulesToGenerate = runAll
    ? config.canonical_order.map(slug => config.modules.find(m => m.slug === slug)!)
    : [config.modules.find(m => m.slug === targetModule)!];
  
  if (!runAll && !modulesToGenerate[0]) {
    console.error(`[ERROR] Module "${targetModule}" not found in config`);
    process.exit(1);
  }
  
  console.log('\n[AXION] Generate\n');
  
  for (const mod of modulesToGenerate) {
    if (!mod) continue;
    
    console.log(`[INFO] Generating ${mod.name}...`);
    const files = generateModule(mod);
    
    if (!markers[mod.slug]) {
      markers[mod.slug] = {};
    }
    markers[mod.slug].generate = {
      completed_at: new Date().toISOString(),
      files: files,
    };
    
    console.log(`[DONE] ${mod.name}`);
  }
  
  saveMarkers(markers);
  
  const response = {
    status: 'success',
    stage: 'generate',
    module: runAll ? 'all' : targetModule,
    files_created: modulesToGenerate.filter(Boolean).map(m => `domains/${m.slug}/README.md`),
    marker_written: true,
  };
  
  console.log('\n' + JSON.stringify(response, null, 2) + '\n');
  process.exit(0);
}

main();
