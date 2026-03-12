---
unit_id: "STDU-QA-004"
title: "Proof-Based Acceptance"
version: "1.0.0"
status: "active"
category: "STD-CAT-04"
source_pack: "qa_baseline@1.0.0"
rule_id: "QA-004"
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

# STDU-QA-004 — Proof-Based Acceptance

## Summary

Acceptance criteria must be verified with concrete proof artifacts, not self-attestation.

## Rule

This is a **mandatory requirement**.
This rule is **fixed** and cannot be overridden by lower-priority packs.

## Source

- **Pack**: qa_baseline@1.0.0
- **Rule ID**: QA-004
- **Priority**: 100

## Value

```json
{
  "pattern": "proof_based_verification"
}
```
