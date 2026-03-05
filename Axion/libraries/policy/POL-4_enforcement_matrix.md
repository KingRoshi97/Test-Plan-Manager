---
library: policy
id: POL-4a
section: enforcement_matrix
schema_version: 1.0.0
status: draft
---

# POL-4a — Enforcement Matrix

| Hook Point | Must Decide | Typical Inputs | Output Used By |
|---|---|---|---|
| RUN_START | allow run? risk_class ok? external ok? | workspace/project bindings, risk_class, executor_type | orchestrator start |
| PIN_RESOLUTION | allow pin overrides? pin targets satisfied? | pin_policy + requested pins | orchestrator pre-run |
| ADAPTER_SELECTION | adapter allowed? | adapter_profile + constraints + risk | executor launcher |
| QUOTA_CHECK | block/warn/approval/degrade | effective quota + forecast usage | orchestrator pre-run |
| GATE_OVERRIDE | override allowed? who must approve? expiry max? | gate_id, risk_class, policy_set | gate evaluator + UI |
| KIT_EXPORT | export allowed? restrictions? | target executor, kit content summary | packager/exporter |
