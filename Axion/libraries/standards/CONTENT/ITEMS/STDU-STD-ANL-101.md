---
unit_id: "STDU-STD-ANL-101"
title: "Analytics plan required for production"
version: "1.0.0"
status: "active"
category: "STD-CAT-07"
source_pack: "ANALYTICS_CONDITIONAL@1.0.0"
rule_id: "STD-ANL-101"
rule_type: "requirement"
fixed: false
applicability:
  profiles: []
  risk_classes: []
  stacks: []
  domains: []
tags: []
supersedes: null
deprecated_by: null
created_at: "2026-03-01T00:00:00Z"
updated_at: "2026-03-11T00:00:00Z"
owner: "axion/standards"
---

# STDU-STD-ANL-101 — Analytics plan required for production

## Summary

If build_target is production, require an analytics/telemetry plan artifact.

## Rule

This is a **mandatory requirement**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: ANALYTICS_CONDITIONAL@1.0.0
- **Rule ID**: STD-ANL-101
- **Priority**: 350

## Value

```json
{
  "analytics_plan_required": true
}
```
