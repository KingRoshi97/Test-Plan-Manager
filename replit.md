# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system with a full-stack web application. It takes intake submissions through a 10-stage Mechanics pipeline (S1_INGEST_NORMALIZE → S10_PACKAGE), resolves standards, builds canonical specs, selects and renders templates, plans work, verifies proofs, runs gates, and packages everything into versioned "kits." The web dashboard provides a UI for creating assemblies, triggering pipeline runs, and browsing artifacts.

## Current State
Full Mechanics pipeline + web application layer. Pipeline: 10 stages, 8 enforced gates (G1–G8), registry-driven engines for all stages, deterministic library loader with pinned versions, proof ledger with evidence policy. Web app: Express API + React dashboard + PostgreSQL database. All stages produce real registry-driven artifacts, all 8 gates pass, 190 kit files produced.

### Intake Library (Axion/libraries/intake/)
12 files present — includes the original spec files plus the INT-01 through INT-05 formal contract files:
- `INT-01.form_spec.v1.json` — form field inventory and conditional requiredness rules
- `INT-02.intake_schema.v1.json` — machine-enforceable schema (types, requiredness, constraints)
- `INT-02.enums.v1.json` — enum value lists for INT-02
- `INT-03.validation_rules.v1.json` — deterministic validation rules with rule_id/error_code/pointers
- `INT-04.submission_record.schema.v1.json` — immutable submission record schema
- `INT-05.validation_result.schema.v1.json` — validator output contract (is_valid, errors[], warnings[])
- `INT-05.error_code_catalog.v1.json` — locked error code catalog
- `INT-05.determinism_rules.v1.json` — ordering and pointer determinism rules

### Canonical Library (Axion/libraries/canonical/)
11 files — 8 new authoritative CAN-01/02/03 contract files + 3 legacy files kept for backward compat:
- `CAN-01.canonical_spec.schema.v1.json` — JSON Schema (draft/2020-12) for the full canonical spec artifact; defines meta/routing/constraints/entities/rules/unknowns/index with `$defs` for all 8 entity types
- `CAN-01.entity_relationships.v1.json` — 8 entity types, 3 relationship edges (WF→ROLE, PERM→ROLE, SCREEN→ROLE), 9 required indexes, 2 required cross-maps
- `CAN-02.id_rules.v1.json` — 10 entity type prefixes/patterns (ROLE/FEAT/WF/PERM/SCREEN/DATA/OP/INTG/UNK/SPEC), 9 uniqueness collections, generation block with padding rules
- `CAN-02.reference_integrity_rules.v1.json` — 3 reference fields with required/optional flag, 2 validation rules (CAN02-REF-01/02), determinism sort order
- `CAN-02.duplicate_truth_rules.v1.json` — duplicate truth definitions for ROLE/FEAT/WF with fingerprint fields and error codes
- `CAN-03.unknown.schema.v1.json` — JSON Schema for unknown objects (unknown_id/area/summary/impact/blocking/needs/refs)
- `CAN-03.unknown_policy.v1.json` — blocking thresholds, severity mapping, required fields, determinism sort order
- `CAN-03.unknown_index_rules.v1.json` — required indexes (unknowns_by_id) and cross-maps (unknowns_by_area) for canonical spec

**Code wired to CAN-02:** `validate.ts` and `specBuilder.ts` now load from `CAN-02.id_rules.v1.json` (10 entity types) and `CAN-02.reference_integrity_rules.v1.json` (split ref integrity), with fallback to legacy files.

### Standards Library (Axion/libraries/standards/)
5 new STD contract files + 7 new starter pack files + updated index (10 total packs, 31 rules in snapshot):

**Contract files:**
- `STD-01.categories.v1.json` — locked set of 7 categories (STD-CAT-01 through STD-CAT-07)
- `STD-01.pack_contract.v1.json` — required pack metadata fields, applies_when model, required rule fields, rule_type enum, 3 structural constraints
- `STD-01.library_index.schema.v1.json` — index minimum required fields including `rule_ids` and `rule_id_to_category`
- `STD-02.resolution_rules.v1.json` — deterministic selection/merge rules: sort by priority_desc/pack_id_asc, fixed wins over configurable, no cross-category overlap
- `STD-03.snapshot.schema.v1.json` — snapshot artifact format: required top-level fields, inputs_required, resolved_rule_required, determinism rules

**Starter packs (Axion/libraries/standards/packs/):** 7 new packs alongside 3 legacy packs
- `CORE@1.0.0` (STD-CAT-01, priority 1000) — 3 fixed + 1 configurable: deterministic stages, schema validation, pinning, hashing policy
- `DESIGN_BASE@1.0.0` (STD-CAT-02, priority 500) — UI design section required for UI builds
- `SEC_BASE@1.0.0` (STD-CAT-03, priority 800) — no secrets in artifacts (fixed), auth test requirement (configurable)
- `QA_BASE@1.0.0` (STD-CAT-04, priority 700) — minimum test evidence
- `OPS_CONDITIONAL@1.0.0` (STD-CAT-05, priority 400) — telemetry required when `data_enabled: true`
- `CONTRACTS_CONDITIONAL@1.0.0` (STD-CAT-06, priority 450) — interface contracts required when `integrations_enabled: true`
- `ANALYTICS_CONDITIONAL@1.0.0` (STD-CAT-07, priority 350) — analytics plan required when `build_target: production`

**Index updated:** `standards_index.json` now has 10 packs total, `rule_id_to_category` map at top level, and `rule_ids[]` per new pack entry alongside `file_path` (required by registryLoader.ts).

### Template Rendering (evidence.ts)
`writeRenderedDocs` loads `intake/normalized_input.json` to supply real `project_name`, `project_overview`, routing fields, and constraint sections (nfr, auth, data, integrations, delivery) to the rendering context. Eliminates `__AXION_VALUE__` sentinel from rendered output.

## Repo Layout
```
/Axion/           # Mechanics backbone (CLI pipeline, gates, templates, knowledge library)
/App/             # React frontend (Vite + TailwindCSS + React Query)
/server/          # Express API server (routes, storage, pipeline runner)
/shared/          # Shared types (Drizzle schema, DB types)
drizzle.config.ts # Drizzle ORM config
package.json      # Root package.json with all dependencies
```

## Web Application

### Tech Stack
- Express 5 (API server)
- React 19 + Vite 7 (frontend)
- TailwindCSS v4 (styling)
- Drizzle ORM + PostgreSQL (database)
- React Query (data fetching)
- wouter (routing)
- lucide-react (icons)

### Database Schema (shared/schema.ts)
- `assemblies` — project builds with status, preset, verification, run metrics
- `pipeline_runs` — individual pipeline executions with S1–S10 stage statuses (JSON)
- `module_statuses` — per-module stage tracking
- `reports` — gate reports, run completion reports

### API Endpoints (server/routes.ts)
- `GET/POST /api/assemblies` — list/create assemblies
- `GET/DELETE /api/assemblies/:id` — get/delete assembly (includes runs)
- `POST /api/assemblies/:id/run` — trigger pipeline execution
- `GET /api/assemblies/:id/runs` — list runs for assembly
- `GET /api/assemblies/:id/runs/:runId` — get run detail
- `GET /api/files?dir=` — browse artifact directories
- `GET /api/files/{path}` — read artifact file content
- `GET /api/health` — system health (stages, gates, KIDs, recent runs)
- `GET /api/config` — pipeline configuration
- `GET /api/status` — assembly status summary
- `GET /api/reports/:assemblyId` — get reports

### Pipeline Runner (server/pipeline-runner.ts)
- Spawns `npx tsx Axion/src/cli/axion.ts run` as child process
- Parses stdout for stage progress and gate results
- Updates `pipeline_runs` and `assemblies` in real-time
- Stores run_id and run artifacts path on completion

### Frontend Pages (App/src/pages/)
- `/` — Dashboard: assembly cards with status, metrics, actions
- `/new` — New Assembly: form with project name, idea, preset, start-immediately option
- `/assembly/:id` — Assembly detail: pipeline stage timeline, gate results, artifact browser, run history
- `/files` — File browser: navigate run artifact directories
- `/health` — System health: pipeline, knowledge library, templates, recent runs
- `/logs` — Run logs viewer with status filtering
- `/docs` — Document inventory: 177 templates + 395 KIDs
- `/export` — Export completed kit bundles

### Development
```bash
npm run dev          # Start dev server (Express + Vite on port 5000)
npm run build        # Build React app for production
npm run db:push      # Push database schema
```

## Mechanics Pipeline (Axion/)

### Architecture
The pipeline is fully registry-driven with deterministic library loading:
- **Library Loader** (`src/core/libraries/loader.ts`): Loads pinned libraries from `PINS_DEFAULT.v1.json` → `library_index.v1.json` → `schema_registry.v1.json`. Strict version matching, optional hash enforcement.
- **Zod Schemas** (`src/core/schemas/index.ts`): Runtime validators for all artifact types (intake, canonical, standards, templates, planning, proof, kit).
- **Registry files** (`libraries/`): ~30 versioned JSON contract files across intake, canonical, standards, templates, planning, gates, verification, kit, orchestration, policy, audit, telemetry domains.

### Project Structure
- `Axion/src/` — TypeScript source
  - `cli/` — CLI entry (`axion.ts`) and commands (init, runControlPlane, runStage, planWork, runGates, packageKit, verify, writeState, writeProof, validateIntake, resolveStandards, buildSpec, fillTemplates, generateKit, exportBundle, release, repro)
  - `core/` — Domain modules:
    - Pipeline: intake (normalizer, validator, submissionRecord), standards (registryLoader, applicability, resolver, snapshot), canonical (specBuilder, unknowns, validate), templates (selector, renderer, completeness, evidence), planning (workBreakdown, acceptanceMap, coverage), kit (build), state
    - Enforcement: controlPlane, gates (evaluator, evidencePolicy, run, report), verification (runner, completion), proofLedger (ledger), proof (create, registryLoader), evidence (pointers)
    - Extended: artifactStore, cache, diff, repro, refs, coverage, scanner, taxonomy, ids
  - `types/` — Shared type definitions (RunManifest, StageRun, StageReport, StageId, ArtifactIndexEntry, etc.)
  - `utils/` — Utilities (writeJson, readJson, appendJsonl, ensureDir, sha256, isoNow, NotImplementedError, canonicalJson)
- `Axion/.axion/` — Runtime artifact root (gitignored, created by `axion init`)
- `Axion/docs_system/` — 50 system docs across 12 domains
- `Axion/libraries/` — Persistent system assets:
  - `intake/` — enums.v1.json, schema.v1.json, rules.v1.json, form_version.v1.json
  - `canonical/` — id_rules.v1.json, spec.schema.v1.json, unknowns.schema.v1.json
  - `standards/` — standards_index.json, resolver_rules.v1.json + 3 packs
  - `templates/` — template_index.json, placeholder_catalog.v1.json + 8 template groups (177 total .md files)
  - `planning/` — work_breakdown.schema.v1.json, acceptance_map.schema.v1.json, sequencing_policy.v1.json
  - `gates/` — gate_dsl.schema.v1.json
  - `verification/` — proof_log.schema.v1.json, command_runs.schema.v1.json
  - `kit/` — kit_tree.schema.v1.json, kit_manifest.schema.v1.json, kit_entrypoint.schema.v1.json, kit_versions.schema.v1.json
  - `orchestration/` — pipeline_definition.schema.v1.json, stage_io_contract.schema.v1.json, stage_report.schema.v1.json, run_manifest.schema.v1.json
  - `policy/` — risk_classes.v1.json, override_policy.v1.json, override_policy.schema.v1.json
  - `audit/` — operator_actions_ledger.schema.v1.json
  - `telemetry/` — event.schema.v1.json, run_metrics.schema.v1.json, sink_policy.v1.json
  - `library_index.v1.json` — single registry for versioned libraries
  - `schema_registry.v1.json` — single registry for JSON Schemas
  - `knowledge/` — Knowledge Library (395 KIDs across 3 pillars)
- `Axion/registries/` — Global registry JSON files (GATE_REGISTRY, PINS_DEFAULT, PROOF_TYPE_REGISTRY, pipelines, gates)
- `Axion/features/` — 17 feature packs (FEAT-001 through FEAT-017)
- `Axion/test/` — Unit tests, integration tests, fixtures, helpers

### CLI Commands
```bash
cd Axion
npx tsx src/cli/axion.ts init                                  # Initialize .axion/
npx tsx src/cli/axion.ts run                                   # Full run: all 10 stages
npx tsx src/cli/axion.ts run stage <run_id> <stage_id>         # Execute a single stage
npx tsx src/cli/axion.ts run gates <run_id> <stage_id>         # Run gates for a stage
```

### Pipeline Stages
S1_INGEST_NORMALIZE → S2_VALIDATE_INTAKE → S3_BUILD_CANONICAL → S4_VALIDATE_CANONICAL → S5_RESOLVE_STANDARDS → S6_SELECT_TEMPLATES → S7_RENDER_DOCS → S8_BUILD_PLAN → S9_VERIFY_PROOF → S10_PACKAGE

### Stage Details
| Stage | What It Does |
|---|---|
| S1_INGEST_NORMALIZE | Generates/loads raw submission → normalizes (stable keys, enum normalization, defaults) → writes submission.json, normalized_input.json, submission_record.json, validation_result.json |
| S2_VALIDATE_INTAKE | Schema validates normalized input against Zod + intake rules → validation_report.json |
| S3_BUILD_CANONICAL | Builds CanonicalSpec from normalized input (entities: roles, features, workflows, permissions with generated IDs) → canonical_spec.json + unknowns.json |
| S4_VALIDATE_CANONICAL | Validates canonical spec (ID format enforcement, reference integrity, required sections) → canonical_validation_report.json |
| S5_RESOLVE_STANDARDS | Loads standards registry → evaluates pack applicability → resolves with precedence/conflict handling → applicability_output.json + resolved_standards_snapshot.json |
| S6_SELECT_TEMPLATES | Registry-driven template selection with rationale tokens and deterministic selection hash → selection_result.json |
| S7_RENDER_DOCS | Envelope-first rendering with placeholder resolution tracking → rendered_docs/, render_envelopes.json, template_completeness_report.json |
| S8_BUILD_PLAN | Generates work breakdown (PLAN-01: work_breakdown_id, units, dependency_graph, unit_index), acceptance map (PLAN-02: acceptance_map_id, acceptance_items with hard_gate/soft_gate, proof_required), coverage report, state snapshot (STATE-01: meta, pointers, unit_status[], acceptance_status[]) |
| S9_VERIFY_PROOF | Collects gate reports → runs verification → creates proof objects → appends proof_ledger.jsonl → validates evidence pointers → completion_report.json |
| S10_PACKAGE | Builds real kit bundle from upstream artifacts (canonical, standards, templates, planning, gates, proof) with version pins from loader → kit_manifest.json, entrypoint.json, version_stamp.json, packaging_manifest.json |

### Stage→Gate Mapping
| Stage | Gate | Enforced |
|---|---|---|
| S2_VALIDATE_INTAKE | G1_INTAKE_VALIDITY | Yes |
| S4_VALIDATE_CANONICAL | G2_CANONICAL_INTEGRITY | Yes |
| S5_RESOLVE_STANDARDS | G3_STANDARDS_RESOLVED | Yes |
| S6_SELECT_TEMPLATES | G4_TEMPLATE_SELECTION | Yes |
| S7_RENDER_DOCS | G5_TEMPLATE_COMPLETENESS | Yes |
| S8_BUILD_PLAN | G6_PLAN_COVERAGE | Yes |
| S9_VERIFY_PROOF | G7_VERIFICATION | Yes |
| S10_PACKAGE | G8_PACKAGE_INTEGRITY | Yes |

### Gate Engine
- GATE_REGISTRY.json → registry loader → path templating → evaluator (6 ops) → gate report writer
- 6 evaluator ops: file_exists, json_valid, json_has, json_eq, coverage_gte, verify_hash_manifest
- Evidence policy: gates require associated proof types from PROOF_TYPE_REGISTRY
- Gate reports include evidence completeness sections

### Template System
- Selector: `libraries/templates/template_index.json` (177 templates) → registry-driven selection with rationale
- Renderer: envelope-first rendering with `{{dotted.path}}` placeholder resolution
- Completeness: required templates block on unresolved required placeholders
- Evidence: writes selection_result.json, render_envelopes.json, template_completeness_report.json, rendered docs

### Proof & Verification
- Proof Ledger: append-only proof_ledger.jsonl linking proofs to run_id, gate_id, acceptance_refs
- Verification Runner: collects gate reports, verifies all passed, writes verification_run_result.json
- Evidence Pointers: dereferences file pointers, verifies files exist, optional hash match
- Completion Report: aggregated verification status

### Kit Packaging (S10) — KIT-01 compliant
Produces full `agent_kit/` folder hierarchy inside `kit/bundle/`:
- `00_START_HERE.md` (KIT-03: purpose, reading order, execution loop, completion definition)
- `00_KIT_MANIFEST.md` (KIT-02: fenced JSON with reading_order, core_artifacts map, proof, versions)
- `00_KIT_INDEX.md` (table of contents)
- `00_VERSIONS.md` (KIT-04: V-01 through V-07 version categories)
- `00_RUN_RULES.md` (no claims without proof, follow work breakdown)
- `00_PROOF_LOG.md` (empty initial proof log)
- `01_core_artifacts/` — 6 required JSONs (normalized_input, standards_snapshot, canonical_spec, work_breakdown, acceptance_map, state_snapshot)
- `10_app/` — 12 domain slot folders (01_requirements through 12_analytics), each with rendered templates or `00_NA.md`

## Knowledge Library (`Axion/libraries/knowledge/`)
Structured, policy-governed knowledge base providing KID files (Knowledge Items) across three pillars.

### Pillars (395 KID files total)
- **IT_END_TO_END** (254 KIDs): 19 domains across 4 groups
  - 01_foundations: networking, operating_systems, security_fundamentals, compute_virtualization, storage_fundamentals
  - 02_software_delivery: architecture_design, apis_integrations, ci_cd_devops, testing_qa, observability_sre
  - 03_data_systems: databases, distributed_systems, caching, search_retrieval
  - 04_platform_ops: cloud_fundamentals, identity_access_management, compliance_governance, release_management, finops_cost
- **INDUSTRY_PLAYBOOKS** (58 KIDs): healthcare, finance, retail_ecommerce, logistics_supply_chain, government_public_sector
- **LANGUAGES_AND_LIBRARIES** (83 KIDs): javascript_typescript (+ nodejs, react, nextjs), python, go, rust, databases/postgres, solidity_evm

### KID File Contract
- YAML frontmatter: kid, title, type, pillar, domains, tags, maturity, use_policy, executor_access, license
- Sections: Summary, When to use, Do/Don't, Core content, Links, Proof/confidence
