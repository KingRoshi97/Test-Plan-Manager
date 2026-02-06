#!/usr/bin/env node
/**
 * AXION Build Executor
 * 
 * Executes a build plan into code by generating a deterministic manifest of file operations,
 * then optionally applying them to the workspace.
 * 
 * Two modes:
 *   --dry-run          Emit manifest JSON to stdout (no writes)
 *   --apply --manifest <path>  Apply ops from manifest, write build_exec_report.json
 * 
 * Gates:
 *   - lock_manifest.json must exist (DOCS_NOT_LOCKED)
 *   - verify_report.json must have status PASS (VERIFY_NOT_PASSED)
 * 
 * Guards:
 *   - All target_path must resolve within workspace (TARGET_OUTSIDE_WORKSPACE)
 *   - No duplicate target_path across ops (DUPLICATE_TARGET)
 *   - Patch anchors must exist in target file (ANCHOR_NOT_FOUND)
 * 
 * Usage:
 *   npx tsx axion/scripts/axion-build-exec.ts --dry-run --build-root <path> --project-name <name> [--json]
 *   npx tsx axion/scripts/axion-build-exec.ts --apply --manifest <path> --build-root <path> --project-name <name> [--json]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { writeJsonAtomic } from '../lib/atomic-writer.js';

interface BuildExecOptions {
  buildRoot: string;
  projectName: string;
  dryRun: boolean;
  apply: boolean;
  manifestPath: string;
  jsonOutput: boolean;
}

interface BuildExecResult {
  status: 'success' | 'failed' | 'blocked_by';
  stage: string;
  manifest_path?: string;
  report_path?: string;
  ops_count?: number;
  dry_run?: boolean;
  reason_codes?: string[];
  hint?: string[];
  summary?: {
    attempted: number;
    succeeded: number;
    failed: number;
  };
}

interface ManifestOp {
  op_id: string;
  type: 'create_file' | 'patch_file';
  target_path: string;
  content?: string;
  encoding?: string;
  overwrite?: boolean;
  anchor?: {
    type: 'marker';
    value: string;
    occurrence: number;
  };
  patch?: {
    mode: 'insert_after';
    content: string;
  };
}

interface BuildExecManifest {
  version: string;
  generated_at: string;
  producer: { script: string; revision: number };
  workspace_root: string;
  project_name: string;
  stack_profile: string;
  source_plan: {
    path: string;
    hash: string;
  };
  ops: ManifestOp[];
}

interface OpResult {
  op_id: string;
  type: string;
  target_path: string;
  status: 'SUCCESS' | 'FAILED';
  reason_code: string | null;
  details: string;
  before_hash: string | null;
  after_hash: string | null;
}

interface BuildExecReport {
  version: string;
  generated_at: string;
  producer: { script: string; revision: number };
  workspace_root: string;
  project_name: string;
  stack_profile: string;
  dry_run: boolean;
  duration_ms: number;
  summary: {
    attempted: number;
    succeeded: number;
    failed: number;
  };
  ops: OpResult[];
}

interface BuildPlan {
  generated_at: string;
  project_name: string;
  version: string;
  phases: string[];
  tasks: BuildTask[];
  total_tasks: number;
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
}

function parseArgs(args: string[]): BuildExecOptions {
  const options: BuildExecOptions = {
    buildRoot: process.cwd(),
    projectName: '',
    dryRun: false,
    apply: false,
    manifestPath: '',
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
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--apply':
        options.apply = true;
        break;
      case '--manifest':
        options.manifestPath = args[++i] || '';
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
    console.error(msg);
  }
}

function sha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
}

function detectStackProfile(workspaceRoot: string): string {
  const archReadme = path.join(workspaceRoot, 'domains', 'architecture', 'README.md');
  if (fs.existsSync(archReadme)) {
    const content = fs.readFileSync(archReadme, 'utf-8');
    const match = content.match(/stack profile:\s*\*\*([^*]+)\*\*/i);
    if (match) return match[1].trim();
  }
  return 'default-web-saas';
}

function isPathWithinWorkspace(workspaceRoot: string, targetPath: string): boolean {
  const resolvedWorkspace = path.resolve(workspaceRoot);
  const resolvedTarget = path.resolve(workspaceRoot, targetPath);
  const prefix = resolvedWorkspace + path.sep;
  return resolvedTarget === resolvedWorkspace || resolvedTarget.startsWith(prefix);
}

function generateManifestFromPlan(
  workspaceRoot: string,
  projectName: string,
  stackProfile: string,
  plan: BuildPlan,
  planPath: string,
): BuildExecManifest {
  const planContent = fs.readFileSync(planPath, 'utf-8');
  const ops: ManifestOp[] = [];
  let opCounter = 1;

  for (const task of plan.tasks) {
    for (const filePath of task.files_to_create) {
      const opId = `op_${String(opCounter).padStart(3, '0')}`;
      opCounter++;

      ops.push({
        op_id: opId,
        type: 'create_file',
        target_path: filePath,
        content: generateStubContent(filePath, task),
        encoding: 'utf-8',
        overwrite: false,
      });
    }
  }

  return {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    producer: { script: 'axion-build-exec', revision: 1 },
    workspace_root: path.resolve(workspaceRoot),
    project_name: projectName,
    stack_profile: stackProfile,
    source_plan: {
      path: path.relative(workspaceRoot, planPath),
      hash: sha256(planContent),
    },
    ops,
  };
}

function generateStubContent(filePath: string, task: BuildTask): string {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath, ext);

  switch (ext) {
    case '.ts':
    case '.tsx':
      return [
        `// Generated by AXION build-exec`,
        `// Task: ${task.title}`,
        `// Module: ${task.source_module}`,
        `// Phase: ${task.phase}`,
        ``,
        `// TODO: Implement ${basename}`,
        `export {};`,
        ``,
      ].join('\n');
    case '.json':
      return JSON.stringify(
        {
          _generated_by: 'axion-build-exec',
          _task: task.title,
          _module: task.source_module,
        },
        null,
        2,
      );
    default:
      return [
        `# Generated by AXION build-exec`,
        `# Task: ${task.title}`,
        `# Module: ${task.source_module}`,
        ``,
      ].join('\n');
  }
}

function validateManifest(
  manifest: BuildExecManifest,
): { valid: boolean; reason_code?: string; details?: string } {
  const seenPaths = new Set<string>();

  for (const op of manifest.ops) {
    if (!isPathWithinWorkspace(manifest.workspace_root, op.target_path)) {
      return {
        valid: false,
        reason_code: 'TARGET_OUTSIDE_WORKSPACE',
        details: `Op ${op.op_id}: target_path '${op.target_path}' resolves outside workspace`,
      };
    }

    if (seenPaths.has(op.target_path)) {
      return {
        valid: false,
        reason_code: 'DUPLICATE_TARGET',
        details: `Op ${op.op_id}: target_path '${op.target_path}' already targeted by another op`,
      };
    }
    seenPaths.add(op.target_path);
  }

  return { valid: true };
}

function executeOp(op: ManifestOp, workspaceRoot: string): OpResult {
  const absoluteTarget = path.resolve(workspaceRoot, op.target_path);

  if (!isPathWithinWorkspace(workspaceRoot, op.target_path)) {
    return {
      op_id: op.op_id,
      type: op.type,
      target_path: op.target_path,
      status: 'FAILED',
      reason_code: 'TARGET_OUTSIDE_WORKSPACE',
      details: `Resolved path is outside workspace`,
      before_hash: null,
      after_hash: null,
    };
  }

  if (op.type === 'create_file') {
    return executeCreateFile(op, absoluteTarget);
  } else if (op.type === 'patch_file') {
    return executePatchFile(op, absoluteTarget);
  }

  return {
    op_id: op.op_id,
    type: op.type,
    target_path: op.target_path,
    status: 'FAILED',
    reason_code: 'UNKNOWN_OP_TYPE',
    details: `Unknown operation type: ${op.type}`,
    before_hash: null,
    after_hash: null,
  };
}

function executeCreateFile(op: ManifestOp, absoluteTarget: string): OpResult {
  const beforeHash = fs.existsSync(absoluteTarget)
    ? sha256(fs.readFileSync(absoluteTarget, 'utf-8'))
    : null;

  if (fs.existsSync(absoluteTarget) && !op.overwrite) {
    return {
      op_id: op.op_id,
      type: op.type,
      target_path: op.target_path,
      status: 'FAILED',
      reason_code: 'FILE_EXISTS',
      details: `File already exists and overwrite=false`,
      before_hash: beforeHash,
      after_hash: beforeHash,
    };
  }

  const dir = path.dirname(absoluteTarget);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = op.content || '';
  fs.writeFileSync(absoluteTarget, content, op.encoding as BufferEncoding || 'utf-8');

  return {
    op_id: op.op_id,
    type: op.type,
    target_path: op.target_path,
    status: 'SUCCESS',
    reason_code: null,
    details: `Created file (${content.length} bytes)`,
    before_hash: beforeHash,
    after_hash: sha256(content),
  };
}

function executePatchFile(op: ManifestOp, absoluteTarget: string): OpResult {
  if (!fs.existsSync(absoluteTarget)) {
    return {
      op_id: op.op_id,
      type: op.type,
      target_path: op.target_path,
      status: 'FAILED',
      reason_code: 'FILE_NOT_FOUND',
      details: `Target file does not exist for patching`,
      before_hash: null,
      after_hash: null,
    };
  }

  if (!op.anchor || !op.patch) {
    return {
      op_id: op.op_id,
      type: op.type,
      target_path: op.target_path,
      status: 'FAILED',
      reason_code: 'INVALID_PATCH_OP',
      details: `patch_file requires anchor and patch fields`,
      before_hash: null,
      after_hash: null,
    };
  }

  const originalContent = fs.readFileSync(absoluteTarget, 'utf-8');
  const beforeHash = sha256(originalContent);

  const marker = op.anchor.value;
  const occurrence = op.anchor.occurrence || 1;

  let matchIndex = -1;
  let searchStart = 0;
  for (let i = 0; i < occurrence; i++) {
    matchIndex = originalContent.indexOf(marker, searchStart);
    if (matchIndex === -1) break;
    searchStart = matchIndex + marker.length;
  }

  if (matchIndex === -1) {
    return {
      op_id: op.op_id,
      type: op.type,
      target_path: op.target_path,
      status: 'FAILED',
      reason_code: 'ANCHOR_NOT_FOUND',
      details: `Marker '${marker}' occurrence ${occurrence} not found`,
      before_hash: beforeHash,
      after_hash: null,
    };
  }

  const insertPoint = matchIndex + marker.length;
  const newContent =
    originalContent.slice(0, insertPoint) +
    op.patch.content +
    originalContent.slice(insertPoint);

  fs.writeFileSync(absoluteTarget, newContent, 'utf-8');

  return {
    op_id: op.op_id,
    type: op.type,
    target_path: op.target_path,
    status: 'SUCCESS',
    reason_code: null,
    details: `Patched after marker (occurrence ${occurrence})`,
    before_hash: beforeHash,
    after_hash: sha256(newContent),
  };
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  log('\n[AXION] Build Executor\n', options.jsonOutput);

  if (!options.projectName) {
    const result: BuildExecResult = {
      status: 'failed',
      stage: 'build-exec',
      reason_codes: ['PROJECT_NAME_MISSING'],
      hint: ['Provide --project-name <name> to specify the project workspace'],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  if (!options.dryRun && !options.apply) {
    const result: BuildExecResult = {
      status: 'failed',
      stage: 'build-exec',
      reason_codes: ['MODE_NOT_SPECIFIED'],
      hint: ['Specify --dry-run or --apply'],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const buildRoot = path.resolve(options.buildRoot);
  const projectName = options.projectName;
  const workspaceRoot = path.join(buildRoot, projectName);

  log(`[INFO] Build root: ${buildRoot}`, options.jsonOutput);
  log(`[INFO] Project name: ${projectName}`, options.jsonOutput);
  log(`[INFO] Workspace: ${workspaceRoot}`, options.jsonOutput);

  if (!fs.existsSync(workspaceRoot)) {
    const result: BuildExecResult = {
      status: 'failed',
      stage: 'build-exec',
      reason_codes: ['WORKSPACE_NOT_FOUND'],
      hint: [`Workspace not found at ${workspaceRoot}`, 'Run kit-create and scaffold-app first'],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const lockManifestPath = path.join(workspaceRoot, 'registry', 'lock_manifest.json');
  if (!fs.existsSync(lockManifestPath)) {
    const result: BuildExecResult = {
      status: 'blocked_by',
      stage: 'build-exec',
      reason_codes: ['DOCS_NOT_LOCKED'],
      hint: [
        'Documentation must be locked before executing build',
        'Run docs pipeline to completion, then lock',
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const verifyReportPath = path.join(workspaceRoot, 'registry', 'verify_report.json');
  if (!fs.existsSync(verifyReportPath)) {
    const result: BuildExecResult = {
      status: 'blocked_by',
      stage: 'build-exec',
      reason_codes: ['VERIFY_NOT_PASSED'],
      hint: [
        'Verification report not found',
        'Run verify to produce verify_report.json with PASS status',
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const verifyReport = JSON.parse(fs.readFileSync(verifyReportPath, 'utf-8'));
  if (verifyReport.overall_status !== 'PASS' && verifyReport.status !== 'PASS') {
    const result: BuildExecResult = {
      status: 'blocked_by',
      stage: 'build-exec',
      reason_codes: ['VERIFY_NOT_PASSED'],
      hint: [
        `Verification status: ${verifyReport.overall_status || verifyReport.status}`,
        'All modules must pass verification before build execution',
      ],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  log('[INFO] Pre-flight gates passed (docs locked, verify PASS)', options.jsonOutput);

  const stackProfile = detectStackProfile(workspaceRoot);
  log(`[INFO] Stack profile: ${stackProfile}`, options.jsonOutput);

  if (options.dryRun) {
    handleDryRun(workspaceRoot, projectName, stackProfile, options);
  } else if (options.apply) {
    handleApply(workspaceRoot, projectName, stackProfile, options);
  }
}

function handleDryRun(
  workspaceRoot: string,
  projectName: string,
  stackProfile: string,
  options: BuildExecOptions,
): void {
  const planPath = path.join(workspaceRoot, 'registry', 'build_plan.json');

  if (!fs.existsSync(planPath)) {
    const result: BuildExecResult = {
      status: 'failed',
      stage: 'build-exec',
      reason_codes: ['BUILD_PLAN_NOT_FOUND'],
      hint: ['Run build-plan to generate build_plan.json first'],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const plan: BuildPlan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));
  log(`[INFO] Build plan loaded: ${plan.total_tasks} tasks`, options.jsonOutput);

  const manifest = generateManifestFromPlan(workspaceRoot, projectName, stackProfile, plan, planPath);

  const validation = validateManifest(manifest);
  if (!validation.valid) {
    const result: BuildExecResult = {
      status: 'failed',
      stage: 'build-exec',
      reason_codes: [validation.reason_code!],
      hint: [validation.details!],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  log(`[INFO] Manifest generated: ${manifest.ops.length} ops`, options.jsonOutput);
  log('[PASS] Dry run complete - manifest emitted to stdout\n', options.jsonOutput);

  console.log(JSON.stringify(manifest, null, 2));
}

function handleApply(
  workspaceRoot: string,
  projectName: string,
  stackProfile: string,
  options: BuildExecOptions,
): void {
  let manifest: BuildExecManifest;

  if (options.manifestPath) {
    const absManifestPath = path.resolve(options.manifestPath);
    if (!fs.existsSync(absManifestPath)) {
      const result: BuildExecResult = {
        status: 'failed',
        stage: 'build-exec',
        reason_codes: ['MANIFEST_NOT_FOUND'],
        hint: [`Manifest file not found at ${absManifestPath}`],
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }
    manifest = JSON.parse(fs.readFileSync(absManifestPath, 'utf-8'));
  } else {
    const planPath = path.join(workspaceRoot, 'registry', 'build_plan.json');
    if (!fs.existsSync(planPath)) {
      const result: BuildExecResult = {
        status: 'failed',
        stage: 'build-exec',
        reason_codes: ['BUILD_PLAN_NOT_FOUND'],
        hint: ['Provide --manifest <path> or ensure build_plan.json exists'],
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }
    const plan: BuildPlan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));
    manifest = generateManifestFromPlan(workspaceRoot, projectName, stackProfile, plan, planPath);
  }

  manifest.workspace_root = path.resolve(workspaceRoot);

  const validation = validateManifest(manifest);
  if (!validation.valid) {
    const result: BuildExecResult = {
      status: 'failed',
      stage: 'build-exec',
      reason_codes: [validation.reason_code!],
      hint: [validation.details!],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  log(`[INFO] Applying ${manifest.ops.length} ops`, options.jsonOutput);

  const startTime = Date.now();
  const opResults: OpResult[] = [];

  for (const op of manifest.ops) {
    const result = executeOp(op, manifest.workspace_root);
    opResults.push(result);
    const icon = result.status === 'SUCCESS' ? 'OK' : 'FAIL';
    log(`  [${icon}] ${op.op_id}: ${op.type} → ${op.target_path}`, options.jsonOutput);
  }

  const duration = Date.now() - startTime;
  const succeeded = opResults.filter(r => r.status === 'SUCCESS').length;
  const failed = opResults.filter(r => r.status === 'FAILED').length;

  const report: BuildExecReport = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    producer: { script: 'axion-build-exec', revision: 1 },
    workspace_root: manifest.workspace_root,
    project_name: manifest.project_name,
    stack_profile: manifest.stack_profile,
    dry_run: false,
    duration_ms: duration,
    summary: {
      attempted: opResults.length,
      succeeded,
      failed,
    },
    ops: opResults,
  };

  const reportPath = path.join(manifest.workspace_root, 'registry', 'build_exec_report.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  writeJsonAtomic(reportPath, report);

  log(`\n[INFO] Report written to: ${reportPath}`, options.jsonOutput);
  log(`[INFO] Results: ${succeeded} succeeded, ${failed} failed, ${duration}ms`, options.jsonOutput);

  if (failed > 0) {
    log('[WARN] Some operations failed - check report for details\n', options.jsonOutput);
  } else {
    log('[PASS] All operations applied successfully\n', options.jsonOutput);
  }

  const result: BuildExecResult = {
    status: failed > 0 ? 'failed' : 'success',
    stage: 'build-exec',
    report_path: reportPath,
    ops_count: opResults.length,
    summary: {
      attempted: opResults.length,
      succeeded,
      failed,
    },
  };

  console.log(JSON.stringify(result, null, 2));

  if (failed > 0) {
    process.exit(1);
  }
}

main();
