import { createWriteStream, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import archiver from "archiver";
import { isoNow } from "../../utils/time.js";
import type { WorkspacePaths } from "./workspace.js";
import { listRepoFiles, readVerificationReport } from "./workspace.js";

export interface PackagerResult {
  success: boolean;
  zipPath: string;
  sizeBytes: number;
  fileCount: number;
  exportedAt: string;
  error?: string;
}

export function isExportEligible(paths: WorkspacePaths): { eligible: boolean; reason?: string } {
  if (!existsSync(paths.verificationReport)) {
    return { eligible: false, reason: "Verification report not found" };
  }

  const report = readVerificationReport(paths);
  if (!report) {
    return { eligible: false, reason: "Could not read verification report" };
  }

  if (report.overallResult !== "pass") {
    return { eligible: false, reason: `Verification result is '${report.overallResult}', expected 'pass'` };
  }

  if (!report.exportEligible) {
    return { eligible: false, reason: "Verification report marks export as ineligible" };
  }

  if (!existsSync(paths.repo)) {
    return { eligible: false, reason: "Repo directory not found" };
  }

  return { eligible: true };
}

export async function repackageExportZip(repoDir: string, zipPath: string, buildManifestPath?: string, repoManifestPath?: string, verificationReportPath?: string): Promise<PackagerResult> {
  const exportedAt = isoNow();

  if (!existsSync(repoDir)) {
    return {
      success: false,
      zipPath,
      sizeBytes: 0,
      fileCount: 0,
      exportedAt,
      error: "Repo directory not found for repackaging",
    };
  }

  return new Promise<PackagerResult>((resolve) => {
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    let fileCount = 0;

    output.on("close", () => {
      const stat = statSync(zipPath);
      resolve({
        success: true,
        zipPath,
        sizeBytes: stat.size,
        fileCount,
        exportedAt,
      });
    });

    archive.on("error", (err: Error) => {
      resolve({
        success: false,
        zipPath,
        sizeBytes: 0,
        fileCount,
        exportedAt,
        error: err.message,
      });
    });

    archive.pipe(output);

    archive.directory(repoDir, "project");

    const metaFiles: { diskPath: string; archiveName: string }[] = [];
    if (buildManifestPath) {
      metaFiles.push({ diskPath: buildManifestPath, archiveName: "build_manifest.json" });
    }
    if (repoManifestPath) {
      metaFiles.push({ diskPath: repoManifestPath, archiveName: "repo_manifest.json" });
    }
    if (verificationReportPath) {
      metaFiles.push({ diskPath: verificationReportPath, archiveName: "verification_report.json" });
    }

    for (const meta of metaFiles) {
      if (existsSync(meta.diskPath)) {
        archive.file(meta.diskPath, { name: meta.archiveName });
        fileCount++;
      }
    }

    const readmePath = join(repoDir, "README.md");
    if (existsSync(readmePath)) {
      archive.file(readmePath, { name: "README.md" });
      fileCount++;
    }

    archive.finalize();
  });
}

export async function createExportZip(paths: WorkspacePaths): Promise<PackagerResult> {
  const exportedAt = isoNow();

  const eligibility = isExportEligible(paths);
  if (!eligibility.eligible) {
    return {
      success: false,
      zipPath: paths.exportZip,
      sizeBytes: 0,
      fileCount: 0,
      exportedAt,
      error: eligibility.reason,
    };
  }

  return new Promise<PackagerResult>((resolve) => {
    const output = createWriteStream(paths.exportZip);
    const archive = archiver("zip", { zlib: { level: 9 } });

    let fileCount = 0;

    output.on("close", () => {
      const stat = statSync(paths.exportZip);
      resolve({
        success: true,
        zipPath: paths.exportZip,
        sizeBytes: stat.size,
        fileCount,
        exportedAt,
      });
    });

    archive.on("error", (err: Error) => {
      resolve({
        success: false,
        zipPath: paths.exportZip,
        sizeBytes: 0,
        fileCount,
        exportedAt,
        error: err.message,
      });
    });

    archive.pipe(output);

    archive.directory(paths.repo, "project");
    const repoFiles = listRepoFiles(paths);
    fileCount = repoFiles.length;

    const metaFiles: { diskPath: string; archiveName: string }[] = [
      { diskPath: paths.buildManifest, archiveName: "build_manifest.json" },
      { diskPath: paths.repoManifest, archiveName: "repo_manifest.json" },
      { diskPath: paths.verificationReport, archiveName: "verification_report.json" },
    ];

    for (const meta of metaFiles) {
      if (existsSync(meta.diskPath)) {
        archive.file(meta.diskPath, { name: meta.archiveName });
        fileCount++;
      }
    }

    const readmePath = join(paths.repo, "README.md");
    if (existsSync(readmePath)) {
      archive.file(readmePath, { name: "README.md" });
      fileCount++;
    }

    archive.finalize();
  });
}
