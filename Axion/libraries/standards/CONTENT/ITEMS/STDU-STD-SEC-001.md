---
unit_id: "STDU-STD-SEC-001"
title: "No secrets in artifacts"
version: "1.0.0"
status: "active"
category: "STD-CAT-03"
source_pack: "SEC_BASE@1.0.0"
rule_id: "STD-SEC-001"
rule_type: "prohibition"
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

# STDU-STD-SEC-001 — No secrets in artifacts

## Summary

Artifacts must not contain secrets (tokens/keys/passwords).

## Rule

This is a **fixed constraint**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: SEC_BASE@1.0.0
- **Rule ID**: STD-SEC-001
- **Priority**: 800

## Value

```json
{
  "secrets_forbidden": true
}
```
