import unzipper from "unzipper";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";

export interface SafeUnzipOptions {
  maxFiles?: number;
  maxTotalUncompressedBytes?: number;
  maxEntrySize?: number;
  timeoutMs?: number;
  skipBinaryExtensions?: string[];
}

export interface UnzipStats {
  fileCount: number;
  totalUncompressedBytes: number;
  skippedFiles: number;
  binaryFiles: string[];
}

export interface UnzipWarning {
  code: string;
  message: string;
  details?: string;
}

export interface SafeUnzipResult {
  extractedDir: string;
  stats: UnzipStats;
  warnings: UnzipWarning[];
  sha256: string;
}

const DEFAULT_OPTIONS: Required<SafeUnzipOptions> = {
  maxFiles: 20000,
  maxTotalUncompressedBytes: 250 * 1024 * 1024,
  maxEntrySize: 25 * 1024 * 1024,
  timeoutMs: 15000,
  skipBinaryExtensions: [
    ".exe", ".dll", ".so", ".dylib", ".bin", ".o", ".a",
    ".zip", ".tar", ".gz", ".7z", ".rar",
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".ico", ".webp",
    ".mp3", ".mp4", ".avi", ".mov", ".wav", ".flac",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
    ".pyc", ".pyo", ".class"
  ],
};

function isBinaryExtension(filename: string, binaryExts: string[]): boolean {
  const ext = path.extname(filename).toLowerCase();
  return binaryExts.includes(ext);
}

function hasPathTraversal(entryPath: string): boolean {
  const normalized = path.normalize(entryPath);
  return normalized.startsWith("..") || 
         normalized.includes("../") || 
         normalized.includes("..\\") ||
         path.isAbsolute(normalized);
}

export async function safeUnzipBuffer(
  zipBuffer: Buffer,
  options: SafeUnzipOptions = {}
): Promise<SafeUnzipResult> {
  const opts: Required<SafeUnzipOptions> = { ...DEFAULT_OPTIONS, ...options };
  const warnings: UnzipWarning[] = [];
  const stats: UnzipStats = {
    fileCount: 0,
    totalUncompressedBytes: 0,
    skippedFiles: 0,
    binaryFiles: [],
  };

  const sha256 = crypto.createHash("sha256").update(zipBuffer).digest("hex");

  const extractedDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "axiom-unzip-")
  );

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("TIMEOUT"));
    }, opts.timeoutMs);
  });

  const extractPromise = (async () => {
    const directory = await unzipper.Open.buffer(zipBuffer);

    for (const entry of directory.files) {
      if (entry.type === "Directory") {
        continue;
      }

      if (hasPathTraversal(entry.path)) {
        warnings.push({
          code: "PATH_TRAVERSAL_BLOCKED",
          message: `Blocked path traversal attempt: ${entry.path}`,
          details: entry.path,
        });
        stats.skippedFiles++;
        continue;
      }

      if (stats.fileCount >= opts.maxFiles) {
        warnings.push({
          code: "ZIP_LIMIT_HIT",
          message: `Max file count (${opts.maxFiles}) exceeded`,
          details: `Stopped at file: ${entry.path}`,
        });
        break;
      }

      if (entry.uncompressedSize > opts.maxEntrySize) {
        warnings.push({
          code: "LARGE_FILE_SKIPPED",
          message: `Skipped large file: ${entry.path} (${entry.uncompressedSize} bytes)`,
          details: entry.path,
        });
        stats.skippedFiles++;
        continue;
      }

      if (stats.totalUncompressedBytes + entry.uncompressedSize > opts.maxTotalUncompressedBytes) {
        warnings.push({
          code: "ZIP_LIMIT_HIT",
          message: `Max total size (${opts.maxTotalUncompressedBytes} bytes) exceeded`,
        });
        break;
      }

      if (isBinaryExtension(entry.path, opts.skipBinaryExtensions)) {
        stats.binaryFiles.push(entry.path);
        stats.skippedFiles++;
        continue;
      }

      const targetPath = path.join(extractedDir, entry.path);
      const targetDir = path.dirname(targetPath);

      await fs.promises.mkdir(targetDir, { recursive: true });

      const content = await entry.buffer();
      await fs.promises.writeFile(targetPath, content);

      stats.fileCount++;
      stats.totalUncompressedBytes += entry.uncompressedSize;
    }

    if (stats.binaryFiles.length > 10) {
      warnings.push({
        code: "BINARY_HEAVY",
        message: `Project contains ${stats.binaryFiles.length} binary files that were skipped`,
      });
    }

    if (stats.fileCount > 5000) {
      warnings.push({
        code: "LARGE_REPO",
        message: `Large repository with ${stats.fileCount} files`,
      });
    }
  })();

  try {
    await Promise.race([extractPromise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.message === "TIMEOUT") {
      warnings.push({
        code: "TIMEOUT",
        message: `Extraction timed out after ${opts.timeoutMs}ms`,
      });
    } else {
      throw error;
    }
  }

  return {
    extractedDir,
    stats,
    warnings,
    sha256,
  };
}

export async function cleanupExtractedDir(extractedDir: string): Promise<void> {
  try {
    await fs.promises.rm(extractedDir, { recursive: true, force: true });
  } catch {
  }
}
