# ROUTE-02 — Navigation Map (flows, entry points)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-02                                             |
| Template Type     | Build / Routing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring navigation map (flows, entry points)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Navigation Map (flows, entry points) Document                         |

## 2. Purpose

Define the canonical navigation map of the app: primary entry points, user flows, navigation
graph between screens/routes, and how navigation is structured (tabs/stacks/modals). This
template must be consistent with the route contract and must not invent routes/screens not
present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ROUTE-01 Route Contract: {{route.contract}}
- FE-01 Route Map + Layout: {{fe.route_layout}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Entry points list (rou... | spec         | Yes             |
| Primary navigation str... | spec         | Yes             |
| Flow registry (flow_id... | spec         | Yes             |
| Flow steps (ordered ro... | spec         | Yes             |
| Transitions (push/repl... | spec         | Yes             |
| Back behavior expectat... | spec         | Yes             |
| Role-based nav differe... | spec         | Yes             |
| Guarded transitions (a... | spec         | Yes             |
| Deep link entry refere... | spec         | Yes             |

## 5. Optional Fields

Alternative flows (error/recovery) | OPTIONAL
Cross-domain shortcuts | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new route_ids/screen_ids; use only those in SPEC_INDEX / FE-01.
Flow steps MUST be ordered and deterministic.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Entry Points
entry_routes: {{entry.routes}}
default_entry: {{entry.default_entry}}
notes: {{entry.notes}} | OPTIONAL
2. Primary Navigation Structure
nav_model: {{nav.model}} (tabs/sidebar/stack/UNKNOWN)
nav_regions: {{nav.regions}} | OPTIONAL
role_variants: {{nav.role_variants}} | OPTIONAL
3. Flow Registry (by flow_id)
Flow
flow_id: {{flows[0].flow_id}}
name: {{flows[0].name}}
primary_user: {{flows[0].primary_user}} | OPTIONAL
entry_route_id: {{flows[0].entry_route_id}}
exit_route_id: {{flows[0].exit_route_id}} | OPTIONAL
steps (ordered):
● step_id: {{flows[0].steps[0].step_id}}
route_id: {{flows[0].steps[0].route_id}}
screen_id: {{flows[0].steps[0].screen_id}} | OPTIONAL
transition: {{flows[0].steps[0].transition}}
guard: {{flows[0].steps[0].guard}} | OPTIONAL
back_behavior: {{flows[0].steps[0].back_behavior}} | OPTIONAL
(Repeat step blocks; repeat flow blocks.)
4. Back Behavior Rules
global_back_rules: {{back.global_rules}}
modal_back_rules: {{back.modal_rules}} | OPTIONAL
5. Guarded Transitions
auth_gating_rules: {{guards.auth_gating_rules}}
role_gating_rules: {{guards.role_gating_rules}} | OPTIONAL
6. Deep Link Entry References
deep_link_ref: {{deep_links.ref}} (expected: {{xref:ROUTE-03}}) | OPTIONAL
7. References
Route contract: {{xref:ROUTE-01}}
Deep link map: {{xref:ROUTE-03}} | OPTIONAL

Guard rules: {{xref:ROUTE-04}} | OPTIONAL
Back/history rules: {{xref:ROUTE-05}} | OPTIONAL
Cross-References
Upstream: {{xref:ROUTE-01}}, {{xref:FE-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ROUTE-03}}, {{xref:ROUTE-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define entry points and at least the primary flows; use UNKNOWN if role
variants unclear.
intermediate: Required. Define transitions, back behavior, and guard notes for each step.
advanced: Required. Add alternative/recovery flows and role-based navigation variants with
traceability.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, entry notes, nav regions, role variants,
primary user, exit route, step screen_id, guard/back behavior, modal back rules, role gating
rules, deep link ref, alternative flows, shortcuts, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If entry.routes is UNKNOWN → block Completeness Gate.
If flows registry is UNKNOWN → block Completeness Gate.
If any step route_id is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ROUTE
Pass conditions:
required_fields_present == true
entry_points_defined == true
flows_defined == true
all route_ids reference existing IDs
placeholder_resolution == true
no_unapproved_unknowns == true

ROUTE-03

ROUTE-03 — Deep Link Map (URLs → screens/actions)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new route_ids/screen_ids; use only those in SPEC_INDEX / FE-01.
- **Flow steps MUST be ordered and deterministic.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Entry Points`
2. `## Primary Navigation Structure`
3. `## Flow Registry (by flow_id)`
4. `## Flow`
5. `## steps (ordered):`
6. `## (Repeat step blocks; repeat flow blocks.)`
7. `## Back Behavior Rules`
8. `## Guarded Transitions`
9. `## Deep Link Entry References`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:ROUTE-01}}, {{xref:FE-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ROUTE-03}}, {{xref:ROUTE-05}} | OPTIONAL**
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
