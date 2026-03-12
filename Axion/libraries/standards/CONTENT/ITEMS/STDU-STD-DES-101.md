---
unit_id: "STDU-STD-DES-101"
title: "Design outputs required for UI builds"
version: "1.0.0"
status: "active"
category: "STD-CAT-02"
source_pack: "DESIGN_BASE@1.0.0"
rule_id: "STD-DES-101"
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

# STDU-STD-DES-101 — Design outputs required for UI builds

## Summary

If build target includes UI, templates must include a design section and UI constraints.

## Rule

This is a **configurable default**.
This rule is **configurable** and may be overridden by higher-priority packs.

## Source

- **Pack**: DESIGN_BASE@1.0.0
- **Rule ID**: STD-DES-101
- **Priority**: 500

## Value

```json
{
  "ui_design_section_required": true
}
```
