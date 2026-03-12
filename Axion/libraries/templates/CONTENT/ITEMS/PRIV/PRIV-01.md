# PRIV-01 — Data Inventory (by data_class/entity)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-01                                             |
| Template Type     | Security / Privacy                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data inventory (by data_class/entity)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Inventory (by data_class/entity) Document                         |

## 2. Purpose

Create the canonical inventory of data the system collects/stores/processes, indexed by
data_class and entity, including where it lives, who uses it, and sensitivity notes. This inventory
anchors PII classification, minimization, and retention policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Canonical schemas: {{xref:DATA-06}} | OPTIONAL
- Event schemas: {{xref:EVT-02}} | OPTIONAL
- File metadata/indexing: {{xref:FMS-08}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Data class registry (data_class list)
Entity registry (entity_name list)
data_class (stable classification label)
entity_name (table/model)
Fields of interest (PII candidates)
Storage location (db/bucket/log/UNKNOWN)
Producers (who writes)
Consumers (who reads)
Primary purpose (why collected)
Retention reference (PRIV-05)
Sharing reference (PRIV-06)
Telemetry requirements (inventory coverage %)

Optional Fields
Notes on lawful basis | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Do not invent entities; use DATA-06 and event schemas as primary sources.
Every inventory entry must include purpose; if unknown, mark UNKNOWN and flag.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Data Classes
data_classes: {{classes.list}}
2. Entities
entities: {{entities.list}}
3. Inventory Entries (repeat)
Entry
data_class: {{items[0].data_class}}
entity_name: {{items[0].entity_name}}
fields_of_interest: {{items[0].fields_of_interest}}
storage_location: {{items[0].storage_location}}
producers: {{items[0].producers}}
consumers: {{items[0].consumers}}
purpose: {{items[0].purpose}}
retention_ref: {{items[0].retention_ref}} (expected: {{xref:PRIV-05}}) | OPTIONAL
sharing_ref: {{items[0].sharing_ref}} (expected: {{xref:PRIV-06}}) | OPTIONAL
notes: {{items[0].notes}} | OPTIONAL
(Repeat per entry.)
4. Telemetry
inventory_coverage_metric: {{telemetry.coverage_metric}}
5. References
PII classification: {{xref:PRIV-02}} | OPTIONAL
Minimization rules: {{xref:PRIV-03}} | OPTIONAL
Retention/deletion: {{xref:PRIV-05}} | OPTIONAL
Cross-References
Upstream: {{xref:DATA-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PRIV-02}}, {{xref:PRIV-03}}, {{xref:COMP-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. List classes/entities and purposes; use UNKNOWN when needed.

intermediate: Required. Add producers/consumers and storage locations.
advanced: Required. Add retention/sharing refs and coverage telemetry rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, retention/sharing refs, notes, lawful basis
notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If classes.list is UNKNOWN → block Completeness Gate.
If entities.list is UNKNOWN → block Completeness Gate.
If items[*].purpose is UNKNOWN → block Completeness Gate.
If telemetry.coverage_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PRIV
Pass conditions:
required_fields_present == true
data_classes_and_entities_defined == true
purposes_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PRIV-02

PRIV-02 — PII Classification Model (types, sensitivity)
Header Block

## 5. Optional Fields

Notes on lawful basis | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not invent entities; use DATA-06 and event schemas as primary sources.
- **Every inventory entry must include purpose; if unknown, mark UNKNOWN and flag.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Data Classes`
2. `## Entities`
3. `## Inventory Entries (repeat)`
4. `## Entry`
5. `## (Repeat per entry.)`
6. `## Telemetry`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:DATA-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PRIV-02}}, {{xref:PRIV-03}}, {{xref:COMP-05}} | OPTIONAL**
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
