# Axion System Map

Updated after completion of all 21 tasks (T000–T020). All pipeline stages produce real, derived artifacts. All gates enforce evidence requirements. All CLI commands are wired.

---

## 1. Pipeline Stages (S1-S10)

| Stage ID | Name | Behavior | Core Module | Gate | Status |
|---|---|---|---|---|---|
| S1_INGEST_NORMALIZE | Ingest & Normalize | Loads raw submission, validates against schema/rules/enums, normalizes with deterministic transforms, writes submission record with SHA-256 hash | `core/intake` | (none) | Real |
| S2_VALIDATE_INTAKE | Validate Intake | Gate G1 checks file_exists + json_valid on validation_result.json | `core/gates` | G1_INTAKE_VALIDITY | Real |
| S3_BUILD_CANONICAL | Build Canonical Spec | Transforms normalized intake into canonical spec with entity graph, entity count, meta section; writes unknowns/assumptions | `core/canonical` | (none) | Real |
| S4_VALIDATE_CANONICAL | Validate Canonical Spec | Gate G2 checks file_exists + json_valid + json_has `/meta` | `core/gates` | G2_CANONICAL_INTEGRITY | Real |
| S5_RESOLVE_STANDARDS | Resolve Standards | Loads standards index + 3 packs (eng_core, sec_baseline, qa_baseline) from library, evaluates applicability, resolves with deterministic precedence, freezes snapshot with version pins | `core/standards` | G3_STANDARDS_RESOLVED | Real |
| S6_SELECT_TEMPLATES | Select Templates | Selects applicable templates from 446-entry library based on spec + standards; validates against template_index.json | `core/templates` | G4_TEMPLATE_SELECTION | Real |
| S7_RENDER_DOCS | Render Docs | Renders selected templates with real spec data context; produces completeness report identifying any gaps | `core/templates` | G5_TEMPLATE_COMPLETENESS | Real |
| S8_BUILD_PLAN | Build Plan | Generates work breakdown from canonical spec items, enforces 1-target-per-unit rule, produces acceptance map with required proof types, coverage report reflects real spec items | `core/planning` | G6_PLAN_COVERAGE | Real |
| S9_VERIFY_PROOF | Verify Proof | Writes hash-chained proof ledger entries linked to gate evidence pointers (6 gate entries per run) | `core/proofLedger` | G7_VERIFICATION | Real |
| S10_PACKAGE | Package Kit | Runs secrets/PII scanner, applies variant filtering (internal/external), bundles artifacts with computed hashes, writes kit manifest + packaging manifest with hash verification | `core/kit` | G8_PACKAGE_INTEGRITY | Real |

---

## 2. Control Planes

### ICP (Internal Control Plane) - **Wired (RunController orchestrates pipeline)**

RunController manages stage transitions via state machine. CLI `axion run` uses ICP for full orchestration. State transitions: QUEUED → RUNNING → stage IN_PROGRESS → PASS/FAIL → RELEASED/FAILED.

| File | Purpose | Wired |
|---|---|---|
| api.ts | RunController state machine, stage orchestration | Yes (CLI uses RunController) |
| audit.ts | Hash-chained audit logging | Yes |
| outputs.ts | Run log entry writer | Yes |
| store.ts | JSONRunStore for run persistence | Yes |
| model.ts | ICP data model types | Yes |
| profiles.ts | Run profile resolution + effective config | Yes |
| boundaryValidator.ts | Schema validation at stage boundaries | Yes |
| registryLoader.ts | Registry file loader | Yes |
| determinism.ts, failures.ts, gateEngine.ts, kitPackager.ts, pins.ts, policies.ts, proofSystem.ts, releases.ts, standardsEngine.ts, templateDriver.ts | Extended ICP modules | Available |

### KCP (Kit Control Plane) - **Core logic implemented**

State machine, kit validator, work unit manager (1-target rule), verification runner all real. Available for kit execution lifecycle.

### MCP (Maintenance Control Plane) - **Implemented (not wired to pipeline)**

Full module set for post-build lifecycle management. Available for maintenance runs.

---

## 3. Core Modules (22 directories under `src/core/`)

| Module | Directory | Status | Description |
|---|---|---|---|
| intake | `core/intake/` | Real | Validator, normalizer, submission record writer |
| canonical | `core/canonical/` | Real | Spec builder, unknowns capture |
| standards | `core/standards/` | Real | Resolver, selector, snapshot (3 packs, 21+ rules) |
| templates | `core/templates/` | Real | Selector, renderer, completeness gate, evidence |
| planning | `core/planning/` | Real | Work breakdown, acceptance map, coverage report, sequencing |
| kit | `core/kit/` | Real | Packager with variant filtering, build, manifest, entrypoint |
| gates | `core/gates/` | Real | DSL, evaluator (6 ops), registry, report writer |
| proofLedger | `core/proofLedger/` | Real | Ledger, registry, validate (hash-chained, proof type enforcement) |
| controlPlane | `core/controlPlane/` | Real | RunController, profiles, boundary validator, audit, outputs |
| scanner | `core/scanner/` | Real | Secrets/PII scanner with 2 packs (8 secret patterns, 3 PII patterns) |
| state | `core/state/` | Real | Retention policy, pruning, golden run promotion, doc envelopes |
| repro | `core/repro/` | Real | Reproduce runs deterministically, noise-stripped comparison |
| verification | `core/verification/` | Partial | Completion report (runner/policy stubbed) |
| kitControlPlane | `core/kitControlPlane/` | Real | State machine, validator, work unit manager, verification runner |
| maintenanceControlPlane | `core/maintenanceControlPlane/` | Real | Full MCP module set |
| artifactStore | `core/artifactStore/` | Stubbed | CAS, GC, refs |
| cache | `core/cache/` | Stubbed | Integrity, keys, planner |
| coverage | `core/coverage/` | Stubbed | Rules, scorer |
| diff | `core/diff/` | Stubbed | Classify, runDiff |
| ids | `core/ids/` | Stubbed | idRules, slugify |
| refs | `core/refs/` | Stubbed | Extractor, graph, resolver |
| taxonomy | `core/taxonomy/` | Stubbed | Errors, normalize |

---

## 4. CLI Commands (17 commands, all wired)

| Command | File | Status | Description |
|---|---|---|---|
| `axion init` | initAxion.ts | Real | Initialize .axion/ directory |
| `axion run` | axion.ts | Real | Full run via ICP RunController |
| `axion run start` | runControlPlane.ts | Real | Create new run with profile resolution |
| `axion run stage` | runStage.ts | Real | Execute single stage |
| `axion run gates` | runGates.ts | Real | Run gates for a stage |
| `axion validate-intake` | validateIntake.ts | Real | Validate an intake submission |
| `axion build-spec` | buildSpec.ts | Real | Build canonical spec |
| `axion resolve-standards` | resolveStandards.ts | Real | Resolve standards |
| `axion fill-templates` | fillTemplates.ts | Real | Fill templates with spec data |
| `axion repro` | repro.ts | Real | Reproduce a run deterministically |
| `axion generate-kit` | generateKit.ts | Real | Generate kit with variant filtering |
| `axion export-bundle` | exportBundle.ts | Real | Export bundle (6 profiles) |
| `axion release` | release.ts | Real | Release a completed run |
| `axion write-proof` | writeProof.ts | Real | Write proof entries |
| `axion verify` | verify.ts | Real | Verify a completed run |
| `axion plan-work` | planWork.ts | Real | Generate work breakdown |
| `axion write-state` | writeState.ts | Real | Write state snapshot |
| `axion prune` | axion.ts (inline) | Real | Prune old runs by retention policy |

---

## 5. Data Assets

### Libraries (`libraries/`)
| Asset | Files | Description |
|---|---|---|
| intake | schema.v1.json, rules.v1.json, enums.v1.json | Intake validation schemas + 20+ cross-field rules |
| standards | standards_index.json + 3 packs | eng_core (8 rules), sec_baseline (7 rules), qa_baseline (6 rules) |
| templates | template_index.json + 446 .md files | 8 groups across product, design, architecture, data, build, integrations, security, ops |
| knowledge | 395 KID files across 3 pillars | IT_END_TO_END, INDUSTRY_PLAYBOOKS, LANGUAGES_AND_LIBRARIES |

### Registries (`registries/`)
| Registry | Description |
|---|---|
| GATE_REGISTRY.json | 7 enforced gates with check definitions |
| TEMPLATE_INDEX.json | Template index (sparse, library is authoritative) |
| PACKAGING_PROFILES.json | 7 bundle profiles (full, internal, external, thin, audit, public, repro) |
| RUN_PROFILE_REGISTRY.json | 6 run profiles + 3 mode overlays |
| PROOF_TYPE_REGISTRY.json | Proof types with required fields |
| CONTROL_PLANE_REGISTRY.json | 3 control planes with boundaries |
| OPERATOR_ACTIONS_REGISTRY.json | Operator action rules per CP |
| FAILURE_CODES_REGISTRY.json | Failure codes with remediation |
| SCHEMA_REGISTRY.json | Schema definitions |
| TOOLCHAIN_REGISTRY.json | Toolchain configuration |
| STAGE_REGISTRY.json | Stage definitions |
| KIT_VARIANT_REGISTRY.json | Kit variant rules |

---

## 6. Run Artifacts (produced by `axion run`)

A complete run (e.g., RUN-000029) produces:
- `run_manifest.json` — Run metadata, pipeline config, profile
- `artifact_index.json` — SHA-256 indexed artifacts
- `icp_run_state.json` — ICP state machine trace
- `audit_log.jsonl` — Hash-chained operator actions
- `run_log.jsonl` — Chronological event trace
- `intake/` — normalized_payload.json, validation_result.json, submission_record.json
- `canonical/` — canonical_spec.json, unknowns_assumptions.json
- `standards/` — resolved_standards_snapshot.json, applicability_output.json
- `templates/` — selection_result.json, selection_report.json, render_report.json, template_completeness_report.json, rendered_docs/ (100+ .md files)
- `planning/` — work_breakdown.json, acceptance_map.json, coverage_report.json, sequencing_report.json
- `proof/` — proof_ledger.jsonl (hash-chained, 6 gate entries)
- `gates/` — G1-G6, G8 gate reports
- `kit/` — scan_result.json, packaging_manifest.json, bundle/ (kit_manifest, entrypoint, version_stamp)
- `stage_reports/` — S1-S10 stage reports
- `verification/`, `state/` — Available for extended workflows

---

## 7. Gap Summary

### Completed (Primary Pipeline)
All 10 stages produce real, derived artifacts. 7 gates enforce evidence. Proof ledger is hash-chained. Kit is variant-filtered and scanned. ICP RunController orchestrates pipeline. Run profiles resolve automatically. Retention/pruning implemented. Repro command works.

### Remaining (Extended/Auxiliary)
- **artifactStore** (CAS/GC/refs): Content-addressable storage for artifact deduplication
- **cache** (integrity/keys/planner): Build cache for incremental pipeline runs
- **coverage** (rules/scorer): Coverage scoring beyond plan coverage
- **diff** (classify/runDiff): Run-to-run diff analysis
- **ids** (idRules/slugify): Advanced ID generation rules
- **refs** (extractor/graph/resolver): Cross-artifact reference graph
- **taxonomy** (errors/normalize): Error taxonomy normalization
- **scanner/quarantine**: Quarantine infected artifacts
- **verification** (policy/runner): Extended verification policies

These are secondary modules that extend the core pipeline but are not required for the primary workflow.
