---
unit_id: "STDU-DATA_INTEGRITY"
title: "Data Integrity Standard"
version: "1.0.0"
status: "active"
category: "STD-CAT-01"
applicability:
  profiles: ["PROFILE-API","PROFILE-WEB"]
  risk_classes: ["PROD","COMPLIANCE"]
  stacks: []
  domains: ["data","storage"]
tags: []
supersedes: null
deprecated_by: null
created_at: "2026-03-01T00:00:00Z"
updated_at: "2026-03-11T00:00:00Z"
owner: "axion/standards"
---

# STDU-DATA_INTEGRITY — Data Integrity Standard

## Summary

Data Integrity Standard standard unit.

## Applicability

- **Profiles**: PROFILE-API, PROFILE-WEB
- **Risk Classes**: PROD, COMPLIANCE
- **Stacks**: all
- **Domains**: data, storage

## Dependencies

- **gate**: GATE-DATA-001 — Data integrity gate.
- **proof**: PROOF-DATA-VALIDATION — Data validation proof.
