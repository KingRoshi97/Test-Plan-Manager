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
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:STATE_MODEL -->
## State Model
- State domains/slices: [TBD]
- State invariants: [TBD]


<!-- AXION:SECTION:STATE_SOURCES -->
## State Sources
- Local UI state: [TBD]
- Server state/cache: [TBD]
- Derived state/selectors: [TBD]


<!-- AXION:SECTION:STATE_UPDATES -->
## Update Patterns
- Action/event patterns: [TBD]
- Optimistic updates + rollback: [TBD]


<!-- AXION:SECTION:STATE_PERSIST -->
## Persistence & Hydration
- What persists and where: [TBD]
- Migration of persisted state: [TBD]


<!-- AXION:SECTION:STATE_ERROR -->
## Error & Edge-Case Handling
- Error states representation: [TBD]
- Concurrency conflicts: [TBD]


<!-- AXION:SECTION:STATE_TESTING -->
## Testing Strategy
- Unit tests for reducers/selectors/stores: [TBD]
- Integration tests: [TBD]


<!-- AXION:SECTION:STATE_ACCEPTANCE -->
## Acceptance Criteria
- [ ] State model enumerated
- [ ] Update patterns documented
- [ ] Persistence strategy stated


<!-- AXION:SECTION:STATE_OPEN_QUESTIONS -->
## Open Questions
- [TBD]
