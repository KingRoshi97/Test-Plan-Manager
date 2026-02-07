/**
 * AXION Derivation Block Enforcement Tests
 * 
 * Tests RPBS_DERIVATIONS block propagation and verification:
 * - Template propagation (all 8 core templates include the block)
 * - Verify enforcement (missing block causes FAIL)
 * - UNKNOWN values require Q-IDs
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, ExecSyncOptions } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AXION_ROOT = path.join(__dirname, '..', '..');
const TEMPLATES_PATH = path.join(AXION_ROOT, 'templates');
const CORE_MODULES = ['contracts', 'database', 'auth', 'backend', 'state', 'frontend', 'fullstack', 'systems'];

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface VerifyReport {
  generated_at: string;
  overall_status: 'PASS' | 'FAIL';
  modules: Record<string, {
    status: 'PASS' | 'FAIL';
    reason_codes: string[];
    hints: string[];
  }>;
  seam_violations: any[];
  template_drift: any;
  next_commands: string[];
}

function runVerify(workspace: string): CommandResult {
  const scriptPath = path.join(AXION_ROOT, 'scripts', 'axion-verify.mjs');
  const fullCommand = `node ${scriptPath} --all`;
  const options: ExecSyncOptions = {
    cwd: process.cwd(),
    env: { ...process.env, AXION_WORKSPACE: workspace },
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  };
  
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  
  try {
    stdout = execSync(fullCommand, options) as string;
  } catch (error: any) {
    exitCode = error.status || 1;
    stdout = error.stdout || '';
    stderr = error.stderr || '';
  }
  
  return { exitCode, stdout, stderr };
}

function loadReport(workspace: string): VerifyReport | null {
  const reportPath = path.join(workspace, 'registry', 'verify_report.json');
  if (!fs.existsSync(reportPath)) return null;
  return JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
}

function createFixtureWorkspace(name: string): string {
  const workspace = path.join(__dirname, '..', 'temp', `derivation-${name}-${Date.now()}`);
  fs.mkdirSync(workspace, { recursive: true });
  
  // Create required directories
  fs.mkdirSync(path.join(workspace, 'config'), { recursive: true });
  fs.mkdirSync(path.join(workspace, 'registry'), { recursive: true });
  fs.mkdirSync(path.join(workspace, 'domains', 'contracts'), { recursive: true });
  fs.mkdirSync(path.join(workspace, 'templates'), { recursive: true });
  
  // Create domains.json
  const domainsConfig = {
    axion_root: 'axion',
    domains_dir: 'domains',
    templates_dir: 'templates',
    modules: [
      { name: 'Contracts', slug: 'contracts', prefix: 'contract', type: 'core' }
    ],
    canonical_order: ['contracts'],
    stages: ['generate', 'seed', 'draft', 'review', 'verify', 'lock']
  };
  fs.writeFileSync(path.join(workspace, 'config', 'domains.json'), JSON.stringify(domainsConfig, null, 2));
  
  // Copy coverage_map.json from real config
  const coverageMapSrc = path.join(AXION_ROOT, 'config', 'coverage_map.json');
  if (fs.existsSync(coverageMapSrc)) {
    fs.copyFileSync(coverageMapSrc, path.join(workspace, 'config', 'coverage_map.json'));
  }
  
  // Create stage markers
  const markers = {
    version: '1.0.0',
    markers: {
      contracts: {
        generate: { completed_at: new Date().toISOString() },
        seed: { completed_at: new Date().toISOString() }
      }
    }
  };
  fs.writeFileSync(path.join(workspace, 'registry', 'stage_markers.json'), JSON.stringify(markers, null, 2));
  
  return workspace;
}

function cleanupWorkspace(workspace: string): void {
  try {
    fs.rmSync(workspace, { recursive: true, force: true });
  } catch (e) {
    // Ignore cleanup errors
  }
}

function describe(name: string, fn: () => void): void {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`SUITE: ${name}`);
  console.log(`${'═'.repeat(60)}`);
  fn();
}

function it(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error: any) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    process.exitCode = 1;
  }
}

// ────────────────────────────────────────────────────────────
// Test 1: Template Propagation
// ────────────────────────────────────────────────────────────

describe('Template Propagation', () => {
  
  it('all 8 core templates include ## RPBS_DERIVATIONS (Required)', () => {
    const missingModules: string[] = [];
    
    for (const mod of CORE_MODULES) {
      const templatePath = path.join(TEMPLATES_PATH, mod, 'README.template.md');
      
      if (!fs.existsSync(templatePath)) {
        missingModules.push(`${mod} (template not found)`);
        continue;
      }
      
      const content = fs.readFileSync(templatePath, 'utf-8');
      
      if (!content.includes('## RPBS_DERIVATIONS (Required)')) {
        missingModules.push(`${mod} (missing derivation block)`);
      }
    }
    
    if (missingModules.length > 0) {
      throw new Error(`Modules missing RPBS_DERIVATIONS: ${missingModules.join(', ')}`);
    }
  });
  
  it('all core templates include AXION:SECTION:RPBS_DERIVATIONS marker', () => {
    const missingMarkers: string[] = [];
    
    for (const mod of CORE_MODULES) {
      const templatePath = path.join(TEMPLATES_PATH, mod, 'README.template.md');
      
      if (!fs.existsSync(templatePath)) continue;
      
      const content = fs.readFileSync(templatePath, 'utf-8');
      
      if (!content.includes('<!-- AXION:SECTION:RPBS_DERIVATIONS -->')) {
        missingMarkers.push(mod);
      }
    }
    
    if (missingMarkers.length > 0) {
      throw new Error(`Modules missing RPBS_DERIVATIONS marker: ${missingMarkers.join(', ')}`);
    }
  });
  
  it('derivation blocks include Tenancy/Org Model field', () => {
    const missingField: string[] = [];
    
    for (const mod of CORE_MODULES) {
      const templatePath = path.join(TEMPLATES_PATH, mod, 'README.template.md');
      
      if (!fs.existsSync(templatePath)) continue;
      
      const content = fs.readFileSync(templatePath, 'utf-8');
      
      if (!content.includes('Tenancy/Org Model:')) {
        missingField.push(mod);
      }
    }
    
    if (missingField.length > 0) {
      throw new Error(`Modules missing Tenancy/Org Model field: ${missingField.join(', ')}`);
    }
  });
  
  it('derivation blocks include capability toggles', () => {
    const missingCapabilities: string[] = [];
    const requiredCapabilities = ['Billing/Entitlements:', 'Notifications:', 'Uploads/Media:', 'Public API:'];
    
    for (const mod of CORE_MODULES) {
      const templatePath = path.join(TEMPLATES_PATH, mod, 'README.template.md');
      
      if (!fs.existsSync(templatePath)) continue;
      
      const content = fs.readFileSync(templatePath, 'utf-8');
      
      for (const cap of requiredCapabilities) {
        if (!content.includes(cap)) {
          missingCapabilities.push(`${mod}:${cap}`);
        }
      }
    }
    
    if (missingCapabilities.length > 0) {
      throw new Error(`Missing capability toggles: ${missingCapabilities.join(', ')}`);
    }
  });
  
  it('derivation blocks include OPEN_QUESTIONS field', () => {
    const missingField: string[] = [];
    
    for (const mod of CORE_MODULES) {
      const templatePath = path.join(TEMPLATES_PATH, mod, 'README.template.md');
      
      if (!fs.existsSync(templatePath)) continue;
      
      const content = fs.readFileSync(templatePath, 'utf-8');
      
      if (!content.includes('OPEN_QUESTIONS impacting this module:')) {
        missingField.push(mod);
      }
    }
    
    if (missingField.length > 0) {
      throw new Error(`Modules missing OPEN_QUESTIONS field: ${missingField.join(', ')}`);
    }
  });
  
});

// ────────────────────────────────────────────────────────────
// Test 2: Verify Enforcement - Missing Derivation Block
// ────────────────────────────────────────────────────────────

describe('Verify Enforcement - MISSING_DERIVATION_BLOCK', () => {
  
  it('core module without derivation block fails with MISSING_DERIVATION_BLOCK', () => {
    const workspace = createFixtureWorkspace('missing-block');
    
    try {
      // Create a contracts README WITHOUT derivation block
      const readmePath = path.join(workspace, 'domains', 'contracts', 'README.md');
      const content = `# Contracts

## 1. Overview
Contract definitions

## 2. API Surface
Endpoints

## ACCEPTANCE
- [ ] Done
`;
      fs.writeFileSync(readmePath, content);
      
      const result = runVerify(workspace);
      
      if (result.exitCode === 0) {
        throw new Error('Expected verify to fail with exit code 1');
      }
      
      const report = loadReport(workspace);
      if (!report) throw new Error('verify_report.json not generated');
      
      if (report.overall_status !== 'FAIL') {
        throw new Error(`Expected overall_status=FAIL, got ${report.overall_status}`);
      }
      
      const contractsResult = report.modules['contracts'];
      if (!contractsResult) {
        throw new Error('No result for contracts module');
      }
      
      if (!contractsResult.reason_codes.includes('MISSING_DERIVATION_BLOCK')) {
        throw new Error(`Expected MISSING_DERIVATION_BLOCK, got: ${contractsResult.reason_codes.join(', ')}`);
      }
    } finally {
      cleanupWorkspace(workspace);
    }
  });
  
});

// ────────────────────────────────────────────────────────────
// Test 3: Verify Enforcement - UNKNOWN without Q-ID
// ────────────────────────────────────────────────────────────

describe('Verify Enforcement - UNKNOWN_WITHOUT_OPEN_QUESTION', () => {
  
  it('UNKNOWN values without Q-IDs triggers UNKNOWN_WITHOUT_OPEN_QUESTION', () => {
    const workspace = createFixtureWorkspace('unknown-no-qid');
    
    try {
      // Create a contracts README with UNKNOWN but no Q-IDs
      const readmePath = path.join(workspace, 'domains', 'contracts', 'README.md');
      const content = `# Contracts

## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: UNKNOWN (source: RPBS §21)
- Actors & Permission Intents: UNKNOWN (source: RPBS §3)
- Core Objects impacted here: UNKNOWN (source: RPBS §4)
- Non-Functional Profile implications: N/A (source: RPBS §7)
- Enabled capabilities in scope for this module:
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

## 1. Overview
Contract definitions

## 2. API Surface
Endpoints

## ACCEPTANCE
- [ ] Done
`;
      fs.writeFileSync(readmePath, content);
      
      const result = runVerify(workspace);
      
      // Should fail due to UNKNOWN without Q-IDs
      const report = loadReport(workspace);
      if (!report) throw new Error('verify_report.json not generated');
      
      const contractsResult = report.modules['contracts'];
      if (!contractsResult) {
        throw new Error('No result for contracts module');
      }
      
      // The module should fail with UNKNOWN_WITHOUT_OPEN_QUESTION because
      // there are UNKNOWN values but OPEN_QUESTIONS says NONE
      if (!contractsResult.reason_codes.includes('UNKNOWN_WITHOUT_OPEN_QUESTION')) {
        throw new Error(`Expected UNKNOWN_WITHOUT_OPEN_QUESTION, got: ${contractsResult.reason_codes.join(', ')}`);
      }
    } finally {
      cleanupWorkspace(workspace);
    }
  });
  
  it('UNKNOWN values with Q-IDs should pass UNKNOWN_WITHOUT_OPEN_QUESTION check', () => {
    const workspace = createFixtureWorkspace('unknown-with-qid');
    
    try {
      // Create a contracts README with UNKNOWN and proper Q-IDs
      const readmePath = path.join(workspace, 'domains', 'contracts', 'README.md');
      const content = `# Contracts

## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: UNKNOWN (source: RPBS §21)
- Actors & Permission Intents: UNKNOWN (source: RPBS §3)
- Core Objects impacted here: UNKNOWN (source: RPBS §4)
- Non-Functional Profile implications: N/A (source: RPBS §7)
- Enabled capabilities in scope for this module:
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- OPEN_QUESTIONS impacting this module: Q-1, Q-2, Q-3 (source: RPBS §34)

## 1. Overview
Contract definitions

## 2. API Surface
Endpoints

## ACCEPTANCE
- [ ] Done
`;
      fs.writeFileSync(readmePath, content);
      
      const result = runVerify(workspace);
      
      const report = loadReport(workspace);
      if (!report) throw new Error('verify_report.json not generated');
      
      const contractsResult = report.modules['contracts'];
      if (!contractsResult) {
        throw new Error('No result for contracts module');
      }
      
      // Should NOT have UNKNOWN_WITHOUT_OPEN_QUESTION since Q-IDs are provided
      if (contractsResult.reason_codes.includes('UNKNOWN_WITHOUT_OPEN_QUESTION')) {
        throw new Error('Should NOT have UNKNOWN_WITHOUT_OPEN_QUESTION when Q-IDs are provided');
      }
    } finally {
      cleanupWorkspace(workspace);
    }
  });
  
});

// ────────────────────────────────────────────────────────────
// Test 4: Coverage Map Exists
// ────────────────────────────────────────────────────────────

describe('Coverage Map', () => {
  
  it('coverage_map.json exists and is valid', () => {
    const coverageMapPath = path.join(AXION_ROOT, 'config', 'coverage_map.json');
    
    if (!fs.existsSync(coverageMapPath)) {
      throw new Error('coverage_map.json not found');
    }
    
    const content = fs.readFileSync(coverageMapPath, 'utf-8');
    const coverageMap = JSON.parse(content);
    
    if (!coverageMap.version) {
      throw new Error('coverage_map.json missing version');
    }
    
    if (!coverageMap.blocks || typeof coverageMap.blocks !== 'object') {
      throw new Error('coverage_map.json missing blocks');
    }
    
    if (!coverageMap.core_modules || !Array.isArray(coverageMap.core_modules)) {
      throw new Error('coverage_map.json missing core_modules array');
    }
    
    // Check that all 8 core modules are listed
    for (const mod of CORE_MODULES) {
      if (!coverageMap.core_modules.includes(mod)) {
        throw new Error(`coverage_map.json missing core module: ${mod}`);
      }
    }
  });
  
  it('coverage_map.json includes TENANCY_ORG_MODEL block', () => {
    const coverageMapPath = path.join(AXION_ROOT, 'config', 'coverage_map.json');
    const coverageMap = JSON.parse(fs.readFileSync(coverageMapPath, 'utf-8'));
    
    if (!coverageMap.blocks.TENANCY_ORG_MODEL) {
      throw new Error('coverage_map.json missing TENANCY_ORG_MODEL block');
    }
    
    const block = coverageMap.blocks.TENANCY_ORG_MODEL;
    
    if (block.source !== 'RPBS') {
      throw new Error(`TENANCY_ORG_MODEL source should be RPBS, got ${block.source}`);
    }
    
    if (!Array.isArray(block.required_for) || block.required_for.length === 0) {
      throw new Error('TENANCY_ORG_MODEL missing required_for array');
    }
  });
  
});

console.log('\n' + '═'.repeat(60));
console.log('DERIVATION ENFORCEMENT TESTS COMPLETE');
console.log('═'.repeat(60) + '\n');
