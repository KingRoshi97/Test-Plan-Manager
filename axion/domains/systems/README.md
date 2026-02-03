<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:systems -->
<!-- AXION:PREFIX:sys -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Systems — AXION Module Template (Blank State)

**Module slug:** `systems`  
**Prefix:** `sys`  
**Description:** System components, services, and their interactions

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
- Actors & Permission Intents: N/A (source: RPBS §3 Actors & Permission Intents)
- Core Objects impacted here: UNKNOWN (source: RPBS §4 Core Objects Glossary)
- Non-Functional Profile implications: UNKNOWN (source: RPBS §7 Non-Functional Profile)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- Stack Selection Policy alignment: UNKNOWN (source: REBS §1)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:SYS_SCOPE -->
## Scope & Ownership
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:SYS_COMPONENTS -->
## System Components & Services
- Component inventory (name → purpose → owner): [TBD]
- Inter-service communication patterns: [TBD]


<!-- AXION:SECTION:SYS_RUNTIME -->
## Runtime Model
- Processes/containers/functions: [TBD]
- Concurrency model: [TBD]
- Backpressure/retry strategy: [TBD]


<!-- AXION:SECTION:SYS_FAILURE_MODES -->
## Failure Modes & Recovery
- Known failure modes: [TBD]
- Degradation strategy: [TBD]
- Safe shutdown/startup requirements: [TBD]


<!-- AXION:SECTION:SYS_CONFIG -->
## Configuration & Feature Control
- Configuration sources: [TBD]
- Feature flags / toggles: [TBD]


<!-- AXION:SECTION:SYS_OBSERVABILITY -->
## Observability (System-Level)
- Logging requirements: [TBD]
- Metrics (golden signals): [TBD]
- Tracing requirements: [TBD]


<!-- AXION:SECTION:SYS_SECURITY_BASELINE -->
## Security Baseline
- Secrets handling: [TBD]
- Least-privilege expectations: [TBD]
- Dependency hygiene: [TBD]


<!-- AXION:SECTION:SYS_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Component inventory exists
- [ ] Failure modes + recovery documented
- [ ] Observability requirements specified


<!-- AXION:SECTION:SYS_OPEN_QUESTIONS -->
## Open Questions
- [TBD]
