---
unit_id: "STDU-STD-ENG-002"
title: "Artifacts must be schema-validatable"
version: "1.0.0"
status: "active"
category: "STD-CAT-01"
source_pack: "CORE@1.0.0"
rule_id: "STD-ENG-002"
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

# STDU-STD-ENG-002 — Artifacts must be schema-validatable

## Summary

All emitted artifacts must have a schema_ref and be machine-validated where applicable.

## Rule

This is a **mandatory requirement**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: CORE@1.0.0
- **Rule ID**: STD-ENG-002
- **Priority**: 1000

## Value

```json
{
  "schema_validation_required": true
}
```
