# AXION Documentation System

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

### UNKNOWN Detection & Agent-Driven Content Fill (Feb 2026)
- **`server/ai-content-fill.ts`**: Scan-only module that identifies BELS and Open Questions files containing UNKNOWN placeholders. Reports file paths, UNKNOWN counts, and which sections need content.
- **Lock Step UNKNOWN Detection**: When the lock step fails due to UNKNOWN content, the orchestrator:
  1. Scans the failed modules to identify exactly which files and sections contain UNKNOWNs.
  2. Reports this information via SSE stream so the dashboard and workspace agent can see what needs filling.
  3. Does NOT call external AI APIs — content filling is handled by the workspace AI agent directly.
- **`/api/scan-unknowns` endpoint**: Returns a JSON report of all BELS/Open Questions files with UNKNOWN placeholders, including counts and affected sections. Accepts optional `?modules=` query parameter to scope the scan.
- **Agent-driven workflow**: The workspace AI agent reads the BELS templates, understands the project context, and writes filled content directly to the files — no external API keys needed.

### Core System Contracts and Guarantees
- **Pipeline Guarantees**: Enforced strict stage execution order and module dependencies.
- **Diagnostic Guarantees**: Standardized SCREAMING_SNAKE_CASE reason codes and detailed `blocked_by` responses.
- **Interface Guarantees**: Predictable JSON outputs for commands and consistent artifact storage.
- **Two-Root Safety**: Ensures isolation between the AXION system root and generated kits, preventing system pollution.

### UI/UX Decisions (Web Dashboard)
The system includes a web-based Dashboard for interacting with the AXION pipeline, built with Express, Vite, and React.
- **Assembly-Driven Architecture**: Transforms the dashboard into an Assembly-centric automation engine, where an "Assembly" represents a project idea.
- **Orchestration Engine**: Server-side pipeline runner for automated step chaining with SSE streaming and gate enforcement.
- **Database**: PostgreSQL for managing assemblies and pipeline runs.
- **Storage Layer**: Provides full CRUD operations for assemblies and runs via an `IStorage` interface.
- **Web Dashboard Pages**: Includes Assembly listing, New Assembly creation, Assembly Control Room (with pipeline stepper and SSE streaming), and existing tool pages (Status, Reports, Files, Release Gate).
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