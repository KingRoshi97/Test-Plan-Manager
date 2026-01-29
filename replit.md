# Roshi Studio

## Overview

Roshi Studio is a web application and API that runs the Roshi documentation pipeline. Users submit an idea with minimal context, click Generate, and receive a downloadable "Agent Handoff Bundle" (zip) containing Roshi docs, manifests, and exports that can be uploaded to a vibecoding agent for implementation.

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
- **API Pattern**: RESTful endpoints prefixed with `/api`
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

### Roshi Pipeline System
- **Configuration**: `roshi/domains.json` defines domain structure, `roshi/sources.json` defines source documents
- **Documentation Root**: `docs/roshi_v2/` with structured subdirectories
- **Templates**: Located in `01_templates/` for generating domain documentation packs
- **Pipeline Scripts**: npm scripts for each pipeline stage (`roshi:init`, `roshi:gen`, etc.)

### Core Entities
- **Run**: Pipeline execution with idea, projectName, preset, domains[], state, step, progress, errors[], bundlePath, checksums
- **Handoff**: Delivery mechanism with type (pull/webhook/git/direct), config, state, attempts, result, attemptHistory[]

### API Endpoints (Legacy)
- `GET /api/runs` - List all runs
- `POST /api/runs` - Create a new run with idea and optional context
- `GET /api/runs/:id` - Get run status
- `POST /api/runs/:id/execute` - Execute the Roshi pipeline
- `GET /api/runs/:id/download` - Download the bundle zip
- `DELETE /api/runs/:id` - Delete a run

### API v1 Endpoints (Versioned)
- `POST /v1/runs` - Create run with idea, projectName, preset, domains
- `GET /v1/runs/:id` - Get run status with progress/step details
- `GET /v1/runs/:id/bundle` - Get bundle metadata with signed download URL
- `GET /v1/runs/:id/bundle.zip` - Download bundle (requires valid signature)
- `POST /v1/runs/:id/handoffs` - Create handoff (pull/webhook/git/direct)
- `GET /v1/runs/:id/handoffs` - List handoffs for run
- `GET /v1/handoffs/:id` - Get handoff details
- `POST /v1/handoffs/:id/retry` - Retry failed handoff

### Handoff Types
- **pull**: Returns signed URLs with optional inline manifest/prompt
- **webhook**: POST to receiver URL with X-Roshi-Signature header (HMAC-SHA256)
- **git**: Push to GitHub/GitLab branch (stubbed, needs implementation)
- **direct**: Platform-specific adapters (stubbed, needs implementation)

### Run State Flow
queued → running → completed (or failed/canceled)

### Design Constraints
- No invention: Missing info must become UNKNOWN and logged to Open Questions
- No overwrite: Scripts skip existing files unless explicitly allowed
- Verify before lock: All verifications must pass before locking a domain
- Always print ROSHI_REPORT after every script run

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

### January 2026
- **Roshi Pipeline Complete**: All 5 domains (platform, api, web, infra, security) documented, verified, and locked
- **Web App Implemented**: Created Home page with idea form, pipeline execution, download functionality
- **Run History**: Added /runs page to view and manage previous pipeline runs
- **Bundle Generation**: Pipeline generates downloadable zip with Roshi documentation
- **v1 API**: Versioned API with signed URL downloads, handoff system (pull/webhook adapters), bundle checksums
- **API Documentation**: Interactive /docs page with endpoint reference, request/response examples
- **Handoff System**: Delivery mechanisms for external systems (pull adapter with signed URLs, webhook adapter with HMAC signatures)