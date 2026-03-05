import { existsSync, readFileSync } from "node:fs";
import { join, normalize, isAbsolute } from "node:path";
import { sha256 } from "../../utils/hash.js";
import type { GateCheck } from "./registry.js";

export interface EvidenceEntry {
  path: string;
  pointer: string;
  details: Record<string, unknown>;
}

export interface CheckResult {
  pass: boolean;
  failure_code: string | null;
  evidence: EvidenceEntry[];
}

function resolvePointer(obj: unknown, pointer: string): { found: boolean; value: unknown } {
  if (pointer === "" || pointer === "/") {
    return { found: true, value: obj };
  }
  const parts = pointer.split("/").filter(Boolean);
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || typeof current !== "object") {
      return { found: false, value: undefined };
    }
    const rec = current as Record<string, unknown>;
    if (!(part in rec)) {
      return { found: false, value: undefined };
    }
    current = rec[part];
  }
  return { found: true, value: current };
}

function readAndParse(path: string): { data: unknown; error: string | null } {
  try {
    const content = readFileSync(path, "utf-8");
    return { data: JSON.parse(content), error: null };
  } catch {
    return { data: null, error: "JSON_PARSE_ERROR" };
  }
}

function evalFileExists(check: GateCheck): CheckResult {
  const filePath = check.path!;
  const exists = existsSync(filePath);
  return {
    pass: exists,
    failure_code: exists ? null : "E_FILE_MISSING",
    evidence: [{
      path: filePath,
      pointer: "",
      details: exists ? {} : { error: "file not found" },
    }],
  };
}

function evalJsonValid(check: GateCheck): CheckResult {
  const filePath = check.path!;
  if (!existsSync(filePath)) {
    return {
      pass: false,
      failure_code: "E_FILE_MISSING",
      evidence: [{ path: filePath, pointer: "", details: { error: "file not found" } }],
    };
  }
  const { error } = readAndParse(filePath);
  return {
    pass: error === null,
    failure_code: error === null ? null : "E_JSON_INVALID",
    evidence: [{
      path: filePath,
      pointer: "",
      details: error ? { error } : {},
    }],
  };
}

function evalJsonHas(check: GateCheck): CheckResult {
  const filePath = check.path!;
  const pointer = check.pointer!;
  if (!existsSync(filePath)) {
    return {
      pass: false,
      failure_code: "E_FILE_MISSING",
      evidence: [{ path: filePath, pointer, details: { error: "file not found" } }],
    };
  }
  const { data, error } = readAndParse(filePath);
  if (error) {
    return {
      pass: false,
      failure_code: "E_JSON_INVALID",
      evidence: [{ path: filePath, pointer, details: { error } }],
    };
  }
  const { found } = resolvePointer(data, pointer);
  return {
    pass: found,
    failure_code: found ? null : "E_REQUIRED_FIELD_MISSING",
    evidence: [{
      path: filePath,
      pointer,
      details: found ? {} : { required: true },
    }],
  };
}

function evalCoverageGte(check: GateCheck): CheckResult {
  const filePath = check.path!;
  const pointer = check.pointer!;
  const min = check.min!;
  if (!existsSync(filePath)) {
    return {
      pass: false,
      failure_code: "E_FILE_MISSING",
      evidence: [{ path: filePath, pointer, details: { error: "file not found" } }],
    };
  }
  const { data, error } = readAndParse(filePath);
  if (error) {
    return {
      pass: false,
      failure_code: "E_JSON_INVALID",
      evidence: [{ path: filePath, pointer, details: { error } }],
    };
  }
  const { found, value } = resolvePointer(data, pointer);
  if (!found || typeof value !== "number") {
    return {
      pass: false,
      failure_code: "E_COVERAGE_FIELD_INVALID",
      evidence: [{ path: filePath, pointer, details: { error: "field missing or not a number" } }],
    };
  }
  const passes = value >= min;
  return {
    pass: passes,
    failure_code: passes ? null : "E_COVERAGE_BELOW_MIN",
    evidence: [{
      path: filePath,
      pointer,
      details: { min_required: min, actual: value },
    }],
  };
}

function evalJsonEq(check: GateCheck): CheckResult {
  const filePath = check.path!;
  const pointer = check.pointer!;
  const expected = check.expected;
  if (!existsSync(filePath)) {
    return {
      pass: false,
      failure_code: "E_FILE_MISSING",
      evidence: [{ path: filePath, pointer, details: { error: "file not found" } }],
    };
  }
  const { data, error } = readAndParse(filePath);
  if (error) {
    return {
      pass: false,
      failure_code: "E_JSON_INVALID",
      evidence: [{ path: filePath, pointer, details: { error } }],
    };
  }
  const { found, value } = resolvePointer(data, pointer);
  if (!found) {
    return {
      pass: false,
      failure_code: "E_REQUIRED_FIELD_MISSING",
      evidence: [{ path: filePath, pointer, details: { error: "field not found" } }],
    };
  }
  const passes = value === expected;
  return {
    pass: passes,
    failure_code: passes ? null : "E_VALUE_MISMATCH",
    evidence: [{
      path: filePath,
      pointer,
      details: { expected, actual: value },
    }],
  };
}

function isPathSafe(p: string): boolean {
  if (isAbsolute(p)) return false;
  if (p.includes("..")) return false;
  if (p.includes("\\")) return false;
  return true;
}

function evalVerifyHashManifest(check: GateCheck): CheckResult {
  const manifestPath = check.manifest_path!;
  const bundleRoot = check.bundle_root!;

  if (!existsSync(manifestPath)) {
    return {
      pass: false,
      failure_code: "E_PACK_MANIFEST_MISSING",
      evidence: [{ path: manifestPath, pointer: "", details: { error: "manifest not found" } }],
    };
  }

  let manifestData: unknown;
  try {
    manifestData = JSON.parse(readFileSync(manifestPath, "utf-8"));
  } catch {
    return {
      pass: false,
      failure_code: "E_PACK_MANIFEST_INVALID_JSON",
      evidence: [{ path: manifestPath, pointer: "", details: { error: "JSON_PARSE_ERROR" } }],
    };
  }

  const manifest = manifestData as Record<string, unknown>;

  if (manifest.algorithm !== "sha256") {
    return {
      pass: false,
      failure_code: "E_PACK_MANIFEST_BAD_ALGORITHM",
      evidence: [{
        path: manifestPath,
        pointer: "/algorithm",
        details: { expected: "sha256", actual: manifest.algorithm ?? null },
      }],
    };
  }

  const files = manifest.files;
  if (!Array.isArray(files) || files.length === 0) {
    return {
      pass: false,
      failure_code: "E_PACK_MANIFEST_FILES_INVALID",
      evidence: [{
        path: manifestPath,
        pointer: "/files",
        details: { error: "files must be a non-empty array" },
      }],
    };
  }

  for (let i = 0; i < files.length; i++) {
    const entry = files[i] as Record<string, unknown>;

    if (typeof entry.path !== "string" || typeof entry.sha256 !== "string") {
      return {
        pass: false,
        failure_code: "E_PACK_ENTRY_INVALID",
        evidence: [{
          path: manifestPath,
          pointer: `/files/${i}`,
          details: { error: "entry missing path or sha256" },
        }],
      };
    }

    const entryPath = entry.path as string;
    const expectedHash = entry.sha256 as string;

    if (!isPathSafe(entryPath)) {
      return {
        pass: false,
        failure_code: "E_PACK_ENTRY_PATH_INVALID",
        evidence: [{
          path: manifestPath,
          pointer: `/files/${i}/path`,
          details: { path: entryPath },
        }],
      };
    }

    if (!/^[0-9a-f]{64}$/.test(expectedHash)) {
      return {
        pass: false,
        failure_code: "E_PACK_ENTRY_HASH_INVALID",
        evidence: [{
          path: manifestPath,
          pointer: `/files/${i}/sha256`,
          details: { sha256: expectedHash },
        }],
      };
    }

    const fullPath = join(bundleRoot, entryPath);
    const normalizedPath = normalize(fullPath);
    const normalizedRoot = normalize(bundleRoot);
    if (!normalizedPath.startsWith(normalizedRoot)) {
      return {
        pass: false,
        failure_code: "E_PACK_ENTRY_PATH_INVALID",
        evidence: [{
          path: manifestPath,
          pointer: `/files/${i}/path`,
          details: { path: entryPath, error: "resolves outside bundle root" },
        }],
      };
    }

    if (!existsSync(fullPath)) {
      return {
        pass: false,
        failure_code: "E_PACK_BUNDLE_FILE_MISSING",
        evidence: [{
          path: manifestPath,
          pointer: `/files/${i}/path`,
          details: { bundle_file: fullPath },
        }],
      };
    }

    let fileBytes: string;
    try {
      fileBytes = readFileSync(fullPath, "utf-8");
    } catch {
      return {
        pass: false,
        failure_code: "E_PACK_BUNDLE_FILE_UNREADABLE",
        evidence: [{
          path: manifestPath,
          pointer: `/files/${i}/path`,
          details: { bundle_file: fullPath },
        }],
      };
    }

    const actualHash = sha256(fileBytes);
    if (actualHash !== expectedHash) {
      return {
        pass: false,
        failure_code: "E_PACK_HASH_MISMATCH",
        evidence: [{
          path: manifestPath,
          pointer: `/files/${i}/sha256`,
          details: {
            bundle_file: fullPath,
            expected_sha256: expectedHash,
            actual_sha256: actualHash,
          },
        }],
      };
    }
  }

  return {
    pass: true,
    failure_code: null,
    evidence: [{
      path: manifestPath,
      pointer: "",
      details: {
        algorithm: "sha256",
        bundle_root: bundleRoot,
        files_expected: files.length,
        files_verified: files.length,
      },
    }],
  };
}

const REGISTERED_OPS = new Set([
  "file_exists",
  "json_valid",
  "json_has",
  "coverage_gte",
  "json_eq",
  "verify_hash_manifest",
]);

export function isRegisteredOperator(op: string): boolean {
  return REGISTERED_OPS.has(op);
}

export function evalCheck(check: GateCheck): CheckResult {
  if (!isRegisteredOperator(check.op)) {
    return {
      pass: false,
      failure_code: "E_UNKNOWN_OP",
      evidence: [{
        path: "",
        pointer: "",
        details: {
          op: check.op,
          registered_ops: Array.from(REGISTERED_OPS),
          error: `Operator '${check.op}' is not registered. Only registered operators from gate_dsl.schema are allowed.`,
        },
      }],
    };
  }

  switch (check.op) {
    case "file_exists":
      return evalFileExists(check);
    case "json_valid":
      return evalJsonValid(check);
    case "json_has":
      return evalJsonHas(check);
    case "coverage_gte":
      return evalCoverageGte(check);
    case "json_eq":
      return evalJsonEq(check);
    case "verify_hash_manifest":
      return evalVerifyHashManifest(check);
    default:
      return {
        pass: false,
        failure_code: "E_UNKNOWN_OP",
        evidence: [{ path: "", pointer: "", details: { op: check.op } }],
      };
  }
}
