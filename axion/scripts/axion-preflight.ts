#!/usr/bin/env node
/**
 * AXION Preflight Validation
 * 
 * Validates environment and workspace so the agent doesn't fail mid-run
 * due to missing tools, paths, or permissions.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-preflight.ts
 *   node --import tsx axion/scripts/axion-preflight.ts --root <path>
 *   node --import tsx axion/scripts/axion-preflight.ts --json
 *   node --import tsx axion/scripts/axion-preflight.ts --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const dryRun = args.includes('--dry-run');
const startTime = Date.now();

const receipt: Record<string, any> = {
  script: 'axion-preflight',
  ok: true,
  dryRun,
  stage: 'preflight',
  root: '',
  checks: {} as Record<string, string>,
  passed: 0,
  failed: 0,
  reason_codes: [] as string[],
  hints: [] as string[],
  errors: [] as string[],
  elapsedMs: 0,
};

const REASON_CODES = {
  BAD_WORKDIR: 'Working directory is not a valid AXION workspace',
  MISSING_DEPENDENCY: 'Required runtime dependency is missing',
  MISSING_CONFIG: 'Required configuration file is missing',
  INVALID_CONFIG: 'Configuration file is invalid JSON or malformed',
  MISSING_TEMPLATES: 'Templates directory is missing or empty',
  OUTPUT_NOT_WRITABLE: 'Output directory is not writable',
} as const;

type ReasonCode = keyof typeof REASON_CODES;

interface CheckResult {
  name: string;
  status: 'ok' | 'fail';
  message?: string;
  reason_code?: ReasonCode;
  hint?: string;
}

interface PreflightResult {
  status: 'success' | 'failed';
  stage: 'preflight';
  root: string;
  checks?: Record<string, string>;
  reason_codes?: ReasonCode[];
  hint?: string[];
}

function log(level: 'PASS' | 'FAIL' | 'INFO' | 'WARN', message: string): void {
  if (!jsonMode) console.log(`[${level}] ${message}`);
}

function emitOutput(): void {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  }
}

function checkNodeRuntime(): CheckResult {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0], 10);
  
  if (major < 18) {
    return {
      name: 'node',
      status: 'fail',
      message: `Node.js ${version} is too old. Requires >= 18.`,
      reason_code: 'MISSING_DEPENDENCY',
      hint: 'Install Node.js 18 or later',
    };
  }
  
  return { name: 'node', status: 'ok', message: `Node.js ${version}` };
}

function checkTsxAvailable(_root: string): CheckResult {
  try {
    execSync('npx tsx --version', { stdio: 'pipe', timeout: 10000 });
    return { name: 'tsx', status: 'ok' };
  } catch {
    try {
      execSync('which tsx', { stdio: 'pipe' });
      return { name: 'tsx', status: 'ok' };
    } catch {
      return {
        name: 'tsx',
        status: 'fail',
        message: 'tsx is not installed',
        reason_code: 'MISSING_DEPENDENCY',
        hint: 'npm install -g tsx or ensure tsx is available via npx',
      };
    }
  }
}

function checkAxionDirectory(root: string): CheckResult {
  const axionDir = path.join(root, 'axion');
  
  if (!fs.existsSync(axionDir)) {
    return {
      name: 'axion_dir',
      status: 'fail',
      message: 'axion/ directory not found',
      reason_code: 'BAD_WORKDIR',
      hint: `cd to repository root or run: node axion/scripts/axion-init.mjs`,
    };
  }
  
  if (!fs.statSync(axionDir).isDirectory()) {
    return {
      name: 'axion_dir',
      status: 'fail',
      message: 'axion exists but is not a directory',
      reason_code: 'BAD_WORKDIR',
      hint: 'Remove axion file and initialize workspace',
    };
  }
  
  return { name: 'axion_dir', status: 'ok' };
}

function checkConfigDirectory(root: string): CheckResult {
  const configDir = path.join(root, 'axion', 'config');
  
  if (!fs.existsSync(configDir)) {
    return {
      name: 'config_dir',
      status: 'fail',
      message: 'axion/config/ directory not found',
      reason_code: 'MISSING_CONFIG',
      hint: 'Run axion-init to create config directory',
    };
  }
  
  return { name: 'config_dir', status: 'ok' };
}

function checkDomainsJson(root: string): CheckResult {
  const domainsPath = path.join(root, 'axion', 'config', 'domains.json');
  
  if (!fs.existsSync(domainsPath)) {
    return {
      name: 'domains_json',
      status: 'fail',
      message: 'axion/config/domains.json not found',
      reason_code: 'MISSING_CONFIG',
      hint: 'Run axion-init to create domains.json',
    };
  }
  
  try {
    const content = fs.readFileSync(domainsPath, 'utf-8');
    const data = JSON.parse(content);
    
    if (!data.modules || !Array.isArray(data.modules)) {
      return {
        name: 'domains_json',
        status: 'fail',
        message: 'domains.json missing "modules" array',
        reason_code: 'INVALID_CONFIG',
        hint: 'Ensure domains.json has a "modules" array with module definitions',
      };
    }
    
    return { name: 'domains_json', status: 'ok' };
  } catch (e) {
    return {
      name: 'domains_json',
      status: 'fail',
      message: `domains.json is invalid JSON: ${e instanceof Error ? e.message : 'parse error'}`,
      reason_code: 'INVALID_CONFIG',
      hint: 'Fix JSON syntax in axion/config/domains.json',
    };
  }
}

function checkPresetsJson(root: string): CheckResult {
  const presetsPath = path.join(root, 'axion', 'config', 'presets.json');
  
  if (!fs.existsSync(presetsPath)) {
    return {
      name: 'presets_json',
      status: 'fail',
      message: 'axion/config/presets.json not found',
      reason_code: 'MISSING_CONFIG',
      hint: 'Run axion-init to create presets.json',
    };
  }
  
  try {
    const content = fs.readFileSync(presetsPath, 'utf-8');
    const data = JSON.parse(content);
    
    if (!data.stage_plans || typeof data.stage_plans !== 'object') {
      return {
        name: 'presets_json',
        status: 'fail',
        message: 'presets.json missing "stage_plans" object',
        reason_code: 'INVALID_CONFIG',
        hint: 'Ensure presets.json has a "stage_plans" object',
      };
    }
    
    if (!data.presets || typeof data.presets !== 'object') {
      return {
        name: 'presets_json',
        status: 'fail',
        message: 'presets.json missing "presets" object',
        reason_code: 'INVALID_CONFIG',
        hint: 'Ensure presets.json has a "presets" object',
      };
    }
    
    return { name: 'presets_json', status: 'ok' };
  } catch (e) {
    return {
      name: 'presets_json',
      status: 'fail',
      message: `presets.json is invalid JSON: ${e instanceof Error ? e.message : 'parse error'}`,
      reason_code: 'INVALID_CONFIG',
      hint: 'Fix JSON syntax in axion/config/presets.json',
    };
  }
}

function checkTemplatesDirectory(root: string): CheckResult {
  const templatesDir = path.join(root, 'axion', 'templates');
  
  if (!fs.existsSync(templatesDir)) {
    return {
      name: 'templates_dir',
      status: 'fail',
      message: 'axion/templates/ directory not found',
      reason_code: 'MISSING_TEMPLATES',
      hint: 'Run axion-init to create templates directory',
    };
  }
  
  try {
    const entries = fs.readdirSync(templatesDir);
    const templateDirs = entries.filter(e => {
      const stat = fs.statSync(path.join(templatesDir, e));
      return stat.isDirectory();
    });
    
    if (templateDirs.length === 0) {
      return {
        name: 'templates_dir',
        status: 'fail',
        message: 'axion/templates/ is empty',
        reason_code: 'MISSING_TEMPLATES',
        hint: 'Add module templates to axion/templates/',
      };
    }
    
    return { name: 'templates_dir', status: 'ok', message: `${templateDirs.length} templates found` };
  } catch (e) {
    return {
      name: 'templates_dir',
      status: 'fail',
      message: `Cannot read templates directory: ${e instanceof Error ? e.message : 'unknown error'}`,
      reason_code: 'MISSING_TEMPLATES',
      hint: 'Check permissions on axion/templates/',
    };
  }
}

function checkOutputDirWritable(root: string, dirName: string): CheckResult {
  const dirPath = path.join(root, dirName);
  
  if (!fs.existsSync(dirPath)) {
    return {
      name: `${dirName}_writable`,
      status: 'fail',
      message: `${dirName}/ directory not found`,
      reason_code: 'OUTPUT_NOT_WRITABLE',
      hint: `Run prepare-root to create workspace directories, or use --build-root flag`,
    };
  }
  
  const testFile = path.join(dirPath, `.preflight_test_${Date.now()}`);
  try {
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return { name: `${dirName}_writable`, status: 'ok' };
  } catch (e) {
    return {
      name: `${dirName}_writable`,
      status: 'fail',
      message: `${dirName}/ is not writable`,
      reason_code: 'OUTPUT_NOT_WRITABLE',
      hint: `Check write permissions on ${dirPath}`,
    };
  }
}

function checkRegistryDir(root: string, twoRootMode: boolean): CheckResult {
  const dirName = twoRootMode ? 'registry' : 'axion/registry';
  return checkOutputDirWritable(root, dirName);
}

function checkDomainsDir(root: string, twoRootMode: boolean): CheckResult {
  const dirName = twoRootMode ? 'domains' : 'axion/domains';
  return checkOutputDirWritable(root, dirName);
}

/**
 * Run all preflight checks.
 * 
 * In two-root mode:
 * - systemRoot: where axion/ system folder lives (configs, templates, scripts)
 * - workspaceRoot: where outputs go (registry/, domains/)
 * 
 * In legacy mode:
 * - root: contains both axion/ system and axion/registry, axion/domains outputs
 */
function runAllChecks(systemRoot: string, workspaceRoot: string, twoRootMode: boolean): CheckResult[] {
  return [
    checkNodeRuntime(),
    checkTsxAvailable(systemRoot),
    
    checkAxionDirectory(systemRoot),
    checkConfigDirectory(systemRoot),
    checkDomainsJson(systemRoot),
    checkPresetsJson(systemRoot),
    checkTemplatesDirectory(systemRoot),
    
    checkRegistryDir(workspaceRoot, twoRootMode),
    checkDomainsDir(workspaceRoot, twoRootMode),
  ];
}

function main(): void {
  try {
    const rootIdx = args.indexOf('--root');
    let root = process.cwd();
    if (rootIdx !== -1 && args[rootIdx + 1]) {
      root = path.resolve(args[rootIdx + 1]);
    }
    
    const buildRootIdx = args.indexOf('--build-root');
    let buildRoot: string | null = null;
    if (buildRootIdx !== -1 && args[buildRootIdx + 1]) {
      buildRoot = path.resolve(args[buildRootIdx + 1]);
    }
    
    receipt.root = root;
    
    if (args.includes('--help') || args.includes('-h')) {
      if (!jsonMode) {
        console.log(`
AXION Preflight Validation

Usage:
  # Legacy mode (root contains axion/):
  node --import tsx axion/scripts/axion-preflight.ts [--root <path>]
  
  # Two-root mode:
  node --import tsx axion/scripts/axion-preflight.ts --root <workspace> --build-root <build>

Options:
  --root <path>         Workspace root for outputs (default: current directory)
  --build-root <path>   Build root containing axion/ system folder (two-root mode)
  --json                Output structured JSON receipt only
  --dry-run             Run checks without side effects
  --help                Show this help

Checks performed:
  - Node.js version >= 18
  - tsx dependency installed
  - axion/ system directory exists (in build root)
  - axion/config/ directory exists
  - domains.json valid
  - presets.json valid
  - templates/ directory populated
  - registry/ writable (in workspace root)
  - domains/ writable (in workspace root)
`);
      }
      process.exit(0);
    }
    
    if (!jsonMode) console.log('\n[AXION] Preflight Validation\n');
    
    const twoRootMode = buildRoot !== null;
    const systemRoot = twoRootMode ? buildRoot! : root;
    const workspaceRoot = root;
    
    if (twoRootMode) {
      log('INFO', `Mode: Two-root`);
      log('INFO', `System root: ${systemRoot}`);
      log('INFO', `Workspace root: ${workspaceRoot}`);
    } else {
      log('INFO', `Mode: Legacy (single root)`);
      log('INFO', `Root: ${root}`);
    }
    if (!jsonMode) console.log('');
    
    if (dryRun) {
      log('INFO', 'Dry-run mode: checks will run but no side effects');
      if (!jsonMode) console.log('');
    }
    
    const checks = runAllChecks(systemRoot, workspaceRoot, twoRootMode);
    const failed = checks.filter(c => c.status === 'fail');
    const passed = checks.filter(c => c.status === 'ok');
    
    for (const check of checks) {
      if (check.status === 'ok') {
        log('PASS', `${check.name}${check.message ? ` (${check.message})` : ''}`);
        receipt.checks[check.name] = 'ok';
      } else {
        log('FAIL', `${check.name}: ${check.message}`);
        if (check.hint) {
          log('INFO', `  Hint: ${check.hint}`);
        }
        receipt.checks[check.name] = 'fail';
      }
    }
    
    if (!jsonMode) console.log('');
    
    receipt.passed = passed.length;
    receipt.failed = failed.length;
    
    const result: PreflightResult = {
      status: failed.length === 0 ? 'success' : 'failed',
      stage: 'preflight',
      root,
    };
    
    if (failed.length === 0) {
      result.checks = {};
      for (const check of passed) {
        result.checks[check.name] = 'ok';
      }
      log('PASS', 'All preflight checks passed');
      receipt.ok = true;
    } else {
      result.reason_codes = [...new Set(failed.map(f => f.reason_code!))];
      result.hint = failed.map(f => f.hint).filter((h): h is string => !!h);
      receipt.reason_codes = result.reason_codes;
      receipt.hints = result.hint;
      receipt.ok = false;
      log('FAIL', `${failed.length} preflight check(s) failed`);
    }
    
    if (!jsonMode) {
      console.log('');
      console.log(JSON.stringify(result, null, 2));
    }
    
    emitOutput();
    process.exit(failed.length === 0 ? 0 : 1);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    receipt.errors.push(msg);
    receipt.ok = false;
    emitOutput();
    process.exit(1);
  }
}

main();
