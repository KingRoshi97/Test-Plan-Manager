import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { writeJson, readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type {
  BuildManifest,
  BuildState,
  BuildLifecycleEvent,
  BuildRequest,
  BuildPlan,
  StackProfile,
  RepoManifest,
  FileInventoryEntry,
  BuildFileTarget,
} from "./types.js";
import { isValidTransition } from "./types.js";

export function createBuildManifest(
  buildId: string,
  runId: string,
  request: BuildRequest,
  kitRoot: string,
  specId: string,
  version: string,
  buildProfile: StackProfile,
): BuildManifest {
  const now = isoNow();
  return {
    buildId,
    runId,
    sourceKit: {
      kitRoot,
      runId,
      specId,
      version,
    },
    buildProfile,
    request,
    lifecycle: [
      {
        state: "requested",
        timestamp: now,
        phase: "init",
        detail: `Build requested with mode: ${request.outputMode}`,
      },
    ],
    status: "requested",
    startedAt: now,
    outputRefs: {},
  };
}

export function recordLifecycleTransition(
  manifest: BuildManifest,
  toState: BuildState,
  phase: string,
  detail?: string,
): BuildManifest {
  if (!isValidTransition(manifest.status, toState)) {
    throw new Error(
      `Invalid build state transition: ${manifest.status} -> ${toState}`,
    );
  }
  const event: BuildLifecycleEvent = {
    state: toState,
    timestamp: isoNow(),
    phase,
    detail,
  };
  return {
    ...manifest,
    status: toState,
    lifecycle: [...manifest.lifecycle, event],
    completedAt:
      toState === "passed" || toState === "failed" || toState === "exported"
        ? isoNow()
        : manifest.completedAt,
  };
}

export function recordFailure(
  manifest: BuildManifest,
  failureClass: BuildManifest["failureEvidence"] extends undefined
    ? never
    : NonNullable<BuildManifest["failureEvidence"]>["failureClass"],
  phase: string,
  reason: string,
  blockedConditions?: string[],
  partialOutputs?: string[],
): BuildManifest {
  const updated = isValidTransition(manifest.status, "failed")
    ? recordLifecycleTransition(manifest, "failed", phase, reason)
    : manifest;
  return {
    ...updated,
    failureEvidence: {
      failureClass,
      phase,
      reason,
      blockedConditions,
      partialOutputs,
    },
  };
}

export function updateOutputRefs(
  manifest: BuildManifest,
  refs: Partial<BuildManifest["outputRefs"]>,
): BuildManifest {
  return {
    ...manifest,
    outputRefs: {
      ...manifest.outputRefs,
      ...refs,
    },
  };
}

export function updateTokenUsage(
  manifest: BuildManifest,
  tokenUsage: NonNullable<BuildManifest["tokenUsage"]>,
): BuildManifest {
  return {
    ...manifest,
    tokenUsage,
  };
}

export function writeBuildManifest(
  manifestPath: string,
  manifest: BuildManifest,
): void {
  writeJson(manifestPath, manifest);
}

export function readBuildManifest(manifestPath: string): BuildManifest | null {
  if (!existsSync(manifestPath)) return null;
  return readJson<BuildManifest>(manifestPath);
}

function collectDirectories(dirPath: string, base: string): string[] {
  const dirs: string[] = [];
  if (!existsSync(dirPath)) return dirs;
  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const rel = relative(base, join(dirPath, entry.name));
      dirs.push(rel);
      dirs.push(...collectDirectories(join(dirPath, entry.name), base));
    }
  }
  return dirs;
}

function collectFiles(
  dirPath: string,
  base: string,
): { path: string; sizeBytes: number }[] {
  const files: { path: string; sizeBytes: number }[] = [];
  if (!existsSync(dirPath)) return files;
  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath, base));
    } else if (entry.isFile()) {
      const stat = statSync(fullPath);
      files.push({ path: relative(base, fullPath), sizeBytes: stat.size });
    }
  }
  return files;
}

export function createRepoManifest(
  buildId: string,
  runId: string,
  repoRoot: string,
  plan: BuildPlan,
  dependencies: Record<string, string>,
  commands: RepoManifest["commands"],
): RepoManifest {
  const directories = collectDirectories(repoRoot, repoRoot);
  const diskFiles = collectFiles(repoRoot, repoRoot);
  const totalSizeBytes = diskFiles.reduce((sum, f) => sum + f.sizeBytes, 0);

  const fileTargetMap = new Map<string, BuildFileTarget>();
  for (const slice of plan.slices) {
    for (const ft of slice.files) {
      fileTargetMap.set(ft.relativePath, ft);
    }
  }

  const fileInventory: FileInventoryEntry[] = diskFiles.map((f) => {
    const target = fileTargetMap.get(f.path);
    return {
      path: f.path,
      role: target?.role ?? "unknown",
      sourceRef: target?.sourceRef,
      sizeBytes: f.sizeBytes,
      generationMethod: target?.generationMethod ?? "deterministic",
    };
  });

  const moduleCoverage: Record<string, string[]> = {};
  for (const slice of plan.slices) {
    moduleCoverage[slice.name] = slice.files.map((f) => f.relativePath);
  }

  return {
    buildId,
    runId,
    repoRoot,
    structure: {
      directories,
      totalFiles: diskFiles.length,
      totalSizeBytes,
    },
    fileInventory,
    moduleCoverage,
    dependencies,
    commands,
    generatedAt: isoNow(),
  };
}

export function writeRepoManifest(
  manifestPath: string,
  manifest: RepoManifest,
): void {
  writeJson(manifestPath, manifest);
}

export function readRepoManifest(manifestPath: string): RepoManifest | null {
  if (!existsSync(manifestPath)) return null;
  return readJson<RepoManifest>(manifestPath);
}

export interface FileIndex {
  buildId: string;
  runId: string;
  generatedAt: string;
  totalFiles: number;
  files: FileIndexEntry[];
}

export interface FileIndexEntry {
  path: string;
  role: string;
  sourceRef?: string;
  sizeBytes: number;
  generationMethod: "deterministic" | "ai_assisted";
  sliceName: string;
}

export function createFileIndex(
  buildId: string,
  runId: string,
  repoRoot: string,
  plan: BuildPlan,
): FileIndex {
  const diskFiles = collectFiles(repoRoot, repoRoot);
  const diskFileMap = new Map(diskFiles.map((f) => [f.path, f.sizeBytes]));

  const files: FileIndexEntry[] = [];
  for (const slice of plan.slices) {
    for (const ft of slice.files) {
      const sizeBytes = diskFileMap.get(ft.relativePath) ?? ft.sizeBytes ?? 0;
      files.push({
        path: ft.relativePath,
        role: ft.role,
        sourceRef: ft.sourceRef,
        sizeBytes,
        generationMethod: ft.generationMethod,
        sliceName: slice.name,
      });
    }
  }

  return {
    buildId,
    runId,
    generatedAt: isoNow(),
    totalFiles: files.length,
    files,
  };
}

export function writeFileIndex(indexPath: string, index: FileIndex): void {
  writeJson(indexPath, index);
}

export function readFileIndex(indexPath: string): FileIndex | null {
  if (!existsSync(indexPath)) return null;
  return readJson<FileIndex>(indexPath);
}

export function writeAllManifests(
  buildDir: string,
  manifest: BuildManifest,
  repoManifest: RepoManifest,
  fileIndex: FileIndex,
): BuildManifest {
  const buildManifestPath = join(buildDir, "build_manifest.json");
  const repoManifestPath = join(buildDir, "repo_manifest.json");
  const fileIndexPath = join(buildDir, "file_index.json");

  writeBuildManifest(buildManifestPath, manifest);
  writeRepoManifest(repoManifestPath, repoManifest);
  writeFileIndex(fileIndexPath, fileIndex);

  return updateOutputRefs(manifest, {
    buildManifestPath,
    repoManifestPath,
    fileIndexPath,
  });
}
