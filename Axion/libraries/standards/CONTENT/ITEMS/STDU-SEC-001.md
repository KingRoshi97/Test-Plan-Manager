---
unit_id: "STDU-SEC-001"
title: "No Secrets in Source"
version: "1.0.0"
status: "active"
category: "STD-CAT-03"
source_pack: "sec_baseline@1.0.0"
rule_id: "SEC-001"
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

# STDU-SEC-001 — No Secrets in Source

## Summary

No secrets, API keys, tokens, or credentials may appear in source code or configuration files checked into version control.

## Rule

This is a **fixed constraint**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: sec_baseline@1.0.0
- **Rule ID**: SEC-001
- **Priority**: 100

## Value

```json
{
  "pattern": "no_hardcoded_secrets"
}
```
