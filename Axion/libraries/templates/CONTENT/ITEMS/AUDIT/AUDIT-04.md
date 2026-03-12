# AUDIT-04 — Tamper Evidence & Integrity (append-only, hashing)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-04                                             |
| Template Type     | Security / Audit                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring tamper evidence & integrity (append-only, hashing)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Tamper Evidence & Integrity (append-only, hashing) Document                         |

## 2. Purpose

Define the canonical integrity and tamper-evidence mechanisms for audit logs: append-only
storage properties, hashing/chaining, signing, verification checks, and access restrictions. This
template must align with key usage rules and compliance control expectations.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Capture rules: {{xref:AUDIT-03}} | OPTIONAL
- Key usage rules: {{xref:SKM-04}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- Compliance controls: {{xref:COMP-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Integrity model (appen... | spec         | Yes             |
| Hashing algorithm rule... | spec         | Yes             |
| Chaining rule (prev_hash) | spec         | Yes             |
| Signing rule (if any)     | spec         | Yes             |
| Key management referen... | spec         | Yes             |
| Verification process (... | spec         | Yes             |
| Access control rule (w... | spec         | Yes             |
| Retention interaction ... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

External WORM storage notes | OPTIONAL
Legal evidentiary notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Audit logs must be tamper-evident; edits must be impossible or detectable.
Keys used for signing must be protected and rotated per SKM.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Model
integrity_model: {{model.name}}
append_only_rule: {{model.append_only_rule}}
2. Hashing / Chaining
hash_algo: {{hash.algo}}
chain_rule: {{hash.chain_rule}}
3. Signing
signing_supported: {{sign.supported}}
signing_rule: {{sign.rule}} | OPTIONAL
key_ref: {{sign.key_ref}} (expected: {{xref:SKM-04}}) | OPTIONAL
4. Verification
verification_cadence: {{verify.cadence}}
verification_steps: {{verify.steps}}
evidence_artifact_rule: {{verify.evidence_artifact_rule}} | OPTIONAL
5. Access Controls
write_access_rule: {{access.write_rule}}
read_access_rule: {{access.read_rule}}
6. Retention Interaction
no_edit_no_delete_rule: {{retain.no_edit_no_delete_rule}}
7. Telemetry
integrity_failure_metric: {{telemetry.integrity_failure_metric}}
8. References
Audit capture: {{xref:AUDIT-03}} | OPTIONAL
Key mgmt: {{xref:SKM-02}} | OPTIONAL
Rotation: {{xref:SKM-03}} | OPTIONAL
Cross-References
Upstream: {{xref:AUDIT-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:AUDIT-06}}, {{xref:COMP-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define model, hashing/chaining, and verification cadence.
intermediate: Required. Define access rules and signing support and key refs.
advanced: Required. Add WORM/legal notes and stricter evidence artifacts and verification
automation.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, signing rules/refs, evidence artifact,
worm/legal notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If model.append_only_rule is UNKNOWN → block Completeness Gate.
If hash.chain_rule is UNKNOWN → block Completeness Gate.
If verify.cadence is UNKNOWN → block Completeness Gate.
If retain.no_edit_no_delete_rule is UNKNOWN → block Completeness Gate.
If telemetry.integrity_failure_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.AUDIT
Pass conditions:
required_fields_present == true
integrity_model_defined == true
verification_defined == true
access_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

AUDIT-05

AUDIT-05 — Retention & Access Controls (who can view, how long)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Audit logs must be tamper-evident; edits must be impossible or detectable.**
- **Keys used for signing must be protected and rotated per SKM.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Model`
2. `## Hashing / Chaining`
3. `## Signing`
4. `## Verification`
5. `## Access Controls`
6. `## Retention Interaction`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:AUDIT-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-06}}, {{xref:COMP-09}} | OPTIONAL**
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
