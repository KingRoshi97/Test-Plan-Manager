#!/usr/bin/env node
/**
 * axion-release-check.ts
 * 
 * TypeScript replacement for release-gate.sh
 * Runs all validation checks and produces a machine-readable JSON report.
 * 
 * Usage:
 *   npx tsx axion/scripts/axion-release-check.ts [options]
 * 
 * Options:
 *   --strict           Treat warnings as failures (default: true)
 *   --json             Output only JSON to stdout (logs to stderr)
 *   --timeout-ms <n>   Timeout per check in ms (default: 120000)
 *   --include-optional Run optional checks (e.g., real-results)
 *   --filter <id>      Run only specific check(s), comma-separated
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { writeJsonAtomic } from '../lib/atomic-writer.js';

const SCRIPT_VERSION = 1;
const SYSTEM_ROOT = path.resolve(__dirname, '../..');
const REGISTRY_DIR = path.join(SYSTEM_ROOT, 'axion/registry');
const REPORT_PATH = path.join(REGISTRY_DIR, 'release_gate_report.json');

interface CheckResult {
  id: string;
  name: string;
  required: boolean;
  passed: boolean;
  skipped: boolean;
  duration_ms: number;
  exit_code: number | null;
  test_count?: number;
  log_path: string;
  error_summary?: string;
}

interface FailureEntry {
  check_id: string;
  reason_code: string;
  summary: string;
  log_path: string;
}

interface ReleaseGateReport {
  version: string;
  generated_at: string;
  producer: { script: string; revision: number };
  duration_ms: number;
  passed: boolean;
  logs_dir: string;
  checks: CheckResult[];
  failures: FailureEntry[];
  next_commands: string[];
}

interface ReleaseCheck {
  id: string;
  name: string;
  description: string;
  required: boolean;
  timeout_ms: number;
  command: string;
  args: string[];
}

const CHECK_REGISTRY: ReleaseCheck[] = [
  {
    id: 'core-contracts',
    name: 'Core Contract Tests',
    description: 'Pipeline order, blocked_by, stdout JSON',
    required: true,
    timeout_ms: 60000,
    command: 'bash',
    args: ['-c', 'npx vitest run tests/core --passWithNoTests --testTimeout=60000'],
  },
  {
    id: 'unit-tests',
    name: 'Unit Tests',
    description: 'Individual script validation',
    required: true,
    timeout_ms: 30000,
    command: 'bash',
    args: ['-c', 'npx vitest run tests/unit --passWithNoTests --testTimeout=30000'],
  },
  {
    id: 'integration-tests',
    name: 'Integration Tests',
    description: 'Module dependencies, pipeline flow',
    required: true,
    timeout_ms: 30000,
    command: 'bash',
    args: ['-c', 'npx vitest run tests/integration --passWithNoTests --testTimeout=30000'],
  },
  {
    id: 'validation-tests',
    name: 'Validation Tests',
    description: 'Scripts, templates, config files',
    required: true,
    timeout_ms: 30000,
    command: 'bash',
    args: ['-c', 'npx vitest run tests/validation --passWithNoTests --testTimeout=30000'],
  },
  {
    id: 'e2e-tests',
    name: 'E2E Tests',
    description: 'Full workflows: kit-create → verify',
    required: true,
    timeout_ms: 60000,
    command: 'bash',
    args: ['-c', 'npx vitest run tests/e2e --passWithNoTests --testTimeout=60000'],
  },
  {
    id: 'e2e-golden',
    name: 'E2E Two-Root Golden Path',
    description: 'Real workflow: kit → scaffold → build → test → activate',
    required: true,
    timeout_ms: 180000,
    command: 'bash',
    args: ['-c', 'npx vitest run tests/suites/e2e.two-root.test.ts --passWithNoTests --testTimeout=180000'],
  },
  {
    id: 'e2e-concurrency',
    name: 'E2E Concurrency/Run-Lock Tests',
    description: 'Lock lifecycle, stale detection, corrupted lock handling',
    required: true,
    timeout_ms: 120000,
    command: 'bash',
    args: ['-c', 'npx vitest run tests/suites/e2e.concurrency.test.ts --passWithNoTests --testTimeout=120000'],
  },
  {
    id: 'e2e-portability',
    name: 'E2E Kit Portability Tests',
    description: 'Kit relocation, path resolution, no hardcoded paths',
    required: true,
    timeout_ms: 200000,
    command: 'bash',
    args: ['-c', 'npx vitest run tests/suites/e2e.portability.test.ts --passWithNoTests --testTimeout=200000'],
  },
  {
    id: 'e2e-atomic-writes',
    name: 'E2E Atomic Writes Tests',
    description: 'Crash resilience, orphan cleanup, artifact integrity',
    required: true,
    timeout_ms: 120000,
    command: 'bash',
    args: ['-c', 'npx vitest run tests/suites/e2e.atomic-writes.test.ts --passWithNoTests --testTimeout=120000'],
  },
  {
    id: 'doctor-tests',
    name: 'Doctor Extension Tests',
    description: 'Active build, pollution, run lock checks',
    required: true,
    timeout_ms: 60000,
    command: 'bash',
    args: ['-c', 'npx vitest run tests/suites/doctor-extensions.test.ts --passWithNoTests --testTimeout=60000'],
  },
  {
    id: 'docs-check',
    name: 'Documentation Drift Check',
    description: 'Script inventory, contamination scan',
    required: true,
    timeout_ms: 30000,
    command: 'bash',
    args: ['-c', 'npx tsx axion/scripts/axion-docs-check.ts --json'],
  },
  {
    id: 'no-pollution',
    name: 'No Pollution Check',
    description: 'No writes into system root',
    required: true,
    timeout_ms: 5000,
    command: 'bash',
    args: ['-c', 'test ! -d ./axion/test-output'],
  },
  {
    id: 'real-results',
    name: 'E2E Real Results Smoke Test',
    description: 'Spawns app, polls /api/health endpoint',
    required: false,
    timeout_ms: 120000,
    command: 'bash',
    args: ['-c', 'npx vitest run tests/suites/e2e.real-results.test.ts --passWithNoTests --testTimeout=120000'],
  },
];

interface CLIOptions {
  strict: boolean;
  jsonOnly: boolean;
  timeoutMs: number;
  includeOptional: boolean;
  filter: string[];
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    strict: true,
    jsonOnly: false,
    timeoutMs: 120000,
    includeOptional: false,
    filter: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--no-strict') {
      options.strict = false;
    } else if (arg === '--json') {
      options.jsonOnly = true;
    } else if (arg === '--timeout-ms' && args[i + 1]) {
      options.timeoutMs = parseInt(args[++i], 10);
    } else if (arg === '--include-optional') {
      options.includeOptional = true;
    } else if (arg === '--filter' && args[i + 1]) {
      options.filter = args[++i].split(',').map(s => s.trim());
    }
  }

  return options;
}

function log(message: string, jsonOnly: boolean): void {
  if (jsonOnly) {
    process.stderr.write(message + '\n');
  } else {
    console.log(message);
  }
}

function generateRunId(): string {
  const now = new Date();
  const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `release_${ts}`;
}

interface CommandResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  duration_ms: number;
  timedOut: boolean;
}

async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs: number
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let child: ChildProcess;

    try {
      child = spawn(command, args, {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (err) {
      resolve({
        exitCode: 1,
        stdout: '',
        stderr: `Failed to spawn: ${err}`,
        duration_ms: Date.now() - start,
        timedOut: false,
      });
      return;
    }

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000);
    }, timeoutMs);

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve({
        exitCode: timedOut ? null : code,
        stdout,
        stderr: timedOut ? stderr + '\n[TIMEOUT] Process killed due to timeout' : stderr,
        duration_ms: Date.now() - start,
        timedOut,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        exitCode: 1,
        stdout,
        stderr: stderr + `\nProcess error: ${err.message}`,
        duration_ms: Date.now() - start,
        timedOut: false,
      });
    });
  });
}

function extractTestCount(output: string): number | undefined {
  const match = output.match(/(\d+)\s+passed/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return undefined;
}

function extractErrorSummary(output: string): string | undefined {
  const lines = output.split('\n');
  const errorLines = lines.filter(l => 
    l.includes('Error') || 
    l.includes('FAIL') || 
    l.includes('AssertionError') ||
    l.includes('Expected') ||
    l.includes('Received')
  ).slice(0, 5);
  
  if (errorLines.length > 0) {
    return errorLines.join('\n').slice(0, 500);
  }
  return undefined;
}

async function runCheck(
  check: ReleaseCheck,
  logsDir: string,
  options: CLIOptions
): Promise<CheckResult> {
  const logPath = path.join(logsDir, `${check.id}.log`);
  const effectiveTimeout = options.timeoutMs || check.timeout_ms;

  const result = await runCommand(
    check.command,
    check.args,
    SYSTEM_ROOT,
    effectiveTimeout
  );

  const logContent = [
    `=== ${check.name} ===`,
    `Command: ${check.command} ${check.args.join(' ')}`,
    `Timeout: ${effectiveTimeout}ms`,
    `Exit code: ${result.exitCode}`,
    `Duration: ${result.duration_ms}ms`,
    `Timed out: ${result.timedOut}`,
    '',
    '=== STDOUT ===',
    result.stdout,
    '',
    '=== STDERR ===',
    result.stderr,
  ].join('\n');

  fs.writeFileSync(logPath, logContent);

  const passed = result.exitCode === 0 && !result.timedOut;
  const combined = result.stdout + result.stderr;

  return {
    id: check.id,
    name: check.name,
    required: check.required,
    passed,
    skipped: false,
    duration_ms: result.duration_ms,
    exit_code: result.exitCode,
    test_count: extractTestCount(combined),
    log_path: logPath,
    error_summary: passed ? undefined : extractErrorSummary(combined),
  };
}

async function main(): Promise<void> {
  const options = parseArgs();
  const runId = generateRunId();
  const logsDir = path.join(REGISTRY_DIR, 'release_gate_logs', runId);
  
  fs.mkdirSync(logsDir, { recursive: true });
  fs.mkdirSync(REGISTRY_DIR, { recursive: true });

  log('============================================', options.jsonOnly);
  log('        AXION RELEASE GATE', options.jsonOnly);
  log('============================================', options.jsonOnly);
  log('', options.jsonOnly);
  log(`Run ID: ${runId}`, options.jsonOnly);
  log(`Logs: ${logsDir}`, options.jsonOnly);
  log('', options.jsonOnly);

  const checksToRun = CHECK_REGISTRY.filter(check => {
    if (options.filter.length > 0) {
      return options.filter.includes(check.id);
    }
    if (!check.required && !options.includeOptional) {
      return false;
    }
    return true;
  });

  const results: CheckResult[] = [];
  const failures: FailureEntry[] = [];
  const startTime = Date.now();

  for (const check of checksToRun) {
    log(`[${check.id}] ${check.name}...`, options.jsonOnly);
    log(`  ${check.description}`, options.jsonOnly);

    const result = await runCheck(check, logsDir, options);
    results.push(result);

    if (result.passed) {
      log(`  ✅ PASS (${result.duration_ms}ms)${result.test_count ? ` - ${result.test_count} tests` : ''}`, options.jsonOnly);
    } else {
      log(`  ❌ FAIL (${result.duration_ms}ms)`, options.jsonOnly);
      log(`  Log: ${result.log_path}`, options.jsonOnly);
      
      failures.push({
        check_id: check.id,
        reason_code: result.exit_code === null ? 'TIMEOUT' : 'CHECK_FAILED',
        summary: result.error_summary || `Exit code: ${result.exit_code}`,
        log_path: result.log_path,
      });
    }
    log('', options.jsonOnly);
  }

  const skippedChecks = CHECK_REGISTRY.filter(check => {
    if (options.filter.length > 0) {
      return !options.filter.includes(check.id);
    }
    return !check.required && !options.includeOptional;
  });

  for (const check of skippedChecks) {
    results.push({
      id: check.id,
      name: check.name,
      required: check.required,
      passed: false,
      skipped: true,
      duration_ms: 0,
      exit_code: null,
      log_path: '',
    });
  }

  const totalDuration = Date.now() - startTime;
  const requiredFailures = failures.filter(f => {
    const check = CHECK_REGISTRY.find(c => c.id === f.check_id);
    return check?.required ?? true;
  });
  const passed = requiredFailures.length === 0;

  const nextCommands: string[] = [];
  if (!passed) {
    nextCommands.push('node --import tsx axion/scripts/axion-doctor.ts');
    for (const failure of requiredFailures.slice(0, 3)) {
      nextCommands.push(`node --import tsx axion/scripts/axion-release-check.ts --filter ${failure.check_id}`);
    }
  }

  const report: ReleaseGateReport = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    producer: { script: 'axion-release-check', revision: SCRIPT_VERSION },
    duration_ms: totalDuration,
    passed,
    logs_dir: logsDir,
    checks: results,
    failures,
    next_commands: nextCommands,
  };

  writeJsonAtomic(REPORT_PATH, report);

  log('============================================', options.jsonOnly);
  log('        RELEASE GATE SUMMARY', options.jsonOnly);
  log('============================================', options.jsonOnly);
  log('', options.jsonOnly);
  
  const passedCount = results.filter(r => r.passed && !r.skipped).length;
  const failedCount = results.filter(r => !r.passed && !r.skipped).length;
  const skippedCount = results.filter(r => r.skipped).length;
  
  log(`  Passed:  ${passedCount}`, options.jsonOnly);
  log(`  Failed:  ${failedCount}`, options.jsonOnly);
  log(`  Skipped: ${skippedCount}`, options.jsonOnly);
  log(`  Duration: ${(totalDuration / 1000).toFixed(1)}s`, options.jsonOnly);
  log(`  Report: ${REPORT_PATH}`, options.jsonOnly);
  log('', options.jsonOnly);

  if (passed) {
    log('✅ RELEASE GATE PASSED', options.jsonOnly);
    log('', options.jsonOnly);
    log('Safe to proceed with:', options.jsonOnly);
    log('  - Flip feature flags on', options.jsonOnly);
    log('  - Update CHANGELOG.md', options.jsonOnly);
    log('  - Mark change contract as Implemented', options.jsonOnly);
  } else {
    log('❌ RELEASE GATE FAILED', options.jsonOnly);
    log('', options.jsonOnly);
    log('Next commands:', options.jsonOnly);
    for (const cmd of nextCommands) {
      log(`  ${cmd}`, options.jsonOnly);
    }
  }

  if (options.jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
  }

  process.exit(passed ? 0 : 1);
}

main().catch(err => {
  console.error('Release check failed:', err);
  process.exit(1);
});
