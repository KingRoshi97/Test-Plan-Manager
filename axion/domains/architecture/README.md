<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:architecture -->
<!-- AXION:PREFIX:arch -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Architecture — Axion Assembler

**Module slug:** `architecture`  
**Prefix:** `arch`  
**Description:** System architecture, patterns, and structural decisions for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:ARCH_SCOPE -->
## Scope & Ownership
- Owns: System-wide architecture decisions, tech stack selection, module boundaries, cross-cutting concerns
- Does NOT own: Individual module implementations, business logic details
- Interfaces with: All modules for stack compliance; frontend/backend for data flows

<!-- AXION:SECTION:ARCH_TECH_STACK -->
## Tech Stack Selection

> **Owner:** Architecture module owns all stack decisions. Downstream modules must reference, not redefine.
> See `axion/config/stack_profiles.json` for available profiles.

### Selected Profile
- Profile: default-web-saas
- Rationale: Standard full-stack web application pattern, suitable for internal tooling

### Frontend
- Framework: React 18
- Language: TypeScript
- Styling: Tailwind CSS with shadcn/ui
- State Management: TanStack Query for server state

### Backend
- Runtime: Node.js 20
- Language: TypeScript
- Framework: Express.js v5
- API Style: REST (JSON)

### Database
- Engine: PostgreSQL (Neon via Replit)
- ORM: Drizzle ORM

### Deployment
- Platform: Replit
- CI/CD: Replit automatic deployments

### Tradeoffs & Non-Goals
- No GraphQL: REST sufficient for internal API
- No Redis: In-memory job queue acceptable for single-instance deployment
- No Kubernetes: Replit manages infrastructure

<!-- AXION:SECTION:ARCH_SYSTEM_OVERVIEW -->
## System Overview
- One-paragraph summary: Axion Assembler is a web application that serves as the controller for the AXION documentation generation system. It provides a UI and API to create assemblies (AXION workspaces), execute pipeline stages by spawning AXION CLI scripts, display results and logs, manage artifacts, run governance checks (verify, drift), and export Agent Kits for AI agent consumption.
- Primary quality attributes: Correctness (execute exact AXION scripts), Auditability (log all runs), Usability (clear status and next actions)
- Key constraints: Must call existing AXION scripts (no reimplementation); single-tenant deployment

<!-- AXION:SECTION:ARCH_BOUNDARIES -->
## Module Boundaries & Responsibilities
- Boundary list:
  | Module | Responsibility |
  |--------|----------------|
  | architecture | Stack decisions, system overview |
  | systems | Runtime components, failure modes |
  | contracts | API surface, error model, schemas |
  | database | PostgreSQL schema, migrations |
  | data | Data access patterns, validation |
  | auth | Session management (optional) |
  | backend | API routes, job runner |
  | integrations | AXION script execution |
  | state | Client state management |
  | frontend | UI pages and components |
  | fullstack | E2E flows, error mapping |
  | testing | Test strategy |
  | quality | Code standards |
  | security | Threat model, policies |
  | devops | CI/CD, deployment |
  | cloud | Hosting, infrastructure |
  | devex | Developer experience |
  | mobile | N/A — web only |
  | desktop | N/A — web only |
- Cross-cutting concerns:
  - Logging: backend module (console structured logging)
  - Errors: contracts module (error envelope standard)
  - Auth: auth module (optional session-based)

<!-- AXION:SECTION:ARCH_DEPENDENCIES -->
## Dependency Graph
- Upstream dependencies: AXION CLI scripts (spawned as child processes)
- Downstream consumers: AI agents (consume exported Agent Kits)
- Forbidden dependencies: Frontend must not import backend code directly

<!-- AXION:SECTION:ARCH_DATAFLOWS -->
## Core Data Flows
- Flow A (Create Assembly): UI form → POST /api/assemblies → axion-init.ts spawn → Assembly + Run records → redirect to Control Room
- Flow B (Run Stage): UI button → POST /api/assemblies/:id/run → axion-<stage>.ts spawn → SSE logs → Run record update → UI refresh
- Flow C (Export Kit): UI button → POST /api/assemblies/:id/export → ZIP creation → Export record → download link

<!-- AXION:SECTION:ARCH_NFRS -->
## Non-Functional Requirements
- Performance targets: API response <500ms; SSE log latency <100ms
- Reliability targets: 99% uptime during normal operation (Replit managed)
- Security posture: Input validation, path traversal prevention, session security (if auth enabled)
- Observability: Console logging with requestId correlation

<!-- AXION:SECTION:ARCH_ADRS -->
## Architecture Decisions (ADRs)
- ADR-001: Use AXION scripts as source of truth (decision: spawn CLI scripts; alternatives: reimplement logic; rationale: single source of truth, easier maintenance; consequences: must handle script output parsing)
- ADR-002: SSE for live logs (decision: Server-Sent Events; alternatives: WebSocket, polling; rationale: simpler, one-directional stream sufficient; consequences: must handle reconnection)

<!-- AXION:SECTION:ARCH_ACCEPTANCE -->
## Acceptance Criteria
- [x] Boundaries are unambiguous and complete
- [x] Core flows are documented end-to-end
- [x] NFR targets exist

<!-- AXION:SECTION:ARCH_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Always reference architecture module for stack decisions.
2. Never reimplement AXION script logic; spawn scripts directly.
3. Use the selected stack profile consistently across all modules.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
