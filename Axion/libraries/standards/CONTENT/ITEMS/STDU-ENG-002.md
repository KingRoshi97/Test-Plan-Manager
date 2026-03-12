---
unit_id: "STDU-ENG-002"
title: "Source Directory Structure"
version: "1.0.0"
status: "active"
category: "STD-CAT-01"
source_pack: "eng_core@1.0.0"
rule_id: "ENG-002"
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

# STDU-ENG-002 — Source Directory Structure

## Summary

Source code must follow the canonical directory structure: src/core/, src/cli/, src/types/, src/utils/.

## Rule

This is a **mandatory requirement**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: eng_core@1.0.0
- **Rule ID**: ENG-002
- **Priority**: 100

## Value

```json
{
  "directories": [
    "src/core",
    "src/cli",
    "src/types",
    "src/utils"
  ]
}
```
