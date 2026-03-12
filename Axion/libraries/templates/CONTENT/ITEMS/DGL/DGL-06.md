# DGL-06 — Data Catalog / Dictionary

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DGL-06                                             |
| Template Type     | Data / Governance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data catalog / dictionary    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Catalog / Dictionary Document                         |

## 2. Purpose

Create a human- and machine-friendly dictionary of datasets/entities: what they mean, what
they contain, how sensitive they are, who owns them, and what their retention and access rules
are. This is the “catalog layer” for data governance.

## 3. Inputs Required

- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● DMG-01: {{xref:DMG-01}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● DGL-01: {{xref:DGL-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Catalog entries (minimum: all DATA-01 entities + key derived/read models + reporting
datasets)
● For each entry:
○ id (entity_id/dataset_id/read_model_id)
○ name
○ description (plain language)
○ owner (DGL-01 pointer)
○ sensitivity class (PII level)
○ key fields (top 10)
○ retention pointer (DLR-02)
○ access pointer (DGL-04)
○ lineage pointer (DGL-02) | OPTIONAL
○ typical use cases (API/search/reporting)
○ common pitfalls (gotchas)
● Verification checklist

## 5. Optional Fields

● Data quality score pointer (DQV) | OPTIONAL
● Notes | OPTIONAL

Rules
● Must align terms with DMG glossary.
● Sensitivity must be explicit and consistent with DGP classification.
● Catalog must include derived/read models and reporting datasets to prevent “shadow
data.”
● Catalog entries must remain stable and versioned.

Output Format
Data Catalog Entries (canonical)
id

nam
e

desc owne
ripti
r
on

sen
sitiv
ity

key_fi
elds

retent
ion_r
ef

acce
ss_r
ef

linea
ge_re
f

use_c
ases

pitfal
ls

note
s

{{ca
talo
g[0]
.id}}

{{cat
alog[
0].na
me}}

{{cat
alog[
0].de
sc}}

{{cata
log[0]
.own
er}}

{{cat
alog[
0].se
ns}}

{{catal
og[0].k
ey_fiel
ds}}

{{catal
og[0].r
etenti
on}}

{{cata
log[0]
.acce
ss}}

{{cata
log[0].
lineag
e}}

{{catal
og[0].u
se_ca
ses}}

{{cata
log[0]
.pitfall
s}}

{{cat
alog[
0].no
tes}}

{{ca
talo
g[1]
.id}}

{{cat
alog[
1].na
me}}

{{cat
alog[
1].de
sc}}

{{cata
log[1]
.own
er}}

{{cat
alog[
1].se
ns}}

{{catal
og[1].k
ey_fiel
ds}}

{{catal
og[1].r
etenti
on}}

{{cata
log[1]
.acce
ss}}

{{cata
log[1].
lineag
e}}

{{catal
og[1].u
se_ca
ses}}

{{cata
log[1]
.pitfall
s}}

{{cat
alog[
1].no
tes}}

Verification Checklist (required)
● {{verify[0]}}
● {{verify[1]}}
● {{verify[2]}} | OPTIONAL

Cross-References

● Upstream: {{xref:DMG-01}} | OPTIONAL, {{xref:DGL-01}} | OPTIONAL, {{xref:DGP-01}} |
OPTIONAL
● Downstream: {{xref:DQV-02}} | OPTIONAL, {{xref:RPT-01}} | OPTIONAL,
{{xref:SRCH-01}} | OPTIONAL
● Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Entries with name/description/sensitivity/owner.
● intermediate: Required. Add retention/access pointers and key fields.
● advanced: Required. Add lineage pointers and pitfalls/use-cases rigor.

Unknown Handling
● UNKNOWN_ALLOWED: dq_score_pointer, notes, lineage_ref (if no lineage
tracking yet)
● If any entity lacks sensitivity classification → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.DGL
● Pass conditions:
○ required_fields_present == true
○ catalog_complete_for_entities == true
○ sensitivity_present == true
○ retention_and_access_refs_present == true

○ placeholder_resolution == true
○ no_unapproved_unknowns == true

DGL-06

DGL-06 — Data Catalog / Dictionary
(datasets, meaning, sensitivity)
Header Block
● template_id: DGL-06
● title: Data Catalog / Dictionary (datasets, meaning, sensitivity)
● type: data_governance_lineage
● template_version: 1.0.0
● output_path: 10_app/data_governance/DGL-06_Data_Catalog_Dictionary.md
● compliance_gate_id: TMP-05.PRIMARY.DGL
● upstream_dependencies: ["DATA-01", "DMG-01", "DGP-01"]
● inputs_required: ["DATA-01", "DMG-01", "DGP-01", "DGL-01", "STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Create a human- and machine-friendly dictionary of datasets/entities: what they mean, what
they contain, how sensitive they are, who owns them, and what their retention and access rules
are. This is the “catalog layer” for data governance.

Inputs Required
● DATA-01: {{xref:DATA-01}} | OPTIONAL
● DMG-01: {{xref:DMG-01}} | OPTIONAL
● DGP-01: {{xref:DGP-01}} | OPTIONAL

● DGL-01: {{xref:DGL-01}} | OPTIONAL
● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

Required Fields
● Catalog entries (minimum: all DATA-01 entities + key derived/read models + reporting
datase

## 6. Rules

- Must align terms with DMG glossary.
- Sensitivity must be explicit and consistent with DGP classification.
- Catalog must include derived/read models and reporting datasets to prevent “shadow
- **data.”**
- Catalog entries must remain stable and versioned.

## 7. Output Format

### Required Headings (in order)

1. `## Data Catalog Entries (canonical)`
2. `## nam`
3. `## desc owne`
4. `## ripti`
5. `## sen`
6. `## sitiv`
7. `## ity`
8. `## key_fi`
9. `## elds`
10. `## retent`

## 8. Cross-References

- Upstream: {{xref:DMG-01}} | OPTIONAL, {{xref:DGL-01}} | OPTIONAL, {{xref:DGP-01}} |
- OPTIONAL
- Downstream: {{xref:DQV-02}} | OPTIONAL, {{xref:RPT-01}} | OPTIONAL,
- **{{xref:SRCH-01}} | OPTIONAL**
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
