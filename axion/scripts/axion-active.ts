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
 * 
 * Flags:
 *   --pointer <path>     Path to ACTIVE_BUILD.json (default: ./ACTIVE_BUILD.json)
 *   --json               Output only JSON (no human-readable text)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
}

function parseArgs(args: string[]): ActiveOptions {
  const options: ActiveOptions = {
    pointerPath: path.join(process.cwd(), 'ACTIVE_BUILD.json'),
    jsonOutput: false
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

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  const pointerPath = path.resolve(options.pointerPath);

  if (!fs.existsSync(pointerPath)) {
    if (options.jsonOutput) {
      const result: ActiveResult = {
        status: 'no_active_build',
        pointer_path: pointerPath,
        hint: [
          `No active build found at ${pointerPath}`,
          'Run axion-activate to set the active build'
        ]
      };
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('\n[AXION] Active Build Status\n');
      console.log('Status: No active build');
      console.log(`Pointer: ${pointerPath}`);
      console.log('\nRun axion-activate to set the active build.\n');
    }
    process.exit(1);
  }

  let pointer: ActiveBuildPointer;
  try {
    const content = fs.readFileSync(pointerPath, 'utf-8');
    pointer = JSON.parse(content);
  } catch (err) {
    if (options.jsonOutput) {
      const result: ActiveResult = {
        status: 'no_active_build',
        pointer_path: pointerPath,
        hint: ['Failed to parse ACTIVE_BUILD.json']
      };
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('\n[AXION] Active Build Status\n');
      console.log('Status: Error reading active build pointer');
      console.log(`Pointer: ${pointerPath}`);
    }
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

  if (options.jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
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

main();
