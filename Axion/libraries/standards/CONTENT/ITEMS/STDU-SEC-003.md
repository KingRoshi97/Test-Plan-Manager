---
unit_id: "STDU-SEC-003"
title: "Authentication Required for Mutations"
version: "1.0.0"
status: "active"
category: "STD-CAT-03"
source_pack: "sec_baseline@1.0.0"
rule_id: "SEC-003"
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

# STDU-SEC-003 — Authentication Required for Mutations

## Summary

All state-mutating operations must require authenticated identity when auth is enabled.

## Rule

This is a **mandatory requirement**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: sec_baseline@1.0.0
- **Rule ID**: SEC-003
- **Priority**: 100

## Value

```json
{
  "scope": "mutations",
  "requires": "authenticated_identity"
}
```
