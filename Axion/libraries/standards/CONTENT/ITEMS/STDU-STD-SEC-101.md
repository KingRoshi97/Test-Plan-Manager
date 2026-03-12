---
unit_id: "STDU-STD-SEC-101"
title: "Auth required gate"
version: "1.0.0"
status: "active"
category: "STD-CAT-03"
source_pack: "SEC_BASE@1.0.0"
rule_id: "STD-SEC-101"
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

# STDU-STD-SEC-101 — Auth required gate

## Summary

If auth_required is true, require auth documentation and tests.

## Rule

This is a **configurable default**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: SEC_BASE@1.0.0
- **Rule ID**: STD-SEC-101
- **Priority**: 800

## Value

```json
{
  "auth_requires_tests": true
}
```
