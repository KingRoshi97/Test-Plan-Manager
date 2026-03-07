---
library: kit
doc_id: KIT-5-GOV
title: Kit Health
version: 1.0.0
status: draft
---

# KIT-5-GOV — Kit Health

## Purpose

Define the health scoring model and monitoring rules for kit units across their lifecycle.

## Health Dimensions

### Structural Health

- Manifest completeness (all required fields present).
- Tree conformance (all declared paths exist).
- Hash integrity (all file hashes match).

### Dependency Health

- No circular dependencies.
- All dependencies resolve to valid kit units.
- No dependencies on deprecated or demoted units.

### Proof Health

- Proof bundle completeness for the current release class.
- No expired or revoked proofs.
- Coverage score at or above the threshold.

### Consumer Health

- All registered consumer contracts pass validation.
- No unresolved breaking change notices.

## Health Score Calculation

- Each dimension contributes a score from 0 to 100.
- The overall kit health score is the weighted average:
  - Structural: 30%
  - Dependency: 20%
  - Proof: 30%
  - Consumer: 20%

## Health Thresholds

| Release Class    | Minimum Health Score |
|------------------|---------------------|
| dev              | 40                  |
| candidate        | 60                  |
| certified        | 80                  |
| enterprise-ready | 90                  |

## Monitoring

- Kit health is recalculated on every build and promotion event.
- Health score drops below the threshold for the current release class trigger automatic demotion.
- Health trends are tracked in the kit decision report.
