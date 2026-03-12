---
unit_id: "STDU-SEC-007"
title: "Rate Limiting Baseline"
version: "1.0.0"
status: "active"
category: "STD-CAT-03"
source_pack: "sec_baseline@1.0.0"
rule_id: "SEC-007"
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

# STDU-SEC-007 — Rate Limiting Baseline

## Summary

Public-facing endpoints must have rate limiting when abuse controls are applicable.

## Rule

This is a **configurable default**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: sec_baseline@1.0.0
- **Rule ID**: SEC-007
- **Priority**: 100

## Value

```json
{
  "default_rpm": 60,
  "auth_rpm": 10
}
```
