#!/usr/bin/env node
/**
 * AXION Next
 * 
 * Reads verify_report.json and outputs next recommended actions.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-next.ts
 *   node --import tsx axion/scripts/axion-next.ts --json
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
const REPORT_PATH = path.join(AXION_ROOT, 'registry', 'verify_report.json');

interface ModuleResult {
  status: 'PASS' | 'FAIL';
  reason_codes: string[];
  hints: string[];
}

interface VerifyReport {
  overall_status: 'PASS' | 'FAIL';
  generated_at: string;
  next_commands: string[];
  modules: Record<string, ModuleResult>;
  seam_violations: Array<{
    module: string;
    seam: string;
    reason_code: string;
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
}

function loadVerifyReport(): VerifyReport | null {
  if (!fs.existsSync(REPORT_PATH)) return null;
  return JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'));
}

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  
  const report = loadVerifyReport();
  
  if (!report) {
    if (jsonMode) {
      console.log(JSON.stringify({
        status: 'unknown',
        message: 'No verify report found. Run axion-verify first.',
        next_commands: ['node axion/scripts/axion-verify.mjs --all'],
      }, null, 2));
    } else {
      console.log('\n[AXION] Next Steps\n');
      console.log('[?] No verify report found');
      console.log('\nRun verify first:');
      console.log('  node axion/scripts/axion-verify.mjs --all');
    }
    process.exit(1);
  }
  
  if (jsonMode) {
    const failingModulesCount = Object.values(report.modules).filter(m => m.status === 'FAIL').length;
    const output = {
      status: report.overall_status,
      generated_at: report.generated_at,
      next_commands: report.next_commands,
      summary: {
        modules_failing: failingModulesCount,
        seam_violations: report.seam_violations.length,
        template_drift: report.template_drift.status,
      },
    };
    console.log(JSON.stringify(output, null, 2));
    process.exit(report.overall_status === 'PASS' ? 0 : 1);
  }
  
  console.log('\n[AXION] Next Steps\n');
  
  if (report.overall_status === 'PASS') {
    console.log('[PASS] All verifications passed\n');
    console.log('No action required. You can proceed to lock if ready:');
    console.log('  node --import tsx axion/scripts/axion-run.ts --preset system --plan release\n');
    process.exit(0);
  }
  
  console.log('[FAIL] Verification failed\n');
  
  const failingModules = Object.entries(report.modules)
    .filter(([_, m]) => m.status === 'FAIL')
    .map(([slug, m]) => ({ slug, ...m }));
  if (failingModules.length > 0) {
    console.log(`Modules failing: ${failingModules.length}`);
    for (const m of failingModules) {
      console.log(`  - ${m.slug}: ${m.reason_codes.join(', ')}`);
    }
    console.log('');
  }
  
  if (report.seam_violations.length > 0) {
    console.log(`Seam violations: ${report.seam_violations.length}`);
    for (const v of report.seam_violations.slice(0, 3)) {
      console.log(`  - ${v.module}/${v.seam}: ${v.reason_code}`);
    }
    if (report.seam_violations.length > 3) {
      console.log(`  ... and ${report.seam_violations.length - 3} more`);
    }
    console.log('');
  }
  
  if (report.template_drift.status === 'FAIL') {
    const changes = report.template_drift.changes;
    const totalChanges = changes.added.length + changes.removed.length + changes.modified.length;
    console.log(`Template drift: ${totalChanges} changes detected`);
    if (changes.modified.length > 0) {
      console.log(`  Modified: ${changes.modified.slice(0, 3).join(', ')}${changes.modified.length > 3 ? '...' : ''}`);
    }
    console.log('');
  }
  
  console.log('Next commands:');
  for (const cmd of report.next_commands) {
    console.log(`  ${cmd}`);
  }
  console.log('');
  
  process.exit(1);
}

main();
