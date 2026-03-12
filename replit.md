# Axion Project

## Overview
Axion is a robust document-generation and compliance-enforcement system featuring a full-stack web application. It automates the intake, processing, and packaging of information into versioned "kits" through a 10-stage pipeline. The system resolves standards, builds canonical specifications, renders templates, plans work, verifies proofs, and enforces gates to ensure high-quality, compliant outputs. The accompanying web dashboard provides a user interface for managing assemblies, triggering pipeline runs, and browsing generated artifacts. Axion is designed to deliver a premium, mission-critical experience for automated document generation and compliance.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Axion/libraries/templates/`.
Do not make changes to the folder `Axion/libraries/knowledge/PILLARS/`.
Do not make changes to the file `Axion/src/cli/axion.ts`.

### Build Agent Quality (BAQ) Enforcement Layer
New `Axion/src/core/baq/` module implements BAQ-SPEC-01 enforcement spine. Currently Pass 1–2 (Schemas, Types & Extraction Foundation) is complete:

**Module structure** (`Axion/src/core/baq/`):
- `types.ts` — All 6 BAQ schema interfaces (`BAQKitExtraction`, `BAQDerivedBuildInputs`, `BAQRepoInventory`, `BAQRequirementTraceMap`, `BAQBuildQualityReport`, `BAQGenerationFailureReport`), shared enums (`BAQRunStatus`, `BAQSeverity`, `BAQSectionStatus`, `BAQApplicabilityStatus`, `BuildQualityGateId`, `GenerationFailureClass`), 15 hook names
- `validators.ts` — Runtime validation for all 6 schemas with structural checks (required fields, enum validity, type checks) and semantic validation (coverage math consistency, count reconciliation, referential integrity)
- `extraction.ts` — Section presence scanner with 20-section registry, status classifier (consumed/deferred/not_applicable/invalid/missing), critical obligation collector from canonical spec, extraction warning surface. Emits `baq_kit_extraction.json`
- `derivedInputs.ts` — Normalizes extracted authority into subsystem map, feature map, domain model, storage model, API surface, auth model, UI surface map, verification/ops obligations, assumptions, risks. Emits `baq_derived_build_inputs.json`
- `hooks.ts` — `BuildQualityHookRunner` with 15 hook slots, upstream artifact rule enforcement, deterministic evidence rule, `BuildQualityHookContext` and `BuildQualityHookResult` types
- `index.ts` — Barrel export for all types, functions, and classes

**Integration**: BAQ hooks wired into `Axion/src/core/build/runner.ts` — runs `onBuildAuthorityLoaded` → `onKitExtractionStart` → `onKitExtractionComplete` → `onDerivedInputsBuild` before legacy extraction. BAQ artifacts written to `{runDir}/kit_extraction.json` and `{runDir}/derived_build_inputs.json` (in run dir, separate from legacy `build/kit_extraction.json`). **Hard blocking**: BAQ validation failures, gate failures (G-BQ-01, G-BQ-02), and blocking hook failures all throw errors that halt the build. Critical obligations from extraction are consumed and normalized into verification/ops obligations in derived inputs.

**BAQ Gates**: G-BQ-01 (Extraction Completeness) and G-BQ-02 (Derived Inputs Completeness) implemented. Remaining gates G-BQ-03 through G-BQ-07 will be added in Tasks #15–#17.

### Pipeline Stall Detection
Automatic watchdog in `server/pipeline-runner.ts` detects stalled pipeline runs:
- Tracks `lastActivityAt` per running process, updated on every stdout stage-progress line
- 30-second interval checker warns at 5 minutes and kills runs with >10 minutes of inactivity (configurable via `AXION_STALL_TIMEOUT_MS` env var)
- S7_RENDER_DOCS heartbeat logging: per-template start/complete logs and per-LLM-call logs in `evidence.ts`/`filler.ts` keep stall detector alive during long OpenAI batches
- `getPipelineStatus()` returns live status of all running processes
- `GET /api/pipeline/status` endpoint exposes `{assemblyId, runId, currentStage, startTime, lastActivityAt, elapsedMs, stalledMs}` per active run
- UI polling via `App/src/hooks/use-pipeline-status.ts` — shared hook with stall level detection (warning >2min, critical >4min)
- Dashboard, Workbench, and Runs pages show stall warnings, auto-kill countdown, and "Kill Run" buttons

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
-   **IA (Internal Agent)**: Produces Axion outputs under ICP governance (e.g., canonical build, template selection).
-   **BA (Build Agent)**: Executes Agent Kits under KCP governance, performing code generation and verification.
-   **MA (Maintenance Agent)**: Performs repository maintenance tasks under MCP governance.

### Build Mode System
The internal Build Mode generates a full project repository from an approved Agent Kit. Key design principles include creating a minimum sufficient artifact set, prioritizing structure first, unit-centric generation, and token-aware architecture to optimize model interactions. The build process involves Kit Extraction (KEX), Repo Blueprint (RBP) generation, Blueprint-Driven Planning, and a Generation Strategy Engine (GSE) that classifies files into build units, scores complexity, and routes generation to appropriate models (deterministic or AI).

### UI/UX - AXION Lab OS
The web application features a premium dark-mode "AXION Lab OS" interface.
-   **Visual System**: Obsidian/charcoal theme with CSS custom properties for glass panels, glow borders, and status colors.
-   **App Shell**: 3-zone layout with a fixed left sidebar, a fixed top command bar, and a scrollable main canvas.
-   **Navigation**: Grouped sidebar with collapsible sections, active item highlighting, and live badge counts.
-   **Component Design**: Reusable premium UI components like `GlassPanel`, `MetricCard`, `StatusChip`, and `StageRail` for a consistent, high-fidelity experience.
-   **Key Pages**:
    -   **Command Center**: Mission control dashboard displaying live system status, metrics, and operational areas.
    -   **Assemblies Page**: Comprehensive fleet management with filtering, sorting, and quick detail views.
    -   **Workbench**: Operational console for individual assemblies, featuring stage progress, detailed inspectors, and tabs for intake, artifacts, configuration, and build processes.
    -   **Library Control Center**: Governance-focused interface for managing all Axion libraries (e.g., knowledge, templates, gates).
    -   **Intake Wizard**: Multi-step form for creating new assemblies with AI autofill integration.
    -   **Analytics Engine**: Full analytics platform with time-series trend charts (Recharts), configurable granularity (1h/1d/7d), period-over-period comparison overlays, collapsible domain sections, dimension breakdown tables, paginated event activity feed, auto-refresh with countdown, and CSV export.
    -   **System Surfaces**: Dedicated dashboards for Health, Logs, and Maintenance, all designed with the premium dark theme.

### Web Application Tech Stack
-   **Backend**: Express 5 (API server)
-   **Frontend**: React 19 + Vite 7, TailwindCSS v4 (styling)
-   **Database**: PostgreSQL with Drizzle ORM
-   **Data Fetching**: React Query
-   **Routing**: Wouter
-   **Icons**: Lucide-react

### Database Schema
The database schema, defined in `shared/schema.ts`, includes tables for `assemblies` (project builds with metadata and intake payload), `pipeline_runs` (individual executions with stage statuses), `module_statuses` (per-module tracking), and `reports` (gate and run completion reports).

### Data Flow & Quality Enforcement
-   **Intake & Normalization**: Raw submissions are normalized, validated against Zod schemas, and used to build a canonical specification.
-   **Standards & Templates**: The system resolves standards, selects appropriate templates, and renders documents with placeholder resolution.
-   **Work Planning & Proofs**: A work breakdown structure is generated, and proofs are verified against completion criteria.
-   **Kit Packaging**: The final kit bundle is assembled with version pins and SHA-256 manifests.
-   **Quality Gates**: Enforced at various stages, including intake validity, canonical integrity, standards resolution, template selection and completeness, plan coverage, verification, and package integrity.

### Libraries Architecture
Axion uses a modular library architecture, with dedicated folders for `intake`, `canonical`, `standards`, `templates`, `planning`, `gates`, `verification`, `kit`, `orchestration`, `policy`, `audit`, `telemetry`, and `system`. Each library contains its own documentation, schemas, and registries, often with governance-layer enhancements for control and traceability.

## External Dependencies

-   **OpenAI**: Integrated for AI autofill in intake forms (`gpt-4o`) and for enriching pipeline stages like canonical spec building and work breakdown (`gpt-4o`).
-   **Anthropic Claude**: Used by the Build Agent for code generation (`claude-sonnet-4-6` for full tier, `claude-haiku-4-5` for mini tier) via `@anthropic-ai/sdk` and Replit AI Integrations.
-   **PostgreSQL**: The primary database for storing application data.
-   **Drizzle ORM**: Used for database interactions with PostgreSQL.
-   **Vite**: Frontend build tool.
-   **TailwindCSS**: CSS framework for styling.
-   **React Query**: For data fetching and caching in the frontend.
-   **Wouter**: A small routing library for React.
-   **Lucide-react**: Icon library.
-   **Recharts**: Charting library for analytics trend visualizations (line/area charts with tooltips and comparison overlays).
-   **Sonner**: For toast notifications.
-   **cmdk**: For the command palette.
-   **Archiver**: Used for creating ZIP archives (for kit exports).
-   **Semgrep**: Integrated for static analysis in the AVCS suite.
-   **Lighthouse**: Integrated for web performance and accessibility audits in the AVCS suite.
-   **Axe-core/cli**: Integrated for accessibility testing in the AVCS suite.
-   **Trivy**: Integrated for vulnerability scanning in the AVCS suite.
-   **Playwright, k6, ZAP, BackstopJS, pa11y, dependency-check**: These tools have adapter implementations within the AVCS suite, though their availability depends on the execution environment.