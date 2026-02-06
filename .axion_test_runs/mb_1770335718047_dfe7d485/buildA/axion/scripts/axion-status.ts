#!/usr/bin/env node
/**
 * AXION Status
 * 
 * Shows deterministic summary of module states from registry artifacts.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-status.ts
 *   node --import tsx axion/scripts/axion-status.ts --module backend
 *   node --import tsx axion/scripts/axion-status.ts --json
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
const REGISTRY_PATH = path.join(AXION_ROOT, 'registry');
const CONFIG_PATH = path.join(AXION_ROOT, 'config', 'domains.json');

interface StageMarkersFile {
  version: string;
  markers: Record<string, Record<string, {
    status: string;
    started_at: string;
    completed_at?: string;
  }>>;
}

interface ModuleResult {
  status: 'PASS' | 'FAIL';
  reason_codes: string[];
  hints: string[];
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
  modules: Record<string, ModuleResult>;
  seam_violations: any[];
  template_drift: TemplateDrift;
  next_commands: string[];
}

interface Config {
  canonical_order: string[];
  stages: string[];
}

interface ModuleSummary {
  module: string;
  stages: Record<string, { status: string; timestamp: string }>;
  verify: {
    status: string;
    reason_codes: string[];
  };
}

function loadConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadStageMarkers(): StageMarkersFile | null {
  const markersPath = path.join(REGISTRY_PATH, 'stage_markers.json');
  if (!fs.existsSync(markersPath)) return null;
  return JSON.parse(fs.readFileSync(markersPath, 'utf-8'));
}

function loadVerifyReport(): VerifyReport | null {
  const reportPath = path.join(REGISTRY_PATH, 'verify_report.json');
  if (!fs.existsSync(reportPath)) return null;
  return JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
}

function buildModuleSummaries(config: Config): ModuleSummary[] {
  const markers = loadStageMarkers();
  const report = loadVerifyReport();
  
  const summaries: ModuleSummary[] = [];
  
  for (const moduleSlug of config.canonical_order) {
    const stages: Record<string, { status: string; timestamp: string }> = {};
    
    if (markers && markers.markers[moduleSlug]) {
      const moduleMarkers = markers.markers[moduleSlug];
      for (const [stageName, stageData] of Object.entries(moduleMarkers)) {
        stages[stageName] = {
          status: stageData.status,
          timestamp: stageData.completed_at || stageData.started_at,
        };
      }
    }
    
    let verifyStatus = 'unknown';
    let reasonCodes: string[] = [];
    
    if (report && report.modules[moduleSlug]) {
      const moduleReport = report.modules[moduleSlug];
      verifyStatus = moduleReport.status;
      reasonCodes = moduleReport.reason_codes || [];
    }
    
    summaries.push({
      module: moduleSlug,
      stages,
      verify: {
        status: verifyStatus,
        reason_codes: reasonCodes,
      },
    });
  }
  
  return summaries;
}

function formatTable(summaries: ModuleSummary[], config: Config): string {
  const stages = config.stages || ['generate', 'seed', 'draft', 'review', 'verify', 'lock'];
  
  const header = ['Module', ...stages, 'Status', 'Reason Codes'];
  const rows: string[][] = [];
  
  for (const summary of summaries) {
    const row: string[] = [summary.module];
    
    for (const stage of stages) {
      const stageData = summary.stages[stage];
      if (stageData && stageData.status) {
        row.push(stageData.status === 'completed' ? '✓' : stageData.status.charAt(0).toUpperCase());
      } else if (stageData) {
        row.push('✓'); // Has data but no explicit status = completed
      } else {
        row.push('·');
      }
    }
    
    row.push(summary.verify.status === 'PASS' ? '✓ PASS' : summary.verify.status === 'FAIL' ? '✗ FAIL' : '?');
    row.push(summary.verify.reason_codes.length > 0 ? summary.verify.reason_codes.join(', ') : '-');
    
    rows.push(row);
  }
  
  const widths = header.map((h, i) => 
    Math.max(h.length, ...rows.map(r => r[i]?.length || 0))
  );
  
  const separator = widths.map(w => '─'.repeat(w + 2)).join('┼');
  
  let output = '\n┌' + widths.map(w => '─'.repeat(w + 2)).join('┬') + '┐\n';
  output += '│ ' + header.map((h, i) => h.padEnd(widths[i])).join(' │ ') + ' │\n';
  output += '├' + separator + '┤\n';
  
  for (const row of rows) {
    output += '│ ' + row.map((c, i) => (c || '').padEnd(widths[i])).join(' │ ') + ' │\n';
  }
  
  output += '└' + widths.map(w => '─'.repeat(w + 2)).join('┴') + '┘\n';
  
  return output;
}

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const moduleIdx = args.indexOf('--module');
  const filterModule = moduleIdx !== -1 ? args[moduleIdx + 1] : null;
  
  const config = loadConfig();
  const report = loadVerifyReport();
  let summaries = buildModuleSummaries(config);
  
  if (filterModule) {
    summaries = summaries.filter(s => s.module === filterModule);
    if (summaries.length === 0) {
      console.error(`[FAIL] Module "${filterModule}" not found`);
      process.exit(1);
    }
  }
  
  if (jsonMode) {
    const output = {
      timestamp: new Date().toISOString(),
      overall_status: report?.overall_status || 'unknown',
      template_drift: report?.template_drift || null,
      modules: summaries,
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }
  
  console.log('\n[AXION] Status Report\n');
  
  if (report) {
    console.log(`Overall: ${report.overall_status === 'PASS' ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Last verify: ${report.generated_at}`);
    
    if (report.template_drift) {
      const drift = report.template_drift;
      console.log(`Template drift: ${drift.status} (revision: ${drift.current_revision})`);
      if (drift.changes.modified.length > 0) {
        console.log(`  Modified: ${drift.changes.modified.length} templates`);
      }
    }
  } else {
    console.log('Overall: ? (no verify report found)');
  }
  
  console.log(formatTable(summaries, config));
  
  if (report?.seam_violations && report.seam_violations.length > 0) {
    console.log(`\nSeam violations: ${report.seam_violations.length}`);
    for (const v of report.seam_violations.slice(0, 5)) {
      console.log(`  - ${v.module}: ${v.reason_code} (${v.seam})`);
    }
    if (report.seam_violations.length > 5) {
      console.log(`  ... and ${report.seam_violations.length - 5} more`);
    }
  }
}

main();
