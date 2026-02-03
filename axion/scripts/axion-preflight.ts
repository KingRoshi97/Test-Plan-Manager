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
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reason codes for preflight failures
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
  console.log(`[${level}] ${message}`);
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

function checkTsxAvailable(root: string): CheckResult {
  const tsxPaths = [
    path.join(root, 'node_modules', '.bin', 'tsx'),
    path.join(root, 'node_modules', 'tsx'),
  ];
  
  const pkgJsonPath = path.join(root, 'package.json');
  
  // Check node_modules
  const tsxExists = tsxPaths.some(p => fs.existsSync(p));
  
  // Check package.json dependencies
  let inDeps = false;
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
      inDeps = !!(pkg.dependencies?.tsx || pkg.devDependencies?.tsx);
    } catch {
      // Ignore parse errors here
    }
  }
  
  if (!tsxExists && !inDeps) {
    return {
      name: 'tsx',
      status: 'fail',
      message: 'tsx is not installed',
      reason_code: 'MISSING_DEPENDENCY',
      hint: 'npm install tsx',
    };
  }
  
  return { name: 'tsx', status: 'ok' };
}

function checkAxionDirectory(root: string): CheckResult {
  const axionDir = path.join(root, 'axion');
  
  if (!fs.existsSync(axionDir)) {
    return {
      name: 'axion_dir',
      status: 'fail',
      message: 'axion/ directory not found',
      reason_code: 'BAD_WORKDIR',
      hint: `cd to repository root or run: node --import tsx axion/scripts/axion-init.ts`,
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
    
    // Validate required fields
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
    
    // Validate required fields
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
  
  // Try to create if doesn't exist
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      return { name: `${dirName}_writable`, status: 'ok', message: 'created' };
    } catch (e) {
      return {
        name: `${dirName}_writable`,
        status: 'fail',
        message: `Cannot create ${dirName}/ directory`,
        reason_code: 'OUTPUT_NOT_WRITABLE',
        hint: `Check permissions on ${root}`,
      };
    }
  }
  
  // Check if writable by attempting to create a temp file
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

function checkRegistryDir(root: string): CheckResult {
  return checkOutputDirWritable(root, 'axion/registry');
}

function checkDomainsDir(root: string): CheckResult {
  return checkOutputDirWritable(root, 'axion/domains');
}

function runAllChecks(root: string): CheckResult[] {
  return [
    checkNodeRuntime(),
    checkTsxAvailable(root),
    checkAxionDirectory(root),
    checkConfigDirectory(root),
    checkDomainsJson(root),
    checkPresetsJson(root),
    checkTemplatesDirectory(root),
    checkRegistryDir(root),
    checkDomainsDir(root),
  ];
}

function main(): void {
  const args = process.argv.slice(2);
  
  // Parse --root argument
  const rootIdx = args.indexOf('--root');
  let root = process.cwd();
  if (rootIdx !== -1 && args[rootIdx + 1]) {
    root = path.resolve(args[rootIdx + 1]);
  }
  
  // Handle help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
AXION Preflight Validation

Usage:
  node --import tsx axion/scripts/axion-preflight.ts [--root <path>]

Options:
  --root <path>   Workspace root (default: current directory)
  --help          Show this help

Checks performed:
  - Node.js version >= 18
  - tsx dependency installed
  - axion/ directory exists
  - axion/config/ directory exists
  - domains.json valid
  - presets.json valid
  - templates/ directory populated
  - registry/ writable
  - domains/ writable
`);
    process.exit(0);
  }
  
  console.log('\n[AXION] Preflight Validation\n');
  log('INFO', `Root: ${root}`);
  console.log('');
  
  const checks = runAllChecks(root);
  const failed = checks.filter(c => c.status === 'fail');
  const passed = checks.filter(c => c.status === 'ok');
  
  // Print results
  for (const check of checks) {
    if (check.status === 'ok') {
      log('PASS', `${check.name}${check.message ? ` (${check.message})` : ''}`);
    } else {
      log('FAIL', `${check.name}: ${check.message}`);
      if (check.hint) {
        log('INFO', `  Hint: ${check.hint}`);
      }
    }
  }
  
  console.log('');
  
  // Build result
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
  } else {
    result.reason_codes = [...new Set(failed.map(f => f.reason_code!))];
    result.hint = failed.map(f => f.hint).filter((h): h is string => !!h);
    log('FAIL', `${failed.length} preflight check(s) failed`);
  }
  
  console.log('');
  console.log(JSON.stringify(result, null, 2));
  
  process.exit(failed.length === 0 ? 0 : 1);
}

main();
