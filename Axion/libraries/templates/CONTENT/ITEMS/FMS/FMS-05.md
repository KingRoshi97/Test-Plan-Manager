# FMS-05 — Retention & Lifecycle Rules (TTL, archival, deletion)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-05                                             |
| Template Type     | Integration / File & Media Storage                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring retention & lifecycle rules (ttl, archival, deletion)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Retention & Lifecycle Rules (TTL, archival, deletion) Document                         |

## 2. Purpose

Define the canonical retention, lifecycle, and deletion rules for stored files/media: TTLs by class,
archival policies, deletion propagation, and legal/PII constraints. This template must be
consistent with file security/compliance rules and must not invent retention obligations without
upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Provider Inventory: {{fms.storage_inventory}}
- FMS-02 Upload/Download Spec: {{fms.upload_download}} | OPTIONAL
- FMS-06 Security/Compliance for Files: {{fms.security}} | OPTIONAL
- FPMP-06 Security & Compliance for Files: {{fpmp.file_security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| File classification mo... | spec         | Yes             |
| Retention policy per c... | spec         | Yes             |
| Archival policy (when/... | spec         | Yes             |
| Deletion policy (who c... | spec         | Yes             |
| Deletion propagation r... | spec         | Yes             |
| Legal hold rule (if ap... | spec         | Yes             |
| Secure delete expectat... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Audit requirements (de... | spec         | Yes             |

## 5. Optional Fields

Per-bucket overrides | OPTIONAL

User export/download policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Retention must be explicit; avoid “forever” unless justified.**
- **Deletion must propagate to derived variants and caches per rule.**
- **Legal holds must override deletion/TTL when enabled.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Classification Model`
2. `## Retention by Class`
3. `## Policy`
4. `## (Repeat per class.)`
5. `## Deletion Policy`
6. `## Legal Hold`
7. `## Secure Delete`
8. `## Telemetry`
9. `## Audit`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FMS-10}} | OPTIONAL**
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
