---
library: knowledge
id: KNO-5
section: dependency_mapping
schema_version: 1.0.0
status: draft
---

# KNO-5 — Dependency Mapping

## Overview
Knowledge items do not exist in isolation. KIDs reference and are referenced by artifacts in other Axion libraries — standards, templates, proofs, gates, and other KIDs. This document defines the dependency edge types, how cross-library linkage is declared, and the rules for maintaining referential integrity across the dependency graph.

## Dependency Edge Types

### KID → Standard
- **Edge type**: `supports_standard`
- **Meaning**: The KID provides knowledge that supports or explains a specific standard.
- **Example**: A KID about OWASP Top 10 supports the `SEC-AUTH-001` standard.
- **Integrity rule**: The referenced standard must exist in the standards registry.

### KID → Template
- **Edge type**: `informs_template`
- **Meaning**: The KID provides knowledge that is consumed during template rendering.
- **Example**: A KID about healthcare data models informs the `HIPAA-data-flow` template.
- **Integrity rule**: The referenced template must exist in the template registry.

### KID → Proof
- **Edge type**: `requires_proof`
- **Meaning**: The KID's claims require a specific type of verification proof.
- **Example**: A KID claiming PCI-DSS compliance requirements requires a compliance-checklist proof.
- **Integrity rule**: The proof type must be defined in the verification library.

### KID → Gate
- **Edge type**: `evaluated_by_gate`
- **Meaning**: A gate checks whether the KID was properly consulted or its rules were followed.
- **Example**: The `knowledge-citation-gate` evaluates whether required KIDs were cited.
- **Integrity rule**: The referenced gate must exist in the gate registry.

### KID → KID
- **Edge type**: `depends_on` | `supersedes` | `contradicts` | `extends`
- **Meaning**:
  - `depends_on`: This KID builds on concepts from another KID.
  - `supersedes`: This KID replaces another KID (see KNO-3).
  - `contradicts`: This KID's guidance conflicts with another KID (requires resolution).
  - `extends`: This KID adds to another KID without replacing it.
- **Integrity rule**: The referenced KID must exist in the knowledge registry.

## Dependency Declaration Format
Dependencies are declared in the KID's frontmatter or governed unit record:

```yaml
dependencies:
  - target_id: "STD-SEC-AUTH-001"
    target_library: "standards"
    edge_type: "supports_standard"
    strength: "required"
  - target_id: "KID-IT-FOUND-SEC-0001"
    target_library: "knowledge"
    edge_type: "depends_on"
    strength: "optional"
```

## Dependency Strength

| Strength | Description |
|----------|-------------|
| **required** | The dependency is mandatory. If the target is missing or deprecated, this KID's validity is compromised. |
| **recommended** | The dependency is recommended. The KID is usable without it but is more valuable with it. |
| **optional** | The dependency is informational. The KID does not lose validity if the target is absent. |

## Referential Integrity Rules
1. All `required` dependencies must resolve to existing, non-deprecated artifacts.
2. Broken `required` dependencies trigger a warning in the knowledge health report.
3. Broken `recommended` dependencies are logged but do not affect KID validity.
4. Circular dependencies (A depends_on B, B depends_on A) are allowed for `depends_on` edges but not for `supersedes` edges.
5. `contradicts` edges must be resolved by an operator — both KIDs receive a flag until resolution.
6. Dependency declarations are validated during registry updates.

## Cross-Library Impact
- When a standard is deprecated, all KIDs with `supports_standard` edges to it receive a staleness notification.
- When a template is updated, all KIDs with `informs_template` edges to it are flagged for review.
- When a KID is demoted (KNO-2), all KIDs with `depends_on` edges to it receive a freshness review trigger.

## Determinism Rules
- Dependency resolution is deterministic: given the same registry state, the dependency graph is always the same.
- Referential integrity checks are deterministic: the same registry state produces the same set of broken/valid edges.
- Cross-library impact propagation follows the defined rules without ambiguity.

## Validation Checklist
- [ ] All dependencies declare a valid `edge_type` from the defined set
- [ ] All dependencies declare a valid `strength` from: required, recommended, optional
- [ ] All `required` dependencies resolve to existing artifacts
- [ ] `supersedes` edges form acyclic chains
- [ ] `contradicts` edges are flagged for resolution
- [ ] Cross-library references use correct target_library and target_id formats
