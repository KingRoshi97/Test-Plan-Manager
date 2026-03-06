export type Phase = 1 | 2 | 3;
export type Priority = "Critical" | "High" | "Medium-High" | "Medium";
export type MaturityTier = "A" | "B" | "C";
export type UpgradeStatus = "not-started" | "in-progress" | "complete";

export interface LibraryUpgrade {
  id: string;
  name: string;
  currentScore: number;
  targetScore: number;
  phase: Phase;
  priority: Priority;
  requiredArtifacts: string[];
  expectedLift: string;
  dependencyBlockers: string[];
  maturityTier: MaturityTier;
  phaseOrder: number;
  currentState: string;
  mainGap: string;
  upgradeTargets: string[];
  route: string;
}

export interface PhaseInfo {
  phase: Phase;
  title: string;
  description: string;
  targetOutcomes: string[];
  expectedResult: string[];
  libraries: string[];
}

export interface CrossPhaseRule {
  id: string;
  title: string;
  description: string;
}

export interface HardBlocker {
  id: number;
  title: string;
  items: string[];
}

export const libraries: LibraryUpgrade[] = [
  {
    id: "ops",
    name: "Ops",
    currentScore: 56,
    targetScore: 85,
    phase: 1,
    priority: "Critical",
    requiredArtifacts: [
      "OPS-0_purpose.md",
      "OPS-1_monitoring_alert_standards.md",
      "OPS-2_logging_tracing_standards.md",
      "OPS-3_slo_sla_error_budget_policy.md",
      "OPS-4_perf_budgets_profiling.md",
      "OPS-5_cost_models_quota_hooks.md",
      "OPS-6_ops_gates_evidence.md",
      "OPS-7_minimum_viable_ops.md",
      "contracts/ops_unit.schema.json",
      "contracts/ops_decision_report.schema.json",
      "registries/ops_registry.v1.json",
      "registries/ops_metrics_catalog.v1.json",
    ],
    expectedLift: "Turns Ops from thin reference layer into real enterprise operations authority",
    dependencyBlockers: [
      "Telemetry producer/consumer mapping",
      "Policy override model",
      "Verification proof mapping",
    ],
    maturityTier: "C",
    phaseOrder: 1,
    currentState: "The weakest formal library. Basic schemas for alerts, cost, budgets, SLO, logging.",
    mainGap: "Too shallow relative to how important ops is.",
    upgradeTargets: [
      "Expand ops into a full doctrine library with purpose, boundaries, determinism rules, validation checklist, evidence requirements, gate mapping, minimum viable ops set",
      "Split ops into governed areas: observability, logging/tracing, alerting, SLO/error budgets, perf budgets, load/capacity, cost/quota policy hooks",
    ],
    route: "",
  },
  {
    id: "knowledge",
    name: "Knowledge",
    currentScore: 66,
    targetScore: 86,
    phase: 1,
    priority: "Critical",
    requiredArtifacts: [
      "KNO-0_purpose.md",
      "KNO-1_unit_classes.md",
      "KNO-2_authority_tiers.md",
      "KNO-3_freshness_supersession.md",
      "KNO-4_retrieval_resolution_rules.md",
      "KNO-5_dependency_mapping.md",
      "KNO-6_proof_and_trust.md",
      "KNO-7_definition_of_done.md",
      "contracts/knowledge_unit.schema.json",
      "contracts/knowledge_retrieval_report.schema.json",
      "registries/knowledge_registry.v1.json",
    ],
    expectedLift: "Major retrieval quality and trust improvement; lowers guidance/example confusion",
    dependencyBlockers: [
      "Standards linkage",
      "Templates linkage",
      "Maintenance freshness scans",
    ],
    maturityTier: "C",
    phaseOrder: 2,
    currentState: "Huge and strategically important. Great breadth, bundles, indices, taxonomy, pillar organization.",
    mainGap: "Knowledge needs stronger runtime governance, not more raw content.",
    upgradeTargets: [
      "Make each KID a governed unit with stable ID, type, quality tier, authority tier, scope, tags, linked standards/templates/proofs, lifecycle status",
      "Split knowledge into: authoritative rules, guidance, examples, anti-patterns, references",
      "Add freshness and supersession logic",
      "Add retrieval policy based on run profile and risk class",
    ],
    route: "",
  },
  {
    id: "templates",
    name: "Templates",
    currentScore: 69,
    targetScore: 87,
    phase: 1,
    priority: "Critical",
    requiredArtifacts: [
      "TMP-0_purpose.md",
      "TMP-1_template_registry_rules.md",
      "TMP-2_applicability_selection.md",
      "TMP-3_placeholder_provenance.md",
      "TMP-4_completeness_and_proofs.md",
      "TMP-5_backcompat_and_migrations.md",
      "TMP-6_template_health.md",
      "contracts/template_unit.schema.json",
      "contracts/template_decision_report.schema.json",
      "contracts/placeholder_provenance.schema.json",
      "registries/template_registry.v1.json",
    ],
    expectedLift: "Big improvement in output consistency, completeness, and rerender control",
    dependencyBlockers: [
      "Standards applicability",
      "Canonical field mapping",
      "Knowledge support links",
    ],
    maturityTier: "C",
    phaseOrder: 3,
    currentState: "Large and content-rich, but governance needs to catch up.",
    mainGap: "Templates look more like content inventory than tightly governed executable assets.",
    upgradeTargets: [
      "Give every template: stable ID, version, owner, status, applicability, required inputs, required standards, required proofs",
      "Add section-level completion rules",
      "Add placeholder provenance rules",
      "Add 'forbidden guessing' zones",
      "Add backcompat tiers for template revisions",
    ],
    route: "/templates-library",
  },
  {
    id: "gates",
    name: "Gates",
    currentScore: 72,
    targetScore: 88,
    phase: 1,
    priority: "High",
    requiredArtifacts: [
      "GAT-0_purpose.md",
      "GAT-1_gate_registry_rules.md",
      "GAT-2_applicability_and_stage_bindings.md",
      "GAT-3_decision_report.md",
      "GAT-4_evidence_and_replay.md",
      "GAT-5_backcompat_and_drift.md",
      "GAT-6_gate_health.md",
      "contracts/gate_unit.schema.json",
      "contracts/gate_decision_report.schema.json",
      "registries/gate_registry.v1.json",
    ],
    expectedLift: "Stronger pass/fail explainability and lower enforcement drift",
    dependencyBlockers: [
      "Standards downstream mapping",
      "Verification proof rules",
      "Policy override model",
    ],
    maturityTier: "B",
    phaseOrder: 4,
    currentState: "Decent foundation but thinner than needed. Good gate definition model, DSL, runtime, reports, replay.",
    mainGap: "Gates need richer cross-library binding.",
    upgradeTargets: [
      "Every gate should declare: governing standards, validated artifact classes, required proofs, error taxonomy, replay contract",
      "Add predicate registry maturity tiers",
      "Add gate explainability model for operator review",
    ],
    route: "/gates",
  },
  {
    id: "maintenance",
    name: "Maintenance",
    currentScore: 81,
    targetScore: 92,
    phase: 2,
    priority: "High",
    requiredArtifacts: [
      "MNT-8_library_health_contract.md",
      "MNT-9_doctrine_compliance_rules.md",
      "MNT-10_backcompat_validation.md",
      "MNT-11_registry_rebuild_integrity.md",
      "MNT-12_remediation_and_patch_governance.md",
      "contracts/library_health_report.schema.json",
      "contracts/doctrine_compliance_finding.schema.json",
      "registries/library_health_registry.v1.json",
    ],
    expectedLift: "Becomes estate governor instead of just maintenance executor",
    dependencyBlockers: [
      "All library registries",
      "Common doctrine envelope",
      "Policy/mutation linkage",
    ],
    maturityTier: "B",
    phaseOrder: 1,
    currentState: "Strong meta-direction, but should become the estate governor.",
    mainGap: "Should actively evaluate all other libraries.",
    upgradeTargets: [
      "Make maintenance the governing layer for library health",
      "Add one health contract for every library: completeness, dependency integrity, stale reference scan, supersession hygiene, backcompat status, proof sufficiency",
      "Add automatic findings output for each maintenance mode",
    ],
    route: "/maintenance",
  },
  {
    id: "policy",
    name: "Policy",
    currentScore: 75,
    targetScore: 89,
    phase: 2,
    priority: "High",
    requiredArtifacts: [
      "POL-0_purpose.md",
      "POL-1_policy_unit_model.md",
      "POL-2_decision_report.md",
      "POL-3_override_expiry_supersession.md",
      "POL-4_backcompat_and_migration.md",
      "POL-5_policy_health.md",
      "contracts/policy_unit.schema.json",
      "contracts/policy_decision_report.schema.json",
      "registries/policy_registry.v1.json",
    ],
    expectedLift: "Stronger control of approvals, overrides, and risk-based behavior",
    dependencyBlockers: [
      "System policy hooks",
      "Audit action linkage",
      "Gates override eligibility",
    ],
    maturityTier: "B",
    phaseOrder: 2,
    currentState: "Useful, but comparatively thin. Good risk classes, overrides, precedence, enforcement points.",
    mainGap: "Policy should actively govern more runtime behavior.",
    upgradeTargets: [
      "Make policy drive: template selection limits, required proof thresholds, override expiry, approval classes, change blast-radius thresholds",
      "Add policy simulation mode before enforcement",
    ],
    route: "/policy",
  },
  {
    id: "telemetry",
    name: "Telemetry",
    currentScore: 78,
    targetScore: 89,
    phase: 2,
    priority: "Medium-High",
    requiredArtifacts: [
      "TEL-0_purpose.md",
      "TEL-1_signal_registry_rules.md",
      "TEL-2_producer_consumer_mapping.md",
      "TEL-3_signal_integrity_and_routing.md",
      "TEL-4_backcompat_and_redaction.md",
      "TEL-5_telemetry_health.md",
      "contracts/telemetry_signal.schema.json",
      "contracts/telemetry_decision_report.schema.json",
      "registries/telemetry_registry.v1.json",
    ],
    expectedLift: "Better signal governance and stronger observability confidence",
    dependencyBlockers: [
      "Ops signal consumers",
      "System routing hooks",
      "Privacy/redaction model",
    ],
    maturityTier: "A",
    phaseOrder: 3,
    currentState: "Solid. Good event model, run metrics, sink policy, privacy/redaction, telemetry gates.",
    mainGap: "Not enough library observability.",
    upgradeTargets: [
      "Track: template selection frequency, stale standard usage, deprecated item hits, orphaned knowledge entries, gate failure by library",
      "Add library health dashboards",
    ],
    route: "/telemetry-library",
  },
  {
    id: "kit",
    name: "Kit",
    currentScore: 81,
    targetScore: 90,
    phase: 2,
    priority: "Medium-High",
    requiredArtifacts: [
      "KIT-0_purpose.md",
      "KIT-1_release_classes.md",
      "KIT-2_package_dependency_rules.md",
      "KIT-3_proof_bundle_requirements.md",
      "KIT-4_backcompat_and_consumer_contracts.md",
      "KIT-5_kit_health.md",
      "contracts/kit_unit.schema.json",
      "contracts/kit_decision_report.schema.json",
      "registries/kit_registry.v1.json",
    ],
    expectedLift: "Stronger release packaging, certified output tiers, better export stability",
    dependencyBlockers: [
      "Verification proof bundles",
      "Standards snapshots",
      "System pin resolution",
    ],
    maturityTier: "A",
    phaseOrder: 4,
    currentState: "Strong. Good manifest, tree, entrypoint, versions, export rules, gates.",
    mainGap: "Compatibility contracts can be stronger.",
    upgradeTargets: [
      "Add explicit compatibility matrix: kit version ↔ standards snapshot, template registry, proof policy",
      "Add release class tags: dev, candidate, certified, enterprise-ready",
    ],
    route: "/kit-library",
  },
  {
    id: "standards",
    name: "Standards",
    currentScore: 84,
    targetScore: 92,
    phase: 3,
    priority: "High",
    requiredArtifacts: [
      "Richer standards registry",
      "Standards resolution report",
      "Standard → template/gate/proof mappings",
      "Standards compatibility labels",
      "Standards health metrics",
    ],
    expectedLift: "Becomes explicit obligation-to-enforcement bridge",
    dependencyBlockers: [
      "Templates clauses",
      "Gates rules",
      "Verification proof mappings",
      "Knowledge supports",
    ],
    maturityTier: "A",
    phaseOrder: 1,
    currentState: "Strong base. Good pack model, categories, resolution rules, snapshots, gate mapping.",
    mainGap: "Applicability and precedence need to become more executable.",
    upgradeTargets: [
      "Add explicit applicability predicates",
      "Add conflict and override logic per standard",
      "Add dependency edges: standard → gate, standard → template clause, standard → proof type",
      "Add deprecation/supersession chain",
    ],
    route: "/standards",
  },
  {
    id: "verification",
    name: "Verification",
    currentScore: 84,
    targetScore: 92,
    phase: 3,
    priority: "High",
    requiredArtifacts: [
      "Proof registry",
      "Verification decision report",
      "Proof strength tiers",
      "Proof compatibility labels",
      "Verification health metrics",
    ],
    expectedLift: "Becomes cross-library proof spine",
    dependencyBlockers: [
      "Gates evidence model",
      "Standards obligations",
      "Kit release classes",
    ],
    maturityTier: "A",
    phaseOrder: 2,
    currentState: "Strong. Good proof log, proof types, command policy, completion criteria.",
    mainGap: "Should validate library quality too, not only run completion.",
    upgradeTargets: [
      "Add proof classes for library validity: schema pass, dependency integrity, backcompat pass, coverage sufficiency, stale reference detection",
      "Add reusable proof bundles for maintenance modes",
    ],
    route: "/verification-library",
  },
  {
    id: "planning",
    name: "Planning",
    currentScore: 81,
    targetScore: 90,
    phase: 3,
    priority: "Medium-High",
    requiredArtifacts: [
      "Richer plan registry",
      "Planning decision report",
      "Upstream/downstream work-item mappings",
      "Planning compatibility labels",
      "Plan drift/health rules",
    ],
    expectedLift: "Stronger obligation-to-work-to-proof traceability",
    dependencyBlockers: [
      "Canonical entity mapping",
      "Standards obligations",
      "Templates targets",
    ],
    maturityTier: "A",
    phaseOrder: 3,
    currentState: "Strong. Good work breakdown, acceptance map, build plan, sequencing, coverage.",
    mainGap: "Plan coverage should be more visibly tied to standards and verification.",
    upgradeTargets: [
      "Require each plan item to map to: canonical entity, template output, standards obligation, acceptance evidence",
      "Add stale-plan detection when upstream libraries change",
      "Add plan gap classes: unmapped, under-scoped, unverifiable",
    ],
    route: "/planning-library",
  },
  {
    id: "orchestration",
    name: "Orchestration",
    currentScore: 84,
    targetScore: 91,
    phase: 3,
    priority: "Medium-High",
    requiredArtifacts: [
      "Orchestration stage registry",
      "Stage decision report",
      "Execution dependency map",
      "Rerun/resume invalidation rules",
      "Orchestration health metrics",
    ],
    expectedLift: "Stronger execution integrity and rerun safety",
    dependencyBlockers: [
      "Planning outputs",
      "Gates bindings",
      "Verification staleness rules",
    ],
    maturityTier: "A",
    phaseOrder: 4,
    currentState: "Strong. Good stage IO, run manifest, stage reports, rerun/resume, evidence format.",
    mainGap: "Should become the formal dependency spine across all libraries.",
    upgradeTargets: [
      "Make orchestration the authoritative map of: library consumption, artifact production, gate evidence origins",
      "Add rerun invalidation rules",
      "Add exact stage-to-library dependency declarations",
    ],
    route: "/orchestration",
  },
  {
    id: "intake",
    name: "Intake",
    currentScore: 84,
    targetScore: 91,
    phase: 3,
    priority: "Medium",
    requiredArtifacts: [
      "Intake registry",
      "Intake decision report",
      "Intake → canonical/planning/template mappings",
      "Intake compatibility labels",
      "Intake health metrics",
    ],
    expectedLift: "Better submission provenance and ambiguity control",
    dependencyBlockers: [
      "Canonical target mapping",
      "Planning scope inputs",
      "Template selection inputs",
    ],
    maturityTier: "A",
    phaseOrder: 5,
    currentState: "Strong and disciplined. Good form spec, enums, validation rules, submission record.",
    mainGap: "Needs tighter downstream traceability.",
    upgradeTargets: [
      "Link intake fields directly to canonical fields",
      "Add field-level dependency map into standards applicability",
      "Add 'input ambiguity classes' so uncertain intake data becomes explicit canonical unknowns",
      "Add proof requirements for normalization and validation outcomes",
    ],
    route: "/intake-library",
  },
  {
    id: "canonical",
    name: "Canonical",
    currentScore: 88,
    targetScore: 94,
    phase: 3,
    priority: "Medium",
    requiredArtifacts: [
      "Canonical registry enrichment",
      "Canonical decision report",
      "Provenance class model",
      "Downstream invalidation map",
      "Canonical health metrics",
    ],
    expectedLift: "Stronger source-of-truth authority and downstream invalidation discipline",
    dependencyBlockers: [
      "Intake mappings",
      "Planning dependencies",
      "Template field dependencies",
    ],
    maturityTier: "A",
    phaseOrder: 6,
    currentState: "Strong. Good ID rules, dedupe, integrity, unknowns/assumptions, schema shape.",
    mainGap: "Canonical truth needs to drive more of the estate.",
    upgradeTargets: [
      "Make canonical entities the required source for planning decomposition",
      "Add stronger references from templates to canonical paths",
      "Separate: hard facts, inferred facts, unresolved unknowns",
      "Add canonical impact rules: if canonical changes, these artifacts become stale",
    ],
    route: "/canonical",
  },
  {
    id: "audit",
    name: "Audit",
    currentScore: 84,
    targetScore: 91,
    phase: 3,
    priority: "Medium",
    requiredArtifacts: [
      "Richer audit registry",
      "Audit decision/report contract",
      "Producer/consumer mapping",
      "Audit compatibility labels",
      "Audit health metrics",
    ],
    expectedLift: "Stronger mutation accountability and impact trace",
    dependencyBlockers: [
      "Policy approval linkage",
      "Maintenance findings",
      "System event producers",
    ],
    maturityTier: "A",
    phaseOrder: 7,
    currentState: "Strong support library. Good action model, log model, index model, integrity rules, gate checks.",
    mainGap: "Should capture more library mutation context.",
    upgradeTargets: [
      "Record every library change with: actor, why, affected IDs, blast radius, backcompat result, remediation path",
      "Add mutation classes: create, revise, supersede, deprecate, retire",
    ],
    route: "/audit-library",
  },
  {
    id: "system",
    name: "System",
    currentScore: 88,
    targetScore: 95,
    phase: 3,
    priority: "Medium",
    requiredArtifacts: [
      "System resolution report",
      "Resolver authority contract",
      "Cross-library dependency graph",
      "System compatibility labels",
      "System health metrics",
    ],
    expectedLift: "Becomes full resolver/control-plane authority",
    dependencyBlockers: [
      "Mature registries from all libraries",
      "Final dependency graph model",
      "Policy integration",
    ],
    maturityTier: "A",
    phaseOrder: 8,
    currentState: "Strong infrastructure layer. Good workspace/project model, pin policies, adapter manager, quotas, routing, capability registry.",
    mainGap: "System should be the resolver authority for the whole library estate.",
    upgradeTargets: [
      "Formalize library resolution order",
      "Add pin/lock behavior per library type",
      "Add capability-based library filtering",
      "Add deterministic library loader report",
    ],
    route: "/system",
  },
];

export const phases: PhaseInfo[] = [
  {
    phase: 1,
    title: "Close the Biggest Governance Gaps",
    description: "These are the weakest or riskiest libraries. They create the biggest quality and drift risk in the estate.",
    targetOutcomes: [
      "Ops becomes a real doctrine library with full section doctrine, governed unit registry, applicability rules, proof rules, compatibility labels, drift checks, and ops health metrics",
      "Knowledge becomes a governed retrieval authority with KID registry, authority tiers, freshness states, applicability and retrieval rules, supersession rules, and health metrics",
      "Templates becomes a governed template estate with first-class template registry, lifecycle states, applicability rules, placeholder provenance, proof requirements, compatibility labels, and health metrics",
      "Gates becomes a governed evaluation authority with gate registry, applicability predicates, decision report contract, evidence requirements, compatibility labels, drift rules, and health metrics",
    ],
    expectedResult: [
      "Fewer blind spots",
      "Better retrieval quality",
      "Better template control",
      "Better evaluation traceability",
      "Real ops maturity",
      "Lower drift risk",
    ],
    libraries: ["ops", "knowledge", "templates", "gates"],
  },
  {
    phase: 2,
    title: "Strengthen Estate-Wide Control Surfaces",
    description: "Once the biggest weak spots are stabilized, the next step is strengthening the libraries that govern permissions, mutation control, signal visibility, and packaging/release quality.",
    targetOutcomes: [
      "Policy becomes a full decision authority with decision report contracts, lifecycle and supersession rules, compatibility labels, drift checks, and policy health metrics",
      "Maintenance becomes the meta-governor with per-library doctrine compliance checks, unified health contracts, stronger mutation and lifecycle enforcement, and better finding/remediation outputs",
      "Telemetry becomes a governed signal authority with signal registry enrichment, producer/consumer mapping, signal compatibility labels, telemetry integrity proofs, and self-health metrics",
      "Kit becomes a proof-backed release envelope with release classes, proof bundle requirements, stronger package compatibility rules, and kit health metrics",
    ],
    expectedResult: [
      "Clearer approvals and denials",
      "Maintenance becomes useful as a governor, not just a scanner",
      "Live signal governance improves",
      "Package quality and compatibility become much clearer",
    ],
    libraries: ["maintenance", "policy", "telemetry", "kit"],
  },
  {
    phase: 3,
    title: "Deepen the Already Strong Core",
    description: "These libraries are already relatively strong. They need deepening: richer dependency mapping, richer compatibility semantics, better health metrics, stronger cross-library authority.",
    targetOutcomes: [
      "Planning becomes the explicit bridge from obligation to work to proof",
      "Audit becomes the mutation accountability and impact-trace authority",
      "Standards becomes the full obligation-to-enforcement bridge",
      "Verification becomes the universal proof spine",
      "Orchestration becomes the execution dependency and invalidation authority",
      "Intake becomes the submission provenance and ambiguity authority",
      "Canonical becomes the provenance and downstream invalidation authority",
      "System becomes the full resolver authority for the entire estate",
    ],
    expectedResult: [
      "Strong provenance",
      "Strong invalidation logic",
      "Strong proof closure",
      "Stronger rerun/resume integrity",
      "Stronger resolver control",
      "Fewer hidden dependencies",
    ],
    libraries: ["standards", "verification", "planning", "orchestration", "intake", "canonical", "audit", "system"],
  },
];

export const fastestLiftOrder: { id: string; reason: string }[] = [
  { id: "templates", reason: "Affects a huge amount of behavior quickly" },
  { id: "knowledge", reason: "Affects a huge amount of behavior quickly" },
  { id: "ops", reason: "Fixes a major enterprise-readiness weakness" },
  { id: "gates", reason: "Reduces enforcement ambiguity" },
  { id: "maintenance", reason: "Lets you govern everything else more effectively" },
];

export const hardBlockers: HardBlocker[] = [
  {
    id: 1,
    title: "Common governance envelope",
    items: ["ID", "version", "owner", "lifecycle state", "applicability", "dependencies", "required proofs", "compatibility label"],
  },
  {
    id: 2,
    title: "Common compatibility vocabulary",
    items: ["compatible", "breaking", "migration-required", "rerun-required", "rebuild-required"],
  },
  {
    id: 3,
    title: "Common dependency edge types",
    items: ["requires", "constrains", "derives_from", "validates", "evidences", "produces_for", "conflicts_with", "supersedes"],
  },
  {
    id: 4,
    title: "Common decision report pattern",
    items: ["selection", "resolution", "evaluation", "proof", "packaging", "retrieval", "mutation impact"],
  },
];

export const crossPhaseRules: CrossPhaseRule[] = [
  {
    id: "ALG-1",
    title: "Every governed unit gets the same minimum envelope",
    description: "Every unit must have: ID, version, owner, lifecycle state, applicability, dependencies, required proofs, compatibility label",
  },
  {
    id: "ALG-2",
    title: "Every library gets a registry",
    description: "No major library should rely on inventory-by-folder alone.",
  },
  {
    id: "ALG-3",
    title: "Every important decision gets a report",
    description: "Reports for: selection, resolution, evaluation, proof sufficiency, packaging, retrieval, mutation impact",
  },
  {
    id: "ALG-4",
    title: "Every library gets health metrics",
    description: "Not just logs. Actual health indicators.",
  },
  {
    id: "ALG-5",
    title: "Maintenance enforces doctrine",
    description: "Maintenance should score and scan every library against the common governance doctrine.",
  },
];

export function getLibrary(id: string): LibraryUpgrade | undefined {
  return libraries.find((l) => l.id === id);
}

export function getPhaseLibraries(phase: Phase): LibraryUpgrade[] {
  return libraries.filter((l) => l.phase === phase).sort((a, b) => a.phaseOrder - b.phaseOrder);
}

export function getEstateStats() {
  const avgCurrent = Math.round(libraries.reduce((s, l) => s + l.currentScore, 0) / libraries.length);
  const avgTarget = Math.round(libraries.reduce((s, l) => s + l.targetScore, 0) / libraries.length);
  const totalGap = libraries.reduce((s, l) => s + (l.targetScore - l.currentScore), 0);
  return { avgCurrent, avgTarget, totalGap, totalLibraries: libraries.length };
}
