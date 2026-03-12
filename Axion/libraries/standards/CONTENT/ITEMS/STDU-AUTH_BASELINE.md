---
unit_id: "STDU-AUTH_BASELINE"
title: "Authentication Baseline Standard"
version: "1.0.0"
status: "active"
category: "STD-CAT-02"
applicability:
  profiles: ["PROFILE-API","PROFILE-WEB"]
  risk_classes: ["PROD","COMPLIANCE"]
  stacks: []
  domains: ["auth"]
tags: []
supersedes: null
deprecated_by: null
created_at: "2026-03-01T00:00:00Z"
updated_at: "2026-03-11T00:00:00Z"
owner: "axion/standards"
---

# STDU-AUTH_BASELINE — Authentication Baseline Standard

## Summary

Authentication Baseline Standard standard unit.

## Applicability

- **Profiles**: PROFILE-API, PROFILE-WEB
- **Risk Classes**: PROD, COMPLIANCE
- **Stacks**: all
- **Domains**: auth

## Dependencies

- **gate**: GATE-AUTH-001 — Authentication gate.
- **template**: TPL-AUTH-SESSION — Session auth template.
- **proof**: PROOF-AUTH-FLOW — Auth flow proof.
