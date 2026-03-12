# Axion Project

## Overview
Axion is a robust document-generation and compliance-enforcement system featuring a full-stack web application. It automates the intake, processing, and packaging of information into versioned "kits" through a 10-stage pipeline. The system resolves standards, builds canonical specifications, renders templates, plans work, verifies proofs, and enforces gates to ensure high-quality, compliant outputs. The accompanying web dashboard provides a user interface for managing assemblies, triggering pipeline runs, and browsing generated artifacts. Axion is designed to deliver a premium, mission-critical experience for automated document generation and compliance.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Axion/libraries/knowledge/PILLARS/`.
Do not make changes to the file `Axion/src/cli/axion.ts`.
Do not make changes to template source content files in `Axion/libraries/templates/CONTENT/ITEMS/`.

## System Architecture

### Core Pipeline Mechanics
The Axion pipeline is a 10-stage process (S1_INGEST_NORMALIZE → S10_PACKAGE) with 8 enforced gates (G1–G8). It is fully registry-driven, ensuring deterministic library loading with pinned versions and a proof ledger for evidence policy. All stages produce verifiable, registry-driven artifacts, and all gates pass. Output quality is enforced through features like a keyword-based knowledge bridge, kit bloat elimination, deep template completeness checks, and sharpened AI prompts.

### Control Planes
Axion operates with three formal control planes:
-   **ICP (Internal Control Plane)**: Manages run orchestration, state transitions, policies, and audit logging.
-   **KCP (Kit Control Plane)**: Enforces kit-local rules during the build execution, particularly for agent kits.
-   **MCP (Maintenance Control Plane)**: Handles repository maintenance operations, including dependency upgrades and refactoring.

### Agent Types
Three agent types interact with the system:
-   **IA (Internal Agent)**: Produces Axion outputs under ICP governance.
-   **BA (Build Agent)**: Executes Agent Kits under KCP governance, performing code generation and verification.
-   **MA (Maintenance Agent)**: Performs repository maintenance tasks under MCP governance.

### Build Mode System
The internal Build Mode generates a full project repository from an approved Agent Kit. Key design principles include creating a minimum sufficient artifact set, prioritizing structure first, unit-centric generation, and token-aware architecture. The build process involves Kit Extraction (KEX), Repo Blueprint (RBP) generation, Blueprint-Driven Planning, and a Generation Strategy Engine (GSE) that classifies files into build units, scores complexity, and routes generation to appropriate models. The GSE routes units to Claude models: C0/C1 → deterministic (no AI), C2 → Claude Haiku (simple files), C3/C4 → Claude Sonnet (complex/high-quality generation). Model resolution: `mini` tier = `claude-haiku-4-5`, `full` tier = `claude-sonnet-4-6` (see `resolveModelForStrategy` in `generator.ts`).

### Build Agent Quality (BAQ) Enforcement Layer
A BAQ enforcement layer (`Axion/src/core/baq/`) implements a specification for build quality. This layer includes modules for schema definitions, runtime validation, kit extraction, derived input normalization, repository inventory planning, traceability mapping, and sufficiency evaluation across five dimensions (feature coverage, structural completeness, API coverage, domain coverage, obligation coverage). It integrates hooks into the build process to enforce quality gates and generate detailed build quality and failure reports. All BAQ artifacts are written to the run directory. BAQ validation and gate failures halt the build process.

**Important**: BAQ runs only in the Build Agent runner (`Axion/src/core/build/runner.ts`), NOT in S10 packaging. S10 enforces kit contract validation (GATE-08 / G8_PACKAGE_INTEGRITY) via `validateKitOnDisk` in `Axion/src/core/kit/validate.ts`, which checks KIT-01 folder structure, KIT-02 manifest integrity, and KIT-04 version stamps. The packaging preflight in `Axion/src/core/baq/packagingEnforcement.ts` checks kit contract artifacts (not BAQ artifacts) and manifest-vs-bundle reconciliation.

**BAQ Inventory Scoping**: The repo inventory (`repoInventory.ts`) plans files in two tiers: (1) structural/config files marked `required: true` (package.json, tsconfig, server entry, db schema definitions, auth module), and (2) AI-generated feature files marked `required: false` as aspirational guidance (page components, feature components, API client/route files, domain type files, test proof targets). This prevents G-BQ-03/04/05 gate failures when the Build Agent organizes generated code differently than the aspirational plan. G-BQ-05 coverage threshold is 50%.

### Library Path Resolution
All library loaders use a `resolveFile`/`resolveDir` pattern: try `SYSTEM/contracts/` or `SYSTEM/registries/` first, fall back to old root-level paths. This supports both the reorganized directory structure and legacy layouts:
-   **Standards**: `registryLoader.ts` resolves `standards_index.json` and `resolver_rules.v1.json` from `SYSTEM/contracts/` with root fallback; `loader.ts` resolves registries dir from `SYSTEM/registries/` with `registries/` fallback
-   **Templates**: `loader.ts` resolves registries dir from `SYSTEM/registries/` with `registries/` fallback; `feature_packs.json` loaded from `SYSTEM/contracts/` with root fallback

### Template Library Structure
Template source files live under `Axion/libraries/templates/CONTENT/ITEMS/<FAMILY>/<ID>.md`. The `template_index.json` (at library root) maps template IDs to their `file_path` relative to `libraries/templates/`. Feature packs at `SYSTEM/contracts/feature_packs.json` control which template packs activate based on assembly characteristics (auth, compliance, integrations, routing, etc.). The selector (`selector.ts`) filters templates by active packs, `applies_when` conditions, and skill level. Token usage for template AI synthesis is tracked via `recordUsage` in `filler.ts`.

### Pipeline Stall Detection
An automatic watchdog in `server/pipeline-runner.ts` detects stalled pipeline runs. It tracks activity, warns after 5 minutes of inactivity, and kills runs with more than 10 minutes of inactivity. Heartbeat logging in rendering stages helps prevent false positives. A UI component displays stall warnings and provides "Kill Run" buttons.

### UI/UX - AXION Lab OS
The web application features a premium dark-mode "AXION Lab OS" interface with an Obsidian/charcoal theme, glass panels, and glow borders. The app shell uses a 3-zone layout with a fixed left sidebar, a fixed top command bar, and a scrollable main canvas. It includes reusable UI components for a consistent experience. Key pages include a Command Center dashboard, Assemblies page for fleet management, Workbench for operational console, Library Control Center, Intake Wizard with AI autofill, Analytics Engine with time-series charts and event feeds, and a **Build Quality** operator page (`/build-quality`) for inspecting build quality artifacts. Dedicated dashboards exist for Health, Logs, and Maintenance.

### Build Quality Operator Page
The Build Quality page (`App/src/pages/build-quality.tsx`) is the operator control surface for inspecting why a build passed, degraded, or failed. It reads from BAQ runtime artifacts (kit_extraction, derived_build_inputs, repo_inventory, requirement_trace_map, build_quality_report, generation_failure_report, sufficiency_evaluation) via `/api/baq/runs` endpoints. Features include:
-   **Top bar**: Run selector, decision/status/packaging chips, summary band with 6 coverage metrics
-   **10 tabs**: Overview, Extraction, Derived Plan, Repo Inventory, Traceability, Gen Delta, Gates, Failures, Packaging, History
-   **Right utility rail**: Active blockers, missing artifacts, next best fix recommendation, export actions
-   **Data selectors** (`App/src/lib/baq-selectors.ts`): ~18 selectors transforming raw artifacts into view-model shapes
-   **Empty/partial/error states**: Graceful handling when BAQ data is missing or incomplete

### Web Application Tech Stack
-   **Backend**: Express 5 (API server)
-   **Frontend**: React 19 + Vite 7, TailwindCSS v4 (styling)
-   **Database**: PostgreSQL with Drizzle ORM
-   **Data Fetching**: React Query
-   **Routing**: Wouter
-   **Icons**: Lucide-react

### Database Schema
The database schema includes tables for `assemblies` (project builds), `pipeline_runs` (individual executions), `module_statuses` (per-module tracking), and `reports` (gate and run completion reports).

### Data Flow & Quality Enforcement
Raw submissions are normalized and validated, building a canonical specification. The system resolves standards, selects templates, renders documents, generates work plans, verifies proofs, and assembles the final kit with version pins and SHA-256 manifests. Quality gates are enforced at various stages, including intake, canonical integrity, standards resolution, template completeness, plan coverage, verification, and package integrity.

### Libraries Architecture
Axion uses a modular library architecture with dedicated folders for `intake`, `canonical`, `standards`, `templates`, `planning`, `gates`, `verification`, `kit`, `orchestration`, `policy`, `audit`, `telemetry`, and `system`.

## External Dependencies

-   **OpenAI**: Integrated for AI autofill in intake forms and for enriching pipeline stages (e.g., canonical spec building, work breakdown).
-   **Anthropic Claude**: Used by the Build Agent for code generation.
-   **PostgreSQL**: Primary database.
-   **Drizzle ORM**: For database interactions.
-   **Vite**: Frontend build tool.
-   **TailwindCSS**: CSS framework.
-   **React Query**: For data fetching and caching.
-   **Wouter**: React routing library.
-   **Lucide-react**: Icon library.
-   **Recharts**: Charting library for analytics.
-   **Sonner**: For toast notifications.
-   **cmdk**: For the command palette.
-   **Archiver**: For creating ZIP archives.
-   **Semgrep**: For static analysis in the AVCS suite.
-   **Lighthouse**: For web performance and accessibility audits in the AVCS suite.
-   **Axe-core/cli**: For accessibility testing in the AVCS suite.
-   **Trivy**: For vulnerability scanning in the AVCS suite.
-   **Playwright, k6, ZAP, BackstopJS, pa11y, dependency-check**: Adapter implementations for these tools exist within the AVCS suite.

### AVCS (Axion Verification & Certification System)
The AVCS subsystem (`Axion/src/core/avcs/`) provides automated verification of BA build outputs. It covers **9 certification domains**: build_integrity, functional, security, performance, deployment_readiness, ui, ux, accessibility, enterprise. Each domain has its own evaluator function in `evaluators.ts`. The engine (`engine.ts`) orchestrates domain evaluation, scoring (weighted by `DOMAIN_WEIGHTS`), and verdict computation. A test catalog (`test-catalog.ts`) defines 32 tests across the 9 domains with MVP/Later phase tags. The tool registry (`tool-registry.ts`) and adapter system (`tool-adapters.ts`, `adapters/`) provide external tool integration (Lighthouse, Semgrep, Trivy, etc.). Run data is persisted as JSON files via `store.ts` in `Axion/avcs_data/`. API routes are in `server/avcs-routes.ts`.

### AVCS Remediation System
The remediation pipeline (`runner.ts:remediateFromReport` → `generator.ts:fixUnitsFromFindings`) takes a certification report's remediation manifest and performs targeted AI-driven code fixes. It uses a two-pass strategy: (1) surgical JSON line-range patches, (2) fallback full-file rewrite. Five preservation gates (PG-SIZE, PG-DIFF-RATIO, PG-STRUCTURE, PG-PREAMBLE, PG-ENCODING) prevent destructive fixes. All files are backed up before write for rollback support. Remediation logs, build manifest updates, and zip repackaging are handled post-fix.

**Finding Categories**: Each `CertificationFinding` carries a `finding_category` field:
- `"fix_existing"` (default) — enters the patch pipeline for AI-driven code fixes
- `"generate_missing"` — files the BA never created; these need a build re-run, not patching (skipped from fix pipeline)
- `"structural"` — directory structure / config-level issues; skipped from file-level remediation entirely

**Per-File Details**: Findings carry `per_file_details: Record<string, string>` mapping each affected file path to a specific issue description with line numbers. The LLM fix prompt uses `fileSpecificDetail` (from per-file details) when available, falling back to the generic `findingDescription` otherwise. Enriched evaluators: TODOs, broken imports, secrets, sensitive logging, missing files, oversized files, barrel re-exports, sync I/O.

**Remediation Manifest**: `computeRemediationManifest()` in engine.ts filters findings by category, only including `fix_existing` findings in the file-level manifest. It reports `skipped_structural_count`, `skipped_generate_missing_count`, and `skipped_generate_missing_files` for visibility.