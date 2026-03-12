---
unit_id: "STDU-ENG-001"
title: "TypeScript Required"
version: "1.0.0"
status: "active"
category: "STD-CAT-01"
source_pack: "eng_core@1.0.0"
rule_id: "ENG-001"
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

# STDU-ENG-001 — TypeScript Required

## Summary

All source code must be written in TypeScript with strict mode enabled.

## Rule

This is a **mandatory requirement**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: eng_core@1.0.0
- **Rule ID**: ENG-001
- **Priority**: 100

## Value

```json
{
  "language": "typescript",
  "strict": true
}
```
