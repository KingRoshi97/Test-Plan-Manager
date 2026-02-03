/**
 * AXION Schema Regression Tests
 * 
 * Validates the verify_report.json contract to prevent schema drift.
 */

import { describe, it } from '../helpers/test-runner.js';
import { expect } from '../helpers/test-utils.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_PATH = path.resolve(__dirname, '../../registry');

interface ModuleStatus {
  module: string;
  status: string;
  reason_codes: string[];
  hints: string[];
}

interface SeamViolation {
  module: string;
  seam: string;
  reason_code: string;
  file: string;
  line?: number;
  fix_action: string;
}

interface TemplateDrift {
  status: 'PASS' | 'FAIL';
  current_revision: number;
  changes: {
    added: string[];
    removed: string[];
    modified: string[];
  };
}

interface VerifyReport {
  overall_status: 'PASS' | 'FAIL';
  generated_at: string;
  modules: Record<string, ModuleStatus>;
  seam_violations: SeamViolation[];
  template_drift: TemplateDrift;
  next_commands: string[];
}

function loadVerifyReport(): VerifyReport | null {
  const reportPath = path.join(REGISTRY_PATH, 'verify_report.json');
  if (!fs.existsSync(reportPath)) return null;
  return JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
}

function validateModuleStatus(module: any): string[] {
  const errors: string[] = [];
  
  if (typeof module.module !== 'string') {
    errors.push('module.module must be string');
  }
  if (typeof module.status !== 'string') {
    errors.push('module.status must be string');
  }
  if (!Array.isArray(module.reason_codes)) {
    errors.push('module.reason_codes must be array');
  }
  if (!Array.isArray(module.hints)) {
    errors.push('module.hints must be array');
  }
  
  return errors;
}

function validateSeamViolation(violation: any): string[] {
  const errors: string[] = [];
  
  if (typeof violation.module !== 'string') {
    errors.push('violation.module must be string');
  }
  if (typeof violation.seam !== 'string') {
    errors.push('violation.seam must be string');
  }
  if (typeof violation.reason_code !== 'string') {
    errors.push('violation.reason_code must be string');
  }
  if (typeof violation.file !== 'string') {
    errors.push('violation.file must be string');
  }
  if (typeof violation.fix_action !== 'string') {
    errors.push('violation.fix_action must be string');
  }
  
  return errors;
}

function validateTemplateDrift(drift: any): string[] {
  const errors: string[] = [];
  
  if (drift.status !== 'PASS' && drift.status !== 'FAIL') {
    errors.push('drift.status must be PASS or FAIL');
  }
  if (typeof drift.revision !== 'string') {
    errors.push('drift.revision must be string');
  }
  if (!drift.changes || typeof drift.changes !== 'object') {
    errors.push('drift.changes must be object');
  } else {
    if (!Array.isArray(drift.changes.added)) {
      errors.push('drift.changes.added must be array');
    }
    if (!Array.isArray(drift.changes.removed)) {
      errors.push('drift.changes.removed must be array');
    }
    if (!Array.isArray(drift.changes.modified)) {
      errors.push('drift.changes.modified must be array');
    }
  }
  
  return errors;
}

function validateVerifyReport(report: any): string[] {
  const errors: string[] = [];
  
  if (report.overall_status !== 'PASS' && report.overall_status !== 'FAIL') {
    errors.push('overall_status must be PASS or FAIL');
  }
  
  if (typeof report.generated_at !== 'string') {
    errors.push('generated_at must be string');
  }
  
  if (!report.modules || typeof report.modules !== 'object') {
    errors.push('modules must be object (Record)');
  } else {
    for (const [slug, module] of Object.entries(report.modules)) {
      const moduleErrors = validateModuleStatus(module);
      errors.push(...moduleErrors.map(e => `modules[${slug}]: ${e}`));
    }
  }
  
  if (!Array.isArray(report.seam_violations)) {
    errors.push('seam_violations must be array');
  } else {
    for (let i = 0; i < report.seam_violations.length; i++) {
      const violationErrors = validateSeamViolation(report.seam_violations[i]);
      errors.push(...violationErrors.map(e => `seam_violations[${i}]: ${e}`));
    }
  }
  
  if (!report.template_drift || typeof report.template_drift !== 'object') {
    errors.push('template_drift must be object');
  } else {
    const driftErrors = validateTemplateDrift(report.template_drift);
    errors.push(...driftErrors.map(e => `template_drift: ${e}`));
  }
  
  if (!Array.isArray(report.next_commands)) {
    errors.push('next_commands must be array');
  }
  
  return errors;
}

describe('AXION Schema Regression Tests', () => {
  it('verify_report.json schema is valid when present', () => {
    const report = loadVerifyReport();
    
    if (!report) {
      return;
    }
    
    const errors = validateVerifyReport(report);
    if (errors.length > 0) {
      throw new Error(`Schema validation failed:\n${errors.join('\n')}`);
    }
  });
  
  it('overall_status must be PASS or FAIL only', () => {
    const report = loadVerifyReport();
    if (!report) return;
    
    expect(['PASS', 'FAIL'].includes(report.overall_status)).toBe(true);
  });
  
  it('modules record must have status + reason_codes + hints', () => {
    const report = loadVerifyReport();
    if (!report) return;
    
    for (const module of Object.values(report.modules)) {
      expect(typeof module.status).toBe('string');
      expect(Array.isArray(module.reason_codes)).toBe(true);
      expect(Array.isArray(module.hints)).toBe(true);
    }
  });
  
  it('template_drift.changes must have added/removed/modified arrays', () => {
    const report = loadVerifyReport();
    if (!report) return;
    
    expect(report.template_drift).toBeTruthy();
    expect(Array.isArray(report.template_drift.changes.added)).toBe(true);
    expect(Array.isArray(report.template_drift.changes.removed)).toBe(true);
    expect(Array.isArray(report.template_drift.changes.modified)).toBe(true);
  });
  
  it('seam_violations must include required fields', () => {
    const report = loadVerifyReport();
    if (!report) return;
    
    for (const violation of report.seam_violations) {
      expect(typeof violation.module).toBe('string');
      expect(typeof violation.seam).toBe('string');
      expect(typeof violation.reason_code).toBe('string');
      expect(typeof violation.file).toBe('string');
      expect(typeof violation.fix_action).toBe('string');
    }
  });
  
  it('next_commands must be array of strings', () => {
    const report = loadVerifyReport();
    if (!report) return;
    
    expect(Array.isArray(report.next_commands)).toBe(true);
    for (const cmd of report.next_commands) {
      expect(typeof cmd).toBe('string');
    }
  });
});
