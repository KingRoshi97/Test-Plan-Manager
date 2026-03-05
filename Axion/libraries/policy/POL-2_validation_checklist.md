---
library: policy
id: POL-2b
section: validation_checklist
schema_version: 1.0.0
status: draft
---

# POL-2b — Validation Checklist

- [ ] override_request validates against schema
- [ ] override_decision validates against schema
- [ ] approved overrides always include expires_at
- [ ] scope fields align with hook_point (gate -> gate_id, quota -> quota_limit, etc.)
- [ ] approved overrides are recorded in run manifest and audit log
