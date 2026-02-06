#!/usr/bin/env node
/**
 * AXION Iterate v1
 *
 * Deterministic orchestration wrapper that chains AXION primitives into a
 * "do the right next thing" sequence with explicit gates. No autonomy —
 * stops at gates and outputs deterministic next_commands.
 *
 * Step sequence:
 *   1. doctor       (build mode health check)
 *   2. reconcile    (import vs build drift detection)
 *   3. plan         (ensure build_plan.json exists)
 *   4. manifest     (fingerprint-gated manifest generation via build-exec --dry-run)
 *   5. apply        (gate: requires --allow-apply; runs build-exec --apply)
 *   6. test         (workspace tests via axion-test)
 *   7. activate     (activate build pointer via axion-activate)
 *
 * Safety:
 *   - Never applies changes without --allow-apply flag
 *   - Active non-stale run-lock stops iteration immediately
 *   - Fingerprint-based idempotency skips manifest regeneration when inputs unchanged
 *   - Atomic writes for iteration_state.json via tmp + rename
 *
 * Usage:
 *   npx tsx axion/scripts/axion-iterate.ts --build-root <path> --project-name <name> [--allow-apply] [--stop-after <step>] [--json] [--timeout-ms <n>]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';
import { writeJsonAtomic } from '../lib/atomic-writer.js';

type StepName = 'doctor' | 'reconcile' | 'plan' | 'manifest' | 'apply' | 'test' | 'activate';
type StepStatus = 'PASSED' | 'FAILED' | 'SKIPPED' | 'STOPPED';
type OverallStatus = 'completed' | 'stopped_at_gate' | 'error';

const STEP_ORDER: StepName[] = ['doctor', 'reconcile', 'plan', 'manifest', 'apply', 'test', 'activate'];
const RUN_LOCK_STALE_THRESHOLD_MINUTES = 30;

interface IterateOptions {
  buildRoot: string;
  projectName: string;
  allowApply: boolean;
  stopAfter: StepName | null;
  jsonOutput: boolean;
  timeoutMs: number;
}

interface StepRecord {
  name: StepName;
  status: StepStatus;
  duration_ms: number;
  output_ref: string | null;
  reason_codes: string[];
  summary: Record<string, unknown> | null;
  next_commands: string[];
}

interface Fingerprints {
  build_plan_hash: string | null;
  stack_profile_hash: string | null;
  lock_manifest_hash: string | null;
  last_manifest_hash: string | null;
}

interface IterationState {
  version: string;
  generated_at: string;
  producer: { script: string; revision: number };
  build_root: string;
  project_name: string;
  workspace_root: string;
  overall_status: OverallStatus;
  stopped_at: { step: StepName; reason: string } | null;
  steps_executed: StepRecord[];
  fingerprints: Fingerprints;
  last_manifest_path: string | null;
  last_manifest_hash: string | null;
  reports: Record<string, string | null>;
  next_commands: string[];
}

interface IterateResult {
  status: 'success' | 'stopped_at_gate' | 'failed';
  stage: 'iterate';
  iteration_state_path: string;
  overall_status: OverallStatus;
  stopped_at: { step: StepName; reason: string } | null;
  steps_count: number;
  next_commands: string[];
}

function parseArgs(args: string[]): IterateOptions {
  const options: IterateOptions = {
    buildRoot: '',
    projectName: '',
    allowApply: false,
    stopAfter: null,
    jsonOutput: false,
    timeoutMs: 120000,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--build-root':
        options.buildRoot = args[++i] || '';
        break;
      case '--project-name':
        options.projectName = args[++i] || '';
        break;
      case '--allow-apply':
        options.allowApply = true;
        break;
      case '--stop-after': {
        const val = args[++i] as StepName;
        if (STEP_ORDER.includes(val)) {
          options.stopAfter = val;
        }
        break;
      }
      case '--json':
        options.jsonOutput = true;
        break;
      case '--timeout-ms':
        options.timeoutMs = parseInt(args[++i], 10) || 120000;
        break;
    }
  }

  return options;
}

function log(msg: string, jsonOutput: boolean): void {
  if (!jsonOutput) {
    console.error(msg);
  }
}

function sha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
}

function sha256File(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  return sha256(content);
}

function parseJsonFromOutput(stdout: string): any {
  try {
    return JSON.parse(stdout.trim());
  } catch {
    const lines = stdout.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{')) {
        try {
          let jsonStr = '';
          for (let j = i; j < lines.length; j++) {
            jsonStr += lines[j] + '\n';
          }
          return JSON.parse(jsonStr.trim());
        } catch {
          continue;
        }
      }
    }
  }
  return null;
}

function runSubprocess(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
): { stdout: string; json: any; exitCode: number } {
  const fullCmd = `npx tsx ${command} ${args.join(' ')}`;
  try {
    const stdout = execSync(fullCmd, {
      cwd,
      encoding: 'utf-8',
      timeout: timeoutMs,
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, json: parseJsonFromOutput(stdout), exitCode: 0 };
  } catch (err: any) {
    const stdout = (err.stdout || '') + (err.stderr || '');
    return { stdout, json: parseJsonFromOutput(stdout), exitCode: err.status || 1 };
  }
}

function loadPreviousState(statePath: string): IterationState | null {
  if (!fs.existsSync(statePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  } catch {
    return null;
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  log('\n[AXION] Iterate v1\n', options.jsonOutput);

  if (!options.buildRoot) {
    const result: IterateResult = {
      status: 'failed',
      stage: 'iterate',
      iteration_state_path: '',
      overall_status: 'error',
      stopped_at: null,
      steps_count: 0,
      next_commands: [],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  if (!options.projectName) {
    const result: IterateResult = {
      status: 'failed',
      stage: 'iterate',
      iteration_state_path: '',
      overall_status: 'error',
      stopped_at: null,
      steps_count: 0,
      next_commands: [],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const buildRoot = path.resolve(options.buildRoot);
  const projectName = options.projectName;
  const workspaceRoot = path.join(buildRoot, projectName);
  const registryDir = path.join(workspaceRoot, 'registry');
  const iterationStatePath = path.join(registryDir, 'iteration_state.json');
  const planPath = path.join(registryDir, 'build_plan.json');
  const stackPath = path.join(registryDir, 'stack_profile.json');
  const lockManifestPath = path.join(registryDir, 'lock_manifest.json');
  const runLockPath = path.join(registryDir, 'run_lock.json');
  const manifestPath = path.join(registryDir, 'build_exec_manifest.json');

  const projectRoot = path.resolve(__dirname, '../..');

  log(`[INFO] Build root: ${buildRoot}`, options.jsonOutput);
  log(`[INFO] Project name: ${projectName}`, options.jsonOutput);
  log(`[INFO] Workspace: ${workspaceRoot}`, options.jsonOutput);
  log(`[INFO] Allow apply: ${options.allowApply}`, options.jsonOutput);
  if (options.stopAfter) {
    log(`[INFO] Stop after: ${options.stopAfter}`, options.jsonOutput);
  }

  if (!fs.existsSync(registryDir)) {
    fs.mkdirSync(registryDir, { recursive: true });
  }

  const stepsExecuted: StepRecord[] = [];
  let overallStatus: OverallStatus = 'completed';
  let stoppedAt: { step: StepName; reason: string } | null = null;
  let finalNextCommands: string[] = [];

  const fingerprints: Fingerprints = {
    build_plan_hash: null,
    stack_profile_hash: null,
    lock_manifest_hash: null,
    last_manifest_hash: null,
  };

  const reports: Record<string, string | null> = {
    doctor: null,
    reconcile: null,
    manifest: null,
    exec_report: null,
    test: null,
    activate: null,
  };

  let lastManifestPath: string | null = null;
  let lastManifestHash: string | null = null;

  // ─────────────────────────────────────────────────────────────────────────
  // Pre-step gate: Run-lock check
  // ─────────────────────────────────────────────────────────────────────────
  if (fs.existsSync(runLockPath)) {
    try {
      const lockData = JSON.parse(fs.readFileSync(runLockPath, 'utf-8'));
      const lockTimestamp = lockData.acquired_at || lockData.timestamp || lockData.created_at;
      let isStale = false;

      if (lockTimestamp) {
        const lockTime = new Date(lockTimestamp).getTime();
        const ageMinutes = Math.floor((Date.now() - lockTime) / 60000);
        isStale = ageMinutes > RUN_LOCK_STALE_THRESHOLD_MINUTES;
      }

      if (!isStale) {
        log('[BLOCKED] Active run lock detected — cannot iterate', options.jsonOutput);
        overallStatus = 'stopped_at_gate';
        stoppedAt = { step: 'doctor', reason: 'RUN_LOCK_ACTIVE' };
        finalNextCommands = [
          `rm ${runLockPath}`,
        ];

        writeState(
          iterationStatePath, buildRoot, projectName, workspaceRoot,
          overallStatus, stoppedAt, stepsExecuted, fingerprints,
          lastManifestPath, lastManifestHash, reports, finalNextCommands,
        );

        const result: IterateResult = {
          status: 'stopped_at_gate',
          stage: 'iterate',
          iteration_state_path: iterationStatePath,
          overall_status: overallStatus,
          stopped_at: stoppedAt,
          steps_count: 0,
          next_commands: finalNextCommands,
        };
        console.log(JSON.stringify(result, null, 2));
        process.exit(1);
      } else {
        log('[WARN] Stale run lock detected — continuing (doctor will also report)', options.jsonOutput);
      }
    } catch {
      log('[WARN] Could not parse run_lock.json — continuing', options.jsonOutput);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step execution loop
  // ─────────────────────────────────────────────────────────────────────────
  const stepFns: Record<StepName, () => StepRecord> = {
    doctor: () => runDoctor(buildRoot, projectRoot, options),
    reconcile: () => runReconcile(buildRoot, projectName, projectRoot, registryDir, options),
    plan: () => checkPlan(planPath, buildRoot, projectName, options),
    manifest: () => runManifest(
      planPath, stackPath, lockManifestPath, manifestPath,
      iterationStatePath, buildRoot, projectName, projectRoot,
      fingerprints, options,
    ),
    apply: () => runApply(manifestPath, buildRoot, projectName, projectRoot, registryDir, options),
    test: () => runTest(buildRoot, projectName, projectRoot, registryDir, options),
    activate: () => runActivate(buildRoot, projectName, projectRoot, options),
  };

  for (const stepName of STEP_ORDER) {
    log(`\n[STEP] ${stepName}`, options.jsonOutput);
    const startTime = Date.now();

    const record = stepFns[stepName]();
    stepsExecuted.push(record);

    log(`  [${record.status}] ${stepName} (${record.duration_ms}ms)`, options.jsonOutput);

    if (record.output_ref) {
      const reportKey = stepName === 'manifest' ? 'manifest' : stepName;
      reports[reportKey] = record.output_ref;
    }

    if (record.status === 'FAILED' || record.status === 'STOPPED') {
      overallStatus = record.status === 'FAILED' ? 'error' : 'stopped_at_gate';
      stoppedAt = {
        step: stepName,
        reason: record.reason_codes[0] || record.status,
      };
      finalNextCommands = record.next_commands;
      break;
    }

    if (options.stopAfter === stepName) {
      overallStatus = 'stopped_at_gate';
      stoppedAt = { step: stepName, reason: 'STOP_AFTER_REQUESTED' };
      break;
    }
  }

  // Collect final fingerprints
  fingerprints.build_plan_hash = sha256File(planPath);
  fingerprints.stack_profile_hash = sha256File(stackPath);
  fingerprints.lock_manifest_hash = sha256File(lockManifestPath);
  if (fs.existsSync(manifestPath)) {
    lastManifestPath = manifestPath;
    lastManifestHash = sha256File(manifestPath);
    fingerprints.last_manifest_hash = lastManifestHash;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Write iteration_state.json + final stdout
  // ─────────────────────────────────────────────────────────────────────────
  writeState(
    iterationStatePath, buildRoot, projectName, workspaceRoot,
    overallStatus, stoppedAt, stepsExecuted, fingerprints,
    lastManifestPath, lastManifestHash, reports, finalNextCommands,
  );

  log(`\n[INFO] Iteration state written to: ${iterationStatePath}`, options.jsonOutput);

  const resultStatus = overallStatus === 'completed'
    ? 'success'
    : overallStatus === 'stopped_at_gate'
      ? 'stopped_at_gate'
      : 'failed';

  const result: IterateResult = {
    status: resultStatus,
    stage: 'iterate',
    iteration_state_path: iterationStatePath,
    overall_status: overallStatus,
    stopped_at: stoppedAt,
    steps_count: stepsExecuted.length,
    next_commands: finalNextCommands,
  };

  console.log(JSON.stringify(result, null, 2));

  if (overallStatus !== 'completed') {
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// State writer
// ─────────────────────────────────────────────────────────────────────────────

function writeState(
  statePath: string,
  buildRoot: string,
  projectName: string,
  workspaceRoot: string,
  overallStatus: OverallStatus,
  stoppedAt: { step: StepName; reason: string } | null,
  stepsExecuted: StepRecord[],
  fingerprints: Fingerprints,
  lastManifestPath: string | null,
  lastManifestHash: string | null,
  reports: Record<string, string | null>,
  nextCommands: string[],
): void {
  const state: IterationState = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    producer: { script: 'axion-iterate', revision: 1 },
    build_root: buildRoot,
    project_name: projectName,
    workspace_root: workspaceRoot,
    overall_status: overallStatus,
    stopped_at: stoppedAt,
    steps_executed: stepsExecuted,
    fingerprints,
    last_manifest_path: lastManifestPath,
    last_manifest_hash: lastManifestHash,
    reports,
    next_commands: nextCommands,
  };

  const dir = path.dirname(statePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  writeJsonAtomic(statePath, state);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step: doctor
// ─────────────────────────────────────────────────────────────────────────────

function runDoctor(
  buildRoot: string,
  projectRoot: string,
  options: IterateOptions,
): StepRecord {
  const start = Date.now();
  const scriptPath = path.join(projectRoot, 'axion/scripts/axion-doctor.ts');
  const cmdArgs = ['--root', buildRoot, '--json'];

  const { json, exitCode } = runSubprocess(scriptPath, cmdArgs, projectRoot, options.timeoutMs);

  const record: StepRecord = {
    name: 'doctor',
    status: 'PASSED',
    duration_ms: Date.now() - start,
    output_ref: null,
    reason_codes: [],
    summary: null,
    next_commands: [],
  };

  if (json) {
    record.summary = {
      status: json.status,
      mode: json.mode,
      pass: json.summary?.pass,
      warn: json.summary?.warn,
      fail: json.summary?.fail,
    };
    if (json.run_lock) {
      record.summary.run_lock = json.run_lock;
    }
  }

  if (!json || json.status === 'failed' || exitCode !== 0) {
    record.status = 'FAILED';
    record.reason_codes = json?.failures?.map((f: any) => f.id) || ['DOCTOR_FAILED'];
    record.next_commands = json?.next_commands || [];
  }

  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step: reconcile
// ─────────────────────────────────────────────────────────────────────────────

function runReconcile(
  buildRoot: string,
  projectName: string,
  projectRoot: string,
  registryDir: string,
  options: IterateOptions,
): StepRecord {
  const start = Date.now();
  const scriptPath = path.join(projectRoot, 'axion/scripts/axion-reconcile.ts');
  const cmdArgs = ['--build-root', buildRoot, '--project-name', projectName, '--json'];

  const { json, exitCode } = runSubprocess(scriptPath, cmdArgs, projectRoot, options.timeoutMs);

  const reportPath = path.join(registryDir, 'reconcile_report.json');

  const record: StepRecord = {
    name: 'reconcile',
    status: 'PASSED',
    duration_ms: Date.now() - start,
    output_ref: fs.existsSync(reportPath) ? reportPath : null,
    reason_codes: [],
    summary: null,
    next_commands: [],
  };

  if (json?.status === 'blocked_by') {
    record.status = 'STOPPED';
    record.reason_codes = json.reason_codes || ['RECONCILE_BLOCKED'];
    record.next_commands = json.hint || [];
    record.summary = { status: 'blocked_by', reason_codes: json.reason_codes };
    return record;
  }

  if (json) {
    record.summary = {
      status: json.status,
      mismatches: json.summary?.mismatches,
      critical: json.summary?.critical,
      warning: json.summary?.warning,
      info: json.summary?.info,
    };
  }

  if (fs.existsSync(reportPath)) {
    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      if (report.status === 'FAIL' || (report.summary?.critical > 0)) {
        record.status = 'STOPPED';
        record.reason_codes = ['RECONCILE_CRITICAL_MISMATCHES'];
        record.next_commands = report.next_commands || [];
        record.summary = {
          status: 'FAIL',
          mismatches: report.summary?.mismatches,
          critical: report.summary?.critical,
          warning: report.summary?.warning,
          info: report.summary?.info,
        };
        return record;
      }
    } catch { /* report unreadable, rely on stdout */ }
  }

  if (exitCode !== 0 && record.status === 'PASSED') {
    record.status = 'FAILED';
    record.reason_codes = ['RECONCILE_FAILED'];
  }

  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step: plan existence
// ─────────────────────────────────────────────────────────────────────────────

function checkPlan(
  planPath: string,
  buildRoot: string,
  projectName: string,
  options: IterateOptions,
): StepRecord {
  const start = Date.now();

  const record: StepRecord = {
    name: 'plan',
    status: 'PASSED',
    duration_ms: 0,
    output_ref: null,
    reason_codes: [],
    summary: null,
    next_commands: [],
  };

  if (!fs.existsSync(planPath)) {
    record.status = 'STOPPED';
    record.reason_codes = ['MISSING_BUILD_PLAN'];
    record.next_commands = [
      `npx tsx axion/scripts/axion-build-plan.ts --build-root ${buildRoot} --project-name ${projectName}`,
    ];
    record.duration_ms = Date.now() - start;
    return record;
  }

  try {
    const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));
    record.summary = {
      total_tasks: plan.total_tasks || plan.tasks?.length || 0,
      phases: plan.phases?.length || 0,
    };
    record.output_ref = planPath;
  } catch {
    record.status = 'STOPPED';
    record.reason_codes = ['INVALID_BUILD_PLAN'];
    record.next_commands = [
      `npx tsx axion/scripts/axion-build-plan.ts --build-root ${buildRoot} --project-name ${projectName}`,
    ];
  }

  record.duration_ms = Date.now() - start;
  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step: manifest (fingerprint-gated)
// ─────────────────────────────────────────────────────────────────────────────

function runManifest(
  planPath: string,
  stackPath: string,
  lockManifestPath: string,
  manifestPath: string,
  iterationStatePath: string,
  buildRoot: string,
  projectName: string,
  projectRoot: string,
  fingerprints: Fingerprints,
  options: IterateOptions,
): StepRecord {
  const start = Date.now();

  const record: StepRecord = {
    name: 'manifest',
    status: 'PASSED',
    duration_ms: 0,
    output_ref: null,
    reason_codes: [],
    summary: null,
    next_commands: [],
  };

  const currentPlanHash = sha256File(planPath);
  const currentStackHash = sha256File(stackPath);
  const currentLockHash = sha256File(lockManifestPath);

  fingerprints.build_plan_hash = currentPlanHash;
  fingerprints.stack_profile_hash = currentStackHash;
  fingerprints.lock_manifest_hash = currentLockHash;

  const previousState = loadPreviousState(iterationStatePath);
  const prevFingerprints = previousState?.fingerprints;

  const fingerprintsMatch = prevFingerprints
    && prevFingerprints.build_plan_hash === currentPlanHash
    && prevFingerprints.stack_profile_hash === currentStackHash
    && prevFingerprints.lock_manifest_hash === currentLockHash
    && previousState?.last_manifest_path
    && fs.existsSync(previousState.last_manifest_path);

  if (fingerprintsMatch) {
    record.status = 'SKIPPED';
    record.reason_codes = ['FINGERPRINT_MATCH'];
    record.output_ref = previousState!.last_manifest_path!;
    record.summary = { skipped: true, reason: 'fingerprints match previous run' };
    fingerprints.last_manifest_hash = previousState!.last_manifest_hash;
    record.duration_ms = Date.now() - start;
    return record;
  }

  const scriptPath = path.join(projectRoot, 'axion/scripts/axion-build-exec.ts');
  const cmdArgs = ['--dry-run', '--build-root', buildRoot, '--project-name', projectName, '--json'];

  const { stdout, json, exitCode } = runSubprocess(scriptPath, cmdArgs, projectRoot, options.timeoutMs);

  if (exitCode !== 0 || !json || json.status === 'failed' || json.status === 'blocked_by') {
    record.status = json?.status === 'blocked_by' ? 'STOPPED' : 'FAILED';
    record.reason_codes = json?.reason_codes || ['MANIFEST_GENERATION_FAILED'];
    record.next_commands = json?.hint || [];
    record.summary = { status: json?.status || 'failed' };
    record.duration_ms = Date.now() - start;
    return record;
  }

  // build-exec --dry-run emits manifest to stdout; iterate owns persistence
  const manifestData = json;
  const manifestDir = path.dirname(manifestPath);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }
  writeJsonAtomic(manifestPath, manifestData);

  const manifestHash = sha256File(manifestPath);
  fingerprints.last_manifest_hash = manifestHash;

  record.output_ref = manifestPath;
  record.summary = {
    ops_count: manifestData.ops?.length || 0,
    manifest_hash: manifestHash,
  };
  record.duration_ms = Date.now() - start;
  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step: apply gate
// ─────────────────────────────────────────────────────────────────────────────

function runApply(
  manifestPath: string,
  buildRoot: string,
  projectName: string,
  projectRoot: string,
  registryDir: string,
  options: IterateOptions,
): StepRecord {
  const start = Date.now();

  const record: StepRecord = {
    name: 'apply',
    status: 'PASSED',
    duration_ms: 0,
    output_ref: null,
    reason_codes: [],
    summary: null,
    next_commands: [],
  };

  if (!options.allowApply) {
    record.status = 'STOPPED';
    record.reason_codes = ['READY_TO_APPLY'];
    record.next_commands = [
      `npx tsx axion/scripts/axion-iterate.ts --build-root ${buildRoot} --project-name ${projectName} --allow-apply`,
    ];
    record.summary = { gate: 'apply', allowed: false };
    record.duration_ms = Date.now() - start;
    return record;
  }

  if (!fs.existsSync(manifestPath)) {
    record.status = 'FAILED';
    record.reason_codes = ['MANIFEST_NOT_FOUND'];
    record.next_commands = [
      `npx tsx axion/scripts/axion-build-exec.ts --dry-run --build-root ${buildRoot} --project-name ${projectName}`,
    ];
    record.duration_ms = Date.now() - start;
    return record;
  }

  const scriptPath = path.join(projectRoot, 'axion/scripts/axion-build-exec.ts');
  const cmdArgs = [
    '--apply', '--manifest', manifestPath,
    '--build-root', buildRoot, '--project-name', projectName, '--json',
  ];

  const { json, exitCode } = runSubprocess(scriptPath, cmdArgs, projectRoot, options.timeoutMs);

  const execReportPath = path.join(registryDir, 'build_exec_report.json');

  if (exitCode !== 0 || !json || json.status === 'failed') {
    record.status = 'FAILED';
    record.reason_codes = json?.reason_codes || ['APPLY_FAILED'];
    record.next_commands = json?.hint || [];
    record.output_ref = fs.existsSync(execReportPath) ? execReportPath : null;
    record.summary = json?.summary || null;
  } else {
    record.output_ref = fs.existsSync(execReportPath) ? execReportPath : (json.report_path || null);
    record.summary = json.summary || null;
  }

  record.duration_ms = Date.now() - start;
  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step: test
// ─────────────────────────────────────────────────────────────────────────────

function runTest(
  buildRoot: string,
  projectName: string,
  projectRoot: string,
  registryDir: string,
  options: IterateOptions,
): StepRecord {
  const start = Date.now();
  const scriptPath = path.join(projectRoot, 'axion/scripts/axion-test.ts');
  const cmdArgs = ['--build-root', buildRoot, '--project-name', projectName, '--json'];

  const { json, exitCode } = runSubprocess(scriptPath, cmdArgs, projectRoot, options.timeoutMs);

  const testReportPath = path.join(registryDir, 'test_report.json');

  const record: StepRecord = {
    name: 'test',
    status: 'PASSED',
    duration_ms: Date.now() - start,
    output_ref: fs.existsSync(testReportPath) ? testReportPath : null,
    reason_codes: [],
    summary: null,
    next_commands: [],
  };

  if (json) {
    record.summary = {
      status: json.status,
      tests_passed: json.tests_passed,
      tests_failed: json.tests_failed,
    };
  }

  if (!json || json.status === 'failed' || exitCode !== 0) {
    record.status = 'FAILED';
    record.reason_codes = ['TESTS_FAILED'];
    record.next_commands = json?.hint || ['Fix failing tests and re-run'];
  }

  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step: activate
// ─────────────────────────────────────────────────────────────────────────────

function runActivate(
  buildRoot: string,
  projectName: string,
  projectRoot: string,
  options: IterateOptions,
): StepRecord {
  const start = Date.now();
  const scriptPath = path.join(projectRoot, 'axion/scripts/axion-activate.ts');
  const cmdArgs = ['--build-root', buildRoot, '--project-name', projectName, '--json'];

  const { json, exitCode } = runSubprocess(scriptPath, cmdArgs, projectRoot, options.timeoutMs);

  const pointerPath = path.join(buildRoot, 'ACTIVE_BUILD.json');

  const record: StepRecord = {
    name: 'activate',
    status: 'PASSED',
    duration_ms: Date.now() - start,
    output_ref: fs.existsSync(pointerPath) ? pointerPath : null,
    reason_codes: [],
    summary: null,
    next_commands: [],
  };

  if (json) {
    record.summary = {
      status: json.status,
      pointer_path: json.pointer_path,
      gates_passed: json.gates_passed,
      gates_failed: json.gates_failed,
    };
  }

  if (json?.status === 'blocked_by') {
    record.status = 'STOPPED';
    record.reason_codes = json.reason_codes || ['ACTIVATE_BLOCKED'];
    record.next_commands = json.hint || [];
  } else if (!json || json.status === 'failed' || exitCode !== 0) {
    record.status = 'FAILED';
    record.reason_codes = json?.reason_codes || ['ACTIVATE_FAILED'];
    record.next_commands = json?.hint || [];
  }

  return record;
}

main();
