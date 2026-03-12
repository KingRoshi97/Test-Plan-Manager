---
unit_id: "STDU-STD-CON-101"
title: "Explicit interface contracts required when integrations_enabled"
version: "1.0.0"
status: "active"
category: "STD-CAT-06"
source_pack: "CONTRACTS_CONDITIONAL@1.0.0"
rule_id: "STD-CON-101"
rule_type: "requirement"
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

# STDU-STD-CON-101 — Explicit interface contracts required when integrations_enabled

## Summary

If integrations are enabled, require endpoint/interface contracts and proof.

## Rule

This is a **mandatory requirement**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: CONTRACTS_CONDITIONAL@1.0.0
- **Rule ID**: STD-CON-101
- **Priority**: 450

## Value

```json
{
  "interface_contracts_required": true
}
```
