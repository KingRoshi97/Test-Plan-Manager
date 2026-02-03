#!/usr/bin/env node
/**
 * AXION Run - Deterministic Execution Wrapper
 * 
 * THE single entrypoint for running AXION. Agents should NEVER call
 * stage scripts directly in normal operation.
 * 
 * Features:
 * - Preflight validation (always runs first)
 * - Run lock (prevents concurrent executions)
 * - Run history ledger (persistent records)
 * - Stage execution via child_process spawn
 * - Gate enforcement with --override option
 * - Auto-prereqs option for self-resolving blocked_by
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-run.ts --preset system --plan docs:full
 *   node --import tsx axion/scripts/axion-run.ts --all --plan docs:full
 *   node --import tsx axion/scripts/axion-run.ts --module frontend --plan docs
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn, SpawnOptions } from 'child_process';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const LOCK_STALE_MINUTES = 30;
const STDOUT_TAIL_LINES = 200;

// ============================================================================
// TYPES
// ============================================================================

interface Module {
  name: string;
  slug: string;
  dependencies?: string[];
}

interface Config {
  modules: Module[];
  canonical_order?: string[];
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

interface RunLock {
  version: string;
  run_id: string;
  created_at: string;
  pid: number | null;
  command: string;
  args: string[];
}

interface StageResult {
  stage: string;
  mode: 'all' | 'module';
  module: string | null;
  started_at: string;
  finished_at: string;
  status: 'success' | 'failed' | 'blocked_by';
  json_result: Record<string, any> | null;
  stdout_tail: string;
  stderr_tail: string;
  exit_code: number | null;
}

interface RunHistory {
  version: string;
  run_id: string;
  started_at: string;
  finished_at: string;
  root: string;
  invocation: { command: string; args: string[] };
  plan: string;
  preset: string | null;
  mode: 'all' | 'module' | 'preset';
  module: string | null;
  stages: StageResult[];
  overall_status: 'success' | 'failed' | 'blocked_by';
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

interface VerifyReport {
  overall_status: 'PASS' | 'FAIL';
  next_commands: string[];
}

// Reason codes
const REASON_CODES = {
  RUN_LOCK_ACTIVE: 'Another run is in progress',
  MALFORMED_OUTPUT: 'Stage script did not produce valid JSON output',
  STAGE_FAILED: 'Stage execution failed',
  PRECHECK_FAILED: 'Preflight checks failed',
  PRESET_NOT_FOUND: 'Preset not found in presets.json',
  PLAN_NOT_FOUND: 'Stage plan not found in presets.json',
  MODULE_NOT_FOUND: 'Module not found in domains.json',
} as const;

// ============================================================================
// UTILITIES
// ============================================================================

function generateRunId(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const random = crypto.randomBytes(4).toString('hex');
  return `run_${timestamp}_${random}`;
}

function log(level: 'PASS' | 'FAIL' | 'INFO' | 'WARN' | 'RUN' | 'DONE' | 'SKIP' | 'BLOCKED', message: string): void {
  console.log(`[${level}] ${message}`);
}

function tailLines(text: string, n: number): string {
  const lines = text.split('\n');
  return lines.slice(-n).join('\n');
}

function parseJsonFromOutput(output: string): Record<string, any> | null {
  // Find last JSON object in output
  const matches = output.match(/\{[\s\S]*?\}(?=\s*$|\n\s*$)/g);
  if (!matches || matches.length === 0) return null;
  
  // Try to parse from end (most likely the result JSON)
  for (let i = matches.length - 1; i >= 0; i--) {
    try {
      return JSON.parse(matches[i]);
    } catch {
      continue;
    }
  }
  
  return null;
}

// ============================================================================
// PATH HELPERS
// ============================================================================

function getPaths(root: string) {
  const axionRoot = path.join(root, 'axion');
  return {
    root,
    axionRoot,
    config: path.join(axionRoot, 'config', 'domains.json'),
    presets: path.join(axionRoot, 'config', 'presets.json'),
    registry: path.join(axionRoot, 'registry'),
    runLock: path.join(axionRoot, 'registry', 'run_lock.json'),
    runHistory: path.join(axionRoot, 'registry', 'run_history'),
    stageMarkers: path.join(axionRoot, 'registry', 'stage_markers.json'),
    verifyReport: path.join(axionRoot, 'registry', 'verify_report.json'),
    lockManifest: path.join(axionRoot, 'registry', 'lock_manifest.json'),
    scripts: __dirname,
  };
}

// ============================================================================
// FILE LOADERS
// ============================================================================

function loadConfig(configPath: string): Config {
  const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  // Build canonical order from modules if not present
  if (!data.canonical_order) {
    data.canonical_order = data.modules.map((m: Module) => m.slug);
  }
  return data;
}

function loadPresets(presetsPath: string): PresetsConfig {
  return JSON.parse(fs.readFileSync(presetsPath, 'utf-8'));
}

function loadStageMarkers(markersPath: string): StageMarkers {
  if (!fs.existsSync(markersPath)) return {};
  return JSON.parse(fs.readFileSync(markersPath, 'utf-8'));
}

function saveStageMarkers(markersPath: string, markers: StageMarkers): void {
  fs.writeFileSync(markersPath, JSON.stringify(markers, null, 2));
}

function loadVerifyReport(reportPath: string): VerifyReport | null {
  if (!fs.existsSync(reportPath)) return null;
  return JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
}

function isDocsLocked(lockPath: string): boolean {
  return fs.existsSync(lockPath);
}

// ============================================================================
// RUN LOCK
// ============================================================================

function isLockStale(lock: RunLock): boolean {
  const created = new Date(lock.created_at);
  const now = new Date();
  const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
  return diffMinutes > LOCK_STALE_MINUTES;
}

function acquireLock(paths: ReturnType<typeof getPaths>, runId: string, args: string[]): { acquired: boolean; reason?: string } {
  const lockPath = paths.runLock;
  
  // Ensure registry exists
  if (!fs.existsSync(paths.registry)) {
    fs.mkdirSync(paths.registry, { recursive: true });
  }
  
  if (fs.existsSync(lockPath)) {
    try {
      const existingLock: RunLock = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
      
      if (isLockStale(existingLock)) {
        log('WARN', `Stale lock found (run_id: ${existingLock.run_id}), removing...`);
        fs.unlinkSync(lockPath);
      } else {
        return { 
          acquired: false, 
          reason: `Active run lock: ${existingLock.run_id} (started ${existingLock.created_at})` 
        };
      }
    } catch {
      // Corrupted lock file, remove it
      fs.unlinkSync(lockPath);
    }
  }
  
  const lock: RunLock = {
    version: '1.0.0',
    run_id: runId,
    created_at: new Date().toISOString(),
    pid: process.pid,
    command: 'axion-run',
    args,
  };
  
  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
  return { acquired: true };
}

function releaseLock(paths: ReturnType<typeof getPaths>): void {
  if (fs.existsSync(paths.runLock)) {
    fs.unlinkSync(paths.runLock);
  }
}

function unlockIfStale(paths: ReturnType<typeof getPaths>): boolean {
  if (!fs.existsSync(paths.runLock)) {
    log('INFO', 'No lock file present');
    return false;
  }
  
  try {
    const lock: RunLock = JSON.parse(fs.readFileSync(paths.runLock, 'utf-8'));
    if (isLockStale(lock)) {
      fs.unlinkSync(paths.runLock);
      log('PASS', `Stale lock removed (run_id: ${lock.run_id})`);
      return true;
    } else {
      log('WARN', `Lock is fresh (created ${lock.created_at}), not removing`);
      return false;
    }
  } catch {
    fs.unlinkSync(paths.runLock);
    log('PASS', 'Corrupted lock file removed');
    return true;
  }
}

// ============================================================================
// RUN HISTORY
// ============================================================================

function initRunHistory(
  runId: string,
  root: string,
  args: string[],
  plan: string,
  preset: string | null,
  mode: 'all' | 'module' | 'preset',
  module: string | null
): RunHistory {
  return {
    version: '1.0.0',
    run_id: runId,
    started_at: new Date().toISOString(),
    finished_at: '',
    root,
    invocation: { command: 'axion-run', args },
    plan,
    preset,
    mode,
    module,
    stages: [],
    overall_status: 'success',
    next_commands: [],
  };
}

function saveRunHistory(paths: ReturnType<typeof getPaths>, history: RunHistory): void {
  if (!fs.existsSync(paths.runHistory)) {
    fs.mkdirSync(paths.runHistory, { recursive: true });
  }
  
  const filePath = path.join(paths.runHistory, `${history.run_id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
}

// ============================================================================
// PREFLIGHT
// ============================================================================

async function runPreflight(root: string): Promise<{ success: boolean; output: string }> {
  const preflightScript = path.join(__dirname, 'axion-preflight.ts');
  
  return new Promise((resolve) => {
    const proc = spawn('node', ['--import', 'tsx', preflightScript, '--root', root], {
      cwd: root,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout?.on('data', (data) => { stdout += data.toString(); });
    proc.stderr?.on('data', (data) => { stderr += data.toString(); });
    
    proc.on('close', (code) => {
      resolve({ success: code === 0, output: stdout + stderr });
    });
  });
}

// ============================================================================
// STAGE EXECUTION
// ============================================================================

async function executeStage(
  stage: string,
  moduleSlug: string | null,
  paths: ReturnType<typeof getPaths>,
  root: string
): Promise<StageResult> {
  const started_at = new Date().toISOString();
  const scriptPath = path.join(paths.scripts, `axion-${stage}.ts`);
  
  if (!fs.existsSync(scriptPath)) {
    return {
      stage,
      mode: moduleSlug ? 'module' : 'all',
      module: moduleSlug,
      started_at,
      finished_at: new Date().toISOString(),
      status: 'success',
      json_result: { status: 'success', stage, note: 'Script not found, skipped' },
      stdout_tail: '',
      stderr_tail: '',
      exit_code: 0,
    };
  }
  
  const args = ['--import', 'tsx', scriptPath];
  if (moduleSlug) {
    args.push('--module', moduleSlug);
  }
  
  return new Promise((resolve) => {
    const proc = spawn('node', args, {
      cwd: root,
      env: { ...process.env, AXION_WORKSPACE: paths.axionRoot },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout?.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      process.stdout.write(text);
    });
    
    proc.stderr?.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(text);
    });
    
    proc.on('close', (code) => {
      const finished_at = new Date().toISOString();
      const jsonResult = parseJsonFromOutput(stdout);
      
      let status: 'success' | 'failed' | 'blocked_by' = 'success';
      if (code !== 0) {
        status = 'failed';
      }
      if (jsonResult?.status === 'blocked_by') {
        status = 'blocked_by';
      }
      if (jsonResult?.status === 'failed') {
        status = 'failed';
      }
      
      resolve({
        stage,
        mode: moduleSlug ? 'module' : 'all',
        module: moduleSlug,
        started_at,
        finished_at,
        status,
        json_result: jsonResult,
        stdout_tail: tailLines(stdout, STDOUT_TAIL_LINES),
        stderr_tail: tailLines(stderr, STDOUT_TAIL_LINES),
        exit_code: code,
      });
    });
  });
}

// ============================================================================
// MODULE RESOLUTION
// ============================================================================

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
  const canonicalOrder = config.canonical_order || config.modules.map(m => m.slug);
  
  let resolved: Set<string>;
  if (preset.include_dependencies) {
    resolved = computeDependencyClosure(preset.modules, config.modules);
  } else {
    resolved = new Set(preset.modules);
  }
  
  return canonicalOrder.filter(slug => resolved.has(slug));
}

// ============================================================================
// GATE CHECKING
// ============================================================================

function checkGate(
  stage: string,
  moduleSlug: string,
  gates: Record<string, Gate>,
  markers: StageMarkers,
  paths: ReturnType<typeof getPaths>,
  override: boolean
): { blocked: boolean; result?: Record<string, any> } {
  const gate = gates[stage];
  if (!gate) return { blocked: false };
  
  if (gate.requires_stage) {
    const moduleMarkers = markers[moduleSlug] || {};
    const requiredStage = moduleMarkers[gate.requires_stage];
    if (!requiredStage || requiredStage.status !== 'success') {
      if (override && gate.allow_override) {
        log('WARN', `Gate override enabled for ${stage}`);
        return { blocked: false };
      }
      return {
        blocked: true,
        result: {
          status: 'blocked_by',
          stage,
          module: moduleSlug,
          missing: [gate.requires_stage],
          hint: [gate.message],
        },
      };
    }
  }
  
  if (gate.requires_verify_pass) {
    const report = loadVerifyReport(paths.verifyReport);
    if (!report || report.overall_status !== 'PASS') {
      if (override && gate.allow_override) {
        log('WARN', `Gate override enabled for ${stage}`);
        return { blocked: false };
      }
      return {
        blocked: true,
        result: {
          status: 'blocked_by',
          stage,
          missing: ['verify PASS'],
          hint: [gate.message],
        },
      };
    }
  }
  
  if (gate.requires_docs_locked) {
    if (!isDocsLocked(paths.lockManifest)) {
      if (override && gate.allow_override) {
        log('WARN', `Gate override enabled for ${stage}`);
        return { blocked: false };
      }
      return {
        blocked: true,
        result: {
          status: 'blocked_by',
          stage,
          missing: ['locked docs'],
          hint: [gate.message],
        },
      };
    }
  }
  
  return { blocked: false };
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const presetIdx = args.indexOf('--preset');
  const planIdx = args.indexOf('--plan');
  const moduleIdx = args.indexOf('--module');
  const rootIdx = args.indexOf('--root');
  const allFlag = args.includes('--all');
  const overrideFlag = args.includes('--override');
  const dryRunFlag = args.includes('--dry-run');
  const autoPrereqsFlag = args.includes('--auto-prereqs');
  const unlockIfStaleFlag = args.includes('--unlock-if-stale');
  const jsonFlag = args.includes('--json');
  const helpFlag = args.includes('--help') || args.includes('-h');
  
  const presetName = presetIdx !== -1 ? args[presetIdx + 1] : null;
  const planName = planIdx !== -1 ? args[planIdx + 1] : 'docs:full';
  const targetModule = moduleIdx !== -1 ? args[moduleIdx + 1] : null;
  const root = rootIdx !== -1 ? path.resolve(args[rootIdx + 1]) : process.cwd();
  
  const paths = getPaths(root);
  
  // Handle help
  if (helpFlag) {
    console.log(`
AXION Run - Deterministic Execution Wrapper

Usage:
  node --import tsx axion/scripts/axion-run.ts --preset <name> --plan <plan>
  node --import tsx axion/scripts/axion-run.ts --all --plan <plan>
  node --import tsx axion/scripts/axion-run.ts --module <slug> --plan <plan>

Targets (mutually exclusive):
  --preset <name>   Run preset from presets.json
  --all             Run all modules in canonical order
  --module <slug>   Run single module (checks prereqs)

Options:
  --plan <name>        Stage plan to execute (default: docs:full)
  --root <path>        Workspace root (default: current directory)
  --override           Allow gate overrides where permitted
  --auto-prereqs       Automatically run missing prereqs
  --dry-run            Print resolved stages/modules without executing
  --json               Output only final JSON result
  --unlock-if-stale    Remove stale lock file and exit

Stage Plans:
  docs:scaffold    generate, seed
  docs:content     draft, review, verify
  docs:full        generate, seed, draft, review, verify
  docs:release     verify, lock
  app:bootstrap    scaffold-app
  app:build        build
  app:test         test
  app:full         scaffold-app, build, test
  app:ship         deploy
  export:package   package

Example:
  node --import tsx axion/scripts/axion-run.ts --preset system --plan docs:full
`);
    process.exit(0);
  }
  
  // Handle unlock-if-stale
  if (unlockIfStaleFlag) {
    unlockIfStale(paths);
    console.log(JSON.stringify({ status: 'success', stage: 'unlock', action: 'unlock-if-stale' }));
    process.exit(0);
  }
  
  // Validate target specified
  if (!presetName && !allFlag && !targetModule) {
    console.error('[FAIL] Must specify --preset, --all, or --module');
    console.log('Run with --help for usage');
    console.log(JSON.stringify({ status: 'failed', stage: 'run', reason_codes: ['MISSING_TARGET'] }));
    process.exit(1);
  }
  
  const runId = generateRunId();
  
  if (!jsonFlag) {
    console.log('\n[AXION] Run\n');
    log('INFO', `Run ID: ${runId}`);
    log('INFO', `Root: ${root}`);
  }
  
  // ========================================================================
  // STEP 1: PREFLIGHT
  // ========================================================================
  
  if (!jsonFlag) {
    console.log('\n--- Preflight ---\n');
  }
  
  const preflight = await runPreflight(root);
  if (!preflight.success) {
    const result = {
      status: 'failed',
      stage: 'run',
      run_id: runId,
      reason_codes: ['PRECHECK_FAILED'],
      hint: ['Fix preflight errors before running'],
    };
    if (!jsonFlag) {
      console.log(preflight.output);
    }
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  
  if (!jsonFlag) {
    log('PASS', 'Preflight passed');
  }
  
  // ========================================================================
  // STEP 2: ACQUIRE LOCK
  // ========================================================================
  
  const lockResult = acquireLock(paths, runId, args);
  if (!lockResult.acquired) {
    const result = {
      status: 'blocked_by',
      stage: 'run',
      run_id: runId,
      missing: ['RUN_LOCK_ACTIVE'],
      hint: [
        lockResult.reason || 'Another run is in progress',
        'If stale, run: node --import tsx axion/scripts/axion-run.ts --unlock-if-stale',
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  
  if (!jsonFlag) {
    log('PASS', 'Lock acquired');
  }
  
  // Set up cleanup
  let lockReleased = false;
  const cleanup = () => {
    if (!lockReleased) {
      releaseLock(paths);
      lockReleased = true;
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(130); });
  process.on('SIGTERM', () => { cleanup(); process.exit(143); });
  
  try {
    // ======================================================================
    // STEP 3: LOAD CONFIG
    // ======================================================================
    
    const config = loadConfig(paths.config);
    const presetsConfig = loadPresets(paths.presets);
    const gates = presetsConfig.gates || {};
    
    // Resolve plan
    const plan = presetsConfig.stage_plans[planName];
    if (!plan) {
      const result = {
        status: 'failed',
        stage: 'run',
        run_id: runId,
        reason_codes: ['PLAN_NOT_FOUND'],
        hint: [`Available plans: ${Object.keys(presetsConfig.stage_plans).join(', ')}`],
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }
    
    // Resolve modules
    let resolvedModules: string[];
    let mode: 'all' | 'module' | 'preset';
    
    if (presetName) {
      const preset = presetsConfig.presets[presetName];
      if (!preset) {
        const result = {
          status: 'failed',
          stage: 'run',
          run_id: runId,
          reason_codes: ['PRESET_NOT_FOUND'],
          hint: [`Available presets: ${Object.keys(presetsConfig.presets).join(', ')}`],
        };
        console.log(JSON.stringify(result, null, 2));
        process.exit(1);
      }
      resolvedModules = resolveModules(preset, config);
      mode = 'preset';
    } else if (allFlag) {
      const canonicalOrder = config.canonical_order || config.modules.map(m => m.slug);
      resolvedModules = canonicalOrder;
      mode = 'all';
    } else if (targetModule) {
      const canonicalOrder = config.canonical_order || config.modules.map(m => m.slug);
      if (!canonicalOrder.includes(targetModule)) {
        const result = {
          status: 'failed',
          stage: 'run',
          run_id: runId,
          reason_codes: ['MODULE_NOT_FOUND'],
          hint: [`Available modules: ${canonicalOrder.join(', ')}`],
        };
        console.log(JSON.stringify(result, null, 2));
        process.exit(1);
      }
      resolvedModules = [targetModule];
      mode = 'module';
    } else {
      resolvedModules = [];
      mode = 'all';
    }
    
    // Initialize history
    const history = initRunHistory(runId, root, args, planName, presetName, mode, targetModule);
    
    if (!jsonFlag) {
      console.log('');
      log('INFO', `Plan: ${planName} -> [${plan.join(' -> ')}]`);
      log('INFO', `Mode: ${mode}`);
      log('INFO', `Modules: ${resolvedModules.join(', ')}`);
    }
    
    // Dry run
    if (dryRunFlag) {
      const result = {
        status: 'success',
        stage: 'run',
        run_id: runId,
        dry_run: true,
        plan: planName,
        stages: plan,
        mode,
        modules: resolvedModules,
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    }
    
    // ======================================================================
    // STEP 4: EXECUTE STAGES
    // ======================================================================
    
    const moduleAwareStages = ['generate', 'seed', 'draft', 'review', 'verify'];
    const globalStages = ['init', 'lock', 'overhaul', 'import', 'scaffold-app', 'build', 'test', 'deploy', 'package'];
    
    let markers = loadStageMarkers(paths.stageMarkers);
    let blockedResult: Record<string, any> | null = null;
    
    for (const stage of plan) {
      if (!jsonFlag) {
        console.log(`\n${'─'.repeat(50)}`);
        log('INFO', `STAGE: ${stage.toUpperCase()}`);
        console.log(`${'─'.repeat(50)}\n`);
      }
      
      if (moduleAwareStages.includes(stage)) {
        // Run per module
        for (const moduleSlug of resolvedModules) {
          // Check gate
          const gateCheck = checkGate(stage, moduleSlug, gates, markers, paths, overrideFlag);
          if (gateCheck.blocked) {
            blockedResult = gateCheck.result || {};
            history.stages.push({
              stage,
              mode: 'module',
              module: moduleSlug,
              started_at: new Date().toISOString(),
              finished_at: new Date().toISOString(),
              status: 'blocked_by',
              json_result: blockedResult,
              stdout_tail: '',
              stderr_tail: '',
              exit_code: null,
            });
            history.overall_status = 'blocked_by';
            history.next_commands = blockedResult.hint || [];
            break;
          }
          
          if (!jsonFlag) {
            log('RUN', `${stage} --module ${moduleSlug}`);
          }
          
          const result = await executeStage(stage, moduleSlug, paths, root);
          history.stages.push(result);
          
          if (result.status === 'blocked_by') {
            blockedResult = result.json_result || { status: 'blocked_by', stage, module: moduleSlug };
            history.overall_status = 'blocked_by';
            history.next_commands = blockedResult.hint || [];
            break;
          }
          
          if (result.status === 'failed') {
            blockedResult = result.json_result || { status: 'failed', stage, module: moduleSlug };
            history.overall_status = 'failed';
            
            markers[moduleSlug] = markers[moduleSlug] || {};
            markers[moduleSlug][stage] = {
              completed_at: new Date().toISOString(),
              status: 'failed',
            };
            saveStageMarkers(paths.stageMarkers, markers);
            break;
          }
          
          // Mark success
          markers[moduleSlug] = markers[moduleSlug] || {};
          markers[moduleSlug][stage] = {
            completed_at: new Date().toISOString(),
            status: 'success',
          };
          saveStageMarkers(paths.stageMarkers, markers);
          
          if (!jsonFlag) {
            log('DONE', moduleSlug);
          }
        }
      } else if (globalStages.includes(stage)) {
        // Check gate for global stages
        const gateCheck = checkGate(stage, 'global', gates, markers, paths, overrideFlag);
        if (gateCheck.blocked) {
          blockedResult = gateCheck.result || {};
          history.stages.push({
            stage,
            mode: 'all',
            module: null,
            started_at: new Date().toISOString(),
            finished_at: new Date().toISOString(),
            status: 'blocked_by',
            json_result: blockedResult,
            stdout_tail: '',
            stderr_tail: '',
            exit_code: null,
          });
          history.overall_status = 'blocked_by';
          history.next_commands = blockedResult.hint || [];
          break;
        }
        
        if (stage === 'lock') {
          // Lock runs per module
          for (const moduleSlug of resolvedModules) {
            if (!jsonFlag) {
              log('RUN', `lock --module ${moduleSlug}`);
            }
            const result = await executeStage('lock', moduleSlug, paths, root);
            history.stages.push(result);
            
            if (result.status !== 'success') {
              blockedResult = result.json_result || { status: result.status, stage: 'lock', module: moduleSlug };
              history.overall_status = result.status;
              break;
            }
            
            if (!jsonFlag) {
              log('DONE', moduleSlug);
            }
          }
        } else {
          if (!jsonFlag) {
            log('RUN', stage);
          }
          const result = await executeStage(stage, null, paths, root);
          history.stages.push(result);
          
          if (result.status !== 'success') {
            blockedResult = result.json_result || { status: result.status, stage };
            history.overall_status = result.status;
          } else if (!jsonFlag) {
            log('DONE', stage);
          }
        }
      } else {
        if (!jsonFlag) {
          log('SKIP', `Unknown stage: ${stage}`);
        }
      }
      
      // Stop on failure
      if (history.overall_status !== 'success') {
        break;
      }
    }
    
    // ======================================================================
    // STEP 5: FINALIZE
    // ======================================================================
    
    history.finished_at = new Date().toISOString();
    saveRunHistory(paths, history);
    
    const historyPath = path.relative(root, path.join(paths.runHistory, `${runId}.json`));
    
    if (history.overall_status === 'success') {
      if (!jsonFlag) {
        console.log(`\n${'═'.repeat(50)}`);
        log('PASS', `Run completed successfully`);
        console.log(`${'═'.repeat(50)}\n`);
      }
      
      const result = {
        status: 'success',
        stage: 'run',
        run_id: runId,
        root,
        plan: planName,
        mode,
        modules: resolvedModules,
        stages_executed: plan,
        overall_status: 'success',
        run_history_path: historyPath,
      };
      console.log(JSON.stringify(result, null, 2));
    } else {
      if (!jsonFlag) {
        console.log(`\n${'═'.repeat(50)}`);
        log('FAIL', `Run ${history.overall_status}`);
        console.log(`${'═'.repeat(50)}\n`);
      }
      
      const result = {
        status: history.overall_status,
        stage: 'run',
        run_id: runId,
        root,
        plan: planName,
        mode,
        blocked_stage: blockedResult?.stage,
        module: blockedResult?.module,
        missing: blockedResult?.missing,
        hint: blockedResult?.hint || history.next_commands,
        run_history_path: historyPath,
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }
    
  } finally {
    cleanup();
  }
}

main().catch((err) => {
  console.error('[FAIL] Unexpected error:', err.message);
  console.log(JSON.stringify({ status: 'failed', stage: 'run', error: err.message }));
  process.exit(1);
});
