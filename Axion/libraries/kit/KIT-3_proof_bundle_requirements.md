---
library: kit
doc_id: KIT-3-GOV
title: Proof Bundle Requirements
version: 1.0.0
status: draft
---

# KIT-3-GOV — Proof Bundle Requirements

## Purpose

Define the minimum proof artifacts that must accompany a kit unit at each release class tier.

## Proof Categories

### Structural Proofs

- Kit manifest validates against `kit_manifest.v1.schema.json`.
- Kit tree conforms to `kit_tree.v1.json` registry.
- All declared files exist and hashes match.

### Functional Proofs

- Gate evaluation reports for all mandatory gates.
- Test execution summaries with pass/fail counts.
- Coverage scores meeting the minimum threshold for the release class.

### Compliance Proofs

- License compatibility report for all dependencies.
- PII/secrets scan report with zero findings.
- Audit trail entries for all promotion events.

## Requirements by Release Class

| Release Class    | Structural | Functional | Compliance |
|------------------|-----------|------------|------------|
| dev              | Required  | Optional   | Optional   |
| candidate        | Required  | Required   | Optional   |
| certified        | Required  | Required   | Required   |
| enterprise-ready | Required  | Required   | Required   |

## Proof Bundle Format

- Proof bundles are stored in the kit `artifacts/proofs/` directory.
- Each proof is a JSON file conforming to `kit_decision_report.v1.schema.json`.
- The proof bundle index is listed in the kit manifest under `proof_bundle`.
