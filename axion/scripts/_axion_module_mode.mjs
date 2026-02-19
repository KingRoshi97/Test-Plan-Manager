import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AXION_ROOT = path.resolve(__dirname, "..", "..");
const DOMAINS_CONFIG_PATH = path.join(AXION_ROOT, "axion", "config", "domains.json");

const FALLBACK_MODULE_ORDER = [
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
 * Load modules from domains.json and return them topologically sorted
 * by dependency order with slug as stable tiebreaker.
 * Falls back to FALLBACK_MODULE_ORDER with a warning if domains.json
 * cannot be read.
 * @returns {string[]}
 */
function loadModuleOrder() {
  try {
    const config = JSON.parse(fs.readFileSync(DOMAINS_CONFIG_PATH, "utf8"));
    const modules = config.modules || [];
    if (!modules.length) {
      console.error("[WARN] domains.json has no modules, using fallback order");
      return FALLBACK_MODULE_ORDER.slice();
    }
    return topoSort(modules);
  } catch (err) {
    console.error(`[WARN] Could not load ${DOMAINS_CONFIG_PATH}: ${err.message}. Using fallback module order.`);
    return FALLBACK_MODULE_ORDER.slice();
  }
}

/**
 * Topological sort of modules respecting dependencies.
 * Uses Kahn's algorithm with slug as stable tiebreaker for deterministic ordering.
 * @param {{ slug: string, dependencies?: string[] }[]} modules
 * @returns {string[]}
 */
function topoSort(modules) {
  const slugs = new Set(modules.map((m) => m.slug));
  const deps = {};
  const inDegree = {};
  for (const m of modules) {
    deps[m.slug] = (m.dependencies || []).filter((d) => slugs.has(d));
    inDegree[m.slug] = deps[m.slug].length;
  }

  const queue = Object.keys(inDegree)
    .filter((s) => inDegree[s] === 0)
    .sort();

  const sorted = [];
  while (queue.length) {
    queue.sort();
    const current = queue.shift();
    sorted.push(current);

    for (const m of modules) {
      if (deps[m.slug]?.includes(current)) {
        inDegree[m.slug]--;
        if (inDegree[m.slug] === 0) {
          queue.push(m.slug);
        }
      }
    }
  }

  if (sorted.length !== modules.length) {
    const missing = modules.map((m) => m.slug).filter((s) => !sorted.includes(s));
    console.error(`[WARN] Circular dependency detected for modules: ${missing.join(", ")}. Appending in slug order.`);
    missing.sort();
    sorted.push(...missing);
  }

  return sorted;
}

/**
 * Module order derived from domains.json at runtime.
 * Topologically sorted by dependencies with slug as stable tiebreaker.
 */
export const AXION_MODULE_ORDER = loadModuleOrder();

/**
 * Authoritative list of ALL document types that can be generated per module.
 * Used as fallback when a module does not specify its own templates in domains.json.
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
 * Get the list of doc types applicable to a specific module.
 * Reads the module's `templates` array from domains.json.
 * Falls back to AXION_DOC_TYPES if no templates field is defined.
 * @param {string} slug - Module slug
 * @param {object} [options] - Options
 * @param {boolean} [options.excludeBels=true] - Exclude BELS (created by draft, not generate)
 * @returns {string[]}
 */
export function getModuleDocTypes(slug, options = {}) {
  const { excludeBels = true } = options;
  const configPath = DOMAINS_CONFIG_PATH;
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const mod = (config.modules || []).find(m => m.slug === slug);
    if (mod && Array.isArray(mod.templates) && mod.templates.length > 0) {
      const templates = excludeBels
        ? mod.templates.filter(t => t !== "BELS")
        : mod.templates;
      return templates;
    }
  } catch {}
  return [...AXION_DOC_TYPES];
}

/**
 * Get the FULL list of doc types for a module, including BELS.
 * Used by review, verify, and content-fill to check all expected files.
 * @param {string} slug - Module slug
 * @returns {string[]}
 */
export function getModuleAllDocTypes(slug) {
  return getModuleDocTypes(slug, { excludeBels: false });
}

/**
 * Subset of doc types that are required for verify to pass.
 * These are the critical docs without which a module cannot be locked.
 * Filtered against the module's templates list if available.
 */
export const AXION_REQUIRED_DOC_TYPES = [
  "BELS",
  "DDES",
  "DIM",
  "SCREENMAP",
  "TESTPLAN",
];

/**
 * Get the required doc types for a specific module.
 * Intersects AXION_REQUIRED_DOC_TYPES with the module's templates list.
 * @param {string} slug - Module slug
 * @returns {string[]}
 */
export function getModuleRequiredDocTypes(slug) {
  const moduleTemplates = getModuleAllDocTypes(slug);
  return AXION_REQUIRED_DOC_TYPES.filter(t => moduleTemplates.includes(t));
}

/**
 * Doc types that the review script checks for required sections.
 */
export const AXION_REVIEWED_DOC_TYPES = {
  BELS: ["Policy Rules", "State Machines", "Validation Rules", "Reason Codes"],
  DDES: ["Purpose", "Entities", "Key Responsibilities"],
  DIM: ["Exposed Interfaces", "Consumed Interfaces"],
};

/**
 * Load module prerequisite dependencies from domains.json (single source of truth).
 * Falls back to an empty object if domains.json cannot be read.
 * @returns {Record<string, string[]>}
 */
export function loadPrereqs() {
  try {
    const config = JSON.parse(fs.readFileSync(DOMAINS_CONFIG_PATH, "utf8"));
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
 * Canonical path for the flat stage markers file.
 * This is the single source of truth for pipeline state.
 * @returns {string}
 */
export function stageMarkersPath() {
  return path.join("axion", "registry", "stage_markers.json");
}

/**
 * Legacy per-file marker path (backward compat, mirror-write only).
 * @param {string} stage - Stage name
 * @param {string} module - Module name
 * @returns {string}
 */
export function legacyMarkerPath(stage, module) {
  return path.join(
    "axion",
    "registry",
    "stage_markers",
    stage,
    `${module}.json`
  );
}

/**
 * @deprecated Use stageMarkersPath() instead. Kept for any external callers.
 */
export function markerPath(stage, module) {
  return legacyMarkerPath(stage, module);
}

/**
 * Read the canonical flat stage markers file.
 * Handles both wrapped format ({ version, markers: { ... } }) and
 * flat format ({ module: { stage: { ... } } }).
 * @returns {Record<string, Record<string, { completed_at: string, status: string }>>}
 */
function readMarkers() {
  const p = stageMarkersPath();
  if (!fs.existsSync(p)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    if (raw.markers && typeof raw.markers === "object") {
      return raw.markers;
    }
    return raw;
  } catch {
    return {};
  }
}

/**
 * Write the canonical flat stage markers file (atomic).
 * Preserves the wrapped format if it was previously used.
 * @param {Record<string, Record<string, object>>} markers
 */
function writeMarkers(markers) {
  const p = stageMarkersPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });

  let hasWrapper = false;
  if (fs.existsSync(p)) {
    try {
      const existing = JSON.parse(fs.readFileSync(p, "utf8"));
      if (existing.markers && typeof existing.markers === "object") {
        hasWrapper = true;
      }
    } catch {}
  }

  const output = hasWrapper
    ? { version: "1.0.0", markers }
    : markers;

  fs.writeFileSync(p, JSON.stringify(output, null, 2), "utf8");
}

/**
 * Check if a stage is done for a module.
 * Reads from the canonical flat stage_markers.json first.
 * Falls back to legacy per-file markers for backward compat.
 * @param {string} stage - Stage name
 * @param {string} module - Module name
 * @returns {boolean}
 */
export function isStageDone(stage, module) {
  const markers = readMarkers();
  const entry = markers?.[module]?.[stage];
  if (entry) {
    return entry.status === "success" || entry.status === "pass";
  }

  const legacyPaths = [
    legacyMarkerPath(stage, module),
    path.join("axion", "docs", "registry", "stage_markers", stage, `${module}.json`),
  ];
  for (const p of legacyPaths) {
    if (!fs.existsSync(p)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(p, "utf8"));
      if (data?.status === "DONE" || data?.status === "success") return true;
    } catch {
      continue;
    }
  }
  return false;
}

/**
 * Mark a stage as done for a module.
 * Writes to canonical flat stage_markers.json with documented schema.
 * Mirror-writes legacy per-file marker for backward compat.
 * @param {string} stage - Stage name
 * @param {string} module - Module name
 * @param {object} extra - Additional data to include (e.g., { report: ... })
 */
export function markStageDone(stage, module, extra = {}) {
  const status = extra.status || "success";
  const completed_at = new Date().toISOString();

  const markers = readMarkers();
  if (!markers[module]) markers[module] = {};
  markers[module][stage] = { status, completed_at, ...extra };
  writeMarkers(markers);

  const legacyPath = legacyMarkerPath(stage, module);
  fs.mkdirSync(path.dirname(legacyPath), { recursive: true });
  fs.writeFileSync(
    legacyPath,
    JSON.stringify(
      {
        status: "DONE",
        stage,
        module,
        timestamp: completed_at,
        ...extra,
      },
      null,
      2
    )
  );
}

/**
 * Mark a stage as failed for a module.
 * @param {string} stage - Stage name
 * @param {string} module - Module name
 * @param {object} extra - Additional data (e.g., { error: "..." })
 */
export function markStageFailed(stage, module, extra = {}) {
  const completed_at = new Date().toISOString();

  const markers = readMarkers();
  if (!markers[module]) markers[module] = {};
  markers[module][stage] = {
    status: "failed",
    completed_at,
    ...extra,
  };
  writeMarkers(markers);

  const legacyPath = legacyMarkerPath(stage, module);
  fs.mkdirSync(path.dirname(legacyPath), { recursive: true });
  fs.writeFileSync(
    legacyPath,
    JSON.stringify(
      {
        status: "FAILED",
        stage,
        module,
        timestamp: completed_at,
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
