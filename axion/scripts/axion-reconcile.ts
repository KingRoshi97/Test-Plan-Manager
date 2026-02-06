#!/usr/bin/env node
/**
 * AXION Reconcile v1
 *
 * Deterministic comparison of imported facts against build-authoritative outputs.
 * Compares import_facts.json against stack_profile.json + build_plan.json to
 * detect drift and produce actionable mismatch reports.
 *
 * Inputs (required):
 *   registry/import_facts.json      (import truth snapshot)
 *   registry/stack_profile.json     (current intended stack)
 *   registry/build_plan.json        (what AXION intends to implement)
 *
 * Optional metadata (not required):
 *   registry/verify_report.json     (docs verification status)
 *   registry/lock_manifest.json     (docs lock status)
 *
 * Output:
 *   registry/reconcile_report.json  (versioned, atomic write)
 *
 * Safety:
 *   - Only writes to registry/ inside workspace
 *   - Atomic writes via tmp + rename
 *
 * Usage:
 *   npx tsx axion/scripts/axion-reconcile.ts --build-root <path> --project-name <name>
 *   npx tsx axion/scripts/axion-reconcile.ts --build-root <path> --project-name <name> --json
 */

import * as fs from 'fs';
import * as path from 'path';
import { writeJsonAtomic } from '../lib/atomic-writer.js';

interface ReconcileOptions {
  buildRoot: string;
  projectName: string;
  jsonOutput: boolean;
}

interface ReconcileResult {
  status: 'success' | 'failed' | 'blocked_by';
  stage: 'reconcile';
  workspace_root?: string;
  report_path?: string;
  summary?: {
    mismatches: number;
    critical: number;
    warning: number;
    info: number;
  };
  reason_codes?: string[];
  hint?: string[];
}

type MismatchCategory = 'STACK_ID' | 'ENTRYPOINTS' | 'HEALTH_ENDPOINT' | 'ROUTES' | 'DEPENDENCIES';
type MismatchSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

interface Mismatch {
  id: string;
  category: MismatchCategory;
  severity: MismatchSeverity;
  imported_value: unknown;
  expected_value: unknown;
  reason_code: string;
  suggested_action: string;
  hints: string[];
}

interface ReconcileReport {
  version: string;
  generated_at: string;
  producer: { script: string; revision: number };
  status: 'PASS' | 'FAIL';
  workspace_root: string;
  metadata: {
    docs_locked: boolean;
    docs_verified: boolean;
  };
  summary: {
    mismatches: number;
    critical: number;
    warning: number;
    info: number;
  };
  mismatches: Mismatch[];
  next_commands: string[];
}

interface ImportFacts {
  version: string;
  generated_at: string;
  stack_id_candidate: string;
  app_dir_candidate: string | null;
  server_entry_candidate: string | null;
  health_path_candidate: string | null;
  anchor_targets: Array<{ target_path: string; anchors: string[] }>;
}

interface StackProfileConventions {
  app_dir: string;
  server_entry: string;
  health_path: string;
  anchors: Record<string, string>;
}

interface StackProfile {
  stack_id: string;
  conventions: StackProfileConventions;
  [key: string]: unknown;
}

interface BuildTask {
  id: string;
  phase: string;
  title: string;
  description: string;
  source_module: string;
  dependencies: string[];
  files_to_create: string[];
  acceptance_criteria: string[];
  status: string;
  kind?: string;
  route?: { method: string; path: string };
}

interface BuildPlan {
  generated_at: string;
  project_name: string;
  stack_id: string;
  version: string;
  phases: string[];
  tasks: BuildTask[];
  total_tasks: number;
}

function parseArgs(args: string[]): ReconcileOptions {
  const options: ReconcileOptions = {
    buildRoot: process.cwd(),
    projectName: '',
    jsonOutput: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--build-root':
        options.buildRoot = args[++i] || options.buildRoot;
        break;
      case '--project-name':
        options.projectName = args[++i] || '';
        break;
      case '--json':
        options.jsonOutput = true;
        break;
    }
  }

  return options;
}

function log(msg: string, jsonOutput: boolean): void {
  if (!jsonOutput) {
    console.log(msg);
  }
}

function loadJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function reconcileStackId(
  facts: ImportFacts,
  profile: StackProfile,
  mismatches: Mismatch[],
  counter: { value: number },
): void {
  if (facts.stack_id_candidate !== profile.stack_id) {
    mismatches.push({
      id: `STACK_ID_${String(counter.value++).padStart(3, '0')}`,
      category: 'STACK_ID',
      severity: 'CRITICAL',
      imported_value: { stack_id: facts.stack_id_candidate },
      expected_value: { stack_id: profile.stack_id },
      reason_code: 'STACK_ID_MISMATCH',
      suggested_action: 'Update stack_profile.json to match imported stack, or re-run import with correct source.',
      hints: [
        `Imported: ${facts.stack_id_candidate}`,
        `Expected: ${profile.stack_id}`,
        'If the source changed, re-run: npx tsx axion/scripts/axion-import.ts',
        'If the profile is wrong, update registry/stack_profile.json',
      ],
    });
  }
}

function reconcileEntrypoints(
  facts: ImportFacts,
  profile: StackProfile,
  mismatches: Mismatch[],
  counter: { value: number },
): void {
  const importedEntry = facts.server_entry_candidate;
  const expectedEntry = profile.conventions?.server_entry;

  if (importedEntry && expectedEntry && importedEntry !== expectedEntry) {
    mismatches.push({
      id: `ENTRYPOINTS_${String(counter.value++).padStart(3, '0')}`,
      category: 'ENTRYPOINTS',
      severity: 'CRITICAL',
      imported_value: { server_entry: importedEntry },
      expected_value: { server_entry: expectedEntry },
      reason_code: 'SERVER_ENTRY_MISMATCH',
      suggested_action: 'Align server entry in stack profile with actual source entry point.',
      hints: [
        `Imported entry: ${importedEntry}`,
        `Profile entry: ${expectedEntry}`,
        'Update stack_profile.json conventions.server_entry or restructure source',
      ],
    });
  }

  if (importedEntry && !expectedEntry) {
    mismatches.push({
      id: `ENTRYPOINTS_${String(counter.value++).padStart(3, '0')}`,
      category: 'ENTRYPOINTS',
      severity: 'WARNING',
      imported_value: { server_entry: importedEntry },
      expected_value: { server_entry: null },
      reason_code: 'SERVER_ENTRY_NOT_IN_PROFILE',
      suggested_action: 'Add server_entry to stack profile conventions.',
      hints: [
        `Imported entry: ${importedEntry}`,
        'Profile has no server_entry convention defined',
      ],
    });
  }
}

function reconcileHealth(
  facts: ImportFacts,
  profile: StackProfile,
  mismatches: Mismatch[],
  counter: { value: number },
): void {
  const importedHealth = facts.health_path_candidate;
  const expectedHealth = profile.conventions?.health_path;

  if (importedHealth && expectedHealth && importedHealth !== expectedHealth) {
    mismatches.push({
      id: `HEALTH_ENDPOINT_${String(counter.value++).padStart(3, '0')}`,
      category: 'HEALTH_ENDPOINT',
      severity: 'CRITICAL',
      imported_value: { health_path: importedHealth },
      expected_value: { health_path: expectedHealth },
      reason_code: 'HEALTH_PATH_MISMATCH',
      suggested_action: 'Align health endpoint path in stack profile with source.',
      hints: [
        `Imported: ${importedHealth}`,
        `Expected: ${expectedHealth}`,
        'Update stack_profile.json conventions.health_path',
      ],
    });
  }

  if (!importedHealth && expectedHealth) {
    mismatches.push({
      id: `HEALTH_ENDPOINT_${String(counter.value++).padStart(3, '0')}`,
      category: 'HEALTH_ENDPOINT',
      severity: 'WARNING',
      imported_value: { health_path: null },
      expected_value: { health_path: expectedHealth },
      reason_code: 'HEALTH_PATH_NOT_FOUND_IN_SOURCE',
      suggested_action: 'Add a health endpoint to the source, or remove health_path from profile.',
      hints: [
        `Expected health path: ${expectedHealth}`,
        'No health endpoint was detected during import',
      ],
    });
  }
}

function reconcileRoutes(
  facts: ImportFacts,
  plan: BuildPlan,
  reportData: { routes?: Array<{ method: string; path: string }> } | null,
  mismatches: Mismatch[],
  counter: { value: number },
): void {
  const routeTasks = plan.tasks.filter(t => t.kind === 'route' && t.route);

  if (routeTasks.length === 0) {
    mismatches.push({
      id: `ROUTES_${String(counter.value++).padStart(3, '0')}`,
      category: 'ROUTES',
      severity: 'INFO',
      imported_value: { note: 'Routes detected in import' },
      expected_value: { note: 'No route-tagged tasks in build plan' },
      reason_code: 'ROUTES_NOT_AVAILABLE_IN_PLAN',
      suggested_action: 'Add kind: "route" and route: {method, path} to build plan tasks for route comparison.',
      hints: [
        'Build plan tasks do not include route metadata (kind: "route")',
        'Route reconciliation requires route-tagged tasks in build_plan.json',
        'This is informational only and does not indicate a problem',
      ],
    });
    return;
  }

  const plannedRoutes = new Set(
    routeTasks.map(t => `${t.route!.method.toUpperCase()}:${t.route!.path}`)
  );

  if (reportData?.routes) {
    const importedRoutes = new Set(
      reportData.routes.map(r => `${r.method.toUpperCase()}:${r.path}`)
    );

    for (const route of importedRoutes) {
      if (!plannedRoutes.has(route)) {
        const [method, routePath] = route.split(':');
        mismatches.push({
          id: `ROUTES_${String(counter.value++).padStart(3, '0')}`,
          category: 'ROUTES',
          severity: 'WARNING',
          imported_value: { method, path: routePath, source: 'import' },
          expected_value: { present_in_plan: false },
          reason_code: 'ROUTE_FOUND_NOT_PLANNED',
          suggested_action: 'Add route to contracts + build-plan tasks, or mark as deprecated in docs.',
          hints: [
            `Route ${method} ${routePath} exists in source but not in build plan`,
            'Run: npx tsx axion/scripts/axion-build-plan.ts --regen',
          ],
        });
      }
    }

    for (const route of plannedRoutes) {
      if (!importedRoutes.has(route)) {
        const [method, routePath] = route.split(':');
        mismatches.push({
          id: `ROUTES_${String(counter.value++).padStart(3, '0')}`,
          category: 'ROUTES',
          severity: 'WARNING',
          imported_value: { present_in_source: false },
          expected_value: { method, path: routePath, source: 'plan' },
          reason_code: 'ROUTE_PLANNED_NOT_FOUND',
          suggested_action: 'Implement route in source, or remove from build plan if no longer needed.',
          hints: [
            `Route ${method} ${routePath} is in build plan but not found in source`,
          ],
        });
      }
    }
  }
}

function reconcileDependencies(
  facts: ImportFacts,
  profile: StackProfile,
  reportData: { deps?: Record<string, string> } | null,
  mismatches: Mismatch[],
  counter: { value: number },
): void {
  const profileAny = profile as Record<string, unknown>;
  const frontend = profileAny.frontend as Record<string, string> | undefined;
  const backend = profileAny.backend as Record<string, string> | undefined;

  const expectedFrameworks: string[] = [];
  if (frontend?.framework) expectedFrameworks.push(frontend.framework.toLowerCase());
  if (backend?.framework) expectedFrameworks.push(backend.framework.toLowerCase());
  if (backend?.runtime) expectedFrameworks.push(backend.runtime.toLowerCase());

  if (expectedFrameworks.length === 0 || !reportData?.deps) {
    return;
  }

  const importedDeps = Object.keys(reportData.deps).map(d => d.toLowerCase());

  for (const expected of expectedFrameworks) {
    const found = importedDeps.some(d => d.includes(expected) || expected.includes(d));
    if (!found) {
      mismatches.push({
        id: `DEPENDENCIES_${String(counter.value++).padStart(3, '0')}`,
        category: 'DEPENDENCIES',
        severity: 'INFO',
        imported_value: { detected_deps: importedDeps.slice(0, 10) },
        expected_value: { expected_framework: expected },
        reason_code: 'DEPENDENCY_EXPECTED_NOT_FOUND',
        suggested_action: 'Verify the stack profile matches the actual dependencies in the source project.',
        hints: [
          `Expected framework/runtime "${expected}" not found in imported dependencies`,
          'This is informational and may indicate a profile mismatch',
        ],
      });
    }
  }
}

function buildNextCommands(mismatches: Mismatch[]): string[] {
  const commands: string[] = [];
  const hasRouteIssues = mismatches.some(m => m.category === 'ROUTES' && m.severity !== 'INFO');
  const hasStackIssues = mismatches.some(m => m.category === 'STACK_ID');

  if (hasStackIssues) {
    commands.push('npx tsx axion/scripts/axion-scaffold-app.ts --build-root <path> --project-name <name>');
  }
  if (hasRouteIssues) {
    commands.push('npx tsx axion/scripts/axion-build-plan.ts --build-root <path> --project-name <name>');
  }
  if (mismatches.some(m => m.severity === 'CRITICAL')) {
    commands.push('npx tsx axion/scripts/axion-build-exec.ts --dry-run --build-root <path> --project-name <name>');
  }

  return commands;
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  log('\n[AXION] Reconcile\n', options.jsonOutput);

  if (!options.projectName) {
    const result: ReconcileResult = {
      status: 'failed',
      stage: 'reconcile',
      reason_codes: ['PROJECT_NAME_MISSING'],
      hint: ['Provide --project-name <name> to specify the project workspace'],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const buildRoot = path.resolve(options.buildRoot);
  const workspaceRoot = path.join(buildRoot, options.projectName);

  if (!fs.existsSync(workspaceRoot)) {
    const result: ReconcileResult = {
      status: 'failed',
      stage: 'reconcile',
      reason_codes: ['WORKSPACE_NOT_FOUND'],
      hint: [
        `Workspace not found at ${workspaceRoot}`,
        'Run kit-create first to initialize the workspace',
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const registryDir = path.join(workspaceRoot, 'registry');

  const factsPath = path.join(registryDir, 'import_facts.json');
  if (!fs.existsSync(factsPath)) {
    const result: ReconcileResult = {
      status: 'blocked_by',
      stage: 'reconcile',
      reason_codes: ['MISSING_IMPORT_FACTS'],
      hint: [
        `import_facts.json not found at ${factsPath}`,
        `Run: npx tsx axion/scripts/axion-import.ts --source-root <path> --build-root ${buildRoot} --project-name ${options.projectName}`,
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const profilePath = path.join(registryDir, 'stack_profile.json');
  if (!fs.existsSync(profilePath)) {
    const result: ReconcileResult = {
      status: 'blocked_by',
      stage: 'reconcile',
      reason_codes: ['MISSING_STACK_PROFILE'],
      hint: [
        `stack_profile.json not found at ${profilePath}`,
        `Run: npx tsx axion/scripts/axion-scaffold-app.ts --build-root ${buildRoot} --project-name ${options.projectName}`,
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const planPath = path.join(registryDir, 'build_plan.json');
  if (!fs.existsSync(planPath)) {
    const result: ReconcileResult = {
      status: 'blocked_by',
      stage: 'reconcile',
      reason_codes: ['MISSING_BUILD_PLAN'],
      hint: [
        `build_plan.json not found at ${planPath}`,
        `Run: npx tsx axion/scripts/axion-build-plan.ts --build-root ${buildRoot} --project-name ${options.projectName}`,
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const facts = loadJson<ImportFacts>(factsPath);
  const profile = loadJson<StackProfile>(profilePath);
  const plan = loadJson<BuildPlan>(planPath);

  if (!facts || !profile || !plan) {
    const result: ReconcileResult = {
      status: 'failed',
      stage: 'reconcile',
      reason_codes: ['CORRUPT_INPUT_ARTIFACTS'],
      hint: ['One or more input files could not be parsed as valid JSON'],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  log(`[INFO] Build root: ${buildRoot}`, options.jsonOutput);
  log(`[INFO] Workspace: ${workspaceRoot}`, options.jsonOutput);
  log(`[INFO] Stack profile: ${profile.stack_id}`, options.jsonOutput);
  log(`[INFO] Import facts: stack=${facts.stack_id_candidate}`, options.jsonOutput);
  log(`[INFO] Build plan: ${plan.total_tasks} tasks`, options.jsonOutput);

  const docsLocked = fs.existsSync(path.join(registryDir, 'lock_manifest.json'));
  const docsVerified = fs.existsSync(path.join(registryDir, 'verify_report.json'));

  const reportPath = path.join(registryDir, 'import_report.json');
  let reportData: { routes?: Array<{ method: string; path: string }>; deps?: Record<string, string> } | null = null;

  if (fs.existsSync(reportPath)) {
    try {
      const rawReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      reportData = {
        routes: rawReport.detections?.routes,
        deps: rawReport.signals?.package_json_found
          ? (() => {
              try {
                const pkgPath = rawReport.source_root
                  ? path.join(rawReport.source_root, 'package.json')
                  : null;
                if (pkgPath && fs.existsSync(pkgPath)) {
                  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
                  return { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
                }
              } catch { /* ignore */ }
              return undefined;
            })()
          : undefined,
      };
    } catch { /* ignore parse errors */ }
  }

  const mismatches: Mismatch[] = [];
  const counter = { value: 1 };

  reconcileStackId(facts, profile, mismatches, counter);
  reconcileEntrypoints(facts, profile, mismatches, counter);
  reconcileHealth(facts, profile, mismatches, counter);
  reconcileRoutes(facts, plan, reportData, mismatches, counter);
  reconcileDependencies(facts, profile, reportData, mismatches, counter);

  const critical = mismatches.filter(m => m.severity === 'CRITICAL').length;
  const warning = mismatches.filter(m => m.severity === 'WARNING').length;
  const info = mismatches.filter(m => m.severity === 'INFO').length;

  const report: ReconcileReport = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    producer: { script: 'axion-reconcile', revision: 1 },
    status: critical > 0 ? 'FAIL' : 'PASS',
    workspace_root: workspaceRoot,
    metadata: {
      docs_locked: docsLocked,
      docs_verified: docsVerified,
    },
    summary: {
      mismatches: mismatches.length,
      critical,
      warning,
      info,
    },
    mismatches,
    next_commands: buildNextCommands(mismatches),
  };

  const reconcileReportPath = path.join(registryDir, 'reconcile_report.json');
  writeJsonAtomic(reconcileReportPath, report);

  log(`\n[INFO] Reconcile report written to: ${reconcileReportPath}`, options.jsonOutput);
  log(`[INFO] Status: ${report.status}`, options.jsonOutput);
  log(`[INFO] Mismatches: ${mismatches.length} (${critical} critical, ${warning} warning, ${info} info)`, options.jsonOutput);

  if (report.status === 'PASS') {
    log('\n[PASS] Reconcile completed - no critical mismatches\n', options.jsonOutput);
  } else {
    log('\n[FAIL] Reconcile completed - critical mismatches found\n', options.jsonOutput);
  }

  const result: ReconcileResult = {
    status: 'success',
    stage: 'reconcile',
    workspace_root: workspaceRoot,
    report_path: reconcileReportPath,
    summary: report.summary,
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
