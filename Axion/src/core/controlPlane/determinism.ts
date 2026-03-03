import type { RunContext } from "../../types/controlPlane.js";
import { sha256 } from "../../utils/hash.js";

const NOISE_FIELDS = new Set([
  "run_id",
  "created_at",
  "updated_at",
  "generated_at",
  "started_at",
  "finished_at",
  "completed_at",
  "captured_at",
  "appended_at",
  "recorded_at",
  "evaluated_at",
  "timestamp",
  "hostname",
  "os_version",
  "ci_run_id",
  "runner_id",
  "environment_fingerprint",
]);

export function normalizeRunContext(context: RunContext): RunContext {
  return {
    run_id: context.run_id,
    mode_id: context.mode_id?.toLowerCase().trim(),
    run_profile_id: context.run_profile_id?.toLowerCase().trim(),
    risk_class: context.risk_class,
    executor_type_default: context.executor_type_default,
    targets: {
      platforms: [...context.targets.platforms].sort(),
      stack: context.targets.stack ? [...context.targets.stack].sort() : undefined,
      domains: [...context.targets.domains].sort(),
    },
  };
}

export function isolateNoiseFields(
  artifact: Record<string, unknown>,
  customNoiseFields?: Set<string>,
): { cleaned: Record<string, unknown>; noise: Record<string, unknown> } {
  const noiseSet = customNoiseFields ?? NOISE_FIELDS;
  const cleaned: Record<string, unknown> = {};
  const noise: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(artifact)) {
    if (noiseSet.has(key)) {
      noise[key] = value;
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const nested = isolateNoiseFields(value as Record<string, unknown>, noiseSet);
      cleaned[key] = nested.cleaned;
      if (Object.keys(nested.noise).length > 0) {
        noise[key] = nested.noise;
      }
    } else {
      cleaned[key] = value;
    }
  }
  return { cleaned, noise };
}

export function goldenCompare(
  expected: Record<string, unknown>,
  actual: Record<string, unknown>,
  customNoiseFields?: Set<string>,
): { match: boolean; diffs: string[] } {
  const { cleaned: cleanedExpected } = isolateNoiseFields(expected, customNoiseFields);
  const { cleaned: cleanedActual } = isolateNoiseFields(actual, customNoiseFields);

  const diffs: string[] = [];
  compareObjects(cleanedExpected, cleanedActual, "", diffs);
  return { match: diffs.length === 0, diffs };
}

function compareObjects(
  expected: unknown,
  actual: unknown,
  path: string,
  diffs: string[],
): void {
  if (expected === actual) return;

  if (typeof expected !== typeof actual) {
    diffs.push(`${path || "root"}: type mismatch (expected ${typeof expected}, got ${typeof actual})`);
    return;
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) {
      diffs.push(`${path}: array length mismatch (expected ${expected.length}, got ${actual.length})`);
    }
    const len = Math.min(expected.length, actual.length);
    for (let i = 0; i < len; i++) {
      compareObjects(expected[i], actual[i], `${path}[${i}]`, diffs);
    }
    return;
  }

  if (typeof expected === "object" && expected !== null && actual !== null) {
    const expObj = expected as Record<string, unknown>;
    const actObj = actual as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(expObj), ...Object.keys(actObj)]);
    for (const key of [...allKeys].sort()) {
      if (!(key in expObj)) {
        diffs.push(`${path}.${key}: unexpected field in actual`);
      } else if (!(key in actObj)) {
        diffs.push(`${path}.${key}: missing in actual`);
      } else {
        compareObjects(expObj[key], actObj[key], `${path}.${key}`, diffs);
      }
    }
    return;
  }

  if (expected !== actual) {
    diffs.push(`${path || "root"}: value mismatch (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
  }
}

export function computeDeterminismHash(artifact: Record<string, unknown>): string {
  const { cleaned } = isolateNoiseFields(artifact);
  const sortedJson = JSON.stringify(sortDeep(cleaned));
  return sha256(sortedJson);
}

function sortDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortDeep);
  if (typeof obj === "object" && obj !== null) {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortDeep((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}
