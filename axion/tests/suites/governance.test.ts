/**
 * AXION Governance Tests
 * 
 * Tests seam verification, template hashing, and verify_report.json output.
 * Uses fixture workspaces that intentionally trigger specific violations.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, ExecSyncOptions } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface VerifyReport {
  generated_at: string;
  overall_status: 'PASS' | 'FAIL';
  modules: Record<string, any>;
  seam_violations: Array<{
    module: string;
    seam: string;
    reason_code: string;
    description: string;
    file: string;
    line?: number;
    fix_action: string;
  }>;
  template_drift: {
    status: 'PASS' | 'FAIL';
    current_revision: number;
    changes: {
      added: string[];
      removed: string[];
      modified: string[];
    };
  };
  next_commands: string[];
}

function runVerify(workspace: string): CommandResult {
  const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'axion-verify.ts');
  const fullCommand = `node --import tsx ${scriptPath} --all`;
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
// Tests
// ────────────────────────────────────────────────────────────

describe('Seam Ownership Violations', () => {
  
  it('SEAM_OWNER_VIOLATION: non-owner defines seam content', () => {
    const workspace = path.join(__dirname, '..', 'fixtures', 'seam-violations', 'owner-violation');
    const result = runVerify(workspace);
    
    if (result.exitCode === 0) {
      throw new Error('Expected verify to fail with exit code 1');
    }
    
    const report = loadReport(workspace);
    if (!report) throw new Error('verify_report.json not generated');
    
    if (report.overall_status !== 'FAIL') {
      throw new Error(`Expected overall_status=FAIL, got ${report.overall_status}`);
    }
    
    const ownerViolation = report.seam_violations.find(v => v.reason_code === 'SEAM_OWNER_VIOLATION');
    if (!ownerViolation) {
      throw new Error('Expected SEAM_OWNER_VIOLATION in seam_violations');
    }
    
    if (ownerViolation.module !== 'backend') {
      throw new Error(`Expected module=backend, got ${ownerViolation.module}`);
    }
    
    if (ownerViolation.seam !== 'error_model') {
      throw new Error(`Expected seam=error_model, got ${ownerViolation.seam}`);
    }
    
    if (!ownerViolation.file.includes('backend')) {
      throw new Error(`Expected file to contain 'backend', got ${ownerViolation.file}`);
    }
    
    if (typeof ownerViolation.line !== 'number') {
      throw new Error('Expected line number in violation');
    }
  });
  
  it('SEAM_MISSING_LINK: module references seam without link', () => {
    const workspace = path.join(__dirname, '..', 'fixtures', 'seam-violations', 'missing-link');
    const result = runVerify(workspace);
    
    if (result.exitCode === 0) {
      throw new Error('Expected verify to fail with exit code 1');
    }
    
    const report = loadReport(workspace);
    if (!report) throw new Error('verify_report.json not generated');
    
    const missingLink = report.seam_violations.find(v => v.reason_code === 'SEAM_MISSING_LINK');
    if (!missingLink) {
      throw new Error('Expected SEAM_MISSING_LINK in seam_violations');
    }
    
    if (missingLink.module !== 'backend') {
      throw new Error(`Expected module=backend, got ${missingLink.module}`);
    }
    
    if (!missingLink.fix_action.includes('link')) {
      throw new Error('Expected fix_action to mention linking');
    }
  });
  
  it('SEAM_DUPLICATE_DEFINITION: same definition in owner and non-owner', () => {
    const workspace = path.join(__dirname, '..', 'fixtures', 'seam-violations', 'duplicate-definition');
    const result = runVerify(workspace);
    
    if (result.exitCode === 0) {
      throw new Error('Expected verify to fail with exit code 1');
    }
    
    const report = loadReport(workspace);
    if (!report) throw new Error('verify_report.json not generated');
    
    const duplicate = report.seam_violations.find(v => v.reason_code === 'SEAM_DUPLICATE_DEFINITION');
    if (!duplicate) {
      throw new Error('Expected SEAM_DUPLICATE_DEFINITION in seam_violations');
    }
    
    if (duplicate.module !== 'backend') {
      throw new Error(`Expected module=backend, got ${duplicate.module}`);
    }
    
    if (!duplicate.fix_action.includes('Remove')) {
      throw new Error('Expected fix_action to mention removing duplicate');
    }
  });
  
});

describe('Template Drift Detection', () => {
  
  it('template_drift FAIL when hash mismatch detected', () => {
    const workspace = path.join(__dirname, '..', 'fixtures', 'seam-violations', 'template-drift');
    const result = runVerify(workspace);
    
    if (result.exitCode === 0) {
      throw new Error('Expected verify to fail with exit code 1');
    }
    
    const report = loadReport(workspace);
    if (!report) throw new Error('verify_report.json not generated');
    
    if (report.template_drift.status !== 'FAIL') {
      throw new Error(`Expected template_drift.status=FAIL, got ${report.template_drift.status}`);
    }
    
    const hasChanges = 
      report.template_drift.changes.modified.length > 0 ||
      report.template_drift.changes.added.length > 0 ||
      report.template_drift.changes.removed.length > 0;
    
    if (!hasChanges) {
      throw new Error('Expected drift changes to be non-empty');
    }
  });
  
});

describe('Verify Report Structure', () => {
  
  it('verify_report.json contains all required fields', () => {
    const workspace = path.join(__dirname, '..', 'fixtures', 'seam-violations', 'owner-violation');
    runVerify(workspace);
    
    const report = loadReport(workspace);
    if (!report) throw new Error('verify_report.json not generated');
    
    const requiredFields = ['generated_at', 'overall_status', 'modules', 'seam_violations', 'template_drift', 'next_commands'];
    for (const field of requiredFields) {
      if (!(field in report)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if (!Array.isArray(report.seam_violations)) {
      throw new Error('seam_violations should be an array');
    }
    
    if (!Array.isArray(report.next_commands)) {
      throw new Error('next_commands should be an array');
    }
    
    if (typeof report.template_drift !== 'object') {
      throw new Error('template_drift should be an object');
    }
  });
  
  it('next_commands includes repair hints when violations exist', () => {
    const workspace = path.join(__dirname, '..', 'fixtures', 'seam-violations', 'owner-violation');
    runVerify(workspace);
    
    const report = loadReport(workspace);
    if (!report) throw new Error('verify_report.json not generated');
    
    if (report.seam_violations.length === 0) {
      throw new Error('Expected seam violations for this test');
    }
    
    const hasSeamRepairCommand = report.next_commands.some(cmd => cmd.includes('repair') && cmd.includes('seam'));
    if (!hasSeamRepairCommand) {
      throw new Error('Expected next_commands to include seam repair hint');
    }
  });
  
});

console.log('\n' + '═'.repeat(60));
console.log('GOVERNANCE TESTS COMPLETE');
console.log('═'.repeat(60) + '\n');
