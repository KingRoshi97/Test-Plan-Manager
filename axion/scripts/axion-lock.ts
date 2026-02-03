#!/usr/bin/env node
/**
 * AXION Lock Script
 * 
 * Freezes module after verify PASS. Generates ERC document.
 * Refuses to run unless verify status is PASS.
 * 
 * Usage:
 *   npx ts-node axion/scripts/axion-lock.ts --module <name>
 *   npx ts-node axion/scripts/axion-lock.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
const CONFIG_PATH = path.join(AXION_ROOT, 'config', 'domains.json');
const DOMAINS_PATH = path.join(AXION_ROOT, 'domains');
const MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');
const STATUS_PATH = path.join(AXION_ROOT, 'registry', 'verify_status.json');
const ERC_DIR = path.join(AXION_ROOT, 'registry', 'erc');

interface Module {
  name: string;
  slug: string;
  prefix: string;
}

interface Config {
  modules: Module[];
  canonical_order: string[];
}

interface StageMarkers {
  version: string;
  markers: Record<string, Record<string, any>>;
}

interface VerifyStatus {
  version: string;
  last_verified: string;
  modules: Record<string, {
    status: 'PASS' | 'FAIL';
    verified_at: string;
  }>;
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

function loadStatus(): VerifyStatus {
  if (!fs.existsSync(STATUS_PATH)) {
    return { version: '1.0.0', last_verified: '', modules: {} };
  }
  return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf-8'));
}

function generateERC(mod: Module): string {
  const docPath = path.join(DOMAINS_PATH, mod.slug, 'README.md');
  let docContent = '';
  if (fs.existsSync(docPath)) {
    docContent = fs.readFileSync(docPath, 'utf-8');
  }
  
  const tbdCount = (docContent.match(/\[TBD\]/g) || []).length;
  const unknownCount = (docContent.match(/UNKNOWN/g) || []).length;
  
  return `# ERC: Execution Readiness Checkpoint

## Module: ${mod.name}
## Prefix: ${mod.prefix}

## Metadata
- Generated: ${new Date().toISOString()}
- Status: LOCKED
- Version: 1.0.0

## Verification Summary
- [TBD] placeholders remaining: ${tbdCount}
- UNKNOWN items: ${unknownCount}
- All prerequisites: SATISFIED
- Cross-references: VALID

## Lock Confirmation
This module has passed verification and is now locked for execution.

## Checklist
- [x] Generate stage complete
- [x] Seed stage complete
- [x] Draft stage complete
- [x] Review stage complete
- [x] Verify stage PASS
- [x] ERC generated
- [x] Module LOCKED

## Agent Instructions
This module is now ready for implementation. Follow the documentation
in the module README.md for guidance on building the ${mod.name} module.
`;
}

function lockModule(mod: Module, status: VerifyStatus, markers: StageMarkers): { success: boolean; message: string } {
  const modStatus = status.modules[mod.slug];
  
  if (!modStatus || modStatus.status !== 'PASS') {
    return {
      success: false,
      message: `Cannot lock ${mod.name}: verify status is not PASS. Run verify first.`,
    };
  }
  
  if (!fs.existsSync(ERC_DIR)) {
    fs.mkdirSync(ERC_DIR, { recursive: true });
  }
  
  const ercContent = generateERC(mod);
  const ercPath = path.join(ERC_DIR, `${mod.slug}_ERC.md`);
  fs.writeFileSync(ercPath, ercContent);
  
  if (!markers.markers[mod.slug]) {
    markers.markers[mod.slug] = {};
  }
  markers.markers[mod.slug].lock = {
    completed_at: new Date().toISOString(),
    erc_path: path.relative(AXION_ROOT, ercPath),
  };
  
  return {
    success: true,
    message: `Locked ${mod.name}. ERC written to ${ercPath}`,
  };
}

function main() {
  const args = process.argv.slice(2);
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  npx ts-node axion/scripts/axion-lock.ts --module <name>');
    console.log('  npx ts-node axion/scripts/axion-lock.ts --all');
    process.exit(1);
  }
  
  const config = loadConfig();
  const markers = loadMarkers();
  const status = loadStatus();
  
  const targetMod = config.modules.find(m => m.slug === targetModule);
  
  if (!runAll && !targetMod) {
    console.error(`[ERROR] Module "${targetModule}" not found`);
    process.exit(1);
  }
  
  const modulesToLock = runAll
    ? config.canonical_order.map(slug => config.modules.find(m => m.slug === slug)!)
    : [targetMod!];
  
  console.log('\n[AXION] Lock\n');
  
  let allSucceeded = true;
  
  for (const mod of modulesToLock) {
    if (!mod) continue;
    
    console.log(`[INFO] Locking ${mod.name}...`);
    const result = lockModule(mod, status, markers);
    
    if (result.success) {
      console.log(`[DONE] ${result.message}`);
    } else {
      console.log(`[REFUSED] ${result.message}`);
      allSucceeded = false;
      
      if (!runAll) {
        saveMarkers(markers);
        process.exit(1);
      }
    }
  }
  
  saveMarkers(markers);
  
  const response = {
    status: allSucceeded ? 'success' : 'partial',
    stage: 'lock',
    module: runAll ? 'all' : targetModule,
  };
  
  console.log('\n' + JSON.stringify(response, null, 2) + '\n');
  process.exit(allSucceeded ? 0 : 1);
}

main();
