# SKM-03 — Rotation Policy (schedules, triggers, overlap windows)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-03                                             |
| Template Type     | Security / Secrets & Keys                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring rotation policy (schedules, triggers, overlap windows)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Rotation Policy (schedules, triggers, overlap windows) Document                         |

## 2. Purpose

Define the canonical rotation policy for secrets, keys, and certificates: rotation schedules by
type, trigger-based rotations (compromise), overlap windows, and how rotations are executed
and verified. This template must align with secrets inventory, storage policy, and
vulnerability/incident processes.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secrets inventory: {{xref:SKM-01}} | OPTIONAL
- Storage/access policy: {{xref:SKM-02}} | OPTIONAL
- Vulnerability management: {{xref:SEC-04}} | OPTIONAL
- Privileged audit: {{xref:AUDIT-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Overlap window rule (d... | spec         | Yes             |
| Rotation execution wor... | spec         | Yes             |
| Verification rule (pro... | spec         | Yes             |
| Rollback rule (if rota... | spec         | Yes             |
| Emergency rotation rul... | spec         | Yes             |
| Ownership rules (who r... | spec         | Yes             |
| Audit requirements (ro... | spec         | Yes             |

## 5. Optional Fields

Automated rotation support | OPTIONAL

Key ceremony notes (for signing keys) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Rotation must not require exposing secret material in plaintext to humans.**
- **Overlap windows must be bounded.**
- **Emergency rotation must be runnable under incident response constraints.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Schedules`
2. `## Triggers`
3. `## Overlap`
4. `## Workflow`
5. `## steps:`
6. `## Verification`
7. `## Rollback`
8. `## Emergency Rotation`
9. `## Ownership`
10. `## Audit`

## 8. Cross-References

- **Upstream: {{xref:SKM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SKM-08}}, {{xref:SKM-10}} | OPTIONAL**
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
