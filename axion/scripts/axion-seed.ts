#!/usr/bin/env node
/**
 * AXION Seed Script
 * 
 * Adds neutral scaffolding (placeholders, headings) to generated docs.
 * Must be idempotent - running twice produces same result.
 * 
 * Usage:
 *   npx ts-node axion/scripts/axion-seed.ts --module <name>
 *   npx ts-node axion/scripts/axion-seed.ts --all
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

function checkPrerequisites(mod: Module, markers: StageMarkers, config: Config): string[] {
  const missing: string[] = [];
  
  if (!markers.markers[mod.slug]?.generate) {
    missing.push(`generate:${mod.slug}`);
  }
  
  if (mod.dependencies) {
    for (const dep of mod.dependencies) {
      if (!markers.markers[dep]?.generate) {
        missing.push(dep);
      }
    }
  }
  
  return missing;
}

function seedModule(mod: Module): void {
  const docPath = path.join(DOMAINS_PATH, mod.slug, 'README.md');
  
  if (!fs.existsSync(docPath)) {
    return;
  }
  
  let content = fs.readFileSync(docPath, 'utf-8');
  
  if (!content.includes('## ACCEPTANCE')) {
    content += '\n\n## ACCEPTANCE\n- [ ] All [TBD] placeholders populated\n';
  }
  
  if (!content.includes('## OPEN_QUESTIONS')) {
    content += '\n\n## OPEN_QUESTIONS\n- [TBD] - List unresolved questions\n';
  }
  
  if (!content.includes('## Agent Rules')) {
    const acceptanceIdx = content.indexOf('## ACCEPTANCE');
    if (acceptanceIdx !== -1) {
      content = content.slice(0, acceptanceIdx) +
        '## Agent Rules\n\n1. [TBD] - Define agent constraints.\n2. [TBD] - Define agent behaviors.\n\n' +
        content.slice(acceptanceIdx);
    } else {
      content += '\n\n## Agent Rules\n\n1. [TBD] - Define agent constraints.\n2. [TBD] - Define agent behaviors.\n';
    }
  }
  
  fs.writeFileSync(docPath, content);
}

function main() {
  const args = process.argv.slice(2);
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  npx ts-node axion/scripts/axion-seed.ts --module <name>');
    console.log('  npx ts-node axion/scripts/axion-seed.ts --all');
    process.exit(1);
  }
  
  const config = loadConfig();
  const markers = loadMarkers();
  
  const targetMod = config.modules.find(m => m.slug === targetModule);
  
  if (!runAll && !targetMod) {
    console.error(`[ERROR] Module "${targetModule}" not found`);
    process.exit(1);
  }
  
  const modulesToSeed = runAll
    ? config.canonical_order.map(slug => config.modules.find(m => m.slug === slug)!)
    : [targetMod!];
  
  console.log('\n[AXION] Seed\n');
  
  for (const mod of modulesToSeed) {
    if (!mod) continue;
    
    const missing = checkPrerequisites(mod, markers, config);
    
    if (missing.length > 0) {
      const response = {
        status: 'blocked_by',
        stage: 'seed',
        module: mod.slug,
        missing: missing,
        hint: missing.map(m => {
          if (m.startsWith('generate:')) {
            return `npx ts-node axion/scripts/axion-generate.ts --module ${m.replace('generate:', '')}`;
          }
          return `npx ts-node axion/scripts/axion-generate.ts --module ${m}`;
        }),
      };
      
      console.log(JSON.stringify(response, null, 2));
      
      if (!runAll) {
        process.exit(1);
      }
      continue;
    }
    
    console.log(`[INFO] Seeding ${mod.name}...`);
    seedModule(mod);
    
    if (!markers.markers[mod.slug]) {
      markers.markers[mod.slug] = {};
    }
    markers.markers[mod.slug].seed = {
      completed_at: new Date().toISOString(),
    };
    
    console.log(`[DONE] ${mod.name}`);
  }
  
  saveMarkers(markers);
  
  const response = {
    status: 'success',
    stage: 'seed',
    module: runAll ? 'all' : targetModule,
    marker_written: true,
  };
  
  console.log('\n' + JSON.stringify(response, null, 2) + '\n');
  process.exit(0);
}

main();
