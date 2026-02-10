# Implementation Guide

> **Level 0 — Build Truth.** This document defines the build sequence, repository structure, and development conventions for the generated application. It translates REBS engineering policies into actionable build instructions.

## How to Use This Template

1. **Derive from REBS.** Repository layout follows REBS §3, API standards follow REBS §4, data modeling follows REBS §5. This document makes those abstract policies concrete.
2. **Fill placeholders.** Replace `{{PLACEHOLDER}}` with real project data. If unknown, write `UNKNOWN` and add to OPEN_QUESTIONS.
3. **Adapt to stack.** The default structure assumes WEB_SAAS_STANDARD (REBS §1). If a different stack profile was selected, adjust folder structure and tooling accordingly.
4. **Build order matters.** §2 defines the sequence — the build-plan and build-exec pipeline steps follow this order.
5. **Cascade order.** This document is filled after RPBS, REBS, SCHEMA_SPEC, and COMPONENT_SPEC. It references all four.

---

## Document Info

**Project:** {{PROJECT_NAME}}
**Version:** {{VERSION}}
**Last Updated:** {{DATE}}
**Status:** Draft | Review | Approved

---

## 1) Stack Summary

> Derived from REBS §1 (Stack Selection Policy).

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Frontend | {{FRONTEND_TECH}} | {{FE_VERSION}} | |
| Backend | {{BACKEND_TECH}} | {{BE_VERSION}} | |
| Database | {{DB_TECH}} | {{DB_VERSION}} | |
| ORM | {{ORM_TECH}} | {{ORM_VERSION}} | |
| Hosting | {{HOSTING}} | N/A | |
| Package Manager | {{PKG_MANAGER}} | {{PKG_VERSION}} | |
| Build Tool | {{BUILD_TOOL}} | {{BUILD_VERSION}} | |

**Stack Profile:** {{STACK_PROFILE}} (from REBS §1)

---

## 2) Build Sequence

The build-exec step follows this order. Each phase depends on the previous one completing successfully.

### Phase 1: Project Initialization

| Step | Action | Output | Notes |
|------|--------|--------|-------|
| 1.1 | Initialize repository | `package.json`, `tsconfig.json` | |
| 1.2 | Install core dependencies | `node_modules/` | |
| 1.3 | Configure build tool | {{BUILD_CONFIG}} (e.g., `vite.config.ts`) | |
| 1.4 | Set up environment | `.env.example`, environment variables | |

### Phase 2: Shared Layer

| Step | Action | Output | Notes |
|------|--------|--------|-------|
| 2.1 | Define shared types | `shared/schema.ts` | From SCHEMA_SPEC |
| 2.2 | Define validation schemas | `shared/validators.ts` | Zod schemas |
| 2.3 | Define shared constants | `shared/constants.ts` | Enums, config |

### Phase 3: Database Layer

| Step | Action | Output | Notes |
|------|--------|--------|-------|
| 3.1 | Define ORM schema | `server/db/schema.ts` | From SCHEMA_SPEC §1 |
| 3.2 | Configure database connection | `server/db/index.ts` | |
| 3.3 | Push initial schema | `db:push` | REBS §5: no raw SQL |
| 3.4 | Create seed data (if needed) | `server/db/seed.ts` | |

### Phase 4: Backend API

| Step | Action | Output | Notes |
|------|--------|--------|-------|
| 4.1 | Set up server entry point | `server/index.ts` | |
| 4.2 | Configure middleware | Auth, CORS, rate limiting, error handling | REBS §6 |
| 4.3 | Implement storage interface | `server/storage.ts` | CRUD operations |
| 4.4 | Implement API routes | `server/routes.ts` | From COMPONENT_SPEC §5 forms |
| 4.5 | Add request validation | Zod middleware | REBS §4 |
| 4.6 | Add error handling | Error envelope (REBS §4) | |

### Phase 5: Frontend Application

| Step | Action | Output | Notes |
|------|--------|--------|-------|
| 5.1 | Set up app shell | `client/src/App.tsx` | Layout from COMPONENT_SPEC §2 |
| 5.2 | Configure routing | Route definitions | From COMPONENT_SPEC §1 |
| 5.3 | Create shared components | `client/src/components/` | From COMPONENT_SPEC §4 |
| 5.4 | Implement pages | `client/src/pages/` | From COMPONENT_SPEC §3 |
| 5.5 | Implement forms | Form components | From COMPONENT_SPEC §5 |
| 5.6 | Connect API layer | Query hooks, mutations | |
| 5.7 | Add state management | Context/store setup | From COMPONENT_SPEC §8 |

### Phase 6: Integration

| Step | Action | Output | Notes |
|------|--------|--------|-------|
| 6.1 | Wire auth flow | Login/logout/session | RPBS §3 actors |
| 6.2 | Wire notifications (if enabled) | Notification handlers | RPBS §11 |
| 6.3 | Wire file uploads (if enabled) | Upload handlers | RPBS §13 |
| 6.4 | Wire billing (if enabled) | Payment integration | RPBS §14 |
| 6.5 | Wire search (if enabled) | Search endpoint + UI | RPBS §12 |

### Phase 7: Testing

| Step | Action | Output | Notes |
|------|--------|--------|-------|
| 7.1 | Write unit tests | `tests/unit/` | Domain logic |
| 7.2 | Write integration tests | `tests/integration/` | API contracts |
| 7.3 | Write E2E tests | `tests/e2e/` | Top 3 journeys (RPBS §5) |
| 7.4 | Run smoke tests | Pass/fail report | REBS §8 gate |

> **Rule:** Phases must execute in order. A phase cannot start until all steps in the previous phase are complete.

---

## 3) Repository Structure

> Derived from REBS §3 (Repository & Project Layout Standard).

```
{{PROJECT_NAME}}/
├── client/                   # Frontend application
│   ├── src/
│   │   ├── assets/           # Static assets (images, fonts)
│   │   ├── components/       # Shared/reusable components
│   │   │   └── ui/           # Base UI component library
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions, API client
│   │   ├── pages/            # Page components (one per route)
│   │   ├── App.tsx           # Root component with routing
│   │   ├── index.css         # Global styles and theme
│   │   └── main.tsx          # Entry point
│   └── index.html            # HTML template
├── server/
│   ├── db/
│   │   ├── schema.ts         # ORM schema definitions
│   │   ├── index.ts          # Database connection
│   │   └── seed.ts           # Seed data (optional)
│   ├── middleware/            # Express middleware
│   ├── routes.ts             # API route handlers
│   ├── storage.ts            # Storage interface (IStorage)
│   └── index.ts              # Server entry point
├── shared/
│   ├── schema.ts             # Shared types and insert schemas
│   ├── validators.ts         # Shared validation schemas
│   └── constants.ts          # Shared enums and config
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # API integration tests
│   └── e2e/                  # End-to-end tests
├── .env.example              # Environment variable template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Build tool configuration
└── drizzle.config.ts         # ORM configuration
```

> **Rule:** This structure follows REBS §3 defaults. Override only if the user specified a different layout in RPBS §33 or REBS §3.

---

## 4) File and Naming Conventions

> Derived from REBS §3 (Naming Rules).

| Type | Convention | Example |
|------|------------|---------|
| Page components | PascalCase | `Dashboard.tsx` |
| Shared components | PascalCase | `UserAvatar.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utility files | camelCase | `queryClient.ts` |
| API routes | kebab-case URLs | `/api/user-profiles` |
| Database tables | snake_case | `user_profiles` |
| Environment variables | UPPER_SNAKE_CASE | `DATABASE_URL` |
| CSS classes | kebab-case or Tailwind utilities | `card-header` |
| Test files | same name + `.test` | `auth.test.ts` |
| Type/interface names | PascalCase | `UserProfile` |
| Enum values | UPPER_SNAKE_CASE | `ROLE_ADMIN` |

> **Rule:** Naming conventions are enforced by the verify step. Inconsistencies will be flagged.

---

## 5) Environment Variables

### Required Variables

| Variable | Purpose | Required In | Secret? | Notes |
|----------|---------|------------|---------|-------|
| DATABASE_URL | Database connection string | All | Yes | |
| SESSION_SECRET | Session encryption key | All | Yes | |
| {{ENV_VAR_1}} | {{PURPOSE_1}} | Dev/Prod/All | Yes/No | |
| {{ENV_VAR_2}} | {{PURPOSE_2}} | Dev/Prod/All | Yes/No | |

### Optional Variables

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| NODE_ENV | Runtime environment | `development` | |
| PORT | Server port | `5000` | |
| {{OPT_ENV_1}} | {{PURPOSE_1}} | {{DEFAULT_1}} | |

### `.env.example` Template

```
# Required
DATABASE_URL=
SESSION_SECRET=

# Optional
NODE_ENV=development
PORT=5000
```

> **Rule:** Secrets must never be committed to the repository. Use environment variables only (REBS §6).

---

## 6) Dependency Management

### Core Dependencies

| Package | Purpose | Category | Notes |
|---------|---------|----------|-------|
| {{DEP_1}} | {{PURPOSE_1}} | runtime / dev | |
| {{DEP_2}} | {{PURPOSE_2}} | runtime / dev | |

### Dependency Rules

1. **Minimize dependencies.** Only add packages that provide significant value over a simple implementation.
2. **Pin versions.** Use exact versions in `package.json` for reproducible builds.
3. **Audit regularly.** Run `npm audit` before each release.
4. **No duplicate functionality.** If two packages do the same thing, keep one and remove the other.
5. **Prefer well-maintained packages.** Check last publish date, open issues, and download count.

> **Rule:** Every added dependency must have a clear justification. Dependencies not used in the final build must be removed.

---

## 7) Scripts

### Package.json Scripts

| Script | Command | Purpose | Notes |
|--------|---------|---------|-------|
| `dev` | {{DEV_CMD}} | Start development server | Hot reload |
| `build` | {{BUILD_CMD}} | Production build | |
| `start` | {{START_CMD}} | Start production server | |
| `db:push` | {{DB_PUSH_CMD}} | Push schema to database | Development only |
| `db:migrate` | {{DB_MIGRATE_CMD}} | Run migrations | Production |
| `test` | {{TEST_CMD}} | Run test suite | |
| `lint` | {{LINT_CMD}} | Run linter | |

> **Rule:** All scripts must be documented here. Scripts in `package.json` not listed here must be justified or removed.

---

## 8) API Endpoint Inventory

> Derived from COMPONENT_SPEC forms and SCHEMA_SPEC entities.

| Method | Path | Purpose | Auth | Request Body | Response | Notes |
|--------|------|---------|------|-------------|----------|-------|
| GET | /api/{{RESOURCE_1}} | List {{RESOURCE_1}} | Yes/No | N/A | Array of {{ENTITY_1}} | Paginated |
| GET | /api/{{RESOURCE_1}}/:id | Get single {{RESOURCE_1}} | Yes/No | N/A | {{ENTITY_1}} | |
| POST | /api/{{RESOURCE_1}} | Create {{RESOURCE_1}} | Yes | Insert{{ENTITY_1}} | {{ENTITY_1}} | |
| PATCH | /api/{{RESOURCE_1}}/:id | Update {{RESOURCE_1}} | Yes | Partial Insert{{ENTITY_1}} | {{ENTITY_1}} | |
| DELETE | /api/{{RESOURCE_1}}/:id | Delete {{RESOURCE_1}} | Yes | N/A | 204 | |

### Error Responses

All endpoints use the standard error envelope (REBS §4):

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "User-safe message",
    "details": {},
    "request_id": "uuid"
  }
}
```

> **Rule:** Every form in COMPONENT_SPEC §5 must have a corresponding API endpoint here. Every entity in SCHEMA_SPEC must have at least CRUD endpoints unless explicitly excluded.

---

## 9) Testing Strategy

> Derived from REBS §8 (Testing Baseline Defaults).

### Test Coverage Targets

| Layer | Coverage Target | Test Type | Notes |
|-------|----------------|-----------|-------|
| Domain logic | 80%+ | Unit | Business rules, validation |
| API routes | 100% of endpoints | Integration | Request/response contracts |
| Top 3 journeys | Full path | E2E | From RPBS §5 |
| Auth flows | Full path | E2E | Login, logout, permission checks |

### Test Data Strategy

- Use factories/fixtures for test data generation
- Never depend on production data
- Clean up test data after each test run
- Use separate test database (or transactions) for isolation

### Release Gate Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Top 3 journey E2E tests pass
- [ ] Smoke test passes
- [ ] No critical security issues
- [ ] ERC checklist complete (REBS §8)

> **Rule:** The release gate cannot be passed until all items in this checklist are satisfied.

---

## 10) Deployment Checklist

| Step | Action | Verification | Notes |
|------|--------|-------------|-------|
| 1 | Run production build | Build succeeds with no errors | |
| 2 | Run all tests | All tests pass | |
| 3 | Verify environment variables | All required vars are set | |
| 4 | Push database migrations | Schema matches SCHEMA_SPEC | |
| 5 | Deploy application | Health check passes | |
| 6 | Run smoke tests | Critical paths work | |
| 7 | Monitor error rates | No spike in errors | |

> **Rule:** Every deployment must follow this checklist. Skipping steps requires explicit `--override` and must be logged.

---

## OPEN_QUESTIONS

| ID | Question | Why Needed | Impact | Owner | Status |
|----|----------|------------|--------|-------|--------|
| IQ-01 | {{QUESTION_1}} | {{WHY_1}} | {{IMPACT_1}} | User/Agent | Open |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | | | |
| Product Owner | | | |
