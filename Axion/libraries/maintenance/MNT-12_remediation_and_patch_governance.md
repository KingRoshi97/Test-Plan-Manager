---
doc_id: MNT-12
title: "Remediation & Patch Governance"
library: maintenance
version: "0.1.0"
status: active
---

# MNT-12: Remediation & Patch Governance

## Purpose

Defines the governance rules for creating, reviewing, and applying remediation patches to Axion artifacts. This doctrine covers patch types PT-*, proposal packs, and the consent-gated apply/publish workflow.

## Patch Classification

| Class | Scope | Consent Required | Example |
|-------|-------|-----------------|---------|
| Class A | Read-only analysis, no mutations | No (findings only) | Health check, coverage audit |
| Class B | Targeted fix to a single artifact | G-MUS-01 (apply) | Registry entry correction, schema fix |
| Class C | Cross-cutting change across multiple artifacts | G-MUS-01 + blast radius | Template upgrade, deprecation rollout |
| Class D | Breaking change requiring migration | G-MUS-01 + G-MUS-06 (publish) | Major version bump, schema removal |

## Remediation Workflow

1. **Detection**: A maintenance mode run produces findings identifying the issue.
2. **Triage**: Findings are classified by severity (`error`, `warning`, `info`).
3. **Proposal**: For Class B/C/D patches, a proposal pack is generated with the proposed changes.
4. **Review**: The operator reviews the proposal pack and approves or rejects.
5. **Apply**: Approved proposals are applied under the appropriate consent gate.
6. **Verify**: Post-apply verification run (MM-02) confirms the fix resolved the finding.
7. **Close**: The finding status is updated to `resolved`.

## Patch Budget Enforcement

- Every patch operation must declare its expected token cost and asset touch count.
- Patches exceeding the mode's `default_budgets` are rejected unless a budget override is explicitly granted.
- Budget overrides require G-MUS-05 gate clearance.

## Rollback Policy

- Every Class B/C/D patch must be reversible.
- A pre-apply snapshot (MM-16) is mandatory for Class C and Class D patches.
- Rollback is executed via MM-15 (Rollback / Revert Release).

## Audit Trail

All remediation actions are recorded in the proof bundle with:

- Finding ID that triggered the remediation
- Patch type and class
- Artifacts modified
- Before/after snapshots
- Consent gate clearance records
