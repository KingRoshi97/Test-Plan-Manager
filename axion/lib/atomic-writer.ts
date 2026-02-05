/**
 * Atomic Writer - Safe artifact writes with crash recovery
 * 
 * Uses write-to-tmp + rename pattern for atomic writes.
 * Supports failpoint injection for crash simulation testing.
 */

import * as fs from 'fs';
import * as path from 'path';

export type Failpoint = 'AFTER_TMP_WRITE' | 'BEFORE_RENAME';

export interface AtomicWriteOptions {
  mode?: number;
  failpoint?: Failpoint;
}

export interface CleanupResult {
  removed: string[];
  errors: string[];
}

/**
 * Get the tmp file path for a given target path
 */
function getTmpPath(targetPath: string): string {
  const dir = path.dirname(targetPath);
  const base = path.basename(targetPath);
  return path.join(dir, `.${base}.tmp`);
}

/**
 * Check if failpoint should trigger (from env or options)
 */
function getActiveFailpoint(opts?: AtomicWriteOptions): Failpoint | undefined {
  if (opts?.failpoint) {
    return opts.failpoint;
  }
  const envFailpoint = process.env.AXION_FAILPOINT;
  if (envFailpoint === 'AFTER_TMP_WRITE' || envFailpoint === 'BEFORE_RENAME') {
    return envFailpoint;
  }
  return undefined;
}

/**
 * Write JSON atomically using tmp + rename pattern
 * 
 * @param targetPath - Final destination path
 * @param data - Data to serialize as JSON
 * @param opts - Optional settings (mode, failpoint)
 */
export function writeJsonAtomic(
  targetPath: string,
  data: unknown,
  opts?: AtomicWriteOptions
): void {
  const content = JSON.stringify(data, null, 2);
  writeTextAtomic(targetPath, content, opts);
}

/**
 * Write text atomically using tmp + rename pattern
 * 
 * @param targetPath - Final destination path  
 * @param text - Text content to write
 * @param opts - Optional settings (mode, failpoint)
 */
export function writeTextAtomic(
  targetPath: string,
  text: string,
  opts?: AtomicWriteOptions
): void {
  const tmpPath = getTmpPath(targetPath);
  const failpoint = getActiveFailpoint(opts);
  const dir = path.dirname(targetPath);
  
  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write to tmp file first
  const writeOpts: fs.WriteFileOptions = {};
  if (opts?.mode !== undefined) {
    writeOpts.mode = opts.mode;
  }
  
  fs.writeFileSync(tmpPath, text, writeOpts);
  
  // Failpoint: AFTER_TMP_WRITE - crash after writing tmp, before rename
  if (failpoint === 'AFTER_TMP_WRITE') {
    throw new Error(`[FAILPOINT] AFTER_TMP_WRITE triggered at ${targetPath}`);
  }
  
  // Failpoint: BEFORE_RENAME - crash just before atomic rename
  if (failpoint === 'BEFORE_RENAME') {
    throw new Error(`[FAILPOINT] BEFORE_RENAME triggered at ${targetPath}`);
  }
  
  // Atomic rename (atomic on POSIX when same filesystem)
  fs.renameSync(tmpPath, targetPath);
}

/**
 * Clean up orphan tmp files in a directory
 * 
 * Removes files matching the pattern .<name>.tmp
 * Does not remove files that look like real artifacts
 * 
 * @param dir - Directory to scan
 * @param pattern - Optional regex to match tmp filenames (default: /^\..+\.tmp$/)
 * @returns Object with removed files and any errors
 */
export function cleanupOrphanTmp(
  dir: string,
  pattern: RegExp = /^\..+\.tmp$/
): CleanupResult {
  const result: CleanupResult = {
    removed: [],
    errors: []
  };
  
  if (!fs.existsSync(dir)) {
    return result;
  }
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile() && pattern.test(entry.name)) {
        const filePath = path.join(dir, entry.name);
        try {
          fs.unlinkSync(filePath);
          result.removed.push(filePath);
        } catch (err) {
          result.errors.push(`Failed to remove ${filePath}: ${err}`);
        }
      } else if (entry.isDirectory()) {
        // Recurse into subdirectories
        const subResult = cleanupOrphanTmp(path.join(dir, entry.name), pattern);
        result.removed.push(...subResult.removed);
        result.errors.push(...subResult.errors);
      }
    }
  } catch (err) {
    result.errors.push(`Failed to read directory ${dir}: ${err}`);
  }
  
  return result;
}

/**
 * Check if atomic writes are enabled via system config
 */
export function isAtomicWritesEnabled(): boolean {
  try {
    const configPath = path.join(__dirname, '../config/system.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config?.feature_flags?.atomic_artifact_writes?.enabled === true;
    }
  } catch {
    // Default to enabled if config can't be read
  }
  return true;
}
