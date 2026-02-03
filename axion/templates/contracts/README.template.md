<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:contracts -->
<!-- AXION:PREFIX:contract -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Contracts — AXION Module Template (Blank State)

**Module slug:** `contracts`  
**Prefix:** `contract`  
**Description:** API contracts, interfaces, and data schemas

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
- Stack Selection Policy alignment: UNKNOWN (source: REBS §1)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:CONTRACT_SCOPE -->
## Scope & Ownership
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:CONTRACT_API_SURFACE -->
## API Surface Inventory
- Endpoint list (method, path, purpose): [TBD]
- Ownership by module: [TBD]


<!-- AXION:SECTION:CONTRACT_SCHEMAS -->
## Schemas & Types
- Request/response schema references: [TBD]
- Canonical type definitions and versioning: [TBD]


<!-- AXION:SECTION:CONTRACT_ERRORS -->
## Error Model
- Error envelope standard: [TBD]
- Error codes list + meanings: [TBD]
- Client-facing vs internal errors: [TBD]


<!-- AXION:SECTION:CONTRACT_VERSIONING -->
## Compatibility & Versioning
- Versioning rules: [TBD]
- Backward compatibility guarantees: [TBD]
- Deprecation policy: [TBD]


<!-- AXION:SECTION:CONTRACT_EVENTS -->
## Events, Webhooks, Async Contracts
- Event list + payload schema: [TBD]
- Delivery guarantees (at-least-once/exactly-once): [TBD]
- Idempotency keys: [TBD]


<!-- AXION:SECTION:CONTRACT_SECURITY -->
## Security & Privacy Constraints
- Auth requirements per endpoint: [TBD]
- PII fields + handling rules: [TBD]


<!-- AXION:SECTION:CONTRACT_ACCEPTANCE -->
## Acceptance Criteria
- [ ] All public endpoints enumerated
- [ ] Schema ownership is explicit
- [ ] Error and versioning rules documented


<!-- AXION:SECTION:CONTRACT_OPEN_QUESTIONS -->
## Open Questions
- [TBD]
