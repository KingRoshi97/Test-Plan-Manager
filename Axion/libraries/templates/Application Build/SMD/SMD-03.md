# SMD-03 — Mutation Patterns (optimistic updates, rollback)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-03                                             |
| Template Type     | Build / State Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring mutation patterns (optimistic updates, rollback)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Mutation Patterns (optimistic updates, rollback) Document                         |

## 2. Purpose

Define the canonical client mutation patterns: how writes are performed, how optimistic updates
work, rollback rules, invalidation on success/failure, conflict handling, and how errors are
surfaced. This template must be consistent with cache strategy and API error policy and must
not invent mutation behaviors not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SMD-02 Query/Cache Strategy: {{smd.cache_strategy}}
- FE-04 Data Binding Rules: {{fe.data_binding}}
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- API-03 Error & Status Code Policy: {{api.error_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Mutation initiation ru... | spec         | Yes             |
| Optimistic update poli... | spec         | Yes             |
| Optimistic update mech... | spec         | Yes             |
| Rollback rules (on fai... | spec         | Yes             |
| Invalidation rules (wh... | spec         | Yes             |
| Conflict handling patt... | spec         | Yes             |
| Retry policy (when to ... | spec         | Yes             |
| Error surfacing (bind ... | spec         | Yes             |

## 5. Optional Fields

Batch mutations | OPTIONAL

Offline queued writes (bind to SMD-05) | OPTIONAL
Background refresh after mutation | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Optimistic updates MUST be rollback-safe and must not violate server invariants.**
- **Invalidation MUST conform to {{xref:SMD-02}}.**
- **Errors MUST map to {{xref:API-03}} and surface per {{xref:FE-07}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Mutation Initiation`
2. `## Request Pattern`
3. `## Optimistic Update Policy`
4. `## Optimistic Update Mechanics`
5. `## Rollback Rules`
6. `## Invalidation Rules`
7. `## Conflict Handling`
8. `## Retry Policy`
9. `## Error Surfacing`
10. `## Idempotency Guidance`

## 8. Cross-References

- **Upstream: {{xref:SMD-02}}, {{xref:FE-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SMD-05}} | OPTIONAL, {{xref:CER-02}} | OPTIONAL**
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
