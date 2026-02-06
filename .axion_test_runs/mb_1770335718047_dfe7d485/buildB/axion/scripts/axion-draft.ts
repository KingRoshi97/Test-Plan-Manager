#!/usr/bin/env node
/**
 * AXION Draft Script
 * 
 * Fills documentation sections with content based on upstream docs.
 * Requires generate and seed stages to be complete.
 * 
 * Usage:
 *   npx tsx axion/scripts/axion-draft.ts --root <workspace> --module <name>
 *   npx tsx axion/scripts/axion-draft.ts --root <workspace> --all
 */

import * as fs from 'fs';
import * as path from 'path';

// Parse --root argument first for two-root support
const args = process.argv.slice(2);
const rootArgIndex = args.indexOf('--root');
const WORKSPACE_ROOT = rootArgIndex !== -1 && args[rootArgIndex + 1]
  ? args[rootArgIndex + 1]
  : process.env.AXION_WORKSPACE || process.cwd();

// System root (read-only) - contains config and templates
const AXION_ROOT = process.env.AXION_SYSTEM_ROOT || path.join(path.dirname(WORKSPACE_ROOT), 'axion');

// Config from system root
const CONFIG_PATH = path.join(AXION_ROOT, 'config', 'domains.json');

// Outputs to workspace root
const DOMAINS_PATH = path.join(WORKSPACE_ROOT, 'domains');
const REGISTRY_PATH = path.join(WORKSPACE_ROOT, 'registry');
const MARKERS_PATH = path.join(REGISTRY_PATH, 'stage_markers.json');

interface Module {
  name: string;
  slug: string;
  prefix: string;
  type: string;
  dependencies?: string[];
}

interface Config {
  modules: Module[];
  canonical_order: string[];
}

// Flat markers structure: { moduleName: { stageName: { ... } } }
type StageMarkers = Record<string, Record<string, any>>;

function loadConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadMarkers(): StageMarkers {
  if (!fs.existsSync(MARKERS_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(MARKERS_PATH, 'utf-8'));
}

function saveMarkers(markers: StageMarkers): void {
  if (!fs.existsSync(REGISTRY_PATH)) {
    fs.mkdirSync(REGISTRY_PATH, { recursive: true });
  }
  fs.writeFileSync(MARKERS_PATH, JSON.stringify(markers, null, 2));
}

function checkPrerequisites(mod: Module, markers: StageMarkers): string[] {
  const missing: string[] = [];
  
  if (!markers[mod.slug]?.generate) {
    missing.push(`generate:${mod.slug}`);
  }
  
  if (!markers[mod.slug]?.seed) {
    missing.push(`seed:${mod.slug}`);
  }
  
  if (mod.dependencies) {
    for (const dep of mod.dependencies) {
      if (!markers[dep]?.seed) {
        missing.push(dep);
      }
    }
  }
  
  return missing;
}

function draftModule(mod: Module): void {
  const docPath = path.join(DOMAINS_PATH, mod.slug, 'README.md');
  
  if (!fs.existsSync(docPath)) {
    return;
  }
  
  let content = fs.readFileSync(docPath, 'utf-8');
  
  content = content.replace('- Status: DRAFT', '- Status: DRAFTED');
  content = content.replace('- Last Updated: [TBD]', `- Last Updated: ${new Date().toISOString().split('T')[0]}`);
  
  fs.writeFileSync(docPath, content);
}

function main() {
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  npx tsx axion/scripts/axion-draft.ts --root <workspace> --module <name>');
    console.log('  npx tsx axion/scripts/axion-draft.ts --root <workspace> --all');
    process.exit(1);
  }
  
  const config = loadConfig();
  const markers = loadMarkers();
  
  const targetMod = config.modules.find(m => m.slug === targetModule);
  
  if (!runAll && !targetMod) {
    console.error(`[ERROR] Module "${targetModule}" not found`);
    process.exit(1);
  }
  
  const modulesToDraft = runAll
    ? config.canonical_order.map(slug => config.modules.find(m => m.slug === slug)!)
    : [targetMod!];
  
  console.log('\n[AXION] Draft\n');
  
  for (const mod of modulesToDraft) {
    if (!mod) continue;
    
    const missing = checkPrerequisites(mod, markers);
    
    if (missing.length > 0) {
      const response = {
        status: 'blocked_by',
        stage: 'draft',
        module: mod.slug,
        missing: missing,
        hint: missing.map(m => {
          if (m.startsWith('generate:')) {
            return `npx tsx axion/scripts/axion-generate.ts --root ${WORKSPACE_ROOT} --module ${m.replace('generate:', '')}`;
          }
          if (m.startsWith('seed:')) {
            return `npx tsx axion/scripts/axion-seed.ts --root ${WORKSPACE_ROOT} --module ${m.replace('seed:', '')}`;
          }
          return `npx tsx axion/scripts/axion-seed.ts --root ${WORKSPACE_ROOT} --module ${m}`;
        }),
      };
      
      console.log(JSON.stringify(response, null, 2));
      
      if (!runAll) {
        process.exit(1);
      }
      continue;
    }
    
    console.log(`[INFO] Drafting ${mod.name}...`);
    draftModule(mod);
    
    if (!markers[mod.slug]) {
      markers[mod.slug] = {};
    }
    markers[mod.slug].draft = {
      completed_at: new Date().toISOString(),
    };
    
    console.log(`[DONE] ${mod.name}`);
  }
  
  saveMarkers(markers);
  
  const response = {
    status: 'success',
    stage: 'draft',
    module: runAll ? 'all' : targetModule,
    marker_written: true,
  };
  
  console.log('\n' + JSON.stringify(response, null, 2) + '\n');
  process.exit(0);
}

main();
