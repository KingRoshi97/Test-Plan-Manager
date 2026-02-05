#!/usr/bin/env node
/**
 * AXION Doctor
 * 
 * Self-diagnosis and health check tool for the AXION system.
 * Validates environment, configuration, templates, and build state.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-doctor.ts
 *   node --import tsx axion/scripts/axion-doctor.ts --root ./my-kit
 *   node --import tsx axion/scripts/axion-doctor.ts --strict --json
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AXION_ROOT = path.resolve(__dirname, '..');

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type CheckStatus = 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
type Severity = 'critical' | 'warning' | 'info';
type AppliesTo = 'system' | 'build' | 'both';

interface CheckResult {
  id: string;
  status: CheckStatus;
  details?: string;
  reason_code?: string;
  path?: string;
  hint?: string;
}

interface Check {
  id: string;
  name: string;
  severity: Severity;
  appliesTo: AppliesTo;
  fn: (ctx: CheckContext) => CheckResult;
}

interface CheckContext {
  root?: string;
  projectName?: string;
  strict: boolean;
  axionRoot: string;
}

interface DoctorOutput {
  status: 'success' | 'failed';
  stage: 'doctor';
  mode: 'system' | 'build';
  root: string | null;
  summary: { pass: number; warn: number; fail: number };
  checks: CheckResult[];
  failures?: CheckResult[];
  flags: Record<string, boolean>;
  next_commands: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(): { root?: string; strict: boolean; json: boolean } {
  const args = process.argv.slice(2);
  let root: string | undefined;
  let strict = false;
  let json = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--root' && args[i + 1]) {
      root = args[++i];
    } else if (args[i] === '--strict') {
      strict = true;
    } else if (args[i] === '--json') {
      json = true;
    }
  }

  return { root, strict, json };
}

function fileExists(p: string): boolean {
  return fs.existsSync(p);
}

function isValidJson(p: string): { valid: boolean; data?: any; error?: string } {
  try {
    const content = fs.readFileSync(p, 'utf-8');
    const data = JSON.parse(content);
    return { valid: true, data };
  } catch (e: any) {
    return { valid: false, error: e.message };
  }
}

function log(status: CheckStatus, id: string, details?: string): void {
  const prefix = {
    PASS: '\x1b[32m[PASS]\x1b[0m',
    FAIL: '\x1b[31m[FAIL]\x1b[0m',
    WARN: '\x1b[33m[WARN]\x1b[0m',
    SKIP: '\x1b[90m[SKIP]\x1b[0m'
  }[status];
  
  const msg = details ? `${prefix} ${id}: ${details}` : `${prefix} ${id}`;
  console.error(msg);
}

// ─────────────────────────────────────────────────────────────────────────────
// Environment Checks
// ─────────────────────────────────────────────────────────────────────────────

const ENV_NODE: Check = {
  id: 'ENV_NODE',
  name: 'Node.js version',
  severity: 'critical',
  appliesTo: 'both',
  fn: () => {
    try {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0], 10);
      if (major >= 18) {
        return { id: 'ENV_NODE', status: 'PASS', details: version };
      }
      return { id: 'ENV_NODE', status: 'FAIL', details: `${version} (requires >= 18)`, reason_code: 'ENV_NODE_VERSION_LOW' };
    } catch {
      return { id: 'ENV_NODE', status: 'FAIL', details: 'Cannot determine Node version', reason_code: 'ENV_NODE_MISSING' };
    }
  }
};

const ENV_TSX: Check = {
  id: 'ENV_TSX',
  name: 'TSX available',
  severity: 'critical',
  appliesTo: 'both',
  fn: () => {
    try {
      execSync('npx tsx --version', { stdio: 'pipe' });
      return { id: 'ENV_TSX', status: 'PASS', details: 'available' };
    } catch {
      return { id: 'ENV_TSX', status: 'FAIL', details: 'tsx not found', reason_code: 'ENV_TSX_MISSING', hint: 'npm install -D tsx' };
    }
  }
};

const ENV_PERMS_WRITE: Check = {
  id: 'ENV_PERMS_WRITE',
  name: 'Write permissions',
  severity: 'critical',
  appliesTo: 'both',
  fn: (ctx) => {
    const testPath = path.join(ctx.axionRoot, '.doctor-write-test');
    try {
      fs.writeFileSync(testPath, 'test');
      fs.unlinkSync(testPath);
      return { id: 'ENV_PERMS_WRITE', status: 'PASS', details: 'writable' };
    } catch {
      return { id: 'ENV_PERMS_WRITE', status: 'FAIL', details: 'Cannot write to axion directory', reason_code: 'ENV_PERMS_DENIED' };
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Config Integrity Checks
// ─────────────────────────────────────────────────────────────────────────────

const CFG_SYSTEM_JSON: Check = {
  id: 'CFG_SYSTEM_JSON',
  name: 'system.json valid',
  severity: 'critical',
  appliesTo: 'both',
  fn: (ctx) => {
    const p = path.join(ctx.axionRoot, 'config', 'system.json');
    if (!fileExists(p)) {
      return { id: 'CFG_SYSTEM_JSON', status: 'FAIL', details: 'File not found', path: p, reason_code: 'CFG_FILE_MISSING' };
    }
    const result = isValidJson(p);
    if (!result.valid) {
      return { id: 'CFG_SYSTEM_JSON', status: 'FAIL', details: result.error, path: p, reason_code: 'CFG_JSON_INVALID' };
    }
    if (!result.data.feature_flags) {
      return { id: 'CFG_SYSTEM_JSON', status: 'WARN', details: 'Missing feature_flags key', path: p };
    }
    return { id: 'CFG_SYSTEM_JSON', status: 'PASS', path: p };
  }
};

const CFG_DOMAINS_JSON: Check = {
  id: 'CFG_DOMAINS_JSON',
  name: 'domains.json valid',
  severity: 'critical',
  appliesTo: 'both',
  fn: (ctx) => {
    const p = path.join(ctx.axionRoot, 'config', 'domains.json');
    if (!fileExists(p)) {
      return { id: 'CFG_DOMAINS_JSON', status: 'FAIL', details: 'File not found', path: p, reason_code: 'CFG_FILE_MISSING' };
    }
    const result = isValidJson(p);
    if (!result.valid) {
      return { id: 'CFG_DOMAINS_JSON', status: 'FAIL', details: result.error, path: p, reason_code: 'CFG_JSON_INVALID' };
    }
    if (!result.data.canonical_order || !Array.isArray(result.data.canonical_order)) {
      return { id: 'CFG_DOMAINS_JSON', status: 'FAIL', details: 'Missing canonical_order array', path: p, reason_code: 'CFG_SCHEMA_INVALID' };
    }
    if (!result.data.modules) {
      return { id: 'CFG_DOMAINS_JSON', status: 'FAIL', details: 'Missing modules', path: p, reason_code: 'CFG_SCHEMA_INVALID' };
    }
    // modules can be array or object
    const moduleSlugs = Array.isArray(result.data.modules) 
      ? result.data.modules.map((m: any) => m.slug)
      : Object.keys(result.data.modules);
    const missingInOrder = moduleSlugs.filter((s: string) => !result.data.canonical_order.includes(s));
    if (missingInOrder.length > 0) {
      return { id: 'CFG_DOMAINS_JSON', status: 'WARN', details: `Modules not in canonical_order: ${missingInOrder.join(', ')}`, path: p };
    }
    return { id: 'CFG_DOMAINS_JSON', status: 'PASS', details: `${moduleSlugs.length} modules defined`, path: p };
  }
};

const CFG_PRESETS_JSON: Check = {
  id: 'CFG_PRESETS_JSON',
  name: 'presets.json valid',
  severity: 'critical',
  appliesTo: 'both',
  fn: (ctx) => {
    const p = path.join(ctx.axionRoot, 'config', 'presets.json');
    if (!fileExists(p)) {
      return { id: 'CFG_PRESETS_JSON', status: 'FAIL', details: 'File not found', path: p, reason_code: 'CFG_FILE_MISSING' };
    }
    const result = isValidJson(p);
    if (!result.valid) {
      return { id: 'CFG_PRESETS_JSON', status: 'FAIL', details: result.error, path: p, reason_code: 'CFG_JSON_INVALID' };
    }
    // presets can be at root level or nested under .presets
    const presets = result.data.presets || result.data;
    if (!presets.system) {
      return { id: 'CFG_PRESETS_JSON', status: 'FAIL', details: 'Missing system preset', path: p, reason_code: 'CFG_SCHEMA_INVALID' };
    }
    const presetCount = Object.keys(presets).filter(k => typeof presets[k] === 'object' && presets[k].label).length;
    return { id: 'CFG_PRESETS_JSON', status: 'PASS', details: `${presetCount} presets defined`, path: p };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Template State Checks
// ─────────────────────────────────────────────────────────────────────────────

const TPL_DIR_EXISTS: Check = {
  id: 'TPL_DIR_EXISTS',
  name: 'Template directory exists',
  severity: 'critical',
  appliesTo: 'both',
  fn: (ctx) => {
    const p = path.join(ctx.axionRoot, 'templates');
    if (!fileExists(p)) {
      return { id: 'TPL_DIR_EXISTS', status: 'FAIL', details: 'Templates directory not found', path: p, reason_code: 'TPL_DIR_MISSING' };
    }
    return { id: 'TPL_DIR_EXISTS', status: 'PASS', path: p };
  }
};

const TPL_REQUIRED_PRESENT: Check = {
  id: 'TPL_REQUIRED_PRESENT',
  name: 'Required templates present',
  severity: 'critical',
  appliesTo: 'both',
  fn: (ctx) => {
    const domainsPath = path.join(ctx.axionRoot, 'config', 'domains.json');
    if (!fileExists(domainsPath)) {
      return { id: 'TPL_REQUIRED_PRESENT', status: 'SKIP', details: 'Cannot check without domains.json' };
    }
    
    const domains = JSON.parse(fs.readFileSync(domainsPath, 'utf-8'));
    // modules can be array or object
    const modules: string[] = Array.isArray(domains.modules)
      ? domains.modules.map((m: any) => m.slug)
      : Object.keys(domains.modules || {});
    const templatesDir = path.join(ctx.axionRoot, 'templates');
    
    const missing: string[] = [];
    for (const mod of modules) {
      const templateDir = path.join(templatesDir, mod);
      if (!fileExists(templateDir)) {
        missing.push(mod);
      }
    }
    
    if (missing.length > 0) {
      return { id: 'TPL_REQUIRED_PRESENT', status: 'FAIL', details: `Missing templates: ${missing.join(', ')}`, reason_code: 'TPL_MISSING' };
    }
    return { id: 'TPL_REQUIRED_PRESENT', status: 'PASS', details: `${modules.length} module templates present` };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Build Mode Checks (only run when --root provided)
// ─────────────────────────────────────────────────────────────────────────────

const BLD_MANIFEST: Check = {
  id: 'BLD_MANIFEST',
  name: 'Build manifest valid',
  severity: 'critical',
  appliesTo: 'build',
  fn: (ctx) => {
    if (!ctx.root) return { id: 'BLD_MANIFEST', status: 'SKIP', details: 'No build root provided' };
    
    const p = path.join(ctx.root, 'manifest.json');
    if (!fileExists(p)) {
      return { id: 'BLD_MANIFEST', status: 'FAIL', details: 'manifest.json not found', path: p, reason_code: 'BLD_MANIFEST_MISSING', hint: 'Run axion-kit-create to initialize' };
    }
    
    const result = isValidJson(p);
    if (!result.valid) {
      return { id: 'BLD_MANIFEST', status: 'FAIL', details: result.error, path: p, reason_code: 'BLD_MANIFEST_CORRUPT' };
    }
    
    if (!result.data.project_name) {
      return { id: 'BLD_MANIFEST', status: 'FAIL', details: 'Missing project_name', path: p, reason_code: 'BLD_MANIFEST_SCHEMA' };
    }
    
    return { id: 'BLD_MANIFEST', status: 'PASS', details: `Project: ${result.data.project_name}`, path: p };
  }
};

const BLD_AXION_SNAPSHOT: Check = {
  id: 'BLD_AXION_SNAPSHOT',
  name: 'AXION snapshot present',
  severity: 'critical',
  appliesTo: 'build',
  fn: (ctx) => {
    if (!ctx.root) return { id: 'BLD_AXION_SNAPSHOT', status: 'SKIP', details: 'No build root provided' };
    
    const p = path.join(ctx.root, 'axion');
    if (!fileExists(p)) {
      return { id: 'BLD_AXION_SNAPSHOT', status: 'FAIL', details: 'axion/ snapshot not found', path: p, reason_code: 'BLD_SNAPSHOT_MISSING' };
    }
    
    const sourceDocs = path.join(p, 'source_docs');
    if (!fileExists(sourceDocs)) {
      return { id: 'BLD_AXION_SNAPSHOT', status: 'WARN', details: 'source_docs/ not found in snapshot', path: sourceDocs };
    }
    
    return { id: 'BLD_AXION_SNAPSHOT', status: 'PASS', path: p };
  }
};

const REG_STAGE_MARKERS: Check = {
  id: 'REG_STAGE_MARKERS',
  name: 'Stage markers registry',
  severity: 'warning',
  appliesTo: 'build',
  fn: (ctx) => {
    if (!ctx.root) return { id: 'REG_STAGE_MARKERS', status: 'SKIP', details: 'No build root provided' };
    
    const p = path.join(ctx.root, 'axion', 'registry', 'stage_markers.json');
    if (!fileExists(p)) {
      return { id: 'REG_STAGE_MARKERS', status: 'WARN', details: 'stage_markers.json not found (may be new kit)', path: p };
    }
    
    const result = isValidJson(p);
    if (!result.valid) {
      return { id: 'REG_STAGE_MARKERS', status: 'FAIL', details: result.error, path: p, reason_code: 'REG_ARTIFACT_CORRUPT' };
    }
    
    return { id: 'REG_STAGE_MARKERS', status: 'PASS', path: p };
  }
};

const REG_VERIFY_REPORT: Check = {
  id: 'REG_VERIFY_REPORT',
  name: 'Verify report registry',
  severity: 'warning',
  appliesTo: 'build',
  fn: (ctx) => {
    if (!ctx.root) return { id: 'REG_VERIFY_REPORT', status: 'SKIP', details: 'No build root provided' };
    
    const p = path.join(ctx.root, 'axion', 'registry', 'verify_report.json');
    if (!fileExists(p)) {
      return { id: 'REG_VERIFY_REPORT', status: 'WARN', details: 'verify_report.json not found (run verify first)', path: p };
    }
    
    const result = isValidJson(p);
    if (!result.valid) {
      return { id: 'REG_VERIFY_REPORT', status: 'FAIL', details: result.error, path: p, reason_code: 'REG_ARTIFACT_CORRUPT' };
    }
    
    return { id: 'REG_VERIFY_REPORT', status: 'PASS', details: `Status: ${result.data.overall_status || 'unknown'}`, path: p };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Feature Flags Report
// ─────────────────────────────────────────────────────────────────────────────

const FLAGS_REPORT: Check = {
  id: 'FLAGS_REPORT',
  name: 'Feature flags state',
  severity: 'info',
  appliesTo: 'both',
  fn: (ctx) => {
    const p = path.join(ctx.axionRoot, 'config', 'system.json');
    if (!fileExists(p)) {
      return { id: 'FLAGS_REPORT', status: 'SKIP', details: 'system.json not found' };
    }
    
    const result = isValidJson(p);
    if (!result.valid || !result.data.feature_flags) {
      return { id: 'FLAGS_REPORT', status: 'SKIP', details: 'No feature_flags defined' };
    }
    
    const flags = result.data.feature_flags;
    const enabled = Object.entries(flags).filter(([_, v]: [string, any]) => v.enabled).map(([k]) => k);
    const disabled = Object.entries(flags).filter(([_, v]: [string, any]) => !v.enabled).map(([k]) => k);
    
    return { 
      id: 'FLAGS_REPORT', 
      status: 'PASS', 
      details: `${enabled.length} enabled, ${disabled.length} disabled`
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Check Registry
// ─────────────────────────────────────────────────────────────────────────────

const ALL_CHECKS: Check[] = [
  // Environment
  ENV_NODE,
  ENV_TSX,
  ENV_PERMS_WRITE,
  // Config
  CFG_SYSTEM_JSON,
  CFG_DOMAINS_JSON,
  CFG_PRESETS_JSON,
  // Templates
  TPL_DIR_EXISTS,
  TPL_REQUIRED_PRESENT,
  // Build mode
  BLD_MANIFEST,
  BLD_AXION_SNAPSHOT,
  REG_STAGE_MARKERS,
  REG_VERIFY_REPORT,
  // Flags
  FLAGS_REPORT
];

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function getFeatureFlags(axionRoot: string): Record<string, boolean> {
  const p = path.join(axionRoot, 'config', 'system.json');
  if (!fileExists(p)) return {};
  
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    const flags: Record<string, boolean> = {};
    if (data.feature_flags) {
      for (const [key, val] of Object.entries(data.feature_flags)) {
        flags[key] = (val as any).enabled || false;
      }
    }
    return flags;
  } catch {
    return {};
  }
}

function main(): void {
  const { root, strict, json } = parseArgs();
  const mode = root ? 'build' : 'system';
  
  const ctx: CheckContext = {
    root: root ? path.resolve(root) : undefined,
    strict,
    axionRoot: AXION_ROOT
  };

  if (!json) {
    console.error('\n╔════════════════════════════════════════════════════════════════╗');
    console.error('║                     AXION DOCTOR                               ║');
    console.error('╚════════════════════════════════════════════════════════════════╝');
    console.error(`Mode: ${mode}${root ? ` (${root})` : ''}`);
    console.error('');
  }

  const results: CheckResult[] = [];
  const failures: CheckResult[] = [];
  const nextCommands: string[] = [];

  for (const check of ALL_CHECKS) {
    // Skip build-only checks in system mode
    if (check.appliesTo === 'build' && mode === 'system') {
      continue;
    }

    const result = check.fn(ctx);
    results.push(result);

    if (!json) {
      log(result.status, result.id, result.details);
    }

    if (result.status === 'FAIL' || (strict && result.status === 'WARN')) {
      failures.push(result);
      if (result.hint) {
        nextCommands.push(result.hint);
      }
    }
  }

  const summary = {
    pass: results.filter(r => r.status === 'PASS').length,
    warn: results.filter(r => r.status === 'WARN').length,
    fail: results.filter(r => r.status === 'FAIL').length
  };

  const flags = getFeatureFlags(AXION_ROOT);

  const output: DoctorOutput = {
    status: failures.length === 0 ? 'success' : 'failed',
    stage: 'doctor',
    mode,
    root: ctx.root || null,
    summary,
    checks: results,
    flags,
    next_commands: nextCommands
  };

  if (failures.length > 0) {
    output.failures = failures;
  }

  if (!json) {
    console.error('');
    console.error('────────────────────────────────────────────────────────────────');
    console.error(`Summary: ${summary.pass} pass, ${summary.warn} warn, ${summary.fail} fail`);
    console.error(`Status: ${output.status.toUpperCase()}`);
    if (nextCommands.length > 0) {
      console.error('');
      console.error('Recommended next commands:');
      for (const cmd of nextCommands) {
        console.error(`  ${cmd}`);
      }
    }
    console.error('');
  }

  // Final JSON output (always last line)
  console.log(JSON.stringify(output));

  process.exit(failures.length === 0 ? 0 : 1);
}

main();
