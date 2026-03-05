# NOTIF-02 — Provider Inventory (by provider_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-02                                             |
| Template Type     | Integration / Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring provider inventory (by provider_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Provider Inventory (by provider_id) Document                         |

## 2. Purpose

Create the canonical inventory of notification/comms providers (email/SMS/push/in-app
vendors), indexed by provider_id, including which channels each provider supports, enabled
environments, credential references, and operational constraints. This document must not
invent provider_ids beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- IXS-04 Secrets/Credential Handling: {{ixs.secrets_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Provider registry (provider_id list)
provider_id (stable identifier)
provider name/vendor
supported channels (email/sms/push/in_app)
integration_id binding (IXS-01)
credentials reference (IXS-04)
environments enabled (dev/stage/prod)
rate limits/quotas summary
deliverability constraints (email) or carrier constraints (sms) if applicable
criticality (low/med/high)
owner (team/role)
references to detailed specs (NOTIF-03..10 and MPUSH for push)

Optional Fields
Status (planned/active/deprecated) | OPTIONAL
SLA/uptime notes | OPTIONAL
Regional availability notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not invent provider_ids; use only {{spec.notif_providers_by_id}} if present, else mark
UNKNOWN and flag.
Each provider must bind to an integration_id and have a credential reference (or approved
UNKNOWN).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Inventory Summary
total_providers: {{inv.total}}
channels_covered: {{inv.channels_covered}} | OPTIONAL
notes: {{inv.notes}} | OPTIONAL
2. Provider Entries (by provider_id)
Provider
provider_id: {{providers[0].provider_id}}
name: {{providers[0].name}}
supported_channels: {{providers[0].supported_channels}}
integration_id: {{providers[0].integration_id}}
credential_ref: {{providers[0].credential_ref}} (expected: {{xref:IXS-04}}) | OPTIONAL
env_enabled: {{providers[0].env_enabled}}
rate_limits: {{providers[0].rate_limits}}
constraints: {{providers[0].constraints}} | OPTIONAL
criticality: {{providers[0].criticality}}
owner: {{providers[0].owner}}
spec_refs:
● {{providers[0].spec_refs[0]}} (e.g., {{xref:NOTIF-04}} / {{xref:NOTIF-05}} /
{{xref:MPUSH-04}})
● {{providers[0].spec_refs[1]}} | OPTIONAL
status: {{providers[0].status}} | OPTIONAL
sla_notes: {{providers[0].sla_notes}} | OPTIONAL
region_notes: {{providers[0].region_notes}} | OPTIONAL
open_questions:
{{providers[0].open_questions[0]}} | OPTIONAL
(Repeat per provider_id.)

3. References
Template/localization mapping: {{xref:NOTIF-03}} | OPTIONAL
Send policy: {{xref:NOTIF-04}} | OPTIONAL
Deliverability: {{xref:NOTIF-05}} | OPTIONAL
Preference center: {{xref:NOTIF-06}} | OPTIONAL
Security/compliance: {{xref:NOTIF-07}} | OPTIONAL
Event mapping: {{xref:NOTIF-08}} | OPTIONAL
Failure handling: {{xref:NOTIF-09}} | OPTIONAL
Observability/runbooks: {{xref:NOTIF-10}} | OPTIONAL
Cross-References
Upstream: {{xref:NOTIF-01}}, {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:NOTIF-04}}, {{xref:NOTIF-05}}, {{xref:NOTIF-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define providers and supported channels and env enablement.
intermediate: Required. Add credentials refs, rate limits, and spec refs.
advanced: Required. Add deliverability constraints, regional notes, and criticality/ownership
rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, credential ref, constraints,
secondary spec refs, status/sla/region notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If providers[].provider_id is UNKNOWN → block Completeness Gate.
If providers[].integration_id is UNKNOWN → block Completeness Gate.
If providers[].supported_channels is UNKNOWN → block Completeness Gate.
If providers[].rate_limits is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
provider_ids_unique == true
integration_ids_exist_in_IXS_01 == true
channels_supported_valid == true
placeholder_resolution == true
no_unapproved_unknowns == true

NOTIF-03

NOTIF-03 — Template & Localization Mapping (template_id, variables)
Header Block

## 5. Optional Fields

Status (planned/active/deprecated) | OPTIONAL
SLA/uptime notes | OPTIONAL
Regional availability notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent provider_ids; use only {{spec.notif_providers_by_id}} if present, else mark
- **UNKNOWN and flag.**
- Each provider must bind to an integration_id and have a credential reference (or approved
- **UNKNOWN).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Inventory Summary`
2. `## Provider Entries (by provider_id)`
3. `## Provider`
4. `## spec_refs:`
5. `## open_questions:`
6. `## (Repeat per provider_id.)`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:NOTIF-01}}, {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:NOTIF-04}}, {{xref:NOTIF-05}}, {{xref:NOTIF-10}} | OPTIONAL**
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
