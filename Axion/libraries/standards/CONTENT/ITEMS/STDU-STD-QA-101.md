---
unit_id: "STDU-STD-QA-101"
title: "Minimum test evidence"
version: "1.0.0"
status: "active"
category: "STD-CAT-04"
source_pack: "QA_BASE@1.0.0"
rule_id: "STD-QA-101"
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

# STDU-STD-QA-101 — Minimum test evidence

## Summary

Runs should produce test evidence when tests exist.

## Rule

This is a **configurable default**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: QA_BASE@1.0.0
- **Rule ID**: STD-QA-101
- **Priority**: 700

## Value

```json
{
  "test_evidence_required": true
}
```
