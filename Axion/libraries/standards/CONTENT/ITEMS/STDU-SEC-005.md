---
unit_id: "STDU-SEC-005"
title: "Input Validation Required"
version: "1.0.0"
status: "active"
category: "STD-CAT-03"
source_pack: "sec_baseline@1.0.0"
rule_id: "SEC-005"
rule_type: "requirement"
fixed: true
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

# STDU-SEC-005 — Input Validation Required

## Summary

All external inputs must be validated and sanitized before processing.

## Rule

This is a **mandatory requirement**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: sec_baseline@1.0.0
- **Rule ID**: SEC-005
- **Priority**: 100

## Value

```json
{
  "pattern": "validate_all_inputs"
}
```
