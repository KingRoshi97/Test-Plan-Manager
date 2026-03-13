import path from "path";
import fs from "fs";
import { storage } from "./storage.js";
import { getCompilationStatus } from "./preview-compiler.js";

const AXION_RUNS = path.resolve("Axion/.axion/runs");

export interface PreviewResolution {
  status: "none" | "building" | "preparing" | "ready" | "failed" | "expired" | "uncompiled" | "compiling";
  runId: string | null;
  buildStatus: string | null;
  previewUrl: string | null;
  entryUrl: string | null;
  updatedAt: string | Date;
  generatedAt: string;
  embeddable: boolean;
  environment: string | null;
  error: string | null;
  compileProgress?: string | null;
  compileError?: string | null;
}

function none(assembly: any, runId: string | null = null, extra: Partial<PreviewResolution> = {}): PreviewResolution {
  return {
    status: "none", runId, buildStatus: null, previewUrl: null, entryUrl: null,
    updatedAt: assembly.updatedAt, generatedAt: new Date().toISOString(),
    embeddable: false, environment: null, error: null, ...extra,
  };
}

function findEffectiveRunId(assemblyId: number, runId: string | null, runs: any[]): string | null {
  if (runId) {
    const manifestPath = path.join(AXION_RUNS, runId, "build", "build_manifest.json");
    if (fs.existsSync(manifestPath)) return runId;
  }

  const fallback = runs
    .filter((r: any) => r.status === "completed" && r.runId && r.runId !== runId)
    .sort((a: any, b: any) => (b.runId || "").localeCompare(a.runId || ""))
    .find((r: any) => {
      return fs.existsSync(path.join(AXION_RUNS, r.runId, "build", "build_manifest.json"));
    });

  return fallback?.runId || null;
}

export async function resolvePreview(assemblyId: number): Promise<PreviewResolution> {
  const assembly = await storage.getAssembly(assemblyId);
  if (!assembly) throw new Error("Assembly not found");

  let runId = assembly.runId;
  if (!runId) {
    const runs = await storage.getPipelineRuns(assemblyId);
    const completedRun = runs.find((r: any) => r.status === "completed" && r.runId);
    if (!completedRun) return none(assembly);
    runId = completedRun.runId;
  }

  if (assembly.status === "running") {
    return {
      status: "building", runId, buildStatus: "running",
      previewUrl: null, entryUrl: null,
      updatedAt: assembly.updatedAt, generatedAt: new Date().toISOString(),
      embeddable: false, environment: null, error: null,
    };
  }

  const runs = await storage.getPipelineRuns(assemblyId);
  const effectiveRunId = findEffectiveRunId(assemblyId, runId, runs);

  if (!effectiveRunId) return none(assembly, runId);

  const buildDir = path.join(AXION_RUNS, effectiveRunId, "build");
  const manifestPath = path.join(buildDir, "build_manifest.json");

  let manifest: any = {};
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  } catch {
    return {
      status: "failed", runId, buildStatus: "error",
      previewUrl: null, entryUrl: null,
      updatedAt: assembly.updatedAt, generatedAt: new Date().toISOString(),
      embeddable: false, environment: null, error: "Failed to parse build manifest",
    };
  }

  const buildStatus = manifest.status || null;

  if (buildStatus === "building" || buildStatus === "requested" || buildStatus === "approved") {
    return {
      status: "building", runId: effectiveRunId, buildStatus,
      previewUrl: null, entryUrl: null,
      updatedAt: assembly.updatedAt, generatedAt: new Date().toISOString(),
      embeddable: false, environment: null, error: null,
    };
  }

  if (buildStatus === "failed" || buildStatus === "error") {
    return {
      status: "failed", runId: effectiveRunId, buildStatus,
      previewUrl: null, entryUrl: null,
      updatedAt: assembly.updatedAt, generatedAt: new Date().toISOString(),
      embeddable: false, environment: null, error: manifest.error || "Build failed",
    };
  }

  if (buildStatus === "passed" || buildStatus === "exported" || buildStatus === "completed") {
    const repoDir = path.join(buildDir, "repo");
    const distDir = path.join(repoDir, "dist");
    const env = manifest.environment || "production";
    const now = new Date().toISOString();

    if (fs.existsSync(path.join(distDir, "index.html"))) {
      const previewUrl = `/api/preview/${effectiveRunId}/dist/index.html`;
      return {
        status: "ready", runId: effectiveRunId, buildStatus,
        previewUrl, entryUrl: previewUrl,
        updatedAt: assembly.updatedAt, generatedAt: now,
        embeddable: true, environment: env, error: null,
      };
    }

    const compilationStatus = getCompilationStatus(effectiveRunId);
    if (compilationStatus.status === "installing" || compilationStatus.status === "compiling") {
      return {
        status: "compiling", runId: effectiveRunId, buildStatus,
        previewUrl: null, entryUrl: null,
        updatedAt: assembly.updatedAt, generatedAt: now,
        embeddable: false, environment: env, error: null,
        compileProgress: compilationStatus.progress,
      };
    }

    if (compilationStatus.status === "failed") {
      return {
        status: "uncompiled", runId: effectiveRunId, buildStatus,
        previewUrl: `/api/preview/${effectiveRunId}/_overview`,
        entryUrl: null,
        updatedAt: assembly.updatedAt, generatedAt: now,
        embeddable: true, environment: env, error: null,
        compileError: compilationStatus.error,
      };
    }

    const indexPath = path.join(repoDir, "index.html");
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, "utf-8");
      const hasRawSource = /src=["']\/src\/.*\.(tsx|ts|jsx)["']/i.test(indexContent);
      if (hasRawSource) {
        return {
          status: "uncompiled", runId: effectiveRunId, buildStatus,
          previewUrl: `/api/preview/${effectiveRunId}/_overview`,
          entryUrl: null,
          updatedAt: assembly.updatedAt, generatedAt: now,
          embeddable: true, environment: env, error: null,
        };
      }
      if (/<script\b/i.test(indexContent)) {
        const previewUrl = `/api/preview/${effectiveRunId}/index.html`;
        return {
          status: "ready", runId: effectiveRunId, buildStatus,
          previewUrl, entryUrl: previewUrl,
          updatedAt: assembly.updatedAt, generatedAt: now,
          embeddable: true, environment: env, error: null,
        };
      }
    }

    if (fs.existsSync(repoDir) && fs.existsSync(path.join(repoDir, "package.json"))) {
      return {
        status: "uncompiled", runId: effectiveRunId, buildStatus,
        previewUrl: `/api/preview/${effectiveRunId}/_overview`,
        entryUrl: null,
        updatedAt: assembly.updatedAt, generatedAt: now,
        embeddable: true, environment: env, error: null,
      };
    }

    return none(assembly, effectiveRunId, {
      buildStatus, environment: env,
      error: "No previewable files found in build output",
    });
  }

  return none(assembly, effectiveRunId, { buildStatus });
}

export function resolvePreviewFile(runId: string, filePath: string): { type: "file" | "spa-fallback" | "not-found" | "forbidden"; fullPath?: string; root?: string; relPath?: string } {
  if (/[^a-zA-Z0-9_\-]/.test(runId)) {
    return { type: "forbidden" };
  }

  const repoDir = path.resolve(AXION_RUNS, runId, "build", "repo");
  const fullPath = path.resolve(repoDir, filePath);
  const rel = path.relative(repoDir, fullPath);

  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return { type: "forbidden" };
  }

  if (fs.existsSync(fullPath)) {
    const stat = fs.lstatSync(fullPath);
    if (stat.isSymbolicLink()) return { type: "forbidden" };

    if (stat.isDirectory()) {
      const indexFull = path.join(fullPath, "index.html");
      if (fs.existsSync(indexFull) && !fs.lstatSync(indexFull).isSymbolicLink()) {
        return { type: "file", fullPath: indexFull, root: repoDir, relPath: path.join(rel, "index.html") };
      }
      return { type: "not-found" };
    }

    return { type: "file", fullPath, root: repoDir, relPath: rel };
  }

  if (filePath.startsWith("dist/")) {
    const distIndex = path.resolve(repoDir, "dist", "index.html");
    if (fs.existsSync(distIndex) && !fs.lstatSync(distIndex).isSymbolicLink()) {
      return { type: "spa-fallback", fullPath: distIndex, root: repoDir, relPath: "dist/index.html" };
    }
  }

  return { type: "not-found" };
}
