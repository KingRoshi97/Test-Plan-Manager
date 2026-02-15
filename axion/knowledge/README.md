# AXION Knowledge Base

This directory contains curated industry best practices, patterns, and standards that AXION references when generating Agent Kits. When a user selects a project preset (web app, API, mobile, etc.), the pipeline consults these references to produce higher-quality documentation and more informed architectural decisions.

## Knowledge Files (30 total — 7,640 lines)

### Frontend Engineering
| File | Lines | Coverage |
|------|-------|----------|
| `accessibility.md` | 383 | WCAG 2.1 AA/2.2, POUR principles, keyboard navigation, ARIA patterns, forms, images, color contrast, reduced motion, content/language a11y, governance |
| `navigation-ui.md` | 294 | Navigation patterns (sidebar, top nav, tabs, breadcrumbs), layout patterns, responsive breakpoints, component patterns, rendering/view architecture, business rules in UI, composition patterns, cross-cutting UI concerns, onboarding/help |
| `performance.md` | 315 | Core Web Vitals, bundle optimization, image optimization, CSS performance, rendering, caching, backend DB/API/concurrency, network, loading/runtime/rendering/memory/build/perceived performance, metrics and budgets |
| `state-management.md` | 270 | State types (local/global/server/derived/URL), normalization, persistence/hydration, lifecycle/ownership, update mechanics, side effects/async, cache invalidation, optimistic updates, realtime sync, state machines, feature flags, debugging |
| `forms-validation.md` | 239 | Form state management, field validation (sync/async/cross-field), Zod integration, input masking, error messaging, multi-step wizards, draft saving/autosave, file upload, accessibility in forms, performance, dynamic/dependent fields |
| `user-interaction.md` | 303 | Click/tap/hover, focus states, drag-and-drop, gestures, scroll behaviors, touch targets, selection patterns, keyboard shortcuts, debouncing/throttling, micro-interactions, animations/transitions, optimistic UI, retry UX, personalization, onboarding |
| `design-systems.md` | 246 | Token system (color/typography/spacing/border/elevation/motion/z-index), component library (primitives + composites), variant management, documentation, governance/contribution, tooling/distribution, visual regression, consistency/adoption, design-to-dev handoff |
| `i18n-localization.md` | 222 | Translation systems, RTL support, date/time/number/currency formatting, locale-aware sorting/search, text expansion handling, font coverage, localized input formats, IME support, locale management, pseudo-localization testing, locale coverage matrix |
| `frontend-security.md` | 268 | XSS prevention (encoding, CSP, DOM-based, Trusted Types), CSRF protection, secure client-side storage, dependency security (SCA, SRI), session/auth safety, network security (HTTPS, WebSocket, CORS), rendering security, data privacy, build/deployment security |

### Backend Engineering
| File | Lines | Coverage |
|------|-------|----------|
| `backend-development.md` | 295 | API design (REST/GraphQL/gRPC), idempotency, business logic (domain modeling, services, workflows, background jobs, events, caching, concurrency), auth/permissions (sessions, JWT, OAuth, 2FA, RBAC/ABAC), reliability (health checks, logging, metrics, graceful shutdown), security (validation, injection, secrets, uploads), performance/scalability, integrations, testing |
| `api-design.md` | 266 | REST conventions (URLs, methods, status codes, errors), pagination, filtering/sorting, request/response patterns, API versioning, validation, webhooks, rate limiting, GraphQL design, gRPC/protobuf, idempotency keys, OpenAPI documentation, client SDKs |
| `database.md` | 251 | Schema design (keys, naming, types, relationships), indexing, query patterns (N+1, pagination, transactions), migration best practices, data integrity (constraints, soft/hard deletes), connection management, read/write patterns, data access layer, data lifecycle/GDPR, optimistic concurrency |
| `error-handling.md` | 268 | Error classification, backend error handling (middleware, unhandled), frontend error handling (boundaries, API errors, optimistic updates), retry strategies, logging (levels, what to log, request IDs), alerting, graceful degradation, error taxonomy/recovery, UI state machines, distributed tracing, graceful shutdown |
| `security.md` | 255 | Authentication (passwords, sessions, JWT, OAuth), authorization (RBAC, resource-level), input validation (SQL injection, XSS, CSRF), API security (rate limiting, CORS), data protection (encryption, secrets), HTTP headers, file upload security, dependency security, 2FA, fraud controls, secure storage, clickjacking, data privacy |

### Full-Stack Integration
| File | Lines | Coverage |
|------|-------|----------|
| `fullstack-integration.md` | 225 | End-to-end feature implementation, shared domain understanding, UI/server state coordination, API contract alignment, form flows, auth-aware UI/backend, error handling consistency, third-party integration, data sync, webhooks, background jobs, real-time, file upload pipeline, environment config, feature ownership, architecture boundaries, security ownership, maintenance/tech debt |

### Testing & Quality
| File | Lines | Coverage |
|------|-------|----------|
| `testing.md` | 265 | Testing pyramid (unit/integration/E2E), test organization, writing good tests (AAA, naming), API testing, frontend testing, mocking, test data, CI/CD integration, visual regression testing, cross-browser/device testing, contract testing, test reliability, performance testing |
| `quality-assurance.md` | 253 | QA processes (strategy, planning, case design, exploratory, acceptance), bug reporting/triage, cross-platform testing, release readiness, test automation engineering (frameworks, best practices, CI), performance engineering (load/stress/soak/benchmarking), reliability testing (failure modes, chaos, DR), quality governance (DoD, metrics, continuous improvement) |

### Infrastructure & Operations
| File | Lines | Coverage |
|------|-------|----------|
| `devops.md` | 282 | CI/CD pipeline, environment management, deployment strategies (rolling/blue-green/canary), health checks, rollback, monitoring/observability, logging, error tracking, metrics, infrastructure (containers, scaling, DB ops), security in DevOps, SRE (SLIs/SLOs, error budgets, incident management, chaos testing), release engineering |
| `cloud-engineering.md` | 240 | Infrastructure design (VPC, networking), compute (containers, serverless, VMs, edge), storage (object, block, managed DB), networking/traffic (load balancing, CDN, DNS), IAM, high availability/DR, infrastructure as code (Terraform, Pulumi), autoscaling, cost optimization/FinOps, monitoring/observability, compliance/governance |
| `platform-engineering.md` | 220 | Internal developer platform, golden path templates, CI/CD platform (pipelines, builds, runners), observability platform (logging, metrics, tracing, alerting), secrets/config management, service mesh/networking, platform standards/governance, multi-tenant platform, developer workflow automation (pre-commit, ephemeral environments, docs) |
| `release-engineering.md` | 251 | Versioning (SemVer, CalVer), deployment strategies (rolling, blue-green, canary, feature flags, immutable), rollback strategy, feature flag management (lifecycle, types), migration coordination (database, API, data), build reproducibility (signing, provenance, SBOMs, artifacts), release process (planning, checklists, changelogs, hotfix), post-release validation, backward compatibility, governance |

### Specialized Domains
| File | Lines | Coverage |
|------|-------|----------|
| `mobile-development.md` | 260 | iOS/Android native (UI, navigation, storage, push, lifecycle, permissions, background), cross-platform (React Native/Expo, Flutter, KMP), mobile UX (touch, keyboard, gestures, safe area, offline-first, low connectivity), data/networking, mobile security (secure storage, cert pinning), mobile testing, build/release/distribution, monitoring/maintenance |
| `desktop-apps.md` | 270 | Framework selection (Electron, Tauri, native, Qt, Flutter, .NET MAUI), window management, menu/shortcuts, system integration (notifications, clipboard, file system, drag-and-drop), desktop UX (high-density, precision input, power user, multi-monitor, offline), performance, security, data/syncing, testing, build/release/distribution, observability |
| `systems-engineering.md` | 235 | High-performance systems (latency, throughput), concurrency/parallelism (models, sync primitives, lock-free, deadlock prevention, thread pooling), memory management (allocation, safety, profiling, GC tuning), networking/I/O, OS interactions (processes, filesystem, time), storage systems, fault tolerance (failure modes, resilience, distributed systems), profiling/benchmarking, security, reliability engineering |
| `stacks.md` | 250 | Web app stacks (full-stack, serverless, JAMstack), API stacks (REST, GraphQL), mobile stacks (cross-platform, native), desktop stacks (Electron, Tauri, Qt), real-time stacks (WebSocket, event-driven), data/ML stacks, infrastructure stacks (IaC, containers), monorepo tooling, database/ORM selection, package managers |
| `security-functions.md` | 253 | Application security (secure coding, OWASP Top 10, SAST/DAST, SCA), infrastructure security (cloud IAM, network, secrets, key management, encryption, hardening, vulnerability scanning, SIEM), product security (threat modeling, abuse cases, privacy, pentesting, third-party risk), GRC (policies, compliance, audits, risk management), SecOps (monitoring, incident response, vulnerability management, training) |
| `data-intelligence.md` | 204 | Data engineering (pipelines, ingestion, ETL/ELT, modeling layers, data quality, orchestration, lineage), analytics engineering (metrics layer, semantic models, dbt-style, dashboards, experiments), ML engineering (model serving, feature engineering, MLOps, monitoring, inference optimization, privacy), data governance (classification, retention, access controls, consent/privacy compliance) |
| `software-architecture.md` | 294 | Architecture patterns (monolith, modular monolith, microservices, event-driven, serverless), domain modeling (DDD, aggregates, entities/VOs, domain events, service boundaries), data architecture (schema, consistency, ownership, caching), API architecture (contracts, gateway, versioning, inter-service comms), security architecture, scalability, reliability, cross-cutting concerns, ADRs, solutions architecture, technical design |
| `developer-experience.md` | 230 | Developer tooling (CLIs, SDKs, code generators, local dev, mock servers, debug tools, portals, shared libraries, linting), build systems (performance, tools, bundling, dependency management, artifacts, cross-platform), documentation engineering (technical, API, onboarding, code docs, automation, publishing), developer productivity (PRs, branching, issues, automation), support/enablement (training, feedback, knowledge management, inner-source) |

## Usage

These files are read by:
- **Content-fill system** (`axion-content-fill.ts`) — to enrich AI prompts with best practices
- **Package system** (`axion-package.ts`) — to include relevant knowledge in Agent Kits
- **Draft/seed scripts** — to inform initial document generation

## Taxonomy Coverage

The knowledge base covers the complete software development taxonomy:

1. **Frontend Engineering**: UI development, state management, forms, interactions, i18n, design systems, accessibility, performance, frontend security
2. **Backend Engineering**: API design (REST/GraphQL/gRPC), business logic, auth/permissions, error handling, database design, security
3. **Full-Stack Integration**: end-to-end feature implementation, shared contracts, data sync, deployment coordination
4. **Mobile Development**: iOS/Android native, cross-platform (React Native, Flutter), mobile UX, offline-first
5. **Desktop Applications**: Electron, Tauri, native frameworks, system integration, window management
6. **Systems Engineering**: high-performance systems, concurrency, memory management, networking, fault tolerance
7. **Platform Engineering**: internal developer platforms, CI/CD, observability, golden paths, multi-tenant
8. **Cloud Engineering**: infrastructure design, compute/storage/networking, IaC, autoscaling, cost optimization
9. **Release Engineering**: versioning, deployment strategies, feature flags, migrations, build reproducibility
10. **Security Functions**: AppSec, infrastructure security, product security, GRC, SecOps
11. **Data & Intelligence**: data engineering, analytics, ML engineering, data governance
12. **Quality Assurance**: test strategy, automation, performance engineering, reliability testing, governance
13. **Software Architecture**: patterns, domain modeling, data architecture, scalability, reliability, ADRs
14. **Developer Experience**: tooling, build systems, documentation, productivity, support/enablement
15. **Testing**: test pyramid, visual regression, contract testing, CI/CD integration, flaky test management

## Contributing

Each file follows the same pattern:
1. A brief intro explaining the category
2. Sections organized by concern
3. Concrete recommendations (not vague advice)
4. "When to use" and "When to avoid" guidance where applicable
5. Tables for quick reference (decision matrices, comparison charts)
6. Code examples where patterns benefit from illustration
