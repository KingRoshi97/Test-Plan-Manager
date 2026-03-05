---
library: gates
id: GATE-6
section: minimum_viable_set
schema_version: 1.0.0
status: draft
---

# GATE-6 — Minimum Viable Gate Set

## Overview
The minimum viable gate set defines which gates must be present and passing for an Axion
pipeline run to be considered valid. A run that skips or lacks any of these gates is
not a valid Axion run.

## Required Gates

| Gate ID | Title | Stage | Severity | Purpose |
|---|---|---|---|---|
| `G1_INTAKE_VALIDITY` | Intake Validity | intake | blocker | Validates intake record completeness and schema conformance |
| `G2_CANONICAL_INTEGRITY` | Canonical Integrity | canonical | blocker | Validates canonical spec structure and required fields |
| `G3_STANDARDS_RESOLVED` | Standards Resolved | standards | blocker | Validates that all applicable standards are resolved |
| `G4_TEMPLATE_SELECTION` | Template Selection | templates | blocker | Validates template selection and compatibility |
| `G5_TEMPLATE_COMPLETENESS` | Template Completeness | generation | blocker | Validates all template slots are filled |
| `G6_PLAN_COVERAGE` | Plan Coverage | planning | blocker | Validates planning artifacts cover all requirements |
| `G7_VERIFICATION` | Verification | verification | blocker | Validates proof ledger completeness |
| `G8_PACKAGE_INTEGRITY` | Package Integrity | packaging | blocker | Validates kit package hash integrity |

## Rules
1. All 8 gates must be present in the gate registry.
2. All 8 gates must be evaluated during a full pipeline run.
3. All 8 gates must pass (or be explicitly overridden) for the run to complete.
4. Partial runs may skip later gates but must evaluate all gates up to and including
   the current stage's gate.

## Gate Ordering
Gates are evaluated in numeric order (G1 → G2 → ... → G8). A gate is only evaluated
after all previous gates have passed (or been overridden). This ensures that each gate
can rely on the invariants established by previous gates.

## Adding New Gates
New gates may be added to the minimum viable set by:
1. Adding the gate definition to the gate registry.
2. Assigning a numeric prefix that places it in the correct pipeline position.
3. Updating this document.
4. Incrementing the gate registry version.
