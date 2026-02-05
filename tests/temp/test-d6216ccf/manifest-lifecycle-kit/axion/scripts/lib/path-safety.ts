/**
 * AXION Path Safety Utilities
 * 
 * Guards against writing to protected system paths.
 * Critical for maintaining two-root model invariants.
 */

import * as path from 'path';
import * as fs from 'fs';

export interface PathSafetyResult {
  safe: boolean;
  reason_code?: 'SYSTEM_ROOT_WRITE_ATTEMPT' | 'UNSAFE_ROOT' | 'PATH_TRAVERSAL';
  message?: string;
  attempted_path?: string;
  system_root?: string;
}

/**
 * Check if a target path is safe to write to.
 * 
 * Refuses writes if:
 * - Path is inside <BUILD_ROOT>/axion/ (system root)
 * - Path attempts traversal outside build root
 * 
 * @param targetPath - The path where we want to write
 * @param buildRoot - The build root directory
 * @param projectName - The project name (workspace folder)
 * @returns Safety check result
 */
export function checkWriteSafety(
  targetPath: string,
  buildRoot: string,
  projectName: string
): PathSafetyResult {
  const resolvedTarget = path.resolve(targetPath);
  const resolvedBuildRoot = path.resolve(buildRoot);
  const systemRoot = path.join(resolvedBuildRoot, 'axion');
  const workspaceRoot = path.join(resolvedBuildRoot, projectName);
  
  // Check if path is inside system root (axion/)
  if (resolvedTarget.startsWith(systemRoot + path.sep) || resolvedTarget === systemRoot) {
    return {
      safe: false,
      reason_code: 'SYSTEM_ROOT_WRITE_ATTEMPT',
      message: `Write refused: target path is inside system root (axion/)`,
      attempted_path: resolvedTarget,
      system_root: systemRoot,
    };
  }
  
  // Check for path traversal outside build root
  if (!resolvedTarget.startsWith(resolvedBuildRoot + path.sep) && resolvedTarget !== resolvedBuildRoot) {
    return {
      safe: false,
      reason_code: 'PATH_TRAVERSAL',
      message: `Write refused: target path is outside build root`,
      attempted_path: resolvedTarget,
      system_root: systemRoot,
    };
  }
  
  // Ideally writes should go to workspace root, but we allow build root level for ACTIVE_BUILD.json etc
  return { safe: true };
}

/**
 * Guard function that throws if write is unsafe.
 * Use this at the start of any function that writes files.
 */
export function assertWriteSafe(
  targetPath: string,
  buildRoot: string,
  projectName: string
): void {
  const result = checkWriteSafety(targetPath, buildRoot, projectName);
  if (!result.safe) {
    const error = new Error(result.message);
    (error as any).reason_code = result.reason_code;
    (error as any).attempted_path = result.attempted_path;
    (error as any).system_root = result.system_root;
    throw error;
  }
}

/**
 * Post-run audit: scan for modifications inside system root.
 * 
 * @param axionPath - Path to axion/ system folder
 * @param beforeSnapshot - Map of file paths to hashes before the operation
 * @returns Array of modified file paths
 */
export function auditSystemRootModifications(
  axionPath: string,
  beforeSnapshot: Map<string, string>
): string[] {
  const modified: string[] = [];
  const currentFiles = new Map<string, string>();
  
  function walkDir(dir: string, prefix = ''): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(prefix, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath, relPath);
      } else {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const crypto = require('crypto');
        const hash = crypto.createHash('md5').update(content).digest('hex');
        currentFiles.set(relPath, hash);
      }
    }
  }
  
  walkDir(axionPath);
  
  // Check for modifications
  for (const [file, hash] of beforeSnapshot) {
    const currentHash = currentFiles.get(file);
    if (currentHash !== hash) {
      modified.push(`MODIFIED: ${file}`);
    }
  }
  
  // Check for new files
  for (const file of currentFiles.keys()) {
    if (!beforeSnapshot.has(file)) {
      modified.push(`ADDED: ${file}`);
    }
  }
  
  // Check for deleted files
  for (const file of beforeSnapshot.keys()) {
    if (!currentFiles.has(file)) {
      modified.push(`DELETED: ${file}`);
    }
  }
  
  return modified;
}

/**
 * Create a snapshot of system root for later comparison.
 */
export function createSystemRootSnapshot(axionPath: string): Map<string, string> {
  const snapshot = new Map<string, string>();
  const crypto = require('crypto');
  
  function walkDir(dir: string, prefix = ''): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(prefix, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath, relPath);
      } else {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const hash = crypto.createHash('md5').update(content).digest('hex');
        snapshot.set(relPath, hash);
      }
    }
  }
  
  walkDir(axionPath);
  return snapshot;
}
