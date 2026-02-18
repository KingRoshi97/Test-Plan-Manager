# AXION Documentation System

## Overview
This project develops and tests the AXION documentation-first development system, generating "Agent Kits" for AI-guided software development. Its purpose is to standardize and streamline software project creation through rigorous testing and a well-defined pipeline for documentation and application scaffolding. AXION aims for robust and reliable code generation, ensuring data integrity and consistency across various development stages, and includes a web-based dashboard for orchestrating the development pipeline from conception to deployment. The system supports iterative assembly upgrades, allowing users to add new ideas or critiques and re-run the pipeline non-destructively to produce versioned upgrade kits.

## User Preferences
- I want iterative development.
- Ask me before making major changes.
- I prefer detailed explanations.
- Do not make changes to the folder `axion/registry/release_gate_logs/`.
- Do not make changes to the file `axion/registry/release_gate_report.json`.

## System Architecture
AXION employs a documentation-first approach to generate comprehensive "Agent Kits," structured around a pipeline with atomic operations and a robust module system designed for crash resilience and data integrity. It follows a Two-Root Architecture, strictly isolating immutable AXION system code from generated project workspaces.

### Core Components and Structure
- **AXION System Code (`axion/`)**: Manages configuration, TypeScript CLI, document templates, and system documentation.
- **Atomic Writer Library**: Ensures data integrity through crash-resilient file writing.
- **Stack Profile Contract (`registry/stack_profile.json`)**: Authoritative source for stack configuration within a kit workspace.
- **Anchor Convention**: Uses HTML comment-like anchors (`<!-- AXION:ANCHOR:<ID> -->`) for dynamic content injection.
- **Script Organization**: Pipeline scripts (`.mjs`) for orchestration, system-level scripts (`.ts`) for core logic, and auxiliary guardrail scripts (`.ts`) for workspace operations and validation.
- **UNKNOWN Detection & Content Fill System**: Scans `.md` template files for `UNKNOWN` placeholders, using AI for content generation based on document hierarchy and type-aware prompting. It supports interactive revision and cascading fills.
- **Context Assembly System**: Both CLI (`axion/scripts/axion-content-fill.ts`) and Dashboard (`server/ai-content-fill.ts`) implementations read template AGENT_GUIDANCE blocks, resolve upstream document references (RPBS, REBS, DDES, etc.), and load knowledge files from `axion/knowledge/` via `axion/config/knowledge-map.json` before AI fills. Section-level fill optimization parses documents by ## headings and only sends sections with UNKNOWNs to AI when the document has 10+ sections and <50% contain UNKNOWNs.

### Pipeline Stages
AXION defines a clear pipeline for kit creation and application development, including:
- **`import`**: Analyzes existing repositories.
- **`kit-create`**: Initializes new Agent Kit workspaces.
- **`docs:scaffold`**: Generates documentation structures.
- **`docs:content`**: Fills documentation with AI-generated content.
- **`docs:full`**: Combines scaffolding and content generation.
- **`app:bootstrap`**: Generates application boilerplate.
- **`build-exec`**: Executes the build plan, generating a manifest and applying file operations.

### Key Tools & Processes
- **`axion-import`**: Read-only analysis of existing repositories.
- **`axion-reconcile`**: Compares imported facts against build outputs to detect drift.
- **`axion-iterate`**: Orchestration wrapper for chaining AXION primitives, enforcing gates.
- **Transient Failure Retry**: Implements exponential backoff for network and system errors (ENOENT, ETIMEDOUT, ECONNRESET, OOM-kill).

### Core System Contracts and Guarantees
- **Pipeline Guarantees**: Enforced strict stage execution order and module dependencies.
- **Diagnostic Guarantees**: Standardized reason codes and detailed `blocked_by` responses.
- **Interface Guarantees**: Predictable JSON outputs and consistent artifact storage.
- **Two-Root Safety**: Ensures isolation between the AXION system root and generated kits.

### UI/UX Decisions (Web Dashboard)
The web-based Dashboard, built with Express, Vite, and React, provides an Assembly-centric automation engine.
- **Orchestration Engine**: Server-side pipeline runner with SSE streaming and gate enforcement.
- **Web Dashboard Pages**: Includes Assembly management, New Assembly creation, Assembly Control Room (pipeline stepper, real-time streaming), System Health, Pipeline Logs, Kit Export, Test Suite Runner, Document Inventory (interactive hierarchy map + AI upgrade system), Scripts Reference, Presets Reference, and System Performance Dashboard.
- **Theming**: Supports Dark/Light themes using CSS custom properties with Tailwind v4 and Shadcn UI.
- **State Management**: Utilizes TanStack Query for server state and React for UI state.

## External Dependencies
- **Vitest**: Testing framework.
- **tsx**: TypeScript execution.
- **TypeScript**: Language support.
- **npm**: Package manager.
- **Shadcn UI**: Component library.
- **wouter**: Client-side routing.
- **TanStack Query**: Server state management and caching.
- **class-variance-authority**: Component variant management.
- **Radix UI**: Accessible UI primitives.
- **@xyflow/react (ReactFlow)**: Interactive node graph library.
- **PostgreSQL**: Database for managing assemblies and pipeline runs.