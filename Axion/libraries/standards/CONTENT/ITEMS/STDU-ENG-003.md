---
unit_id: "STDU-ENG-003"
title: "No Default Exports"
version: "1.0.0"
status: "active"
category: "STD-CAT-01"
source_pack: "eng_core@1.0.0"
rule_id: "ENG-003"
rule_type: "prohibition"
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

# STDU-ENG-003 — No Default Exports

## Summary

All modules must use named exports. Default exports are prohibited.

## Rule

This is a **fixed constraint**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: eng_core@1.0.0
- **Rule ID**: ENG-003
- **Priority**: 100

## Value

```json
{
  "pattern": "no_default_exports"
}
```
