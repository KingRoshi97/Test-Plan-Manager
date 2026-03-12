---
unit_id: "STDU-ENG-005"
title: "Dependency Allowlist Enforcement"
version: "1.0.0"
status: "active"
category: "STD-CAT-01"
source_pack: "eng_core@1.0.0"
rule_id: "ENG-005"
rule_type: "constraint"
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

# STDU-ENG-005 — Dependency Allowlist Enforcement

## Summary

Only dependencies listed in the approved allowlist may be used. New dependencies require review.

## Rule

This is a **fixed constraint**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: eng_core@1.0.0
- **Rule ID**: ENG-005
- **Priority**: 100

## Value

```json
{
  "policy": "allowlist_required"
}
```
