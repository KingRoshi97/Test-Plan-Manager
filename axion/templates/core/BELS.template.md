# Business Entity Logic Specification (BELS) — {{DOMAIN_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:BELS -->

**Domain Slug:** {{DOMAIN_SLUG}}
**Status:** DRAFT — Truth Candidates

<!-- AXION:AGENT_GUIDANCE
PURPOSE: BELS captures the executable business logic for a domain. It is the bridge
between documentation (RPBS, DDES) and code generation (ERC, scaffold-app).

The ERC (Execution Readiness Contract) copies from BELS at lock time.
If BELS is empty, ERC will be empty, and the agent will have no business rules to implement.

SOURCES TO DERIVE FROM:
1. RPBS §5 User Journeys — extract validation rules and state transitions from journey steps
2. RPBS §4 Core Objects — extract entity lifecycle rules (creation, state changes, deletion)
3. RPBS §3 Actors & Permission Intents — extract authorization rules (who can do what, when)
4. RPBS §15 Error Handling — extract error codes and user-facing messages
5. RPBS §14 Billing — extract entitlement checks if applicable
6. Domain-specific DDES — extract entity details and domain boundaries

RULES:
- Every policy rule MUST have a unique Rule ID using the format: {{DOMAIN_SLUG}}_RULE_NNN
- Every state machine MUST define deny codes for invalid transitions
- Every validation rule MUST have an error code that maps to a user-facing message
- Every reason code MUST be SCREAMING_SNAKE_CASE
- SourceRef MUST point to the upstream RPBS section or DDES the rule derives from
- If business logic is genuinely unknown, write UNKNOWN and add to Open Questions
- Do NOT invent business rules that aren't grounded in RPBS or user intent

CASCADE POSITION (fill priority 12 of 13):
- Upstream (read from): RPBS, REBS, DDES
- Downstream (feeds into): DIM (interface contracts), COPY_GUIDE (error messages), TESTPLAN (business rule tests), ERC (locked at lock time)
- BELS is filled late because it needs entity definitions (DDES) and product requirements (RPBS) as input before business rules can be specified
-->

---

## Policy Rules (Candidates)

<!-- AGENT: Policy rules define "under what conditions can an action be taken." These are the
business rules that get implemented as guard clauses, middleware checks, and validation logic.

EXAMPLES of good policy rules:
- "A user can only edit their own recipes" → Rule + Condition + Action + Deny Code
- "Free tier users are limited to 5 projects" → Entitlement check with tier reference
- "Only verified email users can publish content" → Precondition check

For each rule, think: WHO is trying to do WHAT, under WHAT conditions, and what happens if denied? -->

| Rule ID | Description | Condition | Action | Deny Code | SourceRef |
|---------|-------------|-----------|--------|-----------|-----------|
| {{DOMAIN_SLUG}}_RULE_001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | RPBS §_ |
| {{DOMAIN_SLUG}}_RULE_002 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | RPBS §_ |
| {{DOMAIN_SLUG}}_RULE_003 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | RPBS §_ |

### Rule Interaction Notes
<!-- AGENT: Document any rules that interact with or depend on each other. e.g., "RULE_003 is only evaluated if RULE_001 passes" -->
- UNKNOWN

---

## Invariant Guarantees

<!-- AGENT: Invariants are conditions that MUST always be true regardless of entity state or
user action. Unlike policy rules (which guard specific actions), invariants are system-wide
truths that the codebase must never violate.

EXAMPLES:
- "Every order must have at least one line item" — structural invariant
- "A user's email must be unique across all accounts" — uniqueness invariant
- "Account balance can never go negative" — value boundary invariant
- "Every entity must have a created_by reference to a valid user" — referential invariant

RULES:
- Invariant IDs use format: {{DOMAIN_SLUG}}_INV_NNN
- Every invariant must specify WHERE it is enforced (database constraint, application logic, or both)
- Invariants are non-negotiable — they cannot be overridden by any policy rule or user action -->

| Invariant ID | Description | Enforcement Layer | Violation Behavior | SourceRef |
|-------------|-------------|-------------------|-------------------|-----------|
| {{DOMAIN_SLUG}}_INV_001 | UNKNOWN | DB/App/Both | UNKNOWN | RPBS §_ |
| {{DOMAIN_SLUG}}_INV_002 | UNKNOWN | DB/App/Both | UNKNOWN | RPBS §_ |

---

## State Machines (Candidates)

<!-- AGENT: State machines define how entities change state over time. Every core object
from RPBS §4 that has a lifecycle (created → active → archived, draft → published → deleted, etc.)
should have a state machine here.

RULES FOR STATE MACHINES:
- List ALL valid states for the entity
- Define EVERY valid transition (current state + event → next state)
- Every INVALID transition must have a deny code explaining why it's not allowed
- Deny codes are SCREAMING_SNAKE_CASE and will be used in API error responses

EXAMPLE:
| Current State | Event | Next State | Deny Code | SourceRef |
|draft | publish | published | — | RPBS §5 Journey 1 |
|draft | delete | deleted | — | RPBS §4 Object Lifecycle |
|published | publish | — | ALREADY_PUBLISHED | — |
|deleted | publish | — | CANNOT_PUBLISH_DELETED | — |
-->

### Entity: {{ENTITY_NAME_1}}
**Valid States:** UNKNOWN
**Initial State:** UNKNOWN

| Current State | Event | Next State | Guard Condition | Deny Code | SourceRef |
|---------------|-------|------------|----------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | RPBS §_ |

### Entity: {{ENTITY_NAME_2}}
**Valid States:** UNKNOWN
**Initial State:** UNKNOWN

| Current State | Event | Next State | Guard Condition | Deny Code | SourceRef |
|---------------|-------|------------|----------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | RPBS §_ |

<!-- AGENT: Add more entity state machines as needed. Every core object from RPBS §4 with a lifecycle needs one. -->

---

## Validation Rules (Candidates)

<!-- AGENT: Validation rules define data integrity constraints that must be enforced at the API/form level.
These become Zod schemas, form validation rules, and database constraints.

EXAMPLES:
- "Email must be valid format" → regex validation
- "Title must be 1-200 characters" → length constraint
- "Price must be > 0" → range constraint
- "End date must be after start date" → cross-field validation

For each rule: What field? What rule? What error code shows to the user? Where does this requirement come from? -->

| Field | Entity | Rule | Error Code | User Message | SourceRef |
|-------|--------|------|------------|-------------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | RPBS §_ |
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | RPBS §_ |
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | RPBS §_ |

### Cross-Field Validations
<!-- AGENT: Rules that span multiple fields. e.g., "If type is 'recurring', then frequency is required" -->
| Fields | Rule | Error Code | User Message | SourceRef |
|--------|------|------------|-------------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | RPBS §_ |

---

## Side Effect Rules

<!-- AGENT: Side effects are actions that MUST happen as a consequence of a business event.
Unlike policy rules (which decide IF something can happen), side effect rules define
WHAT ELSE must happen AFTER something succeeds.

EXAMPLES:
- "When a recipe is published, notify all followers of the author" — notification side effect
- "When a user is deleted, anonymize all their comments" — cascade side effect
- "When an order is placed, decrement inventory count" — state synchronization side effect
- "When a payment succeeds, generate an invoice PDF" — artifact generation side effect

RULES:
- Side effect IDs use format: {{DOMAIN_SLUG}}_SE_NNN
- Every side effect must specify whether it is synchronous (blocks the action) or asynchronous (fire-and-forget)
- Failure behavior must be defined — does the original action roll back, or does the side effect retry?
- Side effects that cross domain boundaries should also appear in DIM as events -->

| Side Effect ID | Trigger Event | Action | Sync/Async | Failure Behavior | SourceRef |
|---------------|--------------|--------|------------|-----------------|-----------|
| {{DOMAIN_SLUG}}_SE_001 | UNKNOWN | UNKNOWN | Sync/Async | Rollback/Retry/Ignore | RPBS §_ |
| {{DOMAIN_SLUG}}_SE_002 | UNKNOWN | UNKNOWN | Sync/Async | Rollback/Retry/Ignore | RPBS §_ |

---

## Reason Codes Referenced

<!-- AGENT: This is the master list of all error/deny codes used in this domain's rules.
Every deny code and error code from the tables above MUST appear here.
These codes will be used in:
- API error responses (backend module)
- User-facing error messages (frontend/copy_guide)
- ERC verification (lock step)

FORMAT: Codes MUST be SCREAMING_SNAKE_CASE and unique within the domain.
PREFIX: Use the domain prefix to namespace codes. e.g., FE_INVALID_INPUT, BE_UNAUTHORIZED, AUTH_SESSION_EXPIRED -->

| Code | Message | Severity | HTTP Status | Recovery Action |
|------|---------|----------|------------|----------------|
| UNKNOWN | UNKNOWN | error/warning/info | UNKNOWN | UNKNOWN |
| UNKNOWN | UNKNOWN | error/warning/info | UNKNOWN | UNKNOWN |

---

## Computed / Derived Values

<!-- AGENT: Values that are calculated from other data rather than stored directly.
e.g., "total_price = quantity × unit_price", "display_name = first_name + ' ' + last_name"
These inform both the database module (what NOT to store) and the frontend (what to compute client-side vs server-side). -->

| Value | Formula/Logic | Computed Where | Dependencies |
|-------|-------------|---------------|-------------|
| UNKNOWN | UNKNOWN | Server/Client/Both | UNKNOWN |

---

## Authorization Rules

<!-- AGENT: Who can perform what actions on entities in this domain? Derive from RPBS §3 Actors & Permission Intents.
These become middleware checks and route guards. -->

| Action | Actor(s) Allowed | Condition | Deny Code | SourceRef |
|--------|-----------------|-----------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | RPBS §3 |

---

## Rate Limits & Quotas

<!-- AGENT: Any throttling or quota rules that apply to actions in this domain.
Derive from RPBS §7 Non-Functional Profile and §14 Billing/Entitlements.

EXAMPLES:
- "API calls limited to 100/minute per user" — rate limit
- "Free tier limited to 5 projects" — entitlement quota
- "File uploads limited to 10MB per file" — resource constraint

RULES:
- Specify the scope (per-user, per-account, global)
- Specify what happens when the limit is hit (429 response, queue, degrade gracefully)
- Reference the billing tier if the limit varies by plan -->

| Resource | Limit | Scope | Exceeded Behavior | Deny Code | SourceRef |
|----------|-------|-------|-------------------|-----------|-----------|
| UNKNOWN | UNKNOWN | Per-User/Per-Account/Global | UNKNOWN | UNKNOWN | RPBS §7/§14 |

---

## Open Questions

<!-- AGENT: Every UNKNOWN above should generate an Open Question here. These questions
block the lock step — they MUST be resolved before documentation can be locked. -->

| Q-ID | Section | Question | Impact | Blocking Lock? |
|------|---------|---------|--------|---------------|
| BELS_Q_001 | Policy Rules | UNKNOWN | UNKNOWN | Yes/No |
| BELS_Q_002 | State Machines | Entity ownership needs clarification | Blocks state machine design | Yes |
| BELS_Q_003 | Validation | Specific validation rules need definition | Blocks form/API validation | Yes |
