import * as fs from "fs";
import * as path from "path";
import {
  BuildPlan,
  BuildSlice,
  BuildFileTarget,
  StackProfile,
  RepoShape,
  generateBuildId,
} from "./types.js";

interface FeatureEntry {
  feature_id: string;
  name: string;
  description: string;
  priority_tier: string;
}

interface RoleEntry {
  role_id: string;
  name: string;
}

interface WorkflowEntry {
  workflow_id: string;
  name: string;
  steps: string[];
}

interface CanonicalSpec {
  routing?: {
    type_preset?: string;
    build_target?: string;
    category?: string;
  };
  entities?: {
    features?: FeatureEntry[];
    roles?: RoleEntry[];
    workflows?: WorkflowEntry[];
  };
  meta?: {
    spec_id?: string;
    submission_id?: string;
  };
  run_id?: string;
}

interface WorkBreakdown {
  units?: Array<{
    unit_id: string;
    title: string;
    type: string;
    deliverables: string[];
    scope_refs: string[];
  }>;
  unit_index?: Record<string, {
    unit_id: string;
    title: string;
    type: string;
    deliverables: string[];
    scope_refs: string[];
  }>;
}

interface KitManifest {
  files: Array<{
    path: string;
    bytes: number;
    hash: string;
  }>;
  created_at: string;
}

interface Entrypoint {
  kit_root: string;
  run_id: string;
  spec_id: string;
  version: string;
}

export async function createBuildPlan(runDir: string): Promise<BuildPlan> {
  const entrypoint = readJsonFile<Entrypoint>(path.join(runDir, "kit", "entrypoint.json"));
  if (!entrypoint) {
    throw new Error("Missing kit/entrypoint.json — cannot plan build");
  }

  const kitRoot = path.join(runDir, entrypoint.kit_root);
  const runId = entrypoint.run_id;

  const kitManifest = readJsonFile<KitManifest>(path.join(runDir, "kit", "kit_manifest.json"));
  const canonicalSpec = readJsonFile<CanonicalSpec>(
    path.join(kitRoot, "01_core_artifacts", "03_canonical_spec.json")
  );
  const workBreakdown = readJsonFile<WorkBreakdown>(
    path.join(kitRoot, "01_core_artifacts", "04_work_breakdown.json")
  );

  const stackProfile = deriveStackProfile(canonicalSpec);
  const repoShape = deriveRepoShape(stackProfile);

  const apiDocs = scanKitDocs(kitRoot, "09_api_contracts");
  const dataDocs = scanKitDocs(kitRoot, "08_data");
  const implDocs = scanKitDocs(kitRoot, "04_implementation");
  const designDocs = scanKitDocs(kitRoot, "02_design");
  const archDocs = scanKitDocs(kitRoot, "03_architecture");

  const features = canonicalSpec?.entities?.features ?? [];
  const roles = canonicalSpec?.entities?.roles ?? [];
  const workflows = canonicalSpec?.entities?.workflows ?? [];
  const workUnits = workBreakdown?.units ?? [];

  const slices: BuildSlice[] = [];
  let sliceOrder = 0;

  const scaffoldFiles = buildScaffoldFiles(stackProfile, repoShape);
  slices.push(createSlice(`slice-scaffold`, "scaffold", sliceOrder++, false, scaffoldFiles));

  const typesFiles = buildTypesFiles(features, roles, apiDocs);
  slices.push(createSlice(`slice-types`, "types_contracts", sliceOrder++, false, typesFiles));

  const dataFiles = buildDataLayerFiles(dataDocs, features);
  slices.push(createSlice(`slice-data`, "data_layer", sliceOrder++, false, dataFiles));

  const apiFiles = buildApiRouteFiles(apiDocs, features, workflows);
  slices.push(createSlice(`slice-api`, "api_routes", sliceOrder++, true, apiFiles));

  const componentFiles = buildComponentFiles(designDocs, implDocs, features);
  slices.push(createSlice(`slice-components`, "components", sliceOrder++, true, componentFiles));

  const integrationFiles = buildIntegrationFiles(features, archDocs);
  slices.push(createSlice(`slice-integration`, "integration", sliceOrder++, true, integrationFiles));

  const testFiles = buildTestFiles(features, workUnits);
  slices.push(createSlice(`slice-tests`, "tests", sliceOrder++, true, testFiles));

  const configFiles = buildConfigFiles(stackProfile);
  slices.push(createSlice(`slice-config`, "config", sliceOrder++, false, configFiles));

  const totalFiles = slices.reduce((sum, s) => sum + s.files.length, 0);

  const buildPlan: BuildPlan = {
    buildId: generateBuildId(),
    runId,
    kitRef: entrypoint.kit_root,
    stackProfile,
    repoShape,
    slices,
    totalFiles,
    totalSlices: slices.length,
    createdAt: new Date().toISOString(),
  };

  return buildPlan;
}

function deriveStackProfile(spec: CanonicalSpec | null): StackProfile {
  const preset = spec?.routing?.type_preset ?? "web_app";

  const profiles: Record<string, StackProfile> = {
    web_app: {
      framework: "react",
      language: "typescript",
      runtime: "node",
      packageManager: "npm",
      buildTool: "vite",
      testFramework: "vitest",
      cssFramework: "tailwindcss",
      database: "postgresql",
    },
    api_service: {
      framework: "express",
      language: "typescript",
      runtime: "node",
      packageManager: "npm",
      buildTool: "tsc",
      testFramework: "vitest",
      database: "postgresql",
    },
    mobile_app: {
      framework: "react-native",
      language: "typescript",
      runtime: "node",
      packageManager: "npm",
      buildTool: "metro",
      testFramework: "jest",
    },
  };

  return profiles[preset] ?? profiles["web_app"];
}

function deriveRepoShape(stack: StackProfile): RepoShape {
  const isFullStack = stack.framework === "react" || stack.framework === "next";

  if (isFullStack) {
    return {
      rootDirs: ["src", "public", "tests", "docs"],
      srcLayout: {
        "src/components": ["ui", "features", "layout"],
        "src/pages": [],
        "src/hooks": [],
        "src/lib": ["api", "utils", "auth", "validators", "store"],
        "src/types": [],
        "src/styles": [],
        "src/server": ["routes", "middleware", "models"],
      },
      configFiles: [
        "package.json",
        "tsconfig.json",
        "vite.config.ts",
        "tailwind.config.ts",
        "postcss.config.js",
        "index.html",
        ".env.example",
        ".gitignore",
      ],
      docFiles: ["README.md"],
    };
  }

  return {
    rootDirs: ["src", "tests", "docs"],
    srcLayout: {
      "src/routes": [],
      "src/middleware": [],
      "src/models": [],
      "src/types": [],
      "src/lib": ["utils"],
    },
    configFiles: [
      "package.json",
      "tsconfig.json",
      ".env.example",
      ".gitignore",
    ],
    docFiles: ["README.md"],
  };
}

function buildScaffoldFiles(stack: StackProfile, shape: RepoShape): BuildFileTarget[] {
  const files: BuildFileTarget[] = [];

  for (const cfg of shape.configFiles) {
    files.push({
      relativePath: cfg,
      role: "config",
      generationMethod: "deterministic",
      status: "pending",
    });
  }

  files.push({
    relativePath: ".env.example",
    role: "config",
    generationMethod: "deterministic",
    status: "pending",
  });

  return dedupeFiles(files);
}

function buildTypesFiles(
  features: FeatureEntry[],
  roles: RoleEntry[],
  apiDocs: string[]
): BuildFileTarget[] {
  const files: BuildFileTarget[] = [];

  files.push({
    relativePath: "src/types/index.ts",
    role: "shared_types",
    generationMethod: "deterministic",
    status: "pending",
  });

  if (features && features.length > 0) {
    files.push({
      relativePath: "src/types/entities.ts",
      role: "entity_types",
      sourceRef: "canonical_spec.entities",
      generationMethod: "deterministic",
      status: "pending",
    });
  }

  if (apiDocs.length > 0) {
    files.push({
      relativePath: "src/types/api.ts",
      role: "api_types",
      sourceRef: "api_contracts",
      generationMethod: "deterministic",
      status: "pending",
    });
  }

  if (roles && roles.length > 0) {
    files.push({
      relativePath: "src/types/auth.ts",
      role: "auth_types",
      sourceRef: "canonical_spec.roles",
      generationMethod: "deterministic",
      status: "pending",
    });
  }

  return files;
}

function buildDataLayerFiles(dataDocs: string[], features: FeatureEntry[]): BuildFileTarget[] {
  const files: BuildFileTarget[] = [];

  files.push({
    relativePath: "src/server/models/schema.ts",
    role: "db_schema",
    sourceRef: "data_models",
    generationMethod: "deterministic",
    status: "pending",
  });

  files.push({
    relativePath: "src/server/models/index.ts",
    role: "model_index",
    generationMethod: "deterministic",
    status: "pending",
  });

  if (features) {
    for (const feat of features) {
      const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
      files.push({
        relativePath: `src/server/models/${slug}.ts`,
        role: "entity_model",
        sourceRef: feat.feature_id,
        generationMethod: "deterministic",
        status: "pending",
      });
    }
  }

  return files;
}

function buildApiRouteFiles(
  apiDocs: string[],
  features: FeatureEntry[],
  workflows: WorkflowEntry[]
): BuildFileTarget[] {
  const files: BuildFileTarget[] = [];

  files.push({
    relativePath: "src/server/routes/index.ts",
    role: "route_index",
    generationMethod: "deterministic",
    status: "pending",
  });

  if (features) {
    for (const feat of features) {
      const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
      files.push({
        relativePath: `src/server/routes/${slug}.ts`,
        role: "api_route",
        sourceRef: feat.feature_id,
        generationMethod: "ai_assisted",
        status: "pending",
      });
    }
  }

  files.push({
    relativePath: "src/server/middleware/auth.ts",
    role: "middleware",
    sourceRef: "roles_permissions",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/server/middleware/error-handler.ts",
    role: "middleware",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/server/middleware/validation.ts",
    role: "middleware",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  if (workflows) {
    for (const wf of workflows) {
      if (wf.steps && wf.steps.length > 2) {
        const slug = wf.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        files.push({
          relativePath: `src/server/middleware/${slug}.ts`,
          role: "workflow_middleware",
          sourceRef: wf.workflow_id,
          generationMethod: "ai_assisted",
          status: "pending",
        });
      }
    }
  }

  return dedupeFiles(files);
}

function classifyFeature(feat: FeatureEntry): string {
  const lower = (feat.name + " " + feat.description).toLowerCase();
  if (lower.includes("auth") || lower.includes("login") || lower.includes("register") || lower.includes("sign in") || lower.includes("sign up")) return "auth";
  if (lower.includes("dashboard") || lower.includes("overview") || lower.includes("home screen")) return "dashboard";
  if (lower.includes("settings") || lower.includes("admin") || lower.includes("configuration") || lower.includes("preferences")) return "settings";
  if (lower.includes("analytics") || lower.includes("report") || lower.includes("metrics")) return "analytics";
  if (lower.includes("profile") || lower.includes("account")) return "profile";
  return "feature";
}

function featureToPageSlug(feat: FeatureEntry): string {
  return feat.name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "");
}

function featureToRouteSlug(feat: FeatureEntry): string {
  return feat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function featureNeedsForm(feat: FeatureEntry): boolean {
  const lower = (feat.name + " " + feat.description).toLowerCase();
  return lower.includes("create") || lower.includes("add") || lower.includes("edit") || lower.includes("submit") || lower.includes("upload") || lower.includes("form") || lower.includes("input") || lower.includes("manage") || lower.includes("cms") || lower.includes("register") || lower.includes("setting") || lower.includes("config") || lower.includes("profile");
}

function featureNeedsList(feat: FeatureEntry): boolean {
  const lower = (feat.name + " " + feat.description).toLowerCase();
  return lower.includes("list") || lower.includes("browse") || lower.includes("search") || lower.includes("view all") || lower.includes("catalog") || lower.includes("archive") || lower.includes("collection") || lower.includes("inventory") || lower.includes("manage") || lower.includes("cms") || lower.includes("history") || lower.includes("feed");
}

function featureNeedsDetail(feat: FeatureEntry): boolean {
  const lower = (feat.name + " " + feat.description).toLowerCase();
  return lower.includes("detail") || lower.includes("view") || lower.includes("item") || lower.includes("record") || lower.includes("article") || lower.includes("content") || lower.includes("archive") || lower.includes("document") || lower.includes("profile") || lower.includes("page");
}

function featureNeedsSearch(features: FeatureEntry[]): boolean {
  return features.some(f => {
    const lower = (f.name + " " + f.description).toLowerCase();
    return lower.includes("search") || lower.includes("filter") || lower.includes("find") || lower.includes("query") || lower.includes("browse");
  });
}

function buildComponentFiles(
  designDocs: string[],
  implDocs: string[],
  features: FeatureEntry[]
): BuildFileTarget[] {
  const files: BuildFileTarget[] = [];

  files.push({
    relativePath: "src/components/layout/AppLayout.tsx",
    role: "layout_component",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/components/layout/Header.tsx",
    role: "layout_component",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/components/layout/Sidebar.tsx",
    role: "layout_component",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/components/ui/Button.tsx",
    role: "ui_component",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/components/ui/Card.tsx",
    role: "ui_component",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/components/ui/Input.tsx",
    role: "ui_component",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/components/ui/Modal.tsx",
    role: "ui_component",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/components/ui/Table.tsx",
    role: "ui_component",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/components/ui/LoadingSpinner.tsx",
    role: "ui_component",
    generationMethod: "deterministic",
    status: "pending",
  });

  files.push({
    relativePath: "src/components/ui/ErrorBoundary.tsx",
    role: "error_boundary",
    generationMethod: "deterministic",
    status: "pending",
  });

  files.push({
    relativePath: "src/components/ui/EmptyState.tsx",
    role: "ui_component",
    generationMethod: "deterministic",
    status: "pending",
  });

  files.push({
    relativePath: "src/components/ui/Pagination.tsx",
    role: "ui_component",
    generationMethod: "deterministic",
    status: "pending",
  });

  if (featureNeedsSearch(features)) {
    files.push({
      relativePath: "src/components/ui/SearchInput.tsx",
      role: "ui_component",
      generationMethod: "ai_assisted",
      status: "pending",
    });
  }

  const hasAuth = features.some(f => classifyFeature(f) === "auth");
  const hasDashboard = features.some(f => classifyFeature(f) === "dashboard");

  if (hasAuth) {
    files.push({
      relativePath: "src/components/layout/AuthLayout.tsx",
      role: "auth_layout",
      generationMethod: "ai_assisted",
      status: "pending",
    });
  }

  if (features) {
    for (const feat of features) {
      const slug = feat.name.replace(/\s+/g, "");
      const category = classifyFeature(feat);

      files.push({
        relativePath: `src/components/features/${slug}/index.tsx`,
        role: "feature_component",
        sourceRef: feat.feature_id,
        generationMethod: "ai_assisted",
        status: "pending",
      });

      if (category !== "auth" && featureNeedsForm(feat)) {
        files.push({
          relativePath: `src/components/features/${slug}/${slug}Form.tsx`,
          role: "feature_form",
          sourceRef: feat.feature_id,
          generationMethod: "ai_assisted",
          status: "pending",
        });
      }

      if (featureNeedsList(feat)) {
        files.push({
          relativePath: `src/components/features/${slug}/${slug}List.tsx`,
          role: "feature_list",
          sourceRef: feat.feature_id,
          generationMethod: "ai_assisted",
          status: "pending",
        });
      }

      if (featureNeedsDetail(feat)) {
        files.push({
          relativePath: `src/components/features/${slug}/${slug}Detail.tsx`,
          role: "feature_detail",
          sourceRef: feat.feature_id,
          generationMethod: "ai_assisted",
          status: "pending",
        });
      }

      if (category === "auth") {
        if (!files.some(f => f.relativePath === "src/pages/Login.tsx")) {
          files.push({
            relativePath: "src/pages/Login.tsx",
            role: "auth_page",
            sourceRef: feat.feature_id,
            generationMethod: "ai_assisted",
            status: "pending",
          });
          files.push({
            relativePath: "src/pages/Register.tsx",
            role: "auth_page",
            sourceRef: feat.feature_id,
            generationMethod: "ai_assisted",
            status: "pending",
          });
          files.push({
            relativePath: "src/pages/ForgotPassword.tsx",
            role: "auth_page",
            sourceRef: feat.feature_id,
            generationMethod: "ai_assisted",
            status: "pending",
          });
        }
      } else if (category === "dashboard") {
        files.push({
          relativePath: "src/pages/Dashboard.tsx",
          role: "feature_page",
          sourceRef: feat.feature_id,
          generationMethod: "ai_assisted",
          status: "pending",
        });
      } else if (category === "settings") {
        files.push({
          relativePath: "src/pages/Settings.tsx",
          role: "settings_page",
          sourceRef: feat.feature_id,
          generationMethod: "ai_assisted",
          status: "pending",
        });
      } else if (category === "analytics") {
        files.push({
          relativePath: "src/pages/Analytics.tsx",
          role: "feature_page",
          sourceRef: feat.feature_id,
          generationMethod: "ai_assisted",
          status: "pending",
        });
      } else if (category === "profile") {
        files.push({
          relativePath: "src/pages/Profile.tsx",
          role: "feature_page",
          sourceRef: feat.feature_id,
          generationMethod: "ai_assisted",
          status: "pending",
        });
      } else {
        const pageSlug = featureToPageSlug(feat);
        files.push({
          relativePath: `src/pages/${pageSlug}.tsx`,
          role: "feature_page",
          sourceRef: feat.feature_id,
          generationMethod: "ai_assisted",
          status: "pending",
        });
      }
    }
  }

  if (!hasDashboard && !files.some(f => f.relativePath === "src/pages/Dashboard.tsx")) {
    files.push({
      relativePath: "src/pages/Dashboard.tsx",
      role: "feature_page",
      generationMethod: "ai_assisted",
      status: "pending",
    });
  }

  files.push({
    relativePath: "src/pages/Home.tsx",
    role: "page",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/pages/NotFound.tsx",
    role: "error_page",
    generationMethod: "deterministic",
    status: "pending",
  });

  files.push({
    relativePath: "src/styles/globals.css",
    role: "styles",
    generationMethod: "deterministic",
    status: "pending",
  });

  files.push({
    relativePath: "src/App.tsx",
    role: "app_entry",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/main.tsx",
    role: "entry_point",
    generationMethod: "deterministic",
    status: "pending",
  });

  return dedupeFiles(files);
}

function buildIntegrationFiles(
  features: FeatureEntry[],
  archDocs: string[]
): BuildFileTarget[] {
  const files: BuildFileTarget[] = [];

  files.push({
    relativePath: "src/lib/api/client.ts",
    role: "api_client",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/lib/api/endpoints.ts",
    role: "api_endpoints",
    generationMethod: "deterministic",
    status: "pending",
  });

  files.push({
    relativePath: "src/lib/api/interceptors.ts",
    role: "api_interceptor",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  if (features) {
    for (const feat of features) {
      const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
      files.push({
        relativePath: `src/hooks/use-${slug}.ts`,
        role: "hook",
        sourceRef: feat.feature_id,
        generationMethod: "ai_assisted",
        status: "pending",
      });
    }
  }

  files.push({
    relativePath: "src/lib/utils/index.ts",
    role: "utilities",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  files.push({
    relativePath: "src/lib/validators/index.ts",
    role: "validation",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  if (features) {
    for (const feat of features) {
      const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
      files.push({
        relativePath: `src/lib/validators/${slug}.ts`,
        role: "feature_validation",
        sourceRef: feat.feature_id,
        generationMethod: "ai_assisted",
        status: "pending",
      });
    }
  }

  const hasAuth = features.some(f => classifyFeature(f) === "auth");
  if (hasAuth) {
    files.push({
      relativePath: "src/lib/auth/AuthContext.tsx",
      role: "auth_context",
      generationMethod: "deterministic",
      status: "pending",
    });
    files.push({
      relativePath: "src/lib/auth/useAuth.ts",
      role: "auth_hook",
      generationMethod: "ai_assisted",
      status: "pending",
    });
    files.push({
      relativePath: "src/lib/auth/ProtectedRoute.tsx",
      role: "route_guard",
      generationMethod: "deterministic",
      status: "pending",
    });
  }

  files.push({
    relativePath: "src/lib/store/index.ts",
    role: "state_store",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  return files;
}

function buildTestFiles(
  features: FeatureEntry[],
  workUnits: WorkBreakdown["units"]
): BuildFileTarget[] {
  const files: BuildFileTarget[] = [];

  if (features) {
    for (const feat of features) {
      const slug = feat.name.toLowerCase().replace(/\s+/g, "-");
      files.push({
        relativePath: `tests/unit/${slug}.test.ts`,
        role: "test",
        sourceRef: feat.feature_id,
        generationMethod: "ai_assisted",
        status: "pending",
      });

      files.push({
        relativePath: `tests/integration/${slug}.integration.test.ts`,
        role: "test",
        sourceRef: feat.feature_id,
        generationMethod: "ai_assisted",
        status: "pending",
      });
    }
  }

  files.push({
    relativePath: "tests/setup.ts",
    role: "test_setup",
    generationMethod: "deterministic",
    status: "pending",
  });

  files.push({
    relativePath: "tests/helpers.ts",
    role: "test_setup",
    generationMethod: "ai_assisted",
    status: "pending",
  });

  return files;
}

function buildConfigFiles(stack: StackProfile): BuildFileTarget[] {
  const files: BuildFileTarget[] = [];

  files.push({
    relativePath: "README.md",
    role: "documentation",
    generationMethod: "deterministic",
    status: "pending",
  });

  files.push({
    relativePath: "docker-compose.yml",
    role: "infrastructure",
    generationMethod: "deterministic",
    status: "pending",
  });

  files.push({
    relativePath: ".github/workflows/ci.yml",
    role: "ci_config",
    generationMethod: "deterministic",
    status: "pending",
  });

  return files;
}

function scanKitDocs(kitRoot: string, subdir: string): string[] {
  const dirPath = path.join(kitRoot, "10_app", subdir);
  try {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath)
      .filter((f: string) => f.endsWith(".md") || f.endsWith(".json"))
      .map((f: string) => path.join(dirPath, f));
  } catch {
    return [];
  }
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function createSlice(
  sliceId: string,
  name: string,
  order: number,
  requiresAI: boolean,
  files: BuildFileTarget[]
): BuildSlice {
  return {
    sliceId,
    name,
    order,
    requiresAI,
    files,
    status: "pending",
  };
}

function dedupeFiles(files: BuildFileTarget[]): BuildFileTarget[] {
  const seen = new Set<string>();
  return files.filter((f) => {
    if (seen.has(f.relativePath)) return false;
    seen.add(f.relativePath);
    return true;
  });
}

export async function writeBuildPlan(runDir: string, plan: BuildPlan): Promise<string> {
  const buildDir = path.join(runDir, "build");
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  const planPath = path.join(buildDir, "build_plan.json");
  fs.writeFileSync(planPath, JSON.stringify(plan, null, 2), "utf-8");
  return planPath;
}
