import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { computeKey } from "./keys.js";

export interface IncrementalPlan {
  reuse: Array<{ stage: string; cache_key: string; reason: string }>;
  rebuild: Array<{ stage: string; reason: string }>;
  invalidated: Array<{ stage: string; cache_key: string; reason: string }>;
}

export function planIncremental(previousRunDir: string, currentInputs: unknown): IncrementalPlan {
  const plan: IncrementalPlan = { reuse: [], rebuild: [], invalidated: [] };

  if (!previousRunDir || !existsSync(previousRunDir)) {
    const inputObj = typeof currentInputs === "object" && currentInputs !== null ? currentInputs as Record<string, unknown> : {};
    const stages = Object.keys(inputObj);
    if (stages.length === 0) {
      plan.rebuild.push({ stage: "all", reason: "no previous run found and no stage inputs provided" });
    } else {
      for (const stage of stages) {
        plan.rebuild.push({ stage, reason: "no previous run directory found" });
      }
    }
    return plan;
  }

  const manifestPath = join(previousRunDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    plan.rebuild.push({ stage: "all", reason: "previous run manifest not found" });
    return plan;
  }

  let previousManifest: Record<string, unknown>;
  try {
    previousManifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  } catch {
    plan.rebuild.push({ stage: "all", reason: "previous run manifest is corrupted" });
    return plan;
  }

  const previousStages = (previousManifest.stage_order as string[]) || [];
  const inputObj = typeof currentInputs === "object" && currentInputs !== null ? currentInputs as Record<string, unknown> : {};

  for (const stage of previousStages) {
    const stageDir = join(previousRunDir, "stages", stage);
    const currentStageInput = inputObj[stage];

    if (!existsSync(stageDir)) {
      plan.rebuild.push({ stage, reason: "previous stage output directory missing" });
      continue;
    }

    const currentKey = computeKey(stage, currentStageInput ?? null, "v1");
    const previousHashPath = join(stageDir, ".cache_key");

    if (!existsSync(previousHashPath)) {
      plan.rebuild.push({ stage, reason: "no previous cache key recorded" });
      continue;
    }

    const previousCacheKey = readFileSync(previousHashPath, "utf-8").trim();

    if (shouldReuse(stage, previousCacheKey, currentKey.key)) {
      plan.reuse.push({ stage, cache_key: currentKey.key, reason: "input hash matches previous run" });
    } else {
      plan.invalidated.push({ stage, cache_key: previousCacheKey, reason: "input hash changed" });
      plan.rebuild.push({ stage, reason: "inputs changed since previous run" });
    }
  }

  for (const stage of Object.keys(inputObj)) {
    if (!previousStages.includes(stage)) {
      plan.rebuild.push({ stage, reason: "new stage not present in previous run" });
    }
  }

  return plan;
}

export function shouldReuse(_stage: string, previousHash: string, currentHash: string): boolean {
  return previousHash === currentHash;
}

export function hashStageInputs(stage: string, inputs: unknown): string {
  return computeKey(stage, inputs, "v1").input_hash;
}

export function hashDirectory(dirPath: string): string {
  if (!existsSync(dirPath)) {
    throw new Error(`ERR-CACHE-003: directory does not exist: ${dirPath}`);
  }
  const hash = createHash("sha256");
  const entries = readdirSync(dirPath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isFile()) {
      const content = readFileSync(fullPath);
      hash.update(entry.name);
      hash.update(content);
    } else if (entry.isDirectory()) {
      hash.update(entry.name);
      hash.update(hashDirectory(fullPath));
    }
  }
  return hash.digest("hex");
}
