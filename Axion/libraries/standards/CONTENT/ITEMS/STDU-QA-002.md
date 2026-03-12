---
unit_id: "STDU-QA-002"
title: "Lint Must Pass"
version: "1.0.0"
status: "active"
category: "STD-CAT-04"
source_pack: "qa_baseline@1.0.0"
rule_id: "QA-002"
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

# STDU-QA-002 — Lint Must Pass

## Summary

Linting must pass with zero errors. Warnings are tracked but do not block.

## Rule

This is a **mandatory requirement**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: qa_baseline@1.0.0
- **Rule ID**: QA-002
- **Priority**: 100

## Value

```json
{
  "check": "lint",
  "max_errors": 0
}
```
