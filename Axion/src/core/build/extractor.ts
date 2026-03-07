import * as fs from "fs";
import * as path from "path";
import type {
  KitExtraction,
  SourceLayerResult,
  ExtractionGap,
  ExtractionCoverageSummary,
  ProjectionArtifactSummary,
  DerivedBuildImplications,
  DerivedBuildInputs,
  AppIdentity,
  DomainModel,
  DomainEntity,
  FeatureMapEntry,
  InterfaceContracts,
  DataSchemas,
  SecurityModel,
  VerificationExpectations,
  RepoInventory,
  RequirementTraceEntry,
  ExtractionGateResult,
} from "./types.js";

interface Entrypoint {
  kit_root: string;
  run_id: string;
  spec_id: string;
  version: string;
}

interface KitManifest {
  files: Array<{ path: string; bytes: number; hash: string }>;
  created_at: string;
}

interface CanonicalSpec {
  routing?: {
    type_preset?: string;
    build_target?: string;
    category?: string;
  };
  entities?: {
    features?: Array<{
      feature_id: string;
      name: string;
      description: string;
      priority_tier?: string;
      priority_rank?: number;
    }>;
    roles?: Array<{
      role_id: string;
      name: string;
      description?: string;
    }>;
    workflows?: Array<{
      workflow_id: string;
      name: string;
      steps: string[];
      actor_role_ref?: string;
      success_outcome?: string;
    }>;
    permissions?: Array<{
      perm_id: string;
      role_ref: string;
      allowed_capabilities: string[];
    }>;
  };
  meta?: {
    spec_id?: string;
    submission_id?: string;
    project_name?: string;
    project_overview?: string;
  };
  constraints?: {
    stack_constraints?: Record<string, unknown>;
    security_constraints?: Record<string, unknown>;
    design_constraints?: Record<string, unknown>;
    quality_constraints?: Record<string, unknown>;
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
    depends_on?: string[];
    description?: string;
    outputs?: string[];
  }>;
  unit_index?: Record<string, {
    unit_id: string;
    title: string;
    type: string;
    deliverables: string[];
    scope_refs: string[];
    depends_on?: string[];
    description?: string;
    outputs?: string[];
  }>;
}

interface AcceptanceMap {
  acceptance?: Array<{
    acceptance_id: string;
    title: string;
    statement: string;
    category: string;
    criteria: string[];
    unit_ref?: string;
    unit_id?: string;
    scope_refs?: string[];
    gating?: string;
    how_to_verify?: string;
    proof_required?: boolean;
    proof_type?: string;
    criterion_type?: string;
  }>;
}

interface NormalizedInput {
  project_name?: string;
  project_type?: string;
  description?: string;
  project_overview?: string;
  raw_text?: string;
}

const SOURCE_LAYERS = [
  { id: "build_brief", required: true, type: "json" as const, corePath: "01_core_artifacts/01_normalized_input_record.json", appPath: null },
  { id: "canonical_spec", required: true, type: "json" as const, corePath: "01_core_artifacts/03_canonical_spec.json", appPath: null },
  { id: "work_breakdown", required: true, type: "json" as const, corePath: "01_core_artifacts/04_work_breakdown.json", appPath: null },
  { id: "acceptance_map", required: true, type: "json" as const, corePath: "01_core_artifacts/05_acceptance_map.json", appPath: null },
  { id: "architecture_pack", required: true, type: "dir" as const, corePath: null, appPath: "10_app/03_architecture" },
  { id: "implementation_pack", required: false, type: "dir" as const, corePath: null, appPath: "10_app/04_implementation" },
  { id: "data_pack", required: true, type: "dir" as const, corePath: null, appPath: "10_app/08_data" },
  { id: "api_pack", required: true, type: "dir" as const, corePath: null, appPath: "10_app/09_api_contracts" },
  { id: "security_pack", required: true, type: "dir" as const, corePath: null, appPath: "10_app/05_security" },
  { id: "design_pack", required: false, type: "dir" as const, corePath: null, appPath: "10_app/02_design" },
  { id: "ops_governance_pack", required: false, type: "dir" as const, corePath: null, appPath: "10_app/07_ops" },
] as const;

export async function extractKit(runDir: string): Promise<KitExtraction> {
  const entrypoint = readJsonFile<Entrypoint>(path.join(runDir, "kit", "entrypoint.json"));
  if (!entrypoint) {
    throw new Error("Missing kit/entrypoint.json — cannot extract kit");
  }

  const kitRoot = path.join(runDir, entrypoint.kit_root);
  const runId = entrypoint.run_id;

  const kitManifest = readJsonFile<KitManifest>(path.join(runDir, "kit", "kit_manifest.json"));
  const kitFileCount = kitManifest?.files?.length ?? 0;

  const canonicalSpec = readJsonFile<CanonicalSpec>(path.join(kitRoot, "01_core_artifacts", "03_canonical_spec.json"));
  const workBreakdown = readJsonFile<WorkBreakdown>(path.join(kitRoot, "01_core_artifacts", "04_work_breakdown.json"));
  const acceptanceMap = readJsonFile<AcceptanceMap>(path.join(kitRoot, "01_core_artifacts", "05_acceptance_map.json"));
  const normalizedInput = readJsonFile<NormalizedInput>(path.join(kitRoot, "01_core_artifacts", "01_normalized_input_record.json"));

  const sourceLayerResults: SourceLayerResult[] = [];
  const extractionGaps: ExtractionGap[] = [];
  let totalExtracted = 0;
  let totalIgnored = 0;
  let failedLayers = 0;

  for (const layer of SOURCE_LAYERS) {
    const result = extractSourceLayer(kitRoot, layer, extractionGaps);
    sourceLayerResults.push(result);
    if (result.extracted) {
      totalExtracted += result.extracted_count;
    } else if (result.required) {
      failedLayers++;
    } else {
      totalIgnored += result.gap_count;
    }
  }

  const requirementsFiles = scanDirFiles(path.join(kitRoot, "10_app", "01_requirements"));
  const qualityFiles = scanDirFiles(path.join(kitRoot, "10_app", "06_quality"));
  const releaseFiles = scanDirFiles(path.join(kitRoot, "10_app", "10_release"));
  const governanceFiles = scanDirFiles(path.join(kitRoot, "10_app", "11_governance"));
  const analyticsFiles = scanDirFiles(path.join(kitRoot, "10_app", "12_analytics"));

  const appIdentity = deriveAppIdentity(canonicalSpec, normalizedInput);
  const domainModel = deriveDomainModel(canonicalSpec, kitRoot);
  const subsystems = deriveSubsystems(canonicalSpec, kitRoot);
  const featureMap = deriveFeatureMap(canonicalSpec, workBreakdown);
  const interfaces = deriveInterfaces(canonicalSpec, kitRoot);
  const dataSchemas = deriveDataSchemas(kitRoot);
  const securityModel = deriveSecurityModel(canonicalSpec, kitRoot);
  const verification = deriveVerificationExpectations(acceptanceMap);

  const derivedInputs: DerivedBuildInputs = {
    app_identity: appIdentity,
    domain_model: domainModel,
    subsystems,
    feature_map: featureMap,
    interfaces,
    data: dataSchemas,
    security: securityModel,
    verification,
  };

  const repoInventory = deriveRepoInventory(derivedInputs, canonicalSpec);
  const requirementTraceMap = deriveRequirementTraceMap(derivedInputs, repoInventory);

  const derivedImplications = deriveBuildImplications(derivedInputs, repoInventory);

  const projectionArtifacts = deriveProjectionArtifacts(derivedInputs, repoInventory);

  const extractionCoverage: ExtractionCoverageSummary = {
    total_kit_files: kitFileCount,
    total_extracted_files: totalExtracted,
    total_ignored_files: totalIgnored,
    required_source_layers: SOURCE_LAYERS.filter(l => l.required).length,
    extracted_source_layers: sourceLayerResults.filter(r => r.extracted).length,
    failed_source_layers: failedLayers,
  };

  const hasBlockers = extractionGaps.some(g => g.blocks_build);
  const extractionResult = hasBlockers ? "failed" as const : failedLayers > 0 ? "partial" as const : "passed" as const;
  const gateRecommendation = hasBlockers ? "block_build" as const :
    extractionGaps.filter(g => g.severity === "warning").length > 0 ? "allow_with_warnings" as const : "allow_build" as const;

  const now = new Date().toISOString();
  const extractionId = `KEX-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`;

  const extraction: KitExtraction = {
    kit_extraction_report_id: extractionId,
    run_id: runId,
    kit_ref: entrypoint.kit_root,
    kit_manifest_ref: "kit/kit_manifest.json",
    kit_version: entrypoint.version,
    kit_file_count: kitFileCount,
    kit_root_path: kitRoot,
    extraction_coverage_summary: extractionCoverage,
    source_layer_results: sourceLayerResults,
    projection_artifact_summary: projectionArtifacts,
    derived_build_implications: derivedImplications,
    derived_inputs: derivedInputs,
    repo_inventory: repoInventory,
    requirement_trace_map: requirementTraceMap,
    extraction_gaps: extractionGaps,
    extraction_result: extractionResult,
    build_gate_recommendation: gateRecommendation,
    created_at: now,
    updated_at: now,
    status: "active",
  };

  const buildDir = path.join(runDir, "build");
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(buildDir, "kit_extraction.json"),
    JSON.stringify(extraction, null, 2),
    "utf-8",
  );

  return extraction;
}

export function checkExtractionGate(extraction: KitExtraction): ExtractionGateResult {
  const conditions: Array<{ condition_id: string; description: string; passed: boolean; detail?: string }> = [];
  const blockers: string[] = [];

  const requiredLayers = extraction.source_layer_results.filter(r => r.required);
  const allRequiredExtracted = requiredLayers.every(r => r.extracted);
  conditions.push({
    condition_id: "KEX-G-01",
    description: "All required source layers extracted",
    passed: allRequiredExtracted,
    detail: allRequiredExtracted ? `${requiredLayers.length} required layers extracted` : `Missing: ${requiredLayers.filter(r => !r.extracted).map(r => r.source_layer).join(", ")}`,
  });
  if (!allRequiredExtracted) {
    blockers.push(`Required layers not extracted: ${requiredLayers.filter(r => !r.extracted).map(r => r.source_layer).join(", ")}`);
  }

  const hasRepoInventory = extraction.repo_inventory.expected_files.length > 0;
  conditions.push({
    condition_id: "KEX-G-02",
    description: "Repo inventory derived",
    passed: hasRepoInventory,
    detail: hasRepoInventory ? `${extraction.repo_inventory.expected_files.length} files in inventory` : "No files in repo inventory",
  });
  if (!hasRepoInventory) {
    blockers.push("Repo inventory is empty");
  }

  const hasTraceMap = extraction.requirement_trace_map.length > 0;
  conditions.push({
    condition_id: "KEX-G-03",
    description: "Requirement trace map generated",
    passed: hasTraceMap,
    detail: hasTraceMap ? `${extraction.requirement_trace_map.length} trace entries` : "No trace entries",
  });
  if (!hasTraceMap) {
    blockers.push("Requirement trace map is empty");
  }

  const fileCountThreshold = 10;
  const meetsThreshold = extraction.repo_inventory.expected_file_count >= fileCountThreshold;
  conditions.push({
    condition_id: "KEX-G-04",
    description: `Expected file count above threshold (${fileCountThreshold})`,
    passed: meetsThreshold,
    detail: `Expected ${extraction.repo_inventory.expected_file_count} files`,
  });
  if (!meetsThreshold) {
    blockers.push(`Expected file count (${extraction.repo_inventory.expected_file_count}) below threshold (${fileCountThreshold})`);
  }

  const hasBlockingGaps = extraction.extraction_gaps.some(g => g.blocks_build);
  conditions.push({
    condition_id: "KEX-G-05",
    description: "No blocking extraction gaps",
    passed: !hasBlockingGaps,
    detail: hasBlockingGaps ? `${extraction.extraction_gaps.filter(g => g.blocks_build).length} blocking gaps` : "No blocking gaps",
  });
  if (hasBlockingGaps) {
    blockers.push(`Blocking extraction gaps: ${extraction.extraction_gaps.filter(g => g.blocks_build).map(g => g.description).join("; ")}`);
  }

  return {
    passed: blockers.length === 0,
    conditions,
    blockers,
  };
}

function extractSourceLayer(
  kitRoot: string,
  layer: typeof SOURCE_LAYERS[number],
  gaps: ExtractionGap[],
): SourceLayerResult {
  const sourceRefs: string[] = [];
  let extracted = false;
  let extractedCount = 0;
  let gapCount = 0;
  let notes: string | null = null;

  if (layer.type === "json" && layer.corePath) {
    const fullPath = path.join(kitRoot, layer.corePath);
    if (fs.existsSync(fullPath)) {
      sourceRefs.push(layer.corePath);
      extracted = true;
      extractedCount = 1;
    } else {
      gapCount = 1;
      if (layer.required) {
        gaps.push({
          gap_id: `GAP-${layer.id}`,
          source_layer: layer.id,
          source_ref: layer.corePath,
          gap_type: "not_extracted",
          severity: "error",
          description: `Required file missing: ${layer.corePath}`,
          blocks_build: true,
        });
      }
      notes = `File not found: ${layer.corePath}`;
    }
  } else if (layer.type === "dir" && layer.appPath) {
    const dirPath = path.join(kitRoot, layer.appPath);
    const files = scanDirFiles(dirPath);
    if (files.length > 0) {
      for (const f of files) {
        sourceRefs.push(path.join(layer.appPath, f));
      }
      extracted = true;
      extractedCount = files.length;
    } else {
      gapCount = 1;
      if (layer.required) {
        gaps.push({
          gap_id: `GAP-${layer.id}`,
          source_layer: layer.id,
          source_ref: layer.appPath,
          gap_type: "not_extracted",
          severity: "error",
          description: `Required directory empty or missing: ${layer.appPath}`,
          blocks_build: true,
        });
      }
      notes = `Directory empty or missing: ${layer.appPath}`;
    }
  }

  return {
    source_layer: layer.id,
    required: layer.required,
    source_refs: sourceRefs,
    extracted,
    extracted_count: extractedCount,
    gap_count: gapCount,
    notes,
  };
}

function deriveAppIdentity(spec: CanonicalSpec | null, input: NormalizedInput | null): AppIdentity {
  const projectName = spec?.meta?.project_name ?? input?.project_name ?? "Untitled Project";
  const projectOverview = spec?.meta?.project_overview ?? input?.project_overview ?? input?.description ?? "";
  const appType = spec?.routing?.type_preset ?? input?.project_type ?? "web_app";

  return {
    app_name: projectName,
    app_type: appType,
    description: projectOverview,
    project_overview: projectOverview,
  };
}

function deriveDomainModel(spec: CanonicalSpec | null, kitRoot: string): DomainModel {
  const entities: DomainEntity[] = [];
  const relationships: Array<{ from: string; to: string; type: string }> = [];
  const stateMachines: Array<{ entity: string; states: string[]; transitions: string[] }> = [];

  const features = spec?.entities?.features ?? [];
  const roles = spec?.entities?.roles ?? [];
  const workflows = spec?.entities?.workflows ?? [];

  for (const feat of features) {
    entities.push({
      entity_id: feat.feature_id,
      name: feat.name,
      fields: ["id", "created_at", "updated_at"],
      relationships: [],
      source_ref: `canonical_spec.entities.features.${feat.feature_id}`,
    });
  }

  if (roles.length > 0) {
    entities.push({
      entity_id: "ENT-USER",
      name: "User",
      fields: ["id", "email", "password_hash", "role", "created_at", "updated_at"],
      relationships: roles.map(r => r.role_id),
      source_ref: "canonical_spec.entities.roles",
    });

    for (const role of roles) {
      entities.push({
        entity_id: `ENT-ROLE-${role.role_id}`,
        name: role.name,
        fields: ["id", "name", "permissions"],
        relationships: ["ENT-USER"],
        source_ref: `canonical_spec.entities.roles.${role.role_id}`,
      });
      relationships.push({ from: "ENT-USER", to: `ENT-ROLE-${role.role_id}`, type: "has_role" });
    }
  }

  for (const wf of workflows) {
    if (wf.steps && wf.steps.length > 0) {
      stateMachines.push({
        entity: wf.workflow_id,
        states: wf.steps,
        transitions: wf.steps.slice(0, -1).map((s, i) => `${s} → ${wf.steps[i + 1]}`),
      });
    }
  }

  const dataFiles = scanDirFiles(path.join(kitRoot, "10_app", "03_data_models"));
  for (const dataFile of dataFiles) {
    const content = readFileContent(path.join(kitRoot, "10_app", "03_data_models", dataFile));
    if (content) {
      const extractedEntities = extractEntitiesFromMd(content, dataFile);
      for (const ent of extractedEntities) {
        if (!entities.some(e => e.entity_id === ent.entity_id)) {
          entities.push(ent);
        }
      }
    }
  }

  return { entities, relationships, state_machines: stateMachines };
}

function deriveSubsystems(spec: CanonicalSpec | null, kitRoot: string): DerivedBuildInputs["subsystems"] {
  const subsystems: DerivedBuildInputs["subsystems"] = [];

  subsystems.push({
    subsystem_id: "SS-CORE",
    name: "Core Application",
    description: "Main application entry, routing, and shared utilities",
    layer: "shared",
    source_refs: ["canonical_spec"],
  });

  const archFiles = scanDirFiles(path.join(kitRoot, "10_app", "02_architecture"));
  if (archFiles.length > 0) {
    subsystems.push({
      subsystem_id: "SS-FRONTEND",
      name: "Frontend",
      description: "UI components, pages, layout, and client-side logic",
      layer: "frontend",
      source_refs: archFiles.map(f => `10_app/02_architecture/${f}`),
    });
    subsystems.push({
      subsystem_id: "SS-BACKEND",
      name: "Backend",
      description: "API routes, middleware, business logic, and data access",
      layer: "backend",
      source_refs: archFiles.map(f => `10_app/02_architecture/${f}`),
    });
  }

  const dataFiles = scanDirFiles(path.join(kitRoot, "10_app", "03_data_models"));
  if (dataFiles.length > 0) {
    subsystems.push({
      subsystem_id: "SS-DATA",
      name: "Data Layer",
      description: "Database models, schemas, and data access",
      layer: "data",
      source_refs: dataFiles.map(f => `10_app/03_data_models/${f}`),
    });
  }

  const securityFiles = scanDirFiles(path.join(kitRoot, "10_app", "05_auth_security"));
  if (securityFiles.length > 0) {
    subsystems.push({
      subsystem_id: "SS-AUTH",
      name: "Authentication & Security",
      description: "Auth flows, RBAC, security middleware",
      layer: "security",
      source_refs: securityFiles.map(f => `10_app/05_auth_security/${f}`),
    });
  }

  const testFiles = scanDirFiles(path.join(kitRoot, "10_app", "09_testing"));
  if (testFiles.length > 0) {
    subsystems.push({
      subsystem_id: "SS-TEST",
      name: "Testing",
      description: "Unit tests, integration tests, test utilities",
      layer: "test",
      source_refs: testFiles.map(f => `10_app/09_testing/${f}`),
    });
  }

  return subsystems;
}

function deriveFeatureMap(spec: CanonicalSpec | null, wb: WorkBreakdown | null): FeatureMapEntry[] {
  const features = spec?.entities?.features ?? [];
  const units = wb?.units ?? Object.values(wb?.unit_index ?? {});

  return features.map(feat => {
    const matchingUnits = units.filter(u =>
      u.scope_refs?.includes(feat.feature_id) || u.scope_refs?.includes(spec?.meta?.spec_id ?? "")
    );

    return {
      feature_id: feat.feature_id,
      name: feat.name,
      description: feat.description,
      priority: feat.priority_tier ?? "should",
      deliverables: matchingUnits.flatMap(u => u.deliverables ?? []),
      scope_refs: matchingUnits.map(u => u.unit_id),
    };
  });
}

function deriveInterfaces(spec: CanonicalSpec | null, kitRoot: string): InterfaceContracts {
  const routes: InterfaceContracts["routes"] = [];
  const endpoints: InterfaceContracts["endpoints"] = [];
  const events: InterfaceContracts["events"] = [];

  const features = spec?.entities?.features ?? [];
  for (const feat of features) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    routes.push({ path: `/${slug}`, method: "GET", handler: `${slug}Page`, source_ref: feat.feature_id });

    endpoints.push({ endpoint_id: `EP-${feat.feature_id}-LIST`, path: `/api/${slug}`, method: "GET", source_ref: feat.feature_id });
    endpoints.push({ endpoint_id: `EP-${feat.feature_id}-CREATE`, path: `/api/${slug}`, method: "POST", source_ref: feat.feature_id });
    endpoints.push({ endpoint_id: `EP-${feat.feature_id}-GET`, path: `/api/${slug}/:id`, method: "GET", source_ref: feat.feature_id });
    endpoints.push({ endpoint_id: `EP-${feat.feature_id}-UPDATE`, path: `/api/${slug}/:id`, method: "PUT", source_ref: feat.feature_id });
    endpoints.push({ endpoint_id: `EP-${feat.feature_id}-DELETE`, path: `/api/${slug}/:id`, method: "DELETE", source_ref: feat.feature_id });
  }

  const apiFiles = scanDirFiles(path.join(kitRoot, "10_app", "04_api_contracts"));
  for (const apiFile of apiFiles) {
    const content = readFileContent(path.join(kitRoot, "10_app", "04_api_contracts", apiFile));
    if (content) {
      const extracted = extractEndpointsFromMd(content, apiFile);
      for (const ep of extracted) {
        if (!endpoints.some(e => e.endpoint_id === ep.endpoint_id)) {
          endpoints.push(ep);
        }
      }
    }
  }

  const workflows = spec?.entities?.workflows ?? [];
  for (const wf of workflows) {
    events.push({
      event_id: `EVT-${wf.workflow_id}`,
      name: `${wf.name} completed`,
      payload: JSON.stringify({ workflow_id: wf.workflow_id, status: "completed" }),
      source_ref: wf.workflow_id,
    });
  }

  return { routes, endpoints, events };
}

function deriveDataSchemas(kitRoot: string): DataSchemas {
  const schemas: DataSchemas["schemas"] = [];
  const storageTypes: string[] = ["postgresql"];
  const migrations: string[] = [];

  const dataFiles = scanDirFiles(path.join(kitRoot, "10_app", "03_data_models"));
  for (const dataFile of dataFiles) {
    const content = readFileContent(path.join(kitRoot, "10_app", "03_data_models", dataFile));
    if (content) {
      const fileId = dataFile.replace(/\.md$/, "");
      schemas.push({
        schema_id: `SCH-${fileId}`,
        name: fileId,
        fields: extractFieldsFromMd(content),
        source_ref: `10_app/03_data_models/${dataFile}`,
      });
    }
  }

  if (schemas.length > 0) {
    migrations.push("initial_schema");
  }

  return { schemas, storage_types: storageTypes, migrations };
}

function deriveSecurityModel(spec: CanonicalSpec | null, kitRoot: string): SecurityModel {
  const roles = spec?.entities?.roles ?? [];
  const permissions = spec?.entities?.permissions ?? [];

  const rbacRules: SecurityModel["rbac_rules"] = [];
  for (const perm of permissions) {
    const role = roles.find(r => r.role_id === perm.role_ref);
    rbacRules.push({
      role: role?.name ?? perm.role_ref,
      permissions: perm.allowed_capabilities,
    });
  }

  const securityFiles = scanDirFiles(path.join(kitRoot, "10_app", "05_auth_security"));
  const sourceRefs = securityFiles.map(f => `10_app/05_auth_security/${f}`);

  const securityRequirements: string[] = [];
  for (const sf of securityFiles) {
    const content = readFileContent(path.join(kitRoot, "10_app", "05_auth_security", sf));
    if (content) {
      const reqs = extractRequirementsFromMd(content);
      securityRequirements.push(...reqs);
    }
  }

  return {
    auth_model: roles.length > 0 ? "rbac" : "session",
    auth_flows: roles.length > 0 ? ["login", "register", "logout", "password_reset"] : ["login", "logout"],
    rbac_rules: rbacRules,
    security_requirements: securityRequirements.length > 0 ? securityRequirements : ["authentication_required", "input_validation", "xss_prevention"],
    source_refs: sourceRefs,
  };
}

function deriveVerificationExpectations(acceptanceMap: AcceptanceMap | null): VerificationExpectations {
  const acceptance = acceptanceMap?.acceptance ?? [];

  const acceptanceCriteria: VerificationExpectations["acceptance_criteria"] = acceptance.map(a => ({
    criteria_id: a.acceptance_id,
    description: a.statement,
    feature_ref: a.unit_ref ?? a.unit_id ?? "",
  }));

  const testCategories: string[] = ["unit", "integration", "e2e"];
  const coverageTargets: Record<string, number> = {
    unit: 80,
    integration: 60,
    e2e: 40,
  };

  return { acceptance_criteria: acceptanceCriteria, test_categories: testCategories, coverage_targets: coverageTargets };
}

function deriveRepoInventory(inputs: DerivedBuildInputs, spec: CanonicalSpec | null): RepoInventory {
  const expectedDirectories: string[] = [];
  const expectedModules: RepoInventory["expected_modules"] = [];
  const expectedFiles: RepoInventory["expected_files"] = [];

  const preset = spec?.routing?.type_preset ?? "web_app";
  const isFullStack = preset === "web_app" || preset === "fullstack";

  expectedDirectories.push("src", "src/types", "src/lib", "src/lib/utils", "src/lib/validators", "src/lib/api", "tests", "tests/unit", "tests/integration");

  if (isFullStack) {
    expectedDirectories.push(
      "src/components", "src/components/ui", "src/components/layout", "src/components/features",
      "src/pages", "src/hooks", "src/styles", "src/lib/auth", "src/lib/store",
      "src/server", "src/server/routes", "src/server/middleware", "src/server/models",
      "public",
    );
  } else {
    expectedDirectories.push("src/routes", "src/middleware", "src/models");
  }

  expectedModules.push({ module_id: "MOD-CORE", path: "src", layer: "shared", purpose: "Application core" });
  expectedModules.push({ module_id: "MOD-TYPES", path: "src/types", layer: "shared", purpose: "Shared type definitions" });

  expectedFiles.push({ path: "package.json", role: "config", layer: "config", source_ref: "scaffold" });
  expectedFiles.push({ path: "tsconfig.json", role: "config", layer: "config", source_ref: "scaffold" });
  expectedFiles.push({ path: ".env.example", role: "config", layer: "config", source_ref: "scaffold" });
  expectedFiles.push({ path: ".gitignore", role: "config", layer: "config", source_ref: "scaffold" });
  expectedFiles.push({ path: "README.md", role: "documentation", layer: "config", source_ref: "scaffold" });

  if (isFullStack) {
    expectedFiles.push({ path: "vite.config.ts", role: "config", layer: "config", source_ref: "scaffold" });
    expectedFiles.push({ path: "tailwind.config.ts", role: "config", layer: "config", source_ref: "scaffold" });
    expectedFiles.push({ path: "postcss.config.js", role: "config", layer: "config", source_ref: "scaffold" });
    expectedFiles.push({ path: "index.html", role: "config", layer: "config", source_ref: "scaffold" });
    expectedFiles.push({ path: "docker-compose.yml", role: "infrastructure", layer: "config", source_ref: "scaffold" });
    expectedFiles.push({ path: ".github/workflows/ci.yml", role: "ci_config", layer: "config", source_ref: "scaffold" });
  }

  expectedFiles.push({ path: "src/types/index.ts", role: "shared_types", layer: "shared", source_ref: "types" });
  expectedFiles.push({ path: "src/types/entities.ts", role: "entity_types", layer: "shared", source_ref: "canonical_spec" });
  expectedFiles.push({ path: "src/types/api.ts", role: "api_types", layer: "shared", source_ref: "api_contracts" });

  if (inputs.security.rbac_rules.length > 0) {
    expectedFiles.push({ path: "src/types/auth.ts", role: "auth_types", layer: "shared", source_ref: "canonical_spec.roles" });
    expectedModules.push({ module_id: "MOD-AUTH", path: "src/lib/auth", layer: "security", purpose: "Authentication and authorization" });
  }

  for (const entity of inputs.domain_model.entities) {
    const slug = entity.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (slug && slug !== "user") {
      expectedFiles.push({ path: `src/types/${slug}.ts`, role: "entity_type", layer: "shared", source_ref: entity.entity_id });
    }
  }

  if (isFullStack) {
    expectedModules.push({ module_id: "MOD-FRONTEND", path: "src/components", layer: "frontend", purpose: "UI components" });
    expectedModules.push({ module_id: "MOD-PAGES", path: "src/pages", layer: "frontend", purpose: "Page components" });
    expectedModules.push({ module_id: "MOD-HOOKS", path: "src/hooks", layer: "frontend", purpose: "React hooks" });
    expectedModules.push({ module_id: "MOD-BACKEND", path: "src/server", layer: "backend", purpose: "Server-side logic" });
    expectedModules.push({ module_id: "MOD-ROUTES", path: "src/server/routes", layer: "backend", purpose: "API route handlers" });
    expectedModules.push({ module_id: "MOD-MIDDLEWARE", path: "src/server/middleware", layer: "backend", purpose: "Express middleware" });
    expectedModules.push({ module_id: "MOD-MODELS", path: "src/server/models", layer: "data", purpose: "Database models" });

    expectedFiles.push({ path: "src/main.tsx", role: "entry_point", layer: "frontend", source_ref: "scaffold" });
    expectedFiles.push({ path: "src/App.tsx", role: "app_entry", layer: "frontend", source_ref: "scaffold" });
    expectedFiles.push({ path: "src/styles/globals.css", role: "styles", layer: "frontend", source_ref: "scaffold" });

    expectedFiles.push({ path: "src/components/layout/AppLayout.tsx", role: "layout_component", layer: "frontend", source_ref: "design_pack" });
    expectedFiles.push({ path: "src/components/layout/Header.tsx", role: "layout_component", layer: "frontend", source_ref: "design_pack" });
    expectedFiles.push({ path: "src/components/layout/Sidebar.tsx", role: "layout_component", layer: "frontend", source_ref: "design_pack" });

    const uiComponents = ["Button", "Card", "Input", "Modal", "Table", "LoadingSpinner", "ErrorBoundary", "EmptyState", "Pagination"];
    for (const comp of uiComponents) {
      expectedFiles.push({ path: `src/components/ui/${comp}.tsx`, role: "ui_component", layer: "frontend", source_ref: "design_pack" });
    }

    expectedFiles.push({ path: "src/pages/Home.tsx", role: "page", layer: "frontend", source_ref: "scaffold" });
    expectedFiles.push({ path: "src/pages/NotFound.tsx", role: "error_page", layer: "frontend", source_ref: "scaffold" });
    expectedFiles.push({ path: "src/pages/Dashboard.tsx", role: "feature_page", layer: "frontend", source_ref: "scaffold" });

    if (inputs.security.auth_flows.includes("login")) {
      expectedFiles.push({ path: "src/pages/Login.tsx", role: "auth_page", layer: "frontend", source_ref: "security_pack" });
      expectedFiles.push({ path: "src/pages/Register.tsx", role: "auth_page", layer: "frontend", source_ref: "security_pack" });
      expectedFiles.push({ path: "src/pages/ForgotPassword.tsx", role: "auth_page", layer: "frontend", source_ref: "security_pack" });
      expectedFiles.push({ path: "src/lib/auth/AuthContext.tsx", role: "auth_context", layer: "security", source_ref: "security_pack" });
      expectedFiles.push({ path: "src/lib/auth/useAuth.ts", role: "auth_hook", layer: "security", source_ref: "security_pack" });
      expectedFiles.push({ path: "src/lib/auth/ProtectedRoute.tsx", role: "route_guard", layer: "security", source_ref: "security_pack" });
    }

    for (const feat of inputs.feature_map) {
      const slug = feat.name.replace(/\s+/g, "");
      const routeSlug = feat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const lower = (feat.name + " " + feat.description).toLowerCase();

      if (!expectedDirectories.includes(`src/components/features/${slug}`)) {
        expectedDirectories.push(`src/components/features/${slug}`);
      }
      expectedModules.push({ module_id: `MOD-FEAT-${feat.feature_id}`, path: `src/components/features/${slug}`, layer: "frontend", purpose: feat.description });

      expectedFiles.push({ path: `src/components/features/${slug}/index.tsx`, role: "feature_component", layer: "frontend", source_ref: feat.feature_id });

      if (hasKeyword(lower, ["create", "add", "edit", "submit", "form", "manage", "register", "setting", "config", "profile"])) {
        expectedFiles.push({ path: `src/components/features/${slug}/${slug}Form.tsx`, role: "feature_form", layer: "frontend", source_ref: feat.feature_id });
      }
      if (hasKeyword(lower, ["list", "browse", "search", "view all", "catalog", "manage", "history", "feed"])) {
        expectedFiles.push({ path: `src/components/features/${slug}/${slug}List.tsx`, role: "feature_list", layer: "frontend", source_ref: feat.feature_id });
      }
      if (hasKeyword(lower, ["detail", "view", "item", "record", "content", "profile", "page"])) {
        expectedFiles.push({ path: `src/components/features/${slug}/${slug}Detail.tsx`, role: "feature_detail", layer: "frontend", source_ref: feat.feature_id });
      }

      const isAuth = hasKeyword(lower, ["auth", "login", "register", "sign in", "sign up"]);
      if (!isAuth) {
        const pageSlug = feat.name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "");
        if (!expectedFiles.some(f => f.path === `src/pages/${pageSlug}.tsx`)) {
          expectedFiles.push({ path: `src/pages/${pageSlug}.tsx`, role: "feature_page", layer: "frontend", source_ref: feat.feature_id });
        }
      }

      expectedFiles.push({ path: `src/hooks/use-${routeSlug}.ts`, role: "hook", layer: "frontend", source_ref: feat.feature_id });
      expectedFiles.push({ path: `src/lib/validators/${routeSlug}.ts`, role: "feature_validation", layer: "shared", source_ref: feat.feature_id });

      expectedFiles.push({ path: `src/server/routes/${routeSlug}.ts`, role: "api_route", layer: "backend", source_ref: feat.feature_id });
      expectedFiles.push({ path: `src/server/models/${routeSlug}.ts`, role: "entity_model", layer: "data", source_ref: feat.feature_id });
    }

    expectedFiles.push({ path: "src/server/routes/index.ts", role: "route_index", layer: "backend", source_ref: "scaffold" });
    expectedFiles.push({ path: "src/server/models/schema.ts", role: "db_schema", layer: "data", source_ref: "data_pack" });
    expectedFiles.push({ path: "src/server/models/index.ts", role: "model_index", layer: "data", source_ref: "scaffold" });
    expectedFiles.push({ path: "src/server/middleware/auth.ts", role: "middleware", layer: "backend", source_ref: "security_pack" });
    expectedFiles.push({ path: "src/server/middleware/error-handler.ts", role: "middleware", layer: "backend", source_ref: "scaffold" });
    expectedFiles.push({ path: "src/server/middleware/validation.ts", role: "middleware", layer: "backend", source_ref: "scaffold" });

    expectedFiles.push({ path: "src/lib/api/client.ts", role: "api_client", layer: "shared", source_ref: "api_pack" });
    expectedFiles.push({ path: "src/lib/api/endpoints.ts", role: "api_endpoints", layer: "shared", source_ref: "api_pack" });
    expectedFiles.push({ path: "src/lib/api/interceptors.ts", role: "api_interceptor", layer: "shared", source_ref: "api_pack" });
    expectedFiles.push({ path: "src/lib/utils/index.ts", role: "utilities", layer: "shared", source_ref: "scaffold" });
    expectedFiles.push({ path: "src/lib/validators/index.ts", role: "validation", layer: "shared", source_ref: "scaffold" });
    expectedFiles.push({ path: "src/lib/store/index.ts", role: "state_store", layer: "shared", source_ref: "scaffold" });

    const workflows = spec?.entities?.workflows ?? [];
    for (const wf of workflows) {
      if (wf.steps && wf.steps.length > 2) {
        const wfSlug = wf.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        expectedFiles.push({ path: `src/server/middleware/${wfSlug}.ts`, role: "workflow_middleware", layer: "backend", source_ref: wf.workflow_id });
      }
    }

    for (const entity of inputs.domain_model.entities) {
      const slug = entity.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (slug && !expectedFiles.some(f => f.path === `src/server/models/${slug}.ts`)) {
        expectedFiles.push({ path: `src/server/models/${slug}.ts`, role: "entity_model", layer: "data", source_ref: entity.entity_id });
      }
    }

    for (const schema of inputs.data.schemas) {
      const slug = schema.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      if (!expectedFiles.some(f => f.path === `src/server/models/${slug}.ts`)) {
        expectedFiles.push({ path: `src/server/models/${slug}.ts`, role: "entity_model", layer: "data", source_ref: schema.schema_id });
      }
    }
  }

  expectedFiles.push({ path: "tests/setup.ts", role: "test_setup", layer: "test", source_ref: "scaffold" });
  expectedFiles.push({ path: "tests/helpers.ts", role: "test_setup", layer: "test", source_ref: "scaffold" });

  for (const feat of inputs.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    expectedFiles.push({ path: `tests/unit/${slug}.test.ts`, role: "test", layer: "test", source_ref: feat.feature_id });
    expectedFiles.push({ path: `tests/integration/${slug}.integration.test.ts`, role: "test", layer: "test", source_ref: feat.feature_id });
  }

  const deduped = dedupeByPath(expectedFiles);

  return {
    expected_directories: [...new Set(expectedDirectories)],
    expected_modules: expectedModules,
    expected_files: deduped,
    expected_file_count: deduped.length,
  };
}

function deriveRequirementTraceMap(inputs: DerivedBuildInputs, inventory: RepoInventory): RequirementTraceEntry[] {
  const entries: RequirementTraceEntry[] = [];

  for (const feat of inputs.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const relatedFiles = inventory.expected_files
      .filter(f => f.source_ref === feat.feature_id)
      .map(f => f.path);

    const relatedModules = inventory.expected_modules
      .filter(m => m.module_id.includes(feat.feature_id))
      .map(m => m.module_id);

    const relatedVerification = inputs.verification.acceptance_criteria
      .filter(a => a.feature_ref.includes(feat.feature_id) || feat.scope_refs.some(sr => a.feature_ref.includes(sr)))
      .map(a => a.criteria_id);

    entries.push({
      requirement_id: feat.feature_id,
      description: feat.description,
      module_refs: relatedModules.length > 0 ? relatedModules : [`MOD-FEAT-${feat.feature_id}`],
      file_refs: relatedFiles,
      verification_refs: relatedVerification,
    });
  }

  for (const acc of inputs.verification.acceptance_criteria) {
    if (!entries.some(e => e.requirement_id === acc.criteria_id)) {
      entries.push({
        requirement_id: acc.criteria_id,
        description: acc.description,
        module_refs: [acc.feature_ref],
        file_refs: [],
        verification_refs: [acc.criteria_id],
      });
    }
  }

  return entries;
}

function deriveBuildImplications(inputs: DerivedBuildInputs, inventory: RepoInventory): DerivedBuildImplications {
  const frontendFiles = inventory.expected_files.filter(f => f.layer === "frontend");
  const backendFiles = inventory.expected_files.filter(f => f.layer === "backend");
  const dataFiles = inventory.expected_files.filter(f => f.layer === "data");

  return {
    derived_subsystem_count: inputs.subsystems.length,
    derived_module_count: inventory.expected_modules.length,
    derived_screen_count: inventory.expected_files.filter(f => f.role === "feature_page" || f.role === "auth_page" || f.role === "page").length,
    derived_endpoint_count: inputs.interfaces.endpoints.length,
    derived_entity_count: inputs.domain_model.entities.length,
    derived_file_group_count: new Set(inventory.expected_files.map(f => f.layer)).size,
    derived_expected_total_file_count: inventory.expected_file_count,
    derived_repo_type: inputs.app_identity.app_type,
    derived_repo_shape: inputs.subsystems.length > 3 ? "fullstack_modular" : "simple_app",
  };
}

function deriveProjectionArtifacts(inputs: DerivedBuildInputs, inventory: RepoInventory): ProjectionArtifactSummary[] {
  const artifacts: ProjectionArtifactSummary[] = [];

  artifacts.push({
    artifact_name: "app_identity",
    produced: !!inputs.app_identity.app_name,
    artifact_ref: "derived_inputs.app_identity",
    completeness_status: inputs.app_identity.project_overview ? "complete" : "partial",
  });

  artifacts.push({
    artifact_name: "domain_model",
    produced: inputs.domain_model.entities.length > 0,
    artifact_ref: "derived_inputs.domain_model",
    completeness_status: inputs.domain_model.entities.length > 0 ? "complete" : "missing",
  });

  artifacts.push({
    artifact_name: "feature_map",
    produced: inputs.feature_map.length > 0,
    artifact_ref: "derived_inputs.feature_map",
    completeness_status: inputs.feature_map.length > 0 ? "complete" : "missing",
  });

  artifacts.push({
    artifact_name: "interface_contracts",
    produced: inputs.interfaces.endpoints.length > 0,
    artifact_ref: "derived_inputs.interfaces",
    completeness_status: inputs.interfaces.endpoints.length > 0 ? "complete" : "missing",
  });

  artifacts.push({
    artifact_name: "data_schemas",
    produced: inputs.data.schemas.length > 0,
    artifact_ref: "derived_inputs.data",
    completeness_status: inputs.data.schemas.length > 0 ? "complete" : "partial",
  });

  artifacts.push({
    artifact_name: "security_model",
    produced: true,
    artifact_ref: "derived_inputs.security",
    completeness_status: inputs.security.rbac_rules.length > 0 ? "complete" : "partial",
  });

  artifacts.push({
    artifact_name: "repo_inventory",
    produced: inventory.expected_files.length > 0,
    artifact_ref: "repo_inventory",
    completeness_status: inventory.expected_files.length > 0 ? "complete" : "missing",
  });

  return artifacts;
}

function scanDirFiles(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath).filter((f: string) => f.endsWith(".md") || f.endsWith(".json"));
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

function readFileContent(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function extractEntitiesFromMd(content: string, sourceFile: string): DomainEntity[] {
  const entities: DomainEntity[] = [];
  const headingMatch = content.match(/^#+\s+(.+)/gm);
  if (headingMatch) {
    for (const heading of headingMatch) {
      const name = heading.replace(/^#+\s+/, "").trim();
      if (name.length > 2 && name.length < 60 && !name.toLowerCase().includes("overview") && !name.toLowerCase().includes("introduction")) {
        const slug = name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
        entities.push({
          entity_id: `ENT-${slug}`,
          name,
          fields: ["id", "created_at", "updated_at"],
          relationships: [],
          source_ref: sourceFile,
        });
      }
    }
  }
  return entities;
}

function extractFieldsFromMd(content: string): string[] {
  const fields: string[] = [];
  const fieldPattern = /[-*]\s+\*?\*?(\w[\w\s]*\w)\*?\*?\s*[:\-–]/gm;
  let match;
  while ((match = fieldPattern.exec(content)) !== null) {
    const field = match[1].trim().toLowerCase().replace(/\s+/g, "_");
    if (field.length > 1 && field.length < 40 && !fields.includes(field)) {
      fields.push(field);
    }
  }
  if (fields.length === 0) {
    fields.push("id", "created_at", "updated_at");
  }
  return fields;
}

function extractEndpointsFromMd(content: string, sourceFile: string): InterfaceContracts["endpoints"] {
  const endpoints: InterfaceContracts["endpoints"] = [];
  const methodPattern = /\b(GET|POST|PUT|PATCH|DELETE)\s+([/\w:{}.-]+)/gi;
  let match;
  let idx = 0;
  while ((match = methodPattern.exec(content)) !== null) {
    idx++;
    endpoints.push({
      endpoint_id: `EP-${sourceFile.replace(/\.md$/, "")}-${idx}`,
      path: match[2],
      method: match[1].toUpperCase(),
      source_ref: sourceFile,
    });
  }
  return endpoints;
}

function extractRequirementsFromMd(content: string): string[] {
  const reqs: string[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.replace(/^[-*]\s+/, "").trim();
      if (text.length > 10 && text.length < 200) {
        reqs.push(text);
      }
    }
  }
  return reqs.slice(0, 20);
}

function hasKeyword(text: string, keywords: string[]): boolean {
  return keywords.some(kw => text.includes(kw));
}

function dedupeByPath<T extends { path: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.path)) return false;
    seen.add(item.path);
    return true;
  });
}
