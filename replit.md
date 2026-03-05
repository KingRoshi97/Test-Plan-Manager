# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system with a full-stack web application. It takes intake submissions through a 10-stage Mechanics pipeline (S1_INGEST_NORMALIZE → S10_PACKAGE), resolves standards, builds canonical specs, selects and renders templates, plans work, verifies proofs, runs gates, and packages everything into versioned "kits." The web dashboard provides a UI for creating assemblies, triggering pipeline runs, and browsing artifacts.

## Current State
Full Mechanics pipeline + web application layer with three formal control planes (ICP/KCP/MCP), three agent types (IA/BA/MA), and OpenAI autofill integration. Pipeline: 10 stages, 8 enforced gates (G1–G8), registry-driven engines for all stages, deterministic library loader with pinned versions, proof ledger with evidence policy. Web app: Express API + React dashboard + PostgreSQL database. All stages produce real registry-driven artifacts, all 8 gates pass, 193 kit files produced.

### Control Planes
- **ICP (Internal Control Plane)** — `Axion/src/core/controlPlane/`: Run orchestrator (api.ts), model/store (model.ts, store.ts), policies (policies.ts), releases (releases.ts), pins (pins.ts), audit (audit.ts). States: QUEUED → RUNNING → GATED → (FAILED | RELEASED) → ARCHIVED. CLI wired via RunController.
- **KCP (Kit Control Plane)** — `Axion/src/core/kcp/`: 10 modules — model, store, controller, validator, unitManager, verificationRunner, resultWriter, proofCapture, guardrails, runReport. States: READY → EXECUTING → VERIFYING → (BLOCKED | FAILED | COMPLETE). Enforces kit-local rules during build execution.
- **MCP (Maintenance Control Plane)** — `Axion/src/core/mcp/`: 10 modules — model, store, controller, dependencyManager, migrationManager, testMaintainer, refactorManager, ciMaintainer, axionIntegration, modeRunner. States: PLANNED → APPLYING → VERIFYING → (BLOCKED | FAILED | COMPLETE). Handles repo maintenance operations.

### Agent Types
- **IA (Internal Agent)** — `Axion/src/core/agents/internal.ts`: Produces AXION outputs under ICP governance (intake, canonical build, standards, template selection, planning, kit preparation).
- **BA (Build Agent)** — `Axion/src/core/agents/build.ts`: Executes Agent Kit under KCP governance (1-target-per-unit, RESULT artifacts, verification, reruns).
- **MA (Maintenance Agent)** — `Axion/src/core/agents/maintenance.ts`: Performs repo maintenance under MCP governance (dependency upgrades, migrations, test hardening, CI, rollback).

### Kit Template Slot Mapping Fix
`Axion/src/core/kit/build.ts` — SUBDIR_TO_SLOT lookup table maps all 77 template prefix groups to correct domain slots (01_requirements through 12_analytics). Zero fallthrough to `11_documentation`.

### Feature Registry UI
- `GET /api/features` — Returns all 17 feature pack registries from `Axion/features/FEAT-*/00_registry.json`
- `GET /api/features/:id` — Returns registry + all 8 spec file contents + reverse dependencies
- `/features` page — Feature Registry Dashboard grouped by category (infrastructure, core-logic, interface, security) with status badges, module counts, dependency counts
- `/features/:id` page — Feature detail inspector with tabbed spec viewer (Contract, Errors, Security, Gates & Proofs, Tests, Observability, Docs, API), source modules list, dependency/reverse-dependency links, gate badges
- Health page shows Feature Packs summary card with total/active counts and category breakdown

### OpenAI Autofill Integration
- `server/openai.ts` — OpenAI client using Replit AI Integrations (AI_INTEGRATIONS_OPENAI_BASE_URL + AI_INTEGRATIONS_OPENAI_API_KEY)
- `POST /api/autofill` — returns structured suggestions for intake sections based on routing + project info
- Opt-in toggle on Page 0 (routing); "AI-drafted" badge on auto-filled fields; all values editable

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
- `assemblies` — project builds with status, preset, verification, run metrics, `intakePayload` (JSONB, nullable)
- `pipeline_runs` — individual pipeline executions with S1–S10 stage statuses (JSON)
- `module_statuses` — per-module stage tracking
- `reports` — gate reports, run completion reports

### API Endpoints (server/routes.ts)
- `GET/POST /api/assemblies` — list/create assemblies (includes latest pipeline stage data)
- `GET/DELETE /api/assemblies/:id` — get/delete assembly (includes runs)
- `PATCH /api/assemblies/:id` — update assembly fields (projectName, idea, preset, intakePayload, config)
- `POST /api/assemblies/:id/run` — trigger pipeline execution
- `GET /api/assemblies/:id/kit` — download agent kit as ZIP archive
- `GET /api/assemblies/:id/runs` — list runs for assembly
- `GET /api/assemblies/:id/runs/:runId` — get run detail
- `GET /api/files?dir=` — browse artifact directories
- `GET /api/files/{path}` — read artifact file content
- `GET /api/health` — system health (stages, gates, KIDs, system/orchestration library stats, recent runs)
- `GET /api/config` — pipeline configuration (loads from orchestration library registry with fallback)
- `GET /api/status` — assembly status summary
- `GET /api/reports/:assemblyId` — get reports
- `GET /api/system` — system library overview (groups, schema/registry/doc counts)
- `GET /api/system/schemas` — all 14 system schemas with content
- `GET /api/system/registries` — all 6 registries with content
- `GET /api/system/registries/:name` — single registry by name
- `GET /api/system/docs` — all markdown documents with frontmatter
- `GET /api/system/docs/:filename` — single document by filename
- `GET /api/orchestration` — orchestration library overview (groups, schema/registry/doc/stage counts)
- `GET /api/orchestration/schemas` — all 6 orchestration schemas with content
- `GET /api/orchestration/registries` — all 3 registries with content
- `GET /api/orchestration/registries/:name` — single registry by name
- `GET /api/orchestration/docs` — all documents with frontmatter
- `GET /api/orchestration/docs/:filename` — single document by filename
- `POST /api/uploads` — upload files (multipart/form-data, up to 10 files, 50MB limit per file)
- `GET /api/uploads/:id` — download uploaded file
- `DELETE /api/uploads/:id` — delete uploaded file

### Pipeline Runner (server/pipeline-runner.ts)
- Spawns `npx tsx Axion/src/cli/axion.ts run` as child process
- Parses stdout for stage progress and gate results
- Updates `pipeline_runs` and `assemblies` in real-time
- Stores run_id and run artifacts path on completion
- Writes `intakePayload` to `.axion/runs/<run_id>/intake/raw_submission.json` before S1 stage if available

### Intake Wizard (App/src/components/intake-wizard.tsx)
- 11-page multi-step wizard per INT-01 form spec (Pages 0-10)
- Page components in `App/src/components/intake/` (page-routing, page-project, page-intent, page-design, page-functional, page-data, page-auth, page-integrations, page-nfr, page-category, page-final)
- Shared `IntakeData` type in `App/src/components/intake/types.ts`
- Per-page validation (routing fields required on P0, project name/problem statement on P1, 3 checkboxes on P10)
- Conditional pages: P5 (data) gated by manages_data toggle, P6 (auth) gated by requires_auth, P7 (integrations) gated by has_integrations
- P9 renders category-specific variant (software/data/docs/other) based on P0 routing.category
- On submit: builds INT-02-compliant intakePayload, creates assembly, optionally starts pipeline

### Frontend Pages (App/src/pages/)
- `/` — Dashboard: command center with stat pills, quick action cards (latest run, health, features), sortable assembly table with pipeline progress dots
- `/new` — New Assembly: 11-page multi-step intake wizard (INT-01 spec) with routing, project basics, intent, design, functional spec, data model, auth, integrations, NFRs, category-specific, and final verification
- `/assembly/:id` — Assembly workspace with 5 tabs: Overview (project details, pipeline progress, quick actions), Pipeline (stage timeline, run history), Intake (editable intake form with Save & Re-run), Artifacts (file browser with kit download), Config (assembly settings, danger zone)
- `/files` — File browser: navigate run artifact directories
- `/health` — System health: pipeline, knowledge library, templates, recent runs
- `/logs` — Run logs viewer with status filtering
- `/system` — System Library: 3 tabs (Documents, Schemas, Registries) for SYS-0 through SYS-7
- `/orchestration` — Orchestration Library: 4 tabs (Pipeline, Documents, Schemas, Registries) for ORC-0 through ORC-7, pipeline stage visualization
- `/docs` — Document inventory: 533 templates + 395 KIDs
- `/export` — Export completed kit bundles

### Reusable Components
- `App/src/components/pipeline-progress.tsx` — Compact horizontal pipeline visualization (10 stage dots with tooltips, sm/md sizes)
- `App/src/components/app-sidebar.tsx` — Navigation sidebar with "Control Suite" branding

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
  - `templates/` — template_index.json, placeholder_catalog.v1.json + 77 template groups across 8 categories (533 total .md files)
  - `planning/` — work_breakdown.schema.v1.json, acceptance_map.schema.v1.json, sequencing_policy.v1.json
  - `gates/` — gate_dsl.schema.v1.json
  - `verification/` — proof_log.schema.v1.json, command_runs.schema.v1.json
  - `kit/` — kit_tree.schema.v1.json, kit_manifest.schema.v1.json, kit_entrypoint.schema.v1.json, kit_versions.schema.v1.json
  - `orchestration/` — Pipeline execution contracts and run lifecycle (ORC-0 through ORC-7). See Orchestration Library section below.
  - `policy/` — risk_classes.v1.json, override_policy.v1.json, override_policy.schema.v1.json
  - `audit/` — operator_actions_ledger.schema.v1.json
  - `telemetry/` — event.schema.v1.json, run_metrics.schema.v1.json, sink_policy.v1.json
  - `system/` — Control-plane configuration and runtime contracts (SYS-0 through SYS-7). See System Library section below.
  - `library_index.v1.json` — single registry for versioned libraries
  - `schema_registry.v1.json` — single registry for JSON Schemas
  - `knowledge/` — Knowledge Library (395+ KIDs across 3 pillars)
- `Axion/registries/` — Global registry JSON files (GATE_REGISTRY, PINS_DEFAULT, PROOF_TYPE_REGISTRY, pipelines, gates)
- `Axion/features/` — 17 feature packs (FEAT-001 through FEAT-017), all `status: "active"` with production-quality specs
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
- **Source Templates**: `libraries/templates/` (533 TMP-02 contract files in 8 categories: Product Definition, System Architecture, Experience Design, Data & Information, Integrations & External Services, Operations & Reliability, Security Privacy & Compliance, Application Build). These are READ-ONLY — never modified by runs. Each contains: Header Block, Purpose, Inputs Required, Required Fields, Optional Fields, Rules, Output Format, Cross-References, Skill Level Rules, Unknown Handling, Completeness Gate.
- **Filler Engine**: `filler.ts` reads each template's Output Format (Section 7) and produces a filled document using canonical spec entities (features, roles, workflows, permissions), standards, constraints, and intake data. Supports 5 placeholder types: direct, array, derived, optional, unknown-allowed. TMP-04 precedence: Canonical Spec → Standards → Work Breakdown → Acceptance Map.
- **Selector**: `template_index.json` → registry-driven selection with rationale
- **Rendered Output**: Filled documents written to `.axion/runs/<runId>/templates/rendered_docs/` — contain real project data (entity tables, requirements, cross-references), not template instruction text
- **Completeness**: checks filled content quality; UNKNOWN_ALLOWED fields don't block
- **Read-Only Guard**: `assertNotTemplateLibrary()` prevents any write to `libraries/templates/`; IA guardrail IA-G07 enforces at agent level
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
Structured, policy-governed knowledge base providing KID files (Knowledge Items) across three pillars with full KL-1 through KL-7 contract system.

### Structure
- `contracts/` — 76 contract files (KL-1 through KL-7): schemas, rules, validation checklists, gate specs
- `INDEX/` — Registries: knowledge.index.json (395 items), taxonomy.json (216 domains, 362 tags, 30 industries, 23 stacks), bundles.index.json (10 bundles), sources.index.json, deprecations.json, changelog.md
- `PILLARS/` — 1,923 directories across 3 pillars with 395 KID files
- `POLICIES/` — 5 policy files aligned with KL-4/KL-5 contracts
- `BUNDLES/` — 10 bundle files (by run_profile, risk_class, executor)
- `TEMPLATES/` — 8 templates including KID frontmatter, selection input/output, ingestion checklist, MVKL starter set
- `REUSE/` — Allowlist and reuse log
- `OUTPUTS/` — Selection and export schemas

### Pillars (395 KID files total)
- **IT_END_TO_END** (254 KIDs): 92 domains across 8 groups (01_foundations through 08_security_operations_and_compliance)
- **INDUSTRY_PLAYBOOKS** (58 KIDs): 30 industries across 4 groups (01_regulated_industries through 04_emerging_tech_industries)
- **LANGUAGES_AND_LIBRARIES** (83 KIDs): 94 domains across 9 groups (01_programming_languages through 09_video_streaming_and_realtime)

### KID File Contract (KL-1)
- YAML frontmatter: kid, title, type, pillar, domains[], subdomains[], tags[], maturity, use_policy, executor_access, license, allowed_excerpt {max_words, max_lines}, supersedes, deprecated_by, created_at, updated_at, owner
- Required sections (exact order): Summary, When to use, Do / Don't, Core content, Links, Proof / confidence
- Types: concept, pattern, procedure, checklist, reference, pitfall, example, glossary_term
- Maturity: draft → reviewed → verified → golden
- Use policies: pattern_only (default), reusable_with_allowlist, restricted_internal_only

### Enforcement Gates (KL-5)
- KL-GATE-01: Referenced KIDs exist in KNOWLEDGE_INDEX
- KL-GATE-02: KID metadata valid per KL-1.3
- KL-GATE-03: Deprecated KIDs not used unless repro mode
- KL-GATE-04: External executor cannot access internal_only KIDs
- KL-GATE-05: Kit export excludes restricted content
- KL-GATE-06: Allowlisted reuse requires reuse_log
- KL-GATE-07: Block verbatim copying beyond excerpt limits
- KL-GATE-08: Production runs require maturity >= reviewed

### Knowledge Library Integration (IA wiring)
The Knowledge Library is wired into the IA through three integration points:

1. **Autofill (OpenAI)** — `server/openai.ts` calls `resolveKnowledge()` before each OpenAI request, injects relevant KID summaries into the system prompt so suggestions are scoped by domain-relevant patterns, checklists, and pitfalls. Section-specific domain filtering via `SECTION_KNOWLEDGE_DOMAINS` map.

2. **Template Selection (S6)** — `Axion/src/core/templates/selector.ts` accepts optional `KnowledgeContext`, annotates templates with `knowledge_boost` rationale token when template domains overlap with resolved KID domains. Does NOT override `applies_when` constraints — knowledge boost is informational only, maintaining registry-driven selection integrity.

3. **Template Filling (S7)** — `Axion/src/core/templates/filler.ts` accepts `knowledge?: KnowledgeContext` in `FillContext`. `buildHeadingContent()` wraps inner content with `renderKnowledgeReferences()`, appending matching KID citations (up to 5 per heading) with maturity badges and content snippets.

**Knowledge Resolver** (`Axion/src/core/knowledge/resolver.ts`):
- `resolveKnowledge(baseDir, routing, constraints)` → loads index, matches bundle by run_profile, filters KIDs by domain, returns `KnowledgeContext`
- `summarizeKnowledgeForPrompt(knowledge, maxKids)` → formats KIDs for OpenAI system prompt injection
- `getKnowledgeCitationsForDomain(knowledge, domainKeywords)` → per-heading KID lookup

**IA Registration** (`Axion/src/core/agents/internal.ts`):
- Capability: `knowledge_resolution`
- Constraint: `must_emit_knowledge_citations`
- Guardrail: `IA-G08` — knowledge citations must be emitted when KID content is used
- Evidence: `buildEvidenceRecord()` now accepts optional `knowledgeCitations[]`

**Reports** include knowledge fields:
- `selection_report.json`: `knowledge_citations[]`, `knowledge_boosted_templates[]`
- `render_report.json`: `knowledge_citations[]`, `knowledge_bundle`, `knowledge_domains_used[]`

## System Library (`Axion/libraries/system/`)
Control-plane configuration and runtime contracts for Axion. Defines the stable "operating environment" that every run depends on.

### Structure (SYS-0 through SYS-7)
- **SYS-0**: Purpose + boundaries — what system/ governs (in scope) and what it does not (out of scope), boundary checklist
- **SYS-1**: Workspace / Project model — workspace, project, and profile entities; workspace.v1 and project.v1 schemas; run_profiles registry; determinism rules
- **SYS-2**: Pin / Lock policies — deterministic resolution via pins (explicit version refs) and locks (enforcement rules); pin_policy.v1 and pin_set.v1 schemas; resolution rules (workspace → project → run-level)
- **SYS-3**: Adapter manager — capability discovery for execution environments (local/Replit/CI/container); capability_registry.v1, adapter_profile.v1, command_policy.v1 schemas; capabilities registry
- **SYS-4**: Quotas + rate limits — per project/profile constraints (runs/day, tokens, compute, storage, network); quota_set.v1 and quota_profile_modifiers.v1 schemas; starter quota sets
- **SYS-5**: Notification routing — deterministic event→destination routing with throttle/dedupe; notification_event_types.v1, notification_destinations.v1, notification_routes.v1 schemas and registries
- **SYS-6**: Policy engine hooks — how runtime invokes policy at 6 hook points (RUN_START, PIN_RESOLUTION, ADAPTER_SELECTION, QUOTA_CHECK, GATE_OVERRIDE, KIT_EXPORT); policy_hook_request.v1 and policy_hook_decision.v1 schemas
- **SYS-7**: Minimum viable set — required files inventory, definition of done checklist, minimal folder tree

### Subdirectories
- `schemas/` — 14 JSON Schema files (workspace, project, pin_policy, pin_set, capability_registry, adapter_profile, command_policy, quota_set, quota_profile_modifiers, notification_event_types, notification_destinations, notification_routes, policy_hook_request, policy_hook_decision)
- `registries/` — 6 starter registry files (run_profiles, capabilities, quota_sets, notification_event_types, notification_destinations, notification_routes)

### Runtime Integration
- **Loader module**: `Axion/src/core/system/loader.ts` — loads and caches all 6 registries, exports typed accessors:
  - `loadSystemLibrary(repoRoot)` — returns `{ profiles, capabilities, quotaSets, eventTypes, destinations, routes }`
  - `getRunProfile(repoRoot, profileId)` — resolve a run profile from the registry
  - `checkQuota(repoRoot, quotaSetId, metric, currentValue)` — check if a metric exceeds its quota limit
  - `resolveNotificationRoutes(repoRoot, eventType)` — find matching notification routes for an event
  - `evaluatePolicyHook(hookPoint, context)` — invoke policy at 6 hook points (currently returns ALLOW by default)
  - `loadSystemDocs/loadSystemSchemas/loadSystemRegistries` — read files for API/UI consumption
- **ICP wiring**: `RunController.createRun()` resolves `system_profile` from run_profiles registry, invokes `evaluatePolicyHook("RUN_START")`, sets `quota_set` on the run. `completeRun()` invokes `evaluatePolicyHook("KIT_EXPORT")` before releasing.
- **ICPRun model**: Added optional `system_profile?: string` and `quota_set?: string` fields
- **API**: 6 new `/api/system/*` endpoints expose system library data to the UI
- **UI**: `/system` page with 3 tabs (Documents, Schemas, Registries), overview cards, expandable content viewers

### Key ID patterns
- Workspace: `WS-[A-Z0-9]{6,}`
- Project: `PRJ-[A-Z0-9]{6,}`
- Profile: `PROFILE-[A-Z0-9_]+`
- Pin policy: `PINPOL-[A-Z0-9]{6,}`
- Pin set: `PINSET-[A-Z0-9]{6,}`
- Adapter profile: `ADP-[A-Z0-9]{6,}`
- Capability: `CAP-[A-Z0-9_]+`
- Command policy: `CMDPOL-[A-Z0-9]{6,}`
- Quota set: `QUOTA-[A-Z0-9]{6,}`
- Destination: `DEST-[A-Z0-9]{4,}`
- Route: `ROUTE-[A-Z0-9]{4,}`
- Policy request: `POLREQ-[A-Z0-9]{6,}`
- Policy decision: `POLDEC-[A-Z0-9]{6,}`

## Orchestration Library (`Axion/libraries/orchestration/`)
Pipeline execution contracts and run lifecycle definitions. Defines the authoritative model for pipeline stages, IO contracts, run manifests, stage reports, and rerun/resume rules.

### Structure (ORC-0 through ORC-7)
- **ORC-0**: Purpose + boundaries — what orchestration/ governs (pipeline execution contract) and boundary checklist
- **ORC-1**: Pipeline definition model — stages, ordering, activation rules, gating points; `pipeline_definition.v1.schema.json`; starter pipeline `PIPE-AXION` with 11 stages (S0-S10); determinism rules; validation checklist
- **ORC-2**: Stage IO contracts — consumes/produces model; `stage_io_contract.v1.schema.json` and `stage_io_registry.v1.schema.json`; 15 IO contracts in starter registry; determinism rules
- **ORC-3**: Run manifest format — single authoritative run record; `run_manifest.v1.schema.json`; append-only event semantics; invariants
- **ORC-4**: Stage report schema — standard report per stage; `stage_report.v1.schema.json`; example template; determinism rules
- **ORC-5**: Rerun/resume rules — deterministic resume, stage rerun, partial run; `rerun_request.v1.schema.json`; rerun policies registry with downstream invalidation lists; invariants; manifest event requirements
- **ORC-6**: Orchestration gates (ORC-GATE-01 through 06) — stage order integrity, consumes/produces validation, report emission, manifest coherence, rerun invariants; gate spec JSON; evidence format
- **ORC-7**: Minimum viable set — required files inventory, definition of done checklist, minimal folder tree

### Subdirectories
- `schemas/` — 6 JSON Schema files (pipeline_definition, stage_io_contract, stage_io_registry, run_manifest, stage_report, rerun_request)
- `registries/` — 3 starter registry files (pipeline_definition.axion.v1, stage_io_registry.axion.v1, rerun_policies.axion.v1)
- `templates/` — 1 example (stage_report.example.json)

### Runtime Integration
- **Loader module**: `Axion/src/core/orchestration/loader.ts` — loads and caches all 3 registries, exports typed accessors:
  - `loadOrchestrationLibrary(repoRoot)` — returns `{ pipelineDefinition, stageIOContracts, rerunPolicies }`
  - `getPipelineDefinition(repoRoot)` — returns the pipeline definition registry
  - `getStageIOContract(repoRoot, contractId)` — look up a single IO contract by ID
  - `getRerunPolicy(repoRoot, stageId)` — look up rerun policy for a stage
  - `validateStageConsumes(repoRoot, stageId)` — check if all consumes contracts exist
  - `getInvalidatedContracts(repoRoot, stageId)` — get downstream contracts invalidated by rerunning a stage
  - `getStageOrder(repoRoot)` — returns pipeline stage_order from registry (source of truth)
  - `getStageGates(repoRoot)` — builds stage→gate mapping from registry gate_points
  - `getGatesRequired(repoRoot)` — returns all required gate IDs from registry
  - `getStageName(repoRoot, stageId)` / `getStageNames(repoRoot)` — stage display names from registry
  - `loadOrchestrationDocs/loadOrchestrationSchemas/loadOrchestrationRegistries` — read files for API/UI consumption
- **ICP wiring**: `RunController.createRun()` loads stage order, gates, and gates_required from orchestration library (with hardcoded fallback). Sets `pipeline` fields (pipeline_id, version) from the registry. Attaches `pipeline_ref` to every run.
- **CLI wiring**: `cmdRunFull()` and `executeStageWithGates()` load stage order and gates from orchestration library (with fallback)
- **Server wiring**: `pipeline-runner.ts` builds initial stages from orchestration library. `/api/config` returns `stageOrder`, `stageGates`, `gatesRequired`, `stageNames` from loader with `source: "orchestration_library"`.
- **Frontend wiring**: Assembly page fetches `/api/config` via React Query hook `usePipelineConfig()` — no hardcoded stage constants in frontend
- **ICPRun model**: `pipeline_ref?: { pipeline_id, version, source }` field; preserved in manifest round-trip via `config.__pipeline_ref`
- **API**: 6 `/api/orchestration/*` endpoints expose orchestration library data to the UI
- **UI**: `/orchestration` page with 4 tabs (Pipeline, Documents, Schemas, Registries), overview cards, pipeline stage visualization with IO contract labels and gate points

### Architecture: Registry-Driven Pipeline
The orchestration library's `pipeline_definition.axion.v1.json` is the **single source of truth** for pipeline execution. All runtime consumers load from the registry via the orchestration loader, with hardcoded fallbacks in `types/run.ts` (marked `@deprecated`) for resilience if the registry file is missing.

Data flow: `registry JSON → loader.ts → RunController / CLI / pipeline-runner / /api/config → frontend`

### Remaining Migration Notes
- The ORC-3 run_manifest.v1 schema defines the *target* manifest format (pipeline_ref, pins, runtime, stage_timeline, artifacts). The current runtime uses the legacy `RunManifest` type from `types/run.ts` with different field names. Full alignment requires a pipeline migration task.
- `pipeline_ref` is stored on `ICPRun` as a first-class field and round-tripped through manifests via `config.__pipeline_ref` for backward compatibility with the legacy `RunManifest` type.

### Key ID patterns
- Pipeline: `PIPE-[A-Z0-9_]+`
- Stage: `S\d{1,2}_[A-Z0-9_]+`
- Run: `RUN-[A-Z0-9]{6,}`
- IO Contract: `[A-Z0-9_-]+`
- Rerun request: `RERUN-[A-Z0-9]{6,}`
