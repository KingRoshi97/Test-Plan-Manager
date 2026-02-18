import * as fs from "fs";
import * as path from "path";

export interface StageEstimate {
  medianMs: number;
  sampleCount: number;
}

export interface DependencyBatch {
  dependencies: string[];
  modules: string[];
}

const DEFAULT_ESTIMATES: Record<string, number> = {
  generate: 2000,
  seed: 3000,
  draft: 45000,
  review: 30000,
  "content-fill": 60000,
  "draft-fill": 90000,
  verify: 5000,
  lock: 2000,
  package: 5000,
};

function getModuleCount(buildRoot: string): number {
  const cfgPath = path.join(buildRoot, "axion", "config", "domains.json");
  try {
    const raw = fs.readFileSync(cfgPath, "utf-8");
    const config = JSON.parse(raw);
    if (Array.isArray(config.modules)) return config.modules.length;
  } catch {
    // fall through
  }
  const domainsDir = path.join(buildRoot, "axion", "domains");
  try {
    return fs
      .readdirSync(domainsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith(".")).length;
  } catch {
    return 1;
  }
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function tryReadRunHistory(dirPath: string): Record<string, number[]> {
  const durations: Record<string, number[]> = {};

  let files: string[];
  try {
    files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
  } catch {
    return durations;
  }

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dirPath, file), "utf-8");
      const data = JSON.parse(raw);
      if (!Array.isArray(data.stages)) continue;

      for (const stage of data.stages) {
        if (
          stage.status !== "success" ||
          !stage.started_at ||
          !stage.finished_at
        )
          continue;

        const start = new Date(stage.started_at).getTime();
        const end = new Date(stage.finished_at).getTime();
        if (isNaN(start) || isNaN(end)) continue;

        const durationMs = end - start;
        if (durationMs < 0) continue;

        const stageName = stage.stage as string;
        if (!durations[stageName]) durations[stageName] = [];
        durations[stageName].push(durationMs);
      }
    } catch {
      // skip corrupt files
    }
  }

  return durations;
}

export function getStageEstimates(
  buildRoot: string
): Record<string, StageEstimate> {
  let historyDir = path.join(buildRoot, "axion", "registry", "run_history");

  if (!fs.existsSync(historyDir)) {
    historyDir = path.resolve("./axion/registry/run_history");
  }

  const durations = tryReadRunHistory(historyDir);

  const result: Record<string, StageEstimate> = {};

  for (const [stage, defaultMs] of Object.entries(DEFAULT_ESTIMATES)) {
    const samples = durations[stage];
    if (samples && samples.length > 0) {
      result[stage] = {
        medianMs: median(samples),
        sampleCount: samples.length,
      };
    } else {
      result[stage] = {
        medianMs: defaultMs,
        sampleCount: 0,
      };
    }
  }

  for (const [stage, samples] of Object.entries(durations)) {
    if (!result[stage]) {
      result[stage] = {
        medianMs: median(samples),
        sampleCount: samples.length,
      };
    }
  }

  return result;
}

export function getEstimatedTotalMs(
  steps: string[],
  buildRoot: string
): { totalMs: number; perStep: Record<string, number> } {
  const estimates = getStageEstimates(buildRoot);
  const moduleCount = getModuleCount(buildRoot);
  const perStep: Record<string, number> = {};
  let totalMs = 0;

  for (const step of steps) {
    const estimate = estimates[step];
    const perModuleMs = estimate
      ? estimate.medianMs
      : DEFAULT_ESTIMATES[step] ?? 5000;

    const stepMs = perModuleMs * moduleCount;
    perStep[step] = stepMs;
    totalMs += stepMs;
  }

  return { totalMs, perStep };
}

interface DomainModule {
  slug: string;
  dependencies: string[];
}

export function computeBatches(configPath?: string): DependencyBatch[] {
  const cfgPath = configPath ?? path.resolve("axion/config/domains.json");

  let config: { modules?: DomainModule[] };
  try {
    const raw = fs.readFileSync(cfgPath, "utf-8");
    config = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!config.modules || !Array.isArray(config.modules) || config.modules.length === 0) {
    return [];
  }

  const allSlugs = new Set(config.modules.map((m) => m.slug));
  const moduleMap = new Map<string, string[]>();
  for (const m of config.modules) {
    moduleMap.set(m.slug, m.dependencies ?? []);
  }

  const placed = new Set<string>();
  const batches: DependencyBatch[] = [];
  let remaining = new Set(allSlugs);
  let lastSize = remaining.size + 1;

  while (remaining.size > 0 && remaining.size < lastSize) {
    lastSize = remaining.size;

    const groups = new Map<string, string[]>();

    for (const slug of remaining) {
      const deps = moduleMap.get(slug)!;
      const unmetDeps = deps.filter((d) => !placed.has(d));

      if (unmetDeps.length === 0) {
        const key = [...deps].sort().join(",");
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(slug);
      }
    }

    if (groups.size === 0) break;

    for (const [key, modules] of groups) {
      const deps = key === "" ? [] : key.split(",");
      batches.push({ dependencies: deps, modules: modules.sort() });
      for (const m of modules) {
        placed.add(m);
        remaining.delete(m);
      }
    }
  }

  if (remaining.size > 0) {
    process.stderr.write(
      `[pipeline-timing] Warning: skipping modules with circular dependencies: ${[...remaining].join(", ")}\n`
    );
  }

  return batches;
}

export function computeBatchesFromBuildRoot(buildRoot: string): DependencyBatch[] {
  const cfgPath = path.join(buildRoot, "axion", "config", "domains.json");
  if (!fs.existsSync(cfgPath)) {
    return computeBatches();
  }
  return computeBatches(cfgPath);
}
