# SSO-06 — Account Linking & Identity Merge Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-06                                             |
| Template Type     | Integration / SSO & Identity                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring account linking & identity merge rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Account Linking & Identity Merge Rules Document                         |

## 2. Purpose

Define the canonical rules for linking external identities (SSO providers) to internal user
accounts, including when accounts auto-link, when user confirmation is required, how identity
merges are performed, and how to prevent account takeover. This template must be consistent
with AuthZ and data schema rules and must not invent identity fields beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}} | OPTIONAL
- SSO-03 Claim Mapping: {{sso.claim_mapping}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- DATA-06 Data Schemas (identity/user): {{data.schemas}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Identity keys used for linking (email/sub/externalId/UNKNOWN)
Auto-link policy (allowed/blocked)
User confirmation rules (when required)
Linking constraints (one-to-one, many-to-one)
Merge eligibility rules (what can merge)
Merge strategy (fields precedence)
Audit logging requirements (link/merge events)
Security controls (prevent takeover, verified email rules)
Unlink policy (is unlink allowed?)
Telemetry requirements (link success/fail, merges)

Optional Fields
Cross-tenant linking rules | OPTIONAL
Admin-assisted merge rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Never link accounts based on unverified identifiers.
Merges MUST be auditable and reversible if possible.
Linking must not grant elevated roles beyond claim mapping rules.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Linking Keys
keys: {{link.keys}}
verified_identifier_rule: {{link.verified_identifier_rule}}
2. Auto-Link Policy
auto_link_enabled: {{auto.enabled}}
auto_link_conditions: {{auto.conditions}} | OPTIONAL
3. Confirmation Rules
confirmation_required_when: {{confirm.required_when}}
confirmation_ui_pattern: {{confirm.ui_pattern}} | OPTIONAL
4. Linking Constraints
constraint_model: {{constraints.model}} (one_to_one/many_to_one/UNKNOWN)
duplicate_identity_rule: {{constraints.duplicate_identity_rule}} | OPTIONAL
5. Merge Eligibility
eligible_when: {{merge.eligible_when}}
ineligible_when: {{merge.ineligible_when}} | OPTIONAL
6. Merge Strategy
field_precedence: {{merge.field_precedence}}
conflict_resolution: {{merge.conflict_resolution}} | OPTIONAL
7. Unlink Policy
unlink_supported: {{unlink.supported}}
unlink_rules: {{unlink.rules}} | OPTIONAL
8. Security Controls
prevent_takeover_rules: {{security.prevent_takeover_rules}}
role_escalation_prevention: {{security.role_escalation_prevention}} | OPTIONAL
9. Audit / Telemetry
audit_required: {{audit.required}}
audit_fields: {{audit.fields}} | OPTIONAL
link_success_metric: {{telemetry.link_success_metric}}
merge_metric: {{telemetry.merge_metric}} | OPTIONAL

10.References
Flow spec: {{xref:SSO-02}} | OPTIONAL
Claim mapping: {{xref:SSO-03}} | OPTIONAL
Security controls: {{xref:SSO-09}} | OPTIONAL
Audit/compliance: {{xref:SSO-10}} | OPTIONAL
Cross-References
Upstream: {{xref:SSO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SSO-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define linking keys + auto-link policy + verified identifier rule.
intermediate: Required. Define merge strategy and unlink policy and security controls.
advanced: Required. Add cross-tenant/admin merge rules and reversibility guarantees.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, auto conditions, ui pattern, duplicate rule,
ineligible rules, conflict resolution, unlink rules, role escalation prevention, audit fields, merge
metric, cross-tenant/admin rules, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If link.keys is UNKNOWN → block Completeness Gate.
If link.verified_identifier_rule is UNKNOWN → block Completeness Gate.
If telemetry.link_success_metric is UNKNOWN → block Completeness Gate.
If audit.required is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SSO
Pass conditions:
required_fields_present == true
linking_keys_and_verification_defined == true
auto_link_or_confirmation_defined == true
security_controls_defined == true
audit_and_telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SSO-07

SSO-07 — MFA/Step-Up Auth Rules (when required)
Header Block

## 5. Optional Fields

Cross-tenant linking rules | OPTIONAL
Admin-assisted merge rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- **Header Block**
- **template_id: SSO-06**
- **title: Account Linking & Identity Merge Rules**
- **type: sso_account_linking_identity_merge**
- **template_version: 1.0.0**
- **output_path: 10_app/sso/SSO-06_Account_Linking_Identity_Merge_Rules.md**
- **compliance_gate_id: TMP-05.PRIMARY.SSO**
- **upstream_dependencies: ["SSO-02", "SSO-03", "API-04", "DATA-06"]**
- **inputs_required: ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX",**
- **"SSO-01", "SSO-02", "SSO-03", "API-04", "DATA-06"]**
- **required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}**
- **Purpose**
- **Define the canonical rules for linking external identities (SSO providers) to internal user**
- **accounts, including when accounts auto-link, when user confirmation is required, how identity**
- **merges are performed, and how to prevent account takeover. This template must be consistent**
- **with AuthZ and data schema rules and must not invent identity fields beyond upstream inputs.**
- **Inputs Required**
- **SPEC_INDEX: {{spec.index}}**
- **DOMAIN_MAP: {{domain.map}} | OPTIONAL**
- **GLOSSARY: {{glossary.terms}} | OPTIONAL**
- **STANDARDS_INDEX: {{standards.index}} | OPTIONAL**
- **SSO-01 Provider Inventory: {{sso.providers}}**
- **SSO-02 Flow Spec: {{sso.flows}} | OPTIONAL**
- **SSO-03 Claim Mapping: {{sso.claim_mapping}} | OPTIONAL**
- **API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL**
- **DATA-06 Data Schemas (identity/user): {{data.schemas}} | OPTIONAL**
- **Existing docs/notes: {{inputs.notes}} | OPTIONAL**
- **Required Fields**
- **Identity keys used for linking (email/sub/externalId/UNKNOWN)**
- **Auto-link policy (allowed/blocked)**
- **User confirmation rules (when required)**
- **Linking constraints (one-to-one, many-to-one)**
- **Merge eligibility rules (what can merge)**
- **Merge strategy (fields precedence)**
- **Audit logging requirements (link/merge events)**
- **Security controls (prevent takeover, verified email rules)**
- **Unlink policy (is unlink allowed?)**
- **Telemetry requirements (link success/fail, merges)**
- **Optional Fields**
- **Cross-tenant linking rules | OPTIONAL**
- **Admin-assisted merge rules | OPTIONAL**
- **Open questions | OPTIONAL**
- **Rules**
- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Never link accounts based on unverified identifiers.**
- **Merges MUST be auditable and reversible if possible.**
- **Linking must not grant elevated roles beyond claim mapping rules.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Linking Keys`
2. `## Auto-Link Policy`
3. `## Confirmation Rules`
4. `## Linking Constraints`
5. `## Merge Eligibility`
6. `## Merge Strategy`
7. `## Unlink Policy`
8. `## Security Controls`
9. `## Audit / Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:SSO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SSO-10}} | OPTIONAL**
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
