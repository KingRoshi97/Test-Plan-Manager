import { join } from "node:path";
import { existsSync, mkdirSync, rmSync, readdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { ensureDir, writeJson, readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type {
  BuildManifest,
  RepoManifest,
  VerificationReport,
  BuildPlan,
  BuildState,
  BuildRequest,
  FileInventoryEntry,
} from "./types.js";
import { generateBuildId } from "./types.js";

export interface WorkspaceStatus {
  exists: boolean;
  buildId?: string;
  runId: string;
  paths: WorkspacePaths;
  hasRepo: boolean;
  hasBuildManifest: boolean;
  hasRepoManifest: boolean;
  hasVerificationReport: boolean;
  hasBuildPlan: boolean;
  hasFileIndex: boolean;
  hasExportZip: boolean;
}

export interface WorkspacePaths {
  root: string;
  repo: string;
  buildManifest: string;
  repoManifest: string;
  verificationReport: string;
  buildPlan: string;
  fileIndex: string;
  exportZip: string;
}

function getRunDir(baseDir: string, runId: string): string {
  return join(baseDir, ".axion", "runs", runId);
}

function getBuildRoot(baseDir: string, runId: string): string {
  return join(getRunDir(baseDir, runId), "build");
}

function getWorkspacePaths(baseDir: string, runId: string): WorkspacePaths {
  const root = getBuildRoot(baseDir, runId);
  return {
    root,
    repo: join(root, "repo"),
    buildManifest: join(root, "build_manifest.json"),
    repoManifest: join(root, "repo_manifest.json"),
    verificationReport: join(root, "verification_report.json"),
    buildPlan: join(root, "build_plan.json"),
    fileIndex: join(root, "file_index.json"),
    exportZip: join(root, "project_repo.zip"),
  };
}

export function initWorkspace(baseDir: string, runId: string): { buildId: string; paths: WorkspacePaths } {
  const runDir = getRunDir(baseDir, runId);
  if (!existsSync(runDir)) {
    throw new Error(`Run directory does not exist: ${runDir}`);
  }

  const paths = getWorkspacePaths(baseDir, runId);

  if (existsSync(paths.root)) {
    rmSync(paths.root, { recursive: true, force: true });
  }

  ensureDir(paths.root);
  ensureDir(paths.repo);

  const buildId = generateBuildId();

  return { buildId, paths };
}

export function cleanupWorkspace(baseDir: string, runId: string): void {
  const paths = getWorkspacePaths(baseDir, runId);
  if (existsSync(paths.root)) {
    rmSync(paths.root, { recursive: true, force: true });
  }
}

export function getWorkspaceStatus(baseDir: string, runId: string): WorkspaceStatus {
  const paths = getWorkspacePaths(baseDir, runId);
  const rootExists = existsSync(paths.root);

  let buildId: string | undefined;
  if (rootExists && existsSync(paths.buildManifest)) {
    try {
      const manifest = readJson<BuildManifest>(paths.buildManifest);
      buildId = manifest.buildId;
    } catch {}
  }

  return {
    exists: rootExists,
    buildId,
    runId,
    paths,
    hasRepo: existsSync(paths.repo),
    hasBuildManifest: existsSync(paths.buildManifest),
    hasRepoManifest: existsSync(paths.repoManifest),
    hasVerificationReport: existsSync(paths.verificationReport),
    hasBuildPlan: existsSync(paths.buildPlan),
    hasFileIndex: existsSync(paths.fileIndex),
    hasExportZip: existsSync(paths.exportZip),
  };
}

export function ensureRepoSubdir(paths: WorkspacePaths, relativePath: string): void {
  const fullPath = join(paths.repo, relativePath);
  ensureDir(fullPath);
}

export function writeRepoFile(paths: WorkspacePaths, relativePath: string, content: string): void {
  const fullPath = join(paths.repo, relativePath);
  ensureDir(join(fullPath, ".."));
  writeFileSync(fullPath, content, "utf-8");
}

export function readRepoFile(paths: WorkspacePaths, relativePath: string): string | null {
  const fullPath = join(paths.repo, relativePath);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, "utf-8");
}

export function writeBuildManifest(paths: WorkspacePaths, manifest: BuildManifest): void {
  writeJson(paths.buildManifest, manifest);
}

export function readBuildManifest(paths: WorkspacePaths): BuildManifest | null {
  if (!existsSync(paths.buildManifest)) return null;
  return readJson<BuildManifest>(paths.buildManifest);
}

export function writeRepoManifest(paths: WorkspacePaths, manifest: RepoManifest): void {
  writeJson(paths.repoManifest, manifest);
}

export function readRepoManifest(paths: WorkspacePaths): RepoManifest | null {
  if (!existsSync(paths.repoManifest)) return null;
  return readJson<RepoManifest>(paths.repoManifest);
}

export function writeVerificationReport(paths: WorkspacePaths, report: VerificationReport): void {
  writeJson(paths.verificationReport, report);
}

export function readVerificationReport(paths: WorkspacePaths): VerificationReport | null {
  if (!existsSync(paths.verificationReport)) return null;
  return readJson<VerificationReport>(paths.verificationReport);
}

export function writeBuildPlan(paths: WorkspacePaths, plan: BuildPlan): void {
  writeJson(paths.buildPlan, plan);
}

export function readBuildPlan(paths: WorkspacePaths): BuildPlan | null {
  if (!existsSync(paths.buildPlan)) return null;
  return readJson<BuildPlan>(paths.buildPlan);
}

export function writeFileIndex(paths: WorkspacePaths, entries: FileInventoryEntry[]): void {
  writeJson(paths.fileIndex, { generatedAt: isoNow(), files: entries });
}

export function readFileIndex(paths: WorkspacePaths): { generatedAt: string; files: FileInventoryEntry[] } | null {
  if (!existsSync(paths.fileIndex)) return null;
  return readJson<{ generatedAt: string; files: FileInventoryEntry[] }>(paths.fileIndex);
}

function collectFiles(dir: string, base: string): { relativePath: string; sizeBytes: number }[] {
  const results: { relativePath: string; sizeBytes: number }[] = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = join(base, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, relPath));
    } else if (entry.isFile()) {
      const stat = statSync(fullPath);
      results.push({ relativePath: relPath, sizeBytes: stat.size });
    }
  }
  return results;
}

export function listRepoFiles(paths: WorkspacePaths): { relativePath: string; sizeBytes: number }[] {
  return collectFiles(paths.repo, "");
}

export function getRepoDirectories(paths: WorkspacePaths): string[] {
  const dirs: string[] = [];
  function walk(dir: string, base: string): void {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const relPath = join(base, entry.name);
        dirs.push(relPath);
        walk(join(dir, entry.name), relPath);
      }
    }
  }
  walk(paths.repo, "");
  return dirs;
}
