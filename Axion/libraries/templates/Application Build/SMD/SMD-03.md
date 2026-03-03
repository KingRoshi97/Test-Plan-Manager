# SMD-03 — Mutation Patterns

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-03                                           |
| Template Type     | Build / State Management                         |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring mutation patterns         |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Mutation Patterns                         |

## 2. Purpose

Define the canonical data ownership and flow map across service boundaries: which service owns which entities, how data flows between services (sync/async), read/write boundaries, and consistency model. This template ensures data sovereignty is clear and prevents shared-database anti-patterns.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SMD-01 Service Catalog: {{smd.service_catalog}}
- DM-01 Entity Catalog: {{dm.entity_catalog}} | OPTIONAL
- DM-02 Entity Specs: {{dm.entity_specs}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Ownership registry (entity → service mapping) | spec | No |
| Entity owner (service_id) | SMD-01 | No |
| Read access grants (service_ids) | spec | Yes |
| Write access grants (service_ids) | spec | Yes |
| Data flow definitions (flow_id list) | spec | No |
| Flow type (sync/async/event) | spec | No |
| Consistency model (strong/eventual/UNKNOWN) | spec | Yes |
| Shared-DB policy | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| CQRS patterns | spec | OPTIONAL |
| Event sourcing patterns | spec | OPTIONAL |
| Data replication policy | spec | OPTIONAL |
| PII flow annotations | spec | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Every entity MUST have exactly one owning service (or be UNKNOWN flagged).
- Shared-DB anti-pattern MUST be explicitly addressed (allowed/disallowed/UNKNOWN).
- Do not invent service_ids or entities not present in upstream inputs.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Cross-References

- **Upstream**: {{xref:SMD-01}}, {{xref:DM-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SMD-04}}, {{xref:SMD-05}}, {{xref:SMD-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-DATA-OWNERSHIP]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Required | Define ownership mapping; consistency model UNKNOWN ok. |
| intermediate | Required | Define data flows with types and consistency models. |
| advanced | Required | Add CQRS/event sourcing patterns, PII annotations, and migration plans. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, read/write_access, consistency_model, event_ref, latency_budget, pii_annotated, shared_db exceptions/migration_plan, cqrs, event_sourcing, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If ownership registry is UNKNOWN → block Completeness Gate.
- If flow_id list is UNKNOWN → block Completeness Gate.
- If shared_db.allowed is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SMD
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] every entity has exactly one owner
  - [ ] data_flows_defined == true
  - [ ] shared_db_policy_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

