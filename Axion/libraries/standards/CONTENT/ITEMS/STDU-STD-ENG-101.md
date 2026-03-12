---
unit_id: "STDU-STD-ENG-101"
title: "Default artifact hashing policy"
version: "1.0.0"
status: "active"
category: "STD-CAT-01"
source_pack: "CORE@1.0.0"
rule_id: "STD-ENG-101"
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

# STDU-STD-ENG-101 — Default artifact hashing policy

## Summary

Default hashing policy for artifacts unless overridden by stricter packs.

## Rule

This is a **configurable default**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: CORE@1.0.0
- **Rule ID**: STD-ENG-101
- **Priority**: 1000

## Value

```json
{
  "hash_policy": "sha256_optional"
}
```
