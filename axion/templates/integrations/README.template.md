<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:integrations -->
<!-- AXION:PREFIX:integ -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Integrations — AXION Module Template (Blank State)

**Module slug:** `integrations`  
**Prefix:** `integ`  
**Description:** Third-party integrations and external services

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:INTEG_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the integrations module.
"Owns" = third-party service adapters, webhook handlers, credential management for external services, integration health monitoring.
"Does NOT own" = internal API contracts (contracts module), business logic using integration data (backend module), auth providers (auth module).
Common mistake: putting business logic in integration adapters — adapters should translate external formats to internal formats, not make business decisions. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:INTEG_CATALOG -->
## Integration Catalog
<!-- AGENT: Derive from RPBS §9 Integrations — enumerate every third-party service.
Provider list = each external service (name, purpose, API version, documentation link).
Data exchanged = for each provider: what data flows in and out, direction (inbound/outbound/bidirectional), format (JSON/XML/webhook/file).
Reference DIM for interface definitions with external systems.
Common mistake: not versioning API dependencies — always note which API version is targeted and how breaking changes will be handled. -->
- Provider list + purpose: [TBD]
- Data exchanged + direction: [TBD]


<!-- AXION:SECTION:INTEG_AUTH -->
## Credentials & Auth
<!-- AGENT: Derive from RPBS §8 Security & Compliance and security module policies.
Credential storage = where API keys/tokens/OAuth credentials are stored (vault, env vars, encrypted config), access control for credentials.
Rotation = rotation cadence per credential type, automated vs manual rotation, zero-downtime rotation strategy.
Common mistake: hardcoding credentials or storing them in version control — all credentials must be externalized and rotatable without code changes. -->
- Credential storage strategy: [TBD]
- Rotation expectations: [TBD]


<!-- AXION:SECTION:INTEG_WEBHOOKS -->
## Webhooks / Callbacks
<!-- AGENT: Derive from RPBS §9 Integrations for webhook requirements per provider.
Incoming webhooks = list each webhook endpoint (URL path, provider, event types handled).
Signature verification = how each provider's webhook signatures are validated (HMAC, asymmetric keys, shared secrets).
Retry/dedup = how to handle duplicate deliveries (idempotency keys, event ID tracking), what happens on processing failure.
Common mistake: not implementing idempotent webhook processing — providers will retry, and your handler must safely process the same event multiple times. -->
- Incoming webhooks: [TBD]
- Signature verification: [TBD]
- Retry/dedup strategy: [TBD]


<!-- AXION:SECTION:INTEG_FAILURES -->
## Failure Handling
<!-- AGENT: Derive from RPBS §7 Non-Functional Profile for reliability requirements.
Timeouts = per-provider timeout values, overall budget for integration calls within a request.
Retries = which calls are safe to retry (idempotent operations only), max retries, backoff strategy (exponential with jitter).
Partial failure = what happens when one integration succeeds but another fails mid-flow (compensation, saga pattern, manual reconciliation).
Common mistake: retrying non-idempotent calls or not having circuit breakers — failed integrations should degrade gracefully, not cascade. -->
- Timeouts/retries: [TBD]
- Partial failure strategies: [TBD]


<!-- AXION:SECTION:INTEG_COMPLIANCE -->
## Compliance & Data Handling
<!-- AGENT: Derive from RPBS §8 Security & Compliance and RPBS §29 Privacy Controls.
PII shared = which integrations receive PII, what fields, legal basis (DPA, consent), data processing agreements in place.
Data retention = how long integration data is stored locally, right-to-deletion obligations, data residency requirements.
Common mistake: sharing PII with third parties without documenting the legal basis — every PII transfer needs a documented justification. -->
- PII shared: [TBD]
- Data retention requirements: [TBD]


<!-- AXION:SECTION:INTEG_TESTING -->
## Integration Testing
<!-- AGENT: Derive from TESTPLAN for integration test strategy.
Sandbox = which providers offer sandbox/test environments, how to configure them, test credential management.
Contract tests = how to verify that integration adapters conform to expected provider API shapes (consumer-driven contracts, recorded fixtures, mock servers).
Common mistake: only testing against mocks without ever validating against real sandbox APIs — periodic real API validation catches breaking changes early. -->
- Sandbox/staging strategies: [TBD]
- Contract tests: [TBD]


<!-- AXION:SECTION:INTEG_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Catalog enumerated
- [ ] Credential and webhook policies defined
- [ ] Failure modes addressed


<!-- AXION:SECTION:INTEG_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved integration decisions or missing upstream information.
Each question should reference which upstream source or provider documentation is needed to resolve it.
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
