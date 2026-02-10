<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:state -->
<!-- AXION:PREFIX:state -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# State — Axion Assembler

**Module slug:** `state`  
**Prefix:** `state`  
**Description:** State management, stores, and client-side data for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: Single-tenant (source: RPBS §21)
- Actors & Permission Intents: Single user (source: RPBS §3)
- Core Objects impacted here: Assembly list, current assembly, run logs, artifacts (source: RPBS §4)
- Non-Functional Profile implications: N/A (source: RPBS §7)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:STATE_SCOPE -->
## Scope & Ownership
- Owns: Client-side state management, TanStack Query cache, UI state (modals, forms)
- Does NOT own: Server state (backend), database (data module), routing (frontend)

<!-- AXION:SECTION:STATE_MODEL -->
## State Model
- State domains/slices:
  | Domain | Type | Purpose |
  |--------|------|---------|
  | assemblies | Server | List of assemblies with health indicators |
  | currentAssembly | Server | Selected assembly details + artifacts |
  | runs | Server | Run history for current assembly |
  | liveLog | Local | SSE stream buffer for live log display |
  | ui | Local | Modal states, form values, active tab |
- State invariants:
  - currentAssembly must exist in assemblies list
  - liveLog cleared when switching assemblies

<!-- AXION:SECTION:STATE_SOURCES -->
## State Sources
- Local UI state: React useState for forms, modals, tabs
- Server state/cache: TanStack Query for assemblies, runs, artifacts
- Derived state/selectors:
  - isLockEligible: derived from verify_status.overall_status === 'PASS'
  - moduleCompletionPercent: COUNT(verified) / 19

<!-- AXION:SECTION:STATE_UPDATES -->
## Update Patterns
- Action/event patterns:
  - Query invalidation after mutations (invalidateQueries)
  - SSE events append to liveLog buffer
- Optimistic updates: Not used; wait for server confirmation
- Rollback: N/A — no optimistic updates

<!-- AXION:SECTION:STATE_PERSIST -->
## Persistence & Hydration
- What persists: Nothing persisted client-side; all state from server
- Where: N/A — no localStorage usage
- Migration: N/A

<!-- AXION:SECTION:STATE_ERROR -->
## Error & Edge-Case Handling
- Error states representation: Query.isError + error message displayed in toast
- Concurrency conflicts: N/A — single user; server is source of truth

<!-- AXION:SECTION:STATE_TESTING -->
## Testing Strategy
- Unit tests: N/A for v1 — hooks tested via E2E
- Integration tests: E2E tests cover state updates via UI interactions

<!-- AXION:SECTION:STATE_ACCEPTANCE -->
## Acceptance Criteria
- [x] State model enumerated
- [x] Update patterns documented
- [x] Persistence strategy stated

<!-- AXION:SECTION:STATE_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Use TanStack Query for all server state; avoid manual fetch.
2. Invalidate relevant query keys after mutations.
3. Use hierarchical query keys for cache management (e.g., ['assemblies', id]).

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
