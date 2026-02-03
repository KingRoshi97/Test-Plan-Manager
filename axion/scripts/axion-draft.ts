#!/usr/bin/env node
/**
 * AXION Draft Script
 * 
 * Fills documentation sections with content based on upstream docs.
 * Requires generate and seed stages to be complete.
 * 
 * Usage:
 *   npx ts-node axion/scripts/axion-draft.ts --module <name>
 *   npx ts-node axion/scripts/axion-draft.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
const CONFIG_PATH = path.join(AXION_ROOT, 'config', 'domains.json');
const DOMAINS_PATH = path.join(AXION_ROOT, 'domains');
const MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');

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

interface StageMarkers {
  version: string;
  markers: Record<string, Record<string, any>>;
}

function loadConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadMarkers(): StageMarkers {
  if (!fs.existsSync(MARKERS_PATH)) {
    return { version: '1.0.0', markers: {} };
  }
  return JSON.parse(fs.readFileSync(MARKERS_PATH, 'utf-8'));
}

function saveMarkers(markers: StageMarkers): void {
  fs.writeFileSync(MARKERS_PATH, JSON.stringify(markers, null, 2));
}

function checkPrerequisites(mod: Module, markers: StageMarkers): string[] {
  const missing: string[] = [];
  
  if (!markers.markers[mod.slug]?.generate) {
    missing.push(`generate:${mod.slug}`);
  }
  
  if (!markers.markers[mod.slug]?.seed) {
    missing.push(`seed:${mod.slug}`);
  }
  
  if (mod.dependencies) {
    for (const dep of mod.dependencies) {
      if (!markers.markers[dep]?.seed) {
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
  const args = process.argv.slice(2);
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  npx ts-node axion/scripts/axion-draft.ts --module <name>');
    console.log('  npx ts-node axion/scripts/axion-draft.ts --all');
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
            return `npx ts-node axion/scripts/axion-generate.ts --module ${m.replace('generate:', '')}`;
          }
          if (m.startsWith('seed:')) {
            return `npx ts-node axion/scripts/axion-seed.ts --module ${m.replace('seed:', '')}`;
          }
          return `npx ts-node axion/scripts/axion-seed.ts --module ${m}`;
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
    
    if (!markers.markers[mod.slug]) {
      markers.markers[mod.slug] = {};
    }
    markers.markers[mod.slug].draft = {
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
