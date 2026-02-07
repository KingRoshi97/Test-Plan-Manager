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
<!-- AGENT: Derive from domain-map.md boundaries for the systems module.
"Owns" = system component inventory, service topology, runtime process model, failure mode analysis, system-level observability.
"Does NOT own" = individual service business logic (backend), API contracts (contracts), deployment pipelines (devops), cloud infrastructure (cloud).
Common mistake: overlapping with devops — systems defines WHAT components exist and HOW they interact; devops defines HOW they are built and deployed. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:SYS_COMPONENTS -->
## System Components & Services
<!-- AGENT: Derive from RPBS §1 Product Overview and architecture module's system overview.
Component inventory = every deployable unit (services, workers, gateways) with name, purpose, and owning team/module.
Inter-service communication = sync (HTTP/gRPC) vs async (message queues/events), protocol choices, service discovery mechanism.
Reference DIM for interface contracts between components.
Common mistake: listing only the happy-path interactions — include all communication patterns including event-driven and scheduled. -->
- Component inventory (name → purpose → owner): [TBD]
- Inter-service communication patterns: [TBD]


<!-- AXION:SECTION:SYS_RUNTIME -->
## Runtime Model
<!-- AGENT: Derive from REBS §1 stack selection and RPBS §7 Non-Functional Profile for scaling requirements.
Processes = enumerate each runtime unit (containers, serverless functions, long-running processes) with resource expectations.
Concurrency = threading model, event loop, worker pools — how the system handles parallel work.
Backpressure = what happens when load exceeds capacity: queue depth limits, rate limiting, load shedding strategy.
Common mistake: not specifying resource limits — every process should have expected memory/CPU bounds. -->
- Processes/containers/functions: [TBD]
- Concurrency model: [TBD]
- Backpressure/retry strategy: [TBD]


<!-- AXION:SECTION:SYS_FAILURE_MODES -->
## Failure Modes & Recovery
<!-- AGENT: Derive from RPBS §7 reliability requirements and architecture module NFRs.
Failure modes = enumerate what can fail (dependency down, disk full, network partition, OOM) and the blast radius of each.
Degradation = how the system behaves when partially failed — which features degrade vs which become unavailable.
Shutdown/startup = graceful shutdown (drain connections, finish in-flight work), startup ordering (dependency health checks before accepting traffic).
Common mistake: only listing failures without recovery actions — every failure mode needs a corresponding recovery or mitigation. -->
- Known failure modes: [TBD]
- Degradation strategy: [TBD]
- Safe shutdown/startup requirements: [TBD]


<!-- AXION:SECTION:SYS_CONFIG -->
## Configuration & Feature Control
<!-- AGENT: Derive from RPBS §30 Feature Flags and REBS stack selection for config management tooling.
Configuration sources = env vars, config files, remote config services — list each with precedence order.
Feature flags = enumeration of flags (name, type: release/ops/experiment, default state, owner), flag evaluation strategy (client-side vs server-side).
Common mistake: not specifying flag lifecycle — every flag should have a planned removal date or reason for permanence. -->
- Configuration sources: [TBD]
- Feature flags / toggles: [TBD]


<!-- AXION:SECTION:SYS_OBSERVABILITY -->
## Observability (System-Level)
<!-- AGENT: Derive from RPBS §7 Non-Functional Profile and architecture module observability requirements.
Logging = structured log format, mandatory fields (timestamp, level, service, requestId), log levels by environment, retention policy.
Metrics = the four golden signals (latency, traffic, errors, saturation) per component, plus custom business metrics.
Tracing = distributed trace propagation (W3C TraceContext or similar), span naming, sampling strategy.
Common mistake: defining observability without actionable alerts — every metric should have an associated threshold and response action. -->
- Logging requirements: [TBD]
- Metrics (golden signals): [TBD]
- Tracing requirements: [TBD]


<!-- AXION:SECTION:SYS_SECURITY_BASELINE -->
## Security Baseline
<!-- AGENT: Derive from RPBS §8 Security & Compliance and security module policies.
Secrets handling = how secrets are injected (env vars, vault), rotation policy, which components need which secrets.
Least-privilege = each component's permission scope (database access, network access, file system access) — principle of minimal access.
Dependency hygiene = vulnerability scanning cadence, allowed/blocked dependency lists, SBOM requirements.
Common mistake: giving all services full database access — each service should only access the tables/schemas it owns. -->
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
<!-- AGENT: Capture any unresolved system-level decisions or missing upstream information.
Each question should reference which upstream source is needed to resolve it (e.g., "Awaiting RPBS §7 finalization for latency targets").
Common mistake: leaving questions vague — each should be specific enough that someone can answer it definitively. -->
- [TBD]
