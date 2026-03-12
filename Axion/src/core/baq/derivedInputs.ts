import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type {
  BAQKitExtraction,
  BAQDerivedBuildInputs,
  BAQSubsystemEntry,
  BAQFeatureEntry,
  BAQDomainModel,
  BAQDomainEntity,
  BAQStorageModel,
  BAQAPISurface,
  BAQAuthModel,
  BAQUISurfaceEntry,
  BAQVerificationObligation,
  BAQOpsObligation,
  BAQAssumption,
  BAQRisk,
} from "./types.js";

function readJsonSafe(filePath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readMdSafe(filePath: string): string | null {
  try {
    if (!existsSync(filePath)) return null;
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export function buildDerivedInputs(
  extraction: BAQKitExtraction,
  runDir: string,
): BAQDerivedBuildInputs {
  const now = new Date().toISOString();
  const derivationId = `BAQD-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`;

  const kitRoot = findKitRoot(runDir);

  const spec = readJsonSafe(join(kitRoot, "01_core_artifacts", "03_canonical_spec.json"));
  const workBreakdown = readJsonSafe(join(kitRoot, "01_core_artifacts", "04_work_breakdown.json"));
  const acceptanceMap = readJsonSafe(join(kitRoot, "01_core_artifacts", "05_acceptance_map.json"));
  const normalizedInput = readJsonSafe(join(kitRoot, "01_core_artifacts", "01_normalized_input_record.json"));

  const subsystemMap = deriveSubsystems(spec, kitRoot);
  const featureMap = deriveFeatures(spec, workBreakdown);
  const domainModel = deriveDomainModel(spec, kitRoot);
  const storageModel = deriveStorageModel(kitRoot);
  const apiSurface = deriveAPISurface(spec, kitRoot);
  const authModel = deriveAuthModel(spec, normalizedInput, kitRoot);
  const uiSurfaceMap = deriveUISurface(spec, workBreakdown);
  const verificationObligations = deriveVerificationObligations(acceptanceMap, spec);
  const opsObligations = deriveOpsObligations(kitRoot);
  const assumptions = deriveAssumptions(spec, normalizedInput);
  const risks = deriveRisks(spec, normalizedInput);

  let completeness = 0;
  const totalChecks = 9;

  if (subsystemMap.length > 0) completeness++;
  if (featureMap.length > 0) completeness++;
  if (domainModel.entities.length > 0) completeness++;
  if (storageModel.schemas.length > 0) completeness++;
  if (apiSurface.endpoints.length > 0) completeness++;
  if (authModel.auth_type !== "unknown") completeness++;
  if (uiSurfaceMap.length > 0) completeness++;
  if (verificationObligations.length > 0) completeness++;
  if (opsObligations.length > 0) completeness++;

  const completenessPercent = Math.round((completeness / totalChecks) * 100);

  const entityCount = domainModel.entities.length;
  const endpointCount = apiSurface.endpoints.length;

  return {
    schema_version: "1.0.0",
    derivation_id: derivationId,
    run_id: extraction.run_id,
    extraction_ref: extraction.extraction_id,
    status: "derivation_complete",
    subsystem_map: subsystemMap,
    feature_map: featureMap,
    domain_model: domainModel,
    storage_model: storageModel,
    api_surface: apiSurface,
    auth_model: authModel,
    ui_surface_map: uiSurfaceMap,
    verification_obligations: verificationObligations,
    ops_obligations: opsObligations,
    assumptions,
    risks,
    summary: {
      subsystem_count: subsystemMap.length,
      feature_count: featureMap.length,
      entity_count: entityCount,
      endpoint_count: endpointCount,
      page_count: uiSurfaceMap.length,
      verification_obligation_count: verificationObligations.length,
      ops_obligation_count: opsObligations.length,
      assumption_count: assumptions.length,
      risk_count: risks.length,
      derivation_completeness: completenessPercent,
    },
    created_at: now,
    updated_at: now,
  };
}

function findKitRoot(runDir: string): string {
  const entrypointPath = join(runDir, "kit", "entrypoint.json");
  if (existsSync(entrypointPath)) {
    try {
      const ep = JSON.parse(readFileSync(entrypointPath, "utf-8"));
      if (ep.kit_root) return join(runDir, ep.kit_root);
    } catch { /* fall through */ }
  }
  return join(runDir, "kit", "bundle", "agent_kit");
}

function deriveSubsystems(spec: Record<string, unknown> | null, kitRoot: string): BAQSubsystemEntry[] {
  const subsystems: BAQSubsystemEntry[] = [];
  let counter = 1;

  const archDir = join(kitRoot, "10_app", "03_architecture");
  if (existsSync(archDir)) {
    const archContent = readMdSafe(join(archDir, "architecture.md")) ?? readMdSafe(join(archDir, "01_architecture.md")) ?? "";
    if (archContent) {
      const layerPatterns = [
        { pattern: /frontend|ui|client/i, layer: "frontend", name: "Frontend Layer" },
        { pattern: /backend|server|api/i, layer: "backend", name: "Backend Layer" },
        { pattern: /data|storage|database/i, layer: "data", name: "Data Layer" },
        { pattern: /auth|security|identity/i, layer: "security", name: "Security Layer" },
      ];
      for (const lp of layerPatterns) {
        if (lp.pattern.test(archContent)) {
          subsystems.push({
            subsystem_id: `SUB-${String(counter++).padStart(3, "0")}`,
            name: lp.name,
            layer: lp.layer,
            description: `${lp.name} derived from architecture documents`,
            source_refs: ["SEC-ARCH"],
            module_refs: [],
          });
        }
      }
    }
  }

  if (subsystems.length === 0 && spec) {
    const entities = spec.entities as Record<string, unknown> | undefined;
    const features = (entities?.features ?? []) as Array<Record<string, unknown>>;
    if (features.length > 0) {
      subsystems.push(
        { subsystem_id: `SUB-${String(counter++).padStart(3, "0")}`, name: "Frontend Layer", layer: "frontend", description: "UI components and pages", source_refs: ["SEC-SPEC"], module_refs: [] },
        { subsystem_id: `SUB-${String(counter++).padStart(3, "0")}`, name: "Backend Layer", layer: "backend", description: "API and business logic", source_refs: ["SEC-SPEC"], module_refs: [] },
        { subsystem_id: `SUB-${String(counter++).padStart(3, "0")}`, name: "Data Layer", layer: "data", description: "Data models and storage", source_refs: ["SEC-SPEC"], module_refs: [] },
      );
    }
  }

  return subsystems;
}

function deriveFeatures(spec: Record<string, unknown> | null, workBreakdown: Record<string, unknown> | null): BAQFeatureEntry[] {
  const features: BAQFeatureEntry[] = [];

  if (!spec) return features;
  const entities = spec.entities as Record<string, unknown> | undefined;
  const rawFeatures = (entities?.features ?? []) as Array<Record<string, unknown>>;

  const units = ((workBreakdown?.units ?? []) as Array<Record<string, unknown>>);

  for (const f of rawFeatures) {
    const featureId = String(f.feature_id ?? "");
    const relatedUnits = units.filter(u =>
      (u.scope_refs as string[] ?? []).includes(featureId),
    );
    const deliverables = relatedUnits.flatMap(u => (u.deliverables ?? []) as string[]);
    const scopeRefs = relatedUnits.map(u => String(u.unit_id ?? ""));

    features.push({
      feature_id: featureId,
      name: String(f.name ?? ""),
      description: String(f.description ?? ""),
      priority: String(f.priority_tier ?? "must"),
      deliverables: deliverables.length > 0 ? deliverables : [String(f.name ?? "")],
      scope_refs: scopeRefs,
      subsystem_refs: [],
    });
  }

  return features;
}

function deriveDomainModel(spec: Record<string, unknown> | null, kitRoot: string): BAQDomainModel {
  const entities: BAQDomainEntity[] = [];
  const relationships: Array<{ from: string; to: string; type: string; label?: string }> = [];

  if (!spec) return { entities, relationships };

  const specEntities = spec.entities as Record<string, unknown> | undefined;
  const roles = (specEntities?.roles ?? []) as Array<Record<string, unknown>>;
  const features = (specEntities?.features ?? []) as Array<Record<string, unknown>>;

  let counter = 1;
  for (const role of roles) {
    entities.push({
      entity_id: `ENT-${String(counter++).padStart(3, "0")}`,
      name: String(role.name ?? role.role_id ?? ""),
      fields: [
        { name: "id", type: "string", required: true },
        { name: "name", type: "string", required: true },
        { name: "email", type: "string", required: true },
        { name: "role", type: "string", required: true },
      ],
      relationships: [],
      source_ref: String(role.role_id ?? ""),
    });
  }

  const dataDir = join(kitRoot, "10_app", "08_data");
  if (existsSync(dataDir)) {
    try {
      const files = readdirSync(dataDir).filter((f: string) => f.endsWith(".md") && !f.startsWith("00_"));
      for (const file of files) {
        const content = readMdSafe(join(dataDir, file));
        if (!content) continue;
        const entityMatches = content.match(/#+\s*(\w+)\s*(?:Entity|Model|Table)/gi);
        if (entityMatches) {
          for (const match of entityMatches) {
            const name = match.replace(/#+\s*/, "").replace(/\s*(Entity|Model|Table)/i, "").trim();
            if (name && !entities.find(e => e.name.toLowerCase() === name.toLowerCase())) {
              entities.push({
                entity_id: `ENT-${String(counter++).padStart(3, "0")}`,
                name,
                fields: [{ name: "id", type: "string", required: true }],
                relationships: [],
                source_ref: `SEC-DATA/${file}`,
              });
            }
          }
        }
      }
    } catch { /* skip */ }
  }

  return { entities, relationships };
}

function deriveStorageModel(kitRoot: string): BAQStorageModel {
  const schemas: Array<{ schema_id: string; name: string; fields: string[]; source_ref: string }> = [];

  const dataDir = join(kitRoot, "10_app", "08_data");
  if (existsSync(dataDir)) {
    try {
      const files = readdirSync(dataDir).filter((f: string) => f.endsWith(".md") && !f.startsWith("00_"));
      let counter = 1;
      for (const file of files) {
        schemas.push({
          schema_id: `SCH-${String(counter++).padStart(3, "0")}`,
          name: file.replace(".md", ""),
          fields: [],
          source_ref: `SEC-DATA/${file}`,
        });
      }
    } catch { /* skip */ }
  }

  return {
    storage_type: schemas.length > 0 ? "relational" : "unknown",
    schemas,
    migrations: [],
  };
}

function deriveAPISurface(spec: Record<string, unknown> | null, kitRoot: string): BAQAPISurface {
  const endpoints: BAQAPISurface["endpoints"] = [];
  const routes: BAQAPISurface["routes"] = [];

  const apiDir = join(kitRoot, "10_app", "09_api_contracts");
  if (existsSync(apiDir)) {
    try {
      const files = readdirSync(apiDir).filter((f: string) => f.endsWith(".md") && !f.startsWith("00_"));
      let counter = 1;
      for (const file of files) {
        const content = readMdSafe(join(apiDir, file));
        if (!content) continue;

        const endpointPattern = /(?:GET|POST|PUT|PATCH|DELETE)\s+\/\S+/g;
        const matches = content.match(endpointPattern);
        if (matches) {
          for (const match of matches) {
            const parts = match.trim().split(/\s+/);
            const method = parts[0];
            const path = parts[1];
            endpoints.push({
              endpoint_id: `EP-${String(counter++).padStart(3, "0")}`,
              path,
              method,
              request_schema: null,
              response_schema: null,
              auth_required: true,
              source_ref: `SEC-API/${file}`,
            });
          }
        }
      }
    } catch { /* skip */ }
  }

  return { endpoints, routes };
}

function deriveAuthModel(
  spec: Record<string, unknown> | null,
  normalizedInput: Record<string, unknown> | null,
  kitRoot: string,
): BAQAuthModel {
  let authType = "unknown";
  const authFlows: string[] = [];
  const rbacRules: Array<{ role: string; permissions: string[] }> = [];
  let sessionHandling = "unknown";
  const sourceRefs: string[] = [];

  if (normalizedInput) {
    const constraints = normalizedInput.constraints as Record<string, unknown> | undefined;
    if (constraints) {
      const auth = constraints.auth as Record<string, unknown> | undefined;
      if (auth) {
        if (auth.auth_provider) { authType = String(auth.auth_provider); sourceRefs.push("SEC-NIR"); }
        if (auth.session_handling) { sessionHandling = String(auth.session_handling); }
        if (auth.authorization_model) { authFlows.push(String(auth.authorization_model)); }
      }
    }
  }

  if (spec) {
    const entities = spec.entities as Record<string, unknown> | undefined;
    const roles = (entities?.roles ?? []) as Array<Record<string, unknown>>;
    const permissions = (entities?.permissions ?? []) as Array<Record<string, unknown>>;

    for (const role of roles) {
      const roleName = String(role.name ?? role.role_id ?? "");
      const rolePerms = permissions
        .filter(p => p.role_ref === role.role_id)
        .flatMap(p => (p.allowed_capabilities ?? []) as string[]);
      if (roleName) {
        rbacRules.push({ role: roleName, permissions: rolePerms });
        sourceRefs.push("SEC-SPEC");
      }
    }
  }

  const secDir = join(kitRoot, "10_app", "05_security");
  if (existsSync(secDir)) {
    sourceRefs.push("SEC-SEC");
  }

  return {
    auth_type: authType,
    auth_flows: authFlows,
    rbac_rules: rbacRules,
    session_handling: sessionHandling,
    source_refs: Array.from(new Set(sourceRefs)),
  };
}

function deriveUISurface(spec: Record<string, unknown> | null, workBreakdown: Record<string, unknown> | null): BAQUISurfaceEntry[] {
  const pages: BAQUISurfaceEntry[] = [];
  if (!spec) return pages;

  const entities = spec.entities as Record<string, unknown> | undefined;
  const features = (entities?.features ?? []) as Array<Record<string, unknown>>;

  let counter = 1;
  for (const f of features) {
    const name = String(f.name ?? "");
    if (!name) continue;

    const pageName = name.replace(/\s+/g, "");
    const pagePath = `/${pageName.replace(/([A-Z])/g, (m, c, i) => i === 0 ? c.toLowerCase() : `-${c.toLowerCase()}`)}`;

    pages.push({
      page_id: `PAGE-${String(counter++).padStart(3, "0")}`,
      path: pagePath,
      name: pageName,
      role: "page",
      feature_refs: [String(f.feature_id ?? "")],
      source_ref: String(f.feature_id ?? ""),
    });
  }

  return pages;
}

function deriveVerificationObligations(
  acceptanceMap: Record<string, unknown> | null,
  spec: Record<string, unknown> | null,
): BAQVerificationObligation[] {
  const obligations: BAQVerificationObligation[] = [];

  if (!acceptanceMap) return obligations;
  const items = (acceptanceMap.acceptance ?? acceptanceMap.acceptance_items ?? []) as Array<Record<string, unknown>>;

  let counter = 1;
  for (const item of items) {
    obligations.push({
      obligation_id: `VEROBL-${String(counter++).padStart(3, "0")}`,
      description: String(item.title ?? item.statement ?? ""),
      category: String(item.category ?? "functional"),
      feature_ref: String(Array.isArray(item.scope_refs) && (item.scope_refs as string[]).length > 0 ? (item.scope_refs as string[])[0] : (item.unit_ref ?? "")),
      criteria: Array.isArray(item.criteria) ? item.criteria as string[] : [String(item.statement ?? "")],
      gating: String(item.gating ?? "soft_gate"),
    });
  }

  return obligations;
}

function deriveOpsObligations(kitRoot: string): BAQOpsObligation[] {
  const obligations: BAQOpsObligation[] = [];

  const opsDir = join(kitRoot, "10_app", "07_ops");
  if (!existsSync(opsDir)) return obligations;

  try {
    const files = readdirSync(opsDir).filter((f: string) => f.endsWith(".md") && !f.startsWith("00_"));
    let counter = 1;
    for (const file of files) {
      obligations.push({
        obligation_id: `OPSOBL-${String(counter++).padStart(3, "0")}`,
        category: "operational",
        description: `Ops document: ${file.replace(".md", "")}`,
        source_ref: `SEC-OPS/${file}`,
      });
    }
  } catch { /* skip */ }

  return obligations;
}

function deriveAssumptions(
  spec: Record<string, unknown> | null,
  normalizedInput: Record<string, unknown> | null,
): BAQAssumption[] {
  const assumptions: BAQAssumption[] = [];
  let counter = 1;

  if (spec) {
    const unknowns = spec.unknowns as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(unknowns)) {
      for (const u of unknowns) {
        assumptions.push({
          assumption_id: `ASM-${String(counter++).padStart(3, "0")}`,
          description: `Unknown from spec: ${u.description ?? u.field ?? u.question ?? "unspecified"}`,
          source_ref: "SEC-SPEC",
          impact: "warning",
        });
      }
    }
  }

  return assumptions;
}

function deriveRisks(
  spec: Record<string, unknown> | null,
  normalizedInput: Record<string, unknown> | null,
): BAQRisk[] {
  const risks: BAQRisk[] = [];
  let counter = 1;

  if (spec) {
    const constraints = spec.constraints as Record<string, unknown> | undefined;
    const secConstraints = constraints?.security_constraints as Record<string, unknown> | undefined;
    if (secConstraints && Object.keys(secConstraints).length > 0) {
      risks.push({
        risk_id: `RISK-${String(counter++).padStart(3, "0")}`,
        description: "Security constraints require careful implementation to avoid vulnerabilities",
        source_ref: "SEC-SPEC",
        severity: "error",
        mitigation: "Follow security pack guidelines and verify all auth flows",
      });
    }
  }

  return risks;
}

export function checkBAQDerivedInputsGate(derivedInputs: BAQDerivedBuildInputs): {
  passed: boolean;
  blockers: string[];
  gate_id: "G-BQ-02";
} {
  const blockers: string[] = [];

  if (derivedInputs.summary.derivation_completeness < 50) {
    blockers.push(`Derivation completeness too low: ${derivedInputs.summary.derivation_completeness}% (minimum 50%)`);
  }

  if (derivedInputs.summary.feature_count === 0) {
    blockers.push("No features derived from extraction");
  }

  if (derivedInputs.summary.subsystem_count === 0) {
    blockers.push("No subsystems derived from extraction");
  }

  return {
    passed: blockers.length === 0,
    blockers,
    gate_id: "G-BQ-02",
  };
}
