# OFS-02 — Sync Model (queues, conflict resolution)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OFS-02                                             |
| Template Type     | Build / Offline Support                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring sync model (queues, conflict resolution)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Sync Model (queues, conflict resolution) Document                         |

## 2. Purpose

Define the canonical offline sync model: how queued ops are stored and drained, ordering
guarantees, conflict detection/resolution, and reconciliation between local state and server truth.
This template must be consistent with offline queue and mutation patterns and must not invent
sync semantics not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- OFS-01 Offline Scope: {{ofs.scope}}
- SMD-05 Offline State Handling: {{smd.offline_handling}}
- SMD-03 Mutation Patterns: {{smd.mutation_patterns}} | OPTIONAL
- EVT-04 Delivery Semantics: {{evt.delivery_semantics}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Queue drain strategy (... | spec         | Yes             |
| Ordering guarantees (F... | spec         | Yes             |
| Batching policy (if any)  | spec         | Yes             |
| Conflict detection rul... | spec         | Yes             |
| Conflict resolution po... | spec         | Yes             |
| Retry/backoff policy f... | spec         | Yes             |
| Partial failure handli... | spec         | Yes             |
| Reconciliation strateg... | spec         | Yes             |

## 5. Optional Fields

Priority lanes (high/low) | OPTIONAL

Background sync constraints | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Sync must preserve user intent and not silently drop ops.**
- **Conflict policy MUST be explicit and deterministic.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Queue Drain`
2. `## Ordering Guarantees`
3. `## Conflict Detection`
4. `## Conflict Resolution`
5. `## Retry / Backoff`
6. `## Partial Failure Handling`
7. `## Reconciliation After Drain`
8. `## Telemetry`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:OFS-01}}, {{xref:SMD-05}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OFS-03}}, {{xref:OFS-04}}, {{xref:OFS-05}} | OPTIONAL**
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
