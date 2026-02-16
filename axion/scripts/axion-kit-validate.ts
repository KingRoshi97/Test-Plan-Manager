#!/usr/bin/env node
/**
 * AXION Kit Validate
 * 
 * Post-package kit integrity validator. Inspects a finished kit directory
 * and validates its internal consistency before distribution.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-kit-validate.ts --kit <path>
 *   node --import tsx axion/scripts/axion-kit-validate.ts --kit <path> --strict
 *   node --import tsx axion/scripts/axion-kit-validate.ts --kit <path> --json
 *   node --import tsx axion/scripts/axion-kit-validate.ts --kit <path> --dry-run
 * 
 * Flags:
 *   --kit <path>    Path to unpacked kit directory (REQUIRED)
 *   --strict        Warnings become failures
 *   --json          JSON-only output (suppress human-readable logs)
 *   --dry-run       Preview what would be validated without running checks
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AXION_ROOT = path.resolve(__dirname, '..');

const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');
const startTime = Date.now();

interface Receipt {
  ok: boolean;
  stage: string;
  dryRun: boolean;
  errors: string[];
  warnings: string[];
  elapsedMs: number;
  result: KitValidationResult | null;
}

const receipt: Receipt = {
  ok: true,
  stage: 'kit-validate',
  dryRun,
  errors: [],
  warnings: [],
  elapsedMs: 0,
  result: null,
};

function emitOutput(): void {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    console.log(JSON.stringify(receipt, null, 2));
  } else {
    if (receipt.result) {
      console.log(JSON.stringify(receipt.result, null, 2));
    }
  }
}

type CheckStatus = 'PASS' | 'FAIL' | 'WARN';

interface DomainCheck {
  name: string;
  present: string[];
  missing: string[];
  empty_files: string[];
  unknown_count: number;
}

interface KitValidationResult {
  status: CheckStatus;
  stage: 'kit-validate';
  kit_path: string;
  checks: {
    required_structure: { status: string; present: string[]; missing: string[] };
    domain_completeness: { status: string; domains: DomainCheck[] };
    cross_references: { status: string; orphan_dirs: string[]; orphan_slugs: string[]; broken_deps: string[] };
    knowledge_index: { status: string; total_refs: number; broken_refs: string[] };
    stack_profile: { status: string; profile_id?: string; issues: string[] };
    manifest_integrity: { status: string; total_listed: number; missing_files: string[] };
  };
  summary: string;
  hint?: string[];
}

function parseArgs(): { kit: string | null; strict: boolean; json: boolean; dryRun: boolean } {
  const args = process.argv.slice(2);
  let kit: string | null = null;
  let strict = false;
  let json = false;
  let dry = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--kit' && args[i + 1]) {
      kit = args[++i];
    } else if (args[i] === '--strict') {
      strict = true;
    } else if (args[i] === '--json') {
      json = true;
    } else if (args[i] === '--dry-run') {
      dry = true;
    }
  }

  return { kit, strict, json, dryRun: dry };
}

function log(status: CheckStatus | 'INFO', message: string, jsonOnly: boolean): void {
  if (jsonOnly) return;
  const prefix: Record<string, string> = {
    PASS: '\x1b[32m[PASS]\x1b[0m',
    FAIL: '\x1b[31m[FAIL]\x1b[0m',
    WARN: '\x1b[33m[WARN]\x1b[0m',
    INFO: '\x1b[36m[INFO]\x1b[0m',
  };
  console.error(`${prefix[status]} ${message}`);
}

function safeParseJson(filePath: string): { valid: boolean; data?: any; error?: string } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return { valid: true, data };
  } catch (e: any) {
    return { valid: false, error: e.message };
  }
}

function checkRequiredStructure(kitPath: string, jsonOnly: boolean): KitValidationResult['checks']['required_structure'] {
  const required = ['domains', 'config', 'AGENT_PROMPT.md'];
  const recommended = ['knowledge'];
  const optional = ['registry', 'app'];

  const present: string[] = [];
  const missing: string[] = [];

  for (const item of required) {
    const fullPath = path.join(kitPath, item);
    if (fs.existsSync(fullPath)) {
      present.push(item);
    } else {
      missing.push(item);
    }
  }

  for (const item of [...recommended, ...optional]) {
    const fullPath = path.join(kitPath, item);
    if (fs.existsSync(fullPath)) {
      present.push(item);
    }
  }

  const status: CheckStatus = missing.length > 0 ? 'FAIL' : 'PASS';
  log(status, `Required structure: ${present.length} present, ${missing.length} missing${missing.length > 0 ? ` (${missing.join(', ')})` : ''}`, jsonOnly);

  if (!present.includes('knowledge')) {
    log('WARN', 'knowledge/ directory not found (recommended)', jsonOnly);
  }

  return { status, present, missing };
}

function checkDomainCompleteness(kitPath: string, jsonOnly: boolean): KitValidationResult['checks']['domain_completeness'] {
  const domainsPath = path.join(kitPath, 'domains');
  if (!fs.existsSync(domainsPath)) {
    return { status: 'FAIL', domains: [] };
  }

  const requiredDocTypes = ['README.md', 'DDES_', 'BELS_', 'DIM_', 'SCREENMAP_', 'TESTPLAN_'];
  const domainDirs = fs.readdirSync(domainsPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  if (domainDirs.length === 0) {
    log('WARN', 'domains/ directory is empty', jsonOnly);
    return { status: 'WARN', domains: [] };
  }

  const domains: DomainCheck[] = [];
  let hasFailure = false;
  let hasWarning = false;

  for (const slug of domainDirs) {
    const domainPath = path.join(domainsPath, slug);
    const files = fs.readdirSync(domainPath).filter(f => f.endsWith('.md'));

    const present: string[] = [];
    const missing: string[] = [];
    const emptyFiles: string[] = [];
    let unknownCount = 0;

    for (const docType of requiredDocTypes) {
      if (docType === 'README.md') {
        if (files.includes('README.md')) {
          present.push('README.md');
        } else {
          missing.push('README.md');
        }
      } else {
        const found = files.find(f => f.startsWith(docType) && f.endsWith('.md'));
        if (found) {
          present.push(found);
        } else {
          missing.push(`${docType}${slug}.md`);
        }
      }
    }

    for (const file of files) {
      const fullPath = path.join(domainPath, file);
      const stat = fs.statSync(fullPath);
      if (stat.size === 0) {
        emptyFiles.push(file);
      } else {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const matches = content.match(/UNKNOWN/g);
        if (matches) {
          unknownCount += matches.length;
        }
      }
    }

    if (missing.length > 0) hasFailure = true;
    if (unknownCount > 0) hasWarning = true;

    domains.push({ name: slug, present, missing, empty_files: emptyFiles, unknown_count: unknownCount });

    if (missing.length > 0) {
      log('FAIL', `Domain "${slug}": missing ${missing.join(', ')}`, jsonOnly);
    } else if (unknownCount > 0) {
      log('WARN', `Domain "${slug}": ${unknownCount} UNKNOWN placeholder(s)`, jsonOnly);
    } else if (emptyFiles.length > 0) {
      log('WARN', `Domain "${slug}": ${emptyFiles.length} empty file(s)`, jsonOnly);
    } else {
      log('PASS', `Domain "${slug}": complete`, jsonOnly);
    }
  }

  const status: CheckStatus = hasFailure ? 'FAIL' : hasWarning ? 'WARN' : 'PASS';
  return { status, domains };
}

function checkCrossReferences(kitPath: string, jsonOnly: boolean): KitValidationResult['checks']['cross_references'] {
  const domainsJsonPath = path.join(kitPath, 'config', 'domains.json');
  const domainsPath = path.join(kitPath, 'domains');

  if (!fs.existsSync(domainsJsonPath)) {
    log('FAIL', 'Cross-ref: config/domains.json not found', jsonOnly);
    return { status: 'FAIL', orphan_dirs: [], orphan_slugs: [], broken_deps: [] };
  }

  const parsed = safeParseJson(domainsJsonPath);
  if (!parsed.valid) {
    log('FAIL', `Cross-ref: config/domains.json parse error: ${parsed.error}`, jsonOnly);
    return { status: 'FAIL', orphan_dirs: [], orphan_slugs: [], broken_deps: [] };
  }

  const modules: Array<{ slug: string; dependencies?: string[] }> = Array.isArray(parsed.data.modules)
    ? parsed.data.modules
    : Object.keys(parsed.data.modules || {}).map(k => ({ slug: k, ...(parsed.data.modules[k] || {}) }));

  const configSlugs = new Set(modules.map(m => m.slug));

  const dirSlugs = new Set<string>();
  if (fs.existsSync(domainsPath)) {
    const dirs = fs.readdirSync(domainsPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    for (const d of dirs) dirSlugs.add(d);
  }

  const orphanDirs = [...dirSlugs].filter(d => !configSlugs.has(d));
  const orphanSlugs = [...configSlugs].filter(s => !dirSlugs.has(s));

  const brokenDeps: string[] = [];
  for (const mod of modules) {
    const deps = mod.dependencies || [];
    for (const dep of deps) {
      if (!configSlugs.has(dep)) {
        brokenDeps.push(`${mod.slug} -> ${dep}`);
      }
    }
  }

  const hasIssues = orphanDirs.length > 0 || orphanSlugs.length > 0 || brokenDeps.length > 0;
  const status: CheckStatus = hasIssues ? 'FAIL' : 'PASS';

  if (orphanDirs.length > 0) log('FAIL', `Cross-ref: orphan directories (not in domains.json): ${orphanDirs.join(', ')}`, jsonOnly);
  if (orphanSlugs.length > 0) log('FAIL', `Cross-ref: orphan slugs (no directory): ${orphanSlugs.join(', ')}`, jsonOnly);
  if (brokenDeps.length > 0) log('FAIL', `Cross-ref: broken dependencies: ${brokenDeps.join('; ')}`, jsonOnly);
  if (!hasIssues) log('PASS', `Cross-ref: ${configSlugs.size} modules consistent`, jsonOnly);

  return { status, orphan_dirs: orphanDirs, orphan_slugs: orphanSlugs, broken_deps: brokenDeps };
}

function checkKnowledgeIndex(kitPath: string, jsonOnly: boolean): KitValidationResult['checks']['knowledge_index'] {
  const indexPath = path.join(kitPath, 'knowledge', 'INDEX.md');

  if (!fs.existsSync(indexPath)) {
    log('INFO', 'Knowledge INDEX: not present (optional)', jsonOnly);
    return { status: 'PASS', total_refs: 0, broken_refs: [] };
  }

  const content = fs.readFileSync(indexPath, 'utf-8');
  const mdRefs = content.match(/[A-Za-z0-9_-]+\.md/g) || [];
  const uniqueRefs = [...new Set(mdRefs)].filter(r => r !== 'INDEX.md');

  const brokenRefs: string[] = [];
  for (const ref of uniqueRefs) {
    const refPath = path.join(kitPath, 'knowledge', ref);
    if (!fs.existsSync(refPath)) {
      brokenRefs.push(ref);
    }
  }

  const status: CheckStatus = brokenRefs.length > 0 ? 'WARN' : 'PASS';
  if (brokenRefs.length > 0) {
    log('WARN', `Knowledge INDEX: ${brokenRefs.length} broken reference(s): ${brokenRefs.join(', ')}`, jsonOnly);
  } else {
    log('PASS', `Knowledge INDEX: ${uniqueRefs.length} references valid`, jsonOnly);
  }

  return { status, total_refs: uniqueRefs.length, broken_refs: brokenRefs };
}

function checkStackProfile(kitPath: string, jsonOnly: boolean): KitValidationResult['checks']['stack_profile'] {
  const profilesPath = path.join(kitPath, 'config', 'stack_profiles.json');

  if (!fs.existsSync(profilesPath)) {
    log('INFO', 'Stack profile: not present (optional)', jsonOnly);
    return { status: 'PASS', issues: [] };
  }

  const parsed = safeParseJson(profilesPath);
  if (!parsed.valid) {
    log('WARN', `Stack profile: parse error: ${parsed.error}`, jsonOnly);
    return { status: 'WARN', issues: [`JSON parse error: ${parsed.error}`] };
  }

  const issues: string[] = [];
  let profileId: string | undefined;

  const profiles = parsed.data.profiles || parsed.data;
  const profileKeys = Object.keys(profiles).filter(k => typeof profiles[k] === 'object');

  if (profileKeys.length === 0) {
    issues.push('No profiles defined');
  } else {
    const defaultKey = profileKeys.includes('default-web-saas') ? 'default-web-saas' : profileKeys[0];
    profileId = defaultKey;
    const profile = profiles[defaultKey];

    if (!profile.frontend) issues.push(`Profile "${defaultKey}" missing frontend section`);
    if (!profile.backend) issues.push(`Profile "${defaultKey}" missing backend section`);
    if (!profile.database) issues.push(`Profile "${defaultKey}" missing database section`);
  }

  const indexPath = path.join(kitPath, 'knowledge', 'INDEX.md');
  if (fs.existsSync(indexPath) && profileId) {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    if (!indexContent.includes(profileId) && !indexContent.toLowerCase().includes('stack')) {
      issues.push('Knowledge INDEX does not reference the stack profile');
    }
  }

  const status: CheckStatus = issues.length > 0 ? 'WARN' : 'PASS';
  if (issues.length > 0) {
    log('WARN', `Stack profile: ${issues.length} issue(s): ${issues.join('; ')}`, jsonOnly);
  } else {
    log('PASS', `Stack profile: "${profileId}" valid`, jsonOnly);
  }

  return { status, profile_id: profileId, issues };
}

function checkManifestIntegrity(kitPath: string, jsonOnly: boolean): KitValidationResult['checks']['manifest_integrity'] {
  const manifestPath = path.join(kitPath, 'registry', 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    const altManifest = path.join(kitPath, 'manifest.json');
    if (!fs.existsSync(altManifest)) {
      log('INFO', 'Manifest: not present (optional)', jsonOnly);
      return { status: 'PASS', total_listed: 0, missing_files: [] };
    }
    return checkManifestFile(altManifest, kitPath, jsonOnly);
  }

  return checkManifestFile(manifestPath, kitPath, jsonOnly);
}

function checkManifestFile(manifestPath: string, kitPath: string, jsonOnly: boolean): KitValidationResult['checks']['manifest_integrity'] {
  const parsed = safeParseJson(manifestPath);
  if (!parsed.valid) {
    log('WARN', `Manifest: parse error: ${parsed.error}`, jsonOnly);
    return { status: 'WARN', total_listed: 0, missing_files: [] };
  }

  const issues: string[] = [];
  if (!parsed.data.version) issues.push('missing "version" field');
  if (!parsed.data.created_at) issues.push('missing "created_at" field');
  if (!parsed.data.files) issues.push('missing "files" field');

  const fileList: Array<{ path: string }> = Array.isArray(parsed.data.files) ? parsed.data.files : [];
  const missingFiles: string[] = [];

  for (const entry of fileList) {
    const filePath = path.join(kitPath, entry.path);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(entry.path);
    }
  }

  if (issues.length > 0) {
    log('WARN', `Manifest: ${issues.join(', ')}`, jsonOnly);
  }

  if (missingFiles.length > 0) {
    log('WARN', `Manifest: ${missingFiles.length} listed file(s) missing from kit`, jsonOnly);
  }

  const hasIssues = issues.length > 0 || missingFiles.length > 0;
  const status: CheckStatus = hasIssues ? 'WARN' : 'PASS';
  if (!hasIssues) {
    log('PASS', `Manifest: ${fileList.length} files verified`, jsonOnly);
  }

  return { status, total_listed: fileList.length, missing_files: missingFiles };
}

function resolveOverallStatus(checks: KitValidationResult['checks'], strict: boolean): CheckStatus {
  const statuses = Object.values(checks).map(c => c.status as CheckStatus);
  if (statuses.includes('FAIL')) return 'FAIL';
  if (statuses.includes('WARN')) return strict ? 'FAIL' : 'WARN';
  return 'PASS';
}

function buildSummary(result: KitValidationResult): string {
  const checkNames = Object.keys(result.checks) as Array<keyof typeof result.checks>;
  const pass = checkNames.filter(k => result.checks[k].status === 'PASS').length;
  const warn = checkNames.filter(k => result.checks[k].status === 'WARN').length;
  const fail = checkNames.filter(k => result.checks[k].status === 'FAIL').length;
  return `${pass} passed, ${warn} warnings, ${fail} failures out of ${checkNames.length} checks`;
}

function buildHints(result: KitValidationResult): string[] {
  const hints: string[] = [];

  if (result.checks.required_structure.missing.length > 0) {
    hints.push(`Missing required items: ${result.checks.required_structure.missing.join(', ')}. Re-run axion-package.`);
  }

  const incompleteDomains = result.checks.domain_completeness.domains.filter(d => d.missing.length > 0);
  if (incompleteDomains.length > 0) {
    hints.push(`${incompleteDomains.length} domain(s) have missing docs. Run axion-generate to fill gaps.`);
  }

  if (result.checks.cross_references.orphan_dirs.length > 0 || result.checks.cross_references.orphan_slugs.length > 0) {
    hints.push('Cross-reference mismatches detected. Sync domains.json with domains/ directory.');
  }

  if (result.checks.knowledge_index.broken_refs.length > 0) {
    hints.push('Knowledge INDEX has broken references. Update INDEX.md or add missing files.');
  }

  if (result.checks.manifest_integrity.missing_files.length > 0) {
    hints.push('Manifest lists files not found in kit. Re-package to regenerate manifest.');
  }

  return hints;
}

function main(): void {
  try {
    const { kit, strict, json: jsonOnly } = parseArgs();

    if (dryRun) {
      if (!jsonMode) {
        console.error('[INFO] --dry-run mode: previewing configuration only');
        console.error(`[INFO] Kit path argument: ${kit ?? '(not provided)'}`);
        console.error(`[INFO] Strict mode: ${strict}`);
        console.error(`[INFO] JSON mode: ${jsonOnly}`);
      }
      receipt.ok = true;
      receipt.result = null;
      emitOutput();
      process.exit(0);
    }

    if (!kit) {
      const errorResult: KitValidationResult = {
        status: 'FAIL',
        stage: 'kit-validate',
        kit_path: '',
        checks: {
          required_structure: { status: 'FAIL', present: [], missing: [] },
          domain_completeness: { status: 'FAIL', domains: [] },
          cross_references: { status: 'FAIL', orphan_dirs: [], orphan_slugs: [], broken_deps: [] },
          knowledge_index: { status: 'FAIL', total_refs: 0, broken_refs: [] },
          stack_profile: { status: 'FAIL', issues: ['No kit path provided'] },
          manifest_integrity: { status: 'FAIL', total_listed: 0, missing_files: [] },
        },
        summary: 'No --kit path provided',
        hint: ['Usage: node --import tsx axion/scripts/axion-kit-validate.ts --kit <path>'],
      };
      receipt.ok = false;
      receipt.errors.push('No --kit path provided');
      receipt.result = errorResult;
      emitOutput();
      process.exit(1);
    }

    const kitPath = path.resolve(kit);

    if (!fs.existsSync(kitPath)) {
      const errorResult: KitValidationResult = {
        status: 'FAIL',
        stage: 'kit-validate',
        kit_path: kitPath,
        checks: {
          required_structure: { status: 'FAIL', present: [], missing: [] },
          domain_completeness: { status: 'FAIL', domains: [] },
          cross_references: { status: 'FAIL', orphan_dirs: [], orphan_slugs: [], broken_deps: [] },
          knowledge_index: { status: 'FAIL', total_refs: 0, broken_refs: [] },
          stack_profile: { status: 'FAIL', issues: ['Kit path does not exist'] },
          manifest_integrity: { status: 'FAIL', total_listed: 0, missing_files: [] },
        },
        summary: `Kit path does not exist: ${kitPath}`,
        hint: ['Verify the --kit path points to an unpacked kit directory'],
      };
      receipt.ok = false;
      receipt.errors.push(`Kit path does not exist: ${kitPath}`);
      receipt.result = errorResult;
      emitOutput();
      process.exit(1);
    }

    log('INFO', `AXION Kit Validate`, jsonOnly);
    log('INFO', `Kit path: ${kitPath}`, jsonOnly);
    if (strict) log('INFO', 'Strict mode: warnings become failures', jsonOnly);
    if (!jsonOnly) console.error('');

    log('INFO', '--- Required Structure ---', jsonOnly);
    const requiredStructure = checkRequiredStructure(kitPath, jsonOnly);

    if (!jsonOnly) console.error('');
    log('INFO', '--- Domain Completeness ---', jsonOnly);
    const domainCompleteness = checkDomainCompleteness(kitPath, jsonOnly);

    if (!jsonOnly) console.error('');
    log('INFO', '--- Cross-Reference Validation ---', jsonOnly);
    const crossReferences = checkCrossReferences(kitPath, jsonOnly);

    if (!jsonOnly) console.error('');
    log('INFO', '--- Knowledge INDEX ---', jsonOnly);
    const knowledgeIndex = checkKnowledgeIndex(kitPath, jsonOnly);

    if (!jsonOnly) console.error('');
    log('INFO', '--- Stack Profile ---', jsonOnly);
    const stackProfile = checkStackProfile(kitPath, jsonOnly);

    if (!jsonOnly) console.error('');
    log('INFO', '--- Manifest Integrity ---', jsonOnly);
    const manifestIntegrity = checkManifestIntegrity(kitPath, jsonOnly);

    const checks = {
      required_structure: requiredStructure,
      domain_completeness: domainCompleteness,
      cross_references: crossReferences,
      knowledge_index: knowledgeIndex,
      stack_profile: stackProfile,
      manifest_integrity: manifestIntegrity,
    };

    const overallStatus = resolveOverallStatus(checks, strict);

    const result: KitValidationResult = {
      status: overallStatus,
      stage: 'kit-validate',
      kit_path: kitPath,
      checks,
      summary: '',
    };

    result.summary = buildSummary(result);
    const hints = buildHints(result);
    if (hints.length > 0) result.hint = hints;

    if (!jsonOnly) {
      console.error('');
      log(overallStatus, `Overall: ${result.summary}`, false);
      console.error('');
    }

    receipt.ok = overallStatus !== 'FAIL';
    receipt.result = result;

    if (overallStatus === 'WARN') {
      const warnMessages = Object.entries(checks)
        .filter(([, v]) => v.status === 'WARN')
        .map(([k]) => k);
      receipt.warnings.push(...warnMessages);
    }

    if (overallStatus === 'FAIL') {
      const failMessages = Object.entries(checks)
        .filter(([, v]) => v.status === 'FAIL')
        .map(([k]) => k);
      receipt.errors.push(...failMessages);
    }

    emitOutput();
    process.exit(overallStatus === 'FAIL' ? 1 : 0);
  } catch (err: any) {
    receipt.ok = false;
    receipt.errors.push(err?.message ?? String(err));
    emitOutput();
    process.exit(1);
  }
}

main();
