---
library: ops
id: OPS-0
section: boundary_checklist
schema_version: 1.0.0
status: draft
---

# OPS-0 — Boundary Checklist

Use this checklist to verify that a change belongs in `ops/` and not in another library.

## Belongs in ops/ if:
- [ ] It defines a new monitoring alert rule or modifies an existing alert definition
- [ ] It changes alert severity levels, escalation tiers, or cooldown policies
- [ ] It adds or modifies required log fields, correlation ID rules, or redaction patterns
- [ ] It defines or changes log level semantics or structured logging requirements
- [ ] It adds or modifies an SLO/SLA objective or error budget policy
- [ ] It changes burn-rate alert thresholds or enforcement actions
- [ ] It adds or modifies a per-stage or per-run performance budget
- [ ] It changes profiling policy or capture thresholds
- [ ] It defines or modifies capacity assumptions or cost model estimates
- [ ] It adds or changes compute/storage unit definitions or quota hooks
- [ ] It specifies what ops evidence a gate check requires
- [ ] It adds or removes an item from the minimum viable ops set

## Does NOT belong in ops/ if:
- [ ] It changes gate evaluation logic or predicate DSL → `gates/`
- [ ] It defines risk classes or override policies → `policy/`
- [ ] It configures telemetry sinks or transport mechanisms → `telemetry/`
- [ ] It modifies audit trail storage or compliance ledger → `audit/`
- [ ] It changes pipeline stage order or stage IO → `orchestration/`
- [ ] It modifies workspace/project/pin configuration → `system/`
- [ ] It changes intake form structure → `intake/`
- [ ] It modifies canonical spec handling → `canonical/`
- [ ] It changes standards packs or resolution → `standards/`
- [ ] It changes template selection or rendering → `templates/`
- [ ] It modifies knowledge selection rules → `knowledge/`
- [ ] It changes verification proof ledger → `verification/`
- [ ] It changes kit packaging → `kit/`

## Cross-library touchpoints
| Touchpoint | ops/ owns | Other library owns |
|---|---|---|
| Alert rules feed gate checks | Alert rule definitions and severity | Gate predicate evaluation (gates/) |
| SLO burn-rate triggers gate tightening | SLO policy and burn-rate thresholds | Gate override/tightening logic (gates/) |
| Perf budgets enforce stage timing | Budget values and profiling policy | Stage execution and timing (orchestration/) |
| Ops evidence referenced by gates | Evidence format and content | Gate report format (gates/) |
| Cost models inform quota hooks | Capacity assumptions and estimates | Quota enforcement (system/) |
| Log standards apply to all stages | Required fields and redaction rules | Stage log emission (orchestration/) |
| Ops metrics feed audit trail | Ops metric definitions | Audit ledger schema (audit/) |
