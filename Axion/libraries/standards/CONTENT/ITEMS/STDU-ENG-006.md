---
unit_id: "STDU-ENG-006"
title: "Naming Convention"
version: "1.0.0"
status: "active"
category: "STD-CAT-01"
source_pack: "eng_core@1.0.0"
rule_id: "ENG-006"
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

# STDU-ENG-006 — Naming Convention

## Summary

Naming convention for files, functions, and types.

## Rule

This is a **configurable default**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: eng_core@1.0.0
- **Rule ID**: ENG-006
- **Priority**: 100

## Value

```json
{
  "files": "kebab-case",
  "functions": "camelCase",
  "types": "PascalCase",
  "constants": "UPPER_SNAKE_CASE"
}
```
