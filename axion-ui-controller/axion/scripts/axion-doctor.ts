#!/usr/bin/env node
/**
 * AXION Doctor Script
 * 
 * Validates workspace integrity: configs, templates, registry, schemas.
 * Run before/after upgrades and as a diagnostic tool.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-doctor.ts
 *   node --import tsx axion/scripts/axion-doctor.ts --fix
 *   node --import tsx axion/scripts/axion-doctor.ts --json
 */

import * as fs from 'fs';
import * as path from 'path';

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  fix_action?: string;
}

interface DoctorReport {
  timestamp: string;
  overall_status: 'HEALTHY' | 'NEEDS_ATTENTION' | 'BROKEN';
  checks: CheckResult[];
  summary: {
    pass: number;
    warn: number;
    fail: number;
  };
}

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const autoFix = args.includes('--fix');

function checkDomainsJson(): CheckResult {
  const configPath = path.join(AXION_ROOT, 'config', 'domains.json');
  
  if (!fs.existsSync(configPath)) {
    return {
      name: 'domains.json exists',
      status: 'FAIL',
      message: 'config/domains.json not found',
      fix_action: 'Run axion-init to create workspace',
    };
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    if (!config.modules || !Array.isArray(config.modules)) {
      return {
        name: 'domains.json structure',
        status: 'FAIL',
        message: 'Missing or invalid modules array',
      };
    }
    
    if (!config.canonical_order || !Array.isArray(config.canonical_order)) {
      return {
        name: 'domains.json structure',
        status: 'WARN',
        message: 'Missing canonical_order array',
      };
    }
    
    const slugs = new Set(config.modules.map((m: any) => m.slug));
    for (const slug of config.canonical_order) {
      if (!slugs.has(slug)) {
        return {
          name: 'domains.json consistency',
          status: 'FAIL',
          message: `canonical_order references unknown module: ${slug}`,
        };
      }
    }
    
    const deps = new Map<string, string[]>();
    for (const mod of config.modules) {
      deps.set(mod.slug, mod.dependencies || []);
    }
    
    for (const [slug, depList] of deps) {
      for (const dep of depList) {
        if (!slugs.has(dep)) {
          return {
            name: 'domains.json dependencies',
            status: 'FAIL',
            message: `Module ${slug} depends on unknown module: ${dep}`,
          };
        }
      }
    }
    
    return {
      name: 'domains.json',
      status: 'PASS',
      message: `Valid config with ${config.modules.length} modules`,
    };
  } catch (e) {
    return {
      name: 'domains.json parse',
      status: 'FAIL',
      message: `Parse error: ${e}`,
    };
  }
}

function checkPresetsJson(): CheckResult {
  const configPath = path.join(AXION_ROOT, 'config', 'presets.json');
  
  if (!fs.existsSync(configPath)) {
    return {
      name: 'presets.json exists',
      status: 'WARN',
      message: 'config/presets.json not found',
    };
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    if (!config.presets || typeof config.presets !== 'object') {
      return {
        name: 'presets.json structure',
        status: 'FAIL',
        message: 'Missing or invalid presets object',
      };
    }
    
    return {
      name: 'presets.json',
      status: 'PASS',
      message: `Valid config with ${Object.keys(config.presets).length} presets`,
    };
  } catch (e) {
    return {
      name: 'presets.json parse',
      status: 'FAIL',
      message: `Parse error: ${e}`,
    };
  }
}

function checkSeamsJson(): CheckResult {
  const seamsPath = path.join(AXION_ROOT, 'registry', 'seams.json');
  
  if (!fs.existsSync(seamsPath)) {
    return {
      name: 'seams.json exists',
      status: 'PASS',
      message: 'seams.json not present (optional)',
    };
  }
  
  try {
    const seams = JSON.parse(fs.readFileSync(seamsPath, 'utf-8'));
    
    if (!seams.seams || typeof seams.seams !== 'object') {
      return {
        name: 'seams.json structure',
        status: 'FAIL',
        message: 'Missing or invalid seams object',
      };
    }
    
    return {
      name: 'seams.json',
      status: 'PASS',
      message: `Valid with ${Object.keys(seams.seams).length} seams defined`,
    };
  } catch (e) {
    return {
      name: 'seams.json parse',
      status: 'FAIL',
      message: `Parse error: ${e}`,
    };
  }
}

function checkTemplateMarkers(): CheckResult {
  const templatesDir = path.join(AXION_ROOT, 'templates');
  
  if (!fs.existsSync(templatesDir)) {
    return {
      name: 'templates directory',
      status: 'WARN',
      message: 'templates/ directory not found',
    };
  }
  
  function scanTemplates(dir: string): string[] {
    const templates: string[] = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          templates.push(...scanTemplates(fullPath));
        } else if (entry.name.endsWith('.template.md')) {
          templates.push(fullPath);
        }
      }
    } catch {
    }
    return templates;
  }
  
  const templates = scanTemplates(templatesDir);
  let missing = 0;
  
  for (const templatePath of templates) {
    const content = fs.readFileSync(templatePath, 'utf-8');
    if (!content.includes('AXION:TEMPLATE_CONTRACT:v1') || !content.includes('AXION:MODULE:')) {
      missing++;
    }
  }
  
  if (missing > 0) {
    return {
      name: 'template markers',
      status: 'WARN',
      message: `${missing} of ${templates.length} templates missing canonical markers`,
      fix_action: 'Add AXION:TEMPLATE_CONTRACT:v1 and AXION:MODULE markers',
    };
  }
  
  return {
    name: 'template markers',
    status: 'PASS',
    message: `All ${templates.length} templates have canonical markers`,
  };
}

function checkRegistrySchemas(): CheckResult {
  const registryDir = path.join(AXION_ROOT, 'registry');
  
  if (!fs.existsSync(registryDir)) {
    return {
      name: 'registry directory',
      status: 'FAIL',
      message: 'registry/ directory not found',
      fix_action: 'Run axion-init or axion-upgrade',
    };
  }
  
  const issues: string[] = [];
  
  const markersPath = path.join(registryDir, 'stage_markers.json');
  if (fs.existsSync(markersPath)) {
    try {
      const markers = JSON.parse(fs.readFileSync(markersPath, 'utf-8'));
      if (!markers.version || !markers.markers) {
        issues.push('stage_markers.json missing version or markers field');
      }
    } catch {
      issues.push('stage_markers.json parse error');
    }
  }
  
  const reportPath = path.join(registryDir, 'verify_report.json');
  if (fs.existsSync(reportPath)) {
    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      if (!report.generated_at) {
        issues.push('verify_report.json uses deprecated timestamp field');
      }
      if (!report.modules || typeof report.modules !== 'object') {
        issues.push('verify_report.json has invalid modules structure');
      }
    } catch {
      issues.push('verify_report.json parse error');
    }
  }
  
  if (issues.length > 0) {
    return {
      name: 'registry schemas',
      status: 'WARN',
      message: issues.join('; '),
    };
  }
  
  return {
    name: 'registry schemas',
    status: 'PASS',
    message: 'Registry files follow expected schema',
  };
}

function checkSystemVersion(): CheckResult {
  const versionPath = path.join(AXION_ROOT, 'registry', 'system_version.json');
  
  if (!fs.existsSync(versionPath)) {
    return {
      name: 'system version',
      status: 'WARN',
      message: 'system_version.json not found',
      fix_action: 'Run axion-upgrade to initialize',
    };
  }
  
  try {
    const version = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
    return {
      name: 'system version',
      status: 'PASS',
      message: `AXION ${version.axion_version}, ${version.upgrade_count} upgrade(s) applied`,
    };
  } catch (e) {
    return {
      name: 'system version parse',
      status: 'FAIL',
      message: `Parse error: ${e}`,
    };
  }
}

function checkDirectoryStructure(): CheckResult {
  const requiredDirs = ['config', 'registry'];
  const optionalDirs = ['templates', 'domains', 'source_docs', 'migrations'];
  
  const missing: string[] = [];
  const present: string[] = [];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(AXION_ROOT, dir);
    if (!fs.existsSync(dirPath)) {
      missing.push(dir);
    } else {
      present.push(dir);
    }
  }
  
  for (const dir of optionalDirs) {
    const dirPath = path.join(AXION_ROOT, dir);
    if (fs.existsSync(dirPath)) {
      present.push(dir);
    }
  }
  
  if (missing.length > 0) {
    return {
      name: 'directory structure',
      status: 'FAIL',
      message: `Missing required directories: ${missing.join(', ')}`,
      fix_action: 'Run axion-init to create workspace',
    };
  }
  
  return {
    name: 'directory structure',
    status: 'PASS',
    message: `${present.length} directories present`,
  };
}

function main(): void {
  if (!jsonOutput) {
    console.log('\n[AXION] Doctor - Workspace Health Check\n');
  }
  
  const checks: CheckResult[] = [
    checkDirectoryStructure(),
    checkDomainsJson(),
    checkPresetsJson(),
    checkSeamsJson(),
    checkTemplateMarkers(),
    checkRegistrySchemas(),
    checkSystemVersion(),
  ];
  
  const summary = {
    pass: checks.filter(c => c.status === 'PASS').length,
    warn: checks.filter(c => c.status === 'WARN').length,
    fail: checks.filter(c => c.status === 'FAIL').length,
  };
  
  let overallStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'BROKEN';
  if (summary.fail > 0) {
    overallStatus = 'BROKEN';
  } else if (summary.warn > 0) {
    overallStatus = 'NEEDS_ATTENTION';
  } else {
    overallStatus = 'HEALTHY';
  }
  
  const report: DoctorReport = {
    timestamp: new Date().toISOString(),
    overall_status: overallStatus,
    checks,
    summary,
  };
  
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    for (const check of checks) {
      const icon = check.status === 'PASS' ? '[PASS]' : check.status === 'WARN' ? '[WARN]' : '[FAIL]';
      console.log(`${icon} ${check.name}: ${check.message}`);
      if (check.fix_action) {
        console.log(`       Fix: ${check.fix_action}`);
      }
    }
    
    console.log('\n────────────────────────────────────────');
    console.log(`Overall: ${overallStatus}`);
    console.log(`  ${summary.pass} passed, ${summary.warn} warnings, ${summary.fail} failed`);
    console.log('');
  }
  
  process.exit(summary.fail > 0 ? 1 : 0);
}

main();
