import { storage } from "../storage";
import * as fs from "fs";
import * as path from "path";

export interface RetentionConfig {
  uploadedDocsDays: number;
  projectZipsDays: number;
  generatedKitsDays: number;
  deliveryAttemptsDays: number;
  auditLogsDays: number;
  safetyWarningsDays: number;
  dryRun: boolean;
}

export const DEFAULT_RETENTION_CONFIG: RetentionConfig = {
  uploadedDocsDays: 30,
  projectZipsDays: 30,
  generatedKitsDays: 90,
  deliveryAttemptsDays: 180,
  auditLogsDays: 365,
  safetyWarningsDays: 90,
  dryRun: false,
};

export interface CleanupResult {
  startedAt: Date;
  completedAt: Date;
  dryRun: boolean;
  assembliesDeleted: number;
  packagesDeleted: number;
  deliveriesArchived: number;
  filesDeleted: number;
  bytesFreed: number;
  errors: string[];
}

let currentConfig: RetentionConfig = { ...DEFAULT_RETENTION_CONFIG };
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

export function getRetentionConfig(): RetentionConfig {
  return { ...currentConfig };
}

export function updateRetentionConfig(updates: Partial<RetentionConfig>): RetentionConfig {
  currentConfig = { ...currentConfig, ...updates };
  return getRetentionConfig();
}

function getExpirationDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function cleanupExpiredAssemblies(config: RetentionConfig): Promise<{
  deleted: number;
  filesDeleted: number;
  bytesFreed: number;
  errors: string[];
}> {
  const expirationDate = getExpirationDate(config.generatedKitsDays);
  const errors: string[] = [];
  let deleted = 0;
  let filesDeleted = 0;
  let bytesFreed = 0;

  try {
    const assemblies = await storage.getAssemblies();
    
    for (const assembly of assemblies) {
      if (!assembly.createdAt) continue;
      
      const createdAt = new Date(assembly.createdAt);
      if (createdAt >= expirationDate) continue;
      
      if (config.dryRun) {
        console.log(`[Retention] Would delete assembly ${assembly.id} (created ${createdAt.toISOString()})`);
        deleted++;
        continue;
      }

      try {
        if (assembly.kitPath && fs.existsSync(assembly.kitPath)) {
          const stats = fs.statSync(assembly.kitPath);
          bytesFreed += stats.size;
          fs.unlinkSync(assembly.kitPath);
          filesDeleted++;
        }

        const workspacePath = `workspaces/${assembly.id}`;
        if (fs.existsSync(workspacePath)) {
          const workspaceSize = getDirectorySize(workspacePath);
          bytesFreed += workspaceSize;
          fs.rmSync(workspacePath, { recursive: true, force: true });
          filesDeleted++;
        }

        await storage.deleteAssembly(assembly.id);
        deleted++;
        
        console.log(`[Retention] Deleted assembly ${assembly.id}`);
      } catch (error) {
        errors.push(`Failed to delete assembly ${assembly.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  } catch (error) {
    errors.push(`Failed to list assemblies: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return { deleted, filesDeleted, bytesFreed, errors };
}

async function cleanupExpiredPackages(config: RetentionConfig): Promise<{
  deleted: number;
  bytesFreed: number;
  errors: string[];
}> {
  const expirationDate = getExpirationDate(config.projectZipsDays);
  const errors: string[] = [];
  let deleted = 0;
  let bytesFreed = 0;

  try {
    const assemblies = await storage.getAssemblies();
    
    for (const assembly of assemblies) {
      try {
        const packages = await storage.getProjectPackagesByAssemblyId(assembly.id);
        
        for (const pkg of packages) {
          if (!pkg.createdAt) continue;
          
          const createdAt = new Date(pkg.createdAt);
          if (createdAt >= expirationDate) continue;
          
          if (config.dryRun) {
            console.log(`[Retention] Would delete package ${pkg.id} (created ${createdAt.toISOString()})`);
            deleted++;
            continue;
          }

          try {
            if (pkg.objectKey) {
              bytesFreed += pkg.sizeBytes || 0;
            }

            await storage.deleteProjectPackage(pkg.id);
            deleted++;
            
            console.log(`[Retention] Deleted package ${pkg.id}`);
          } catch (error) {
            errors.push(`Failed to delete package ${pkg.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
          }
        }
      } catch (error) {
        errors.push(`Failed to get packages for assembly ${assembly.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  } catch (error) {
    errors.push(`Failed to list assemblies for package cleanup: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return { deleted, bytesFreed, errors };
}

async function archiveOldDeliveryAttempts(config: RetentionConfig): Promise<{
  archived: number;
  errors: string[];
}> {
  const expirationDate = getExpirationDate(config.deliveryAttemptsDays);
  const errors: string[] = [];
  let archived = 0;

  try {
    const assemblies = await storage.getAssemblies();
    
    for (const assembly of assemblies) {
      try {
        const deliveries = await storage.getDeliveriesByAssemblyId(assembly.id);
        
        for (const delivery of deliveries) {
          if (!delivery.createdAt) continue;
          
          const createdAt = new Date(delivery.createdAt);
          if (createdAt >= expirationDate) continue;
          
          if (delivery.state !== "completed" && delivery.state !== "failed") continue;
          
          if (config.dryRun) {
            console.log(`[Retention] Would archive delivery ${delivery.id} (created ${createdAt.toISOString()})`);
            archived++;
            continue;
          }

          await storage.updateDelivery(delivery.id, {
            attemptHistory: [],
          });
          archived++;
        }
      } catch (error) {
        errors.push(`Failed to archive deliveries for assembly ${assembly.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  } catch (error) {
    errors.push(`Failed to list assemblies for delivery cleanup: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return { archived, errors };
}

async function cleanupTempFiles(): Promise<{
  filesDeleted: number;
  bytesFreed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let filesDeleted = 0;
  let bytesFreed = 0;

  const tempDirs = ["uploads", "temp"];
  const maxAge = 24 * 60 * 60 * 1000;

  for (const dir of tempDirs) {
    if (!fs.existsSync(dir)) continue;

    try {
      const files = fs.readdirSync(dir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(dir, file);
        try {
          const stats = fs.statSync(filePath);
          const age = now - stats.mtimeMs;

          if (age > maxAge) {
            bytesFreed += stats.size;
            fs.unlinkSync(filePath);
            filesDeleted++;
          }
        } catch (error) {
          errors.push(`Failed to cleanup temp file ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    } catch (error) {
      errors.push(`Failed to read temp directory ${dir}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return { filesDeleted, bytesFreed, errors };
}

function getDirectorySize(dirPath: string): number {
  let size = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch {
  }
  
  return size;
}

export async function runCleanup(config?: Partial<RetentionConfig>): Promise<CleanupResult> {
  const mergedConfig = { ...currentConfig, ...config };
  const startedAt = new Date();
  const errors: string[] = [];

  console.log(`[Retention] Starting cleanup (dryRun: ${mergedConfig.dryRun})`);

  const assemblyResult = await cleanupExpiredAssemblies(mergedConfig);
  errors.push(...assemblyResult.errors);

  const packageResult = await cleanupExpiredPackages(mergedConfig);
  errors.push(...packageResult.errors);

  const deliveryResult = await archiveOldDeliveryAttempts(mergedConfig);
  errors.push(...deliveryResult.errors);

  const tempResult = await cleanupTempFiles();
  errors.push(...tempResult.errors);

  const completedAt = new Date();
  const result: CleanupResult = {
    startedAt,
    completedAt,
    dryRun: mergedConfig.dryRun,
    assembliesDeleted: assemblyResult.deleted,
    packagesDeleted: packageResult.deleted,
    deliveriesArchived: deliveryResult.archived,
    filesDeleted: assemblyResult.filesDeleted + tempResult.filesDeleted,
    bytesFreed: assemblyResult.bytesFreed + packageResult.bytesFreed + tempResult.bytesFreed,
    errors,
  };

  console.log(`[Retention] Cleanup completed in ${completedAt.getTime() - startedAt.getTime()}ms`);
  console.log(`[Retention] Assemblies: ${result.assembliesDeleted}, Packages: ${result.packagesDeleted}, Archived: ${result.deliveriesArchived}`);
  console.log(`[Retention] Files: ${result.filesDeleted}, Bytes freed: ${formatBytes(result.bytesFreed)}`);
  
  if (errors.length > 0) {
    console.log(`[Retention] Errors: ${errors.length}`);
    errors.forEach(e => console.error(`[Retention]   ${e}`));
  }

  return result;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function startRetentionScheduler(intervalHours: number = 24): void {
  if (cleanupInterval) {
    console.log("[Retention] Scheduler already running");
    return;
  }

  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`[Retention] Starting scheduler (interval: ${intervalHours}h)`);
  
  cleanupInterval = setInterval(async () => {
    try {
      await runCleanup();
    } catch (error) {
      console.error("[Retention] Scheduled cleanup failed:", error);
    }
  }, intervalMs);
}

export function stopRetentionScheduler(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log("[Retention] Scheduler stopped");
  }
}
