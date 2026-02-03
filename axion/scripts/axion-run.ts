#!/usr/bin/env node
/**
 * AXION Preset Runner
 * 
 * Executes presets with dependency closure, guard enforcement, and report-driven execution.
 * Stops immediately on blocked_by or failed status.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-run.ts --preset mobile --plan docs:full
 *   node --import tsx axion/scripts/axion-run.ts --preset system --plan app:full
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, ExecSyncOptions } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
const CONFIG_PATH = path.join(AXION_ROOT, 'config', 'domains.json');
const PRESETS_PATH = path.join(AXION_ROOT, 'config', 'presets.json');
const REPORT_PATH = path.join(AXION_ROOT, 'registry', 'verify_report.json');
const STAGE_MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');
const LOCK_MANIFEST_PATH = path.join(AXION_ROOT, 'registry', 'lock_manifest.json');

interface Module {
  name: string;
  slug: string;
  dependencies?: string[];
}

interface Config {
  modules: Module[];
  canonical_order: string[];
}

interface Preset {
  label: string;
  description: string;
  modules: string[];
  include_dependencies: boolean;
  recommended_stage_plan?: string;
  guards?: {
    lock_requires_verify_pass?: boolean;
    disallow_lock?: boolean;
    require_modules_present?: string[];
  };
}

interface Gate {
  requires_stage?: string;
  requires_verify_pass?: boolean;
  requires_docs_locked?: boolean;
  requires_tests_pass?: boolean;
  allow_override?: boolean | string;
  error: string;
  message: string;
}

interface PresetsConfig {
  version: string;
  stage_plans: Record<string, string[]>;
  presets: Record<string, Preset>;
  gates?: Record<string, Gate>;
}

interface VerifyReport {
  overall_status: 'PASS' | 'FAIL';
  next_commands: string[];
}

interface StageMarkers {
  [module: string]: {
    [stage: string]: {
      completed_at: string;
      status: 'success' | 'failed';
    };
  };
}

interface ScriptResult {
  status: 'success' | 'blocked_by' | 'failed';
  stage?: string;
  module?: string;
  missing?: string[];
  hint?: string[];
  all_passed?: boolean;
}

function loadConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadPresets(): PresetsConfig {
  return JSON.parse(fs.readFileSync(PRESETS_PATH, 'utf-8'));
}

function loadVerifyReport(): VerifyReport | null {
  if (!fs.existsSync(REPORT_PATH)) return null;
  return JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'));
}

function loadStageMarkers(): StageMarkers {
  if (!fs.existsSync(STAGE_MARKERS_PATH)) return {};
  return JSON.parse(fs.readFileSync(STAGE_MARKERS_PATH, 'utf-8'));
}

function saveStageMarkers(markers: StageMarkers): void {
  fs.writeFileSync(STAGE_MARKERS_PATH, JSON.stringify(markers, null, 2));
}

function isDocsLocked(): boolean {
  return fs.existsSync(LOCK_MANIFEST_PATH);
}

function detectCycle(modules: Module[]): string[] | null {
  const depsOf = new Map<string, string[]>();
  for (const m of modules) {
    depsOf.set(m.slug, m.dependencies || []);
  }
  
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const cyclePath: string[] = [];
  
  function dfs(node: string): string[] | null {
    if (visiting.has(node)) {
      const cycleStart = cyclePath.indexOf(node);
      return [...cyclePath.slice(cycleStart), node];
    }
    if (visited.has(node)) return null;
    
    visiting.add(node);
    cyclePath.push(node);
    
    for (const dep of depsOf.get(node) || []) {
      const cycle = dfs(dep);
      if (cycle) return cycle;
    }
    
    cyclePath.pop();
    visiting.delete(node);
    visited.add(node);
    return null;
  }
  
  for (const m of modules) {
    const cycle = dfs(m.slug);
    if (cycle) return cycle;
  }
  
  return null;
}

function computeDependencyClosure(seeds: string[], modules: Module[]): Set<string> {
  const depsOf = new Map<string, string[]>();
  for (const m of modules) {
    depsOf.set(m.slug, m.dependencies || []);
  }
  
  const resolved = new Set<string>();
  const stack = [...seeds];
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (resolved.has(current)) continue;
    resolved.add(current);
    
    for (const dep of depsOf.get(current) || []) {
      if (!resolved.has(dep)) {
        stack.push(dep);
      }
    }
  }
  
  return resolved;
}

function resolveModules(preset: Preset, config: Config): string[] {
  const cycle = detectCycle(config.modules);
  if (cycle) {
    console.error(`[FAIL] CYCLE_DETECTED: ${cycle.join(' -> ')}`);
    process.exit(1);
  }
  
  for (const slug of preset.modules) {
    if (!config.canonical_order.includes(slug)) {
      console.error(`[FAIL] INVALID_MODULE: "${slug}" not in canonical_order`);
      process.exit(1);
    }
  }
  
  let resolved: Set<string>;
  if (preset.include_dependencies) {
    resolved = computeDependencyClosure(preset.modules, config.modules);
  } else {
    resolved = new Set(preset.modules);
  }
  
  return config.canonical_order.filter(slug => resolved.has(slug));
}

function checkGate(stage: string, moduleSlug: string, gates: Record<string, Gate>, markers: StageMarkers, override: boolean): ScriptResult | null {
  const gate = gates[stage];
  if (!gate) return null;
  
  if (gate.requires_stage) {
    const moduleMarkers = markers[moduleSlug] || {};
    const requiredStage = moduleMarkers[gate.requires_stage];
    if (!requiredStage || requiredStage.status !== 'success') {
      if (override && gate.allow_override) {
        console.log(`[WARN] Gate override enabled for ${stage}`);
        return null;
      }
      return {
        status: 'blocked_by',
        stage,
        module: moduleSlug,
        missing: [gate.requires_stage],
        hint: [gate.message],
      };
    }
  }
  
  if (gate.requires_verify_pass) {
    const report = loadVerifyReport();
    if (!report || report.overall_status !== 'PASS') {
      if (override && gate.allow_override) {
        console.log(`[WARN] Gate override enabled for ${stage}`);
        return null;
      }
      return {
        status: 'blocked_by',
        stage,
        missing: ['verify PASS'],
        hint: [gate.message],
      };
    }
  }
  
  if (gate.requires_docs_locked) {
    if (!isDocsLocked()) {
      if (override && gate.allow_override) {
        console.log(`[WARN] Gate override enabled for ${stage} (dev_build mode)`);
        return null;
      }
      return {
        status: 'blocked_by',
        stage,
        missing: ['locked docs'],
        hint: [gate.message],
      };
    }
  }
  
  return null;
}

function runScript(stage: string, moduleSlug: string | null): ScriptResult {
  const scriptPath = path.join(__dirname, `axion-${stage}.ts`);
  
  if (!fs.existsSync(scriptPath)) {
    console.log(`[SKIP] Script not found: axion-${stage}.ts`);
    return { status: 'success' };
  }
  
  let command = `node --import tsx ${scriptPath}`;
  if (moduleSlug) {
    command += ` --module ${moduleSlug}`;
  }
  
  const options: ExecSyncOptions = {
    cwd: process.cwd(),
    env: { ...process.env, AXION_WORKSPACE: AXION_ROOT },
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  };
  
  let stdout = '';
  let exitCode = 0;
  
  try {
    stdout = execSync(command, options) as string;
  } catch (error: any) {
    exitCode = error.status || 1;
    stdout = error.stdout || '';
  }
  
  const jsonMatch = stdout.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return { status: exitCode === 0 ? 'success' : 'failed' };
    }
  }
  
  return { status: exitCode === 0 ? 'success' : 'failed' };
}

function runGlobalScript(stage: string): ScriptResult {
  const scriptPath = path.join(__dirname, `axion-${stage}.ts`);
  
  if (!fs.existsSync(scriptPath)) {
    console.log(`[SKIP] Script not found: axion-${stage}.ts`);
    return { status: 'success' };
  }
  
  const command = `node --import tsx ${scriptPath}`;
  
  const options: ExecSyncOptions = {
    cwd: process.cwd(),
    env: { ...process.env, AXION_WORKSPACE: AXION_ROOT },
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  };
  
  let stdout = '';
  let exitCode = 0;
  
  try {
    stdout = execSync(command, options) as string;
    console.log(stdout);
  } catch (error: any) {
    exitCode = error.status || 1;
    stdout = error.stdout || '';
    console.log(stdout);
    if (error.stderr) console.error(error.stderr);
  }
  
  const jsonMatch = stdout.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return { status: exitCode === 0 ? 'success' : 'failed' };
    }
  }
  
  return { status: exitCode === 0 ? 'success' : 'failed' };
}

function enforceGuards(preset: Preset, plan: string[]): void {
  const guards = preset.guards || {};
  
  if (guards.disallow_lock && plan.includes('lock')) {
    console.error(`[FAIL] GUARD_DISALLOW_LOCK: Preset "${preset.label}" does not allow lock stage`);
    process.exit(1);
  }
  
  if (guards.lock_requires_verify_pass && plan.includes('lock')) {
    const report = loadVerifyReport();
    if (report && report.overall_status !== 'PASS') {
      console.error(`[FAIL] GUARD_LOCK_REQUIRES_VERIFY_PASS: verify must PASS before lock`);
      if (report.next_commands.length > 0) {
        console.error('\nNext commands:');
        for (const cmd of report.next_commands) {
          console.error(`  ${cmd}`);
        }
      }
      process.exit(1);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  
  const presetIdx = args.indexOf('--preset');
  const planIdx = args.indexOf('--plan');
  const overrideFlag = args.includes('--override');
  
  const presetName = presetIdx !== -1 ? args[presetIdx + 1] : null;
  const planName = planIdx !== -1 ? args[planIdx + 1] : null;
  
  if (!presetName || !planName) {
    console.log('AXION Preset Runner\n');
    console.log('Usage:');
    console.log('  node --import tsx axion/scripts/axion-run.ts --preset <name> --plan <plan>');
    console.log('\nStage Plans:');
    console.log('  docs:scaffold  - generate, seed');
    console.log('  docs:content   - draft, review, verify');
    console.log('  docs:full      - generate, seed, draft, review, verify');
    console.log('  docs:release   - verify, lock');
    console.log('  app:bootstrap  - scaffold-app');
    console.log('  app:build      - build');
    console.log('  app:test       - test');
    console.log('  app:full       - scaffold-app, build, test');
    console.log('  app:ship       - deploy');
    console.log('  export:package - package');
    console.log('\nFlags:');
    console.log('  --override     - Allow gate overrides where permitted');
    console.log('\nExample:');
    console.log('  node --import tsx axion/scripts/axion-run.ts --preset system --plan docs:full');
    process.exit(1);
  }
  
  const config = loadConfig();
  const presetsConfig = loadPresets();
  const gates = presetsConfig.gates || {};
  
  const preset = presetsConfig.presets[presetName];
  if (!preset) {
    console.error(`[FAIL] PRESET_NOT_FOUND: "${presetName}"`);
    console.error(`Available presets: ${Object.keys(presetsConfig.presets).join(', ')}`);
    process.exit(1);
  }
  
  const plan = presetsConfig.stage_plans[planName];
  if (!plan) {
    console.error(`[FAIL] PLAN_NOT_FOUND: "${planName}"`);
    console.error(`Available plans: ${Object.keys(presetsConfig.stage_plans).join(', ')}`);
    process.exit(1);
  }
  
  console.log('\n[AXION] Preset Runner\n');
  console.log(`Preset: ${preset.label} (${presetName})`);
  console.log(`Plan:   ${planName} → [${plan.join(' → ')}]`);
  if (overrideFlag) {
    console.log(`Mode:   --override enabled`);
  }
  
  enforceGuards(preset, plan);
  
  const resolvedModules = resolveModules(preset, config);
  console.log(`Modules: ${resolvedModules.join(', ')}`);
  console.log('');
  
  const moduleAwareStages = ['generate', 'seed', 'draft', 'review', 'verify'];
  const globalStages = ['init', 'lock', 'overhaul', 'import', 'scaffold-app', 'build', 'test', 'deploy', 'package'];
  
  let markers = loadStageMarkers();
  
  for (const stage of plan) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`[STAGE] ${stage.toUpperCase()}`);
    console.log(`${'─'.repeat(50)}\n`);
    
    if (moduleAwareStages.includes(stage)) {
      for (const moduleSlug of resolvedModules) {
        const gateResult = checkGate(stage, moduleSlug, gates, markers, overrideFlag);
        if (gateResult) {
          console.log(`\n[BLOCKED] ${moduleSlug}`);
          console.log(JSON.stringify(gateResult, null, 2));
          process.exit(1);
        }
        
        console.log(`[RUN] ${stage} --module ${moduleSlug}`);
        const result = runScript(stage, moduleSlug);
        
        if (result.status === 'blocked_by') {
          console.log(`\n[BLOCKED] ${moduleSlug}`);
          console.log(JSON.stringify(result, null, 2));
          process.exit(1);
        }
        
        if (result.status === 'failed') {
          console.log(`\n[FAILED] ${moduleSlug}`);
          console.log(JSON.stringify(result, null, 2));
          
          markers[moduleSlug] = markers[moduleSlug] || {};
          markers[moduleSlug][stage] = {
            completed_at: new Date().toISOString(),
            status: 'failed',
          };
          saveStageMarkers(markers);
          
          if (stage === 'verify' || stage === 'review') {
            const report = loadVerifyReport();
            if (report && report.next_commands.length > 0) {
              console.log('\nNext commands:');
              for (const cmd of report.next_commands) {
                console.log(`  ${cmd}`);
              }
            }
          }
          
          process.exit(1);
        }
        
        markers[moduleSlug] = markers[moduleSlug] || {};
        markers[moduleSlug][stage] = {
          completed_at: new Date().toISOString(),
          status: 'success',
        };
        saveStageMarkers(markers);
        
        console.log(`[DONE] ${moduleSlug}`);
      }
    } else if (globalStages.includes(stage)) {
      const gateResult = checkGate(stage, 'global', gates, markers, overrideFlag);
      if (gateResult) {
        console.log(`\n[BLOCKED] ${stage}`);
        console.log(JSON.stringify(gateResult, null, 2));
        process.exit(1);
      }
      
      if (stage === 'lock') {
        for (const moduleSlug of resolvedModules) {
          console.log(`[RUN] lock --module ${moduleSlug}`);
          const result = runScript('lock', moduleSlug);
          
          if (result.status === 'blocked_by' || result.status === 'failed') {
            console.log(`\n[FAILED] lock ${moduleSlug}`);
            console.log(JSON.stringify(result, null, 2));
            process.exit(1);
          }
          
          console.log(`[DONE] ${moduleSlug}`);
        }
      } else {
        console.log(`[RUN] ${stage}`);
        const result = runGlobalScript(stage);
        
        if (result.status === 'blocked_by' || result.status === 'failed') {
          console.log(`\n[FAILED] ${stage}`);
          console.log(JSON.stringify(result, null, 2));
          process.exit(1);
        }
        
        console.log(`[DONE] ${stage}`);
      }
    } else {
      console.log(`[SKIP] Unknown stage type: ${stage}`);
    }
  }
  
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`[SUCCESS] Preset "${presetName}" completed with plan "${planName}"`);
  console.log(`${'═'.repeat(50)}\n`);
  
  const response = {
    status: 'success',
    preset: presetName,
    plan: planName,
    modules_executed: resolvedModules,
    stages_completed: plan,
  };
  
  console.log(JSON.stringify(response, null, 2));
}

main();
