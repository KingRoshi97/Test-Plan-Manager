# AXION Documentation System

## Version
**V1 — Released February 8, 2026**

This is the first stable release of the AXION system. All core pipeline stages, the web dashboard, and workspace management are functional end-to-end.

### V1 Feature Summary
- **Full Pipeline Orchestration**: Automated chaining of all pipeline steps from project idea to packaged Agent Kit (kit-create → seed → generate → review → draft → verify → lock → build-plan → build-exec → package)
- **Assembly Control Room**: Real-time SSE streaming of pipeline execution with step-level timing, progress tracking, and log display
- **Retry from Failed Step**: Resume pipeline execution from the exact step that failed, skipping previously successful steps
- **Individual Actions**: Trigger any pipeline step independently (import, reconcile, iterate, build-plan, build-exec, deploy, clean, status, next, activate) from the Assembly Control Room
- **Workspaces Management**: Dedicated page listing all workspaces with on-disk status indicators (Registry, Domains, App), delete functionality, and orphaned record cleanup
- **Kit Export**: Package completed Agent Kits into distributable zip bundles
- **Test Suite Runner**: Execute Vitest test suites directly from the dashboard with color-coded results
- **System Health Monitoring**: Health check page for system diagnostics
- **Pipeline Logs Viewer**: Browse and inspect logs from all pipeline runs
- **Two-Root Architecture**: Strict isolation between immutable AXION system code and generated project workspaces
- **UNKNOWN Detection**: Automatic scanning for placeholder content in documentation with agent-driven content filling
- **Transient Failure Retry**: Exponential backoff for ENOENT, ETIMEDOUT, ECONNRESET, and OOM-kill errors
- **Dark/Light Theme**: Full theme support across the dashboard
- **Path Traversal Protection**: Hardened workspace delete endpoint with input validation

## Overview
This project develops and tests the AXION documentation-first development system. AXION generates "Agent Kits" for AI-guided software development, aiming to standardize and streamline software project creation through rigorous testing and a well-defined pipeline for documentation and application scaffolding. The system focuses on robust and reliable code generation, ensuring data integrity and consistency across various stages of development. It integrates a web-based dashboard for orchestrating the development pipeline, providing a comprehensive solution for managing project ideas from conception to deployment.

## User Preferences
- I want iterative development.
- Ask me before making major changes.
- I prefer detailed explanations.
- Do not make changes to the folder `axion/registry/release_gate_logs/`.
- Do not make changes to the file `axion/registry/release_gate_report.json`.

## System Architecture
AXION employs a documentation-first approach to generate comprehensive "Agent Kits," structured around a pipeline with atomic operations and a robust module system. The architecture is designed for crash resilience and data integrity, ensuring reliable software generation.

### Core Components and Structure
- **AXION System Code (`axion/`)**: Manages configuration, TypeScript CLI, document templates, and system documentation.
- **Test Suite (`tests/`)**: A Vitest-based suite for unit, integration, validation, core contracts, and end-to-end testing.
- **Atomic Writer Library**: Ensures data integrity through crash-resilient file writing using a write-to-tmp then atomic rename pattern.
- **Stack Profile Contract (`registry/stack_profile.json`)**: Authoritative source for stack configuration within a kit workspace.
- **Anchor Convention**: Uses HTML comment-like anchors (`<!-- AXION:ANCHOR:<ID> -->`) for dynamic content injection during code generation.

### Script Organization
Pipeline scripts under `axion/scripts/` are split into two categories:
- **Pipeline scripts (`.mjs`)**: `draft`, `generate`, `init`, `lock`, `package`, `review`, `seed`, `verify` — invoked by the orchestrator and dashboard. Shared logic lives in `_axion_module_mode.mjs`, with constants loaded from `axion/config/domains.json` at runtime.
- **Auxiliary guardrail scripts (`.ts`)**: `doctor`, `preflight`, `repair`, `reconcile`, `verify-seams`, `hash-templates`, `release-check`, `status`, `next`, `iterate`, `import`, `kit-create`, `scaffold-app`, `build-plan`, `build`, `build-exec`, `activate`, `deploy`, `overhaul`, `package` (workspace mode), `clean`, `test`, `docs-check`, `run`, `run-app`, `upgrade` — invoked via `tsx` for workspace operations and system validation.
- **`axion-package`** exists in both forms: `.mjs` creates domain-based zip bundles, `.ts` creates workspace-scoped packages (used by routes.ts).

### Pipeline Stages
AXION defines a clear pipeline for kit creation and application development:
- **import**: Analyzes existing repositories to produce import reports and documentation seeds.
- **kit-create**: Initializes new Agent Kit workspaces.
- **docs:scaffold**: Generates and seeds module documentation structures.
- **docs:content**: Fills documentation with AI-generated content.
- **docs:full**: Combines scaffolding and content generation for documentation.
- **app:bootstrap**: Generates application boilerplate.
- **build-exec**: Executes the build plan, generating a manifest and applying file operations.

### Key Tools & Processes
- **`axion-import`**: A read-only analysis tool for existing repositories, producing artifacts for the documentation pipeline without modifying source code.
- **`axion-reconcile`**: Deterministically compares imported facts against build-authoritative outputs to detect drift and report mismatches.
- **`axion-iterate`**: An orchestration wrapper that chains AXION primitives, enforcing gates and producing `next_commands` for remediation. It operates deterministically, requiring explicit `--allow-apply` for changes.

### UNKNOWN Detection & Content Fill System (Feb 2026)
- **`server/ai-content-fill.ts`**: Full-stack content-fill module that scans ALL `.md` template files across every domain module for UNKNOWN placeholders. Supports both automated pipeline fills and interactive revision.
- **Document Hierarchy**: Files are prioritized for fill order: RPBS → REBS → README → DDES → UX_Foundations → UI_Constraints → DIM → SCREENMAP → TESTPLAN → COMPONENT_LIBRARY → COPY_GUIDE → BELS → OPEN_QUESTIONS. Higher-level docs cascade context to downstream templates.
- **Template-Type-Aware Prompting**: DOC_TYPE_MAP provides tailored AI guidance for each document type (13 types including RPBS, REBS, BELS, DDES, DIM, TESTPLAN, etc.).
- **Interactive Revision Flow**: "Revise UNKNOWNs" button in Assembly Control Room:
  1. Scans all docs, finds the highest-priority doc with UNKNOWNs.
  2. Generates targeted questions about UNKNOWN sections for user to provide real context.
  3. User answers questions, then "Fill & Cascade" fills the target doc with user context and runs a full pass across ALL docs using the newly-filled content.
  4. Drops to the next highest-priority doc with remaining UNKNOWNs and repeats until all resolved.
- **API Endpoints**:
  - `GET /api/scan-unknowns` — Returns scan report of all .md files with UNKNOWNs.
  - `POST /api/revise-unknowns/start` — Finds next target doc, generates questions.
  - `POST /api/revise-unknowns/fill` — Fills target with user context, cascades to all docs, returns next target.
- **Lock Step UNKNOWN Detection**: When the lock step fails due to UNKNOWN content, the orchestrator scans and reports via SSE stream.

### Core System Contracts and Guarantees
- **Pipeline Guarantees**: Enforced strict stage execution order and module dependencies.
- **Diagnostic Guarantees**: Standardized SCREAMING_SNAKE_CASE reason codes and detailed `blocked_by` responses.
- **Interface Guarantees**: Predictable JSON outputs for commands and consistent artifact storage.
- **Two-Root Safety**: Ensures isolation between the AXION system root and generated kits, preventing system pollution.

### UI/UX Decisions (Web Dashboard)
The system includes a web-based Dashboard for interacting with the AXION pipeline, built with Express, Vite, and React.
- **Assembly-Driven Architecture**: Transforms the dashboard into an Assembly-centric automation engine, where an "Assembly" represents a project idea.
- **Orchestration Engine**: Server-side pipeline runner for automated step chaining with SSE streaming and gate enforcement. Steps `review`, `draft`, `verify`, and `lock` use per-module iteration to satisfy dependency ordering (ensurePrereqs). The verify step is non-blocking — it sets verifyPassed=false but does not halt the pipeline.
- **Database**: PostgreSQL for managing assemblies and pipeline runs.
- **Storage Layer**: Provides full CRUD operations for assemblies and runs via an `IStorage` interface.
- **Web Dashboard Pages**: Includes Assembly listing, New Assembly creation, Assembly Control Room (with pipeline stepper, step-level timing, and SSE streaming), System Health page, Pipeline Logs viewer, Kit Export page, Test Suite page (run Vitest from dashboard with color-coded results), Document Inventory page (interactive hierarchy map + AI upgrade system), and existing tool pages (Status, Reports, Files, Release Gate).
- **Document Inventory & Upgrade** (`/docs`): Interactive ReactFlow node graph (`doc-hierarchy-map.tsx`) showing document cascade hierarchy (System → Source → Template → Generated). Click-to-scroll navigation. AI-powered doc upgrade at per-file, per-section, and global levels via `POST /api/doc-upgrade` SSE endpoint. Uses `upgradeDocumentWithAI()` in `ai-content-fill.ts`.
- **Pipeline Retry**: Transient failure retry with exponential backoff for ENOENT, ETIMEDOUT, ECONNRESET, and OOM-kill (exit 137).
- **Workspace Detection**: Detects workspaces by manifest.json, registry/, domains/, or app/ subdirectories.
- **Theming**: Uses CSS custom properties with Tailwind v4 and Shadcn UI components.
- **State Management**: TanStack Query for server state and React for UI state.
- **Two-Root Model**: Project workspaces are created as siblings to the `axion/` directory at the repository root.

## External Dependencies
- **Vitest**: Primary testing framework.
- **tsx**: Executes TypeScript files directly.
- **TypeScript**: Provides type-checking and language features.
- **npm**: Package manager for generated application kits and project dependencies.
- **Shadcn UI**: Component library (Card, Button, Badge, Input, ScrollArea, Sidebar, Tooltip).
- **wouter**: Lightweight client-side routing for the web dashboard.
- **TanStack Query**: For server state management and caching in the web dashboard.
- **class-variance-authority**: Component variant management.
- **Radix UI**: Provides accessible UI primitives used by Shadcn components.
- **@xyflow/react (ReactFlow)**: Interactive node graph library for the Document Inventory hierarchy map.