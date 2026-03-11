import * as fs from "fs";
import * as path from "path";
import type {
  RepoBlueprint,
  BuildPlan,
  BlueprintFileEntry,
  BuildUnit,
  BuildUnitType,
  ComplexityProfile,
  ComplexityClass,
  GenerationStrategy,
  GenerationMode,
  ModelTier,
  WavePlan,
  WaveEntry,
  CostForecast,
  GenerationStrategyPlan,
  ContextCapsule,
} from "./types.js";

const ROLE_BASE_WEIGHTS: Record<string, number> = {
  barrel_export: 3,
  package_manifest: 5,
  ts_config: 5,
  build_config: 5,
  css_config: 5,
  html_entry: 5,
  env_template: 3,
  git_config: 3,
  lint_config: 5,
  format_config: 3,
  config_env: 5,

  db_schema_entity: 15,
  db_schema: 15,
  request_dto: 12,
  response_dto: 12,
  shared_contract: 14,
  test_fixture: 12,
  db_seed_entity: 15,
  db_seed: 15,
  form_schema: 18,
  loading_skeleton: 10,
  migration_file: 16,
  entity_type: 10,
  shared_types: 10,
  api_types: 10,
  auth_types: 10,
  enum_types: 8,

  model: 30,
  entity_model: 30,
  repository: 35,
  entity_repository: 35,
  service_module: 40,
  entity_validator: 35,
  entity_mapper: 30,
  validator: 30,
  schema_validator: 30,
  test_utility: 15,
  utility: 20,
  model_test: 30,

  route_handler: 50,
  api_route: 50,
  controller: 45,
  auth_policy: 55,
  audit_hook: 45,
  middleware: 40,
  error_handler: 35,
  logger: 25,
  rbac_config: 30,

  feature_page: 55,
  feature_component: 40,
  feature_form: 50,
  feature_list: 40,
  feature_detail: 40,
  feature_card: 35,
  feature_hook: 35,
  feature_store: 35,
  feature_validation: 35,
  context_provider: 35,
  layout_component: 40,
  settings_page: 45,
  error_page: 25,
  ui_component: 35,
  page: 30,
  styles: 5,
  theme: 5,

  app_entry: 30,
  entry_point: 35,
  db_connection: 25,
  api_client: 20,
  api_endpoints: 25,
  api_interceptor: 30,
  api_binding: 35,
  state_store: 30,

  unit_test: 30,
  integration_test: 45,
  e2e_test: 55,
  contract_test: 45,
  test_mock: 25,
  test_setup: 15,

  ci_config: 10,
  deploy_config: 12,
  docker_config: 10,
  readme: 8,
  documentation: 10,
  api_docs: 12,

  route_index: 8,
  model_index: 8,
  page: 30,
  styles: 8,
  theme: 10,
};

export function deriveBuildUnits(blueprint: RepoBlueprint): BuildUnit[] {
  const units: BuildUnit[] = [];
  const assignedFileIds = new Set<string>();
  let unitIdx = 0;
  const nextUnitId = (prefix: string) => `${prefix}-${(++unitIdx).toString().padStart(3, "0")}`;

  const entitySourceMap = new Map<string, BlueprintFileEntry[]>();
  const featureSourceMap = new Map<string, BlueprintFileEntry[]>();

  for (const file of blueprint.file_inventory) {
    for (const ref of file.source_refs) {
      const refLower = ref.toLowerCase();
      if (refLower.includes("entity") || refLower.includes("data") || refLower.includes("schema")) {
        if (!entitySourceMap.has(ref)) entitySourceMap.set(ref, []);
        entitySourceMap.get(ref)!.push(file);
      }
    }
  }

  const entityRoles = new Set([
    "model", "entity_model", "entity_type", "repository", "entity_repository",
    "service_module", "db_schema_entity", "entity_validator", "entity_mapper",
    "shared_contract", "test_fixture", "db_seed_entity", "migration_file",
    "db_schema", "db_seed", "model_test",
  ]);

  const backendEndpointRoles = new Set([
    "route_handler", "controller", "api_route", "request_dto", "response_dto",
    "auth_policy", "contract_test", "test_mock", "audit_hook",
    "schema_validator",
  ]);

  const frontendScreenRoles = new Set([
    "feature_page", "feature_component", "feature_form", "feature_list",
    "feature_detail", "feature_card", "feature_hook", "context_provider",
    "form_schema", "api_binding", "loading_skeleton", "settings_page",
    "ui_component", "feature_store",
  ]);

  const infraRoles = new Set([
    "package_manifest", "ts_config", "build_config", "css_config", "html_entry",
    "env_template", "git_config", "lint_config", "format_config", "config_env",
    "entry_point", "app_entry", "db_connection", "middleware", "error_handler",
    "logger", "rbac_config", "api_client", "api_endpoints", "api_interceptor",
    "state_store", "utility", "ci_config", "deploy_config", "docker_config",
    "layout_component", "error_page", "page", "styles", "theme",
  ]);

  for (const entity of blueprint.domain_model.entities) {
    const entityFiles = blueprint.file_inventory.filter(f => {
      if (assignedFileIds.has(f.file_id)) return false;
      if (!entityRoles.has(f.role)) return false;
      const slug = entity.name.toLowerCase().replace(/\s+/g, "_");
      const pathLower = f.path.toLowerCase();
      return pathLower.includes(slug) || f.source_refs.includes(entity.source_ref);
    });

    if (entityFiles.length > 0) {
      const unitId = nextUnitId("entity");
      for (const f of entityFiles) assignedFileIds.add(f.file_id);
      units.push({
        id: unitId,
        unit_type: "entity_unit",
        name: entity.name,
        file_ids: entityFiles.map(f => f.file_id),
        dependency_unit_ids: [],
        source_refs: [entity.source_ref],
      });
    }
  }

  for (const feat of blueprint.feature_map) {
    const slug = feat.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

    const endpointFiles = blueprint.file_inventory.filter(f => {
      if (assignedFileIds.has(f.file_id)) return false;
      if (!backendEndpointRoles.has(f.role)) return false;
      const pathLower = f.path.toLowerCase();
      return pathLower.includes(slug) ||
        f.source_refs.some(r => feat.scope_refs.includes(r));
    });

    if (endpointFiles.length > 0) {
      const unitId = nextUnitId("endpoint");
      for (const f of endpointFiles) assignedFileIds.add(f.file_id);
      units.push({
        id: unitId,
        unit_type: "endpoint_unit",
        name: `${feat.name} API`,
        file_ids: endpointFiles.map(f => f.file_id),
        dependency_unit_ids: [],
        source_refs: feat.scope_refs,
      });
    }

    const screenFiles = blueprint.file_inventory.filter(f => {
      if (assignedFileIds.has(f.file_id)) return false;
      if (!frontendScreenRoles.has(f.role)) return false;
      const pathLower = f.path.toLowerCase();
      return pathLower.includes(slug) ||
        f.source_refs.some(r => feat.scope_refs.includes(r));
    });

    if (screenFiles.length > 0) {
      const unitId = nextUnitId("screen");
      for (const f of screenFiles) assignedFileIds.add(f.file_id);
      units.push({
        id: unitId,
        unit_type: "screen_unit",
        name: `${feat.name} UI`,
        file_ids: screenFiles.map(f => f.file_id),
        dependency_unit_ids: [],
        source_refs: feat.scope_refs,
      });
    }
  }

  const sharedFiles = blueprint.file_inventory.filter(f => {
    if (assignedFileIds.has(f.file_id)) return false;
    return f.layer === "shared" || f.role === "barrel_export" || f.role === "shared_types" ||
      f.role === "entity_type" || f.role === "api_types" || f.role === "auth_types" ||
      f.role === "enum_types" || f.role === "route_index" || f.role === "model_index";
  });
  if (sharedFiles.length > 0) {
    const unitId = nextUnitId("shared");
    for (const f of sharedFiles) assignedFileIds.add(f.file_id);
    units.push({
      id: unitId,
      unit_type: "shared_unit",
      name: "Shared Types & Contracts",
      file_ids: sharedFiles.map(f => f.file_id),
      dependency_unit_ids: [],
      source_refs: [],
    });
  }

  const infraFiles = blueprint.file_inventory.filter(f => {
    if (assignedFileIds.has(f.file_id)) return false;
    return infraRoles.has(f.role) || f.layer === "config" || f.layer === "docs";
  });
  if (infraFiles.length > 0) {
    const unitId = nextUnitId("infra");
    for (const f of infraFiles) assignedFileIds.add(f.file_id);
    units.push({
      id: unitId,
      unit_type: "infra_unit",
      name: "Infrastructure & Config",
      file_ids: infraFiles.map(f => f.file_id),
      dependency_unit_ids: [],
      source_refs: [],
    });
  }

  const remainingFiles = blueprint.file_inventory.filter(f => !assignedFileIds.has(f.file_id));
  if (remainingFiles.length > 0) {
    const verificationFiles = remainingFiles.filter(f => f.layer === "test" || f.role.includes("test"));
    const otherFiles = remainingFiles.filter(f => f.layer !== "test" && !f.role.includes("test"));

    if (verificationFiles.length > 0) {
      const unitId = nextUnitId("verify");
      for (const f of verificationFiles) assignedFileIds.add(f.file_id);
      units.push({
        id: unitId,
        unit_type: "verification_unit",
        name: "Verification & Tests",
        file_ids: verificationFiles.map(f => f.file_id),
        dependency_unit_ids: [],
        source_refs: [],
      });
    }

    if (otherFiles.length > 0) {
      const unitId = nextUnitId("infra");
      for (const f of otherFiles) assignedFileIds.add(f.file_id);
      units.push({
        id: unitId,
        unit_type: "infra_unit",
        name: "Additional Infrastructure",
        file_ids: otherFiles.map(f => f.file_id),
        dependency_unit_ids: [],
        source_refs: [],
      });
    }
  }

  return units;
}

export function scoreComplexity(
  units: BuildUnit[],
  blueprint: RepoBlueprint
): ComplexityProfile[] {
  const fileMap = new Map<string, BlueprintFileEntry>();
  for (const f of blueprint.file_inventory) fileMap.set(f.file_id, f);

  const securitySensitiveRoles = new Set([
    "auth_policy", "rbac_config", "middleware", "auth_types",
  ]);
  const hasSecurityModel = blueprint.security_model.auth_model !== "" &&
    blueprint.security_model.auth_model !== "none";

  return units.map(unit => {
    const files = unit.file_ids.map(id => fileMap.get(id)).filter(Boolean) as BlueprintFileEntry[];

    const roleWeights = files.map(f => ROLE_BASE_WEIGHTS[f.role] ?? 25);
    const baseRoleWeight = roleWeights.length > 0 ? Math.max(...roleWeights) : 25;

    const dependencyCount = Math.min(unit.dependency_unit_ids.length * 5, 15);

    const securitySensitivity = files.some(f => securitySensitiveRoles.has(f.role))
      ? (hasSecurityModel ? 15 : 5) : 0;

    const stateComplexity = files.some(f =>
      f.role === "context_provider" || f.role === "state_store" || f.role === "feature_hook"
    ) ? 10 : 0;

    const businessRuleDensity = files.some(f =>
      f.role === "service_module" || f.role === "entity_validator" || f.role === "route_handler"
    ) ? 8 : 0;

    const integrationDepth = files.some(f =>
      f.role === "api_binding" || f.role === "api_client" || f.role === "db_connection"
    ) ? 6 : 0;

    const acceptanceLinkage = unit.source_refs.length > 0 ? Math.min(unit.source_refs.length * 2, 10) : 0;

    const crossCuttingConcern = files.some(f =>
      f.role === "middleware" || f.role === "error_handler" || f.role === "audit_hook"
    ) ? 8 : 0;

    const rawScore = Math.min(
      baseRoleWeight + dependencyCount + securitySensitivity + stateComplexity +
      businessRuleDensity + integrationDepth + acceptanceLinkage + crossCuttingConcern,
      100
    );

    let complexityClass: ComplexityClass;
    if (rawScore <= 10) complexityClass = "C0";
    else if (rawScore <= 25) complexityClass = "C1";
    else if (rawScore <= 45) complexityClass = "C2";
    else if (rawScore <= 70) complexityClass = "C3";
    else complexityClass = "C4";

    return {
      build_unit_id: unit.id,
      complexity_class: complexityClass,
      score: rawScore,
      scoring_factors: {
        base_role_weight: baseRoleWeight,
        dependency_count: dependencyCount,
        security_sensitivity: securitySensitivity,
        state_complexity: stateComplexity,
        business_rule_density: businessRuleDensity,
        integration_depth: integrationDepth,
        acceptance_linkage: acceptanceLinkage,
        cross_cutting_concern: crossCuttingConcern,
      },
      rationale: `${unit.name}: score ${rawScore} → ${complexityClass} (base=${baseRoleWeight})`,
    };
  });
}

export function routeGenerationStrategy(
  units: BuildUnit[],
  profiles: ComplexityProfile[],
  blueprint: RepoBlueprint
): { strategies: GenerationStrategy[]; costForecast: CostForecast } {
  const profileMap = new Map<string, ComplexityProfile>();
  for (const p of profiles) profileMap.set(p.build_unit_id, p);

  const fileMap = new Map<string, BlueprintFileEntry>();
  for (const f of blueprint.file_inventory) fileMap.set(f.file_id, f);

  const hasSecurityModel = blueprint.security_model.auth_model !== "" &&
    blueprint.security_model.auth_model !== "none";

  const strategies: GenerationStrategy[] = [];
  const modeCounts: Record<GenerationMode, number> = {
    deterministic: 0, template: 0, cheap_model: 0, full_model: 0,
  };
  const modeTokens: Record<GenerationMode, number> = {
    deterministic: 0, template: 0, cheap_model: 0, full_model: 0,
  };

  for (const unit of units) {
    const profile = profileMap.get(unit.id);
    const cc = profile?.complexity_class ?? "C2";
    const files = unit.file_ids.map(id => fileMap.get(id)).filter(Boolean) as BlueprintFileEntry[];
    const fileCount = files.length;

    let mode: GenerationMode;
    let tier: ModelTier;
    let rationale: string;

    const allDeterministic = files.every(f => f.generation_method === "deterministic");

    if (cc === "C0" || allDeterministic) {
      mode = "deterministic";
      tier = "none";
      rationale = `${cc}: all files deterministic`;
    } else if (cc === "C1") {
      mode = "deterministic";
      tier = "none";
      rationale = `${cc}: simple structured artifacts, deterministic generation`;
    } else if (cc === "C2") {
      mode = "cheap_model";
      tier = "mini";
      rationale = `${cc}: moderate complexity, gpt-4o-mini sufficient`;
    } else if (cc === "C3") {
      const needsFull = files.some(f =>
        f.role === "auth_policy" || f.role === "audit_hook"
      ) && hasSecurityModel;
      if (needsFull) {
        mode = "full_model";
        tier = "full";
        rationale = `${cc}: security-sensitive, requires gpt-4o`;
      } else {
        mode = "cheap_model";
        tier = "mini";
        rationale = `${cc}: complex but non-security, gpt-4o-mini with retry`;
      }
    } else {
      mode = "full_model";
      tier = "full";
      rationale = `${cc}: high complexity, requires gpt-4o`;
    }

    modeCounts[mode] += fileCount;

    const modeStr: string = mode;
    const avgTokensPerFile = (modeStr === "deterministic" || modeStr === "template") ? 0
      : modeStr === "cheap_model" ? 600
      : 800;
    modeTokens[mode] += fileCount * avgTokensPerFile;

    strategies.push({ build_unit_id: unit.id, generation_mode: mode, model_tier: tier, rationale });
  }

  const totalTokens = Object.values(modeTokens).reduce((a, b) => a + b, 0);
  const miniCost = modeTokens.cheap_model * 0.00000015;
  const fullCost = modeTokens.full_model * 0.0000025;
  const totalCost = miniCost + fullCost;

  const expensiveUnits = strategies
    .filter(s => s.generation_mode === "full_model")
    .map(s => s.build_unit_id);

  const costForecast: CostForecast = {
    total_estimated_tokens: totalTokens,
    estimated_cost_usd: Math.round(totalCost * 100) / 100,
    by_mode: {
      deterministic: { file_count: modeCounts.deterministic, estimated_tokens: 0, estimated_cost_usd: 0 },
      template: { file_count: modeCounts.template, estimated_tokens: 0, estimated_cost_usd: 0 },
      cheap_model: { file_count: modeCounts.cheap_model, estimated_tokens: modeTokens.cheap_model, estimated_cost_usd: Math.round(miniCost * 100) / 100 },
      full_model: { file_count: modeCounts.full_model, estimated_tokens: modeTokens.full_model, estimated_cost_usd: Math.round(fullCost * 100) / 100 },
    },
    expensive_units: expensiveUnits,
  };

  return { strategies, costForecast };
}

export function computeWavePlan(units: BuildUnit[]): WavePlan {
  const waveMap: Record<string, string[]> = {
    "wave-1-foundations": [],
    "wave-2-entities": [],
    "wave-3-endpoints": [],
    "wave-4-screens": [],
    "wave-5-verification": [],
  };

  for (const unit of units) {
    switch (unit.unit_type) {
      case "infra_unit":
      case "shared_unit":
        waveMap["wave-1-foundations"].push(unit.id);
        break;
      case "entity_unit":
        waveMap["wave-2-entities"].push(unit.id);
        break;
      case "endpoint_unit":
        waveMap["wave-3-endpoints"].push(unit.id);
        break;
      case "screen_unit":
        waveMap["wave-4-screens"].push(unit.id);
        break;
      case "verification_unit":
        waveMap["wave-5-verification"].push(unit.id);
        break;
    }
  }

  const waves: WaveEntry[] = Object.entries(waveMap)
    .filter(([, ids]) => ids.length > 0)
    .map(([waveId, unitIds], idx) => ({
      wave_id: waveId,
      order: idx + 1,
      unit_ids: unitIds,
      parallelizable: true,
    }));

  return { waves };
}

export function assembleContextCapsule(
  unit: BuildUnit,
  blueprint: RepoBlueprint
): ContextCapsule {
  let estimatedTokens = 50;
  const capsule: ContextCapsule = { unit_id: unit.id, estimated_tokens: 0 };

  if (unit.unit_type === "entity_unit") {
    const entity = blueprint.domain_model.entities.find(e =>
      e.name === unit.name || unit.source_refs.includes(e.source_ref)
    );
    if (entity) {
      capsule.entity_slice = {
        name: entity.name,
        fields: entity.fields,
        relationships: entity.relationships,
      };
      estimatedTokens += entity.fields.length * 5 + entity.relationships.length * 8 + 20;
    }
    const hasAuth = blueprint.security_model.auth_model !== "" &&
      blueprint.security_model.auth_model !== "none";
    if (hasAuth) {
      capsule.auth_slice = { auth_required: true };
      estimatedTokens += 10;
    }
  }

  if (unit.unit_type === "endpoint_unit") {
    const feat = blueprint.feature_map.find(f =>
      f.name + " API" === unit.name ||
      unit.source_refs.some(r => f.scope_refs.includes(r))
    );
    if (feat) {
      capsule.requirements_summary = `Feature: ${feat.name} — ${feat.description}`;
      estimatedTokens += 30 + (feat.deliverables.length * 8);
    }
    const relatedEndpoints = blueprint.interface_contracts.endpoints.filter(ep =>
      unit.source_refs.includes(ep.source_ref)
    );
    if (relatedEndpoints.length > 0) {
      const ep = relatedEndpoints[0];
      capsule.endpoint_slice = {
        path: ep.path,
        method: ep.method,
        request_schema: ep.request_schema,
        response_schema: ep.response_schema,
      };
      estimatedTokens += 40;
    }
    const hasAuth = blueprint.security_model.auth_model !== "" &&
      blueprint.security_model.auth_model !== "none";
    if (hasAuth) {
      const roles = blueprint.security_model.rbac_rules.map(r => r.role);
      capsule.auth_slice = { auth_required: true, roles };
      estimatedTokens += 15 + roles.length * 3;
    }
  }

  if (unit.unit_type === "screen_unit") {
    const feat = blueprint.feature_map.find(f =>
      f.name + " UI" === unit.name ||
      unit.source_refs.some(r => f.scope_refs.includes(r))
    );
    if (feat) {
      capsule.requirements_summary = `Feature: ${feat.name} — ${feat.description}. Deliverables: ${feat.deliverables.join(", ")}`;
      estimatedTokens += 40 + feat.deliverables.length * 10;
    }
  }

  capsule.estimated_tokens = estimatedTokens;
  return capsule;
}

export async function runGSE(
  blueprint: RepoBlueprint,
  plan: BuildPlan,
  runDir: string
): Promise<GenerationStrategyPlan> {
  console.log("  [GSE] Deriving build units...");
  const buildUnits = deriveBuildUnits(blueprint);
  const totalFiles = buildUnits.reduce((a, u) => a + u.file_ids.length, 0);
  console.log(`  [GSE] ${buildUnits.length} build units covering ${totalFiles}/${blueprint.file_inventory.length} files`);

  const unitTypeCounts: Record<string, number> = {};
  for (const u of buildUnits) {
    unitTypeCounts[u.unit_type] = (unitTypeCounts[u.unit_type] ?? 0) + 1;
  }
  console.log(`  [GSE] Units by type: ${Object.entries(unitTypeCounts).map(([k, v]) => `${k}=${v}`).join(", ")}`);

  console.log("  [GSE] Scoring complexity...");
  const complexityProfiles = scoreComplexity(buildUnits, blueprint);
  const classCounts: Record<string, number> = { C0: 0, C1: 0, C2: 0, C3: 0, C4: 0 };
  for (const p of complexityProfiles) classCounts[p.complexity_class]++;
  console.log(`  [GSE] Complexity distribution: ${Object.entries(classCounts).map(([k, v]) => `${k}=${v}`).join(", ")}`);

  console.log("  [GSE] Routing generation strategies...");
  const { strategies, costForecast } = routeGenerationStrategy(buildUnits, complexityProfiles, blueprint);
  console.log(`  [GSE] Mode distribution: deterministic=${costForecast.by_mode.deterministic.file_count}, cheap_model=${costForecast.by_mode.cheap_model.file_count}, full_model=${costForecast.by_mode.full_model.file_count}`);
  console.log(`  [GSE] Estimated cost: $${costForecast.estimated_cost_usd} (~${costForecast.total_estimated_tokens.toLocaleString()} tokens)`);

  console.log("  [GSE] Computing wave plan...");
  const wavePlan = computeWavePlan(buildUnits);
  console.log(`  [GSE] ${wavePlan.waves.length} waves: ${wavePlan.waves.map(w => `${w.wave_id}(${w.unit_ids.length})`).join(" → ")}`);

  for (const unit of buildUnits) {
    unit.context_capsule = assembleContextCapsule(unit, blueprint);
  }

  const gsePlan: GenerationStrategyPlan = {
    build_units: buildUnits,
    complexity_profiles: complexityProfiles,
    strategies,
    wave_plan: wavePlan,
    cost_forecast: costForecast,
  };

  const gseDir = path.join(runDir, "build", "generation_strategy");
  if (!fs.existsSync(gseDir)) {
    fs.mkdirSync(gseDir, { recursive: true });
  }

  fs.writeFileSync(path.join(gseDir, "build_unit_inventory.json"), JSON.stringify(buildUnits, null, 2));
  fs.writeFileSync(path.join(gseDir, "complexity_profile.json"), JSON.stringify(complexityProfiles, null, 2));
  fs.writeFileSync(path.join(gseDir, "generation_strategy_plan.json"), JSON.stringify(gsePlan, null, 2));
  fs.writeFileSync(path.join(gseDir, "wave_plan.json"), JSON.stringify(wavePlan, null, 2));
  fs.writeFileSync(path.join(gseDir, "cost_report.json"), JSON.stringify(costForecast, null, 2));

  console.log(`  [GSE] Artifacts written to ${gseDir}`);
  return gsePlan;
}
