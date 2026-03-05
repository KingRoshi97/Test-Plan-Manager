# PMAD-05 — Privileged Operations Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PMAD-05                                             |
| Template Type     | Architecture / Authorization                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring privileged operations policy    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Privileged Operations Policy Document                         |

## 2. Purpose

Define the policy for privileged operations (admin/mod/support): what actions are privileged,
who can perform them, what approvals are required, what safeguards apply (2-person rule,
time-bound access), and what must be audited.

## 3. Inputs Required

- ● PMAD-01: {{xref:PMAD-01}} | OPTIONAL
- ● PMAD-02: {{xref:PMAD-02}} | OPTIONAL
- ● ADMIN-01: {{xref:ADMIN-01}} | OPTIONAL
- ● AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL
- ● STK-04: {{xref:STK-04}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Privileged action catalog (minimum 15)
● For each privileged action:
○ priv_action_id
○ action description
○ resource scope (what it affects)
○ who can execute (role/tier)
○ approval required (none/1-step/2-person/manager/legal)
○ justification required (yes/no + fields)
○ time-bound requirement (yes/no + duration)
○ audit event name
○ data sensitivity (PII level)
○ UI surface where performed (admin console) | OPTIONAL
○ emergency override allowed (yes/no) + rules
● Break-glass policy (when/why/how)
● Post-action review requirements (spot checks, approvals)
● Deny behaviors + reason codes policy

Optional Fields
● Training requirement | OPTIONAL
● Notes | OPTIONAL

Rules
● All privileged operations must be auditable with before/after context (redacted).
● If break-glass exists, it must be time-bound and reviewed.
● High-PII operations require stricter approvals and minimum exposure.
● Privileged actions must have explicit deny reason codes and consistent UX messaging.

Output Format
1) Privileged Action Catalog (canonical)
priv desc
_ac riptio
tion
n
_id

scop
e

exec
utor_
roles

appro
val

justific
ation_fi
elds

time_b
ound

audit_e
vent

pii_l
evel

emerg
ency_
overri
de

note
s

pa_
01

{{acti
ons[0
].des
c}}

{{acti
ons[0]
.scop
e}}

{{acti
ons[0
].role
s}}

{{actio
ns[0].a
pprova
l}}

{{action
s[0].justi
fication}
}

{{action
s[0].tim
e_boun
d}}

{{action
s[0].aud
it_event
}}

{{acti
ons[
0].pii
}}

{{actio
ns[0].o
verride
}}

{{acti
ons[0
].note
s}}

pa_
02

{{acti
ons[1
].des
c}}

{{acti
ons[1]
.scop
e}}

{{acti
ons[1
].role
s}}

{{actio
ns[1].a
pprova
l}}

{{action
s[1].justi
fication}
}

{{action
s[1].tim
e_boun
d}}

{{action
s[1].aud
it_event
}}

{{acti
ons[
1].pii
}}

{{actio
ns[1].o
verride
}}

{{acti
ons[1
].note
s}}

2) Break-Glass Policy (required)
● When allowed: {{breakglass.when_allowed}}
● Who can invoke: {{breakglass.who}}

● Time bound duration: {{breakglass.duration}}
● Required justification: {{breakglass.justification}}
● Required review after: {{breakglass.post_review}}
● Logging requirements: {{breakglass.logging}}

3) Approval Workflow Rules (required)
● Default approval path: {{approvals.default_path}}
● 2-person rule conditions: {{approvals.two_person_conditions}} | OPTIONAL
● Denial/timeout handling: {{approvals.denial_handling}} | OPTIONAL

4) Post-Action Review (required)
● Review cadence: {{review.cadence}}
● Sample size rule: {{review.sample_size}} | OPTIONAL
● Who reviews: {{review.owner}}
● Escalation rules: {{review.escalation}} | OPTIONAL

5) Deny Behavior + Reason Codes (required)
● Deny reason_code source: {{xref:ERR-02}} | OPTIONAL
● UX copy pointer: {{xref:CDX-04}} | OPTIONAL
● Default deny reason_code: {{deny.default_rc}}

Cross-References
● Upstream: {{xref:ADMIN-01}} | OPTIONAL, {{xref:AUDIT-01}} | OPTIONAL,
{{xref:STK-04}} | OPTIONAL

● Downstream: {{xref:PMAD-06}} | OPTIONAL, {{xref:ADMIN-03}} | OPTIONAL,
{{xref:SECOPS-*}} | OPTIONAL
● Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-PRIVACY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Catalog + break-glass + audit event requirement.
● intermediate: Required. Add approval workflows and post-action review rules.
● advanced: Required. Add PII sensitivity policies and emergency override controls.

Unknown Handling
● UNKNOWN_ALLOWED: training_requirement, notes, sample_size_rule,
two_person_conditions
● If any privileged action lacks audit_event or approval rule → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.AUTHZ
● Pass conditions:
○ required_fields_present == true
○ privileged_actions_count >= 15
○ break_glass_policy_present == true
○ approvals_defined == true
○

## 5. Optional Fields

● Training requirement | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- All privileged operations must be auditable with before/after context (redacted).
- If break-glass exists, it must be time-bound and reviewed.
- High-PII operations require stricter approvals and minimum exposure.
- Privileged actions must have explicit deny reason codes and consistent UX messaging.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Privileged Action Catalog (canonical)`
2. `## priv desc`
3. `## _ac riptio`
4. `## tion`
5. `## _id`
6. `## scop`
7. `## exec`
8. `## utor_`
9. `## roles`
10. `## appro`

## 8. Cross-References

- Upstream: {{xref:ADMIN-01}} | OPTIONAL, {{xref:AUDIT-01}} | OPTIONAL,
- **{{xref:STK-04}} | OPTIONAL**
- Downstream: {{xref:PMAD-06}} | OPTIONAL, {{xref:ADMIN-03}} | OPTIONAL,
- **{{xref:SECOPS-*}} | OPTIONAL**
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
