---
unit_id: "STDU-QA-006"
title: "Integration Test Requirement"
version: "1.0.0"
status: "active"
category: "STD-CAT-04"
source_pack: "qa_baseline@1.0.0"
rule_id: "QA-006"
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

# STDU-QA-006 — Integration Test Requirement

## Summary

Integration tests must cover critical path workflows.

## Rule

This is a **configurable default**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: qa_baseline@1.0.0
- **Rule ID**: QA-006
- **Priority**: 100

## Value

```json
{
  "required_for": "critical_workflows"
}
```
