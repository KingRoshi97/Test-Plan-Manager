---
unit_id: "STDU-QA-007"
title: "Performance Baseline"
version: "1.0.0"
status: "active"
category: "STD-CAT-04"
source_pack: "qa_baseline@1.0.0"
rule_id: "QA-007"
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

# STDU-QA-007 — Performance Baseline

## Summary

Performance checks are required when NFR performance targets are defined.

## Rule

This is a **configurable default**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: qa_baseline@1.0.0
- **Rule ID**: QA-007
- **Priority**: 100

## Value

```json
{
  "triggered_by": "nfr.performance_targets",
  "check": "performance_benchmarks"
}
```
