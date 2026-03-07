---
doc_id: MNT-10
title: "Backward Compatibility Validation"
library: maintenance
version: "0.1.0"
status: active
---

# MNT-10: Backward Compatibility Validation

## Purpose

Defines the rules and procedures for validating backward compatibility of Axion artifacts across version transitions. This doctrine governs maintenance mode MM-10 (Backcompat Validation) and is enforced before any breaking upgrade (MM-08) or release packaging (MM-14).

## Compatibility Scope

| Asset Class | Backward Compatibility Requirement |
|-------------|-------------------------------------|
| JSON Schemas | New version must accept all documents valid under previous version |
| Registries | Existing entries must not be removed; fields may be added but not removed |
| Doctrine Docs | `doc_id` values are immutable once published |
| Templates | Output structure additions are allowed; removals require deprecation cycle |
| Gates | Gate IDs are immutable; gate logic may be tightened but not relaxed without versioning |

## Validation Procedure

1. **Snapshot Baseline**: Capture the current state of all artifacts under test using MM-16 (Snapshot / Archive).
2. **Apply Candidate Changes**: Stage proposed changes in a working copy.
3. **Schema Compatibility Check**: For each modified schema, validate that all existing valid instances remain valid under the new schema.
4. **Registry Entry Preservation**: Verify no existing registry entries have been removed or had required fields deleted.
5. **Cross-Reference Integrity**: Confirm all `doc_id` and `$ref` targets still resolve.
6. **Report Generation**: Produce a health report per MNT-8 and findings per MNT-9.

## Breaking Change Protocol

When backward compatibility cannot be maintained:

1. The change must use MM-08 (Breaking Upgrade) mode.
2. A migration plan must be documented in the proposal pack.
3. The blast radius must be declared per G-MUS-05 requirements.
4. A deprecation notice must be issued for removed artifacts per MM-07.

## Detector Pack

Backcompat validation uses detector pack `DP-REG-01` to identify registry integrity violations and schema incompatibilities.
