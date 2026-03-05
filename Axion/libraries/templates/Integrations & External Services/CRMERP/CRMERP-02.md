# CRMERP-02 — Object/Entity Mapping Catalog (objects ↔ entities, keys)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-02                                             |
| Template Type     | Integration / CRM & ERP                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring object/entity mapping catalog (objects ↔ entities, keys)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Object/Entity Mapping Catalog (objects ↔ entities, keys) Document                         |

## 2. Purpose

Define the canonical catalog mapping CRM/ERP objects to internal entities/schemas, including
key mappings, field-level mapping references, and normalization/validation bindings. This
template must be consistent with canonical schemas and integration mapping rules and must
not invent object names or schema paths beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- IXS-05 Data Mapping & Transformation Rules: {{ixs.data_mapping}} | OPTIONAL
- DATA-06 Canonical Data Schemas: {{data.schemas}} | OPTIONAL
- DQV-03 Data Validation Rules: {{data.validation_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

system_id binding
Mapping registry (mapping_id list)
external_object name
internal entity/schema ref (entity_id/schema_ref)
primary key mapping (external_id → internal_id)
foreign key/reference mapping (relationships)
field mapping reference (link to IXS-05 map_id or inline summary)
sync direction per object (push/pull/bidirectional)
create/update semantics (upsert keys)
delete semantics (soft delete, archive)
validation binding (DQV-03)
PII/data class notes

Optional Fields
Lookup resolution rules | OPTIONAL
Object-specific constraints | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not invent schema refs; only use valid refs from {{xref:DATA-06}}.
Each external object MUST map to exactly one primary internal entity/schema (or explicitly
document composite mapping).
Key mapping MUST be explicit; no “match by name” without deterministic rules.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Mapping Summary
system_id: {{meta.system_id}}
total_objects_mapped: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Object ↔ Entity Entries
Entry
mapping_id: {{maps[0].mapping_id}}
external_object: {{maps[0].external_object}}
internal_ref: {{maps[0].internal_ref}}
sync_direction: {{maps[0].sync_direction}}
primary_key_map: {{maps[0].primary_key_map}}
foreign_keys: {{maps[0].foreign_keys}} | OPTIONAL
upsert_rule: {{maps[0].upsert_rule}}
delete_rule: {{maps[0].delete_rule}}
field_map_ref: {{maps[0].field_map_ref}} (expected: {{xref:IXS-05}}) | OPTIONAL
validation_ref: {{maps[0].validation_ref}} (expected: {{xref:DQV-03}}) | OPTIONAL
pii_notes: {{maps[0].pii_notes}} | OPTIONAL
constraints: {{maps[0].constraints}} | OPTIONAL
open_questions:
{{maps[0].open_questions[0]}} | OPTIONAL
(Repeat per mapping_id.)
3. Lookup Resolution Rules (Optional)
lookup_strategy: {{lookup.strategy}} | OPTIONAL
missing_reference_behavior: {{lookup.missing_reference_behavior}} | OPTIONAL
4. References
System inventory: {{xref:CRMERP-01}}
Integration mapping rules: {{xref:IXS-05}} | OPTIONAL

Canonical schemas: {{xref:DATA-06}} | OPTIONAL
Validation rules: {{xref:DQV-03}} | OPTIONAL
Conflict resolution: {{xref:CRMERP-05}} | OPTIONAL
Cross-References
Upstream: {{xref:CRMERP-01}}, {{xref:DATA-06}} | OPTIONAL, {{xref:SPEC_INDEX}} |
OPTIONAL
Downstream: {{xref:CRMERP-03}}, {{xref:CRMERP-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define object/entity mappings and primary keys; use UNKNOWN for
optional foreign keys.
intermediate: Required. Define upsert/delete semantics and validation refs.
advanced: Required. Add lookup resolution rules, constraints, and strict mapping traceability to
IXS-05.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, foreign keys, field
map/validation refs, pii notes, constraints, lookup section, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If meta.system_id is UNKNOWN → block Completeness Gate.
If maps[].internal_ref is UNKNOWN → block Completeness Gate.
If maps[].primary_key_map is UNKNOWN → block Completeness Gate.
If maps[*].upsert_rule is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.CRMERP
Pass conditions:
required_fields_present == true
system_id_exists_in_CRMERP_01 == true
mapping_ids_unique == true
all internal_ref values valid (DATA-06)
primary_keys_and_upsert_rules_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

CRMERP-03

CRMERP-03 — Sync Direction Rules (push/pull/bidirectional)
Header Block

## 5. Optional Fields

Lookup resolution rules | OPTIONAL
Object-specific constraints | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent schema refs; only use valid refs from {{xref:DATA-06}}.
- Each external object MUST map to exactly one primary internal entity/schema (or explicitly
- **document composite mapping).**
- **Key mapping MUST be explicit; no “match by name” without deterministic rules.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Mapping Summary`
2. `## Object ↔ Entity Entries`
3. `## Entry`
4. `## open_questions:`
5. `## (Repeat per mapping_id.)`
6. `## Lookup Resolution Rules (Optional)`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:CRMERP-01}}, {{xref:DATA-06}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:CRMERP-03}}, {{xref:CRMERP-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

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
