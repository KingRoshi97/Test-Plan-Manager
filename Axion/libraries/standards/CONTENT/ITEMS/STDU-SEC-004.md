---
unit_id: "STDU-SEC-004"
title: "Authorization Check Before Access"
version: "1.0.0"
status: "active"
category: "STD-CAT-03"
source_pack: "sec_baseline@1.0.0"
rule_id: "SEC-004"
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

# STDU-SEC-004 — Authorization Check Before Access

## Summary

Every protected resource access must verify authorization before returning data or executing actions.

## Rule

This is a **mandatory requirement**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: sec_baseline@1.0.0
- **Rule ID**: SEC-004
- **Priority**: 100

## Value

```json
{
  "pattern": "authz_before_access"
}
```
