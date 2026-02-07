# Domain Map

<!-- AXION:AGENT_GUIDANCE
PURPOSE: This is the authoritative map of all domains/modules in the system.
It is auto-generated from axion/config/domains.json and should match it exactly.

RULES:
- Do NOT add or remove domains here — edit domains.json instead and regenerate
- The dependency graph determines build order: foundation → data → security → core → frontend → integration → quality → crosscutting → operations → platform
- When filling domain templates, use this map to identify cross-domain relationships
- Each domain's README, DDES, BELS, DIM, etc. should be consistent with this map
-->

## Overview
This document maps all domains in the system, their responsibilities, types, and dependency relationships.

---

## Domains

| Domain | Slug | Prefix | Type | Description | Dependencies |
|--------|------|--------|------|-------------|-------------|
| Architecture | architecture | arch | foundation | System architecture, patterns, and structural decisions | — |
| Systems | systems | sys | foundation | System components, services, and their interactions | architecture |
| Contracts | contracts | contract | foundation | API contracts, interfaces, and data schemas | architecture, systems |
| Database | database | db | data | Database schema, migrations, and data models | contracts |
| Data | data | data | data | Data flows, transformations, and validation | database, contracts |
| Auth | auth | auth | security | Authentication, authorization, and identity management | contracts, database |
| Backend | backend | be | core | Server-side logic, APIs, and business rules | contracts, database, auth |
| Integrations | integrations | integ | core | Third-party integrations and external services | backend, contracts |
| State | state | state | frontend | State management, stores, and client-side data | contracts |
| Frontend | frontend | fe | frontend | UI components, pages, and user interactions | state, contracts |
| Fullstack | fullstack | fs | integration | End-to-end flows connecting frontend and backend | frontend, backend |
| Testing | testing | test | quality | Test strategies, coverage, and automation | backend, frontend |
| Quality | quality | qa | quality | Code quality, linting, and standards | testing |
| Security | security | sec | crosscutting | Security hardening, threat modeling, and compliance | auth, backend |
| DevOps | devops | devops | operations | CI/CD, deployment pipelines, and infrastructure | backend, cloud |
| Cloud | cloud | cloud | operations | Cloud infrastructure, hosting, and scaling | architecture |
| DevEx | devex | dx | operations | Developer experience, tooling, and documentation | — |
| Mobile | mobile | mobile | platform | Mobile application platform and native features | frontend, backend |
| Desktop | desktop | desktop | platform | Desktop application platform and native features | frontend, backend |

---

## Domain Types

| Type | Purpose | Build Order | Domains |
|------|---------|------------|---------|
| foundation | Core system decisions and contracts | 1 (first) | architecture, systems, contracts |
| data | Data storage and flow | 2 | database, data |
| security | Authentication and authorization | 3 | auth |
| core | Business logic and APIs | 4 | backend, integrations |
| frontend | User interface and state | 5 | state, frontend |
| integration | End-to-end connections | 6 | fullstack |
| quality | Testing and code quality | 7 | testing, quality |
| crosscutting | Concerns spanning multiple domains | 8 | security |
| operations | Deployment, infrastructure, DX | 9 | devops, cloud, devex |
| platform | Platform-specific builds | 10 (last) | mobile, desktop |

---

## Dependency Graph

<!-- AGENT: This shows the build/resolution order. Arrows mean "depends on".
foundation domains have no dependencies and are built first. -->

```
architecture ─────────────────────────────────────────────────────────┐
    │                                                                 │
    ├──→ systems                                                      │
    │       │                                                         │
    │       ├──→ contracts ──┬──→ database ──┬──→ auth ──→ backend ──→│ fullstack
    │       │                │               │            │     │      │
    │       │                │               └──→ data    │     │      │
    │       │                │                            │     │      │
    │       │                ├──→ state ──→ frontend ─────┘─────┘──────┘
    │       │                │                                  │
    │       │                └──→ integrations                  │
    │       │                                                   │
    └──→ cloud ──→ devops                                       │
                                                                │
                  testing ←── backend + frontend                │
                      │                                         │
                      └──→ quality                              │
                                                                │
                  security ←── auth + backend                   │
                                                                │
                  mobile ←── frontend + backend                 │
                  desktop ←── frontend + backend                │
                                                                │
                  devex (standalone)                             │
```

---

## Domain Boundaries

<!-- AGENT: For each domain, summarize what it owns and what it's responsible for.
When filling domain documentation, use these boundaries to determine scope. -->

### Architecture (arch)
- **Owns:** Tech stack decisions, system patterns, architectural constraints
- **Responsibilities:** Define patterns, select frameworks/libraries, enforce structural rules

### Systems (sys)
- **Owns:** Service definitions, component boundaries
- **Responsibilities:** Map system components, define service interactions

### Contracts (contract)
- **Owns:** API type definitions, Zod schemas, interface contracts
- **Responsibilities:** Define data shapes, validate API boundaries, shared types

### Database (db)
- **Owns:** Schema definitions, migrations, data models
- **Responsibilities:** Database design, indexing strategy, data integrity

### Data (data)
- **Owns:** Data pipelines, transformations, seeding
- **Responsibilities:** Data flow orchestration, ETL, validation chains

### Auth (auth)
- **Owns:** Authentication flows, session management, authorization rules
- **Responsibilities:** User identity, login/logout, permission enforcement

### Backend (be)
- **Owns:** API routes, business logic, server-side orchestration
- **Responsibilities:** Request handling, BELS rule enforcement, response formatting

### Integrations (integ)
- **Owns:** External service connections, API clients, webhooks
- **Responsibilities:** Third-party communication, credential management, fallback handling

### State (state)
- **Owns:** Client-side stores, cache strategy, reactive state
- **Responsibilities:** State management, data synchronization, optimistic updates

### Frontend (fe)
- **Owns:** UI components, pages, routing, user interactions
- **Responsibilities:** Rendering, user input handling, accessibility, responsive layout

### Fullstack (fs)
- **Owns:** End-to-end flow definitions, integration patterns
- **Responsibilities:** Connect frontend to backend, define data flow, error propagation

### Testing (test)
- **Owns:** Test strategies, test utilities, fixtures
- **Responsibilities:** Test coverage, automation, CI test execution

### Quality (qa)
- **Owns:** Linting rules, code standards, review checklists
- **Responsibilities:** Code quality enforcement, static analysis

### Security (sec)
- **Owns:** Threat models, security policies, compliance checks
- **Responsibilities:** Security hardening, vulnerability scanning, compliance

### DevOps (devops)
- **Owns:** CI/CD pipelines, deployment configurations, monitoring
- **Responsibilities:** Build automation, deployment, infrastructure management

### Cloud (cloud)
- **Owns:** Cloud infrastructure definitions, hosting configuration
- **Responsibilities:** Infrastructure provisioning, scaling, cost management

### DevEx (dx)
- **Owns:** Developer documentation, tooling configuration, contribution guides
- **Responsibilities:** Developer onboarding, tooling DX, internal docs

### Mobile (mobile)
- **Owns:** Mobile-specific components, native bridges, app store config
- **Responsibilities:** Mobile UI adaptation, platform APIs, offline support

### Desktop (desktop)
- **Owns:** Desktop-specific components, native integrations, installer config
- **Responsibilities:** Desktop UI adaptation, system tray, native menus

---

## Open Questions
- N/A — This document is auto-derived from domains.json
