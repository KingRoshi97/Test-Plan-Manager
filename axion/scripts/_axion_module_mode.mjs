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
 * Authoritative list of document types generated per module.
 * Generate, review, and verify scripts all use this same list.
 * BELS is excluded because it is created by the draft stage, not generate.
 */
export const AXION_DOC_TYPES = [
  "DDES",
  "UX_Foundations",
  "UI_Constraints",
  "DIM",
  "SCREENMAP",
  "TESTPLAN",
  "COMPONENT_LIBRARY",
  "COPY_GUIDE",
];

/**
 * Subset of doc types that are required for verify to pass.
 * These are the critical docs without which a module cannot be locked.
 */
export const AXION_REQUIRED_DOC_TYPES = [
  "BELS",
  "DDES",
  "DIM",
  "SCREENMAP",
  "TESTPLAN",
];

/**
 * Doc types that the review script checks for required sections.
 */
export const AXION_REVIEWED_DOC_TYPES = {
  BELS: ["Policy Rules", "State Machines", "Validation Rules", "Reason Codes"],
  DDES: ["Overview", "Entities", "Key Responsibilities"],
  DIM: ["Exposed Interfaces", "Consumed Interfaces"],
};

/**
 * Load module prerequisite dependencies from domains.json (single source of truth).
 * Falls back to an empty object if domains.json cannot be read.
 * @returns {Record<string, string[]>}
 */
export function loadPrereqs() {
  const configPath = "axion/config/domains.json";
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const prereqs = {};
    for (const mod of config.modules || []) {
      prereqs[mod.slug] = mod.dependencies || [];
    }
    return prereqs;
  } catch {
    return {};
  }
}

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
 * Writes to axion/registry/stage_markers/{stage}/{module}.json
 * which is where the server/routes.ts orchestrator reads from.
 * @param {string} stage - Stage name (generate, seed, draft, review, verify)
 * @param {string} module - Module name
 * @returns {string}
 */
export function markerPath(stage, module) {
  return path.join(
    "axion",
    "registry",
    "stage_markers",
    stage,
    `${module}.json`
  );
}

/**
 * Check if a stage is done for a module.
 * Checks both axion/registry/ and axion/docs/registry/ for backward compat.
 * @param {string} stage - Stage name
 * @param {string} module - Module name
 * @returns {boolean}
 */
export function isStageDone(stage, module) {
  const paths = [
    markerPath(stage, module),
    path.join("axion", "docs", "registry", "stage_markers", stage, `${module}.json`),
  ];
  for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(p, "utf8"));
      if (data?.status === "DONE") return true;
    } catch {
      continue;
    }
  }
  return false;
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
 * Loads prereqs from domains.json at runtime (single source of truth).
 * Fails with blocked_by JSON if prerequisites are missing.
 * @param {object} options
 * @param {string} options.stageName - Current stage name
 * @param {string} options.module - Current module name
 * @param {function} options.stagePrereq - Function to check if a module's prereq stage is done
 */
export function ensurePrereqs({ stageName, module, stagePrereq }) {
  const prereqs = loadPrereqs()[module] ?? [];
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
 * Writes to axion/registry/ where the orchestrator reads from.
 * @param {object} payload - Status payload
 */
export function writeVerifyStatus(payload) {
  const outPath = path.join("axion", "registry", "verify_status.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
}

/**
 * Read the global verify status file.
 * Checks both axion/registry/ and axion/docs/registry/ for backward compat.
 * @returns {object|null}
 */
export function readVerifyStatus() {
  const paths = [
    path.join("axion", "registry", "verify_status.json"),
    path.join("axion", "docs", "registry", "verify_status.json"),
  ];
  for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    try {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Output JSON and exit with error code.
 * @param {object} obj - Error object to output
 */
export function failJson(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + "\n");
  process.exit(1);
}
