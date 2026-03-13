# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system. It automates the intake, processing, and packaging of information into versioned "kits" through a 10-stage pipeline with 8 enforced gates. The system resolves standards, builds canonical specifications, renders templates, plans work, verifies proofs, and enforces gates to ensure high-quality, compliant outputs. A web dashboard provides a user interface for managing assemblies, triggering pipeline runs, and browsing generated artifacts. Axion is designed to deliver a premium, mission-critical experience for automated document generation and compliance. It aims to provide a robust solution for automated document generation and compliance, addressing market needs for efficiency and quality assurance in complex document workflows.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Axion/libraries/knowledge/PILLARS/`.
Do not make changes to the file `Axion/src/cli/axion.ts`.
Do not make changes to template source content files in `Axion/libraries/templates/CONTENT/ITEMS/`.

## System Architecture

### Core Pipeline Mechanics
The Axion pipeline is a 10-stage process (S1_INGEST_NORMALIZE → S10_PACKAGE) with 8 enforced gates (G1–G8). It is registry-driven, ensuring deterministic library loading with pinned versions and a proof ledger. All stages produce verifiable artifacts, and all gates must pass. Output quality is enforced through features like a keyword-based knowledge bridge, kit bloat elimination, deep template completeness checks, and sharpened AI prompts.

### Control Planes
Axion operates with three formal control planes:
-   **ICP (Internal Control Plane)**: Manages run orchestration, state transitions, policies, and audit logging.
-   **KCP (Kit Control Plane)**: Enforces kit-local rules during build execution.
-   **MCP (Maintenance Control Plane)**: Handles repository maintenance operations.

### Agent Types
Three agent types interact with the system:
-   **IA (Internal Agent)**: Produces Axion outputs under ICP governance.
-   **BA (Build Agent)**: Executes Agent Kits under KCP governance, performing code generation and verification.
-   **MA (Maintenance Agent)**: Performs repository maintenance tasks under MCP governance.

### Build Mode System
The Build Mode generates a full project repository from an approved Agent Kit. It prioritizes a minimum sufficient artifact set, structure-first design, unit-centric generation, and token-aware architecture. The process involves Kit Extraction (KEX), Repo Blueprint (RBP) generation, Blueprint-Driven Planning, and a Generation Strategy Engine (GSE) that classifies files into build units and routes generation to appropriate Claude models (Haiku for simple files, Sonnet for complex/high-quality generation).

### Build System Architecture (Modular)
The build system core is split into focused modules under `Axion/src/core/build/`:
-   **generator.ts**: Core orchestration — API client, `generateCode`, `generateUnit`, `generateRepoUnitCentric`, `generateRepo`, caching, config constants. Accepts and propagates `AbortSignal` through the entire call chain.
-   **deterministic-generators.ts**: ~30 `gen*` functions for deterministic file generation without LLMs (config files, manifests, etc.), plus helpers (`hexToShades`, `toSnakeCase`, `toCamelCase`).
-   **prompt-builders.ts**: System/user prompt construction, design directives, file manifests, document extraction helpers.
-   **remediation.ts**: AVCS remediation pipeline — `fixUnitsFromFindings`, patch parsing/application, preservation gates, diff stats.
-   **runner.ts**: Build orchestration with global timeout (20min), per-phase timeouts (extraction 2min, blueprint 2min, GSE 1min), heartbeat watchdog (30s), and abort signal propagation.
-   **gse.ts**: Generation Strategy Engine — classifies files into build units and plans wave execution.

### Build Performance Optimizations
The BA build system includes:
-   **Parallel wave execution**: Units run concurrently using `p-limit`.
-   **Deterministic routing**: Certain files are generated deterministically without LLMs if they have quality spec-aware generators.
-   **Model downgrading**: Trivial AI files are routed to more cost-effective models (e.g., Haiku instead of Sonnet).
-   **Scoped file manifests**: LLM calls receive context-specific file manifests, not the full repository.
-   **Auto-split oversized units**: Units with many files are split to manage LLM context.
-   **Unit-level build cache**: Caches build inputs to skip LLM calls on re-builds.
-   **Global build timeout**: 20-minute hard limit (`BUILD_GLOBAL_TIMEOUT_MS`) with AbortController propagation through all generation calls.
-   **Phase timeouts**: Per-phase limits for extraction (2min), blueprint (2min), and GSE (1min) with `PhaseTimer` tracking.
-   **Heartbeat watchdog**: 30-second interval logging during generation for liveness monitoring.
-   **API call timeouts**: Each LLM call has a configurable timeout (`BUILD_API_TIMEOUT_MS`, default 90s) to prevent stalled API connections from blocking the entire build.
-   **Automatic retry with backoff**: Failed/timed-out API calls retry once (`BUILD_API_RETRIES`, default 1) with exponential backoff. Rate-limited (429) and overloaded (529) responses are retried with appropriate delays.
-   **Per-unit timeout**: Each build unit has a max execution time (`BUILD_UNIT_TIMEOUT_MS`, default 5min) so a single stuck unit cannot block the wave.
-   **GSE required**: Legacy file-centric generation path removed; GSE strategy plan is mandatory for all builds.

### Build Agent Quality (BAQ) Enforcement Layer
A BAQ enforcement layer (`Axion/src/core/baq/`) implements build quality specifications through schema definitions, runtime validation, and sufficiency evaluation across five dimensions. It integrates hooks into the build process to enforce quality gates and generate detailed reports. BAQ validation and gate failures halt the build. BAQ inventory planning uses two tiers: structural/config files marked `required: true` and AI-generated feature files marked `required: false`.

### Library Path Resolution
All library loaders use a `resolveFile`/`resolveDir` pattern, prioritizing `SYSTEM/contracts/` or `SYSTEM/registries/` before falling back to legacy root-level paths.

### Template Library Structure
Template source files are stored under `Axion/libraries/templates/CONTENT/ITEMS/`. The `template_index.json` maps template IDs to file paths. `feature_packs.json` controls template pack activation based on assembly characteristics.

### Pipeline Stall Detection
An automatic watchdog detects stalled pipeline runs, warning after 5 minutes and killing runs after 10 minutes of inactivity.

### UI/UX - AXION Lab OS
The web application features a dark-mode "AXION Lab OS" interface with a 3-zone layout. Key pages include a Command Center, Assemblies page, Workbench, Library Control Center, Intake Wizard, Analytics Engine, and a dedicated **Build Quality** operator page (`/build-quality`).

### Build Quality Operator Page
The Build Quality page (`App/src/pages/build-quality.tsx`) allows operators to inspect build outcomes. It reads BAQ runtime artifacts via `/api/baq/runs` endpoints, offering a run selector, status chips, summary metrics, and ten detailed tabs for analysis (Overview, Extraction, Derived Plan, Repo Inventory, Traceability, Gen Delta, Gates, Failures, Packaging, History).

### Assembly Preview System
The Preview Tab (`AssemblyPreviewTab.tsx`) allows operators to physically assess generated build output in an embedded iframe. Key components:
-   **Preview Resolver** (`server/preview-resolver.ts`): Centralized service that resolves preview status for any assembly by inspecting build manifests, dist directories, compilation state, and source files. Returns a typed `PreviewResolution` with status (`none`, `building`, `preparing`, `ready`, `failed`, `expired`, `uncompiled`, `compiling`).
-   **Preview Compiler** (`server/preview-compiler.ts`): Compiles unbuilt React/Vite projects on-demand. Pipeline: `pruneDevDependencies` → `ensureTsconfigNode` → `relaxTsconfig` → `patchViteConfig` (rewrites with `base: './'`) → `fixEmptyStubs` → `removeServerImports` → `npm install && vite build`. Status is tracked in-memory (cleared on restart).
-   **DB Persistence** (`assembly_run_previews` table): Stores resolved preview state per run ID with status, URLs, embeddability, environment, and error info.
-   **Static File Serving**: `/api/preview/:runId/{*filePath}` serves compiled assets from `dist/` with SPA fallback (serves `dist/index.html` for unknown `dist/*` paths).
-   **Frontend Components**: `PreviewViewport` (iframe with device mode switching), `PreviewToolbar` (status badge, device toggles, refresh/reload/external/copy actions), `PreviewMetaPanel` (metadata sidebar), `PreviewStateCard` (status-specific empty states).

### Web Application Tech Stack
-   **Backend**: Express 5
-   **Frontend**: React 19 + Vite 7, TailwindCSS v4
-   **Database**: PostgreSQL with Drizzle ORM
-   **Data Fetching**: React Query
-   **Routing**: Wouter
-   **Icons**: Lucide-react

### Data Flow & Quality Enforcement
Raw submissions are normalized and validated to build a canonical specification. The system resolves standards, selects templates, renders documents, generates work plans, verifies proofs, and assembles the final kit. Quality gates are enforced at various stages, including intake, canonical integrity, standards resolution, template completeness, plan coverage, verification, and package integrity.

### Libraries Architecture
Axion uses a modular library architecture with dedicated folders for specific functionalities like `intake`, `canonical`, `standards`, `templates`, `planning`, `gates`, `verification`, `kit`, `orchestration`, `policy`, `audit`, `telemetry`, and `system`.

### AVCS (Axion Verification & Certification System)
The AVCS subsystem (`Axion/src/core/avcs/`) provides automated verification of BA build outputs across 9 certification domains. It orchestrates domain evaluation, scoring, and verdict computation using a test catalog and integrates external tools via an adapter system.

### AVCS Remediation System
The remediation pipeline takes certification report findings and performs targeted AI-driven code fixes, using a two-pass strategy (surgical patches then full-file rewrite). Five preservation gates prevent destructive fixes. Findings are categorized (`fix_existing`, `generate_missing`, `structural`) to guide remediation.

## External Dependencies

-   **OpenAI**: For AI autofill in intake forms and pipeline stage enrichment.
-   **Anthropic Claude**: Used by the Build Agent for code generation.
-   **PostgreSQL**: Primary database.
-   **Drizzle ORM**: Database interactions.
-   **Vite**: Frontend build tool.
-   **TailwindCSS**: CSS framework.
-   **React Query**: Data fetching and caching.
-   **Wouter**: React routing.
-   **Lucide-react**: Icon library.
-   **Recharts**: Charting.
-   **Sonner**: Toast notifications.
-   **cmdk**: Command palette.
-   **Archiver**: ZIP archives.
-   **Semgrep**: Static analysis (AVCS).
-   **Lighthouse**: Web performance/accessibility audits (AVCS).
-   **Axe-core/cli**: Accessibility testing (AVCS).
-   **Trivy**: Vulnerability scanning (AVCS).
-   **Playwright, k6, ZAP, BackstopJS, pa11y, dependency-check**: Adapter implementations for these tools exist within the AVCS suite.