#!/usr/bin/env node
/**
 * AXION Run App
 * 
 * Starts the app from the active build. Reads ACTIVE_BUILD.json to determine
 * which build root to use, then starts the app from that build's app directory.
 * 
 * Gate: Refuses if no ACTIVE_BUILD.json exists.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-run-app.ts
 *   node --import tsx axion/scripts/axion-run-app.ts --pointer ./kits/ACTIVE_BUILD.json
 * 
 * Flags:
 *   --pointer <path>          Path to ACTIVE_BUILD.json (default: ./ACTIVE_BUILD.json)
 *   --install                 Run npm install before starting
 *   --dry-run                 Show what would be done without starting
 *   --json                    Output only JSON
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startTime = Date.now();

const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');

interface RunAppResult {
  status: 'success' | 'failed' | 'blocked_by';
  stage: 'run-app';
  pointer_path?: string;
  active_build_root?: string;
  resolved_app_path?: string;
  app_path?: string;
  project_name?: string;
  command?: string;
  dry_run?: boolean;
  reason_codes?: string[];
  hint?: string[];
}

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

interface RunAppOptions {
  pointerPath: string;
  install: boolean;
  dryRun: boolean;
  jsonOutput: boolean;
}

interface Receipt {
  ok: boolean;
  script: string;
  stage: string;
  dryRun: boolean;
  pointer_path: string | null;
  active_build_root: string | null;
  resolved_app_path: string | null;
  app_path: string | null;
  project_name: string | null;
  command: string | null;
  reason_codes: string[];
  hints: string[];
  errors: string[];
  elapsedMs: number;
}

const receipt: Receipt = {
  ok: true,
  script: 'axion-run-app',
  stage: 'run-app',
  dryRun,
  pointer_path: null,
  active_build_root: null,
  resolved_app_path: null,
  app_path: null,
  project_name: null,
  command: null,
  reason_codes: [],
  hints: [],
  errors: [],
  elapsedMs: 0,
};

function emitOutput(): void {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  } else {
    if (receipt.ok) {
      console.log(`\n[DONE] axion-run-app completed successfully (${receipt.elapsedMs}ms)`);
    } else {
      console.log(`\n[FAIL] axion-run-app failed (${receipt.elapsedMs}ms)`);
      for (const e of receipt.errors) {
        console.log(`  ERROR: ${e}`);
      }
      for (const h of receipt.hints) {
        console.log(`  HINT: ${h}`);
      }
    }
  }
}

function parseArgs(args: string[]): RunAppOptions {
  const options: RunAppOptions = {
    pointerPath: path.join(process.cwd(), 'ACTIVE_BUILD.json'),
    install: false,
    dryRun: false,
    jsonOutput: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--pointer':
        options.pointerPath = path.resolve(args[++i] || options.pointerPath);
        break;
      case '--install':
        options.install = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--json':
        options.jsonOutput = true;
        break;
    }
  }

  return options;
}

function log(msg: string, jsonOutput: boolean): void {
  if (!jsonOutput) {
    console.log(msg);
  }
}

function loadActivePointer(pointerPath: string): ActiveBuildPointer | null {
  if (!fs.existsSync(pointerPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(pointerPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function detectStartCommand(appPath: string): string {
  const packageJsonPath = path.join(appPath, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (pkg.scripts?.dev) {
        return 'npm run dev';
      }
      if (pkg.scripts?.start) {
        return 'npm start';
      }
    } catch {
      // Fall through to default
    }
  }
  
  return 'npm run dev';
}

function runCommand(command: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const proc = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  log('\n[AXION] Run App\n', options.jsonOutput);

  const pointer = loadActivePointer(options.pointerPath);
  
  const absPointerPath = path.resolve(options.pointerPath);
  receipt.pointer_path = absPointerPath;

  if (!pointer) {
    receipt.ok = false;
    receipt.reason_codes.push('NO_ACTIVE_BUILD');
    receipt.hints.push(
      `No active build found at ${absPointerPath}`,
      'Run axion-activate to set the active build first',
      'Or provide --pointer <path> to specify ACTIVE_BUILD.json location'
    );
    receipt.errors.push(`No active build found at ${absPointerPath}`);
    emitOutput();
    process.exit(1);
  }

  const activeBuildRoot = pointer.active_build_root;
  const appPath = pointer.app_path;
  const projectName = pointer.project_name;
  const resolvedAppPath = path.resolve(
    path.isAbsolute(appPath) ? appPath : path.resolve(activeBuildRoot, appPath)
  );

  receipt.active_build_root = activeBuildRoot;
  receipt.app_path = appPath;
  receipt.project_name = projectName;
  receipt.resolved_app_path = resolvedAppPath;

  log(`[INFO] Pointer: ${absPointerPath}`, options.jsonOutput);
  log(`[INFO] Active build: ${activeBuildRoot}`, options.jsonOutput);
  log(`[INFO] Project: ${projectName}`, options.jsonOutput);
  log(`[INFO] Resolved app path: ${resolvedAppPath}`, options.jsonOutput);
  log(`[INFO] Activated at: ${pointer.activated_at}`, options.jsonOutput);

  const rootPrefix = activeBuildRoot.endsWith(path.sep)
    ? activeBuildRoot
    : activeBuildRoot + path.sep;
  if (resolvedAppPath !== activeBuildRoot && !resolvedAppPath.startsWith(rootPrefix)) {
    receipt.ok = false;
    receipt.reason_codes.push('APP_PATH_OUTSIDE_BUILD_ROOT');
    receipt.hints.push(
      `Resolved app path escapes build root: ${resolvedAppPath}`,
      `Build root: ${activeBuildRoot}`,
      'This is a path traversal safety violation'
    );
    receipt.errors.push(`App path escapes build root: ${resolvedAppPath}`);
    emitOutput();
    process.exit(1);
  }

  if (!fs.existsSync(resolvedAppPath)) {
    receipt.ok = false;
    receipt.reason_codes.push('APP_PATH_NOT_FOUND');
    receipt.hints.push(
      `App path not found: ${resolvedAppPath}`,
      'Run scaffold-app and build-exec to create the app'
    );
    receipt.errors.push(`App path not found: ${resolvedAppPath}`);
    emitOutput();
    process.exit(1);
  }

  const startCommand = detectStartCommand(resolvedAppPath);
  receipt.command = startCommand;
  log(`[INFO] Start command: ${startCommand}`, options.jsonOutput);

  if (options.dryRun) {
    log('\n[DRY-RUN] Would run the following:', options.jsonOutput);
    if (options.install) {
      log(`  cd ${resolvedAppPath} && npm install`, options.jsonOutput);
    }
    log(`  cd ${resolvedAppPath} && ${startCommand}`, options.jsonOutput);
    
    receipt.dryRun = true;
    emitOutput();
    return;
  }

  if (options.install) {
    log('\n[INFO] Running npm install...', options.jsonOutput);
    try {
      await runCommand('npm install', resolvedAppPath);
    } catch (err: any) {
      receipt.ok = false;
      receipt.reason_codes.push('INSTALL_FAILED');
      receipt.hints.push('npm install failed', err.message);
      receipt.errors.push(`npm install failed: ${err.message}`);
      emitOutput();
      process.exit(1);
    }
  }

  log('\n[INFO] Starting app...', options.jsonOutput);
  log('', options.jsonOutput);

  try {
    await runCommand(startCommand, resolvedAppPath);
    emitOutput();
  } catch (err: any) {
    receipt.ok = false;
    receipt.reason_codes.push('START_FAILED');
    receipt.hints.push('Failed to start app', err.message);
    receipt.errors.push(`Failed to start app: ${err.message}`);
    emitOutput();
    process.exit(1);
  }
}

main().catch((err) => {
  receipt.ok = false;
  receipt.errors.push(err.message || String(err));
  emitOutput();
  process.exit(1);
});
