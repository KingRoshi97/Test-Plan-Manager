import type {
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRepoFileEntry,
} from "./types.js";

export function buildRepoInventory(
  derivedInputs: BAQDerivedBuildInputs,
  runDir: string,
): BAQRepoInventory {
  const now = new Date().toISOString();
  const inventoryId = `BAQI-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`;

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
    { path: "src/pages", purpose: "Route-level page components", layer: "frontend", required: true },
    { path: "src/lib", purpose: "Shared utilities and helpers", layer: "shared", required: true },
    { path: "src/types", purpose: "Type definitions", layer: "shared", required: true },
    { path: "public", purpose: "Static assets", layer: "frontend", required: true },
  ];

  if (derivedInputs.api_surface.endpoints.length > 0) {
    dirs.push(
      { path: "src/lib/api", purpose: "API client layer", layer: "frontend", required: true },
      { path: "server", purpose: "Server-side code", layer: "backend", required: true },
      { path: "server/routes", purpose: "API route handlers", layer: "backend", required: true },
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
    );
  }

  const subsystemLayers = new Set(derivedInputs.subsystem_map.map(s => s.layer));
  if (subsystemLayers.has("frontend")) {
    dirs.push({ path: "src/hooks", purpose: "React hooks", layer: "frontend", required: false });
    dirs.push({ path: "src/context", purpose: "React context providers", layer: "frontend", required: false });
  }

  return dirs;
}

function planModules(
  derivedInputs: BAQDerivedBuildInputs,
): BAQRepoInventory["modules"] {
  const modules: BAQRepoInventory["modules"] = [];
  let counter = 1;

  modules.push({
    module_id: `MOD-${String(counter++).padStart(3, "0")}`,
    path: "src",
    layer: "shared",
    purpose: "Application entry point and configuration",
    source_refs: [],
  });

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

    const existing = modules.find(m => m.path === modulePath);
    if (!existing) {
      modules.push({
        module_id: `MOD-${String(counter++).padStart(3, "0")}`,
        path: modulePath,
        layer: subsystem.layer,
        purpose: subsystem.description,
        source_refs: subsystem.source_refs,
      });
    }
  }

  if (derivedInputs.ui_surface_map.length > 0) {
    const existing = modules.find(m => m.path === "src/pages");
    if (!existing) {
      modules.push({
        module_id: `MOD-${String(counter++).padStart(3, "0")}`,
        path: "src/pages",
        layer: "frontend",
        purpose: "Route-level page components",
        source_refs: [],
      });
    }
  }

  if (derivedInputs.api_surface.endpoints.length > 0) {
    const existing = modules.find(m => m.path === "src/lib/api");
    if (!existing) {
      modules.push({
        module_id: `MOD-${String(counter++).padStart(3, "0")}`,
        path: "src/lib/api",
        layer: "frontend",
        purpose: "API client functions",
        source_refs: [],
      });
    }
  }

  return modules;
}

function planFiles(
  derivedInputs: BAQDerivedBuildInputs,
  modules: BAQRepoInventory["modules"],
): BAQRepoFileEntry[] {
  const files: BAQRepoFileEntry[] = [];
  let counter = 1;

  function moduleRefForPath(filePath: string): string {
    const match = modules
      .filter(m => filePath.startsWith(m.path + "/") || filePath === m.path)
      .sort((a, b) => b.path.length - a.path.length)[0];
    return match?.module_id ?? "MOD-001";
  }

  function subsystemRefForLayer(layer: string): string {
    const sub = derivedInputs.subsystem_map.find(s => s.layer === layer);
    return sub?.subsystem_id ?? "";
  }

  const configFiles: Array<{ path: string; role: string; layer: BAQRepoFileEntry["layer"]; description: string }> = [
    { path: "package.json", role: "config", layer: "config", description: "Project package manifest" },
    { path: "tsconfig.json", role: "config", layer: "config", description: "TypeScript configuration" },
    { path: "vite.config.ts", role: "config", layer: "config", description: "Vite build configuration" },
    { path: "tailwind.config.ts", role: "config", layer: "config", description: "Tailwind CSS configuration" },
    { path: "postcss.config.js", role: "config", layer: "config", description: "PostCSS configuration" },
    { path: "index.html", role: "entry", layer: "frontend", description: "HTML entry point" },
    { path: "src/main.tsx", role: "entry", layer: "frontend", description: "React application entry" },
    { path: "src/App.tsx", role: "layout", layer: "frontend", description: "Root application component with routing" },
    { path: "src/index.css", role: "style", layer: "frontend", description: "Global CSS styles" },
  ];

  for (const cf of configFiles) {
    files.push({
      file_id: `FILE-${String(counter++).padStart(4, "0")}`,
      path: cf.path,
      role: cf.role,
      layer: cf.layer,
      module_ref: moduleRefForPath(cf.path),
      subsystem_ref: "",
      generation_method: "deterministic",
      source_refs: [],
      trace_refs: [],
      description: cf.description,
      justification: "Required project structure file",
    });
  }

  for (const page of derivedInputs.ui_surface_map) {
    const filePath = `src/pages/${page.name}.tsx`;
    files.push({
      file_id: `FILE-${String(counter++).padStart(4, "0")}`,
      path: filePath,
      role: "page",
      layer: "frontend",
      module_ref: moduleRefForPath(filePath),
      subsystem_ref: subsystemRefForLayer("frontend"),
      generation_method: "ai_assisted",
      source_refs: [page.source_ref],
      trace_refs: page.feature_refs,
      description: `Page component: ${page.name}`,
      justification: `Implements UI route ${page.path}`,
    });
  }

  for (const feature of derivedInputs.feature_map) {
    const componentName = feature.name.replace(/\s+/g, "");
    const filePath = `src/components/${componentName}.tsx`;
    const existing = files.find(f => f.path === filePath);
    if (!existing) {
      files.push({
        file_id: `FILE-${String(counter++).padStart(4, "0")}`,
        path: filePath,
        role: "component",
        layer: "frontend",
        module_ref: moduleRefForPath(filePath),
        subsystem_ref: subsystemRefForLayer("frontend"),
        generation_method: "ai_assisted",
        source_refs: [feature.feature_id],
        trace_refs: [feature.feature_id],
        description: `Feature component: ${feature.name}`,
        justification: `Implements feature ${feature.feature_id}`,
      });
    }
  }

  if (derivedInputs.api_surface.endpoints.length > 0) {
    const endpointGroups = groupEndpoints(derivedInputs.api_surface.endpoints);
    for (const [groupName, endpoints] of endpointGroups) {
      const clientPath = `src/lib/api/${groupName}.ts`;
      const existing = files.find(f => f.path === clientPath);
      if (!existing) {
        files.push({
          file_id: `FILE-${String(counter++).padStart(4, "0")}`,
          path: clientPath,
          role: "api_client",
          layer: "frontend",
          module_ref: moduleRefForPath(clientPath),
          subsystem_ref: subsystemRefForLayer("frontend"),
          generation_method: "ai_assisted",
          source_refs: endpoints.map(e => e.source_ref),
          trace_refs: [],
          description: `API client for ${groupName}`,
          justification: `Client for ${endpoints.length} ${groupName} endpoints`,
        });
      }

      const routePath = `server/routes/${groupName}.ts`;
      const existingRoute = files.find(f => f.path === routePath);
      if (!existingRoute) {
        files.push({
          file_id: `FILE-${String(counter++).padStart(4, "0")}`,
          path: routePath,
          role: "route_handler",
          layer: "backend",
          module_ref: moduleRefForPath(routePath),
          subsystem_ref: subsystemRefForLayer("backend"),
          generation_method: "ai_assisted",
          source_refs: endpoints.map(e => e.source_ref),
          trace_refs: [],
          description: `Route handler for ${groupName}`,
          justification: `Handles ${endpoints.length} ${groupName} endpoints`,
        });
      }
    }
  }

  if (derivedInputs.storage_model.schemas.length > 0) {
    for (const schema of derivedInputs.storage_model.schemas) {
      const filePath = `server/db/${schema.name}.ts`;
      const existing = files.find(f => f.path === filePath);
      if (!existing) {
        files.push({
          file_id: `FILE-${String(counter++).padStart(4, "0")}`,
          path: filePath,
          role: "data_access",
          layer: "data",
          module_ref: moduleRefForPath(filePath),
          subsystem_ref: subsystemRefForLayer("data"),
          generation_method: "ai_assisted",
          source_refs: [schema.source_ref],
          trace_refs: [],
          description: `Data access for ${schema.name}`,
          justification: `Implements storage schema ${schema.schema_id}`,
        });
      }
    }
  }

  if (derivedInputs.auth_model.auth_type !== "unknown") {
    const authFiles = [
      { path: "src/lib/auth/index.ts", role: "auth", description: "Auth provider and context" },
      { path: "src/lib/auth/ProtectedRoute.tsx", role: "auth", description: "Protected route wrapper" },
    ];
    for (const af of authFiles) {
      const existing = files.find(f => f.path === af.path);
      if (!existing) {
        files.push({
          file_id: `FILE-${String(counter++).padStart(4, "0")}`,
          path: af.path,
          role: af.role,
          layer: "security",
          module_ref: moduleRefForPath(af.path),
          subsystem_ref: subsystemRefForLayer("security"),
          generation_method: "ai_assisted",
          source_refs: derivedInputs.auth_model.source_refs,
          trace_refs: [],
          description: af.description,
          justification: `Implements ${derivedInputs.auth_model.auth_type} authentication`,
        });
      }
    }
  }

  for (const entity of derivedInputs.domain_model.entities) {
    const typePath = `src/types/${entity.name.toLowerCase()}.ts`;
    const existing = files.find(f => f.path === typePath);
    if (!existing) {
      files.push({
        file_id: `FILE-${String(counter++).padStart(4, "0")}`,
        path: typePath,
        role: "type_definition",
        layer: "shared",
        module_ref: moduleRefForPath(typePath),
        subsystem_ref: "",
        generation_method: "deterministic",
        source_refs: [entity.source_ref],
        trace_refs: [],
        description: `Type definition for ${entity.name}`,
        justification: `Types for domain entity ${entity.entity_id}`,
      });
    }
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

  const filesWithoutJustification = inventory.files.filter(f => !f.justification || f.justification.trim() === "");
  if (filesWithoutJustification.length > 0) {
    blockers.push(`${filesWithoutJustification.length} files lack justification`);
  }

  return {
    passed: blockers.length === 0,
    blockers,
    gate_id: "G-BQ-03",
  };
}
