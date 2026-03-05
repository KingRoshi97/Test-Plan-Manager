# SMD-01 — State Architecture (global vs local, stores)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-01                                             |
| Template Type     | Build / State Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring state architecture (global vs local, stores)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled State Architecture (global vs local, stores) Document                         |

## 2. Purpose

Define the canonical client state architecture: what state is global vs local, what stores exist,
ownership boundaries, state shape conventions, and how state interacts with navigation,
caching, and offline behavior. This template must be consistent with frontend route/data binding
rules and must not invent stores/state domains not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FE-01 Route Map + Layout: {{fe.route_layout}} | OPTIONAL
- FE-04 Data Binding Rules: {{fe.data_binding}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| State philosophy state... | spec         | Yes             |
| Global store registry ... | spec         | Yes             |
| Store ownership model ... | spec         | Yes             |
| Local UI state guidanc... | spec         | Yes             |
| Derived state rules (s... | spec         | Yes             |
| Persistence policy (wh... | spec         | Yes             |
| Hydration rules (start... | spec         | Yes             |
| Reset rules (logout, t... | spec         | Yes             |
| Interaction with cache... | spec         | Yes             |

## 5. Optional Fields

Debug tooling notes | OPTIONAL
Dev-only state instrumentation | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not invent new store_ids; use only those present in upstream inputs (or mark UNKNOWN).
Global stores MUST have clear ownership and reset behavior.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Architecture Overview
philosophy: {{arch.philosophy}}
global_vs_local_rule: {{arch.global_vs_local_rule}}
notes: {{arch.notes}} | OPTIONAL
2. Global Store Registry
Store
store_id: {{stores[0].store_id}}
name: {{stores[0].name}}
owner_domain: {{stores[0].owner_domain}}
purpose: {{stores[0].purpose}}
state_shape: {{stores[0].state_shape}} | OPTIONAL
persistence: {{stores[0].persistence}} (none/session/disk/UNKNOWN)
reset_on: {{stores[0].reset_on}}
selectors: {{stores[0].selectors}} | OPTIONAL
actions: {{stores[0].actions}} | OPTIONAL
open_questions:
{{stores[0].open_questions[0]}} | OPTIONAL
(Repeat for each store_id.)
3. State Shape Conventions
entity_normalization: {{shape.normalization}}
ids_vs_objects_rule: {{shape.ids_vs_objects_rule}} | OPTIONAL
derived_state_rule: {{shape.derived_state_rule}} | OPTIONAL
4. Local UI State Guidance
when_local: {{local.when}}
when_global: {{local.when_global}}
screen_state_pattern: {{local.screen_state_pattern}} | OPTIONAL
5. Persistence & Hydration
persisted_stores: {{persist.stores}} | OPTIONAL
hydration_order: {{persist.hydration_order}}
migration_rules: {{persist.migration_rules}} | OPTIONAL
6. Reset Rules
logout_reset: {{reset.logout}}
tenant_switch_reset: {{reset.tenant_switch}} | OPTIONAL
soft_reset_rules: {{reset.soft_reset_rules}} | OPTIONAL

7. Cache Layer Interaction
cache_source_of_truth: {{cache.source_of_truth}} (server_cache/store/UNKNOWN)
cache_binding_ref: {{cache.binding_ref}} (expected: {{xref:SMD-02}}) | OPTIONAL
8. References
Data binding rules: {{xref:FE-04}} | OPTIONAL
Cache strategy: {{xref:SMD-02}} | OPTIONAL
Mutation patterns: {{xref:SMD-03}} | OPTIONAL
Offline handling: {{xref:SMD-05}} | OPTIONAL
Cross-References
Upstream: {{xref:FE-01}} | OPTIONAL, {{xref:FE-04}} | OPTIONAL, {{xref:SPEC_INDEX}} |
OPTIONAL
Downstream: {{xref:SMD-02}}, {{xref:SMD-03}}, {{xref:SMD-05}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for store details if missing; define philosophy and reset
rules.
intermediate: Required. Populate global store registry and persistence/hydration rules.
advanced: Required. Add normalized state conventions and selector/memoization guidance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, arch notes, state_shape,
selectors/actions, ids_vs_objects rule, derived state rule, screen patterns, persisted stores,
migration rules, tenant switch reset, soft reset, cache binding ref, debug tooling, instrumentation,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If global store registry is UNKNOWN → block Completeness Gate.
If reset.logout is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SMD
Pass conditions:
required_fields_present == true
global_store_registry_defined == true
reset_rules_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SMD-02

SMD-02 — Query/Cache Strategy (client cache rules, invalidation)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent new store_ids; use only those present in upstream inputs (or mark UNKNOWN).
- **Global stores MUST have clear ownership and reset behavior.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Architecture Overview`
2. `## Global Store Registry`
3. `## Store`
4. `## open_questions:`
5. `## (Repeat for each store_id.)`
6. `## State Shape Conventions`
7. `## Local UI State Guidance`
8. `## Persistence & Hydration`
9. `## Reset Rules`
10. `## Cache Layer Interaction`

## 8. Cross-References

- **Upstream: {{xref:FE-01}} | OPTIONAL, {{xref:FE-04}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:SMD-02}}, {{xref:SMD-03}}, {{xref:SMD-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
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
