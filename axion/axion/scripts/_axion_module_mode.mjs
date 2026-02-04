import fs from "node:fs";
import path from "node:path";

export const AXION_MODULE_ORDER = [
  "architecture",
  "systems",
  "contracts",
  "database",
  "data",
  "auth",
  "backend",
  "integrations",
  "state",
  "frontend",
  "fullstack",
  "testing",
  "quality",
  "security",
  "devops",
  "cloud",
  "devex",
  "mobile",
  "desktop",
];

/**
 * Module prerequisite dependencies.
 * "contracts" and "security" are virtual modules - their artifacts
 * live in source_docs/registry or inside other domain packs.
 */
export const AXION_PREREQS = {
  architecture: [],
  systems: ["architecture"],

  contracts: ["architecture"],

  database: ["contracts", "architecture"],
  data: ["database", "contracts"],

  auth: ["database", "contracts"],
  backend: ["auth", "database", "contracts"],

  integrations: ["backend", "auth", "contracts"],

  state: ["backend", "contracts"],
  frontend: ["state", "backend", "contracts"],

  fullstack: ["frontend", "backend", "database", "contracts"],

  testing: ["fullstack"],
  quality: ["testing"],

  security: ["backend", "frontend", "integrations", "auth", "contracts"],

  devops: ["backend", "frontend"],
  cloud: ["devops"],
  devex: ["devops"],

  mobile: ["backend", "contracts"],
  desktop: ["backend", "contracts"],
};

/**
 * Parse command line arguments for module mode.
 * @param {string[]} argv - process.argv
 * @returns {{ module: string|null, all: boolean, modules: string[] }}
 */
export function parseModuleArgs(argv) {
  let module = null;
  let all = false;

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--module") module = argv[++i] ?? null;
    else if (a === "--all") all = true;
  }

  if (!module && !all) all = true;

  if (module && !AXION_MODULE_ORDER.includes(module)) {
    failJson({
      status: "invalid_module",
      module,
      valid: AXION_MODULE_ORDER,
    });
  }

  const modules = module ? [module] : AXION_MODULE_ORDER.slice();
  return { module, all, modules };
}

/**
 * Get the path for a stage marker file.
 * @param {string} stage - Stage name (generate, seed, draft, review, verify)
 * @param {string} module - Module name
 * @returns {string}
 */
export function markerPath(stage, module) {
  return path.join(
    "axion",
    "source_docs",
    "registry",
    "stage_markers",
    stage,
    `${module}.json`
  );
}

/**
 * Check if a stage is done for a module.
 * @param {string} stage - Stage name
 * @param {string} module - Module name
 * @returns {boolean}
 */
export function isStageDone(stage, module) {
  const p = markerPath(stage, module);
  if (!fs.existsSync(p)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    return data?.status === "DONE";
  } catch {
    return false;
  }
}

/**
 * Mark a stage as done for a module.
 * @param {string} stage - Stage name
 * @param {string} module - Module name
 * @param {object} extra - Additional data to include
 */
export function markStageDone(stage, module, extra = {}) {
  const p = markerPath(stage, module);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(
    p,
    JSON.stringify(
      {
        status: "DONE",
        stage,
        module,
        timestamp: new Date().toISOString(),
        ...extra,
      },
      null,
      2
    )
  );
}

/**
 * Ensure prerequisites are met for a stage/module.
 * Fails with blocked_by JSON if prerequisites are missing.
 * @param {object} options
 * @param {string} options.stageName - Current stage name
 * @param {string} options.module - Current module name
 * @param {function} options.stagePrereq - Function to check if a module's prereq stage is done
 */
export function ensurePrereqs({ stageName, module, stagePrereq }) {
  const prereqs = AXION_PREREQS[module] ?? [];
  const missing = prereqs.filter((m) => !stagePrereq(m));
  if (missing.length) {
    failJson({
      status: "blocked_by",
      stage: stageName,
      module,
      missing,
      hint: missing.map(
        (m) => `run: node axion/scripts/axion-${stageName}.mjs --module ${m}`
      ),
    });
  }
}

/**
 * Write the global verify status file.
 * @param {object} payload - Status payload
 */
export function writeVerifyStatus(payload) {
  const outPath = path.join("axion", "source_docs", "registry", "verify_status.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
}

/**
 * Read the global verify status file.
 * @returns {object|null}
 */
export function readVerifyStatus() {
  const p = path.join("axion", "source_docs", "registry", "verify_status.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Output JSON and exit with error code.
 * @param {object} obj - Error object to output
 */
export function failJson(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + "\n");
  process.exit(1);
}
