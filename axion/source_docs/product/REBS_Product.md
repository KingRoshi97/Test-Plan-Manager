# Requirements & Engineering Boundaries Specification (REBS)

## Document Info
**Project:** {{PROJECT_NAME}}
**Version:** {{VERSION}}
**Last Updated:** {{DATE}}
**Status:** Draft | Review | Approved

---

## 1) Stack Selection Policy (Deterministic)

### Inputs Considered (from RPBS)
| Input | Value | Source |
|-------|-------|--------|
| Platform targets | web \| mobile \| desktop | RPBS |
| Scale tier | {{SCALE_TIER}} | RPBS §7 |
| Compliance tier | {{COMPLIANCE_TIER}} | RPBS §7 |
| Data sensitivity | {{DATA_SENSITIVITY}} | RPBS §7 |
| Integrations complexity | low \| med \| high | RPBS §9 |

### Default Stack Profiles

> If RPBS provides no hard constraints, select a profile below.

#### Profile: WEB_SAAS_STANDARD
| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React + TypeScript | Vite build |
| Backend | Node.js + Express | TypeScript |
| Database | PostgreSQL | Drizzle ORM |
| Hosting | Replit/Vercel | Serverless-friendly |

#### Profile: MOBILE_FIRST_STANDARD
| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React Native | Expo managed |
| Backend | Node.js + Express | TypeScript |
| Database | PostgreSQL | Drizzle ORM |
| Hosting | Cloud provider | API-first |

#### Profile: ENTERPRISE_STANDARD
| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React + TypeScript | Vite build |
| Backend | Java/Spring or Node.js | Microservices |
| Database | PostgreSQL | Enterprise scale |
| Hosting | Kubernetes | Self-managed |

### Decision Rule
1. If RPBS constraints exist → **must comply**
2. Else choose profile based on platform targets:
   - mobile required → `MOBILE_FIRST_STANDARD`
   - otherwise → `WEB_SAAS_STANDARD`
3. If `compliance=regulated` → require explicit user confirmation (create OPEN_QUESTION)

---

## 2) Decision Escalation Rules (No Guessing)

When any of the following is unknown, the agent must:
1. Set value to `UNKNOWN`
2. Add OPEN_QUESTION with impact statement
3. If required for implementation → block "release" readiness

### Required-to-Build Unknowns
| Unknown Type | Blocks Release? | Escalation Action |
|--------------|----------------|-------------------|
| Core objects/entities unclear | Yes | Ask user for entity list |
| Primary journeys unclear | Yes | Ask user for journey list |
| Auth model unclear | Yes | Ask user for auth requirements |
| Data sensitivity/compliance (beyond basic) | Yes | Ask user for compliance needs |
| External integrations (if critical) | Yes | Ask user for integration details |
| Tech constraints conflict | No | Present 2 options + recommendation |

### Conflict Resolution Protocol
```
IF constraints_conflict:
  1. Document both constraints
  2. Present 2 resolution options
  3. Add recommendation with rationale
  4. Wait for user decision
  DO NOT invent resolution
```

---

## 3) Repository & Project Layout Standard

### Default Layout
| Aspect | Default | Override Allowed? |
|--------|---------|------------------|
| Repo type | monorepo | Yes, if user specifies |
| Package structure | web, api, shared | Yes |
| Folder conventions | see below | No |

### Folder Conventions
```
/
├── client/           # Frontend code
│   └── src/
├── server/           # Backend code
│   └── src/
├── shared/           # Shared types/utilities
├── docs/             # Build specs (optional)
├── config/           # Runtime config
└── tests/            # Test suites
```

### Naming Rules
| Type | Convention | Example |
|------|------------|---------|
| Package names | kebab-case | `user-service` |
| Env vars | UPPER_SNAKE_CASE | `DATABASE_URL` |
| Service names | kebab-case | `auth-api` |
| File names | camelCase or kebab-case | `userService.ts` |

---

## 4) API Contract Standards

| Aspect | Default | Override Trigger |
|--------|---------|-----------------|
| API style | REST | User explicitly requests GraphQL |
| Versioning | URL prefix `/v1/` | User specifies header versioning |
| Pagination | Cursor-based | Simple lists use offset |
| Idempotency | Required for POST/PUT | N/A |
| Validation | Schema-first (Zod) | N/A |

### Error Envelope (Required)
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

### Status Code Rules
| Scenario | Status | Notes |
|----------|--------|-------|
| Success (read) | 200 | With data |
| Success (create) | 201 | With created resource |
| Success (no content) | 204 | Delete, batch ops |
| Client error | 400-499 | With error envelope |
| Server error | 500-599 | With error envelope |

---

## 5) Data Modeling Standards

| Aspect | Default | Notes |
|--------|---------|-------|
| Primary keys | UUID | `gen_random_uuid()` |
| Timestamps | UTC required | `created_at`, `updated_at` |
| Soft delete | No | Unless RPBS requires audit trail |
| Null handling | Explicit, avoid nulls | Use defaults where possible |

### Migration Policy
1. Schema changes via ORM only (Drizzle)
2. Never write raw SQL migrations
3. Use `db:push` for development
4. Use `db:migrate` for production
5. Retention policy must align with RPBS §8

---

## 6) Security Baseline Defaults

| Aspect | Default | Override Trigger |
|--------|---------|-----------------|
| Authentication | Session-based | User specifies JWT/managed |
| Password policy | 8+ chars, complexity | Regulatory override |
| Rate limiting | Yes (100 req/min) | Adjust per endpoint |
| Secrets handling | Env vars only, never commit | N/A |

### Logging Redaction Rules
| Data Type | Action |
|-----------|--------|
| Passwords | Never log |
| API keys | Never log |
| PII (from RPBS §8) | Redact or hash |
| Request IDs | Always log |
| User IDs | Log (not PII) |

---

## 7) Observability Baseline Defaults

| Requirement | Default | Notes |
|-------------|---------|-------|
| Correlation/Request ID | Required everywhere | UUID per request |
| Logging format | Structured JSON | Winston/Pino |
| Log levels | error, warn, info, debug | Production: info+ |

### Minimum Metrics
| Metric | Type | Notes |
|--------|------|-------|
| Request count | Counter | Per endpoint |
| Request latency | Histogram | p50, p95, p99 |
| Error rate | Counter | Per error code |
| Active connections | Gauge | If applicable |

### Error Reporting
- Capture all unhandled exceptions
- Include correlation ID
- Include stack trace (dev only)
- User-safe messages in response

---

## 8) Testing Baseline Defaults

| Test Type | Requirement | Notes |
|-----------|-------------|-------|
| Unit tests | Required for domain logic | 80%+ coverage target |
| Integration tests | Required for API contracts | Per endpoint |
| E2E tests | Required for top 3 journeys | Playwright/Cypress |
| Smoke tests | Required for release | Critical paths only |

### Release Gate Definition
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Top 3 journeys E2E pass
- [ ] Smoke test pass
- [ ] No critical security issues
- [ ] ERC checklist complete

---

## 9) Copywriting Generation Policy

### If RPBS Copywriting Toggles = Yes:
1. Generate copy for **enabled surfaces only** (RPBS §10)
2. Enforce tone rules from RPBS §10
3. Apply forbidden phrases list (if specified)
4. Error messages must be:
   - User-safe
   - Actionable
   - Non-PII (no internal details)

### If Copywriting = No:
1. Do not generate marketing/microcopy
2. Use technical placeholders only: `{{PLACEHOLDER}}`
3. Mark surfaces as `COPY_REQUIRED` for future pass

### Forbidden Patterns (Default)
- Technical jargon in user-facing copy
- Blame language ("You failed to...")
- Passive voice in error messages
- Internal error codes exposed to users

---

## 10) Consistency Policy (Cross-Doc Alignment)

### Naming Alignment
- All feature names must match RPBS §2 Feature Taxonomy
- All entity names must match RPBS §4 Objects Glossary
- All destination names must match RPBS §6 Navigation

### Journey-to-Screen Mapping
- Every journey in RPBS §5 must map to screens/routes
- Unmapped journeys → OPEN_QUESTION
- Orphan screens (no journey) → flag for review

### Auth Rules Alignment
- Auth implementation must match RPBS §3 Actors
- Permission checks must reflect Permission Intents
- No invented permission levels

### Error Path Coverage
- Every failure outcome in RPBS §5 must have:
  - Error code
  - User-facing message
  - Recovery hint (if applicable)

---

## 11) Notifications Engineering Policy

- **Delivery mechanism default:** background job / queue (unless app is tiny)
- **Retry policy default:** exponential backoff, capped retries
- **Idempotency:** notification send operations must be idempotent
- **User preferences:** opt-out rules must match RPBS §11 matrix
- **Logging:** must not log message bodies if they may contain PII

---

## 12) Search Engineering Policy

- **Default search approach:**
  - small scale: DB search + indexes
  - medium/large: consider dedicated search service (only if required)
- **Pagination default:** cursor for large datasets, offset for small/simple
- **Sorting/filtering:** must be consistent across API + UI

---

## 13) File/Media Engineering Policy

- **Storage default:** object storage (not database blobs)
- **Access control:** signed URLs for private assets
- **Virus scanning:** required if files can contain executables/docs from users
- **Metadata:** store file metadata in DB (owner, type, size, checksum)

---

## 14) Billing/Entitlements Engineering Policy

### If billing is enabled:
- **Billing provider approach:** managed provider by default (unless constraint says otherwise)
- **Webhooks/events:** required for subscription state changes
- **Entitlements must be enforced in:**
  - backend (authoritative)
  - frontend (UX visibility)
- **Idempotency:** required for billing event handling
- **Audit:** important billing actions

### If billing is disabled:
- No plan gating implemented beyond placeholders

---

## 15) Admin/Backoffice Engineering Policy

### If admin UI is enabled:
- Separate admin routes and stricter auth
- Admin actions must generate audit records
- "Impersonation" is disabled by default (must be explicitly requested)
- Export functions must respect data sensitivity rules

### If admin UI is disabled:
- Provide minimal admin capabilities via configuration/scripts only (optional), otherwise N/A

---

## 16) Audit & Export Engineering Policy

- **Audit records must include:**
  - actor id, action, object type/id, timestamp, request/correlation id
- **Audit logs are append-only**
- **Exports must respect data sensitivity** and redact restricted fields where required
- **Exports should be async/background** for large datasets

---

## 17) Abuse & Rate Limit Engineering Policy

- **Rate limiting enabled by default** for public endpoints
- **Account lockout/slowdown** on repeated auth failures (policy-based)
- **Content/reporting flows** are optional unless product requires UGC
- **Logging must avoid storing** sensitive payloads

---

## 18) Import/Migration Engineering Policy

- **Imports must be validated** and produce a per-row error report
- **Large imports run async** with progress reporting
- **Idempotency required** for re-running imports
- **Migration tooling is separate** from app runtime paths

---

## 19) Offline/Sync Engineering Policy

### If offline enabled:
- Local cache rules must be defined (what's cached, TTL)
- Queued writes require idempotent backend endpoints
- Conflict policy must be explicit; **default is last-write-wins** unless user requires merge

---

## 20) Reliability/Recovery Engineering Policy

- **Backup policy must match** data sensitivity/compliance tier
- **DR is optional** unless reliability=high or compliance=regulated
- **Observability requirements increase** with reliability tier

---

## 21) Tenancy Engineering Policy

- **Default tenancy assumption:** team/org for B2B apps unless user specifies single-user
- **Every request must be scoped to tenant/org** when tenancy != single-user
- **Data isolation enforcement** is backend-authoritative
- **Tenant switching** must be explicit in UI state model

---

## 22) Public API / Developer Platform Engineering Policy

### If public API enabled:
- **Versioning required** (semantic or date-based)
- **Authentication default:** API keys (unless OAuth required)
- **Rate limiting required**
- **Webhooks are optional** unless required by workflows
- **SDK is optional;** generate only if requested

---

## 23) Automation/Jobs Engineering Policy

- **Background jobs must be idempotent**
- **Jobs must have retry policy** and failure reporting
- **If progress reporting required:** define job status endpoints or polling model

---

## 24) Analytics/Reporting Engineering Policy

- **Define metric sources and event definitions** (even if light)
- **Separate operational metrics from product analytics** where possible
- **Ensure reporting does not expose sensitive fields** (align to data classification)

---

## 25) Collaboration Engineering Policy

- **Collaboration events should be captured as activity logs** (if enabled)
- **Notifications must respect user preferences** (if matrix exists)
- **Sharing links must have explicit access policy** (public vs authed vs invited)

---

## 26) Real-Time Engineering Policy

- **Default to polling** unless real-time is explicitly required
- **If real-time enabled:**
  - define delivery channel and fallback
  - define reconnection behavior
  - define event payload format
- **Ensure consistency with authorization rules** (no cross-tenant leaks)

---

## 27) UGC & Moderation Engineering Policy

- **Reporting flow required** if public UGC exists
- **Rate limiting and spam controls required** when public submissions exist
- **Storage/access controls must match privacy rules**
- **Moderation logs should be auditable** if moderation enabled

---

## 28) Payments Ops Engineering Policy

### If taxes/invoicing enabled:
- **Use a managed tax/invoicing approach** by default unless constrained
- **Webhook-driven reconciliation** required for payment state
- **Admin tools for refunds** must be auditable

---

## 29) Privacy & Consent Engineering Policy

- **Account deletion must follow retention rules** (billing/audit)
- **Exports must redact restricted fields** (align data classification)
- **Consent must be stored as auditable events** if collected
- **Default deletion mode:** soft delete with grace period unless user demands hard delete

---

## 30) Feature Flags & Experimentation Engineering Policy

- **Flags default:** off unless required
- **Flag evaluation must be deterministic** and testable
- **Experiments require metrics definition** and sample rules before activation
- **Rollouts must support quick rollback**

---

## 31) Support Workflow Engineering Policy

- **Support actions must be auditable** if they affect user data
- **Impersonation disabled by default;** must be explicitly requested
- **Ticket attachments must follow file/media policy rules**

---

## 32) Enterprise SLA/SLO Engineering Policy

### If enterprise enabled:
- **Observability and reliability tiers must be elevated**
- **SSO becomes a first-class requirement** if requested
- **Security/compliance documentation becomes required output** (not optional)

---

## 33) Universal Defaults (Deterministic Fill Rules)

When RPBS is silent on a capability, apply these defaults:

| Capability | Default Value | Condition |
|------------|---------------|-----------|
| Tenancy | team/org | Unless explicitly "personal app" |
| Public API | No | |
| Automation | No | |
| Analytics | basic product analytics Yes, customer-facing reports No | |
| Collaboration | No | Unless user explicitly requests multi-user sharing |
| Real-time | No | |
| UGC | No | |
| Taxes/invoicing | No | Unless user is selling to businesses or mentions invoices/taxes |
| Audit logging | Yes | For admin/security/billing actions |
| Rate limiting | Yes | For public signup/API |
| Imports | No | |
| Offline | No | Unless mobile-first |
| Backups | Yes | If data sensitivity is medium/high |
| Privacy controls | account deletion Yes, export No | Unless compliance requires it |
| Feature flags | No | |
| Support workflow | Yes | If app has paying customers; otherwise Unknown (ask) |
| Enterprise | No | |

---

## 34) Definition of Done for Generated Specs

A generated spec is **"complete"** when:

| Criteria | Check |
|----------|-------|
| Required sections populated | [ ] |
| No `TBD` in required sections | [ ] |
| Any `UNKNOWN` is in OPEN_QUESTIONS | [ ] |
| No contradictions with RPBS | [ ] |
| All cross-references valid | [ ] |
| Template markers preserved | [ ] |
| Naming conventions followed | [ ] |

### Blocking Issues (Cannot Release)
- Missing core entities
- Missing primary journeys
- Unresolved auth model
- Conflicting tech constraints
- Critical OPEN_QUESTIONS unanswered

### Non-Blocking Issues (Can Release with Notes)
- Missing nice-to-have features
- Incomplete copywriting surfaces
- Minor naming inconsistencies
- Deferred integrations

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | | | |
| Architect | | | |
| Product Owner | | | |
