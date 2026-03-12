# PMAD-02 — AuthZ Policy Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PMAD-02                                             |
| Template Type     | Architecture / Authorization                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring authz policy rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled AuthZ Policy Rules Document                         |

## 2. Purpose

Define the actual authorization policy rules: what roles can perform which actions on which
resources, what ABAC conditions apply, how inheritance works, and how exceptions are
handled. This is the enforceable ruleset used by all authz enforcement points.

## 3. Inputs Required

- ● PMAD-01: {{xref:PMAD-01}}
- ● BRP-02: {{xref:BRP-02}} | OPTIONAL
- ● BRP-04: {{xref:BRP-04}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Policy rules list (min... | spec         | Yes             |
| For each rule:            | spec         | Yes             |
| ○ policy_id               | spec         | Yes             |
| ○ role_id(s)              | spec         | Yes             |
| ○ resource_id             | spec         | Yes             |
| ○ action_id(s)            | spec         | Yes             |
| ○ conditions (ABAC pre... | spec         | Yes             |
| ○ allow/deny outcome      | spec         | Yes             |
| ○ priority/order (if m... | spec         | Yes             |
| ○ exception hooks (bre... | spec         | Yes             |
| ○ reason_code on deny ... | spec         | Yes             |
| ○ audit requirement (y... | spec         | Yes             |

## 5. Optional Fields

● Policy grouping by domain/boundary | OPTIONAL
● Notes | OPTIONAL

Rules
● Denies must be explicit when needed; define precedence rules.
● Every deny must map to a reason_code or policy fallback reason.
● Exception hooks must be auditable and time-bound if possible.
● Conditions vocabulary must match PMAD-01; no ad-hoc predicates.

Output Format
1) Policy Rules (canonical)
p
ol
ic
y
_i
d

roles

resour
ce

action
s

conditi
ons

outco
me

priorit
y

excepti
on_ho
ok

deny_
reaso
n_cod
e

audit
_requ
ired

notes

p
ol
_
0
0
1

{{polic
ies[0].
roles}
}

{{polici
es[0].r
esourc
e}}

{{polici
es[0].a
ctions}
}

{{policie
s[0].con
ditions}
}

{{polici
es[0].o
utcom
e}}

{{polici {{polici
es[0].p es[0].e
riority}} xceptio
n}}

{{polici
es[0].d
eny_rc
}}

{{polic
ies[0].
audit}
}

{{polic
ies[0].
notes}
}

p
ol
_
0
0
2

{{polic
ies[1].
roles}
}

{{polici
es[1].r
esourc
e}}

{{polici
es[1].a
ctions}
}

{{policie
s[1].con
ditions}
}

{{polici
es[1].o
utcom
e}}

{{polici {{polici
es[1].p es[1].e
riority}} xceptio
n}}

{{polici
es[1].d
eny_rc
}}

{{polic
ies[1].
audit}
}

{{polic
ies[1].
notes}
}

2) Inheritance Rules (required if hierarchy exists)
● Role inheritance model: {{inheritance.model}} | OPTIONAL
● Inherited permissions behavior: {{inheritance.behavior}} | OPTIONAL

● Override rules: {{inheritance.override}} | OPTIONAL

3) Conflict Resolution (required)
● Deny vs allow precedence: {{conflict.precedence}}
● Priority ordering rule: {{conflict.priority_rule}}
● Fallback deny reason: {{conflict.fallback_reason_code}} | OPTIONAL

4) Exception Hooks (required if any)
hook
_id

who_can_u
se

scope

time_bound

audit_event

notes

exho
ok_0
1

{{exceptions[
0].who}}

{{exceptions[
0].scope}}

{{exceptions[0].ti
me_bound}}

{{exceptions[0].a
udit_event}}

{{exceptions[
0].notes}}

Cross-References
● Upstream: {{xref:PMAD-01}} | OPTIONAL, {{xref:BRP-02}} | OPTIONAL
● Downstream: {{xref:PMAD-03}}, {{xref:PMAD-04}} | OPTIONAL, {{xref:ERR-02}} |
OPTIONAL, {{xref:AUDIT-*}} | OPTIONAL
● Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Policy table with roles/resources/actions and outcomes.
● intermediate: Required. Add conditions, deny reason codes, and audit flags.
● advanced: Required. Add conflict resolution, inheritance, and exception hook details.

Unknown Handling

● UNKNOWN_ALLOWED: policy_grouping, inheritance_rules (if none),
exception_hooks (if none), notes
● If any deny outcome lacks deny_reason_code → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.AUTHZ
● Pass conditions:
○ required_fields_present == true
○ policies_count >= 25
○ deny_reason_codes_present == true
○ conflict_resolution_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

PMAD-03

PMAD-03 — Enforcement Points Map
(UI/API/service/DB)
Header Block
● template_id: PMAD-03
● title: Enforcement Points Map (UI/API/service/DB)
● type: permission_model_authorization_design
● template_version: 1.0.0
● output_path: 10_app/authz/PMAD-03_Enforcement_Points_Map.md
● compliance_gate_id: TMP-05.PRIMARY.AUTHZ
● upstream_dependencies: ["PMAD-02", "ARC-01", "API-01", "DATA-01"]
● inputs_required: ["PMAD-02", "ARC-01", "API-01", "DATA-01", "IAN-05",
"STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced":

## 6. Rules

- **(RBAC/ABAC, inheritance, exceptions)**
- **Header Block**
- template_id: PMAD-02
- title: AuthZ Policy Rules (RBAC/ABAC, inheritance, exceptions)
- type: permission_model_authorization_design
- template_version: 1.0.0
- output_path: 10_app/authz/PMAD-02_AuthZ_Policy_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.AUTHZ
- upstream_dependencies: ["PMAD-01", "BRP-02", "BRP-04"]
- inputs_required: ["PMAD-01", "BRP-02", "BRP-04", "ERR-02", "STANDARDS_INDEX"]
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define the actual authorization policy rules: what roles can perform which actions on which**
- **resources, what ABAC conditions apply, how inheritance works, and how exceptions are**
- **handled. This is the enforceable ruleset used by all authz enforcement points.**
- **Inputs Required**
- PMAD-01: {{xref:PMAD-01}}
- BRP-02: {{xref:BRP-02}} | OPTIONAL
- BRP-04: {{xref:BRP-04}} | OPTIONAL
- ERR-02: {{xref:ERR-02}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Policy rules list (minimum 25 for non-trivial products)
- For each rule:
- **○ policy_id**
- **○ role_id(s)**
- **○ resource_id**
- **○ action_id(s)**
- **○ conditions (ABAC predicates)**
- **○ allow/deny outcome**
- **○ priority/order (if multiple match)**
- **○ exception hooks (break-glass/admin override) (if any)**
- **○ reason_code on deny (rc_*)**
- **○ audit requirement (yes/no + event type)**
- Inheritance rules (if role hierarchy exists)
- Conflict resolution rules (what happens if allow and deny both match)
- **Optional Fields**
- Policy grouping by domain/boundary | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Denies must be explicit when needed; define precedence rules.
- Every deny must map to a reason_code or policy fallback reason.
- Exception hooks must be auditable and time-bound if possible.
- Conditions vocabulary must match PMAD-01; no ad-hoc predicates.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Policy Rules (canonical)`
2. `## roles`
3. `## resour`
4. `## action`
5. `## conditi`
6. `## ons`
7. `## outco`
8. `## priorit`
9. `## excepti`
10. `## on_ho`

## 8. Cross-References

- Upstream: {{xref:PMAD-01}} | OPTIONAL, {{xref:BRP-02}} | OPTIONAL
- Downstream: {{xref:PMAD-03}}, {{xref:PMAD-04}} | OPTIONAL, {{xref:ERR-02}} |
- **OPTIONAL, {{xref:AUDIT-*}} | OPTIONAL**
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
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
