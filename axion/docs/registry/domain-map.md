# Domain Map

> **Registry Guardrail.** Authoritative map of all 19 domain modules, their types, ownership boundaries, and the template documents generated for each. Sourced from `config/domains.json`.

---

## Domain Overview

| # | Domain | Slug | Prefix | Type | Description |
|---|--------|------|--------|------|-------------|
| 1 | Architecture | `architecture` | `arch` | foundation | System architecture, patterns, and structural decisions |
| 2 | Systems | `systems` | `sys` | foundation | System components, services, and their interactions |
| 3 | Contracts | `contracts` | `contract` | foundation | API contracts, interfaces, and data schemas |
| 4 | Database | `database` | `db` | data | Database schema, migrations, and data models |
| 5 | Data | `data` | `data` | data | Data flows, transformations, and validation |
| 6 | Auth | `auth` | `auth` | security | Authentication, authorization, and identity management |
| 7 | Backend | `backend` | `be` | core | Server-side logic, APIs, and business rules |
| 8 | Integrations | `integrations` | `integ` | core | Third-party integrations and external services |
| 9 | State | `state` | `state` | frontend | State management, stores, and client-side data |
| 10 | Frontend | `frontend` | `fe` | frontend | UI components, pages, and user interactions |
| 11 | Fullstack | `fullstack` | `fs` | integration | End-to-end flows connecting frontend and backend |
| 12 | Testing | `testing` | `test` | quality | Test strategies, coverage, and automation |
| 13 | Quality | `quality` | `qa` | quality | Code quality, linting, and standards |
| 14 | Security | `security` | `sec` | crosscutting | Security policies, audits, and vulnerability management |
| 15 | DevOps | `devops` | `devops` | operations | CI/CD, deployment, and infrastructure automation |
| 16 | Cloud | `cloud` | `cloud` | operations | Cloud infrastructure, scaling, and hosting |
| 17 | DevEx | `devex` | `dx` | operations | Developer experience, tooling, and workflows |
| 18 | Mobile | `mobile` | `mobile` | platform | Mobile app development (iOS, Android, React Native) |
| 19 | Desktop | `desktop` | `desktop` | platform | Desktop app development (Electron, Tauri) |

---

## Domain Boundaries

Each domain owns specific concerns. Ownership determines which module handles a given feature or artifact.

### Foundation Layer

#### Architecture (`arch`)
- **Owns:** System-level patterns, layering decisions, dependency rules, architectural trade-offs
- **Produces:** Architecture decision records, pattern catalog, structural constraints
- **Dependencies:** *(none — root of the dependency graph)*

#### Systems (`sys`)
- **Owns:** System components, services, inter-service communication, runtime topology
- **Produces:** Component diagrams, service maps, deployment topology
- **Dependencies:** architecture

#### Contracts (`contract`)
- **Owns:** API endpoints, request/response schemas, error models, versioning policy
- **Produces:** OpenAPI specs, TypeScript interfaces, validation schemas
- **Dependencies:** architecture, systems

### Data Layer

#### Database (`db`)
- **Owns:** Entity schemas, migrations, indexes, constraints, retention policy
- **Produces:** ORM schema files, migration scripts, seed data
- **Dependencies:** contracts

#### Data (`data`)
- **Owns:** Data flows, transformations, validation rules, data quality
- **Produces:** ETL definitions, data pipeline specs, validation rules
- **Dependencies:** database, contracts

### Security Layer

#### Auth (`auth`)
- **Owns:** Authentication providers, authorization rules, identity model, session management
- **Produces:** Auth middleware, permission matrices, identity schemas
- **Dependencies:** contracts, database

### Core Layer

#### Backend (`be`)
- **Owns:** Server-side routes, business logic, middleware, error handling
- **Produces:** Route handlers, service classes, middleware chain
- **Dependencies:** contracts, database, auth

#### Integrations (`integ`)
- **Owns:** Third-party service connections, webhook handlers, credential management
- **Produces:** Integration adapters, webhook processors, credential configs
- **Dependencies:** backend, contracts

### Frontend Layer

#### State (`state`)
- **Owns:** Client-side state, stores, cache management, optimistic updates
- **Produces:** Store definitions, state machines, query configurations
- **Dependencies:** contracts

#### Frontend (`fe`)
- **Owns:** Pages, components, forms, navigation, user interactions
- **Produces:** Page components, shared components, form definitions
- **Dependencies:** state, contracts

### Integration Layer

#### Fullstack (`fs`)
- **Owns:** End-to-end user flows, frontend-backend wiring, cross-cutting concerns
- **Produces:** Flow diagrams, integration test specs, wiring documentation
- **Dependencies:** frontend, backend

### Quality Layer

#### Testing (`test`)
- **Owns:** Test strategy, coverage targets, test automation, CI test gates
- **Produces:** Test plans, test suites, coverage reports
- **Dependencies:** backend, frontend

#### Quality (`qa`)
- **Owns:** Code quality standards, linting rules, review checklists
- **Produces:** Linting configs, quality gates, review templates
- **Dependencies:** *(none)*

### Crosscutting Layer

#### Security (`sec`)
- **Owns:** Threat models, security policies, vulnerability management, incident response
- **Produces:** Threat assessments, security checklists, audit logs
- **Dependencies:** auth, backend

### Operations Layer

#### DevOps (`devops`)
- **Owns:** CI/CD pipelines, deployment automation, environment management
- **Produces:** Pipeline configs, deployment scripts, runbooks
- **Dependencies:** backend, testing

#### Cloud (`cloud`)
- **Owns:** Cloud infrastructure, IAM, compute/storage, cost controls, DR
- **Produces:** Infrastructure-as-code, topology diagrams, cost budgets
- **Dependencies:** devops

#### DevEx (`dx`)
- **Owns:** Developer tooling, local dev setup, documentation standards, workflow conventions
- **Produces:** Dev environment configs, contribution guides, tooling scripts
- **Dependencies:** quality

### Platform Layer

#### Mobile (`mobile`)
- **Owns:** Mobile app screens, native features, app store configuration
- **Produces:** Screen components, navigation configs, platform-specific code
- **Dependencies:** frontend, state

#### Desktop (`desktop`)
- **Owns:** Desktop app windows, native features, distribution configuration
- **Produces:** Window components, native bridges, distribution configs
- **Dependencies:** frontend, state

---

## Type Summary

| Type | Count | Modules | Role |
|------|-------|---------|------|
| `foundation` | 3 | Architecture, Systems, Contracts | Structural foundation — processed first |
| `data` | 2 | Database, Data | Persistence and data management |
| `security` | 1 | Auth | Identity and access control |
| `core` | 2 | Backend, Integrations | Business logic and external services |
| `frontend` | 2 | State, Frontend | Client-side UI and state |
| `integration` | 1 | Fullstack | End-to-end flow validation |
| `quality` | 2 | Testing, Quality | Test and code quality |
| `crosscutting` | 1 | Security | Security policies across all layers |
| `operations` | 3 | DevOps, Cloud, DevEx | Infrastructure and developer experience |
| `platform` | 2 | Mobile, Desktop | Platform-specific clients |

---

## Cross-References

- **Dependency graph and build order:** See `domain-build-order.md`
- **Templates generated per module:** See `module-index.md`
- **Fullstack coverage:** See `fullstack-coverage-map.md`
- **Action verbs per domain:** See `action-vocabulary.md`
