---
unit_id: "STDU-SEC-006"
title: "Session Timeout"
version: "1.0.0"
status: "active"
category: "STD-CAT-03"
source_pack: "sec_baseline@1.0.0"
rule_id: "SEC-006"
rule_type: "default"
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

# STDU-SEC-006 — Session Timeout

## Summary

Maximum session duration before requiring re-authentication.

## Rule

This is a **configurable default**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: sec_baseline@1.0.0
- **Rule ID**: SEC-006
- **Priority**: 100

## Value

```json
{
  "max_duration_minutes": 480,
  "idle_timeout_minutes": 30
}
```
