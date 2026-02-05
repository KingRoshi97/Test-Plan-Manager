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

  // Load active build pointer
  const pointer = loadActivePointer(options.pointerPath);
  
  const absPointerPath = path.resolve(options.pointerPath);

  if (!pointer) {
    const result: RunAppResult = {
      status: 'blocked_by',
      stage: 'run-app',
      pointer_path: absPointerPath,
      reason_codes: ['NO_ACTIVE_BUILD'],
      hint: [
        `No active build found at ${absPointerPath}`,
        'Run axion-activate to set the active build first',
        'Or provide --pointer <path> to specify ACTIVE_BUILD.json location'
      ]
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const activeBuildRoot = pointer.active_build_root;
  const appPath = pointer.app_path;
  const projectName = pointer.project_name;
  const resolvedAppPath = path.resolve(
    path.isAbsolute(appPath) ? appPath : path.resolve(activeBuildRoot, appPath)
  );

  log(`[INFO] Pointer: ${absPointerPath}`, options.jsonOutput);
  log(`[INFO] Active build: ${activeBuildRoot}`, options.jsonOutput);
  log(`[INFO] Project: ${projectName}`, options.jsonOutput);
  log(`[INFO] Resolved app path: ${resolvedAppPath}`, options.jsonOutput);
  log(`[INFO] Activated at: ${pointer.activated_at}`, options.jsonOutput);

  const rootPrefix = activeBuildRoot.endsWith(path.sep)
    ? activeBuildRoot
    : activeBuildRoot + path.sep;
  if (resolvedAppPath !== activeBuildRoot && !resolvedAppPath.startsWith(rootPrefix)) {
    const result: RunAppResult = {
      status: 'failed',
      stage: 'run-app',
      pointer_path: absPointerPath,
      active_build_root: activeBuildRoot,
      resolved_app_path: resolvedAppPath,
      reason_codes: ['APP_PATH_OUTSIDE_BUILD_ROOT'],
      hint: [
        `Resolved app path escapes build root: ${resolvedAppPath}`,
        `Build root: ${activeBuildRoot}`,
        'This is a path traversal safety violation'
      ]
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  if (!fs.existsSync(resolvedAppPath)) {
    const result: RunAppResult = {
      status: 'failed',
      stage: 'run-app',
      pointer_path: absPointerPath,
      active_build_root: activeBuildRoot,
      resolved_app_path: resolvedAppPath,
      reason_codes: ['APP_PATH_NOT_FOUND'],
      hint: [
        `App path not found: ${resolvedAppPath}`,
        'Run scaffold-app and build-exec to create the app'
      ]
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const startCommand = detectStartCommand(resolvedAppPath);
  log(`[INFO] Start command: ${startCommand}`, options.jsonOutput);

  if (options.dryRun) {
    log('\n[DRY-RUN] Would run the following:', options.jsonOutput);
    if (options.install) {
      log(`  cd ${resolvedAppPath} && npm install`, options.jsonOutput);
    }
    log(`  cd ${resolvedAppPath} && ${startCommand}`, options.jsonOutput);
    
    const result: RunAppResult = {
      status: 'success',
      stage: 'run-app',
      pointer_path: absPointerPath,
      active_build_root: activeBuildRoot,
      resolved_app_path: resolvedAppPath,
      app_path: appPath,
      project_name: projectName,
      command: startCommand,
      dry_run: true
    };
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (options.install) {
    log('\n[INFO] Running npm install...', options.jsonOutput);
    try {
      await runCommand('npm install', resolvedAppPath);
    } catch (err: any) {
      const result: RunAppResult = {
        status: 'failed',
        stage: 'run-app',
        pointer_path: absPointerPath,
        active_build_root: activeBuildRoot,
        resolved_app_path: resolvedAppPath,
        reason_codes: ['INSTALL_FAILED'],
        hint: ['npm install failed', err.message]
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }
  }

  log('\n[INFO] Starting app...', options.jsonOutput);
  log('', options.jsonOutput);

  try {
    await runCommand(startCommand, resolvedAppPath);
    
    const result: RunAppResult = {
      status: 'success',
      stage: 'run-app',
      pointer_path: absPointerPath,
      active_build_root: activeBuildRoot,
      resolved_app_path: resolvedAppPath,
      app_path: appPath,
      project_name: projectName,
      command: startCommand
    };
    console.log(JSON.stringify(result, null, 2));
  } catch (err: any) {
    const result: RunAppResult = {
      status: 'failed',
      stage: 'run-app',
      pointer_path: absPointerPath,
      active_build_root: activeBuildRoot,
      resolved_app_path: resolvedAppPath,
      reason_codes: ['START_FAILED'],
      hint: ['Failed to start app', err.message]
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
