# SEC-05 — Encryption & Key Management Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-05                                           |
| Template Type     | Security / Controls                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring encryption & key manageme |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Encryption & Key Management Spec          |

## 2. Purpose

Define the canonical incident response plan for security events: detection, triage, containment, eradication, recovery, and post-incident review. This template must coordinate with audit/forensics workflows and compliance notification requirements.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- Security overview: `{{xref:SEC-01}}` | OPTIONAL
- Security monitoring: `{{xref:SEC-06}}` | OPTIONAL
- Investigation workflow: `{{xref:AUDIT-06}}` | OPTIONAL
- Regulatory requirements: `{{xref:COMP-06}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Incident severity model (sev levels) | spec | No |
| Incident types list (account takeover, data leak, malware, etc.) | spec | No |
| Detection sources (alerts, reports) | spec | No |
| Triage process (who does what) | spec | No |
| Containment actions (block keys, disable endpoints, rotate secrets) | spec | No |
| Evidence preservation rules (logs, snapshots) | spec | Yes |
| Communication plan (internal/external) | spec | No |
| Regulatory notification trigger rules (if applicable) | spec | Yes |
| Recovery steps (restore, validate) | spec | No |
| Post-incident review requirements (RCA, action items) | spec | No |
| Runbook references (SEC-10, AUDIT-10) | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| On-call rotations / contacts | spec | OPTIONAL |
| Tabletop exercise cadence | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Containment actions must be permissioned and auditable.
- Evidence handling must preserve chain-of-custody where needed.
- Do not claim regulatory timelines unless provided; use UNKNOWN when unclear.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:SEC-01}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:SEC-10}}`, `{{xref:AUDIT-10}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define severity, detection sources, triage and containment steps. |
| intermediate | Required. Define evidence handling and comms and post-incident requirements. |
| advanced | Required. Add regulatory trigger rigor, tabletop cadence, and permissioning detail. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, definitions, intake rule, permission rule, evidence storage/chain, external/customer comms, regulatory timeline, rca refs/action tracking, on-call/tabletop cadence, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `sev.levels` is UNKNOWN → block Completeness Gate.
- If `types.list` is UNKNOWN → block Completeness Gate.
- If `triage.steps[0]` is UNKNOWN → block Completeness Gate.
- If `contain.actions` is UNKNOWN → block Completeness Gate.
- If `post.rca_required` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SEC
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] severity_and_types_defined == true
  - [ ] triage_and_containment_defined == true
  - [ ] evidence_and_comms_defined == true
  - [ ] post_incident_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

