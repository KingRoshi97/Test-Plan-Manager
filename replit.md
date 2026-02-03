# Axiom Assembler

## Overview
Axiom Assembler is a web application and API that generates comprehensive documentation bundles ("Agent Kits") for software projects based on a user-provided idea. These kits, containing documentation, manifests, and exports, are designed for upload to vibecoding agents to guide implementation. The project enforces a strict docs-first development pipeline: init → gen → seed → draft → review → verify → lock. Core principles include "no invention" for missing information and "no overwrite" for existing files, aiming to streamline software development, ensure consistency, and maintain discipline.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Design Principles
- **Docs-First Approach**: Documentation generation is the initial step in the software development lifecycle.
- **Strict Pipeline**: Enforces a sequential process (init → gen → seed → draft → review → verify → lock) for consistent outputs.
- **No Invention**: Missing information is explicitly marked as `UNKNOWN`.
- **No Overwrite**: Existing files are not overwritten unless explicitly allowed.
- **Isolated Workspaces**: Each assembly operates in a dedicated workspace to prevent cross-contamination.

### Frontend
- **Framework**: React with TypeScript
- **State Management**: TanStack React Query
- **UI Components**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS with CSS variables
- **Build Tool**: Vite

### Backend
- **Framework**: Express.js (v5) on Node.js with TypeScript and ESM modules.
- **API Pattern**: RESTful, prefixed with `/api` and `/v1`.
- **Storage Layer**: Abstract `IStorage` interface.

### Data Management
- **ORM**: Drizzle ORM with PostgreSQL dialect.
- **Schema**: Modular structure for entities like users, API keys, assemblies, deliveries, packages, safety warnings, and audit logs.
- **Validation**: Zod schemas.
- **Migrations**: Drizzle Kit.

### AXION Pipeline (Documentation Engine)
- **Purpose**: Generates per-module documentation packs and manages the lifecycle.
- **Configuration**: `domains.json`, `sources.json`, `presets.json`.
- **Templates**: 29 templates (7 core ROSHI + 22 module README.template.md).
- **ROSHI Sequential Flow**: Defines the order and dependencies of core documents (RPBS, REBS, DDES, UX_Foundations, etc.).
- **Module Mode System**: Supports per-module generation (`--module <name>`) or all modules (`--all`), with dependency tracking for 19 defined modules. Stages are tracked and prerequisite checks enforced.
- **Pipeline Scripts**: A series of scripts manage the `generate`, `seed`, `draft`, `review`, `verify`, and `lock` stages of documentation production.
- **AI-Generated Documents**: Includes `PROJECT_OVERVIEW.md`, `RPBS_Product.md`, `REBS_Product.md`, and others.
- **Governance Features**:
  - **Seam Ownership**: Marker-based detection using `<!-- AXION:SEAM_OWNER:<seam> -->` HTML comments.
  - **Template Hashing**: Detects drift via content hashing.
  - **Repair Mode**: Suggests fix actions for violations.
  - **Preset Execution**: Topological dependency resolution with guards (disallow_lock, lock_requires_verify_pass).
- **Schema Contracts**:
  - `verify_report.json`: Uses `generated_at` (not timestamp), `modules` as Record (not array), `current_revision` (not revision).
  - `stage_markers.json`: Record<module, Record<stage, data>> structure.

### Key Entities
- **Assembly**: Represents a pipeline execution, including project details, state, and output kit path.
- **Delivery**: Manages the delivery of the generated kit.
- **Kit**: The output artifact containing documentation, manifest, and agent prompt.

### API Endpoints
- **Assembly Management**: Create, list, retrieve status, execute pipeline, download kits, delete.
- **Delivery Management**: Create, list, retrieve details, retry deliveries.
- **Templates Management**: List public/user templates, create, retrieve, delete, use templates.
- **User Profile & Preferences**: Get usage, update preferences.
- **Project Package Analysis**: Upload ZIPs for code analysis (scanning, indexing, upgrade plan generation), attach packages to assemblies, generate/list upgrade plans.

### Safety v1
- **Upload Protections**: Path traversal, file type validation, size limits, compression bomb detection.
- **Secret Scanning**: Detects sensitive patterns and high-entropy strings.
- **Webhook Safety**: HTTPS enforcement, SSRF protection, timeouts, payload limits.
- **Retention Cleanup**: Configurable asset retention policies.
- **Audit Logging**: Tracks system events.

### UI/UX Design
- **Visuals**: Gradient CTAs, solid primary buttons, glowing stepper elements, amber-accented focus states, glassmorphic cards.
- **Components**: Reusable design system components like `GlassCard`, `PageHeader`, `Stepper`.
- **Layout**: `AppShell` with `SidebarNav` and `TopBar`.
- **Theming**: Dark/light mode with system preference detection.
- **Workflows**: Multi-step form wizards and tabbed interfaces.

## External Dependencies

### Database
- **PostgreSQL**
- **connect-pg-simple**

### UI Libraries
- **Radix UI**
- **Lucide React**
- **Embla Carousel**
- **React Day Picker**
- **Vaul**
- **CMDK**

### Third-Party Integrations
- **OpenAI**
- **Google Generative AI**
- **Stripe**
- **Nodemailer**
- **Passport**