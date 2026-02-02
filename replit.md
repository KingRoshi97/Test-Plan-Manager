# Axiom Assembler

## Overview
Axiom Assembler is a web application and API designed to generate comprehensive documentation bundles for software projects. Users provide a project idea, and the system produces a downloadable "Agent Kit" (zip file) containing documentation, manifests, and exports ready for upload to a vibecoding agent for implementation. The project aims to streamline the software development process by enforcing a docs-first approach through a strict pipeline: init → gen → seed → draft → review → verify → lock. Key principles include "no invention" for missing information and "no overwrite" for existing files, ensuring discipline and consistency.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Design Principles
- **Docs-First Approach**: Emphasizes documentation generation as the initial step in the software development lifecycle.
- **Strict Pipeline**: Enforces a sequential process (init → gen → seed → draft → review → verify → lock) for consistent outputs.
- **No Invention**: Missing information is explicitly marked as `UNKNOWN` rather than being fabricated.
- **No Overwrite**: Existing files are not overwritten by scripts unless explicitly allowed.
- **Isolated Workspaces**: Each assembly operates in its dedicated workspace (`workspaces/{assemblyId}/`) to prevent cross-contamination.

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **UI Components**: shadcn/ui (built on Radix UI)
- **Styling**: Tailwind CSS with CSS variables
- **Build Tool**: Vite

### Backend
- **Framework**: Express.js (v5) on Node.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful, prefixed with `/api` and `/v1`
- **Storage Layer**: Abstract `IStorage` interface with in-memory implementation for flexibility.

### Data Management
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Modular structure in `shared/schema/`:
  - `auth.ts`: users, apiKeys tables
  - `assemblies.ts`: assemblies table + related types (Kit, AssemblyInput, Feature, etc.)
  - `deliveries.ts`: deliveries, delivery_events tables
  - `packages.ts`: project_packages table + upgrade types
  - `safety.ts`: safety_warnings, audit_logs tables
  - `index.ts`: barrel export (all re-exported via `shared/schema.ts`)
- **Validation**: Zod schemas generated from Drizzle
- **Migrations**: Drizzle Kit in `/migrations`
- **Database Tables** (8 total): users, api_keys, assemblies, deliveries, delivery_events, project_packages, safety_warnings, audit_logs

### Build System
- **Development**: Vite dev server with Express backend, HMR.
- **Production**: esbuild for server, Vite for client (output to `dist/public`).
- **Output**: Single CJS bundle for server, static assets for client.

### Assembler Pipeline
- **Configuration**: `assembler/domains.json` (domain structure), `assembler/sources.json` (source documents).
- **Documentation Root**: `docs/assembler_v1/`.
- **Templates**: Located in `01_templates/` for generating domain-specific documentation.
- **Pipeline Scripts**: npm scripts for each stage (e.g., `assembler:init`, `assembler:gen`).
- **AI Generation**: OpenAI (gpt-5-mini via Replit AI Integrations) generates 7 source documents in parallel.

### AI-Generated Documents
- PROJECT_OVERVIEW.md
- RPBS_Product.md (Product requirements)
- REBS_Product.md (Technical architecture)
- domain-map.md
- reason-codes.md
- action-vocabulary.md
- glossary.md

### Core Entities
- **Assembly**: Represents a pipeline execution, including idea, project name, preset, domains, state, progress, and output kit path.
- **Delivery**: Manages the delivery of the generated kit, with types like `pull`, `webhook`, `git`, and `direct`.
- **Kit**: The output artifact containing documentation, manifest, and agent prompt.

### API Endpoints
- **Assembly Management**:
    - `GET /api/assemblies` / `GET /v1/assemblies`: List assemblies.
    - `POST /api/assemblies` / `POST /v1/assemblies`: Create a new assembly.
    - `GET /api/assemblies/:id` / `GET /v1/assemblies/:id`: Get assembly status.
    - `POST /api/assemblies/:id/execute`: Execute pipeline.
    - `GET /api/assemblies/:id/kit.zip` / `GET /v1/assemblies/:id/kit`: Download kit.
    - `DELETE /api/assemblies/:id`: Delete assembly.
- **Delivery Management**:
    - `POST /v1/assemblies/:id/deliveries`: Create a delivery.
    - `GET /v1/assemblies/:id/deliveries`: List deliveries for an assembly.
    - `GET /v1/deliveries/:id`: Get delivery details.
    - `POST /v1/deliveries/:id/retry`: Retry failed delivery.
- **Project Package Analysis**:
    - `POST /v1/project-packages`: Upload a ZIP file for analysis.
    - `GET /v1/project-packages/:id`: Get package status.
    - `POST /v1/assemblies/:id/project-packages/:pkgId/attach`: Attach package to assembly.
    - `POST /v1/assemblies/:id/upgrade`: Generate upgrade plan.
    - `GET /v1/assemblies/:id/upgrade`: List packages and upgrade artifacts.

### Project Package Feature
Allows users to upload existing codebase ZIPs for analysis. The system performs:
1. **Scanning**: Security checks (zip slip, size limits: 100MB max, 20k files).
2. **Indexing**: Framework detection, dependency snapshot, file tree.
3. **Upgrade Plan Generation**: Based on user goals and constraints.
Supported frameworks include Next.js, Vite, Expo, React Native, Nuxt, Express, Fastify, etc.

### Safety v1
Security infrastructure prerequisite for public launch:
- **Upload Protections** (`server/security/upload-validator.ts`, `safe-unzip.ts`):
  - Path traversal/zip-slip detection
  - File type allowlist with magic bytes validation
  - Size limits: 200MB ZIP, 25MB doc, 100MB total docs
  - Extraction limits: 20k files, 1GB total
  - Compression bomb detection (100x ratio threshold)
- **Secret Scanning** (`server/security/secret-scanner.ts`):
  - 30+ patterns for AWS, Stripe, GitHub, OpenAI, JWT, OAuth, private keys
  - High-entropy string detection
  - Optional redaction support
- **Webhook Safety** (`server/security/webhook-validator.ts`):
  - HTTPS enforcement (localhost exception for dev)
  - SSRF protection blocking private IP ranges
  - 10s timeout, 5MB payload cap, redirect limits
- **Retention Cleanup** (`server/jobs/retention-cleanup.ts`):
  - Configurable per-asset retention (30d docs/zips, 90d kits, 180d delivery attempts)
  - Scheduled worker with dry-run mode
- **Safety Infrastructure**:
  - `safety_warnings` table for tracking issues
  - Global safety mode (warn vs strict)
  - API: `GET/PATCH /v1/safety/config`, `/v1/admin/retention/*`
- **Audit Logging**: `audit_logs` table with viewer in Ops page

### UI/UX Design
- **Visuals**: Features gradient CTA buttons, solid primary buttons, glowing stepper elements, amber-accented sidebar, tab, and input focus states, and glassmorphic card accents.
- **Components**: Reusable design kit components like `GlassCard`, `PageHeader`, `StatusBadge`, `CodeBlock`, `Stepper`, `AssemblyTimeline`.
- **Layout**: `AppShell` with `SidebarNav` and `TopBar` for consistent navigation.
- **Theming**: `ThemeProvider` for dark/light mode with system preference detection.
- **Workflows**: Multi-step form wizard for assembly creation, tabbed interfaces for detail pages.

## External Dependencies

### Database
- **PostgreSQL**: Primary database.
- **connect-pg-simple**: For Express session storage.

### UI Libraries
- **Radix UI**: Accessible, unstyled UI primitives.
- **Lucide React**: Icon library.
- **Embla Carousel**: Carousel component.
- **React Day Picker**: Date picker.
- **Vaul**: Drawer component.
- **CMDK**: Command palette.

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner.
- **TypeScript**: Strict mode.

### Third-Party Integrations
- **OpenAI**: AI integration.
- **Google Generative AI**: Alternative AI provider.
- **Stripe**: Payment processing.
- **Nodemailer**: Email sending.
- **Passport**: Authentication framework.