# AUDIT-03 — Capture Rules (what must be logged, where)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-03                                             |
| Template Type     | Security / Audit                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring capture rules (what must be logged, where)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Capture Rules (what must be logged, where) Document                         |

## 2. Purpose

Define the canonical rules for capturing audit events: what must be logged, where capture
occurs (API middleware, job workers, admin UI), how events are enriched (correlation IDs), and
how failures are handled. This template must align with the audit catalog and auth enforcement
points.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Audit schema: {{xref:AUDIT-02}} | OPTIONAL
- AuthZ enforcement points: {{xref:IAM-04}} | OPTIONAL
- Privileged API surface: {{xref:ADMIN-05}} | OPTIONAL
- Jobs inventory: {{xref:JBS-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Capture points list (a... | spec         | Yes             |
| Event coverage rules (... | spec         | Yes             |
| Enrichment rules (requ... | spec         | Yes             |
| Write path (queue/sync... | spec         | Yes             |
| Failure behavior (fail... | spec         | Yes             |
| Deduping/idempotency r... | spec         | Yes             |
| Storage target (audit ... | spec         | Yes             |
| Access controls for au... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Sampling rules (for non-critical events) | OPTIONAL

Backfill/replay rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Privileged actions and security-relevant events must not be sampled away.**
- **Audit capture must not fail silently; failures must be monitored.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Capture Points`
2. `## Coverage Rules`
3. `## Enrichment`
4. `## Write Path`
5. `## Failure Behavior`
6. `## Storage`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:AUDIT-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-05}}, {{xref:AUDIT-09}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
