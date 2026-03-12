---
unit_id: "STDU-SECURITY_BASELINE"
title: "Security Baseline Standard"
version: "1.0.0"
status: "active"
category: "STD-CAT-02"
applicability:
  profiles: ["PROFILE-API","PROFILE-WEB"]
  risk_classes: ["PROTOTYPE","PROD","COMPLIANCE"]
  stacks: []
  domains: ["auth","security"]
tags: []
supersedes: null
deprecated_by: null
created_at: "2026-03-01T00:00:00Z"
updated_at: "2026-03-11T00:00:00Z"
owner: "axion/standards"
---

# STDU-SECURITY_BASELINE — Security Baseline Standard

## Summary

Security Baseline Standard standard unit.

## Applicability

- **Profiles**: PROFILE-API, PROFILE-WEB
- **Risk Classes**: PROTOTYPE, PROD, COMPLIANCE
- **Stacks**: all
- **Domains**: auth, security

## Dependencies

- **pack**: STD-SECURITY_BASELINE — Parent standards pack.
- **gate**: GATE-SEC-001 — Security gate enforcement.
