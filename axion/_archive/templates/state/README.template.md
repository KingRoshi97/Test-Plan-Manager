<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:state -->
<!-- AXION:PREFIX:state -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# State — AXION Module Template (Blank State)

**Module slug:** `state`  
**Prefix:** `state`  
**Description:** State management, stores, and client-side data

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
- Non-Functional Profile implications: N/A (source: RPBS §7 Non-Functional Profile)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:STATE_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the state module.
"Owns" = client-side state management strategy, store architecture, state domains/slices, caching policy, optimistic update patterns.
"Does NOT own" = server-side data persistence (database module), API data fetching logic (backend module), UI rendering (frontend module).
Common mistake: conflating state management with data fetching — state module defines HOW client data is organized and updated; backend defines WHERE it comes from. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:STATE_MODEL -->
## State Model
<!-- AGENT: Derive from RPBS §4 Core Objects Glossary and DDES entity definitions.
State domains/slices = logical groupings of state (e.g., auth slice, entities slice, UI slice) mapped to core objects.
State invariants = rules that must always hold (e.g., "selected item must exist in the items list", "user cannot be both logged-in and anonymous").
Reference BELS for business invariants that must be enforced client-side.
Common mistake: creating one monolithic store — state should be organized by domain with clear boundaries between slices. -->
- State domains/slices: [TBD]
- State invariants: [TBD]


<!-- AXION:SECTION:STATE_SOURCES -->
## State Sources
<!-- AGENT: Derive from SCREENMAP for UI state needs and DIM for server data dependencies.
Local UI state = ephemeral state that doesn't survive page refresh (form inputs, modal open/closed, active tab).
Server state/cache = data fetched from APIs, caching strategy (stale-while-revalidate, TTL), cache invalidation triggers.
Derived state/selectors = computed values from existing state (filtered lists, aggregations, formatted display values).
Common mistake: storing derived state when it should be computed — selectors/computed values prevent stale derived data. -->
- Local UI state: [TBD]
- Server state/cache: [TBD]
- Derived state/selectors: [TBD]


<!-- AXION:SECTION:STATE_UPDATES -->
## Update Patterns
<!-- AGENT: Derive from BELS state machines for valid state transitions and RPBS §7 for responsiveness requirements.
Action/event patterns = how state changes are triggered (actions/reducers, events, direct mutation) — name the pattern and library.
Optimistic updates = which mutations show instant UI feedback before server confirmation, rollback behavior on server rejection.
Reference architecture module for chosen state management library conventions.
Common mistake: applying optimistic updates to non-idempotent operations — only use optimistic updates where rollback is safe and visible to the user. -->
- Action/event patterns: [TBD]
- Optimistic updates + rollback: [TBD]


<!-- AXION:SECTION:STATE_PERSIST -->
## Persistence & Hydration
<!-- AGENT: Derive from RPBS §7 for offline/persistence requirements.
What persists = which state slices survive page refresh (localStorage, sessionStorage, IndexedDB) and why.
Migration = how persisted state is handled when the schema changes between app versions (version keys, migration functions, cache busting).
Common mistake: persisting sensitive data (tokens, PII) in localStorage without encryption — reference security module policies for client-side storage. -->
- What persists and where: [TBD]
- Migration of persisted state: [TBD]


<!-- AXION:SECTION:STATE_ERROR -->
## Error & Edge-Case Handling
<!-- AGENT: Derive from BELS error handling rules and contracts module error codes.
Error states = how errors are represented in state (error objects per slice, global error state, error boundaries).
Concurrency conflicts = what happens when two tabs/users modify the same data (last-write-wins, conflict resolution UI, version vectors).
Common mistake: silently swallowing errors in state updates — every error should be surfaced to the user or logged for debugging. -->
- Error states representation: [TBD]
- Concurrency conflicts: [TBD]


<!-- AXION:SECTION:STATE_TESTING -->
## Testing Strategy
<!-- AGENT: Derive from TESTPLAN for state testing approach.
Unit tests = test reducers/selectors/stores in isolation with known inputs and expected outputs, test state invariants.
Integration tests = test state management with real API calls (or mocked), verify cache invalidation, test optimistic update rollbacks.
Common mistake: only testing the happy path — test error states, edge cases, and concurrent update scenarios. -->
- Unit tests for reducers/selectors/stores: [TBD]
- Integration tests: [TBD]


<!-- AXION:SECTION:STATE_ACCEPTANCE -->
## Acceptance Criteria
- [ ] State model enumerated
- [ ] Update patterns documented
- [ ] Persistence strategy stated


<!-- AXION:SECTION:STATE_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved state management decisions or missing upstream information.
Each question should reference which upstream source is needed (e.g., "Awaiting architecture module for state library selection").
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
