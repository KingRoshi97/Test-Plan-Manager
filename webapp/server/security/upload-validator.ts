import * as fs from "fs";
import * as path from "path";

export interface UploadLimits {
  maxZipSize: number;
  maxDocSize: number;
  maxTotalDocsSize: number;
  maxExtractedFiles: number;
  maxExtractedBytes: number;
  maxCompressionRatio: number;
}

export const DEFAULT_LIMITS: UploadLimits = {
  maxZipSize: 200 * 1024 * 1024,
  maxDocSize: 25 * 1024 * 1024,
  maxTotalDocsSize: 100 * 1024 * 1024,
  maxExtractedFiles: 20000,
  maxExtractedBytes: 1024 * 1024 * 1024,
  maxCompressionRatio: 100,
};

export interface ValidationWarning {
  code: string;
  severity: "info" | "warning" | "critical";
  message: string;
  details?: string;
}

export interface ValidationResult {
  valid: boolean;
  warnings: ValidationWarning[];
  blockedInStrictMode: boolean;
}

const MAGIC_BYTES: Record<string, Buffer[]> = {
  "application/pdf": [Buffer.from([0x25, 0x50, 0x44, 0x46])],
  "application/zip": [
    Buffer.from([0x50, 0x4B, 0x03, 0x04]),
    Buffer.from([0x50, 0x4B, 0x05, 0x06]),
    Buffer.from([0x50, 0x4B, 0x07, 0x08]),
  ],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    Buffer.from([0x50, 0x4B, 0x03, 0x04]),
  ],
  "application/msword": [Buffer.from([0xD0, 0xCF, 0x11, 0xE0])],
  "text/plain": [],
  "text/markdown": [],
};

const ALLOWED_DOC_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".md",
  ".markdown",
]);

const ALLOWED_ZIP_EXTENSIONS = new Set([".zip"]);

const DANGEROUS_PATH_PATTERNS = [
  /\.\./,
  /^[A-Za-z]:/,
  /^\/+/,
  /\x00/,
  /[\u202E\u200B\u200C\u200D\uFEFF]/,
  /^\.+$/,
  /\\+/,
];

export function validateFilePath(filePath: string): ValidationResult {
  const warnings: ValidationWarning[] = [];
  let blockedInStrictMode = false;

  const normalizedPath = path.normalize(filePath);

  for (const pattern of DANGEROUS_PATH_PATTERNS) {
    if (pattern.test(filePath) || pattern.test(normalizedPath)) {
      warnings.push({
        code: "DANGEROUS_PATH",
        severity: "critical",
        message: `Dangerous path pattern detected: ${filePath}`,
        details: `Pattern: ${pattern.toString()}`,
      });
      blockedInStrictMode = true;
    }
  }

  if (path.isAbsolute(normalizedPath)) {
    warnings.push({
      code: "ABSOLUTE_PATH",
      severity: "critical",
      message: `Absolute path not allowed: ${filePath}`,
    });
    blockedInStrictMode = true;
  }

  if (normalizedPath.startsWith("..")) {
    warnings.push({
      code: "PATH_TRAVERSAL",
      severity: "critical",
      message: `Path traversal attempt blocked: ${filePath}`,
    });
    blockedInStrictMode = true;
  }

  return {
    valid: warnings.filter((w) => w.severity === "critical").length === 0,
    warnings,
    blockedInStrictMode,
  };
}

export function validateMagicBytes(
  buffer: Buffer,
  declaredMimeType: string
): ValidationResult {
  const warnings: ValidationWarning[] = [];
  let blockedInStrictMode = false;

  const expectedMagicList = MAGIC_BYTES[declaredMimeType];

  if (!expectedMagicList) {
    warnings.push({
      code: "UNKNOWN_MIME_TYPE",
      severity: "warning",
      message: `Unknown MIME type: ${declaredMimeType}`,
    });
    return { valid: true, warnings, blockedInStrictMode: false };
  }

  if (expectedMagicList.length === 0) {
    return { valid: true, warnings, blockedInStrictMode: false };
  }

  const matchesAny = expectedMagicList.some((magic) => {
    if (buffer.length < magic.length) return false;
    return buffer.subarray(0, magic.length).equals(magic);
  });

  if (!matchesAny) {
    warnings.push({
      code: "MAGIC_BYTES_MISMATCH",
      severity: "critical",
      message: `File content does not match declared type: ${declaredMimeType}`,
      details: `First 8 bytes: ${buffer.subarray(0, 8).toString("hex")}`,
    });
    blockedInStrictMode = true;
  }

  return { valid: !blockedInStrictMode, warnings, blockedInStrictMode };
}

export function validateDocExtension(filename: string): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const ext = path.extname(filename).toLowerCase();

  if (!ALLOWED_DOC_EXTENSIONS.has(ext)) {
    warnings.push({
      code: "INVALID_DOC_EXTENSION",
      severity: "critical",
      message: `File extension not allowed for documents: ${ext}`,
      details: `Allowed: ${Array.from(ALLOWED_DOC_EXTENSIONS).join(", ")}`,
    });
    return { valid: false, warnings, blockedInStrictMode: true };
  }

  return { valid: true, warnings, blockedInStrictMode: false };
}

export function validateZipExtension(filename: string): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const ext = path.extname(filename).toLowerCase();

  if (!ALLOWED_ZIP_EXTENSIONS.has(ext)) {
    warnings.push({
      code: "INVALID_ZIP_EXTENSION",
      severity: "critical",
      message: `File extension not allowed for project packages: ${ext}`,
      details: `Allowed: ${Array.from(ALLOWED_ZIP_EXTENSIONS).join(", ")}`,
    });
    return { valid: false, warnings, blockedInStrictMode: true };
  }

  return { valid: true, warnings, blockedInStrictMode: false };
}

export function checkCompressionRatio(
  compressedSize: number,
  uncompressedSize: number,
  maxRatio: number = DEFAULT_LIMITS.maxCompressionRatio
): ValidationResult {
  const warnings: ValidationWarning[] = [];

  if (compressedSize === 0) {
    return { valid: true, warnings, blockedInStrictMode: false };
  }

  const ratio = uncompressedSize / compressedSize;

  if (ratio > maxRatio) {
    warnings.push({
      code: "COMPRESSION_BOMB_SUSPECTED",
      severity: "critical",
      message: `Suspicious compression ratio detected: ${ratio.toFixed(1)}x`,
      details: `Max allowed: ${maxRatio}x. Compressed: ${compressedSize}, Uncompressed: ${uncompressedSize}`,
    });
    return { valid: false, warnings, blockedInStrictMode: true };
  }

  if (ratio > maxRatio * 0.5) {
    warnings.push({
      code: "HIGH_COMPRESSION_RATIO",
      severity: "warning",
      message: `High compression ratio: ${ratio.toFixed(1)}x`,
    });
  }

  return { valid: true, warnings, blockedInStrictMode: false };
}

export function validateDocUpload(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  limits: Partial<UploadLimits> = {}
): ValidationResult {
  const mergedLimits = { ...DEFAULT_LIMITS, ...limits };
  const allWarnings: ValidationWarning[] = [];
  let blockedInStrictMode = false;

  const extResult = validateDocExtension(filename);
  allWarnings.push(...extResult.warnings);
  if (extResult.blockedInStrictMode) blockedInStrictMode = true;

  if (buffer.length > mergedLimits.maxDocSize) {
    allWarnings.push({
      code: "DOC_TOO_LARGE",
      severity: "critical",
      message: `Document exceeds size limit: ${buffer.length} bytes`,
      details: `Max: ${mergedLimits.maxDocSize} bytes`,
    });
    blockedInStrictMode = true;
  }

  const magicResult = validateMagicBytes(buffer, mimeType);
  allWarnings.push(...magicResult.warnings);
  if (magicResult.blockedInStrictMode) blockedInStrictMode = true;

  const pathResult = validateFilePath(filename);
  allWarnings.push(...pathResult.warnings);
  if (pathResult.blockedInStrictMode) blockedInStrictMode = true;

  return {
    valid:
      allWarnings.filter((w) => w.severity === "critical").length === 0,
    warnings: allWarnings,
    blockedInStrictMode,
  };
}

export function validateZipUpload(
  buffer: Buffer,
  filename: string,
  limits: Partial<UploadLimits> = {}
): ValidationResult {
  const mergedLimits = { ...DEFAULT_LIMITS, ...limits };
  const allWarnings: ValidationWarning[] = [];
  let blockedInStrictMode = false;

  const extResult = validateZipExtension(filename);
  allWarnings.push(...extResult.warnings);
  if (extResult.blockedInStrictMode) blockedInStrictMode = true;

  if (buffer.length > mergedLimits.maxZipSize) {
    allWarnings.push({
      code: "ZIP_TOO_LARGE",
      severity: "critical",
      message: `ZIP file exceeds size limit: ${buffer.length} bytes`,
      details: `Max: ${mergedLimits.maxZipSize} bytes`,
    });
    blockedInStrictMode = true;
  }

  const magicResult = validateMagicBytes(buffer, "application/zip");
  allWarnings.push(...magicResult.warnings);
  if (magicResult.blockedInStrictMode) blockedInStrictMode = true;

  const pathResult = validateFilePath(filename);
  allWarnings.push(...pathResult.warnings);
  if (pathResult.blockedInStrictMode) blockedInStrictMode = true;

  return {
    valid:
      allWarnings.filter((w) => w.severity === "critical").length === 0,
    warnings: allWarnings,
    blockedInStrictMode,
  };
}

export function mergeValidationResults(
  results: ValidationResult[]
): ValidationResult {
  const allWarnings: ValidationWarning[] = [];
  let anyBlocked = false;

  for (const result of results) {
    allWarnings.push(...result.warnings);
    if (result.blockedInStrictMode) anyBlocked = true;
  }

  return {
    valid: allWarnings.filter((w) => w.severity === "critical").length === 0,
    warnings: allWarnings,
    blockedInStrictMode: anyBlocked,
  };
}
