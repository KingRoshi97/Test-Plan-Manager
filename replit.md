# AXION Documentation System - Test Suite

## Overview

This project is dedicated to developing, enhancing, and testing the AXION documentation-first development system. AXION generates comprehensive "Agent Kits" for AI-guided software development, aiming to streamline and standardize the creation of software projects. The system focuses on ensuring robust and reliable code generation through a rigorous testing framework and a well-defined pipeline for documentation and application scaffolding.

## User Preferences

- I want iterative development.
- Ask me before making major changes.
- I prefer detailed explanations.
- Do not make changes to the folder `axion/registry/release_gate_logs/`.
- Do not make changes to the file `axion/registry/release_gate_report.json`.

## System Architecture

AXION operates on a documentation-first principle, generating comprehensive "Agent Kits." The core system design revolves around a structured pipeline, atomic operations for crash resilience, and a robust module system with defined dependencies.

### Core Components and Structure
- **AXION System Code (`axion/`)**: Contains configuration, TypeScript CLI scripts, document templates, and system documentation.
- **Test Suite (`tests/`)**: A comprehensive Vitest-based suite covering unit, integration, validation, core contracts, and end-to-end scenarios.
- **Atomic Writer Library**: Provides crash-resilient file writing using a write-to-tmp then atomic rename pattern, ensuring data integrity.
- **Stack Profile Contract**: `registry/stack_profile.json` serves as the authoritative source for stack configuration within a kit workspace, guiding script behavior and ensuring consistency.
- **Anchor Convention**: Utilizes HTML comment-like anchors (`<!-- AXION:ANCHOR:<ID> -->`) for marker-based patch operations during code generation, facilitating dynamic content injection.

### Pipeline Stages
AXION defines a clear pipeline for kit creation and application development:
0b. **import** (optional): Analyzes an existing repo, produces import report + doc seeds (pre-pipeline)
1.  **kit-create**: Initializes a new Agent Kit workspace.
2.  **docs:scaffold**: Generates and seeds module documentation structures.
3.  **docs:content**: Fills documentation with AI-generated content (draft, review, verify).
4.  **docs:full**: Combines `docs:scaffold` and `docs:content`.
5.  **app:bootstrap**: Generates application boilerplate.
6.  **build-exec**: Executes the build plan, generating a manifest and applying file operations.

### Import Mode v1
`axion-import` is a read-only analysis command for existing repos. It produces artifacts the docs pipeline can refine, without modifying the source.

**CLI**: `npx tsx axion/scripts/axion-import.ts --source-root PATH --build-root PATH --project-name NAME [--emit-manifest] [--json]`

**Outputs** (written to workspace under `registry/`):
- `import_report.json` — Full analysis: languages, frameworks, routes, health endpoints, anchor suggestions, warnings
- `import_facts.json` — Normalized subset: stack_id_candidate, app_dir_candidate, server_entry_candidate, health_path_candidate, anchor_targets
- `import_patch_manifest.json` (with `--emit-manifest`) — Suggested anchor insertions using `patch_file` ops
- Doc seeds in `domains/` (architecture, systems, contracts, frontend, backend) marked with `AXION:IMPORTED:SOURCE_ROOT_HASH`

**Detectors** (generic, regex-based, no AST):
- package.json deps/scripts parsing
- File pattern scanning (server/, src/, app/, pages/)
- Route regex: `app.get("/...")`, `router.post("/...")`, `fastify.get("/...")`
- Next.js API routes: `pages/api/*`, `app/api/*`
- Health endpoint search: `/api/health`, `/health`, `/healthz`

**Stack ID candidates**: `default-web-saas` (frontend+backend), `api-only-node` (backend only), `unknown`
**Confidence**: 0.9 (multiple strong signals), 0.6 (one strong), 0.3 (weak), 0.0 (unknown)

**Safety**: Never writes to source-root. Read-only guarantee tested via tree hash before/after.

### Reconcile v1
`axion-reconcile` deterministically compares imported facts against build-authoritative outputs (stack profile + build plan) to detect drift and produce actionable mismatch reports.

**CLI**: `npx tsx axion/scripts/axion-reconcile.ts --build-root PATH --project-name NAME [--json]`

**Inputs** (all required, read from `registry/`):
- `import_facts.json` — Import truth snapshot (from axion-import)
- `stack_profile.json` — Current intended stack configuration (from scaffold-app)
- `build_plan.json` — What AXION intends to implement (from build-plan)

**Optional metadata** (not required but reported):
- `lock_manifest.json` — Whether docs are locked
- `verify_report.json` — Whether docs are verified

**Output**: `registry/reconcile_report.json` — Versioned, atomically written report with:
- `status`: PASS (no critical mismatches) or FAIL (critical mismatches found)
- `summary`: counts of mismatches by severity (critical/warning/info)
- `mismatches[]`: each with `id`, `category`, `severity`, `imported_value`, `expected_value`, `reason_code`, `suggested_action`, `hints`
- `next_commands`: suggested remediation commands

**5 Comparison Axes**:
1. **STACK_ID**: `import_facts.stack_id_candidate` vs `stack_profile.stack_id` → `STACK_ID_MISMATCH`
2. **ENTRYPOINTS**: `import_facts.server_entry_candidate` vs `stack_profile.conventions.server_entry` → `SERVER_ENTRY_MISMATCH`
3. **HEALTH_ENDPOINT**: `import_facts.health_path_candidate` vs `stack_profile.conventions.health_path` → `HEALTH_PATH_MISMATCH`
4. **ROUTES**: Imported routes vs build_plan route-tagged tasks → `ROUTE_FOUND_NOT_PLANNED` / `ROUTE_PLANNED_NOT_FOUND` / `ROUTES_NOT_AVAILABLE_IN_PLAN`
5. **DEPENDENCIES**: Imported deps vs stack profile expected frameworks → `DEPENDENCY_EXPECTED_NOT_FOUND` (informational in v1)

**Gates** (blocked_by if missing): `MISSING_IMPORT_FACTS`, `MISSING_STACK_PROFILE`, `MISSING_BUILD_PLAN`

**Pipeline position**: Runs after import + scaffold + build-plan. Does NOT require docs lock/verify.

### Core System Contracts and Guarantees
-   **Pipeline Guarantees**: Strict stage execution order (generate → seed → draft → review → verify → lock), enforced module dependencies, and preset-defined module scopes.
-   **Diagnostic Guarantees**: Standardized SCREAMING_SNAKE_CASE reason codes, `blocked_by` responses with detailed status and hints, and known codes like `MISSING_SECTION`.
-   **Interface Guarantees**: Predictable JSON outputs for commands (e.g., `kit-create` emits status, kit_root) and manifest structures, with artifacts stored in consistent locations.
-   **Two-Root Safety**: Ensures the AXION system root is protected and generated kits are isolated within their workspaces, preventing system pollution.

### UI/UX Decisions
The system's interaction is primarily via command-line interface (CLI), with output structured for clarity and machine readability (e.g., JSON reports). The documentation-first approach aims to provide a clear blueprint for development.

## External Dependencies

-   **Vitest**: Used as the primary testing framework.
-   **tsx**: Executes TypeScript files directly without prior compilation.
-   **TypeScript**: Provides type-checking and language features for the entire codebase.
-   **npm**: Used as the package manager within generated application kits and for managing project dependencies.