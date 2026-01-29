# Axiom Assembler

## Overview

Axiom Assembler is a web application and API that generates complete documentation bundles for software projects. Users submit an idea with minimal context (or use structured input with features, users, tech stack), click Generate, and receive a downloadable "Agent Kit" (zip) containing Axiom docs, manifests, and exports that can be uploaded to a vibecoding agent for implementation.

The system follows a docs-first approach with a strict pipeline: init → gen → seed → draft → review → verify → lock. It enforces discipline through rules like "no invention" (missing info becomes UNKNOWN) and "no overwrite" (scripts skip existing files).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js (v5) running on Node.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints prefixed with `/api` and `/v1`
- **Storage Layer**: Abstract storage interface (`IStorage`) with in-memory implementation, designed for easy swap to database

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Migrations**: Drizzle Kit for database migrations in `/migrations`

### Build System
- **Development**: Vite dev server with Express backend, HMR enabled
- **Production**: esbuild bundles server code, Vite builds client to `dist/public`
- **Output**: Single CJS bundle for server, static assets for client

### Assembler Pipeline System
- **Configuration**: `assembler/domains.json` defines domain structure, `assembler/sources.json` defines source documents
- **Documentation Root**: `docs/assembler_v1/` with structured subdirectories
- **Templates**: Located in `01_templates/` for generating domain documentation packs
- **Pipeline Scripts**: npm scripts for each pipeline stage (`assembler:init`, `assembler:gen`, etc.)
- **Isolated Workspaces**: Each assembly gets its own workspace at `workspaces/{assemblyId}/` with full Assembler structure
- **AI Generation**: OpenAI (gpt-5-mini via Replit AI Integrations) generates 7 source documents in parallel (~40s)

### AI-Generated Documents
When an assembly executes, the following are generated based on the user's idea:
- **PROJECT_OVERVIEW.md**: Project summary, value proposition, key features
- **RPBS_Product.md**: Product requirements, user stories, acceptance criteria
- **REBS_Product.md**: Technical architecture, data models, API design
- **domain-map.md**: Domain boundaries and feature mapping
- **reason-codes.md**: Error code catalog
- **action-vocabulary.md**: Standardized action verbs
- **glossary.md**: Key terms and definitions

### Core Entities
- **Assembly** (was Run): Pipeline execution with idea, projectName, preset, domains[], state, step, progress, errors[], kitPath, checksums
- **Delivery** (was Handoff): Delivery mechanism with type (pull/webhook/git/direct), config, state, attempts, result, attemptHistory[]
- **Kit** (was Bundle): Output artifact containing documentation, manifest, and agent prompt

### API Endpoints (New)
- `GET /api/assemblies` - List all assemblies
- `POST /api/assemblies` - Create a new assembly
- `GET /api/assemblies/:id` - Get assembly status
- `POST /api/assemblies/:id/execute` - Execute the Assembler pipeline
- `GET /api/assemblies/:id/kit.zip` - Download the kit zip
- `DELETE /api/assemblies/:id` - Delete an assembly

### API v1 Endpoints (Versioned)
- `POST /v1/assemblies` - Create assembly with idea, projectName, preset, domains
- `GET /v1/assemblies/:id` - Get assembly status with progress/step details
- `GET /v1/assemblies/:id/kit` - Get kit metadata with signed download URL
- `GET /v1/assemblies/:id/kit.zip` - Download kit (requires valid signature)
- `POST /v1/assemblies/:id/deliveries` - Create delivery (pull/webhook/git/direct)
- `GET /v1/assemblies/:id/deliveries` - List deliveries for assembly
- `GET /v1/deliveries/:id` - Get delivery details
- `POST /v1/deliveries/:id/retry` - Retry failed delivery

### Project Package Endpoints
- `POST /v1/project-packages` - Upload a ZIP file for analysis (multipart form, field: "file")
- `GET /v1/project-packages/:id` - Get package status (scanState, indexState, summary)
- `POST /v1/assemblies/:id/project-packages/:pkgId/attach` - Attach package to assembly
- `POST /v1/assemblies/:id/upgrade` - Generate upgrade plan from attached package
- `GET /v1/assemblies/:id/upgrade` - List packages and generated upgrade artifacts

### Project Package Feature
Allows users to upload existing codebase ZIPs for analysis. The system:
1. **Scans** the ZIP for security (zip slip prevention, size limits: 100MB max, 20k files)
2. **Indexes** the project (framework detection, dependency snapshot, file tree)
3. **Generates** upgrade plans based on user goals/constraints

Supported frameworks: Next.js, Vite, Expo, React Native, Nuxt, Express, Fastify, and more.

### Legacy API (Deprecated - Sunset 2026-03-01)
All `/api/runs` and `/v1/runs` endpoints redirect to assembly equivalents with deprecation headers.
All `/v1/handoffs` endpoints redirect to delivery equivalents.

### Delivery Types
- **pull**: Returns signed URLs with optional inline manifest/prompt
- **webhook**: POST to receiver URL with X-Assembler-Signature header (HMAC-SHA256)
- **git**: Push to GitHub/GitLab branch (stubbed, needs implementation)
- **direct**: Platform-specific adapters (stubbed, needs implementation)

### Assembly State Flow
queued → running → completed (or failed/canceled)

### Design Constraints
- No invention: Missing info must become UNKNOWN and logged to Open Questions
- No overwrite: Scripts skip existing files unless explicitly allowed
- Verify before lock: All verifications must pass before locking a domain
- Always print ASSEMBLER_REPORT after every script run

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Session Store**: connect-pg-simple for Express session storage

### UI Libraries
- **Radix UI**: Full suite of accessible, unstyled UI primitives
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component
- **React Day Picker**: Date picker component
- **Vaul**: Drawer component
- **CMDK**: Command palette component

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner (development only)
- **TypeScript**: Strict mode with bundler module resolution

### Third-Party Integrations (available in dependencies)
- **OpenAI**: AI integration capability
- **Google Generative AI**: Alternative AI provider
- **Stripe**: Payment processing capability
- **Nodemailer**: Email sending
- **Passport**: Authentication framework

## Recent Changes

### January 2026 (Project Package Feature)
- **Project Package Upload**: Users can upload ZIP files of existing codebases for analysis
- **Security**: Safe unzip with zip slip prevention, file size limits (100MB max, 20k files max), timeout protection
- **Framework Detection**: Auto-detect Next.js, Vite, Expo, React Native, Nuxt, Express, Fastify, NestJS, Remix, Astro
- **Background Jobs**: Simple in-memory job queue for async scan/index processing
- **Upgrade Tab**: New UI tab on assembly detail page for uploading packages and generating upgrade plans
- **API Endpoints**: POST/GET project-packages, attach to assembly, generate/get upgrade artifacts
- **File Storage**: Local file storage utility for development (can be upgraded to object storage later)

### January 2026 (Phase 1 - Contract Hardening)
- **Correlation IDs**: Every API response now includes `X-Correlation-Id` header and correlationId in body
- **Standard Error Envelope**: All errors follow format `{ error: { code, message, details?, correlationId } }`
- **GET /v1/meta**: New endpoint returning apiVersion, bundleVersion, supportedDeliveryTypes, limits, signatureAlgo
- **GET /v1/health**: Enhanced with correlationId in response body

### January 2026 (Latest - Visual Pop Enhancement)
- **Gradient CTA Buttons**: Main CTAs (Generate Kit, New Assembly) use `.btn-axiom-cta` with amber→orange→red-orange gradient and glow
- **Solid Primary Buttons**: All other buttons use solid `bg-primary` (amber) for consistency
- **Stepper Glow**: Active/completed steps have gradient fills and prominent amber glow shadows
- **Sidebar Active State**: Active nav items have amber text, tinted background, and inset glow
- **Tabs Enhancement**: Active tabs show amber text with underline shadow effect
- **Input Focus States**: Inputs/textareas have amber focus rings with subtle glow on focus
- **GlassCard Accents**: Cards have amber-tinted borders with hover glow transitions
- **Brand Color Variables**: `--axiom-amber`, `--axiom-orange`, `--axiom-warm`, `--axiom-redorange` for consistent theming

### January 2026 (Premium UI Overhaul)
- **Design Kit Components**: Created 9 reusable components in `client/src/components/kit/`:
  - GlassCard: Glassmorphic card with blur effect and gradient borders
  - PageHeader: Consistent page titles with optional actions
  - StatusBadge: Assembly status indicator with proper states
  - CodeBlock: Syntax-highlighted code with copy functionality
  - CopyButton: One-click copy to clipboard
  - EmptyState: Placeholder for empty data states
  - Skeletons: Loading states for cards, tables, and text
  - Stepper: Multi-step form wizard indicator
  - AssemblyTimeline: Pipeline progress visualization
- **AppShell Layout**: New `client/src/app/` with SidebarNav, TopBar for consistent navigation
- **ThemeProvider**: Dark/light mode toggle with system preference detection
- **Refactored Pages**: All pages updated to use design kit components
  - Create: Multi-step wizard with Stepper, GlassCard, AssemblyTimeline
  - Assemblies: Search/filter table with StatusBadges and EmptyState
  - Assembly Detail: Tabbed interface (Overview/Kit/Deliveries/Attachments)
  - Settings: Webhook test tool and git preset configuration
  - API Docs: Organized endpoint documentation with CodeBlocks
- **Logo Assets**: `axiom-logo.png` and `axiom-icon.png` in `client/src/assets/`

### January 2026 (Rebrand)
- **Complete Rebrand**: Renamed from "Roshi Studio" to "Axiom Assembler"
- **Entity Renaming**: Run → Assembly, Handoff → Delivery, Bundle → Kit
- **API Routes**: `/v1/assemblies`, `/v1/deliveries`, `/v1/kit` (legacy routes deprecated)
- **Scripts**: Renamed all scripts to `assembler-*.mjs` prefix
- **Documentation**: Updated all docs to `docs/assembler_v1/` directory
- **Error Codes**: Now use `ASSEMBLER_*` prefix
- **Output Files**: Now use `axiom_kit.zip` naming
- **Workspace Paths**: Now use `delivery/` directory (was `handoff/`)
- **Backward Compatibility**: All legacy routes and types maintained until 2026-03-01

### January 2026 (Earlier)
- **File Upload Support**: Users can upload PDFs, Word docs, and text files as reference documents for additional context
- **Text Extraction**: Uploaded files are parsed (pdf-parse for PDFs, mammoth for DOCX) and extracted text is passed to AI generator
- **Drag-and-Drop UI**: File upload zone in Basics tab supports drag-and-drop with file list display and removal
- **Hybrid Input System**: Supports both structured input (features, users, techStack) and legacy idea-only input
- **Multi-Step Form UI**: 5-tab form wizard (Basics → Features → Users → Tech → Generate) with toggle for simple mode
- **Manifest v0.2.0**: Kit manifest includes generationMode, inputSummary, and implementationPlan based on P0/P1/P2 priorities
- **Template Fallback**: If AI generation fails for any document, structured templates populated with user data are used
- **Extended Checksums**: Kit metadata includes inputSha256 and aiContextSha256 for input artifact integrity
- **Delivery Artifacts**: Workspace includes delivery/input.json and delivery/ai_context.json with normalized AI context
- **Backward Compatibility**: Legacy idea-only requests auto-map to AssemblyInput with mappedFromIdea flag
- **AI-Powered Generation**: Kits now contain AI-generated docs tailored to user's specific project idea
- **Isolated Workspaces**: Each assembly gets dedicated workspace at workspaces/{assemblyId}/ preventing cross-contamination
- **Parallel AI Generation**: All 7 source documents generated concurrently for speed (~40s total)
- **v1 API**: Versioned API with signed URL downloads, delivery system (pull/webhook adapters), kit checksums
- **API Documentation**: Interactive /docs page with endpoint reference, request/response examples
