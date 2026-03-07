---
library: ops
id: OPS-7a
schema_version: 1.0.0
status: draft
---

# OPS-7a — ops/ Definition of Done

ops/ is "done" when:

## Documentation Complete
- [ ] OPS-0: Purpose and boundary checklist documented
- [ ] OPS-1: Monitoring & alert model, determinism rules, and validation checklist documented
- [ ] OPS-2: Logging & tracing model, determinism rules, and validation checklist documented
- [ ] OPS-3: SLO/error budget model, determinism rules, and validation checklist documented
- [ ] OPS-4: Performance budgets model, determinism rules, and validation checklist documented
- [ ] OPS-5: Cost/quota model, determinism rules, and validation checklist documented
- [ ] OPS-6: Ops gates, gate mapping, determinism rules, and validation checklist documented
- [ ] OPS-7: Minimum viable ops, definition of done, and minimal tree documented

## Schemas Complete
- [ ] `ALRT-01.monitoring_alert_rules.schema.v1.json` — alert rules schema
- [ ] `COST-01.capacity_cost_model.schema.v1.json` — cost model schema
- [ ] `OBS-01.telemetry_event.schema.v1.json` — telemetry event schema
- [ ] `OBS-02.run_metrics.schema.v1.json` — run metrics schema
- [ ] `ops_unit.v1.schema.json` — ops governed unit schema
- [ ] `ops_decision_report.v1.schema.json` — ops decision report schema

## Registries Complete
- [ ] ALRT-01 alert rules registry with escalation tiers
- [ ] COST-01 capacity cost model with quota hooks
- [ ] LTS-01 logging/tracing standards with required fields
- [ ] PERF-01 performance budgets with stage allocations
- [ ] SLO-01 SLO policy with error budget windows
- [ ] Unified ops registry with all governed units
- [ ] Ops metrics catalog with health scoring dimensions

## Runtime Integration
- [ ] Loader module loads all ops library assets
- [ ] API endpoints serve ops library data
- [ ] UI page displays ops library content
- [ ] Assets registered in schema_registry and library_index

## Determinism Verified
- [ ] All determinism rules documented per section (OPS-1 through OPS-6)
- [ ] Gate evaluation order is fixed and deterministic
- [ ] All ops artifacts are version-pinned in run manifests
