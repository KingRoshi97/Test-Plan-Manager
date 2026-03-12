---
unit_id: "STDU-QA-003"
title: "Unit Tests Required"
version: "1.0.0"
status: "active"
category: "STD-CAT-04"
source_pack: "qa_baseline@1.0.0"
rule_id: "QA-003"
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

# STDU-QA-003 — Unit Tests Required

## Summary

Every core module must have corresponding unit tests. All tests must pass.

## Rule

This is a **mandatory requirement**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: qa_baseline@1.0.0
- **Rule ID**: QA-003
- **Priority**: 100

## Value

```json
{
  "check": "unit_tests",
  "pass_rate": 1
}
```
