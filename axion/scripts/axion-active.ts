#!/usr/bin/env node
/**
 * AXION Active (Read-Only Status)
 * 
 * Prints information about the currently active build.
 * Read-only command - makes no changes.
 * 
 * Output includes:
 * - Active build root
 * - Project name
 * - Activation timestamp
 * - Gates that were satisfied
 * - App path
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-active.ts
 *   node --import tsx axion/scripts/axion-active.ts --pointer ./ACTIVE_BUILD.json
 *   node --import tsx axion/scripts/axion-active.ts --json
 *   node --import tsx axion/scripts/axion-active.ts --dry-run
 * 
 * Flags:
 *   --pointer <path>     Path to ACTIVE_BUILD.json (default: ./ACTIVE_BUILD.json)
 *   --json               Output only JSON (no human-readable text)
 *   --dry-run            Preview what would be reported without side-effects
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startTime = Date.now();
const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');

const receipt = {
  stage: 'active',
  ok: true,
  modulesProcessed: [] as string[],
  createdFiles: [] as string[],
  modifiedFiles: [] as string[],
  skippedFiles: [] as string[],
  warnings: [] as string[],
  errors: [] as string[],
  elapsedMs: 0,
  dryRun,
};

interface ActiveBuildPointer {
  active_build_root: string;
  project_name: string;
  app_path: string;
  activated_at: string;
  activated_by: string;
  docs_locked: boolean;
  verify_passed: boolean;
  tests_passed: boolean | null;
}

interface ActiveResult {
  status: 'success' | 'no_active_build';
  active_build_root?: string;
  project_name?: string;
  app_path?: string;
  activated_at?: string;
  activated_by?: string;
  gates_satisfied?: {
    docs_locked: boolean;
    verify_passed: boolean;
    tests_passed: boolean | null;
  };
  pointer_path?: string;
  hint?: string[];
}

interface ActiveOptions {
  pointerPath: string;
  jsonOutput: boolean;
  dryRun: boolean;
}

function parseArgs(args: string[]): ActiveOptions {
  const options: ActiveOptions = {
    pointerPath: path.join(process.cwd(), 'ACTIVE_BUILD.json'),
    jsonOutput: false,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--pointer':
        options.pointerPath = args[++i] || options.pointerPath;
        break;
      case '--json':
        options.jsonOutput = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
    }
  }

  return options;
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch {
    return isoString;
  }
}

function formatTimeSince(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays > 0) return `${diffDays} day(s) ago`;
    if (diffHours > 0) return `${diffHours} hour(s) ago`;
    if (diffMins > 0) return `${diffMins} minute(s) ago`;
    return 'just now';
  } catch {
    return '';
  }
}

function emitOutput(result?: ActiveResult, pointer?: ActiveBuildPointer, pointerPath?: string) {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify({ ...receipt, result }, null, 2) + '\n');
    return;
  }
  if (!result || !pointerPath) return;

  if (result.status === 'no_active_build') {
    console.log('\n[AXION] Active Build Status\n');
    console.log('Status: No active build');
    console.log(`Pointer: ${pointerPath}`);
    if (result.hint) {
      console.log(`\n${result.hint.join('\n')}\n`);
    }
    return;
  }

  if (pointer) {
    console.log('\n[AXION] Active Build Status\n');
    console.log('═'.repeat(50));
    console.log(`Project:     ${pointer.project_name}`);
    console.log(`Build Root:  ${pointer.active_build_root}`);
    console.log(`App Path:    ${pointer.app_path}`);
    console.log('─'.repeat(50));
    console.log(`Activated:   ${formatDate(pointer.activated_at)} (${formatTimeSince(pointer.activated_at)})`);
    console.log(`Activated By: ${pointer.activated_by}`);
    console.log('─'.repeat(50));
    console.log('Gates Satisfied:');
    console.log(`  • Docs Locked:    ${pointer.docs_locked ? '✓ Yes' : '✗ No'}`);
    console.log(`  • Verify Passed:  ${pointer.verify_passed ? '✓ Yes' : '✗ No'}`);
    console.log(`  • Tests Passed:   ${pointer.tests_passed === null ? '○ Not run' : pointer.tests_passed ? '✓ Yes' : '✗ No'}`);
    console.log('═'.repeat(50));
    console.log(`\nPointer: ${pointerPath}\n`);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  const pointerPath = path.resolve(options.pointerPath);

  if (!fs.existsSync(pointerPath)) {
    const result: ActiveResult = {
      status: 'no_active_build',
      pointer_path: pointerPath,
      hint: [
        `No active build found at ${pointerPath}`,
        'Run axion-activate to set the active build'
      ]
    };
    receipt.ok = false;
    receipt.warnings.push(`No active build found at ${pointerPath}`);
    emitOutput(result, undefined, pointerPath);
    process.exit(1);
  }

  let pointer: ActiveBuildPointer;
  try {
    const content = fs.readFileSync(pointerPath, 'utf-8');
    pointer = JSON.parse(content);
  } catch (err) {
    const result: ActiveResult = {
      status: 'no_active_build',
      pointer_path: pointerPath,
      hint: ['Failed to parse ACTIVE_BUILD.json']
    };
    receipt.ok = false;
    receipt.errors.push(`Failed to parse ACTIVE_BUILD.json at ${pointerPath}`);
    emitOutput(result, undefined, pointerPath);
    process.exit(1);
  }

  const result: ActiveResult = {
    status: 'success',
    active_build_root: pointer.active_build_root,
    project_name: pointer.project_name,
    app_path: pointer.app_path,
    activated_at: pointer.activated_at,
    activated_by: pointer.activated_by,
    gates_satisfied: {
      docs_locked: pointer.docs_locked,
      verify_passed: pointer.verify_passed,
      tests_passed: pointer.tests_passed
    },
    pointer_path: pointerPath
  };

  emitOutput(result, pointer, pointerPath);
}

try {
  main();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  receipt.ok = false;
  receipt.errors.push(message);
  emitOutput();
  process.exit(1);
}
