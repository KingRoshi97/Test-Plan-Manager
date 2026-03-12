---
unit_id: "STDU-STD-ENG-001"
title: "Deterministic stage order"
version: "1.0.0"
status: "active"
category: "STD-CAT-01"
source_pack: "CORE@1.0.0"
rule_id: "STD-ENG-001"
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

# STDU-STD-ENG-001 — Deterministic stage order

## Summary

Pipeline stages must execute in a fixed, declared order; no implicit stages.

## Rule

This is a **mandatory requirement**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: CORE@1.0.0
- **Rule ID**: STD-ENG-001
- **Priority**: 1000

## Value

```json
{
  "deterministic_stage_order": true
}
```
