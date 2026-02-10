<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:architecture -->
<!-- AXION:PREFIX:arch -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Architecture — AXION Module Template (Blank State)

**Module slug:** `architecture`  
**Prefix:** `arch`  
**Description:** System architecture, patterns, and structural decisions

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:ARCH_SCOPE -->
## Scope & Ownership
<!-- AGENT: Architecture owns all tech stack decisions, structural patterns, and cross-cutting architectural concerns.
"Owns" = tech stack selection, module boundary definitions, deployment topology, NFR targets, architecture decision records (ADRs).
"Does NOT own" = domain-specific business logic (backend), UI implementation (frontend), schema details (database), API shapes (contracts).
"Interfaces with" = every other module — architecture sets constraints that all modules must follow.
Common mistake: architecture module should set policy, not implement features — if it contains business logic, it belongs in another module. -->
- Owns: [TBD]
- Does NOT own: [TBD]
- Interfaces with: [TBD]


<!-- AXION:SECTION:ARCH_TECH_STACK -->
## Tech Stack Selection

> **Owner:** Architecture module owns all stack decisions. Downstream modules must reference, not redefine.
> See `axion/config/stack_profiles.json` for available profiles.

<!-- AGENT: Derive from REBS stack selection document + RPBS §7 NFRs to justify choices.
Profile = pick from axion/config/stack_profiles.json, or define custom with rationale tied to product requirements.
For each stack layer: name the specific technology AND justify why it was chosen over alternatives (e.g., "React — chosen for ecosystem maturity and team familiarity over Vue/Svelte").
Tradeoffs = explicitly list what you chose NOT to use and why — this prevents future "why didn't we use X?" debates.
Common mistake: listing technologies without rationale — every choice needs a "why" tied to product requirements or team constraints. -->

### Selected Profile
- Profile: [TBD] (e.g., default-web-saas, serverless-node, enterprise-java)
- Rationale: [TBD]

### Frontend
- Framework: [TBD]
- Language: [TBD]
- Styling: [TBD]
- State Management: [TBD]

### Backend
- Runtime: [TBD]
- Language: [TBD]
- Framework: [TBD]
- API Style: [TBD]

### Database
- Engine: [TBD]
- ORM: [TBD]

### Deployment
- Platform: [TBD]
- CI/CD: [TBD]

### Tradeoffs & Non-Goals
- [TBD] - What we explicitly chose NOT to use and why


<!-- AXION:SECTION:ARCH_SYSTEM_OVERVIEW -->
## System Overview
<!-- AGENT: Summarize the entire system from RPBS §1 (Product Overview / Vision).
One-paragraph summary = what the system is, who it serves, how it's structured at the highest level (e.g., "A multi-tenant SaaS with React SPA, Express API, and PostgreSQL").
Quality attributes = the top 3-5 NFRs that drive architectural decisions (from RPBS §7), ranked by priority.
Constraints = technology mandates, regulatory requirements (GDPR, SOC2), organizational constraints (team size, timeline).
Common mistake: writing a marketing description instead of an architectural summary — focus on structure and constraints, not features. -->
- One-paragraph architecture summary: [TBD]
- Primary quality attributes (NFRs): [TBD]
- Key constraints (tech/org/legal): [TBD]


<!-- AXION:SECTION:ARCH_BOUNDARIES -->
## Module Boundaries & Responsibilities
<!-- AGENT: Reference domain-map.md for all module boundaries — reproduce the boundary assignments here as the architectural record.
Boundary list = each module with its single responsibility (e.g., "frontend → UI rendering and client-side state", "backend → API handlers and business logic orchestration").
Cross-cutting concerns = who owns logging infrastructure, error handling patterns, auth middleware, shared utilities — assign each to exactly one module.
Common mistake: leaving cross-cutting concerns unassigned — every concern must have exactly one owner to prevent duplication and drift. -->
- Boundary list (module → responsibility): [TBD]
- Cross-cutting concerns ownership (auth, logging, errors): [TBD]


<!-- AXION:SECTION:ARCH_DEPENDENCIES -->
## Dependency Graph
<!-- AGENT: Reference axion/config/domains.json dependency graph for the canonical module dependency list.
Upstream dependencies = modules this module depends on (e.g., backend depends on contracts, database).
Downstream consumers = modules that depend on this module.
Forbidden dependencies = dependency directions that must never exist (e.g., database must never depend on frontend, contracts must never depend on backend implementation).
Common mistake: circular dependencies — if A depends on B and B depends on A, one dependency must be broken via contracts/events. -->
- Upstream dependencies: [TBD]
- Downstream consumers: [TBD]
- Forbidden dependencies (must not happen): [TBD]


<!-- AXION:SECTION:ARCH_DATAFLOWS -->
## Core Data Flows
<!-- AGENT: Derive from RPBS §5 User Journeys — show how data flows end-to-end through the system for each critical journey.
Each flow = trigger (user action or event) → frontend handling → API call → backend processing → database operation → response back to user.
Include: which modules are involved at each step, data transformations, async handoffs (queues/events).
Common mistake: only showing the happy path — include error flows and what happens when intermediate steps fail. -->
- Flow A: [TBD] (trigger → processing → storage → output)
- Flow B: [TBD]


<!-- AXION:SECTION:ARCH_NFRS -->
## Non-Functional Requirements
<!-- AGENT: Copy from RPBS §7 Non-Functional Profile — these are the authoritative NFR targets for the entire system.
Performance = response time targets (p50/p95/p99), throughput (requests/sec), page load budgets (LCP, FID, CLS).
Reliability = uptime target (e.g., 99.9%), SLOs with SLIs (e.g., "99th percentile API latency < 500ms"), error budget.
Security = authentication requirements, encryption (at rest, in transit), compliance standards (SOC2, GDPR).
Observability = what must be monitored, alerting thresholds, log retention.
Common mistake: stating aspirational targets without measurement plan — every NFR needs a corresponding SLI that can be measured. -->
- Performance targets: [TBD]
- Reliability targets (SLO/SLI): [TBD]
- Security posture: [TBD]
- Observability requirements: [TBD]


<!-- AXION:SECTION:ARCH_ADRS -->
## Architecture Decisions (ADRs)
<!-- AGENT: Document key architecture decisions with the ADR format: Decision, Context, Alternatives Considered, Rationale, Consequences.
Each ADR = a significant choice (e.g., "Use PostgreSQL over MongoDB", "Monolith-first over microservices") with WHY and what tradeoffs were accepted.
Alternatives = at least 2 alternatives considered for each decision, with pros/cons of each.
Common mistake: recording decisions without alternatives or consequences — every ADR must show that options were evaluated and tradeoffs are understood. -->
- ADR-001: [TBD] (decision, alternatives, rationale, consequences)
- ADR-002: [TBD]


<!-- AXION:SECTION:ARCH_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Boundaries are unambiguous and complete
- [ ] Core flows are documented end-to-end
- [ ] NFR targets exist (or explicit N/A with reason)


<!-- AXION:SECTION:ARCH_OPEN_QUESTIONS -->
## Open Questions
- [TBD]
