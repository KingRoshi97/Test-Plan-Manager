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

## Open Questions

<!-- AGENT: Every UNKNOWN above should generate an Open Question here. These questions
block the lock step — they MUST be resolved before documentation can be locked. -->

| Q-ID | Section | Question | Impact | Blocking Lock? |
|------|---------|---------|--------|---------------|
| BELS_Q_001 | Policy Rules | UNKNOWN | UNKNOWN | Yes/No |
| BELS_Q_002 | State Machines | Entity ownership needs clarification | Blocks state machine design | Yes |
| BELS_Q_003 | Validation | Specific validation rules need definition | Blocks form/API validation | Yes |
