# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system with a full-stack web application. It takes intake submissions through a 10-stage Mechanics pipeline (S1_INGEST_NORMALIZE → S10_PACKAGE), resolves standards, builds canonical specs, selects and renders templates, plans work, verifies proofs, runs gates, and packages everything into versioned "kits." The web dashboard provides a UI for creating assemblies, triggering pipeline runs, and browsing artifacts.

## Current State
Full Mechanics pipeline + web application layer with three formal control planes (ICP/KCP/MCP), three agent types (IA/BA/MA), and OpenAI autofill integration. Pipeline: 10 stages, 8 enforced gates (G1–G8), registry-driven engines for all stages, deterministic library loader with pinned versions, proof ledger with evidence policy. Web app: Express API + React dashboard + PostgreSQL database. All stages produce real registry-driven artifacts, all 8 gates pass, 193 kit files produced.

### Pipeline Stall Detection
Automatic watchdog in `server/pipeline-runner.ts` detects stalled pipeline runs:
- Tracks `lastActivityAt` per running process, updated on every stdout stage-progress line
- 30-second interval checker warns at 5 minutes and kills runs with >10 minutes of inactivity (configurable via `AXION_STALL_TIMEOUT_MS` env var)
- S7_RENDER_DOCS heartbeat logging: per-template start/complete logs and per-LLM-call logs in `evidence.ts`/`filler.ts` keep stall detector alive during long OpenAI batches
- `getPipelineStatus()` returns live status of all running processes
- `GET /api/pipeline/status` endpoint exposes `{assemblyId, runId, currentStage, startTime, lastActivityAt, elapsedMs, stalledMs}` per active run
- UI polling via `App/src/hooks/use-pipeline-status.ts` — shared hook with stall level detection (warning >2min, critical >4min)
- Dashboard, Workbench, and Runs pages show stall warnings, auto-kill countdown, and "Kill Run" buttons

### UI Overhaul — AXION Lab OS (Phases 1–6 Complete)
The web app has been redesigned from a flat dev admin panel to "AXION Lab OS" — a premium dark-mode mission control interface.

**Visual System** (`App/src/index.css`): Obsidian/charcoal dark theme with CSS custom properties for backgrounds, glass panels (backdrop-blur), glow borders (cyan/green/amber/red/violet), status colors (--status-processing, --status-success, --status-warning, --status-failure, --status-intelligence), animation keyframes (pulse-glow, fade-in, slide-in), utility classes (.glass-panel, .glass-panel-solid, .glow-border-*, .premium-card, .nav-item-active, .text-system-label, .font-mono-tech).

**App Shell** (`App/src/components/layout/`):
- `AppShell.tsx` — 3-zone layout wrapper: fixed left sidebar + fixed top command bar + scrollable main canvas
- `Topbar.tsx` — Top command bar with search/command palette trigger (Ctrl+K), active run chip (pulsing cyan when a run is active), environment badge ("Development")
- Sidebar and topbar are position-fixed; content area uses margin offsets via CSS vars (--sidebar-width, --topbar-height)

**Grouped Sidebar** (`App/src/components/app-sidebar.tsx`):
- AXION branding header with gradient AX logo
- 4 collapsible groups: Core Ops (Command Center, New Run, Runs, Artifacts), Intelligence (Features, Doc Inventory, Knowledge Library with 13 sub-items), System (Health, Logs, Maintenance), Output (Export)
- Knowledge Library sub-group auto-expands when any library route is active
- Live badge counts (active runs count with cyan badge)
- Active item uses left-border glow via .nav-item-active

**Premium UI Components** (`App/src/components/ui/`):
- `glass-panel.tsx` — GlassPanel container with configurable glow color (cyan/green/amber/red/violet/none), solid or blur variants
- `metric-card.tsx` — MetricCard stat card with icon, value, label, accent color, optional subtitle and onClick
- `status-chip.tsx` — StatusChip badge with semantic variants (processing/success/warning/failure/intelligence/neutral), optional pulse animation; getStatusVariant() maps assembly status strings
- `stage-rail.tsx` — StageRail horizontal 10-stage pipeline indicator with per-stage tooltips, parseStagesFromAssembly() helper

**Command Center** (`App/src/pages/dashboard.tsx`): Premium mission control dashboard with 4 rows:
- Hero strip: GlassPanel with "AXION Mission Control" title, live StatusChip (LIVE/ATTENTION/ALL CLEAR), environment label, stage/gate summary, "Latest Workbench" + "New Run" action buttons
- Row 1: 6 executive MetricCards (Active Runs, Failed, Completed Today, Gates, Artifacts Ready, System Health) — all with live data, subtitles, click navigation
- Row 2: 3-column live operations area — Active Operations (running assembly cards with StageRail), Activity Timeline (8 recent events with status icons), Alerts panel (failed runs with error messages, badge count)
- Row 3: 6 Command Modules (Start New Run, Resume Run, Latest Workbench, Review Failures, Artifact Explorer, Maintenance)
- Row 4: Recent Output strip (horizontal scroll of completed run cards with preset, duration, verification status, StageRail)
- Fetches `/api/health` for system stats, `/api/assemblies` with 5s polling; no All Runs table (moved to /runs page)

**Runs Page** (`App/src/pages/runs.tsx`): Fleet management page at `/runs` with status filter chips (All/Active/Completed/Failed/Queued), premium glass-panel table with StatusChip + StageRail columns, clickable rows navigate to Workbench, delete actions, empty state with filter-aware messaging.

**Workbench** (`App/src/pages/assembly.tsx`): Full operational console at `/assembly/:id`:
- Hero header in GlassPanel with project name, StatusChip, run ID badge, duration, action buttons (Run/Stop/Kit)
- Horizontal pipeline strip with S1–S10 rectangular stage nodes, color-coded by status, gate result indicators, clickable to open inspector
- Inspector panel: 320px right-side sticky panel with StageDetailCard (timing, artifacts, notes, gate summary) and GateInspector (checks, evidence, issues, completeness). Selection model: click stage/gate toggles inspector, X closes it. Error states for failed fetches
- Overview tab: contextual status banners (running/failed/completed) in glow GlassPanels, 4 MetricCards (Status/Passed/Failed/Duration), Project Details + Pipeline Status panels, token usage display
- Pipeline tab: vertical stage cards with glow borders per status, gate result badges, premium run history table
- Intake tab: section sidebar with nav-item-active pattern, dark-themed form editors, save/re-run actions
- Artifacts tab: breadcrumb file browser with dark styling, GlassPanel file list + preview pane
- Config tab: assembly config display, JSON viewer, red-glow danger zone
- Build tab: imported BuildTab component with dark-themed state badges

**Dark Theme Harmonization**: All pages swept for light-mode remnants — health.tsx, features.tsx, feature-detail.tsx, export.tsx, logs.tsx, maintenance.tsx, pipeline-progress.tsx, intake-wizard.tsx, build-mode.tsx, intake form pages, orchestration-library.tsx, system-library.tsx all updated to use dark-appropriate color references.

**Phase 3 Components** (`App/src/components/workbench/`):
- `StageDetailCard.tsx` — Stage detail card for inspector: status, timing, consumed/produced artifacts, notes (supports both severity/level fields), gate summary with check pass/fail counts
- `GateInspector.tsx` — Gate inspection panel: verdict chip, checks table with evidence links, issues with severity/remediation, evidence completeness (satisfied/missing proof types), engine info

**API Endpoints** (Phase 3): `GET /api/assemblies/:id/stages/:stageKey` (reads stage report JSON, falls back to normalized run.stages data), `GET /api/assemblies/:id/gates/:gateId` (reads gate report JSON, falls back to reports table). Both log parse errors and return 500 for malformed files.

**CSS Utilities** (Phase 4): `.scrollbar-thin` (thin styled scrollbar for dark theme)

**Phase 5 — Artifacts Explorer**:
- `App/src/pages/files.tsx` — Premium 3-panel artifact explorer: left tree sidebar (250px, collapsible dirs, search, file size), center preview pane (CodeViewer with syntax highlighting), right metadata panel (260px, toggleable, shows artifact_id, type badge, SHA-256, timestamp, producer stage)
- `App/src/components/ui/code-viewer.tsx` — Shared code/JSON/Markdown viewer with JSON syntax highlighting (colored keys/strings/numbers/booleans), Markdown rendering (headings, bold, code blocks, lists), line numbers toggle, copy-to-clipboard, auto-language detection
- Workbench `ArtifactBrowser` in `assembly.tsx` upgraded to tree navigation + CodeViewer preview
- API: `GET /api/artifacts/:runId` (artifact index), `GET /api/artifacts/:runId/manifest` (run manifest), `GET /api/artifacts/:runId/tree` (recursive directory tree with sizes)
- Features: run selector dropdown, type filter chips (stage_report/gate_report/template/kit/intake/canonical/verification/proof), download kit button

**Phase 6 — System Surfaces (Health/Logs/Maintenance)**:
- `App/src/pages/health.tsx` — Premium system health dashboard: hero strip with "Operational" status + engine version + total runs + audit entries, 6 MetricCards (stages, gates, knowledge, templates, runs, audit log), 7-library health grid (system/orchestration/gates/policy/intake/canonical/standards with docs/schemas/registries counts and highlights), recent runs strip, feature packs summary
- `App/src/pages/logs.tsx` — Operations Log with two tabs: "Run Log" (premium table with StatusChip, filter pills, clickable rows → workbench) and "Audit Trail" (timeline feed from audit.jsonl with action badges, run ID chips, hash integrity indicators, load more pagination)
- `App/src/pages/maintenance.tsx` — Premium glass upgrade: GlassPanel hero with amber glow + summary badges, pill-style tabs, MetricCards for overview stats, GlassPanel throughout all 7 tabs (overview/runs/modes/gates/patches/policies/schemas), StatusChip for all status indicators
- API: `GET /api/audit-log` (supports `?limit=`, `?run_id=`, `?action=` filters), enhanced `/api/health` with `engineVersion`, `totalRuns`, `auditEntries`

**Phase 7 — New Run Premium Intake** (Complete):
- `App/src/components/intake-wizard.tsx` — Premium shell: GlassPanel hero header with Rocket icon + "Step X of Y" badge, numbered progress rail with connecting lines (green completed/cyan current/muted future), glass-wrapped form area, cyan Next button with "Enter ↵" hint, green Submit button, violet AI autofill banners, red glow error banners
- `App/src/components/intake/page-routing.tsx` — GlassPanel selection cards with icons and cyan glow selected state, card grid replacing dropdown for Project Category, violet glow AI autofill toggle with custom switch
- `App/src/components/intake/page-project.tsx` — Dark glass-themed inputs with cyan focus glow, premium file upload drop zone, glass-styled link manager, mono-tech fonts
- All 9 remaining form pages (`page-intent/design/functional/data/auth/integrations/nfr/category/final.tsx`) — Consistent `text-system-label` labels, glass-themed inputs with cyan focus glow, premium chip/tag selection, custom toggle switches with glow, green glow "Start Pipeline" toggle on final page

**Phase 8 — Command Center Second Pass** (Complete):
- `App/src/components/command-palette.tsx` — Full command palette (Cmd+K / Ctrl+K): search input with cmdk, Navigation/Actions/Recent Assemblies categories, dark glass aesthetic, cyan selection highlight, Escape to close
- `App/src/components/layout/AppShell.tsx` — Global keyboard shortcut listener (Cmd+K), `<Toaster />` from sonner with dark theme
- `App/src/components/layout/Topbar.tsx` — Search button wired to open command palette via `onSearchClick` prop
- Toast notifications: success/error toasts on assembly create, pipeline start/kill, assembly delete (intake-wizard.tsx, assembly.tsx, runs.tsx)
- `GET /api/stats` endpoint — Server-side aggregated analytics: totalRuns, completedRuns, failedRuns, successRate, avgDurationMs, totalTokensUsed, runsToday/completedToday/failedToday, longestRun, recentFailureRate
- Dashboard metric cards enhanced: "Failed" shows failure rate %, "Completed Today" shows avg duration, "System Health" shows token usage
- Alert cards: "Retry" button (re-runs pipeline) and "Dismiss" button (client-side filter)
- `App/vite.config.ts` — React deduplication via `resolve.dedupe` for sonner compatibility

**Remaining phases**: Phase 9 (further Command Center refinements if needed), Phase 10 (Knowledge consolidation), Phase 11 (Export second pass), Phase 12 (Polish — density toggle, keyboard shortcuts).

### Build Mode (BM-00 through BM-18)
Internal Build Mode takes an approved Agent Kit from a completed pipeline run and generates a full project repository, verifies it, and optionally exports it as a downloadable zip.

**Flow**: Agent Kit → Eligibility → Plan → Workspace → Generate (slices) → Manifests → Verify → Export → Finalize

**Build States (BM-08)**: `not_requested → requested → approved → building → verifying → passed → exported`; `failed` reachable from any active state

**Modules** (`Axion/src/core/build/`):
- `types.ts` — Build states, transitions, failure classes, manifest/plan/verification interfaces
- `eligibility.ts` — BM-09 entry condition checker (kit exists, 8 gates passed, canonical spec, work breakdown, rendered docs, no critical blockers)
- `planner.ts` — Derives build plan from kit: stack profile, repo shape, 8 ordered build slices (scaffold → types_contracts → data_layer → api_routes → components → integration → tests → config)
- `workspace.ts` — Creates/manages `Axion/.axion/runs/RUN-XXXXXX/build/` with repo/, manifests, verification report, zip
- `generator.ts` — Core code generation engine: deterministic slices (scaffold, types, data, config) + AI-assisted slices (routes, components, integration, tests) using OpenAI via tracker
- `verifier.ts` — BM-13 verification: output presence, structure correctness, placeholder scan, manifest completeness, file integrity, output consistency
- `manifest.ts` — BM-15 audit records: build_manifest.json, repo_manifest.json, file_index.json with lifecycle transitions
- `packager.ts` — BM-14 export: creates project_repo.zip with repo contents + manifests (uses archiver, max compression)
- `runner.ts` — BM-06 orchestrator: full lifecycle from request through eligibility → plan → generate → verify → export with state machine enforcement and failure handling

**CLI**: `tsx src/cli/axion.ts build --run RUN-XXXXXX --mode build_and_export` (modes: kit_only, build_repo, build_and_export)

**API Endpoints**:
- `POST /api/assemblies/:id/build` — Trigger build (body: `{ mode: "build_repo" | "build_and_export" }`)
- `GET /api/assemblies/:id/build` — Get build status (state, progress, manifests, verification)
- `GET /api/assemblies/:id/build/download` — Download project_repo.zip (only when exported)

**UI**: Build tab on assembly page with mode selection, progress bars (slices/files), live token tracking with pulsing LIVE badge and per-stage breakdown, verification results, failure display with categorized reasons, download button, retry controls

**Build Token Tracking**: Matches pipeline token tracking pattern — `TOKEN_USAGE:` stdout lines parsed in POST build endpoint with monotonic `api_calls` guard, serialized DB updates via `enqueueBuildUpdate` queue to `assemblies.buildTokenUsage` (jsonb column), live display via `progress.tokenUsage` in GET response, final persistence on process close. UI shows `TokenUsageCard` component with input/output token split, per-stage breakdown, cost, and API call count.

**Path Resolution**: Build runner and eligibility module auto-detect whether they're running from workspace root (`Axion/.axion`) or from within the `Axion/` directory (`.axion`), since the CLI spawns with `cwd: Axion/`.

**Build Workspace** (`Axion/.axion/runs/RUN-XXXXXX/build/`):
- `repo/` — Generated project repository
- `build_manifest.json` — Build identity, input provenance, lifecycle transitions, timestamps, status, output refs
- `repo_manifest.json` — Repo structure summary, file inventory with roles, dependency summary, build commands
- `file_index.json` — All generated files with paths, roles, source references, sizes, generation methods
- `build_plan.json` — Ordered slices, file targets, generation instructions
- `verification_report.json` — Per-category verification results
- `project_repo.zip` — Downloadable archive (when export requested)

### Control Planes
- **ICP (Internal Control Plane)** — `Axion/src/core/controlPlane/`: Run orchestrator (api.ts), model/store (model.ts, store.ts), policies (policies.ts), releases (releases.ts), pins (pins.ts), audit (audit.ts). States: QUEUED → RUNNING → GATED → (FAILED | RELEASED) → ARCHIVED. CLI wired via RunController.
- **KCP (Kit Control Plane)** — `Axion/src/core/kcp/`: 10 modules — model, store, controller, validator, unitManager, verificationRunner, resultWriter, proofCapture, guardrails, runReport. States: READY → EXECUTING → VERIFYING → (BLOCKED | FAILED | COMPLETE). Enforces kit-local rules during build execution.
- **MCP (Maintenance Control Plane)** — `Axion/src/core/mcp/`: 10 modules — model, store, controller, dependencyManager, migrationManager, testMaintainer, refactorManager, ciMaintainer, axionIntegration, modeRunner. States: PLANNED → APPLYING → VERIFYING → (BLOCKED | FAILED | COMPLETE). Handles repo maintenance operations.

### Agent Types
- **IA (Internal Agent)** — `Axion/src/core/agents/internal.ts`: Produces AXION outputs under ICP governance (intake, canonical build, standards, template selection, planning, kit preparation).
- **BA (Build Agent)** — `Axion/src/core/agents/build.ts`: Executes Agent Kit under KCP governance (1-target-per-unit, RESULT artifacts, verification, reruns).
- **MA (Maintenance Agent)** — `Axion/src/core/agents/maintenance.ts`: Performs repo maintenance under MCP governance (dependency upgrades, migrations, test hardening, CI, rollback).

### Kit Slot & Pack Infrastructure (KIT-01/TMP-06 Compliant)
`Axion/src/core/kit/build.ts` — 12 locked KIT-01 slots: 01_requirements, 02_design, 03_architecture, 04_implementation, 05_security, 06_quality, 07_ops, 08_data, 09_api_contracts, 10_release, 11_governance, 12_analytics. SUBDIR_TO_SLOT maps all template prefix groups to correct slots. Pack root files generated: 00_pack_meta.md (pack_level, pack_id, scope_refs, required_slots, status in machine-readable JSON), 00_pack_index.md (TOC with links), 00_gate_checklist.md (pass/fail). Empty slots get 00_NA.md with reason and trigger condition.

### Template Selector (TMP-03 Compliant)
`Axion/src/core/templates/selector.ts` — Global type ordering (Product → Design → Architecture → Data → API → Security → Implementation → Quality → Ops → Release → Governance → Analytics) with template_id tie-breaker. Baseline coverage enforcement (always-required: product, architecture, implementation, security, quality; conditional: design, data, api, ops). Selection result includes `omitted_templates[]` with reasons (not_applicable, skill_level_omit, pack_not_active), `na_slots[]`, and `baseline_warnings[]`.

### Template Completeness Gate (TMP-05 Compliant)
`Axion/src/core/templates/completeness.ts` — `runTemplateGate()` performs 5 checks per filled template: TMP5-STRUCT-01 (sections exist), TMP5-FILL-01 (no unresolved {{placeholder}} tokens), TMP5-FILL-02 (no empty required sections), TMP5-REF-01 (entity ID reference validation), TMP5-UNK-01 (UNKNOWN block ID validation). Produces per-template gate report with rule_id, pointer, error_code, message, remediation. Aggregate gate report written to `template_gate_report.json`.

### Version Stamping (KIT-04 Compliant)
`Axion/src/core/kit/build.ts` — 00_VERSIONS.md contains machine-readable JSON block with all 7 KIT-04 categories: V-01 System, V-02 Intake (form/schema/ruleset versions), V-03 Standards (library/packs/resolver), V-04 Templates (library/templates_used[]/index/fill_rules), V-05 Canonical Model (spec/id_rules/unknowns), V-06 Planning/Verification (planning/proof rules), V-07 Kit Contracts (folder_structure/manifest/entrypoint). 00_KIT_MANIFEST.md includes version_cross_check block.

### CAN-03 Unknown Format
`Axion/src/core/templates/filler.ts` — When the IA genuinely can't resolve content, generates CAN-03 compliant unknowns with unk_ prefix IDs, unknown_type, severity, blocking, summary, detail, impact, what_is_needed_to_resolve. Rendered in TMP-02 Section 11 format. `fill_unknowns_audit.json` written when unknowns exist. UNKNOWNs are the fallback — AI synthesis fills content whenever possible.

### Feature Registry UI
- `GET /api/features` — Returns all 17 feature pack registries from `Axion/features/FEAT-*/00_registry.json`
- `GET /api/features/:id` — Returns registry + all 8 spec file contents + reverse dependencies
- `/features` page — Feature Registry Dashboard grouped by category (infrastructure, core-logic, interface, security) with status badges, module counts, dependency counts
- `/features/:id` page — Feature detail inspector with tabbed spec viewer (Contract, Errors, Security, Gates & Proofs, Tests, Observability, Docs, API), source modules list, dependency/reverse-dependency links, gate badges
- Health page shows Feature Packs summary card with total/active counts and category breakdown

### OpenAI Autofill Integration
- `server/openai.ts` — OpenAI client using Replit AI Integrations (AI_INTEGRATIONS_OPENAI_BASE_URL + AI_INTEGRATIONS_OPENAI_API_KEY), model: `gpt-4o`
- `POST /api/autofill` — returns structured suggestions for intake sections based on routing + project info
- Opt-in toggle on Page 0 (routing); "AI-drafted" badge on auto-filled fields; all values editable

### Pipeline OpenAI Integration (IA Agent)
- `Axion/src/core/agents/openai-bridge.ts` — OpenAI bridge for pipeline stages, wraps OpenAI client for use within Axion CLI
- **S3 (Build Canonical)**: After deterministic spec building, calls OpenAI to enrich feature descriptions, add failure states to workflows, and generate project-specific rules
- **S8 (Build Plan)**: After deterministic work breakdown, calls OpenAI to enrich work unit descriptions with implementation details and acceptance criteria
- All OpenAI calls are gracefully optional — if API key is missing or call fails, pipeline falls back to deterministic output
- Intake data race condition fixed: `pipeline-runner.ts` writes `pending_intake.json` BEFORE spawning CLI; `runControlPlane.ts` copies it into run dir before S1 executes
- **Parallel rendering**: S7 template rendering uses configurable concurrency (env `AXION_IA_CONCURRENCY`, default 3, max 10) — batches of N templates rendered concurrently via `Promise.all`, results sorted deterministically by template_id

### Token Usage Tracking
- `Axion/src/core/usage/tracker.ts` — In-memory accumulator for OpenAI token usage per pipeline run
- **Tracked call sites**: `filler.ts` (S7_RENDER_DOCS stage), `openai-bridge.ts` (S3_CANONICAL_SPEC, S5_WORK_BREAKDOWN, S7_TEMPLATE_ENRICH stages), `server/openai.ts` (AUTOFILL stage)
- **Cost model**: gpt-4o at $2.50/1M input, $10/1M output; gpt-4o-mini at $0.15/1M input, $0.60/1M output
- **Live streaming**: `recordUsage()` emits `TOKEN_USAGE: {...}` to stdout after each API call with cumulative totals and per-stage breakdown; `pipeline-runner.ts` parses these lines in real-time and updates `pipeline_runs.tokenUsage` (jsonb) incrementally during the run
- **Persistence**: `cmdRunFull()` writes final `token_usage.json` to run dir; `pipeline-runner.ts` also reads it on completion as reconciliation
- **UI**: Assembly overview shows Token Usage card (total/input/output tokens + estimated cost) with per-stage breakdown and pulsing "LIVE" badge during active runs; auto-refreshes every 2s while running; Pipeline tab run history table includes Tokens and Cost columns

### Intake Library (`Axion/libraries/intake/`)
Form spec, field enums, validation rules, submission records, normalization contracts, and intake gates (INT-0 through INT-7). 12 legacy flat files preserved for backward compat (pipeline code: normalizer.ts, validator.ts, submissionRecord.ts).

**Structure (47 files: 25 new root files + 7 schemas + 3 registries + 12 legacy):**
- **INT-0**: Purpose + boundary checklist (2 docs)
- **INT-1**: Form spec model + determinism rules + validation checklist (3 docs) + `intake_form_spec.v1.schema.json`
- **INT-2**: Enum registry model + determinism rules + validation checklist (3 docs) + `intake_enums.v1.schema.json` + `intake_enums.v1.json` registry
- **INT-3**: Validation model + determinism rules + validation checklist (3 docs) + `intake_cross_field_rules.v1.schema.json` + `intake_validation_report.v1.schema.json` + `intake_cross_field_rules.v1.json` registry
- **INT-4**: Submission record model + determinism rules + validation checklist (3 docs) + `intake_submission.v1.schema.json` + `normalized_input.v1.schema.json`
- **INT-5**: Stable ID rules + determinism checklist + validation checklist (3 docs) + `normalization_rules.v1.schema.json` + `normalization_rules.v1.json` registry
- **INT-6**: Intake gates + gate mapping + evidence requirements + validation checklist (4 docs) + `INT-6_intake_gates.spec.json`
- **INT-7**: Minimum viable set + definition of done + minimal tree (2 docs + 1 .txt)

**Subdirectories:**
- `schemas/` — 7 JSON Schema files (intake_form_spec, intake_enums, intake_cross_field_rules, intake_validation_report, intake_submission, normalized_input, normalization_rules)
- `registries/` — 3 starter registry files (intake_enums: 3 enums with aliases, intake_cross_field_rules: 2 conditional rules, normalization_rules: 4 transforms)

**Loader** (`Axion/src/core/intake/loader.ts`):
- `loadIntakeLibrary(repoRoot)` — loads enums + cross-field rules + normalization rules registries, cached
- `loadIntakeDocs(repoRoot)` — all INT-N docs with frontmatter
- `loadIntakeSchemas(repoRoot)` — all JSON schema files from schemas/
- `loadIntakeRegistries(repoRoot)` — all registry JSON files from registries/
- `getEnumRegistry(repoRoot)` — returns enum registry
- `getCrossFieldRules(repoRoot)` — returns cross-field rules
- `getNormalizationRules(repoRoot)` — returns normalization rules

**API**: 6 `/api/intake-library/*` endpoints (prefix `-library` to avoid collision with intake wizard endpoints)
**UI**: `/intake-library` page with 4 tabs (Intake, Documents, Schemas, Registries), field enum tables with aliases, cross-field rules IF/THEN visualization, normalization rule cards
**Registered in:** `schema_registry.v1.json` (7 entries), `library_index.v1.json` (3 entries + 1 existing)

### Canonical Library (`Axion/libraries/canonical/`)
Entity model, stable IDs, reference integrity, unknowns/assumptions, canonical gates (CAN-0 through CAN-7). 12 legacy flat files preserved for backward compat (pipeline code: validate.ts, specBuilder.ts).

**Structure (47 files: 30 new root files + 3 schemas + 2 registries + 12 legacy):**
- **CAN-0**: Purpose + boundary checklist (2 docs)
- **CAN-1**: Entity model + determinism rules + validation checklist (3 docs) + `canonical_spec.v1.schema.json`
- **CAN-2**: ID rules + ID generation spec + dedupe rules + determinism rules + validation checklist (5 docs) + `id_rules.v1.json` registry
- **CAN-3**: Reference integrity + integrity checks + determinism rules + validation checklist (4 docs) + `relationship_constraints.v1.json` registry
- **CAN-4**: Unknowns/assumptions model + rules + determinism rules + validation checklist (4 docs) + `unknown_assumptions.v1.schema.json`
- **CAN-5**: Artifacts + manifest requirements + determinism rules + validation checklist (4 docs) + `canonical_build_report.v1.schema.json`
- **CAN-6**: Canonical gates + gate mapping + evidence requirements + determinism rules + validation checklist (5 docs) + `CAN-6_canonical_gates.spec.json`
- **CAN-7**: Minimum viable set + definition of done + minimal tree (2 docs + 1 .txt)

**Subdirectories:**
- `schemas/` — 3 JSON Schema files (canonical_spec: 11 entity types + 7 relationship types, unknown_assumptions: ua_items with severity/pointer/prompt, canonical_build_report: counts + refs)
- `registries/` — 2 registry files (id_rules: deterministic ID generation with 6 canonical key templates + namespace mode, relationship_constraints: 7 type constraints with from/to rules)

**Loader** (`Axion/src/core/canonical/loader.ts`):
- `loadCanonicalLibrary(repoRoot)` — loads id_rules + relationship_constraints registries, cached
- `loadCanonicalDocs(repoRoot)` — all CAN-N docs with frontmatter
- `loadCanonicalSchemas(repoRoot)` — all JSON schema files from schemas/
- `loadCanonicalRegistries(repoRoot)` — all registry JSON files from registries/
- `getIdRules(repoRoot)` — returns ID rules registry
- `getRelationshipConstraints(repoRoot)` — returns relationship constraints registry

**API**: 6 `/api/canonical/*` endpoints
**UI**: `/canonical` page with 4 tabs (Canonical, Documents, Schemas, Registries), entity type grid with canonical key templates, relationship type constraints table, unknowns model overview, canonical gates list
**Registered in:** `schema_registry.v1.json` (3 new + 2 legacy entries), `library_index.v1.json` (2 new + 1 legacy entry)

**Code wired to CAN-02 (legacy):** `validate.ts` and `specBuilder.ts` load from `CAN-02.id_rules.v1.json` (10 entity types) and `CAN-02.reference_integrity_rules.v1.json` (split ref integrity), with fallback to legacy files.

### Standards Library (`Axion/libraries/standards/`)
Standards pack system, index, applicability, resolution, snapshots, and gates (STD-0 through STD-6). 7 legacy flat files preserved for backward compat (pipeline code: registryLoader.ts, applicability.ts, resolver.ts, selector.ts, snapshot.ts).

**Structure (31 new files: 22 .md docs + 1 .txt + 1 gate spec JSON = 24 root files, 5 schemas, 1 registry, 1 new pack):**
- **STD-0**: Purpose + boundary checklist (2 docs)
- **STD-1**: Standards pack model + determinism rules + validation checklist (3 docs) + `standards_pack.v1.schema.json` + `standards_index_entry.v1.schema.json`
- **STD-2**: Standards index model + applicability rules + determinism rules + validation checklist (4 docs) + `standards_index.v1.schema.json` + `standards_index.v1.json` registry
- **STD-3**: Resolution model + resolver order rules + determinism rules + validation checklist (4 docs) + `standards_conflict.v1.schema.json`
- **STD-4**: Snapshot model + determinism rules + validation checklist (3 docs) + `standards_snapshot.v1.schema.json`
- **STD-5**: Standards gates + gate mapping + gate spec JSON + evidence requirements + determinism rules + validation checklist (5 docs + 1 gate spec JSON)
- **STD-6**: Minimum viable set + definition of done + minimal tree (2 docs + 1 .txt)

**Subdirectories:**
- `schemas/` — 5 JSON Schema files (standards_pack: pack_id/scope/rules with 6 rule types, standards_index_entry: maturity lifecycle, standards_index: index_id/packs[], standards_conflict: conflict resolution modes, standards_snapshot: resolved packs/rules/conflicts)
- `registries/` — 1 registry file (standards_index: starter index with 1 pack entry)
- `packs/` — 11 pack files (10 legacy + 1 new STD-SECURITY_BASELINE with 5 security rules)

**Loader** (`Axion/src/core/standards/loader.ts`):
- `loadStandardsLibrary(repoRoot)` — loads standards index registry, cached
- `loadStandardsDocs(repoRoot)` — all STD-N docs with frontmatter
- `loadStandardsSchemas(repoRoot)` — all JSON schema files from schemas/
- `loadStandardsRegistries(repoRoot)` — all registry JSON files from registries/
- `loadStandardsPacks(repoRoot)` — all pack files from packs/
- `getStandardsIndex(repoRoot)` — returns standards index registry
- `getPackById(repoRoot, packId)` — returns specific pack by pack_id

**API**: 7 `/api/standards/*` endpoints (overview, schemas, registries, registries/:name, packs, docs, docs/:filename)
**UI**: `/standards` page with 4 tabs (Standards, Documents, Schemas, Packs), standards pack grid with scope badges, rules by type/severity, 6 standards gates (STD-GATE-01..06) mapped to G3_STANDARDS_RESOLVED
**Registered in:** `schema_registry.v1.json` (5 new entries), `library_index.v1.json` (1 new + 2 existing entries)

**Legacy files preserved:** STD-01.categories.v1.json, STD-01.pack_contract.v1.json, STD-01.library_index.schema.v1.json, STD-02.resolution_rules.v1.json, STD-03.snapshot.schema.v1.json, resolver_rules.v1.json, standards_index.json

### Templates Library (`Axion/libraries/templates/`)
Document template library system, registry, selection rules, render envelopes, completeness, and gates (TMP-0 through TMP-7). 8 legacy flat files preserved for backward compat (pipeline code: selector.ts, filler.ts, renderer.ts, completeness.ts, completenessGate.ts, evidence.ts). 8 template category directories with 533 .md template files preserved.

**Structure (35 new files: 27 root files + 5 schemas + 3 registries):**
- **TMP-0**: Purpose + boundary checklist (2 docs)
- **TMP-1**: Template model + determinism rules + validation checklist (3 docs) + `template_definition.v1.schema.json`
- **TMP-2**: Registry model + determinism rules + validation checklist (3 docs) + `template_registry_entry.v1.schema.json` + `template_registry.v1.schema.json` + `template_registry.v1.json` registry
- **TMP-3**: Selection model + selection rules + determinism rules + validation checklist (4 docs) + `template_selection.v1.schema.json` + `template_category_order.v1.json` registry
- **TMP-4**: Render envelope model + determinism rules + validation checklist (3 docs) + `render_envelope.v1.schema.json`
- **TMP-5**: Completeness model + placeholder syntax rules + evaluation rules + determinism rules + validation checklist (5 docs) + `template_completeness_policy.v1.json` registry
- **TMP-6**: Template gates + gate mapping + gate spec JSON + evidence requirements + determinism rules + validation checklist (5 docs + 1 gate spec JSON)
- **TMP-7**: Minimum viable set + definition of done + minimal tree (2 docs + 1 .txt)

**Subdirectories:**
- `schemas/` — 5 JSON Schema files (template_definition: template_id/category(8)/placeholders[]/output, template_registry_entry: maturity lifecycle, template_registry: registry_id/templates[], template_selection: selection_id/selected[]/cap, render_envelope: envelope_id/template_ref/input_refs/knowledge_citations/completeness)
- `registries/` — 3 registry files (template_registry: starter with 1 TMP-01 entry, template_category_order: 8 fixed categories for tie-breaking, template_completeness_policy: thresholds by risk class PROTOTYPE/PROD/COMPLIANCE)

**Loader** (`Axion/src/core/templates/loader.ts`):
- `loadTemplatesLibrary(repoRoot)` — loads template_registry + category_order + completeness_policy, cached
- `loadTemplatesDocs(repoRoot)` — all TMP-N docs with frontmatter
- `loadTemplatesSchemas(repoRoot)` — all JSON schema files from schemas/
- `loadTemplatesRegistries(repoRoot)` — all registry JSON files from registries/
- `getTemplateRegistry(repoRoot)` — returns template registry
- `getCategoryOrder(repoRoot)` — returns category order registry
- `getCompletenessPolicy(repoRoot)` — returns completeness policy registry

**API**: 7 `/api/templates-library/*` endpoints (overview, schemas, registries, registries/:name, categories, docs, docs/:filename)
**UI**: `/templates-library` page with 4 tabs (Templates, Documents, Schemas, Registries), template registry with category/profile/risk badges, 8-category ordering, completeness thresholds, 6 template gates (TMP-GATE-01..06) mapped to G4/G5
**Registered in:** `schema_registry.v1.json` (5 new entries), `library_index.v1.json` (3 new + 2 existing entries)

**Legacy files preserved:** TMP-01..TMP-05 JSON files, placeholder_catalog.v1.json, template_index.json, 8 category directories with 533 .md templates

### Planning Library (`Axion/libraries/planning/`)
Work planning mechanics — WBS, acceptance map, build plan, sequencing policies, coverage rules, and gates (PLAN-0 through PLAN-6). 6 legacy flat files preserved for backward compat (pipeline code: plan.ts, workBreakdown.ts, acceptanceMap.ts, sequencing.ts, coverage.ts, outputs.ts).

**Structure (30 new files: 24 root files + 5 schemas + 1 registry):**
- **PLAN-0**: Purpose + boundary checklist (2 docs)
- **PLAN-1**: WBS model + determinism rules + validation checklist (3 docs) + `work_breakdown.v1.schema.json`
- **PLAN-2**: Acceptance map model + determinism rules + validation checklist (3 docs) + `acceptance_map.v1.schema.json`
- **PLAN-3**: Build plan model + sequencing policies + determinism rules + validation checklist (4 docs) + `build_plan.v1.schema.json`
- **PLAN-4**: Coverage model + determinism rules + validation checklist (3 docs) + `plan_coverage_rules.v1.schema.json` + `plan_coverage_report.v1.schema.json` + `plan_coverage_rules.v1.json` registry
- **PLAN-5**: Planning gates + gate mapping + gate spec JSON + evidence requirements + determinism rules + validation checklist (5 docs + 1 gate spec JSON)
- **PLAN-6**: Minimum viable set + definition of done + minimal tree (2 docs + 1 .txt)

**Subdirectories:**
- `schemas/` — 5 JSON Schema files (work_breakdown: wbs_id/items[]/work_item with work_type enum + depends_on + status + priority, acceptance_map: amap_id/requirements[]/acceptance_criteria[]/evidence, build_plan: plan_id/phases[]/milestones[], plan_coverage_rules: rules_id/rules[] with category enum entity/template/acceptance + severity must/should, plan_coverage_report: run_id/status/results[])
- `registries/` — 1 registry file (plan_coverage_rules: 4 starter rules COV-ENTITY-COMPONENTS/COV-ENTITY-ENDPOINTS/COV-TEMPLATES-ALL/COV-ACCEPTANCE-ALL)

**Loader** (`Axion/src/core/planning/loader.ts`):
- `loadPlanningLibrary(repoRoot)` — loads coverage rules registry, cached
- `loadPlanningDocs(repoRoot)` — all PLAN-N docs with frontmatter
- `loadPlanningSchemas(repoRoot)` — all JSON schema files from schemas/
- `loadPlanningRegistries(repoRoot)` — all registry JSON files from registries/
- `getCoverageRules(repoRoot)` — returns coverage rules registry

**API**: 6 `/api/planning-library/*` endpoints (overview, schemas, registries, registries/:name, docs, docs/:filename)
**UI**: `/planning-library` page with 4 tabs (Planning, Documents, Schemas, Registries), planning artifacts overview (WBS/AMAP/BUILD_PLAN), 7 default sequencing phases, coverage rules table, 6 planning gates (PLAN-GATE-01..06) mapped to G6_PLAN_COVERAGE
**Registered in:** `schema_registry.v1.json` (2 updated + 3 new entries = 5 total), `library_index.v1.json` (1 existing + 1 new entry)

**Legacy files preserved:** PLAN-01..PLAN-03 JSON schemas, sequencing_policy.v1.json, acceptance_map.schema.v1.json, work_breakdown.schema.v1.json

### Verification Library (`Axion/libraries/verification/`)
Proof and completion system — proof types, proof ledger, command run tracking, completion criteria, command policy, and gates (VER-0 through VER-7). 8 legacy flat files preserved for backward compat (pipeline code: runner.ts, completion.ts, policy.ts).

**Structure (35 new files: 26 root files + 6 schemas + 3 registries):**
- **VER-0**: Purpose + boundary checklist (2 docs)
- **VER-1**: Proof types model + determinism rules + validation checklist (3 docs) + `proof_types.v1.schema.json` + `proof_types.v1.json` registry
- **VER-2**: Proof ledger model + determinism rules + validation checklist (3 docs) + `proof_ledger.v1.schema.json`
- **VER-3**: Command run model + determinism rules + validation checklist (3 docs) + `command_run.v1.schema.json` + `command_run_log.v1.schema.json`
- **VER-4**: Completion model + determinism rules + validation checklist (3 docs) + `completion_criteria.v1.schema.json` + `completion_criteria.v1.json` registry
- **VER-5**: Command policy model + determinism rules + validation checklist (3 docs) + `verification_command_policy.v1.schema.json` + `verification_command_policy.v1.json` registry
- **VER-6**: Verification gates + gate mapping + evidence requirements + determinism rules + validation checklist (5 docs + 1 gate spec JSON)
- **VER-7**: Minimum viable set + definition of done + minimal tree (2 docs + 1 .txt)

**Subdirectories:**
- `schemas/` — 6 JSON Schema files (proof_types: registry with proof_type enum, proof_ledger: ledger_id/proofs[]/append_only, command_run: command_run_id/status/exit_code/logs_ref, command_run_log: log_id/runs[], completion_criteria: unit_done+run_done with requirement kind enum, verification_command_policy: policy_id/rules[] with match patterns + decision outcomes)
- `registries/` — 3 registry files (proof_types: 6 types command_run/test_suite/lint_check/build_artifact/security_scan/manual_attestation, completion_criteria: unit_done proof + run_done G1-G7 gates + KIT_MANIFEST + PROOF_LEDGER, verification_command_policy: 3 rules allow-npm-test/allow-npm-lint/deny-destructive)

**Loader** (`Axion/src/core/verification/loader.ts`):
- `loadVerificationLibrary(repoRoot)` — loads proof_types + completion_criteria + command_policy registries, cached
- `loadVerificationDocs(repoRoot)` — all VER-N docs with frontmatter
- `loadVerificationSchemas(repoRoot)` — all JSON schema files from schemas/
- `loadVerificationRegistries(repoRoot)` — all registry JSON files from registries/
- `getProofTypes(repoRoot)` — returns proof types registry
- `getCompletionCriteria(repoRoot)` — returns completion criteria registry
- `getCommandPolicy(repoRoot)` — returns command policy registry

**API**: 6 `/api/verification-library/*` endpoints (overview, schemas, registries, registries/:name, docs, docs/:filename)
**UI**: `/verification-library` page with 4 tabs (Verification, Documents, Schemas, Registries), proof types table with required fields, completion criteria (unit_done + run_done), command policy rules, 7 verification gates (VER-GATE-01..07) mapped to G7_VERIFICATION
**Registered in:** `schema_registry.v1.json` (2 updated + 4 new entries = 6 total), `library_index.v1.json` (3 new entries)

**Legacy files preserved:** VER-01..VER-03 JSON files, proof_log.schema.v1.json, command_runs.schema.v1.json

### Kit Library (`Axion/libraries/kit/`)
Kit packaging contract — kit folder tree, manifest schema, versioning, export rules, and gates (KIT-0 through KIT-6). 9 legacy flat files preserved for backward compat (pipeline code: build.ts, manifest.ts, packager.ts, validate.ts, etc.).

**Structure (28 new files: 24 root files + 1 schema + 3 registries):**
- **KIT-0**: Purpose + boundary checklist (2 docs)
- **KIT-1**: Kit tree model + determinism rules + validation checklist (3 docs)
- **KIT-2**: Kit manifest model + determinism rules + validation checklist (3 docs)
- **KIT-3**: Versioning model + compatibility rules + determinism rules + validation checklist (4 docs)
- **KIT-4**: Export rules + determinism rules + validation checklist (3 docs)
- **KIT-5**: Kit gates + gate mapping + evidence requirements + determinism rules + validation checklist (5 docs + 1 gate spec JSON) — KIT-GATE-01..06
- **KIT-6**: Minimum viable set + definition of done + minimal tree (2 docs + 1 .txt)

**Subdirectories:**
- `schemas/` — 1 JSON Schema file (kit_manifest: kit_id/run_id/kit_version/created_at/export_class/entrypoints/contents[] with path/kind/contract_id/source/hash/classification)
- `registries/` — 3 registry files (kit_tree: 4 folders + 2 files with required/optional, kit_compatibility: kit format v1.0.0 requires + schema support, kit_export_filter: 2 rules deny restricted+internal_only / allow public)

**Loader** (`Axion/src/core/kit/loader.ts`):
- `loadKitLibrary(repoRoot)` — loads kit_tree + kit_compatibility + kit_export_filter registries, cached
- `loadKitDocs(repoRoot)` — all KIT-N docs with frontmatter
- `loadKitSchemas(repoRoot)` — all JSON schema files from schemas/
- `loadKitRegistries(repoRoot)` — all registry JSON files from registries/
- `getKitTree(repoRoot)` — returns kit tree registry
- `getKitCompatibility(repoRoot)` — returns compatibility registry
- `getKitExportFilter(repoRoot)` — returns export filter registry

**API**: 6 `/api/kit-library/*` endpoints (overview, schemas, registries, registries/:name, docs, docs/:filename)
**UI**: `/kit-library` page with 4 tabs (Kit, Documents, Schemas, Registries), kit tree structure table, manifest schema summary, export rules, 6 kit gates (KIT-GATE-01..06) with severity badges, compatibility info
**Registered in:** `schema_registry.v1.json` (kit.manifest.v1 path updated to schemas/), `library_index.v1.json` (3 new entries: kit.tree, kit.compatibility, kit.export_filter)

**Legacy files preserved:** KIT-01..KIT-04 JSON files, kit_tree.schema.v1.json, kit_manifest.schema.v1.json, kit_entrypoint.schema.v1.json, kit_versions.schema.v1.json

### Telemetry Library (`Axion/libraries/telemetry/`)
Event and metrics contracts — telemetry event schemas, run metrics, sink policies, privacy/redaction rules, and gates (TEL-0 through TEL-6). 3 legacy flat files preserved for backward compat.

**Structure (30 new files: 22 root files + 5 schemas + 3 registries):**
- **TEL-0**: Purpose + boundary checklist (2 docs)
- **TEL-1**: Event model + determinism rules + validation checklist (3 docs)
- **TEL-2**: Run metrics model + determinism rules + validation checklist (3 docs)
- **TEL-3**: Sink policy model + determinism rules + validation checklist (3 docs)
- **TEL-4**: Privacy model + redaction rules + determinism rules + validation checklist (4 docs)
- **TEL-5**: Telemetry gates + determinism rules + validation checklist (3 docs + 1 gate spec JSON) — TEL-GATE-01..05
- **TEL-6**: Minimum viable set + definition of done + minimal tree (2 docs + 1 .txt)

**Subdirectories:**
- `schemas/` — 5 JSON Schema files (telemetry_event_base: event_id/event_type/run_id/timestamp/payload, telemetry_event_types: registry with types[], run_metrics: metrics_id/run/stages[]/gates[], telemetry_sink_policy: sinks[]/redaction, telemetry_privacy_policy: deny_keys/deny_patterns/free_text/external_sink_rules)
- `registries/` — 3 registry files (telemetry_event_types: 5 event types run.started/stage.started/stage.ended/gate.evaluated/run.ended, telemetry_sink_policy: TELPOL-BASE01 with 3 sinks + redaction rules, telemetry_privacy_policy: TELPRIV-BASE01 with data classes + deny keys/patterns + free-text rules)

**Loader** (`Axion/src/core/telemetry/loader.ts`):
- `loadTelemetryLibrary(repoRoot)` — loads event_types + sink_policy + privacy_policy registries, cached
- `loadTelemetryDocs(repoRoot)` — all TEL-N docs with frontmatter
- `loadTelemetrySchemas(repoRoot)` — all JSON schema files from schemas/
- `loadTelemetryRegistries(repoRoot)` — all registry JSON files from registries/
- `getEventTypes(repoRoot)` — returns event types registry
- `getSinkPolicy(repoRoot)` — returns sink policy registry
- `getPrivacyPolicy(repoRoot)` — returns privacy policy registry

**API**: 6 `/api/telemetry-library/*` endpoints (overview, schemas, registries, registries/:name, docs, docs/:filename)
**UI**: `/telemetry-library` page with 4 tabs (Telemetry, Documents, Schemas, Registries), event types table, run metrics overview, sink policy cards, redaction overview, privacy policy summary, 5 telemetry gates (TEL-GATE-01..05)
**Registered in:** `schema_registry.v1.json` (5 new entries + 2 legacy preserved), `library_index.v1.json` (3 new entries + 1 legacy preserved)

**Legacy files preserved:** event.schema.v1.json, run_metrics.schema.v1.json, sink_policy.v1.json

### Audit Library (`Axion/libraries/audit/`)
Operator action tracking — audit action schemas, append-only ledgers, integrity verification, query indexing, ops workflow (retention/redaction/export), and gates (AUD-0 through AUD-7). Fully compliant with canonical PDF spec.

**Structure (33 files: 27 docs + 1 gate spec JSON + 3 schemas + 2 registries):**
- **AUD-0**: Purpose + boundary checklist (2 docs)
- **AUD-1**: Audit action model + determinism rules + validation checklist (3 docs)
- **AUD-2**: Audit log model + tamper evident rules + determinism rules + validation checklist (4 docs)
- **AUD-3**: Audit index model + determinism rules + validation checklist (3 docs)
- **AUD-4**: Integrity model + hash chain rules + determinism rules + validation checklist (4 docs)
- **AUD-5**: Audit gates + evidence requirements + determinism rules + validation checklist (4 docs + 1 gate spec JSON) — AUD-GATE-01..06
- **AUD-6**: Ops workflow + redaction export rules + determinism rules + validation checklist (4 docs)
- **AUD-7**: Minimum viable set + definition of done + minimal tree (2 docs + 1 .txt)

**Subdirectories:**
- `schemas/` — 3 JSON Schema files (audit_action: audit_event_id/action_type(13 enum)/actor/occurred_at/target/reason/refs, audit_log: audit_log_id/scope/events[]/tamper_evident/timestamps, audit_index: index_id/entries[scope+audit_log_ref+query_keys])
- `registries/` — 2 registry files (audit_integrity: hash_chain mode + sha256 + canonical_json + risk class requirements, audit_ops_policy: AUDOPS-BASE01 with retention windows + redaction deny_keys + export rules)

**Loader** (`Axion/src/core/audit/loader.ts`):
- `loadAuditLibrary(repoRoot)` — loads audit_integrity + audit_ops_policy registries + AUD-5 gate spec, cached
- `getAuditGateSpec(repoRoot)` — returns typed AuditGateSpec (6 gates with checks)
- `loadAuditSchema(repoRoot, name)` — loads a specific schema by name
- `loadAuditDocs(repoRoot)` — all AUD-N docs with frontmatter
- `loadAuditSchemas(repoRoot)` — all JSON schema files from schemas/
- `loadAuditRegistries(repoRoot)` — all registry JSON files from registries/
- `getAuditIntegrity(repoRoot)` — returns integrity registry
- `getAuditOpsPolicy(repoRoot)` — returns ops policy registry

**API**: 6 `/api/audit-library/*` endpoints (overview, schemas, registries, registries/:name, docs, docs/:filename)
**UI**: `/audit-library` page with 4 tabs (Audit, Documents, Schemas, Registries), action types table (13 types across 6 categories), actor roles (4), target types (7), audit log overview, integrity levels (3 with risk class requirements), retention policy table, redaction + export rules, 6 audit gates (AUD-GATE-01..06)
**Registered in:** `schema_registry.v1.json` (3 new entries + 1 legacy preserved), `library_index.v1.json` (2 new entries)

**Legacy files preserved:** operator_actions_ledger.schema.v1.json

### Maintenance Library (`Axion/libraries/maintenance/`)
Maintenance and Update System (MUS) — 21 maintenance modes, 6 consent gates, 2 detector packs, 7 patch types, 2 schedules, 4 policies, 23 JSON Schema contracts (MUS-0 through MUS-7 equivalent). Bootstrap-extracted from MUS governance package.

**Structure (46 files: 2 docs + 23 contracts + 17 registries + 4 policies):**
- **MUS-0**: Purpose boundary doc (1 .md)
- **Contracts** (`contracts/`): 23 JSON Schema files — approval_event, blast_radius, changeset, constraint_pack, detector_pack, finding, gate_rule, kid, kl_category, kl_tag, maintenance_run, patch, patch_type, proof_bundle, proposal_pack, release, schedule_entry, snapshot, standard, suppression_rule, template_pack, template, verification_command + contract.meta.json
- **Registries** (`registries/`): 17 registry files — REG-MAINTENANCE-MODES (21 modes MM-01..MM-21), REG-GATES-MUS (6 gates G-MUS-01..06), REG-DETECTOR-PACKS (2 packs), REG-PATCH-TYPES (7 types), REG-SCHEDULES (2 schedules, disabled by default), plus starter registries for baselines, constraint-packs, deprecations, KIDs, KL-categories, KL-tags, releases, standards, suppressions, template-packs, templates, verification-commands
- **Policies** (`policies/`): 4 policy files — MUS-POLICY (consent gates: apply_required + publish_required, budgets_default: 15k token cap, proposal_rules: max 5 per run), KL-POLICY (versioning, review, freshness defaults), TEMPLATE-POLICY (placeholder rules, naming), SECURITY-POLICY (roles, locks, audit requirements)

**Maintenance Modes (21):** MM-01 Health Check through MM-21 Emergency Recovery. Each mode has: execution_class (manual_only|scheduled_allowed), allowed_triggers, allowed_scopes (asset_classes), allowed_detector_packs, hard_constraints (no_apply, no_publish, read_only), required_gates, default_budgets (token_cap, time_limit_ms, max_changes).

**MUS Gates (6):** G-MUS-01 Apply Gate, G-MUS-02 Publish Gate, G-MUS-03 Blast Radius Gate, G-MUS-04 Snapshot Gate, G-MUS-05 Proof Bundle Gate, G-MUS-06 Registry Integrity Gate. Each has predicate (AND/OR clauses), evidence requirements.

**Consent Rules:** Apply requires G-MUS-01; Publish requires G-MUS-02; automation cannot apply/publish per policy.

**Loader** (`Axion/src/core/maintenance/loader.ts`):
- `loadMaintenanceLibrary(repoRoot)` — loads all registries + policies, cached
- `loadMaintenanceDocs(repoRoot)` — all MUS docs
- `loadMaintenanceSchemas(repoRoot)` — all 23 contract schemas from contracts/
- `loadMaintenanceRegistries(repoRoot)` — all 17 registries from registries/
- `loadMaintenancePolicies(repoRoot)` — all 4 policies from policies/
- `getMaintenanceModes()` — returns 21 mode items
- `getGates()` — returns 6 gate rule items
- `getDetectorPacks()` — returns 2 detector pack items
- `getPatchTypes()` — returns 7 patch type items
- `getSchedules()` — returns 2 schedule items
- `getMusPolicy()` — returns MUS-POLICY

**MCP Integration** (`Axion/src/core/mcp/`):
- `model.ts` — MaintenanceMode, MusGateRule, DetectorPack, PatchType types exported
- `controller.ts` — loads MUS library on init, validates mode constraints (status, no_apply) before planning
- `modeRunner.ts` — enforces mode budgets (read_only, max_changes), validates required gates before execution
- `agents/maintenance.ts` — `getMusPolicyGuardrails()` returns consent/budget/proposal rules, `getActiveModeIds()` returns active mode IDs

**API**: 10 read-only `/api/maintenance/*` endpoints (overview, modes, gates, detectors, patches, schedules, policies, schemas, registries, registries/:name) + 8 operational endpoints:
  - `POST /api/maintenance/runs` — Plan new run (mode_id, intent_type, risk_class, units[], baseline_revision)
  - `GET /api/maintenance/runs` — List all runs (sorted newest first)
  - `GET /api/maintenance/runs/:runId` — Get run detail
  - `POST /api/maintenance/runs/:runId/apply` — Apply planned run (enforces no_apply constraint)
  - `POST /api/maintenance/runs/:runId/verify` — Verify applying run
  - `POST /api/maintenance/runs/:runId/complete` — Complete verified run (all units must pass verification)
  - `POST /api/maintenance/runs/:runId/rollback` — Rollback run (writes rollback_record.json)
  - `PATCH /api/maintenance/schedules/:scheduleId` — Toggle schedule enabled/disabled
**MUS Run Storage**: File-based JSON under `Axion/.axion/maintenance_runs/MRUN-XXXXXX/maintenance_manifest.json`
**MUS Run Lifecycle**: planned → applying → verifying → complete; rollback available from applying/verifying/failed/blocked states
**UI**: `/maintenance` page with 7 tabs (Overview, Runs, Modes, Gates & Detectors, Patches & Schedules, Policies, Schemas):
  - **Runs tab**: Create run form (mode selector, intent type, risk class, baseline revision, work unit definition), runs list with status badges, expandable detail panels with unit tables and verification results, action buttons (Apply/Verify/Complete/Rollback) shown per state, auto-refresh every 3s
  - **Patches & Schedules tab**: Toggle switches for schedule enable/disable (persists to registry file)
  - Remaining tabs: mode table with execution class/triggers/permissions/gates/budgets, gate rules with predicate visualization, detector packs with scope info, patch types with risk class, policy JSON viewer, schema property listing
**Registered in:** `schema_registry.v1.json` (23 MUS schema entries), `library_index.v1.json` (MUS entry)
**Health endpoint:** Reports maintenance_library stats (docs, schemas, registries, gates, modes)

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
- `GET /api/health` — system health (stages, gates, KIDs, system/orchestration/gates/policy/intake/canonical/standards/templates/planning/verification/kit/telemetry/audit/maintenance library stats, recent runs)
- `GET /api/config` — pipeline configuration (loads from orchestration library registry with fallback)
- `GET /api/status` — assembly status summary
- `GET /api/reports/:assemblyId` — get reports
- `GET /api/gates` — gates library overview (groups, schema/registry/doc/definition counts)
- `GET /api/gates/schemas` — all 6 gate schemas with content
- `GET /api/gates/registries` — all 2 registries with content
- `GET /api/gates/registries/:name` — single registry by name
- `GET /api/gates/docs` — all gate documents with frontmatter
- `GET /api/gates/docs/:filename` — single document by filename
- `GET /api/policy` — policy library overview (groups, schema/registry/doc/riskClass/policySet counts)
- `GET /api/policy/schemas` — all 4 policy schemas with content
- `GET /api/policy/registries` — all 2 registries with content
- `GET /api/policy/registries/:name` — single registry by name
- `GET /api/policy/docs` — all policy documents with frontmatter
- `GET /api/policy/docs/:filename` — single document by filename
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
- `GET /api/canonical` — canonical library overview (groups, schema/registry/doc/entityType/relationshipType counts)
- `GET /api/canonical/schemas` — all 3 canonical schemas with content
- `GET /api/canonical/registries` — all 2 registries with content
- `GET /api/canonical/registries/:name` — single registry by name
- `GET /api/canonical/docs` — all canonical documents with frontmatter
- `GET /api/canonical/docs/:filename` — single document by filename
- `GET /api/standards` — standards library overview (groups, schemas, registries, packs, counts: docs/schemas/registries/packs/rules/gates)
- `GET /api/standards/schemas` — all 5 standards schemas with content
- `GET /api/standards/registries` — all registries with content
- `GET /api/standards/registries/:name` — single registry by name
- `GET /api/standards/packs` — all pack files with content
- `GET /api/standards/docs` — all standards documents with frontmatter
- `GET /api/standards/docs/:filename` — single document by filename
- `GET /api/templates-library` — templates library overview (groups, schemas, registries, categories, counts: docs/schemas/registries/categoryCount/gates/templateFiles)
- `GET /api/templates-library/schemas` — all 5 templates schemas with content
- `GET /api/templates-library/registries` — all 3 registries with content
- `GET /api/templates-library/registries/:name` — single registry by name
- `GET /api/templates-library/categories` — list of 8 template category directories with file counts
- `GET /api/templates-library/docs` — all templates documents with frontmatter
- `GET /api/templates-library/docs/:filename` — single document by filename
- `GET /api/planning-library` — planning library overview (groups, schemas, registries, counts: docs/schemas/registries/gates/coverageRules)
- `GET /api/planning-library/schemas` — all 5 planning schemas with content
- `GET /api/planning-library/registries` — all 1 registry with content
- `GET /api/planning-library/registries/:name` — single registry by name
- `GET /api/planning-library/docs` — all planning documents with frontmatter
- `GET /api/planning-library/docs/:filename` — single document by filename
- `GET /api/verification-library` — verification library overview (groups, schemas, registries, counts: docs/schemas/registries/gates/proofTypes)
- `GET /api/verification-library/schemas` — all 6 verification schemas with content
- `GET /api/verification-library/registries` — all 3 registries with content
- `GET /api/verification-library/registries/:name` — single registry by name
- `GET /api/verification-library/docs` — all verification documents with frontmatter
- `GET /api/verification-library/docs/:filename` — single document by filename
- `GET /api/kit-library` — kit library overview (groups, schemas, registries, counts: docs/schemas/registries/gates/exportRules)
- `GET /api/kit-library/schemas` — all 1 kit schema with content
- `GET /api/kit-library/registries` — all 3 registries with content
- `GET /api/kit-library/registries/:name` — single registry by name
- `GET /api/kit-library/docs` — all kit documents with frontmatter
- `GET /api/kit-library/docs/:filename` — single document by filename
- `GET /api/telemetry-library` — telemetry library overview (groups, schemas, registries, counts: docs/schemas/registries/gates/eventTypes/sinks)
- `GET /api/telemetry-library/schemas` — all 5 telemetry schemas with content
- `GET /api/telemetry-library/registries` — all 3 registries with content
- `GET /api/telemetry-library/registries/:name` — single registry by name
- `GET /api/telemetry-library/docs` — all telemetry documents with frontmatter
- `GET /api/telemetry-library/docs/:filename` — single document by filename
- `GET /api/audit-library` — audit library overview (groups, schemas, registries, counts: docs/schemas/registries/gates/actionTypes)
- `GET /api/audit-library/schemas` — all 3 audit schemas with content
- `GET /api/audit-library/registries` — all 2 registries with content
- `GET /api/audit-library/registries/:name` — single registry by name
- `GET /api/audit-library/docs` — all audit documents with frontmatter
- `GET /api/audit-library/docs/:filename` — single document by filename
- `GET /api/intake-library` — intake library overview (groups, schema/registry/doc/enum/crossFieldRule/normalizationRule counts)
- `GET /api/intake-library/schemas` — all 7 intake schemas with content
- `GET /api/intake-library/registries` — all 3 registries with content
- `GET /api/intake-library/registries/:name` — single registry by name
- `GET /api/intake-library/docs` — all intake documents with frontmatter
- `GET /api/intake-library/docs/:filename` — single document by filename
- `GET /api/maintenance` — maintenance library overview (modes, gates, detectors, patches, schedules, policies, schemas, registries summary)
- `GET /api/maintenance/modes` — all 21 maintenance modes
- `GET /api/maintenance/gates` — all 6 MUS gates
- `GET /api/maintenance/detectors` — detector packs
- `GET /api/maintenance/patches` — patch types
- `GET /api/maintenance/schedules` — schedules
- `GET /api/maintenance/policies` — all 4 policies
- `GET /api/maintenance/schemas` — all 23 contract schemas
- `GET /api/maintenance/registries` — all 17 registries with item counts
- `GET /api/maintenance/registries/:name` — single registry by name
- `POST /api/maintenance/runs` — plan new maintenance run (mode_id, intent_type, risk_class, units[], baseline_revision)
- `GET /api/maintenance/runs` — list all maintenance runs
- `GET /api/maintenance/runs/:runId` — get run detail
- `POST /api/maintenance/runs/:runId/apply` — apply planned run
- `POST /api/maintenance/runs/:runId/verify` — verify applying run
- `POST /api/maintenance/runs/:runId/complete` — complete verified run
- `POST /api/maintenance/runs/:runId/rollback` — rollback run
- `PATCH /api/maintenance/schedules/:scheduleId` — toggle schedule enabled/disabled
- `POST /api/uploads` — upload files (multipart/form-data, up to 10 files, 50MB limit per file)
- `GET /api/uploads/:id` — download uploaded file
- `DELETE /api/uploads/:id` — delete uploaded file

### Pipeline Runner (server/pipeline-runner.ts)
- Spawns `npx tsx Axion/src/cli/axion.ts run` as child process
- Parses stdout for stage progress and gate results
- Updates `pipeline_runs` and `assemblies` in real-time
- Stores run_id and run artifacts path on completion
- Writes `intakePayload` to `.axion/runs/<run_id>/intake/raw_submission.json` before S1 stage if available
- Kill switch: `killPipeline(assemblyId)` sends SIGTERM then SIGKILL after 5s, marks pending stages as `cancelled`, updates run/assembly status to `failed`. Exposed via `POST /api/assemblies/:id/kill`. Handles stale running state (no live process) by cleaning up DB directly.
- Process tracking: `runningProcesses` Map keyed by assemblyId stores child process handle, pipelineRunId, startTime. Cleaned up on process close. `isRunning(assemblyId)` export for checking.

### Assembly Detail UI (App/src/pages/assembly.tsx)
- Status banners: Running (blue, spinner, progress bar, elapsed timer, current stage "Stage X of N — Name", Stop button), Failed (red, alert icon, error message or failed stage name), Completed (green, checkmark, stage count and duration)
- Elapsed timer: `useElapsedTime` hook ticks every second while pipeline is running
- Kill button: Header + Overview both show "Stop Pipeline" (red) when running, with confirm dialog. Replaces "Run Pipeline" button during execution
- Latest run selection: `runs[0]` (API returns newest-first via `orderBy(desc(startedAt))`)
- Cancelled stage status: Orange dots in PipelineProgress, "Remaining" label replaces "Pending" when cancelled stages exist

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
- `/gates` — Gates Library: 4 tabs (Gates, Documents, Schemas, Registries) for GATE-0 through GATE-6, 8 gate definitions with predicates/severity/evidence
- `/policy` — Policy Library: 4 tabs (Policy, Documents, Schemas, Registries) for POL-0 through POL-5, 3 risk classes with color-coded cards, override permission matrix, policy sets
- `/canonical` — Canonical Library: 4 tabs (Canonical, Documents, Schemas, Registries) for CAN-0 through CAN-7, entity type grid with canonical key templates, relationship type constraints table, unknowns model overview, canonical gates list
- `/standards` — Standards Library: 4 tabs (Standards, Documents, Schemas, Packs) for STD-0 through STD-6, standards pack grid with scope badges, rules by type/severity, 6 standards gates (STD-GATE-01..06) mapped to G3_STANDARDS_RESOLVED
- `/templates-library` — Templates Library: 4 tabs (Templates, Documents, Schemas, Registries) for TMP-0 through TMP-7, template registry with category/profile/risk badges, 8-category ordering, completeness thresholds, 6 template gates (TMP-GATE-01..06) mapped to G4/G5
- `/planning-library` — Planning Library: 4 tabs (Planning, Documents, Schemas, Registries) for PLAN-0 through PLAN-6, planning artifacts overview (WBS/AMAP/BUILD_PLAN), 7 sequencing phases, coverage rules table, 6 planning gates (PLAN-GATE-01..06) mapped to G6_PLAN_COVERAGE
- `/verification-library` — Verification Library: 4 tabs (Verification, Documents, Schemas, Registries) for VER-0 through VER-7, proof types table, completion criteria (unit_done + run_done), command policy rules, 7 verification gates (VER-GATE-01..07) mapped to G7_VERIFICATION
- `/kit-library` — Kit Library: 4 tabs (Kit, Documents, Schemas, Registries) for KIT-0 through KIT-6, kit tree structure (4 folders + 2 files), manifest schema summary, export rules, 6 kit gates (KIT-GATE-01..06) with severity badges, compatibility info
- `/telemetry-library` — Telemetry Library: 4 tabs (Telemetry, Documents, Schemas, Registries) for TEL-0 through TEL-6, event types table, run metrics overview, sink policy cards, redaction overview, privacy policy summary, 5 telemetry gates (TEL-GATE-01..05)
- `/audit-library` — Audit Library: 4 tabs (Audit, Documents, Schemas, Registries) for AUD-0 through AUD-7, action types table (13 types across 6 categories), actor roles (4), target types (7), audit log overview, integrity levels (3), retention policy, redaction + export rules, 6 audit gates (AUD-GATE-01..06)
- `/intake-library` — Intake Library: 4 tabs (Intake, Documents, Schemas, Registries) for INT-0 through INT-7, field enum tables with aliases, cross-field rules IF/THEN visualization, normalization rule cards
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
  - `intake/` — 47 files: 25 INT-0 through INT-7 docs + schemas/ (7) + registries/ (3) + 12 legacy flat files
  - `canonical/` — 47 files: 30 CAN-0 through CAN-7 docs + schemas/ (3) + registries/ (2) + 12 legacy flat files
  - `standards/` — 31 new files (24 STD-0 through STD-6 docs + schemas/ (5) + registries/ (1) + packs/ (11, 10 legacy + 1 new)) + 7 legacy flat files
  - `templates/` — 35 new files (27 TMP-0 through TMP-7 docs + schemas/ (5) + registries/ (3)) + 8 legacy flat files + 8 category directories with 533 .md template files
  - `planning/` — 30 new files (24 PLAN-0 through PLAN-6 docs + schemas/ (5) + registries/ (1)) + 6 legacy flat files
  - `gates/` — Gates Library (GATE-0 through GATE-6). See Gates Library section below.
  - `verification/` — 35 new files (26 VER-0 through VER-7 docs + schemas/ (6) + registries/ (3)) + 8 legacy flat files
  - `kit/` — 28 new files (24 KIT-0 through KIT-6 docs + schemas/ (1) + registries/ (3)) + 9 legacy flat files
  - `orchestration/` — Pipeline execution contracts and run lifecycle (ORC-0 through ORC-7). See Orchestration Library section below.
  - `policy/` — Policy Library (POL-0 through POL-5). See Policy Library section below.
  - `audit/` — 33 new files (28 AUD-0 through AUD-7 docs + schemas/ (3) + registries/ (2)) + 1 legacy flat file
  - `telemetry/` — 30 new files (22 TEL-0 through TEL-6 docs + schemas/ (5) + registries/ (3)) + 3 legacy flat files
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

### Gates Library (`Axion/libraries/gates/`)
Formal Gate DSL and evaluation contract library (GATE-0 through GATE-6) defining how pass/fail checks are expressed, what data gates read, how evidence is collected, and how gate outcomes interact with run control.

**Structure (31 files):**
- 22 docs (GATE-0: purpose/boundaries, GATE-1: gate definition model/determinism/validation, GATE-2: DSL grammar/expression validation/determinism/validation, GATE-3: evaluation runtime/evidence collection/determinism/validation, GATE-4: gate report model/determinism/validation, GATE-5: determinism+replay/replay evidence/validation, GATE-6: minimum viable set/definition of done/minimal tree)
- 6 schemas: `gate_definition.v1`, `gate_registry.v1`, `gate_eval_request.v1`, `gate_eval_trace.v1`, `gate_report.v1`, `gate_replay_request.v1`
- 2 registries: `gate_dsl_functions.v1.json` (6 DSL functions: has_artifact, coverage, maturity_at_least, targets_contains, ledger_has, allow_override), `gate_registry.axion.v1.json` (8 gate definitions for PIPE-AXION-V1)
- 1 template: `gate_report.example.json`

**Loader** (`Axion/src/core/gates/loader.ts`):
- `loadGatesLibrary(repoRoot)` — loads gate registry + DSL functions, cached
- `loadGatesDocs(repoRoot)` — all GATE-N docs with frontmatter
- `loadGatesSchemas(repoRoot)` — all JSON schemas
- `loadGatesRegistries(repoRoot)` — all registries
- `getGateDefinition(repoRoot, gateId)` — specific gate definition
- `getAllGateDefinitions(repoRoot)` — all 8 gate definitions
- `getDSLFunctions(repoRoot)` — DSL function catalog

**Registered in:** `schema_registry.v1.json` (6 entries), `library_index.v1.json` (2 entries)

### Policy Library (`Axion/libraries/policy/`)
Risk class governance, override policies, precedence rules, and enforcement points (POL-0 through POL-5) defining how policy tiers control gate strictness, override permissions, and executor behavior across the pipeline.

**Structure (25 files):**
- 19 docs (POL-0: purpose/boundary checklist, POL-1: risk class model/determinism/validation, POL-2: override policy model/override rules/validation, POL-3: precedence model/conflict rules/determinism/validation, POL-4: enforcement points/enforcement matrix/determinism/validation, POL-5: minimum viable set/definition of done/minimal tree)
- 4 schemas: `risk_classes.v1`, `override_request.v1`, `override_decision.v1`, `policy_set.v1`
- 2 registries: `risk_classes.v1.json` (3 risk classes: PROTOTYPE/PROD/COMPLIANCE with thresholds, gate_strictness, executor_rules), `policy_sets.v1.json` (baseline POLSET-BASE01 with override_permissions per hook point per risk class)

**Loader** (`Axion/src/core/policy/loader.ts`):
- `loadPolicyLibrary(repoRoot)` — loads risk_classes + policy_sets registries, cached
- `loadPolicyDocs(repoRoot)` — all POL-N docs with frontmatter
- `loadPolicySchemas(repoRoot)` — all JSON schemas
- `loadPolicyRegistries(repoRoot)` — all registries
- `getRiskClass(repoRoot, riskClass)` — specific risk class definition
- `getAllRiskClasses(repoRoot)` — all risk class definitions
- `getPolicySet(repoRoot, policySetId)` — specific policy set
- `getDefaultPolicySet(repoRoot)` — first/default policy set

**Registered in:** `schema_registry.v1.json` (4 entries), `library_index.v1.json` (2 entries)

### Template System
- **Source Templates**: `libraries/templates/` (533 TMP-02 contract files in 8 categories: Product Definition, System Architecture, Experience Design, Data & Information, Integrations & External Services, Operations & Reliability, Security Privacy & Compliance, Application Build). These are READ-ONLY — never modified by runs. Each contains: Header Block, Purpose, Inputs Required, Required Fields, Optional Fields, Rules, Output Format, Cross-References, Skill Level Rules, Unknown Handling, Completeness Gate.
- **Filler Engine**: `filler.ts` reads each template's Output Format (Section 7) and produces a filled document using canonical spec entities (features, roles, workflows, permissions), standards, constraints, and intake data. Supports 5 placeholder types: direct, array, derived, optional, unknown-allowed. TMP-04 precedence: Canonical Spec → Standards → Work Breakdown → Acceptance Map. Garbled heading detection (`isGarbledHeading`) folds broken column-name fragments back under parent headings as tableColumns. Instruction-like sub-headings (no leading digit) fold under preceding numbered heading as description. ALL placeholder sections sent to OpenAI for synthesis (not just knowledge-matched ones); knowledge provides supplementary reference material when available.
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
