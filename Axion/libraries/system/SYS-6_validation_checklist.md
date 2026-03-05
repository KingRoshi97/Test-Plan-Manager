---
library: system
id: SYS-6b
schema_version: 1.0.0
status: draft
---

# SYS-6b — Validation Checklist

- [ ] policy_hook_request matches schema
- [ ] policy_hook_decision matches schema
- [ ] hook_point is one of the defined enum values
- [ ] decisions include expiry and are recorded in run manifest
- [ ] require_approval produces notification + pause semantics
- [ ] degrade records applied constraints deterministically
