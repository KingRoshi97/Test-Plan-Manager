---
unit_id: "STDU-SEC-002"
title: "Sensitive Data Logging Prohibition"
version: "1.0.0"
status: "active"
category: "STD-CAT-03"
source_pack: "sec_baseline@1.0.0"
rule_id: "SEC-002"
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

# STDU-SEC-002 — Sensitive Data Logging Prohibition

## Summary

Sensitive data (PII, credentials, tokens) must never be written to logs, traces, or error messages.

## Rule

This is a **fixed constraint**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: sec_baseline@1.0.0
- **Rule ID**: SEC-002
- **Priority**: 100

## Value

```json
{
  "pattern": "no_sensitive_logging"
}
```
