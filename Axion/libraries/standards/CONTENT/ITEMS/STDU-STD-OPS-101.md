---
unit_id: "STDU-STD-OPS-101"
title: "Operational logging required when data_enabled"
version: "1.0.0"
status: "active"
category: "STD-CAT-05"
source_pack: "OPS_CONDITIONAL@1.0.0"
rule_id: "STD-OPS-101"
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

# STDU-STD-OPS-101 — Operational logging required when data_enabled

## Summary

If data is enabled, require basic logging/telemetry artifacts.

## Rule

This is a **mandatory requirement**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: OPS_CONDITIONAL@1.0.0
- **Rule ID**: STD-OPS-101
- **Priority**: 400

## Value

```json
{
  "telemetry_required": true
}
```
