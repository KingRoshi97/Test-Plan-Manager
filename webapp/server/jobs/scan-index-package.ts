import { storage } from "../storage";
import { readFile, writeText, getProjectPackagePath } from "../file-storage";
import { safeUnzipBuffer, cleanupExtractedDir } from "../security/safe-unzip";
import { indexProject } from "../indexing/project-indexer";
import type { ProjectWarning } from "@shared/schema";

export async function scanAndIndexProjectPackage(payload: Record<string, unknown>): Promise<void> {
  const { projectPackageId } = payload as { projectPackageId: string };

  const pkg = await storage.getProjectPackage(projectPackageId);
  if (!pkg) {
    console.error(`[ScanIndex] Package not found: ${projectPackageId}`);
    return;
  }

  let extractedDir: string | null = null;

  try {
    await storage.updateProjectPackage(projectPackageId, {
      scanState: "scanning",
    });

    const zipBuffer = await readFile(pkg.objectKey);

    const unzipResult = await safeUnzipBuffer(zipBuffer);
    extractedDir = unzipResult.extractedDir;
    
    const allWarnings: ProjectWarning[] = unzipResult.warnings.map(w => ({
      code: w.code,
      message: w.message,
      details: w.details,
    }));

    await storage.updateProjectPackage(projectPackageId, {
      scanState: "scanned",
      indexState: "indexing",
      warningsJson: allWarnings,
    });

    const indexResult = await indexProject(extractedDir);

    allWarnings.push(...indexResult.warnings);

    const unpackedKey = getProjectPackagePath(projectPackageId, "index");
    await writeText(
      `${unpackedKey}/project_tree.txt`,
      indexResult.projectTree
    );
    await writeText(
      `${unpackedKey}/project_summary.json`,
      JSON.stringify(indexResult.summary, null, 2)
    );
    await writeText(
      `${unpackedKey}/dependency_snapshot.json`,
      JSON.stringify(indexResult.dependencySnapshot, null, 2)
    );

    await storage.updateProjectPackage(projectPackageId, {
      indexState: "indexed",
      summaryJson: indexResult.summary,
      warningsJson: allWarnings,
      unpackedObjectKey: unpackedKey,
    });

    await cleanupExtractedDir(extractedDir);
    extractedDir = null;

    console.log(`[ScanIndex] Successfully processed package: ${projectPackageId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[ScanIndex] Failed to process package: ${projectPackageId}`, error);

    if (extractedDir) {
      try {
        await cleanupExtractedDir(extractedDir);
      } catch (cleanupErr) {
        console.error(`[ScanIndex] Failed to cleanup extracted dir: ${extractedDir}`, cleanupErr);
      }
    }

    await storage.updateProjectPackage(projectPackageId, {
      scanState: "failed",
      indexState: "failed",
      errorCode: "ASSEMBLER_SCAN_FAILED",
      errorMessage,
    });
  }
}
