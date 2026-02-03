#!/usr/bin/env node
/**
 * AXION Verify Script
 * 
 * Final gate before lock. Fails if critical issues remain.
 * Writes verify_status.json with per-module status.
 * 
 * Usage:
 *   npx ts-node axion/scripts/axion-verify.ts --module <name>
 *   npx ts-node axion/scripts/axion-verify.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
const CONFIG_PATH = path.join(AXION_ROOT, 'config', 'domains.json');
const DOMAINS_PATH = path.join(AXION_ROOT, 'domains');
const MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');
const STATUS_PATH = path.join(AXION_ROOT, 'registry', 'verify_status.json');

interface Module {
  name: string;
  slug: string;
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

interface VerifyStatus {
  version: string;
  last_verified: string;
  modules: Record<string, {
    status: 'PASS' | 'FAIL';
    verified_at: string;
    reason_codes: string[];
    hints: string[];
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

function saveStatus(status: VerifyStatus): void {
  const dir = path.dirname(STATUS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2));
}

function verifyModule(mod: Module, markers: StageMarkers): { status: 'PASS' | 'FAIL'; reason_codes: string[]; hints: string[] } {
  const reason_codes: string[] = [];
  const hints: string[] = [];
  
  if (!markers.markers[mod.slug]?.generate) {
    reason_codes.push('PREREQ_NOT_SATISFIED');
    hints.push('Run generate stage first');
  }
  
  if (!markers.markers[mod.slug]?.seed) {
    reason_codes.push('PREREQ_NOT_SATISFIED');
    hints.push('Run seed stage first');
  }
  
  const docPath = path.join(DOMAINS_PATH, mod.slug, 'README.md');
  
  if (!fs.existsSync(docPath)) {
    reason_codes.push('MISSING_DOC');
    hints.push('Generate module documentation');
    return { status: 'FAIL', reason_codes, hints };
  }
  
  const content = fs.readFileSync(docPath, 'utf-8');
  
  if (!content.includes('## ACCEPTANCE')) {
    reason_codes.push('MISSING_ACCEPTANCE');
    hints.push('Add ACCEPTANCE criteria section');
  }
  
  const requiredSections = ['## 1.', '## 2.'];
  for (const section of requiredSections) {
    if (!content.includes(section)) {
      reason_codes.push('MISSING_SECTION');
      hints.push(`Add required section: ${section}`);
    }
  }
  
  const tbdCount = (content.match(/\[TBD\]/g) || []).length;
  if (tbdCount > 5) {
    reason_codes.push('TBD_IN_REQUIRED');
    hints.push(`Resolve ${tbdCount} [TBD] placeholders`);
  }
  
  const unknownCount = (content.match(/UNKNOWN/g) || []).length;
  if (unknownCount > 0) {
    reason_codes.push('UNKNOWN_WITHOUT_QUESTION');
    hints.push(`Address ${unknownCount} UNKNOWN items`);
  }
  
  if (mod.dependencies) {
    for (const dep of mod.dependencies) {
      if (!markers.markers[dep]?.verify || markers.markers[dep].verify.status !== 'PASS') {
        reason_codes.push('DEP_NOT_VERIFIED');
        hints.push(`Dependency ${dep} must pass verify first`);
      }
    }
  }
  
  const status = reason_codes.length === 0 ? 'PASS' : 'FAIL';
  return { status, reason_codes, hints };
}

function main() {
  const args = process.argv.slice(2);
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  npx ts-node axion/scripts/axion-verify.ts --module <name>');
    console.log('  npx ts-node axion/scripts/axion-verify.ts --all');
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
  
  const modulesToVerify = runAll
    ? config.canonical_order.map(slug => config.modules.find(m => m.slug === slug)!)
    : [targetMod!];
  
  console.log('\n[AXION] Verify\n');
  
  let allPassed = true;
  
  for (const mod of modulesToVerify) {
    if (!mod) continue;
    
    console.log(`[INFO] Verifying ${mod.name}...`);
    const result = verifyModule(mod, markers);
    
    status.modules[mod.slug] = {
      status: result.status,
      verified_at: new Date().toISOString(),
      reason_codes: result.reason_codes,
      hints: result.hints,
    };
    
    if (result.status === 'PASS') {
      console.log(`[PASS] ${mod.name}`);
    } else {
      console.log(`[FAIL] ${mod.name}`);
      console.log(`  Reason codes: ${result.reason_codes.join(', ')}`);
      allPassed = false;
    }
    
    if (!markers.markers[mod.slug]) {
      markers.markers[mod.slug] = {};
    }
    markers.markers[mod.slug].verify = {
      completed_at: new Date().toISOString(),
      status: result.status,
    };
  }
  
  status.last_verified = new Date().toISOString();
  saveStatus(status);
  saveMarkers(markers);
  
  const response = {
    status: allPassed ? 'success' : 'failed',
    stage: 'verify',
    module: runAll ? 'all' : targetModule,
    all_passed: allPassed,
  };
  
  console.log('\n' + JSON.stringify(response, null, 2) + '\n');
  process.exit(allPassed ? 0 : 1);
}

main();
