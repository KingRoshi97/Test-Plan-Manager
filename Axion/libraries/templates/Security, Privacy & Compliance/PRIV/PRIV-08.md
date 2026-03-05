# PRIV-08 — Anonymization/Pseudonymization Rules (hashing, tokenization)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-08                                             |
| Template Type     | Security / Privacy                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring anonymization/pseudonymization rules (hashing, tokenization)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Anonymization/Pseudonymization Rules (hashing, tokenization) Document                         |

## 2. Purpose

Define the canonical rules for anonymization and pseudonymization: what identifiers are
hashed/tokenized, how salts/keys are managed, what counts as reversible vs irreversible
transformation, and where these methods are used (logs, analytics, exports). This template
must align with key usage rules and canonical data schemas.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Key types/usage: {{xref:SKM-04}} | OPTIONAL
- Canonical schemas: {{xref:DATA-06}} | OPTIONAL
- Logging/redaction: {{xref:CER-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Transformation registry (transform_id list)
transform_id (stable identifier)
Target fields (what is transformed)
Method (hash/tokenize/encrypt/UNKNOWN)
Reversibility flag (reversible/irreversible/UNKNOWN)
Key/salt management rule (SKM refs)
Where applied (logs/analytics/db exports)
Collision/uniqueness expectations (for hashes)
Access control for reversible mappings
Telemetry requirements (transform errors, coverage)

Optional Fields
Rotation impact notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Do not claim “anonymous” if reversible or if linkage remains feasible; call it pseudonymized.
Salts/keys must be managed securely and rotated per SKM policies.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_transforms: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Transforms (repeat)
Transform
transform_id: {{items[0].transform_id}}
fields: {{items[0].fields}}
method: {{items[0].method}}
reversibility: {{items[0].reversibility}}
key_salt_rule: {{items[0].key_salt_rule}}
applied_in: {{items[0].applied_in}}
collision_rule: {{items[0].collision_rule}} | OPTIONAL
access_rule: {{items[0].access_rule}} | OPTIONAL
telemetry_metric: {{items[0].telemetry_metric}}
rotation_impact: {{items[0].rotation_impact}} | OPTIONAL
open_questions:
{{items[0].open_questions[0]}} | OPTIONAL
(Repeat per transform.)
3. Telemetry
transform_error_metric: {{telemetry.error_metric}} | OPTIONAL
4. References
PII classification: {{xref:PRIV-02}} | OPTIONAL
Key usage rules: {{xref:SKM-04}} | OPTIONAL
Logging redaction: {{xref:SKM-09}} | OPTIONAL
Cross-References
Upstream: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PRIV-10}}, {{xref:COMP-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define transforms, method, reversibility, and where applied.
intermediate: Required. Define key/salt rule and access rules and telemetry.
advanced: Required. Add rotation impact notes and collision/uniqueness rigor and coverage
targets.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, collision/access rules, rotation impact,
optional telemetry, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If items[].transform_id is UNKNOWN → block Completeness Gate.
If items[].fields is UNKNOWN → block Completeness Gate.
If items[].method is UNKNOWN → block Completeness Gate.
If items[].reversibility is UNKNOWN → block Completeness Gate.
If items[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PRIV
Pass conditions:
required_fields_present == true
transform_registry_defined == true
methods_and_reversibility_defined == true
key_management_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PRIV-09

PRIV-09 — Privacy Incident Handling (breach response, notifications)
Header Block

## 5. Optional Fields

Rotation impact notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not claim “anonymous” if reversible or if linkage remains feasible; call it pseudonymized.
- **Salts/keys must be managed securely and rotated per SKM policies.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Transforms (repeat)`
3. `## Transform`
4. `## open_questions:`
5. `## (Repeat per transform.)`
6. `## Telemetry`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PRIV-10}}, {{xref:COMP-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define transforms, method, reversibility, and where applied.**
- **intermediate: Required. Define key/salt rule and access rules and telemetry.**
- **advanced: Required. Add rotation impact notes and collision/uniqueness rigor and coverage**
- targets.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, collision/access rules, rotation impact,**
- optional telemetry, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If items[].transform_id is UNKNOWN → block

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
