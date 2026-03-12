import { createHash } from "node:crypto";
import type {
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRepoFileEntry,
} from "./types.js";

function stableId(prefix: string, ...parts: string[]): string {
  const hash = createHash("sha256").update(parts.join(":")).digest("hex").slice(0, 8);
  return `${prefix}-${hash}`;
}

export function buildRepoInventory(
  derivedInputs: BAQDerivedBuildInputs,
  runDir: string,
): BAQRepoInventory {
  const now = new Date().toISOString();
  const inventoryId = stableId("BAQI", derivedInputs.run_id, derivedInputs.derivation_id);

  const directories = planDirectories(derivedInputs);
  const modules = planModules(derivedInputs);
  const files = planFiles(derivedInputs, modules);

  const filesByLayer: Record<string, number> = {};
  const filesByMethod: Record<string, number> = {};

  for (const f of files) {
    filesByLayer[f.layer] = (filesByLayer[f.layer] ?? 0) + 1;
    filesByMethod[f.generation_method] = (filesByMethod[f.generation_method] ?? 0) + 1;
  }

  return {
    schema_version: "1.0.0",
    inventory_id: inventoryId,
    run_id: derivedInputs.run_id,
    derivation_ref: derivedInputs.derivation_id,
    directories,
    modules,
    files,
    summary: {
      total_directories: directories.length,
      total_modules: modules.length,
      total_files: files.length,
      files_by_layer: filesByLayer,
      files_by_generation_method: filesByMethod,
    },
    created_at: now,
    updated_at: now,
  };
}

function planDirectories(
  derivedInputs: BAQDerivedBuildInputs,
): BAQRepoInventory["directories"] {
  const dirs: BAQRepoInventory["directories"] = [
    { path: "src", purpose: "Source root", layer: "shared", required: true },
    { path: "src/components", purpose: "Shared UI components", layer: "frontend", required: true },
    { path: "src/components/ui", purpose: "Reusable UI primitives", layer: "frontend", required: true },
    { path: "src/pages", purpose: "Route-level page components", layer: "frontend", required: true },
    { path: "src/lib", purpose: "Shared utilities and helpers", layer: "shared", required: true },
    { path: "src/types", purpose: "Type definitions", layer: "shared", required: true },
    { path: "src/hooks", purpose: "React hooks", layer: "frontend", required: false },
    { path: "src/context", purpose: "React context providers", layer: "frontend", required: false },
    { path: "public", purpose: "Static assets", layer: "frontend", required: true },
    { path: "tests", purpose: "Test files", layer: "test", required: false },
    { path: "tests/unit", purpose: "Unit test files", layer: "test", required: false },
    { path: "tests/integration", purpose: "Integration test files", layer: "test", required: false },
  ];

  if (derivedInputs.api_surface.endpoints.length > 0) {
    dirs.push(
      { path: "src/lib/api", purpose: "API client layer", layer: "frontend", required: true },
      { path: "server", purpose: "Server-side code", layer: "backend", required: true },
      { path: "server/routes", purpose: "API route handlers", layer: "backend", required: true },
      { path: "server/middleware", purpose: "Express middleware", layer: "backend", required: false },
    );
  }

  if (derivedInputs.auth_model.auth_type !== "unknown") {
    dirs.push(
      { path: "src/lib/auth", purpose: "Authentication utilities", layer: "security", required: true },
    );
  }

  if (derivedInputs.storage_model.schemas.length > 0) {
    dirs.push(
      { path: "server/db", purpose: "Database access layer", layer: "data", required: true },
      { path: "server/db/migrations", purpose: "Database migrations", layer: "data", required: false },
    );
  }

  return dirs;
}

function planModules(
  derivedInputs: BAQDerivedBuildInputs,
): BAQRepoInventory["modules"] {
  const modules: BAQRepoInventory["modules"] = [];
  const seen = new Set<string>();

  function addModule(path: string, layer: string, purpose: string, sourceRefs: string[]): void {
    if (seen.has(path)) return;
    seen.add(path);
    modules.push({
      module_id: stableId("MOD", path),
      path,
      layer,
      purpose,
      source_refs: sourceRefs,
    });
  }

  addModule("src", "shared", "Application entry point and configuration", []);
  addModule("src/pages", "frontend", "Route-level page components", []);
  addModule("src/components", "frontend", "Shared UI components", []);
  addModule("src/components/ui", "frontend", "Reusable UI primitives", []);
  addModule("src/lib", "shared", "Shared utilities and helpers", []);
  addModule("src/types", "shared", "Type definitions", []);
  addModule("src/hooks", "frontend", "React hooks", []);
  addModule("src/context", "frontend", "React context providers", []);
  addModule("tests", "test", "Test infrastructure", []);

  for (const subsystem of derivedInputs.subsystem_map) {
    const modulePath = subsystem.layer === "frontend"
      ? "src/components"
      : subsystem.layer === "backend"
        ? "server/routes"
        : subsystem.layer === "data"
          ? "server/db"
          : subsystem.layer === "security"
            ? "src/lib/auth"
            : `src/${subsystem.layer}`;
    addModule(modulePath, subsystem.layer, subsystem.description, subsystem.source_refs);
  }

  if (derivedInputs.api_surface.endpoints.length > 0) {
    addModule("src/lib/api", "frontend", "API client functions", []);
    addModule("server/routes", "backend", "API route handlers", []);
    addModule("server/middleware", "backend", "Express middleware", []);
  }

  if (derivedInputs.auth_model.auth_type !== "unknown") {
    addModule("src/lib/auth", "security", "Authentication module", derivedInputs.auth_model.source_refs);
  }

  if (derivedInputs.storage_model.schemas.length > 0) {
    addModule("server/db", "data", "Database access layer", []);
  }

  return modules;
}

function planFiles(
  derivedInputs: BAQDerivedBuildInputs,
  modules: BAQRepoInventory["modules"],
): BAQRepoFileEntry[] {
  const files: BAQRepoFileEntry[] = [];
  const addedPaths = new Set<string>();

  function moduleRefForPath(filePath: string): string {
    const match = modules
      .filter(m => filePath.startsWith(m.path + "/") || filePath === m.path)
      .sort((a, b) => b.path.length - a.path.length)[0];
    return match?.module_id ?? stableId("MOD", "src");
  }

  function subsystemRefForLayer(layer: string): string {
    const sub = derivedInputs.subsystem_map.find(s => s.layer === layer);
    return sub?.subsystem_id ?? "";
  }

  function addFile(
    path: string,
    role: string,
    layer: BAQRepoFileEntry["layer"],
    genMethod: BAQRepoFileEntry["generation_method"],
    sourceRefs: string[],
    traceRefs: string[],
    description: string,
    justification: string,
    subsystemLayer?: string,
  ): void {
    if (addedPaths.has(path)) return;
    addedPaths.add(path);
    files.push({
      file_id: stableId("FILE", derivedInputs.run_id, path),
      path,
      role,
      layer,
      module_ref: moduleRefForPath(path),
      subsystem_ref: subsystemLayer ? subsystemRefForLayer(subsystemLayer) : "",
      generation_method: genMethod,
      source_refs: sourceRefs,
      trace_refs: traceRefs,
      description,
      justification,
    });
  }

  addFile("package.json", "manifest", "config", "deterministic", [], [], "Project package manifest", "Required: defines dependencies, scripts, and project metadata");
  addFile("tsconfig.json", "config", "config", "deterministic", [], [], "TypeScript configuration", "Required: TypeScript compiler configuration");
  addFile("vite.config.ts", "config", "config", "deterministic", [], [], "Vite build configuration", "Required: development server and build tool configuration");
  addFile("tailwind.config.ts", "config", "config", "deterministic", [], [], "Tailwind CSS configuration", "Required: CSS framework configuration");
  addFile("postcss.config.js", "config", "config", "deterministic", [], [], "PostCSS configuration", "Required: CSS post-processing configuration");
  addFile(".env.example", "config", "config", "deterministic", [], [], "Environment variable template", "Required: documents expected environment variables");
  addFile("README.md", "docs", "docs", "ai_assisted", [], [], "Project documentation", "Required: project overview, setup, and usage instructions");
  addFile("index.html", "entry", "frontend", "deterministic", [], [], "HTML entry point", "Required: SPA HTML shell for Vite");
  addFile("src/main.tsx", "entry", "frontend", "deterministic", [], [], "React application entry", "Required: React DOM render with providers and router");
  addFile("src/App.tsx", "layout", "frontend", "ai_assisted", [], [], "Root application component with routing", "Required: route definitions and layout shell");
  addFile("src/index.css", "style", "frontend", "deterministic", [], [], "Global CSS styles", "Required: Tailwind directives and global resets");
  addFile("src/vite-env.d.ts", "config", "frontend", "deterministic", [], [], "Vite type declarations", "Required: client type references for Vite");
  addFile("src/lib/utils.ts", "utility", "shared", "deterministic", [], [], "Shared utility functions", "Required: common helpers (cn, formatters, etc.)");
  addFile("src/types/index.ts", "type_definition", "shared", "ai_assisted", [], [], "Shared type barrel export", "Required: centralized type exports");

  if (derivedInputs.api_surface.endpoints.length > 0) {
    addFile("server/index.ts", "entry", "backend", "ai_assisted", [], [], "Server entry point", "Required: Express server bootstrap and middleware setup", "backend");
    addFile("server/routes/index.ts", "route_handler", "backend", "ai_assisted", [], [], "Route registration", "Required: registers all API route modules", "backend");
    addFile("server/middleware/errorHandler.ts", "middleware", "backend", "ai_assisted", [], [], "Global error handler middleware", "Required: centralized error handling for API responses", "backend");
    addFile("server/middleware/validation.ts", "middleware", "backend", "ai_assisted", [], [], "Request validation middleware", "Required: validates request bodies and params against schemas", "backend");
  }

  for (const page of derivedInputs.ui_surface_map) {
    const filePath = `src/pages/${page.name}.tsx`;
    addFile(filePath, "page", "frontend", "ai_assisted", [page.source_ref], page.feature_refs, `Page component: ${page.name}`, `Required: implements UI route ${page.path} per spec`, "frontend");
  }

  for (const feature of derivedInputs.feature_map) {
    const componentName = feature.name.replace(/\s+/g, "");
    const filePath = `src/components/${componentName}.tsx`;
    addFile(filePath, "component", "frontend", "ai_assisted", [feature.feature_id], [feature.feature_id], `Feature component: ${feature.name}`, `Required: implements feature ${feature.feature_id} — ${feature.description}`, "frontend");

    if (feature.deliverables.length > 1) {
      const hookPath = `src/hooks/use${componentName}.ts`;
      addFile(hookPath, "hook", "frontend", "ai_assisted", [feature.feature_id], [feature.feature_id], `Hook for ${feature.name}`, `Required: encapsulates logic for feature ${feature.feature_id}`, "frontend");
    }
  }

  if (derivedInputs.api_surface.endpoints.length > 0) {
    const endpointGroups = groupEndpoints(derivedInputs.api_surface.endpoints);
    for (const [groupName, endpoints] of endpointGroups) {
      const sourceRefs = endpoints.map(e => e.source_ref);
      const epIds = endpoints.map(e => e.endpoint_id);

      addFile(`src/lib/api/${groupName}.ts`, "api_client", "frontend", "ai_assisted", sourceRefs, epIds, `API client for ${groupName}`, `Required: client for ${endpoints.length} ${groupName} endpoints`, "frontend");
      addFile(`server/routes/${groupName}.ts`, "route_handler", "backend", "ai_assisted", sourceRefs, epIds, `Route handler for ${groupName}`, `Required: handles ${endpoints.length} ${groupName} endpoints`, "backend");
      addFile(`src/lib/api/${groupName}.schema.ts`, "validation_schema", "shared", "ai_assisted", sourceRefs, epIds, `Validation schemas for ${groupName} API`, `Required: Zod schemas for ${groupName} request/response validation`);

      if (endpoints.length > 2) {
        addFile(`tests/integration/${groupName}.test.ts`, "test", "test", "ai_assisted", sourceRefs, epIds, `Integration tests for ${groupName} API`, `Proof: verifies ${groupName} endpoint contracts`);
      }
    }
  }

  if (derivedInputs.storage_model.schemas.length > 0) {
    addFile("server/db/index.ts", "data_access", "data", "ai_assisted", [], [], "Database connection and initialization", "Required: database connection pool and setup", "data");
    addFile("server/db/schema.ts", "data_access", "data", "ai_assisted", [], [], "Database schema definitions", "Required: Drizzle ORM table definitions", "data");

    for (const schema of derivedInputs.storage_model.schemas) {
      addFile(`server/db/${schema.name}.ts`, "data_access", "data", "ai_assisted", [schema.source_ref], [schema.schema_id], `Data access for ${schema.name}`, `Required: implements storage schema ${schema.schema_id}`, "data");
    }
  }

  if (derivedInputs.auth_model.auth_type !== "unknown") {
    const authSourceRefs = derivedInputs.auth_model.source_refs;
    addFile("src/lib/auth/index.ts", "auth", "security", "ai_assisted", authSourceRefs, [], "Auth provider and context", `Required: implements ${derivedInputs.auth_model.auth_type} authentication`, "security");
    addFile("src/lib/auth/ProtectedRoute.tsx", "auth", "security", "ai_assisted", authSourceRefs, [], "Protected route wrapper", `Required: route guard for ${derivedInputs.auth_model.auth_type} auth`, "security");
    addFile("src/lib/auth/types.ts", "type_definition", "security", "deterministic", authSourceRefs, [], "Auth type definitions", `Required: session, user, role types for ${derivedInputs.auth_model.auth_type}`, "security");

    if (derivedInputs.auth_model.rbac_rules.length > 0) {
      addFile("src/lib/auth/rbac.ts", "auth", "security", "ai_assisted", authSourceRefs, [], "RBAC enforcement utilities", `Required: role-based access control for ${derivedInputs.auth_model.rbac_rules.length} roles`, "security");
    }
  }

  for (const entity of derivedInputs.domain_model.entities) {
    const entityLower = entity.name.toLowerCase().replace(/\s+/g, "-");
    addFile(`src/types/${entityLower}.ts`, "type_definition", "shared", "deterministic", [entity.source_ref], [entity.entity_id], `Type definition for ${entity.name}`, `Required: types for domain entity ${entity.entity_id}`);
  }

  for (const obligation of derivedInputs.verification_obligations) {
    if (obligation.gating === "hard_gate") {
      const oblSlug = obligation.obligation_id.toLowerCase().replace(/[^a-z0-9]/g, "-");
      addFile(`tests/unit/${oblSlug}.test.ts`, "proof_target", "test", "ai_assisted", [obligation.obligation_id], [obligation.obligation_id, obligation.feature_ref].filter(Boolean), `Proof target for obligation ${obligation.obligation_id}`, `Proof: hard-gate verification — ${obligation.description}`);
    }
  }

  for (const opsObl of derivedInputs.ops_obligations) {
    const oblSlug = opsObl.obligation_id.toLowerCase().replace(/[^a-z0-9]/g, "-");
    addFile(`docs/ops/${oblSlug}.md`, "ops_doc", "docs", "ai_assisted", [opsObl.obligation_id], [opsObl.obligation_id], `Ops documentation for ${opsObl.obligation_id}`, `Required: operational documentation — ${opsObl.description}`);
  }

  return files;
}

function groupEndpoints(
  endpoints: BAQDerivedBuildInputs["api_surface"]["endpoints"],
): Map<string, typeof endpoints> {
  const groups = new Map<string, typeof endpoints>();
  for (const ep of endpoints) {
    const parts = ep.path.split("/").filter(Boolean);
    const group = parts[0] === "api" && parts.length > 1 ? parts[1] : parts[0] ?? "general";
    const clean = group.replace(/[^a-zA-Z0-9]/g, "");
    const existing = groups.get(clean) ?? [];
    existing.push(ep);
    groups.set(clean, existing);
  }
  return groups;
}

export function checkBAQInventoryGate(inventory: BAQRepoInventory): {
  passed: boolean;
  blockers: string[];
  gate_id: "G-BQ-03";
} {
  const blockers: string[] = [];

  if (inventory.files.length === 0) {
    blockers.push("Inventory contains no planned files");
  }

  if (inventory.directories.length === 0) {
    blockers.push("Inventory contains no planned directories");
  }

  const paths = inventory.files.map(f => f.path);
  const uniquePaths = new Set(paths);
  if (uniquePaths.size !== paths.length) {
    const dupes = paths.filter((p, i) => paths.indexOf(p) !== i);
    blockers.push(`Inventory contains duplicate file paths: ${[...new Set(dupes)].join(", ")}`);
  }

  const fileIds = inventory.files.map(f => f.file_id);
  const uniqueIds = new Set(fileIds);
  if (uniqueIds.size !== fileIds.length) {
    blockers.push("Inventory contains duplicate file IDs");
  }

  const filesWithoutJustification = inventory.files.filter(f => !f.justification || f.justification.trim() === "");
  if (filesWithoutJustification.length > 0) {
    blockers.push(`${filesWithoutJustification.length} files lack justification`);
  }

  const hasEntry = inventory.files.some(f => f.role === "entry");
  if (!hasEntry) {
    blockers.push("Inventory contains no entry point files");
  }

  const hasManifest = inventory.files.some(f => f.role === "manifest" || f.role === "config");
  if (!hasManifest) {
    blockers.push("Inventory contains no manifest or config files");
  }

  const moduleIds = new Set(inventory.modules.map(m => m.module_id));
  const orphanFiles = inventory.files.filter(f => f.module_ref && !moduleIds.has(f.module_ref));
  if (orphanFiles.length > 0) {
    blockers.push(`${orphanFiles.length} files reference non-existent modules`);
  }

  return {
    passed: blockers.length === 0,
    blockers,
    gate_id: "G-BQ-03",
  };
}
