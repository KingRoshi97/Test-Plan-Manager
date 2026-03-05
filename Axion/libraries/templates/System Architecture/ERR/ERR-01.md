# ERR-01 — Error Taxonomy (classes,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ERR-01                                             |
| Template Type     | Architecture / Error Model                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring error taxonomy (classes,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Error Taxonomy (classes, Document                         |

## 2. Purpose

Define the canonical error taxonomy used across the system: classes, categories, severities,
and the baseline handling expectations. This is the shared language for errors so APIs, jobs,
realtime, and UX map failures consistently.

## 3. Inputs Required

- ● ARC-06: {{xref:ARC-06}} | OPTIONAL
- ● BRP-01: {{xref:BRP-01}} | OPTIONAL
- ● DES-07: {{xref:DES-07}} | OPTIONAL
- ● CDX-04: {{xref:CDX-04}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Error classes (minimum):  | spec         | Yes             |
| ○ validation              | spec         | Yes             |
| ○ domain_rule             | spec         | Yes             |
| ○ authn/authz             | spec         | Yes             |
| ○ dependency              | spec         | Yes             |
| ○ conflict/concurrency    | spec         | Yes             |
| ○ system_unknown          | spec         | Yes             |
| Severity model (P0/P1/... | spec         | Yes             |
| Default handling expec... | spec         | Yes             |
| ○ typical UX surface (... | spec         | Yes             |
| ○ retryability default... | spec         | Yes             |
| ○ logging level (info/... | spec         | Yes             |

## 5. Optional Fields

● Domain-specific category extensions | OPTIONAL
● Notes | OPTIONAL

Rules
● Taxonomy must align with ARC-06; if conflict, ARC-06 is architecture-authoritative.
● Every emitted error must map to exactly one class (primary) and may have
categories/tags.
● Severity is about impact, not “how scary the message looks.”
● Default retryability must align to idempotency rules (ERR-05).

Output Format
1) Classes (required)
error_c
lass

description

common_sour
ces

default_surfac
e

default_retry
ability

log_level

validatio {{classes.valid
n
ation.desc}}

{{classes.valida
tion.sources}}

{{classes.valida
tion.surface}}

{{classes.valid
ation.retry}}

{{classes.vali
dation.log}}

domain
_rule

{{classes.dom
ain.desc}}

{{classes.domai
n.sources}}

{{classes.domai {{classes.dom
n.surface}}
ain.retry}}

{{classes.do
main.log}}

authz

{{classes.auth
z.desc}}

{{classes.authz.
sources}}

{{classes.authz. {{classes.auth
surface}}
z.retry}}

{{classes.aut
hz.log}}

depend
ency

{{classes.dep
endency.desc
}}

{{classes.depen {{classes.depe
dency.sources}} ndency.surface
}}

conflict

{{classes.confl {{classes.confli
ict.desc}}
ct.sources}}

system
_unkno
wn

{{classes.syst
em.desc}}

{{classes.syste
m.sources}}

{{classes.dep
endency.retry}
}

{{classes.dep
endency.log}}

{{classes.confli
ct.surface}}

{{classes.confl
ict.retry}}

{{classes.con
flict.log}}

{{classes.syste
m.surface}}

{{classes.syst
em.retry}}

{{classes.syst
em.log}}

2) Categories/Tags (required)
category_id

meaning

applies_to_classes

examples

cat_input_mis
sing

{{cats.input_missing.me
aning}}

{{cats.input_missing.cl
asses}}

{{cats.input_missing.exa
mples}}

cat_quota_exc
eeded

{{cats.quota.meaning}}

{{cats.quota.classes}}

{{cats.quota.examples}}

3) Severity Model (required)
severit
y

definition

example_impacts

owner_response

P0

{{sev.p0.def}}

{{sev.p0.impacts}}

{{sev.p0.response}}

P1

{{sev.p1.def}}

{{sev.p1.impacts}}

{{sev.p1.response}}

P2

{{sev.p2.def}}

{{sev.p2.impacts}}

{{sev.p2.response}}

4) Consistency Rules (required)
● Single primary class rule: {{rules.single_primary_class}}
● Tagging rule: {{rules.tagging}}
● Handling consistency rule: {{rules.handling_consistency}}

Cross-References
● Upstream: {{xref:ARC-06}} | OPTIONAL, {{xref:DES-07}} | OPTIONAL, {{xref:CDX-04}} |
OPTIONAL
● Downstream: {{xref:ERR-02}}, {{xref:ERR-03}}, {{xref:ERR-04}}, {{xref:ERR-05}},
{{xref:ERR-06}} | OPTIONAL
● Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Define classes and severity model.
● intermediate: Required. Add categories and default handling expectations.
● advanced: Required. Add explicit consistency rules and extensions policy.

Unknown Handling
● UNKNOWN_ALLOWED: domain_extensions, notes, examples
● If any class lacks default surface or retryability → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.ERRORS
● Pass conditions:
○ required_fields_present == true
○ classes_present == true
○ severity_model_present == true
○ default_handling_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

ERR-02

ERR-02 — Reason Codes Registry (rc_*
catalog + meanings)
Header Block
● template_id: ERR-02
● title: Reason Codes Registry (rc_* catalog + meanings)
● type: error_model_reason_codes
● template_version: 1.0.0
● output_path: 10_app/errors/ERR-02_Reason_Codes_Registry.md
● compliance_gate_id: TMP-05

## 6. Rules

- Taxonomy must align with ARC-06; if conflict, ARC-06 is architecture-authoritative.
- Every emitted error must map to exactly one class (primary) and may have
- **categories/tags.**
- Severity is about impact, not “how scary the message looks.”
- Default retryability must align to idempotency rules (ERR-05).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Classes (required)`
2. `## error_c`
3. `## lass`
4. `## description`
5. `## common_sour`
6. `## ces`
7. `## default_surfac`
8. `## default_retry`
9. `## ability`
10. `## log_level`

## 8. Cross-References

- Upstream: {{xref:ARC-06}} | OPTIONAL, {{xref:DES-07}} | OPTIONAL, {{xref:CDX-04}} |
- OPTIONAL
- Downstream: {{xref:ERR-02}}, {{xref:ERR-03}}, {{xref:ERR-04}}, {{xref:ERR-05}},
- **{{xref:ERR-06}} | OPTIONAL**
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
