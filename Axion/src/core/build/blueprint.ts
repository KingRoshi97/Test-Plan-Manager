import * as fs from "fs";
import * as path from "path";
import {
  KitExtraction,
  RepoBlueprint,
  BlueprintModule,
  BlueprintSubsystem,
  BlueprintFileEntry,
  DirectoryLayout,
  BlueprintDataModel,
  BlueprintVerificationTargets,
  FileCountBreakdown,
  RequirementTraceEntry,
  BlueprintGateResult,
  AppIdentity,
  DomainModel,
  InterfaceContracts,
  SecurityModel,
  FeatureMapEntry,
  DataSchemas,
} from "./types.js";

export async function buildRepoBlueprint(
  extraction: KitExtraction,
  runDir: string
): Promise<RepoBlueprint> {
  const inputs = extraction.derived_inputs;
  const implications = extraction.derived_build_implications;

  const systemIdentity: AppIdentity = { ...inputs.app_identity };
  const domainModel: DomainModel = { ...inputs.domain_model };

  const subsystems = buildSubsystems(inputs, implications);
  const moduleMap = buildModuleMap(inputs, subsystems, implications);
  const directoryLayout = buildDirectoryLayout(moduleMap, implications);
  const fileInventory = buildFileInventory(inputs, moduleMap, subsystems, implications);
  const interfaceContracts: InterfaceContracts = { ...inputs.interfaces };
  const dataModel = buildDataModel(inputs);
  const securityModel: SecurityModel = { ...inputs.security };
  const featureMap: FeatureMapEntry[] = [...inputs.feature_map];
  const verificationTargets = buildVerificationTargets(inputs, fileInventory);
  const fileCountBreakdown = computeFileCountBreakdown(fileInventory);
  const traceabilityMap = buildTraceabilityMap(inputs, fileInventory, moduleMap);

  const blueprintId = `RBP-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`;
  const now = new Date().toISOString();

  const blueprint: RepoBlueprint = {
    blueprint_id: blueprintId,
    run_id: extraction.run_id,
    kit_ref: extraction.kit_ref,
    extraction_ref: extraction.kit_extraction_report_id,
    system_identity: systemIdentity,
    domain_model: domainModel,
    subsystems,
    module_map: moduleMap,
    directory_layout: directoryLayout,
    file_inventory: fileInventory,
    interface_contracts: interfaceContracts,
    data_model: dataModel,
    security_model: securityModel,
    feature_map: featureMap,
    verification_targets: verificationTargets,
    expected_file_count: fileCountBreakdown.total,
    file_count_breakdown: fileCountBreakdown,
    traceability_map: traceabilityMap,
    created_at: now,
    updated_at: now,
    status: "active",
  };

  const buildDir = path.join(runDir, "build");
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(buildDir, "repo_blueprint.json"),
    JSON.stringify(blueprint, null, 2)
  );

  return blueprint;
}

function buildSubsystems(
  inputs: KitExtraction["derived_inputs"],
  implications: KitExtraction["derived_build_implications"]
): BlueprintSubsystem[] {
  const subsystems: BlueprintSubsystem[] = [];

  const extractedSubs = inputs.subsystems ?? [];
  if (extractedSubs.length > 0) {
    for (const sub of extractedSubs) {
      subsystems.push({
        subsystem_id: sub.subsystem_id,
        name: sub.name,
        modules: [],
        responsibilities: [sub.description],
        dependencies: [],
        layer: sub.layer,
      });
    }
  }

  const hasLayer = (layer: string) => subsystems.some((s) => s.layer === layer);

  if (!hasLayer("frontend")) {
    subsystems.push({
      subsystem_id: "sub-frontend",
      name: "Frontend Application",
      modules: [],
      responsibilities: ["UI rendering", "Client-side routing", "State management"],
      dependencies: ["sub-backend"],
      layer: "frontend",
    });
  }

  if (!hasLayer("backend")) {
    subsystems.push({
      subsystem_id: "sub-backend",
      name: "Backend API",
      modules: [],
      responsibilities: ["API endpoints", "Business logic", "Data access"],
      dependencies: ["sub-data"],
      layer: "backend",
    });
  }

  if (!hasLayer("data")) {
    subsystems.push({
      subsystem_id: "sub-data",
      name: "Data Layer",
      modules: [],
      responsibilities: ["Database schemas", "Migrations", "Data models"],
      dependencies: [],
      layer: "data",
    });
  }

  if (!hasLayer("security")) {
    subsystems.push({
      subsystem_id: "sub-security",
      name: "Security & Auth",
      modules: [],
      responsibilities: ["Authentication", "Authorization", "Session management"],
      dependencies: ["sub-backend"],
      layer: "security",
    });
  }

  if (!hasLayer("shared")) {
    subsystems.push({
      subsystem_id: "sub-shared",
      name: "Shared Utilities",
      modules: [],
      responsibilities: ["Type definitions", "Validation", "Shared utilities"],
      dependencies: [],
      layer: "shared",
    });
  }

  subsystems.push({
    subsystem_id: "sub-test",
    name: "Test Suite",
    modules: [],
    responsibilities: ["Unit tests", "Integration tests", "E2E tests"],
    dependencies: [],
    layer: "test",
  });

  subsystems.push({
    subsystem_id: "sub-config",
    name: "Configuration",
    modules: [],
    responsibilities: ["Build config", "Environment config", "Tooling config"],
    dependencies: [],
    layer: "config",
  });

  return subsystems;
}

function buildModuleMap(
  inputs: KitExtraction["derived_inputs"],
  subsystems: BlueprintSubsystem[],
  implications: KitExtraction["derived_build_implications"]
): BlueprintModule[] {
  const modules: BlueprintModule[] = [];
  const findSub = (layer: string) =>
    subsystems.find((s) => s.layer === layer)?.subsystem_id ?? `sub-${layer}`;

  modules.push({
    module_id: "mod-app-shell",
    name: "App Shell",
    layer: "frontend",
    purpose: "Application entry point, routing, and layout",
    path: "src",
    inputs: ["routes", "layouts"],
    outputs: ["rendered_app"],
    dependencies: [],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-layout",
    name: "Layout Components",
    layer: "frontend",
    purpose: "Page layouts, navigation, header, sidebar",
    path: "src/components/layout",
    inputs: ["design_system"],
    outputs: ["layout_components"],
    dependencies: ["mod-ui"],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-ui",
    name: "UI Components",
    layer: "frontend",
    purpose: "Reusable UI primitives",
    path: "src/components/ui",
    inputs: ["design_tokens"],
    outputs: ["ui_components"],
    dependencies: [],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-pages",
    name: "Pages",
    layer: "frontend",
    purpose: "Route-level page components",
    path: "src/pages",
    inputs: ["features", "routes"],
    outputs: ["page_components"],
    dependencies: ["mod-layout", "mod-ui", "mod-features"],
    source_refs: [],
  });

  for (const feat of inputs.feature_map) {
    const slug = feat.name.replace(/\s+/g, "");
    const modId = `mod-feat-${slug.toLowerCase()}`;
    modules.push({
      module_id: modId,
      name: `${feat.name} Feature`,
      layer: "frontend",
      purpose: feat.description,
      path: `src/components/features/${slug}`,
      inputs: feat.scope_refs,
      outputs: [`${slug}_components`],
      dependencies: ["mod-ui", "mod-hooks"],
      source_refs: [feat.feature_id],
    });
  }

  modules.push({
    module_id: "mod-hooks",
    name: "Custom Hooks",
    layer: "frontend",
    purpose: "React hooks for data fetching and state management",
    path: "src/hooks",
    inputs: ["api_client"],
    outputs: ["hooks"],
    dependencies: ["mod-api-client"],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-api-client",
    name: "API Client",
    layer: "frontend",
    purpose: "HTTP client, interceptors, endpoint definitions",
    path: "src/lib/api",
    inputs: ["api_contracts"],
    outputs: ["api_client"],
    dependencies: [],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-frontend-utils",
    name: "Frontend Utilities",
    layer: "frontend",
    purpose: "Formatting, validation helpers, constants",
    path: "src/lib/utils",
    inputs: [],
    outputs: ["utility_functions"],
    dependencies: [],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-routes",
    name: "API Routes",
    layer: "backend",
    purpose: "Express route handlers",
    path: "src/server/routes",
    inputs: ["api_contracts", "features"],
    outputs: ["route_handlers"],
    dependencies: ["mod-middleware", "mod-models"],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-middleware",
    name: "Middleware",
    layer: "backend",
    purpose: "Auth, validation, error handling middleware",
    path: "src/server/middleware",
    inputs: ["security_model"],
    outputs: ["middleware_stack"],
    dependencies: ["mod-auth"],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-models",
    name: "Data Models",
    layer: "data",
    purpose: "Database schemas, entity models, migrations",
    path: "src/server/models",
    inputs: ["data_schemas", "domain_entities"],
    outputs: ["db_models"],
    dependencies: [],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-auth",
    name: "Auth Module",
    layer: "security",
    purpose: "Authentication and authorization logic",
    path: "src/lib/auth",
    inputs: ["security_model"],
    outputs: ["auth_functions"],
    dependencies: [],
    source_refs: inputs.security.source_refs,
  });

  modules.push({
    module_id: "mod-types",
    name: "Type Definitions",
    layer: "shared",
    purpose: "Shared TypeScript types, interfaces, enums",
    path: "src/types",
    inputs: ["domain_model", "api_contracts"],
    outputs: ["type_definitions"],
    dependencies: [],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-validators",
    name: "Validators",
    layer: "shared",
    purpose: "Input validation schemas and functions",
    path: "src/lib/validators",
    inputs: ["data_schemas"],
    outputs: ["validation_functions"],
    dependencies: ["mod-types"],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-store",
    name: "State Store",
    layer: "frontend",
    purpose: "Client-side state management",
    path: "src/lib/store",
    inputs: ["features"],
    outputs: ["state_store"],
    dependencies: ["mod-types"],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-styles",
    name: "Styles",
    layer: "frontend",
    purpose: "Global styles, theme, CSS",
    path: "src/styles",
    inputs: ["design_tokens"],
    outputs: ["stylesheets"],
    dependencies: [],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-tests",
    name: "Test Suite",
    layer: "test",
    purpose: "Unit, integration, and E2E tests",
    path: "tests",
    inputs: ["acceptance_criteria", "features"],
    outputs: ["test_results"],
    dependencies: [],
    source_refs: [],
  });

  modules.push({
    module_id: "mod-config",
    name: "Configuration",
    layer: "config",
    purpose: "Build, environment, and tooling configuration",
    path: ".",
    inputs: ["stack_profile"],
    outputs: ["config_files"],
    dependencies: [],
    source_refs: [],
  });

  for (const sub of subsystems) {
    sub.modules = modules
      .filter((m) => m.layer === sub.layer)
      .map((m) => m.module_id);
  }

  return modules;
}

function buildDirectoryLayout(
  modules: BlueprintModule[],
  implications: KitExtraction["derived_build_implications"]
): DirectoryLayout {
  const dirSet = new Set<string>();
  const dirEntries: DirectoryLayout["directories"] = [];

  for (const mod of modules) {
    if (mod.path && mod.path !== ".") {
      dirSet.add(mod.path);
    }
  }

  const staticDirs = [
    "src",
    "src/components",
    "src/components/layout",
    "src/components/ui",
    "src/components/features",
    "src/pages",
    "src/hooks",
    "src/lib",
    "src/lib/api",
    "src/lib/utils",
    "src/lib/auth",
    "src/lib/validators",
    "src/lib/store",
    "src/types",
    "src/styles",
    "src/server",
    "src/server/routes",
    "src/server/middleware",
    "src/server/models",
    "src/server/repositories",
    "src/server/services",
    "src/server/controllers",
    "src/server/workflows",
    "src/server/config",
    "src/server/errors",
    "src/server/lib",
    "src/contexts",
    "public",
    "tests",
    "tests/unit",
    "tests/unit/services",
    "tests/unit/repositories",
    "tests/unit/controllers",
    "tests/integration",
    "tests/e2e",
    "tests/acceptance",
    "docs",
  ];

  for (const d of staticDirs) {
    dirSet.add(d);
  }

  for (const dirPath of dirSet) {
    const layer = inferLayerFromPath(dirPath);
    dirEntries.push({
      path: dirPath,
      purpose: inferPurposeFromPath(dirPath),
      layer,
      required: true,
    });
  }

  dirEntries.sort((a, b) => a.path.localeCompare(b.path));

  return {
    directories: dirEntries,
    top_level_roots: ["src", "public", "tests", "docs"],
    repo_type: implications.derived_repo_type || "fullstack_web",
    repo_shape: implications.derived_repo_shape || "monorepo",
  };
}

function buildFileInventory(
  inputs: KitExtraction["derived_inputs"],
  modules: BlueprintModule[],
  subsystems: BlueprintSubsystem[],
  implications: KitExtraction["derived_build_implications"]
): BlueprintFileEntry[] {
  const files: BlueprintFileEntry[] = [];
  let fileIdx = 0;
  const nextId = () => `file-${(++fileIdx).toString().padStart(4, "0")}`;

  addConfigFiles(files, nextId);
  addEntryFiles(files, nextId);
  addLayoutFiles(files, nextId);
  addUIFiles(files, nextId);
  addStyleFiles(files, nextId);
  addTypeFiles(files, nextId, inputs);
  addApiClientFiles(files, nextId);
  addUtilFiles(files, nextId);
  addAuthFiles(files, nextId, inputs);
  addValidatorFiles(files, nextId, inputs);
  addStoreFiles(files, nextId, inputs);
  addFeatureFiles(files, nextId, inputs);
  addPageFiles(files, nextId, inputs);
  addHookFiles(files, nextId, inputs);
  addServerRouteFiles(files, nextId, inputs);
  addMiddlewareFiles(files, nextId, inputs);
  addModelFiles(files, nextId, inputs);
  addEntityFiles(files, nextId, inputs);
  addRepositoryFiles(files, nextId, inputs);
  addServiceFiles(files, nextId, inputs);
  addControllerFiles(files, nextId, inputs);
  addWorkflowFiles(files, nextId, inputs);
  addServerInfraFiles(files, nextId);
  addContextFiles(files, nextId, inputs);
  addEndpointDerivedFiles(files, nextId, inputs);
  addTestFiles(files, nextId, inputs);
  addDocFiles(files, nextId);

  return dedupeFileInventory(files);
}

function addConfigFiles(files: BlueprintFileEntry[], nextId: () => string) {
  const configs = [
    { path: "package.json", role: "package_manifest", desc: "Package dependencies and scripts" },
    { path: "tsconfig.json", role: "ts_config", desc: "TypeScript compiler configuration" },
    { path: "vite.config.ts", role: "build_config", desc: "Vite build configuration" },
    { path: "tailwind.config.ts", role: "css_config", desc: "Tailwind CSS configuration" },
    { path: "postcss.config.js", role: "css_config", desc: "PostCSS configuration" },
    { path: "index.html", role: "html_entry", desc: "HTML entry point" },
    { path: ".env.example", role: "env_template", desc: "Environment variable template" },
    { path: ".gitignore", role: "git_config", desc: "Git ignore rules" },
    { path: ".eslintrc.json", role: "lint_config", desc: "ESLint configuration" },
    { path: ".prettierrc", role: "format_config", desc: "Prettier configuration" },
  ];

  for (const cfg of configs) {
    files.push({
      file_id: nextId(),
      path: cfg.path,
      role: cfg.role,
      layer: "config",
      module_ref: "mod-config",
      subsystem_ref: "sub-config",
      generation_method: "deterministic",
      source_refs: [],
      trace_refs: [],
      description: cfg.desc,
    });
  }
}

function addEntryFiles(files: BlueprintFileEntry[], nextId: () => string) {
  files.push({
    file_id: nextId(),
    path: "src/main.tsx",
    role: "entry_point",
    layer: "frontend",
    module_ref: "mod-app-shell",
    subsystem_ref: "sub-frontend",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Application entry point",
  });

  files.push({
    file_id: nextId(),
    path: "src/App.tsx",
    role: "app_entry",
    layer: "frontend",
    module_ref: "mod-app-shell",
    subsystem_ref: "sub-frontend",
    generation_method: "ai_assisted",
    source_refs: [],
    trace_refs: [],
    description: "Root application component with routing",
  });
}

function addLayoutFiles(files: BlueprintFileEntry[], nextId: () => string) {
  const layouts = [
    { name: "AppLayout.tsx", desc: "Main application layout wrapper" },
    { name: "Header.tsx", desc: "Application header with navigation" },
    { name: "Sidebar.tsx", desc: "Sidebar navigation component" },
    { name: "Footer.tsx", desc: "Application footer" },
    { name: "AuthLayout.tsx", desc: "Authentication pages layout" },
    { name: "index.ts", desc: "Layout components barrel export" },
  ];

  for (const layout of layouts) {
    files.push({
      file_id: nextId(),
      path: `src/components/layout/${layout.name}`,
      role: "layout_component",
      layer: "frontend",
      module_ref: "mod-layout",
      subsystem_ref: "sub-frontend",
      generation_method: "ai_assisted",
      source_refs: [],
      trace_refs: [],
      description: layout.desc,
    });
  }
}

function addUIFiles(files: BlueprintFileEntry[], nextId: () => string) {
  const uiComponents = [
    "Button", "Card", "Input", "Modal", "Table", "Select",
    "Textarea", "Checkbox", "Radio", "Switch", "Badge",
    "Alert", "Toast", "Tooltip", "Dropdown", "Tabs",
    "Pagination", "LoadingSpinner", "ErrorBoundary", "EmptyState",
    "Avatar", "Breadcrumb", "SearchInput", "FileUpload",
    "DatePicker", "ProgressBar",
  ];

  for (const comp of uiComponents) {
    files.push({
      file_id: nextId(),
      path: `src/components/ui/${comp}.tsx`,
      role: "ui_component",
      layer: "frontend",
      module_ref: "mod-ui",
      subsystem_ref: "sub-frontend",
      generation_method: comp === "LoadingSpinner" || comp === "ErrorBoundary" || comp === "EmptyState"
        ? "deterministic"
        : "ai_assisted",
      source_refs: [],
      trace_refs: [],
      description: `${comp} UI component`,
    });
  }

  files.push({
    file_id: nextId(),
    path: "src/components/ui/index.ts",
    role: "barrel_export",
    layer: "frontend",
    module_ref: "mod-ui",
    subsystem_ref: "sub-frontend",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "UI components barrel export",
  });
}

function addStyleFiles(files: BlueprintFileEntry[], nextId: () => string) {
  files.push({
    file_id: nextId(),
    path: "src/styles/globals.css",
    role: "styles",
    layer: "frontend",
    module_ref: "mod-styles",
    subsystem_ref: "sub-frontend",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Global CSS styles and Tailwind imports",
  });

  files.push({
    file_id: nextId(),
    path: "src/styles/theme.ts",
    role: "theme",
    layer: "frontend",
    module_ref: "mod-styles",
    subsystem_ref: "sub-frontend",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Theme configuration and design tokens",
  });
}

function addTypeFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  files.push({
    file_id: nextId(),
    path: "src/types/index.ts",
    role: "shared_types",
    layer: "shared",
    module_ref: "mod-types",
    subsystem_ref: "sub-shared",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Types barrel export",
  });

  files.push({
    file_id: nextId(),
    path: "src/types/entities.ts",
    role: "entity_types",
    layer: "shared",
    module_ref: "mod-types",
    subsystem_ref: "sub-shared",
    generation_method: "deterministic",
    source_refs: ["canonical_spec.entities"],
    trace_refs: [],
    description: "Domain entity type definitions",
  });

  files.push({
    file_id: nextId(),
    path: "src/types/api.ts",
    role: "api_types",
    layer: "shared",
    module_ref: "mod-types",
    subsystem_ref: "sub-shared",
    generation_method: "deterministic",
    source_refs: ["api_contracts"],
    trace_refs: [],
    description: "API request/response type definitions",
  });

  files.push({
    file_id: nextId(),
    path: "src/types/auth.ts",
    role: "auth_types",
    layer: "shared",
    module_ref: "mod-types",
    subsystem_ref: "sub-shared",
    generation_method: "deterministic",
    source_refs: ["canonical_spec.roles"],
    trace_refs: [],
    description: "Authentication and authorization types",
  });

  files.push({
    file_id: nextId(),
    path: "src/types/enums.ts",
    role: "enum_types",
    layer: "shared",
    module_ref: "mod-types",
    subsystem_ref: "sub-shared",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Shared enum definitions",
  });

  for (const entity of inputs.domain_model.entities) {
    const slug = entity.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `src/types/${slug}.ts`,
      role: "entity_type",
      layer: "shared",
      module_ref: "mod-types",
      subsystem_ref: "sub-shared",
      generation_method: "deterministic",
      source_refs: [entity.source_ref],
      trace_refs: [],
      description: `Type definitions for ${entity.name} entity`,
    });
  }
}

function addApiClientFiles(files: BlueprintFileEntry[], nextId: () => string) {
  const apiFiles = [
    { name: "client.ts", role: "api_client", desc: "HTTP client configuration" },
    { name: "endpoints.ts", role: "api_endpoints", desc: "API endpoint definitions" },
    { name: "interceptors.ts", role: "api_interceptor", desc: "Request/response interceptors" },
    { name: "index.ts", role: "barrel_export", desc: "API client barrel export" },
  ];

  for (const f of apiFiles) {
    files.push({
      file_id: nextId(),
      path: `src/lib/api/${f.name}`,
      role: f.role,
      layer: "frontend",
      module_ref: "mod-api-client",
      subsystem_ref: "sub-frontend",
      generation_method: f.role === "barrel_export" ? "deterministic" : "ai_assisted",
      source_refs: [],
      trace_refs: [],
      description: f.desc,
    });
  }
}

function addUtilFiles(files: BlueprintFileEntry[], nextId: () => string) {
  const utils = [
    { name: "format.ts", desc: "Date, number, and string formatting utilities" },
    { name: "constants.ts", desc: "Application constants" },
    { name: "helpers.ts", desc: "General helper functions" },
    { name: "cn.ts", desc: "Classname merge utility" },
    { name: "index.ts", desc: "Utilities barrel export" },
  ];

  for (const u of utils) {
    files.push({
      file_id: nextId(),
      path: `src/lib/utils/${u.name}`,
      role: "utility",
      layer: "frontend",
      module_ref: "mod-frontend-utils",
      subsystem_ref: "sub-frontend",
      generation_method: "deterministic",
      source_refs: [],
      trace_refs: [],
      description: u.desc,
    });
  }
}

function addAuthFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  const authFiles = [
    { name: "index.ts", desc: "Auth module barrel export" },
    { name: "session.ts", desc: "Session management" },
    { name: "permissions.ts", desc: "Permission checking utilities" },
    { name: "guards.ts", desc: "Route guards and auth checks" },
    { name: "context.tsx", desc: "Auth context provider" },
  ];

  for (const f of authFiles) {
    files.push({
      file_id: nextId(),
      path: `src/lib/auth/${f.name}`,
      role: "auth_module",
      layer: "security",
      module_ref: "mod-auth",
      subsystem_ref: "sub-security",
      generation_method: "ai_assisted",
      source_refs: inputs.security.source_refs,
      trace_refs: [],
      description: f.desc,
    });
  }

  if (inputs.security.rbac_rules.length > 0) {
    files.push({
      file_id: nextId(),
      path: "src/lib/auth/roles.ts",
      role: "rbac_config",
      layer: "security",
      module_ref: "mod-auth",
      subsystem_ref: "sub-security",
      generation_method: "deterministic",
      source_refs: inputs.security.source_refs,
      trace_refs: [],
      description: "Role-based access control definitions",
    });
  }
}

function addValidatorFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  files.push({
    file_id: nextId(),
    path: "src/lib/validators/index.ts",
    role: "validator",
    layer: "shared",
    module_ref: "mod-validators",
    subsystem_ref: "sub-shared",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Validators barrel export",
  });

  for (const schema of inputs.data.schemas) {
    const slug = schema.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `src/lib/validators/${slug}.ts`,
      role: "schema_validator",
      layer: "shared",
      module_ref: "mod-validators",
      subsystem_ref: "sub-shared",
      generation_method: "ai_assisted",
      source_refs: [schema.source_ref],
      trace_refs: [],
      description: `Validation schema for ${schema.name}`,
    });
  }
}

function addStoreFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  files.push({
    file_id: nextId(),
    path: "src/lib/store/index.ts",
    role: "state_store",
    layer: "frontend",
    module_ref: "mod-store",
    subsystem_ref: "sub-frontend",
    generation_method: "ai_assisted",
    source_refs: [],
    trace_refs: [],
    description: "Root store configuration",
  });

  for (const feat of inputs.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `src/lib/store/${slug}-store.ts`,
      role: "feature_store",
      layer: "frontend",
      module_ref: "mod-store",
      subsystem_ref: "sub-frontend",
      generation_method: "ai_assisted",
      source_refs: [feat.feature_id],
      trace_refs: [],
      description: `State store for ${feat.name}`,
    });
  }
}

function addFeatureFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  for (const feat of inputs.feature_map) {
    const slug = feat.name.replace(/\s+/g, "");
    const modRef = `mod-feat-${slug.toLowerCase()}`;
    const featureDir = `src/components/features/${slug}`;

    files.push({
      file_id: nextId(),
      path: `${featureDir}/index.tsx`,
      role: "feature_component",
      layer: "frontend",
      module_ref: modRef,
      subsystem_ref: "sub-frontend",
      generation_method: "ai_assisted",
      source_refs: [feat.feature_id],
      trace_refs: [],
      description: `${feat.name} feature main component`,
    });

    const lower = (feat.name + " " + feat.description).toLowerCase();
    const isAuth = lower.includes("auth") || lower.includes("login") || lower.includes("register") || lower.includes("sign in");

    const wantsForm = isAuth ? false : (needsForm(lower) || true);
    const wantsList = needsList(lower) || !isAuth;
    const wantsDetail = needsDetail(lower) || !isAuth;
    const wantsCard = needsCard(lower);

    if (wantsForm) {
      files.push({
        file_id: nextId(),
        path: `${featureDir}/${slug}Form.tsx`,
        role: "feature_form",
        layer: "frontend",
        module_ref: modRef,
        subsystem_ref: "sub-frontend",
        generation_method: "ai_assisted",
        source_refs: [feat.feature_id],
        trace_refs: [],
        description: `${feat.name} form component`,
      });
    }

    if (wantsList) {
      files.push({
        file_id: nextId(),
        path: `${featureDir}/${slug}List.tsx`,
        role: "feature_list",
        layer: "frontend",
        module_ref: modRef,
        subsystem_ref: "sub-frontend",
        generation_method: "ai_assisted",
        source_refs: [feat.feature_id],
        trace_refs: [],
        description: `${feat.name} list component`,
      });
    }

    if (wantsDetail) {
      files.push({
        file_id: nextId(),
        path: `${featureDir}/${slug}Detail.tsx`,
        role: "feature_detail",
        layer: "frontend",
        module_ref: modRef,
        subsystem_ref: "sub-frontend",
        generation_method: "ai_assisted",
        source_refs: [feat.feature_id],
        trace_refs: [],
        description: `${feat.name} detail view component`,
      });
    }

    if (wantsCard) {
      files.push({
        file_id: nextId(),
        path: `${featureDir}/${slug}Card.tsx`,
        role: "feature_card",
        layer: "frontend",
        module_ref: modRef,
        subsystem_ref: "sub-frontend",
        generation_method: "ai_assisted",
        source_refs: [feat.feature_id],
        trace_refs: [],
        description: `${feat.name} card component`,
      });
    }
  }
}

function addPageFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  const addedPages = new Set<string>();

  const addPage = (name: string, role: string, sourceRef: string, desc: string) => {
    if (addedPages.has(name)) return;
    addedPages.add(name);
    files.push({
      file_id: nextId(),
      path: `src/pages/${name}.tsx`,
      role,
      layer: "frontend",
      module_ref: "mod-pages",
      subsystem_ref: "sub-frontend",
      generation_method: "ai_assisted",
      source_refs: sourceRef ? [sourceRef] : [],
      trace_refs: [],
      description: desc,
    });
  };

  for (const feat of inputs.feature_map) {
    const lower = (feat.name + " " + feat.description).toLowerCase();
    const category = classifyFeature(lower);

    if (category === "auth") {
      addPage("Login", "auth_page", feat.feature_id, "Login page");
      addPage("Register", "auth_page", feat.feature_id, "Registration page");
      addPage("ForgotPassword", "auth_page", feat.feature_id, "Password recovery page");
    } else if (category === "dashboard") {
      addPage("Dashboard", "feature_page", feat.feature_id, "Dashboard page");
    } else if (category === "settings") {
      addPage("Settings", "settings_page", feat.feature_id, "Settings page");
    } else if (category === "analytics") {
      addPage("Analytics", "feature_page", feat.feature_id, "Analytics page");
    } else if (category === "profile") {
      addPage("Profile", "feature_page", feat.feature_id, "User profile page");
    } else {
      const slug = feat.name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "");
      addPage(slug, "feature_page", feat.feature_id, `${feat.name} page`);
    }
  }

  if (!addedPages.has("Dashboard")) {
    addPage("Dashboard", "feature_page", "", "Dashboard page");
  }

  addPage("Home", "page", "", "Home landing page");
  addPage("NotFound", "error_page", "", "404 not found page");
}

function addHookFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  files.push({
    file_id: nextId(),
    path: "src/hooks/index.ts",
    role: "barrel_export",
    layer: "frontend",
    module_ref: "mod-hooks",
    subsystem_ref: "sub-frontend",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Hooks barrel export",
  });

  files.push({
    file_id: nextId(),
    path: "src/hooks/use-auth.ts",
    role: "hook",
    layer: "frontend",
    module_ref: "mod-hooks",
    subsystem_ref: "sub-frontend",
    generation_method: "ai_assisted",
    source_refs: [],
    trace_refs: [],
    description: "Authentication hook",
  });

  files.push({
    file_id: nextId(),
    path: "src/hooks/use-toast.ts",
    role: "hook",
    layer: "frontend",
    module_ref: "mod-hooks",
    subsystem_ref: "sub-frontend",
    generation_method: "ai_assisted",
    source_refs: [],
    trace_refs: [],
    description: "Toast notification hook",
  });

  for (const feat of inputs.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `src/hooks/use-${slug}.ts`,
      role: "hook",
      layer: "frontend",
      module_ref: "mod-hooks",
      subsystem_ref: "sub-frontend",
      generation_method: "ai_assisted",
      source_refs: [feat.feature_id],
      trace_refs: [],
      description: `Data hook for ${feat.name}`,
    });
  }
}

function addServerRouteFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  files.push({
    file_id: nextId(),
    path: "src/server/routes/index.ts",
    role: "route_index",
    layer: "backend",
    module_ref: "mod-routes",
    subsystem_ref: "sub-backend",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Route registration index",
  });

  const routeSlugs = new Set<string>();

  for (const feat of inputs.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
    if (!routeSlugs.has(slug)) {
      routeSlugs.add(slug);
      files.push({
        file_id: nextId(),
        path: `src/server/routes/${slug}.ts`,
        role: "api_route",
        layer: "backend",
        module_ref: "mod-routes",
        subsystem_ref: "sub-backend",
        generation_method: "ai_assisted",
        source_refs: [feat.feature_id],
        trace_refs: [],
        description: `API routes for ${feat.name}`,
      });
    }
  }

  for (const endpoint of inputs.interfaces.endpoints) {
    const parts = endpoint.path.split("/").filter(Boolean);
    const resource = parts[parts.length - 1]?.replace(/^:/, "") ?? "misc";
    const slug = resource.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!routeSlugs.has(slug)) {
      routeSlugs.add(slug);
      files.push({
        file_id: nextId(),
        path: `src/server/routes/${slug}.ts`,
        role: "api_route",
        layer: "backend",
        module_ref: "mod-routes",
        subsystem_ref: "sub-backend",
        generation_method: "ai_assisted",
        source_refs: [endpoint.source_ref],
        trace_refs: [],
        description: `API routes for ${resource}`,
      });
    }
  }
}

function addMiddlewareFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  const middlewares = [
    { name: "auth.ts", role: "middleware", desc: "Authentication middleware" },
    { name: "error-handler.ts", role: "middleware", desc: "Error handling middleware" },
    { name: "validation.ts", role: "middleware", desc: "Request validation middleware" },
    { name: "rate-limit.ts", role: "middleware", desc: "Rate limiting middleware" },
    { name: "logging.ts", role: "middleware", desc: "Request logging middleware" },
    { name: "cors.ts", role: "middleware", desc: "CORS configuration middleware" },
    { name: "index.ts", role: "barrel_export", desc: "Middleware barrel export" },
  ];

  for (const mw of middlewares) {
    files.push({
      file_id: nextId(),
      path: `src/server/middleware/${mw.name}`,
      role: mw.role,
      layer: "backend",
      module_ref: "mod-middleware",
      subsystem_ref: "sub-backend",
      generation_method: mw.role === "barrel_export" ? "deterministic" : "ai_assisted",
      source_refs: [],
      trace_refs: [],
      description: mw.desc,
    });
  }
}

function addModelFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  files.push({
    file_id: nextId(),
    path: "src/server/models/index.ts",
    role: "model_index",
    layer: "data",
    module_ref: "mod-models",
    subsystem_ref: "sub-data",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Models barrel export",
  });

  files.push({
    file_id: nextId(),
    path: "src/server/models/schema.ts",
    role: "db_schema",
    layer: "data",
    module_ref: "mod-models",
    subsystem_ref: "sub-data",
    generation_method: "deterministic",
    source_refs: ["data_models"],
    trace_refs: [],
    description: "Database schema definitions",
  });

  files.push({
    file_id: nextId(),
    path: "src/server/models/connection.ts",
    role: "db_connection",
    layer: "data",
    module_ref: "mod-models",
    subsystem_ref: "sub-data",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Database connection configuration",
  });

  files.push({
    file_id: nextId(),
    path: "src/server/models/seed.ts",
    role: "db_seed",
    layer: "data",
    module_ref: "mod-models",
    subsystem_ref: "sub-data",
    generation_method: "ai_assisted",
    source_refs: [],
    trace_refs: [],
    description: "Database seed data",
  });
}

function addEntityFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  for (const entity of inputs.domain_model.entities) {
    const slug = entity.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `src/server/models/${slug}.ts`,
      role: "entity_model",
      layer: "data",
      module_ref: "mod-models",
      subsystem_ref: "sub-data",
      generation_method: "deterministic",
      source_refs: [entity.source_ref],
      trace_refs: [],
      description: `Model for ${entity.name} entity`,
    });
  }
}

function addRepositoryFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  files.push({
    file_id: nextId(),
    path: "src/server/repositories/index.ts",
    role: "barrel_export",
    layer: "backend",
    module_ref: "mod-routes",
    subsystem_ref: "sub-backend",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Repositories barrel export",
  });

  for (const entity of inputs.domain_model.entities) {
    const slug = entity.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `src/server/repositories/${slug}.repository.ts`,
      role: "entity_repository",
      layer: "backend",
      module_ref: "mod-routes",
      subsystem_ref: "sub-backend",
      generation_method: "ai_assisted",
      source_refs: [entity.source_ref],
      trace_refs: [],
      description: `Repository for ${entity.name} entity`,
    });
  }
}

function addServiceFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  files.push({
    file_id: nextId(),
    path: "src/server/services/index.ts",
    role: "barrel_export",
    layer: "backend",
    module_ref: "mod-routes",
    subsystem_ref: "sub-backend",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Services barrel export",
  });

  for (const entity of inputs.domain_model.entities) {
    const slug = entity.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `src/server/services/${slug}.service.ts`,
      role: "service_module",
      layer: "backend",
      module_ref: "mod-routes",
      subsystem_ref: "sub-backend",
      generation_method: "ai_assisted",
      source_refs: [entity.source_ref],
      trace_refs: [],
      description: `Service for ${entity.name} entity`,
    });
  }
}

function addControllerFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  files.push({
    file_id: nextId(),
    path: "src/server/controllers/index.ts",
    role: "barrel_export",
    layer: "backend",
    module_ref: "mod-routes",
    subsystem_ref: "sub-backend",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Controllers barrel export",
  });

  for (const feat of inputs.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `src/server/controllers/${slug}.controller.ts`,
      role: "route_handler",
      layer: "backend",
      module_ref: "mod-routes",
      subsystem_ref: "sub-backend",
      generation_method: "ai_assisted",
      source_refs: [feat.feature_id],
      trace_refs: [],
      description: `Controller for ${feat.name}`,
    });
  }
}

function addWorkflowFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  files.push({
    file_id: nextId(),
    path: "src/server/workflows/index.ts",
    role: "barrel_export",
    layer: "backend",
    module_ref: "mod-routes",
    subsystem_ref: "sub-backend",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Workflows barrel export",
  });

  const workflows = inputs.verification?.acceptance_criteria ?? [];
  const workflowSlugs = new Set<string>();

  for (const feat of inputs.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
    if (!workflowSlugs.has(slug)) {
      workflowSlugs.add(slug);
      files.push({
        file_id: nextId(),
        path: `src/server/workflows/${slug}.workflow.ts`,
        role: "event_handler",
        layer: "backend",
        module_ref: "mod-routes",
        subsystem_ref: "sub-backend",
        generation_method: "ai_assisted",
        source_refs: [feat.feature_id],
        trace_refs: [],
        description: `Workflow handler for ${feat.name}`,
      });
    }
  }
}

function addServerInfraFiles(files: BlueprintFileEntry[], nextId: () => string) {
  const infraFiles = [
    { path: "src/server/index.ts", role: "entry_point", desc: "Server entry point" },
    { path: "src/server/app.ts", role: "app_entry", desc: "Express app configuration" },
    { path: "src/server/config/index.ts", role: "config_env", desc: "Server configuration index" },
    { path: "src/server/config/database.ts", role: "db_connection", desc: "Database connection configuration" },
    { path: "src/server/errors/index.ts", role: "barrel_export", desc: "Error classes barrel export" },
    { path: "src/server/errors/AppError.ts", role: "utility", desc: "Application error base class" },
    { path: "src/server/lib/logger.ts", role: "utility", desc: "Server logging utility" },
  ];

  for (const f of infraFiles) {
    files.push({
      file_id: nextId(),
      path: f.path,
      role: f.role,
      layer: "backend",
      module_ref: "mod-routes",
      subsystem_ref: "sub-backend",
      generation_method: f.role === "barrel_export" ? "deterministic" : "ai_assisted",
      source_refs: [],
      trace_refs: [],
      description: f.desc,
    });
  }
}

function addEndpointDerivedFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  for (const event of inputs.interfaces.events) {
    const slug = event.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    files.push({
      file_id: nextId(),
      path: `src/server/events/${slug}.ts`,
      role: "event_handler",
      layer: "backend",
      module_ref: "mod-routes",
      subsystem_ref: "sub-backend",
      generation_method: "ai_assisted",
      source_refs: [event.source_ref],
      trace_refs: [],
      description: `Event handler for ${event.name}`,
    });
  }
}

function addTestFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  files.push({
    file_id: nextId(),
    path: "tests/setup.ts",
    role: "test_setup",
    layer: "test",
    module_ref: "mod-tests",
    subsystem_ref: "sub-test",
    generation_method: "deterministic",
    source_refs: [],
    trace_refs: [],
    description: "Test environment setup",
  });

  for (const feat of inputs.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `tests/unit/${slug}.test.ts`,
      role: "unit_test",
      layer: "test",
      module_ref: "mod-tests",
      subsystem_ref: "sub-test",
      generation_method: "ai_assisted",
      source_refs: [feat.feature_id],
      trace_refs: [],
      description: `Unit tests for ${feat.name}`,
    });
  }

  for (const feat of inputs.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `tests/integration/${slug}.integration.test.ts`,
      role: "integration_test",
      layer: "test",
      module_ref: "mod-tests",
      subsystem_ref: "sub-test",
      generation_method: "ai_assisted",
      source_refs: [feat.feature_id],
      trace_refs: [],
      description: `Integration tests for ${feat.name}`,
    });
  }

  for (const entity of inputs.domain_model.entities) {
    const slug = entity.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `tests/unit/models/${slug}.test.ts`,
      role: "model_test",
      layer: "test",
      module_ref: "mod-tests",
      subsystem_ref: "sub-test",
      generation_method: "ai_assisted",
      source_refs: [entity.source_ref],
      trace_refs: [],
      description: `Model tests for ${entity.name}`,
    });
  }

  for (const criteria of inputs.verification.acceptance_criteria) {
    const slug = criteria.criteria_id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    files.push({
      file_id: nextId(),
      path: `tests/acceptance/${slug}.test.ts`,
      role: "acceptance_test",
      layer: "test",
      module_ref: "mod-tests",
      subsystem_ref: "sub-test",
      generation_method: "ai_assisted",
      source_refs: [criteria.feature_ref],
      trace_refs: [criteria.criteria_id],
      description: `Acceptance test: ${criteria.description}`,
    });
  }

  for (const entity of inputs.domain_model.entities) {
    const slug = entity.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `tests/unit/services/${slug}.service.test.ts`,
      role: "unit_test",
      layer: "test",
      module_ref: "mod-tests",
      subsystem_ref: "sub-test",
      generation_method: "ai_assisted",
      source_refs: [entity.source_ref],
      trace_refs: [],
      description: `Service tests for ${entity.name}`,
    });

    files.push({
      file_id: nextId(),
      path: `tests/unit/repositories/${slug}.repository.test.ts`,
      role: "unit_test",
      layer: "test",
      module_ref: "mod-tests",
      subsystem_ref: "sub-test",
      generation_method: "ai_assisted",
      source_refs: [entity.source_ref],
      trace_refs: [],
      description: `Repository tests for ${entity.name}`,
    });
  }

  for (const feat of inputs.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `tests/unit/controllers/${slug}.controller.test.ts`,
      role: "unit_test",
      layer: "test",
      module_ref: "mod-tests",
      subsystem_ref: "sub-test",
      generation_method: "ai_assisted",
      source_refs: [feat.feature_id],
      trace_refs: [],
      description: `Controller tests for ${feat.name}`,
    });

    files.push({
      file_id: nextId(),
      path: `tests/e2e/${slug}.e2e.test.ts`,
      role: "e2e_test",
      layer: "test",
      module_ref: "mod-tests",
      subsystem_ref: "sub-test",
      generation_method: "ai_assisted",
      source_refs: [feat.feature_id],
      trace_refs: [],
      description: `E2E tests for ${feat.name}`,
    });
  }
}

function addContextFiles(
  files: BlueprintFileEntry[],
  nextId: () => string,
  inputs: KitExtraction["derived_inputs"]
) {
  for (const feat of inputs.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
    files.push({
      file_id: nextId(),
      path: `src/contexts/${slug}.context.tsx`,
      role: "feature_store",
      layer: "frontend",
      module_ref: "mod-store",
      subsystem_ref: "sub-frontend",
      generation_method: "ai_assisted",
      source_refs: [feat.feature_id],
      trace_refs: [],
      description: `Context provider for ${feat.name}`,
    });
  }
}

function addDocFiles(files: BlueprintFileEntry[], nextId: () => string) {
  files.push({
    file_id: nextId(),
    path: "README.md",
    role: "documentation",
    layer: "docs",
    module_ref: "mod-config",
    subsystem_ref: "sub-config",
    generation_method: "ai_assisted",
    source_refs: [],
    trace_refs: [],
    description: "Project README",
  });

  files.push({
    file_id: nextId(),
    path: "docs/API.md",
    role: "api_docs",
    layer: "docs",
    module_ref: "mod-config",
    subsystem_ref: "sub-config",
    generation_method: "ai_assisted",
    source_refs: [],
    trace_refs: [],
    description: "API documentation",
  });
}

function buildDataModel(inputs: KitExtraction["derived_inputs"]): BlueprintDataModel {
  return {
    entities: [...inputs.domain_model.entities],
    schemas: { ...inputs.data },
    migration_strategy: inputs.data.migrations.length > 0 ? "incremental" : "initial",
  };
}

function buildVerificationTargets(
  inputs: KitExtraction["derived_inputs"],
  fileInventory: BlueprintFileEntry[]
): BlueprintVerificationTargets {
  const testFiles = fileInventory
    .filter((f) => f.layer === "test")
    .map((f) => ({
      path: f.path,
      type: f.role,
      covers: f.source_refs,
    }));

  const coverageExpectations: Record<string, number> = {
    ...inputs.verification.coverage_targets,
  };
  if (!coverageExpectations["overall"]) {
    coverageExpectations["overall"] = 70;
  }

  const acceptanceCriteria = inputs.verification.acceptance_criteria.map((c) => ({
    criteria_id: c.criteria_id,
    description: c.description,
    test_refs: fileInventory
      .filter((f) => f.trace_refs.includes(c.criteria_id))
      .map((f) => f.file_id),
  }));

  return {
    test_files: testFiles,
    coverage_expectations: coverageExpectations,
    acceptance_criteria: acceptanceCriteria,
  };
}

function computeFileCountBreakdown(fileInventory: BlueprintFileEntry[]): FileCountBreakdown {
  const breakdown: FileCountBreakdown = {
    frontend: 0,
    backend: 0,
    shared: 0,
    data: 0,
    test: 0,
    config: 0,
    docs: 0,
    total: 0,
  };

  for (const f of fileInventory) {
    switch (f.layer) {
      case "frontend":
        breakdown.frontend++;
        break;
      case "backend":
        breakdown.backend++;
        break;
      case "shared":
        breakdown.shared++;
        break;
      case "data":
        breakdown.data++;
        break;
      case "test":
        breakdown.test++;
        break;
      case "config":
        breakdown.config++;
        break;
      case "docs":
        breakdown.docs++;
        break;
      case "security":
        breakdown.backend++;
        break;
    }
  }

  breakdown.total = fileInventory.length;
  return breakdown;
}

function buildTraceabilityMap(
  inputs: KitExtraction["derived_inputs"],
  fileInventory: BlueprintFileEntry[],
  modules: BlueprintModule[]
): RequirementTraceEntry[] {
  const traceMap: RequirementTraceEntry[] = [];

  for (const feat of inputs.feature_map) {
    const relatedFiles = fileInventory
      .filter((f) => f.source_refs.includes(feat.feature_id))
      .map((f) => f.path);

    const relatedModules = modules
      .filter((m) => m.source_refs.includes(feat.feature_id))
      .map((m) => m.module_id);

    const verificationRefs = fileInventory
      .filter(
        (f) =>
          f.layer === "test" && f.source_refs.includes(feat.feature_id)
      )
      .map((f) => f.file_id);

    traceMap.push({
      requirement_id: feat.feature_id,
      description: feat.description,
      module_refs: relatedModules,
      file_refs: relatedFiles,
      verification_refs: verificationRefs,
    });
  }

  for (const criteria of inputs.verification.acceptance_criteria) {
    const existing = traceMap.find((t) => t.requirement_id === criteria.criteria_id);
    if (!existing) {
      traceMap.push({
        requirement_id: criteria.criteria_id,
        description: criteria.description,
        module_refs: [],
        file_refs: fileInventory
          .filter((f) => f.trace_refs.includes(criteria.criteria_id))
          .map((f) => f.path),
        verification_refs: fileInventory
          .filter((f) => f.trace_refs.includes(criteria.criteria_id))
          .map((f) => f.file_id),
      });
    }
  }

  return traceMap;
}

export function checkBlueprintGate(blueprint: RepoBlueprint): BlueprintGateResult {
  const conditions: Array<{
    condition_id: string;
    description: string;
    passed: boolean;
    detail?: string;
  }> = [];
  const blockers: string[] = [];

  const hasBlueprint = !!blueprint;
  conditions.push({
    condition_id: "rbp-exists",
    description: "Blueprint artifact exists",
    passed: hasBlueprint,
  });
  if (!hasBlueprint) blockers.push("Blueprint artifact missing");

  const hasFileCount = blueprint.expected_file_count > 0;
  conditions.push({
    condition_id: "rbp-file-count",
    description: "Expected file count defined and positive",
    passed: hasFileCount,
    detail: `expected_file_count = ${blueprint.expected_file_count}`,
  });
  if (!hasFileCount) blockers.push("Expected file count is zero or undefined");

  const hasModules = blueprint.module_map.length > 0;
  conditions.push({
    condition_id: "rbp-modules",
    description: "Module map defined with at least one module",
    passed: hasModules,
    detail: `${blueprint.module_map.length} modules defined`,
  });
  if (!hasModules) blockers.push("No modules defined in blueprint");

  const hasDirLayout =
    blueprint.directory_layout.directories.length > 0;
  conditions.push({
    condition_id: "rbp-directories",
    description: "Directory layout defined",
    passed: hasDirLayout,
    detail: `${blueprint.directory_layout.directories.length} directories`,
  });
  if (!hasDirLayout) blockers.push("Directory layout is empty");

  const hasTraceMap = blueprint.traceability_map.length > 0;
  conditions.push({
    condition_id: "rbp-trace-map",
    description: "Traceability map defined",
    passed: hasTraceMap,
    detail: `${blueprint.traceability_map.length} trace entries`,
  });
  if (!hasTraceMap) blockers.push("Traceability map is empty");

  const hasFileInventory = blueprint.file_inventory.length > 0;
  conditions.push({
    condition_id: "rbp-file-inventory",
    description: "File inventory is populated",
    passed: hasFileInventory,
    detail: `${blueprint.file_inventory.length} files in inventory`,
  });
  if (!hasFileInventory) blockers.push("File inventory is empty");

  const fileCountAboveThreshold = blueprint.expected_file_count >= 50;
  conditions.push({
    condition_id: "rbp-file-threshold",
    description: "File count exceeds minimum threshold (50)",
    passed: fileCountAboveThreshold,
    detail: `${blueprint.expected_file_count} files (threshold: 50)`,
  });
  if (!fileCountAboveThreshold) blockers.push("File count below minimum threshold of 50");

  const hasSubsystems = blueprint.subsystems.length > 0;
  conditions.push({
    condition_id: "rbp-subsystems",
    description: "Subsystems defined",
    passed: hasSubsystems,
    detail: `${blueprint.subsystems.length} subsystems`,
  });
  if (!hasSubsystems) blockers.push("No subsystems defined");

  return {
    passed: blockers.length === 0,
    conditions,
    blockers,
  };
}

function inferLayerFromPath(dirPath: string): string {
  if (dirPath.startsWith("src/server") || dirPath.startsWith("src/lib/auth")) return "backend";
  if (dirPath.startsWith("src/components") || dirPath.startsWith("src/pages") || dirPath.startsWith("src/hooks") || dirPath.startsWith("src/styles") || dirPath.startsWith("src/lib/store") || dirPath.startsWith("src/lib/api") || dirPath.startsWith("src/contexts")) return "frontend";
  if (dirPath.startsWith("src/types") || dirPath.startsWith("src/lib/validators")) return "shared";
  if (dirPath.startsWith("tests")) return "test";
  if (dirPath.startsWith("docs") || dirPath.startsWith("public")) return "docs";
  return "config";
}

function inferPurposeFromPath(dirPath: string): string {
  const purposeMap: Record<string, string> = {
    src: "Source code root",
    "src/components": "React components",
    "src/components/layout": "Layout components",
    "src/components/ui": "Reusable UI components",
    "src/components/features": "Feature-specific components",
    "src/pages": "Route-level page components",
    "src/hooks": "Custom React hooks",
    "src/lib": "Library and utility code",
    "src/lib/api": "API client code",
    "src/lib/utils": "Utility functions",
    "src/lib/auth": "Authentication logic",
    "src/lib/validators": "Input validation",
    "src/lib/store": "State management",
    "src/types": "TypeScript type definitions",
    "src/styles": "CSS and styling",
    "src/server": "Backend server code",
    "src/server/routes": "API route handlers",
    "src/server/middleware": "Express middleware",
    "src/server/models": "Database models",
    "src/server/repositories": "Data access repositories",
    "src/server/services": "Business logic services",
    "src/server/controllers": "Request controllers",
    "src/server/workflows": "Workflow handlers",
    "src/server/config": "Server configuration",
    "src/server/errors": "Error classes",
    "src/server/lib": "Server utilities",
    "src/contexts": "React context providers",
    public: "Static assets",
    tests: "Test files",
    "tests/unit": "Unit tests",
    "tests/integration": "Integration tests",
    docs: "Documentation",
  };
  return purposeMap[dirPath] ?? dirPath;
}

function needsForm(lower: string): boolean {
  return lower.includes("create") || lower.includes("add") || lower.includes("edit") || lower.includes("submit") || lower.includes("upload") || lower.includes("form") || lower.includes("input") || lower.includes("manage") || lower.includes("cms") || lower.includes("register") || lower.includes("setting") || lower.includes("config") || lower.includes("profile");
}

function needsList(lower: string): boolean {
  return lower.includes("list") || lower.includes("browse") || lower.includes("search") || lower.includes("view all") || lower.includes("catalog") || lower.includes("archive") || lower.includes("collection") || lower.includes("inventory") || lower.includes("manage") || lower.includes("cms") || lower.includes("history") || lower.includes("feed");
}

function needsDetail(lower: string): boolean {
  return lower.includes("detail") || lower.includes("view") || lower.includes("item") || lower.includes("record") || lower.includes("article") || lower.includes("content") || lower.includes("archive") || lower.includes("document") || lower.includes("profile") || lower.includes("page");
}

function needsCard(lower: string): boolean {
  return lower.includes("card") || lower.includes("tile") || lower.includes("preview") || lower.includes("summary") || lower.includes("dashboard") || lower.includes("widget");
}

function classifyFeature(lower: string): string {
  if (lower.includes("auth") || lower.includes("login") || lower.includes("register") || lower.includes("sign in") || lower.includes("sign up")) return "auth";
  if (lower.includes("dashboard") || lower.includes("overview") || lower.includes("home screen")) return "dashboard";
  if (lower.includes("settings") || lower.includes("admin") || lower.includes("configuration") || lower.includes("preferences")) return "settings";
  if (lower.includes("analytics") || lower.includes("report") || lower.includes("metrics")) return "analytics";
  if (lower.includes("profile") || lower.includes("account")) return "profile";
  return "feature";
}

function dedupeFileInventory(files: BlueprintFileEntry[]): BlueprintFileEntry[] {
  const seen = new Map<string, BlueprintFileEntry>();
  for (const f of files) {
    if (!seen.has(f.path)) {
      seen.set(f.path, f);
    }
  }
  return Array.from(seen.values());
}
