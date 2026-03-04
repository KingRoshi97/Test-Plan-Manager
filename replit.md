# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system. It takes intake submissions through a 10-stage Mechanics pipeline (S1_INGEST_NORMALIZE → S10_PACKAGE), resolves standards, builds canonical specs, selects and renders templates, plans work, runs gates, and packages everything into versioned "kits."

## Current State
Full Mechanics pipeline implemented with 10 stages, 7 enforced gates (G1–G6, G8), template selector + renderer, and `json_eq` evaluator op. All stages pass, all gates pass, zero TypeScript errors.

### File Counts
- **105+ non-empty .ts source files**
- **50 docs_system specification files** (fully written system contracts)
- **446 filled template .md files** (Groups 1–7 filled from source PDFs; Group 8 empty)
  - Group 1 Product Definition: 38 templates (PRD, URD, STK, DMG, RSC, RISK, BRP, SMIP)
  - Group 2 Experience Design: 43 templates (DES, IXD, CDX, DSYS, IAN, A11YD, RLB, VAP)
  - Group 3 System Architecture: 52 templates (ARC, SIC, SBDT, PMAD, ERR, RTM, WFO, APIG)
  - Group 4 Data & Information: 44 templates (DATA, DLR, DGL, DQV, SRCH, CACHE, RPT)
  - Group 5 Application Build: 131 templates (API×7, JBS×6, EVT×8, RLIM×6, FFCFG×6, PFS×5, FPMP×7, ADMIN×6, FE×7, SMD×6, CPR×5, FORM×6, ROUTE×6, UICP×5, CER×5, CSec×5, MOB×5, MDC×5, OFS×5, MBAT×5, MDL×4, MPUSH×6, SIGN×5)
  - Group 6 Integrations & External Services: 70 templates (IXS×10→INT dir, SSO×10, CRMERP×10, WHCP×10, PAY×10, NOTIF×10, FMS×10)
  - Group 7 Security, Privacy & Compliance: 68 templates (SEC×10, IAM×10, TMA×9, SKM×10, PRIV×10, AUDIT×10, COMP×9)
  - Group 8 Operations & Reliability: empty directories only
- **136 non-empty feature doc files** (17 features × 8 docs each)
- **17 non-empty feature registry JSON files**
- **9 non-empty global registry JSON files**
- **8 non-empty library JSON files** (intake schemas, standards packs, template index with 446 entries)
- **11 non-empty test files** (unit + integration + helpers)

## Project Structure
Two top-level directories: `Axion/` (pipeline engine) and `App/` (internal UI).

### App/ — Internal React UI
React + Vite + TypeScript frontend for browsing Axion runs, templates, registries, proofs, and kits.
- Stack: React 19, Vite 6, TypeScript 5, react-router-dom 7
- Dev server: port 5000 (webview workflow `cd App && npx vite`)
- `App/src/routes/` — 7 pages: Dashboard, Runs, RunDetail, Registries, Templates, Proofs, Kits
- `App/src/components/` — 5 shared components: Layout, Nav, DataTable, JsonViewer, StatusBadge
- `App/src/lib/` — api.ts (fetch helpers), paths.ts (route constants), types.ts (domain types)

### Axion/ — Pipeline Engine
All source code lives under `Axion/`:

- `Axion/src/` — TypeScript source
  - `cli/` — CLI entry (`axion.ts`) and commands (init, runControlPlane, runStage, planWork, runGates, packageKit, verify, writeState, writeProof, validateIntake, resolveStandards, buildSpec, fillTemplates, generateKit, exportBundle, release, repro)
  - `core/` — Domain modules:
    - Pipeline: intake, standards, canonical, templates, planning, kit, state
    - Enforcement: controlPlane, gates, verification, proofLedger
    - Extended: artifactStore, cache, diff, repro, refs, coverage, scanner, taxonomy, ids
  - `types/` — Shared type definitions (RunManifest, StageRun, StageReport, StageId, ArtifactIndexEntry, etc.)
  - `utils/` — Utilities (writeJson, readJson, appendJsonl, ensureDir, sha256, isoNow, NotImplementedError, canonicalJson)
- `Axion/.axion/` — Runtime artifact root (gitignored, created by `axion init`)
- `Axion/docs_system/` — 50 system docs across 12 domains (SYS, INT, CAN, STD, TMP, ORD, PLAN, VER, KIT, STATE, GOV, EXEC)
- `Axion/libraries/` — Persistent system assets:
  - `intake/` — enums.v1.json, schema.v1.json, rules.v1.json (from INT-02/INT-03)
  - `standards/` — standards_index.json + 3 packs (eng_core, sec_baseline, qa_baseline)
  - `templates/` — template_index.json + 8 template groups (446 total .md files)
- `Axion/registries/` — 9 global registry JSON files
- `Axion/features/` — 17 feature packs (FEAT-001 through FEAT-017), each with 00_registry.json + 8 doc files
- `Axion/test/` — Unit tests, integration tests, fixtures, helpers
- `Axion/scripts/` — Dev convenience shell scripts

## CLI Commands
```bash
cd Axion
npx tsx src/cli/axion.ts init                                  # Initialize .axion/ + run_counter.json
npx tsx src/cli/axion.ts run start                             # Allocate RUN-NNNNNN, write manifest
npx tsx src/cli/axion.ts run stage <run_id> <stage_id>         # Execute a single stage
npx tsx src/cli/axion.ts run                                   # Full run: init + start + all 10 stages
npx tsx src/cli/axion.ts run gates <run_id> <stage_id>         # Run gates for a stage
npx tsc --noEmit                                               # Type check (zero errors)
```

## Pipeline Stages (Mechanics Order)
S1_INGEST_NORMALIZE → S2_VALIDATE_INTAKE → S3_BUILD_CANONICAL → S4_VALIDATE_CANONICAL → S5_RESOLVE_STANDARDS → S6_SELECT_TEMPLATES → S7_RENDER_DOCS → S8_BUILD_PLAN → S9_VERIFY_PROOF → S10_PACKAGE

### Stage→Gate Mapping
| Stage | Gate | Enforced |
|---|---|---|
| S2_VALIDATE_INTAKE | G1_INTAKE_VALIDITY | Yes |
| S4_VALIDATE_CANONICAL | G2_CANONICAL_INTEGRITY | Yes |
| S5_RESOLVE_STANDARDS | G3_STANDARDS_RESOLVED | Yes |
| S6_SELECT_TEMPLATES | G4_TEMPLATE_SELECTION | Yes |
| S7_RENDER_DOCS | G5_TEMPLATE_COMPLETENESS | Yes |
| S8_BUILD_PLAN | G6_PLAN_COVERAGE | Yes |
| S9_VERIFY_PROOF | G7_VERIFICATION | No (not yet) |
| S10_PACKAGE | G8_PACKAGE_INTEGRITY | Yes |

### Stage ID Aliases (deprecated, one-release transition)
Old → New: S2_INTAKE_VALIDATION→S2_VALIDATE_INTAKE, S3_STANDARDS_RESOLUTION→S5_RESOLVE_STANDARDS, S4_CANONICAL_BUILD→S3_BUILD_CANONICAL, S5_TEMPLATE_SELECTION→S6_SELECT_TEMPLATES, S6_PLAN_GENERATION→S8_BUILD_PLAN, S7_TEMPLATE_FILL→S7_RENDER_DOCS, S9_KIT_PACKAGE→S10_PACKAGE. Dropped: S0_INIT, S8_GATE_EVALUATION, S10_CLOSE.

## Gate Engine
Architecture: GATE_REGISTRY.json → registry loader → path templating → evaluator (6 ops) → gate report writer → manifest update

### Gate Registry (registries/GATE_REGISTRY.json)
7 enforced gates mapped to pipeline stages:
- G1_INTAKE_VALIDITY → S2_VALIDATE_INTAKE (file_exists + json_valid)
- G2_CANONICAL_INTEGRITY → S4_VALIDATE_CANONICAL (file_exists + json_valid + json_has)
- G3_STANDARDS_RESOLVED → S5_RESOLVE_STANDARDS (file_exists + json_valid)
- G4_TEMPLATE_SELECTION → S6_SELECT_TEMPLATES (file_exists + json_valid + json_has)
- G5_TEMPLATE_COMPLETENESS → S7_RENDER_DOCS (file_exists + json_valid + json_eq)
- G6_PLAN_COVERAGE → S8_BUILD_PLAN (file_exists + json_valid + coverage_gte)
- G8_PACKAGE_INTEGRITY → S10_PACKAGE (file_exists + json_valid + verify_hash_manifest)

### Evaluator Ops (6 primitives)
- `file_exists(path)` → E_FILE_MISSING
- `json_valid(path)` → E_JSON_INVALID
- `json_has(path, pointer)` → E_REQUIRED_FIELD_MISSING
- `json_eq(path, pointer, expected)` → E_VALUE_MISMATCH (also E_FILE_MISSING, E_JSON_INVALID, E_REQUIRED_FIELD_MISSING)
- `coverage_gte(path, pointer, min)` → E_COVERAGE_BELOW_MIN
- `verify_hash_manifest(manifest_path, bundle_root)` → E_PACK_*

### Gate Report v1 Format
Written to `gates/<gate_id>.gate_report.json` using canonical JSON (deep-sorted keys, 2-space indent, LF, trailing newline).
Fields: run_id, gate_id, stage_id, status (pass/fail), evaluated_at, engine {name, version}, checks[] {check_id, status, failure_code, evidence[]}, failure_codes[], evidence[]

## Template System
### Selector (src/core/templates/selector.ts)
- Source: `libraries/templates/template_index.json` (446 templates)
- Default profile filter: `status == "active"` AND `requiredness == "always"` → 8 templates
- Output: SelectedTemplate[] with template_id, template_version, source paths, output_path

### Renderer (src/core/templates/renderer.ts)
- Placeholder regex: `/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g`
- `renderTemplate(content, context)` — dotted-path resolution, primitives as-is, objects → JSON.stringify
- `scanUnresolvedPlaceholders(content)` → `{ key, occurrences }[]`
- `countPlaceholders(content)` → total count
- `buildAutoContext(templateContents, overrides)` — scan all keys, stub to `"__AXION_VALUE__"`, apply overrides (run_id, generated_at)

### Evidence (src/core/templates/evidence.ts)
- `writeSelectionResult(runDir, runId, generatedAt, baseDir)` → templates/selection_result.json + selection_report.json
- `writeRenderedDocs(runDir, runId, generatedAt, baseDir)` → templates/rendered_docs/*.md + render_report.json

## MVP Evidence Artifacts (generated during `axion run`)
- S1: intake/validation_result.json
- S3: canonical/canonical_spec.json
- S5: standards/resolved_standards_snapshot.json
- S6: templates/selection_result.json + selection_report.json
- S7: templates/rendered_docs/{ARC-01,DES-04,DES-06,PRD-01..05}.md + render_report.json
- S8: planning/coverage_report.json
- S10: kit/bundle/{kit_manifest,entrypoint,version_stamp}.json + kit/packaging_manifest.json

## Run Spine (output of `axion run`)
Run IDs: `RUN-NNNNNN` (sequential, from `.axion/run_counter.json`)

Under `.axion/runs/RUN-NNNNNN/`:
- `run_manifest.json` — Full manifest with pipeline, stage_order (10 stages), stage_gates, gates_required (7)
- `artifact_index.json` — Index of all artifacts with sha256 hashes
- `stage_reports/` — Per-stage reports (S1 through S10)
- `gates/` — Gate reports (G1, G2, G3, G4, G5, G6, G8)
- Subdirectories: intake, standards, canonical, planning, templates, templates/rendered_docs, gates, proof, verification, kit, state

### Canonical JSON (src/utils/canonicalJson.ts)
- deepSortKeys: recursively sort object keys lexicographically, arrays keep order
- canonicalJsonString: deep-sort + JSON.stringify(null, 2) + "\n"
- writeCanonicalJson: write canonical JSON to file
- canonicalHash: sha256 of canonical JSON bytes

### Gate Files
- `src/core/gates/registry.ts` — GateDefinition types (with `expected?` field), loadGateRegistry, filterGatesByStage, templateGatePaths
- `src/core/gates/evaluator.ts` — CheckResult/EvidenceEntry types, evalCheck (6 ops incl. json_eq)
- `src/core/gates/run.ts` — runGatesForStage (orchestrator)
- `src/core/gates/report.ts` — GateReportV1 type, writeGateReport
- `src/core/gates/evidence.ts` — MVP evidence generators (intake, canonical, standards, coverage, packaging)

## Tech Stack
- TypeScript (strict mode, ES2022 target, Node16 module resolution)
- tsx (dev runner)
- Node.js >= 18
- ESM imports with `.js` extensions (Node16 resolution)

## Knowledge Library (`Axion/libraries/knowledge/`)
Structured, policy-governed knowledge base providing KID files (Knowledge Items) across three pillars.

### Structure
- **INDEX/** — 8 registry files: knowledge.index.json (395 KIDs), taxonomy.json, tags.json, bundles.index.json, sources.index.json, changelog.md, deprecations.json, quality_tiers.json
- **POLICIES/** — 5 policy files: use_policy.md, external_agent_policy.md, citation_policy.md, plagiarism_ip_rules.md, secrets_pii_handling.md
- **BUNDLES/** — 10 bundle JSON files (5 by_run_profile, 3 by_risk_class, 2 by_executor)
- **REUSE/** — allowlist.json, reuse_log.json, licenses/ (4 license texts)
- **TEMPLATES/** — KID authoring templates (knowledge_item.md, industry_playbook.md, stack_playbook.md)
- **OUTPUTS/** — Schema files for selection results and bundle exports

### Pillars (395 KID files total)
- **IT_END_TO_END** (254 KIDs): 19 domains across 4 groups
  - 01_foundations: networking, operating_systems, security_fundamentals, compute_virtualization, storage_fundamentals
  - 02_software_delivery: architecture_design, apis_integrations, ci_cd_devops, testing_qa, observability_sre
  - 03_data_systems: databases, distributed_systems, caching, search_retrieval
  - 04_platform_ops: cloud_fundamentals, identity_access_management, compliance_governance, release_management, finops_cost
- **INDUSTRY_PLAYBOOKS** (58 KIDs): healthcare, finance, retail_ecommerce, logistics_supply_chain, government_public_sector
- **LANGUAGES_AND_LIBRARIES** (83 KIDs): javascript_typescript (+ nodejs, react, nextjs), python, go, rust, databases/postgres, solidity_evm

### KID File Contract
- YAML frontmatter: kid, title, type, pillar, domains, tags, maturity (draft/reviewed/verified/golden), use_policy, executor_access, license
- Sections: Summary, When to use, Do/Don't, Core content, Links, Proof/confidence
- Naming: KID-<PILLAR_PREFIX><DOMAIN>-<TYPE>-<NNNN>.md

### Domain Subfolders (standardized per domain)
concepts/ patterns/ procedures/ checklists/ pitfalls/ references/ examples/

## Control Planes

Axion implements three Control Planes per the system specification. Each runs in a different context with its own state machine, runtime modules, output artifacts, and hard boundaries.

### Internal Control Plane (ICP)
Lives in the AXION runtime. Orchestrates the 10-stage Mechanics pipeline.

**State Machine (RunState):** QUEUED → RUNNING → GATED → RUNNING → RELEASED → ARCHIVED (+ PAUSED, CANCELLED, ROLLING_BACK)
**Stage States:** NOT_STARTED → IN_PROGRESS → PASS/FAIL/SKIP

**Modules** (`Axion/src/core/controlPlane/`):
| Module | File | Produces |
|---|---|---|
| State Machine | model.ts | Run state transitions, advancement validation |
| Run Orchestrator | api.ts (RunController) | Run lifecycle (create, advance, gate, release, fail, archive) |
| Run Store | store.ts (JSONRunStore) | JSON file I/O for runs |
| Registry Loader | registryLoader.ts | resolved_pinset, registry_resolution_report |
| Standards Engine | standardsEngine.ts | standards_applicability_output, resolved_standards_snapshot |
| Template Driver | templateDriver.ts | template_selection_result, render_envelopes, completeness_report |
| Gate Engine | gateEngine.ts | gate_report with per-gate results + remediation |
| Proof System | proofSystem.ts | proof_objects, proof_ledger (append-only) |
| Kit Packager | kitPackager.ts | kit_manifest, kit_entrypoint, bundle_metadata |
| Audit Logger | audit.ts | Hash-chained audit_log.jsonl |
| Releases | releases.ts | Release records (create, sign, publish, revoke) |
| Pins | pins.ts | Pin/unpin artifacts with deterministic version selection |
| Policies | policies.ts | Policy evaluation with threshold rules |
| Outputs | outputs.ts | run_manifest, run_log, stage_reports, gate_reports, pinset, state_snapshot |
| Failures | failures.ts | Failure classification (contract/verification/recoverable), remediation |
| Determinism | determinism.ts | Noise isolation, golden comparison, determinism hashing |
| Index | index.ts | Re-exports all ICP modules |

### Kit Control Plane (KCP)
Ships inside every agent kit as a built-in enforcer. ICP embeds KCP during S10 packaging. KCP treats kit contents (standards snapshot, templates, gates) as read-only inputs.

**State Machine (KitRunState):** READY → EXECUTING → VERIFYING → COMPLETE/BLOCKED/FAILED (+ PAUSED, CANCELLED, RESUMING)
**Work Unit States:** NOT_STARTED → IN_PROGRESS → DONE/FAILED/SKIPPED

**Modules** (`Axion/src/core/kitControlPlane/`):
| Module | File | Purpose |
|---|---|---|
| Types | types.ts | KCP-specific types (KitRunState, WorkUnitState, GuardrailViolation) |
| State Machine | stateMachine.ts | Kit-run state transitions, validation |
| Kit Validator | validator.ts | Validate kit artifacts, schema, entrypoint, pinset |
| Work Unit Manager | workUnitManager.ts | Plan unit loading, 1-target enforcement, deterministic next |
| Verification Runner | verificationRunner.ts | Execute lint/test/build/typecheck commands |
| Result Writer | resultWriter.ts | RESULT_<UNIT_ID>.json with implementation + proof refs |
| Proof Capture | proofCapture.ts | Kit-local proof objects and proof ledger |
| Guardrails | guardrails.ts | Forbidden paths, agent restrictions, plagiarism, secrets/PII |
| Kit Run Report | kitRunReport.ts | Aggregated kit_run_report |
| Index | index.ts | Re-exports all KCP modules |

**Enforcements:** 1-target rule on plan units, read-only kit contents, guardrail violations block, non-empty proof_refs for DONE

### Maintenance Control Plane (MCP)
Lives in the target repo for post-build lifecycle management.

**State Machine (MaintenanceRunState):** PLANNED → APPLYING → VERIFYING → COMPLETE/BLOCKED/FAILED (+ PAUSED, CANCELLED, ROLLBACKING)

**Modules** (`Axion/src/core/maintenanceControlPlane/`):
| Module | File | Purpose |
|---|---|---|
| Types | types.ts | MCP-specific types (MaintenanceIntent, ScopeConstraints) |
| State Machine | stateMachine.ts | Maintenance-run state transitions |
| Dependency Manager | dependencyManager.ts | Version bumps, lockfile updates, breaking change detection |
| Migration Manager | migrationManager.ts | Migration planning, execution, backcompat checks |
| Test Maintainer | testMaintainer.ts | Regression tests, flake triage, coverage |
| Refactor Manager | refactorManager.ts | Controlled refactors with impact assessment |
| CI Maintainer | ciMaintainer.ts | CI workflow updates, doctor/verify preservation |
| AXION Compat | axionCompat.ts | AXION artifact + kit output validation |
| Maintenance Runner | maintenanceRunner.ts | Orchestrates maintenance runs end-to-end |
| Outputs | outputs.ts | MCP output artifact writers |
| Failures | failures.ts | MCP failure classification + remediation |
| Index | index.ts | Re-exports all MCP modules |

### Control Plane Registries (`Axion/registries/`)
| Registry | Description |
|---|---|
| CONTROL_PLANE_REGISTRY.json | All 3 control planes with modules, boundaries, artifact contracts |
| OPERATOR_ACTIONS_REGISTRY.json | Allowed operator actions per CP with override rules |
| FAILURE_CODES_REGISTRY.json | Failure codes (contract/verification/recoverable) with remediation templates |
| PROOF_TYPE_REGISTRY.json | Proof types (verification_log, snapshot_hash, command_output, etc.) |

### Control Plane Docs (`Axion/docs_system/CP/`)
- CP-01: Control Plane Architecture (overview, boundaries, interactions)
- CP-02: ICP Specification (inputs, state, modules, outputs, determinism, failures)
- CP-03: KCP Specification (kit-local lifecycle)
- CP-04: MCP Specification (maintenance lifecycle)
- CP-05: Determinism Guarantees (cross-cutting determinism rules)
- CP-06: Failure Semantics (cross-cutting failure handling)

### Shared Types (`Axion/src/types/controlPlane.ts`)
RunState, StageState, KitRunState, MaintenanceRunState, WorkUnitState, RiskClass, ExecutorType, FailureClassification, RunContext, Pinset, EvidencePointer, RemediationStep, AttemptRecord, OverrideRecord, OperatorActionType, RunLogEntry, ICPStageReport, ICPGateReport, StateSnapshot, FailureReport, GuardrailViolation

### Run Artifacts (new with ICP)
- `audit_log.jsonl` — Hash-chained operator action log (start_run → release_bundle)
- `run_log.jsonl` — Chronological stage_start/stage_end/info event trace

## Key Config Files
- `Axion/package.json`, `Axion/tsconfig.json`, `Axion/.gitignore`
- `Filetree.md` — Canonical file tree reference
