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
- Owns: [TBD]
- Does NOT own: [TBD]
- Interfaces with: [TBD]


<!-- AXION:SECTION:ARCH_TECH_STACK -->
## Tech Stack Selection

> **Owner:** Architecture module owns all stack decisions. Downstream modules must reference, not redefine.
> See `axion/config/stack_profiles.json` for available profiles.

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
- One-paragraph architecture summary: [TBD]
- Primary quality attributes (NFRs): [TBD]
- Key constraints (tech/org/legal): [TBD]


<!-- AXION:SECTION:ARCH_BOUNDARIES -->
## Module Boundaries & Responsibilities
- Boundary list (module → responsibility): [TBD]
- Cross-cutting concerns ownership (auth, logging, errors): [TBD]


<!-- AXION:SECTION:ARCH_DEPENDENCIES -->
## Dependency Graph
- Upstream dependencies: [TBD]
- Downstream consumers: [TBD]
- Forbidden dependencies (must not happen): [TBD]


<!-- AXION:SECTION:ARCH_DATAFLOWS -->
## Core Data Flows
- Flow A: [TBD] (trigger → processing → storage → output)
- Flow B: [TBD]


<!-- AXION:SECTION:ARCH_NFRS -->
## Non-Functional Requirements
- Performance targets: [TBD]
- Reliability targets (SLO/SLI): [TBD]
- Security posture: [TBD]
- Observability requirements: [TBD]


<!-- AXION:SECTION:ARCH_ADRS -->
## Architecture Decisions (ADRs)
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
