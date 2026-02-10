<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:fullstack -->
<!-- AXION:PREFIX:fs -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Fullstack — AXION Module Template (Blank State)

**Module slug:** `fullstack`  
**Prefix:** `fs`  
**Description:** End-to-end flows connecting frontend and backend

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: UNKNOWN (source: RPBS §21 Tenancy / Organization Model)
- Actors & Permission Intents: UNKNOWN (source: RPBS §3 Actors & Permission Intents)
- Core Objects impacted here: UNKNOWN (source: RPBS §4 Core Objects Glossary)
- Non-Functional Profile implications: UNKNOWN (source: RPBS §7 Non-Functional Profile)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- Stack Selection Policy alignment: UNKNOWN (source: REBS §1)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:FS_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the fullstack module.
"Owns" = end-to-end flow documentation, cross-layer contract alignment, release coordination between frontend and backend, E2E error mapping.
"Does NOT own" = frontend implementation (frontend module), backend implementation (backend module), API shapes (contracts module), database schema (database module).
Common mistake: duplicating frontend/backend concerns — fullstack module coordinates across layers but doesn't own individual layer implementations. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:FS_E2E_FLOWS -->
## End-to-End Flows
<!-- AGENT: Derive from RPBS §5 User Journeys — document how each critical user journey flows through all layers.
Each flow = user action in UI → frontend state change → API request → backend processing → database operation → response → UI update.
Include: which modules are involved at each step, data transformations, async handoffs, error paths.
Reference SCREENMAP for UI entry points and DIM for API interfaces.
Common mistake: only documenting the happy path — each flow should include error scenarios and what the user sees when something fails. -->
- Flow A (UI→API→DB): [TBD]
- Flow B (UI→API→DB): [TBD]


<!-- AXION:SECTION:FS_CONTRACT_ALIGNMENT -->
## Contract Alignment
<!-- AGENT: Derive from contracts module and architecture module tech stack decisions.
Shared types = how types are shared between frontend and backend (codegen from OpenAPI, shared TypeScript package, manual sync).
Backward compatibility = versioning strategy for API changes, how frontend handles older/newer API versions during rolling deployments.
Common mistake: allowing frontend and backend to define types independently — a single source of truth (contracts module) must own all shared types. -->
- Shared types / codegen approach: [TBD]
- Backward compatibility strategy: [TBD]


<!-- AXION:SECTION:FS_RELEASE -->
## Release & Compatibility
<!-- AGENT: Derive from devops module deployment strategy and RPBS §30 Feature Flags.
Deployment ordering = which must deploy first (backend before frontend, or independent), database migration timing relative to code deploys.
Feature flags = how features spanning both frontend and backend are gated, flag evaluation consistency across layers.
Common mistake: deploying frontend changes that depend on new API endpoints before the backend is ready — always document ordering constraints. -->
- Deployment ordering constraints: [TBD]
- Feature flags strategy: [TBD]


<!-- AXION:SECTION:FS_ERRORS -->
## Cross-Layer Error Handling
<!-- AGENT: Derive from contracts module error codes and BELS error handling rules.
Error mapping = how backend error codes/types translate to user-facing messages (e.g., 422 VALIDATION_ERROR → "Please fix the highlighted fields").
Retries = which failed operations can be retried by the frontend, user-facing retry UX (automatic retry with backoff vs manual retry button).
Common mistake: exposing raw backend error messages to users — always map technical errors to user-friendly messages. -->
- Error mapping (BE codes → FE messages): [TBD]
- Retries and user-facing recovery: [TBD]


<!-- AXION:SECTION:FS_OBSERVABILITY -->
## Tracing & Correlation
<!-- AGENT: Derive from systems module observability requirements and architecture module NFRs.
Correlation IDs = how a single user action is traced from browser click through API to database and back (request ID header, trace context propagation).
Trace propagation = which headers carry trace context (W3C TraceContext, custom), how frontend logs correlate with backend traces.
Common mistake: not propagating trace IDs from frontend — browser-side correlation enables full end-to-end debugging. -->
- Correlation IDs end-to-end: [TBD]
- Trace propagation rules: [TBD]


<!-- AXION:SECTION:FS_TESTING -->
## E2E & Contract Testing
<!-- AGENT: Derive from TESTPLAN for E2E test strategy and contracts module for contract test boundaries.
E2E test matrix = which user journeys have automated E2E tests, browser/device coverage, critical path vs edge case priority.
Contract tests = which module boundaries have contract tests (frontend↔backend, backend↔database), consumer-driven vs provider-driven.
Common mistake: relying solely on E2E tests — contract tests catch integration issues faster and more reliably than full E2E. -->
- E2E test matrix: [TBD]
- Contract tests boundaries: [TBD]


<!-- AXION:SECTION:FS_SECURITY -->
## E2E Security & Privacy
<!-- AGENT: Derive from RPBS §8 Security & Compliance and security module policies.
Data exposure checks = verify that sensitive data (passwords, tokens, PII) never leaks to browser devtools, logs, or error messages across any layer.
Auth/session = how authentication state flows (cookie/token), session timeout behavior, CSRF protection, what happens when session expires mid-action.
Common mistake: only checking security at one layer — data exposure must be verified at every boundary (API response, frontend state, browser storage). -->
- Data exposure checks: [TBD]
- Auth/session behavior across layers: [TBD]


<!-- AXION:SECTION:FS_ACCEPTANCE -->
## Acceptance Criteria
- [ ] E2E flows fully enumerated
- [ ] Release constraints stated
- [ ] Correlation/tracing rules defined


<!-- AXION:SECTION:FS_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved cross-layer decisions or missing upstream information.
Each question should reference which upstream source is needed (e.g., "Awaiting contracts module for error code taxonomy").
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
