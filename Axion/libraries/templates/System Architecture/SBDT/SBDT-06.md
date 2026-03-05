# SBDT-06 — Deployment Constraints

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SBDT-06                                             |
| Template Type     | Architecture / Deployment                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring deployment constraints    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Deployment Constraints Document                         |

## 2. Purpose

Define the hard constraints and required practices for safe deployment: rollout strategy,
canary/phased deploy rules, migration safety, backward compatibility requirements, and rollback
posture. This prevents unsafe releases that break running systems.

## 3. Inputs Required

- ● ARC-08: {{xref:ARC-08}} | OPTIONAL
- ● REL-01: {{xref:REL-01}} | OPTIONAL
- ● REL-04: {{xref:REL-04}} | OPTIONAL
- ● DATA-04: {{xref:DATA-04}} | OPTIONAL
- ● CICD-03: {{xref:CICD-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Rollout strategy polic... | spec         | Yes             |
| Canary/phased deploy r... | spec         | Yes             |
| Migration safety rules:   | spec         | Yes             |
| ○ expand/contract appr... | spec         | Yes             |
| ○ ordering constraints... | spec         | Yes             |
| ○ migration verificati... | spec         | Yes             |
| Rollback rules:           | spec         | Yes             |
| ○ what can be rolled b... | spec         | Yes             |
| ○ what cannot (irrever... | spec         | Yes             |
| ○ rollback triggers       | spec         | Yes             |
| Required pre-deploy ch... | spec         | Yes             |
| Required post-deploy v... | spec         | Yes             |

## 5. Optional Fields

● Feature flag rollout pointers | OPTIONAL
● Notes | OPTIONAL

Rules
● Any rollout that runs mixed versions must guarantee compatibility.
● Schema changes must be compatible with both old and new code during transition.
● Rollback posture must be explicit before shipping.
● If a migration is irreversible, it must require explicit approval.

Output Format
1) Default Rollout Strategy (required)
● Default strategy: {{rollout.default}} (all-at-once/canary/phased/blue-green)
● When canary is mandatory: {{rollout.canary_when_required}}
● Abort conditions: {{rollout.abort_conditions}} | OPTIONAL

2) Compatibility Rules (required)
● Mixed-version compatibility rule: {{compat.mixed_version}}
● API compatibility rule: {{compat.api}}
● Event/message compatibility rule: {{compat.events}} | OPTIONAL

3) Migration Safety Rules (required)
● Approach: {{migrations.approach}} (expand/contract, etc.)
● Ordering: {{migrations.ordering}} (schema first vs code first)
● Verification: {{migrations.verification}}
● Data backfill rule: {{migrations.backfill}} | OPTIONAL

4) Rollback Rules (required)

● Rollback triggers: {{rollback.triggers}}
● Safe rollback actions: {{rollback.safe_actions}}
● Unsafe/blocked rollback cases: {{rollback.unsafe_cases}}
● Roll-forward rule (when rollback not possible): {{rollback.roll_forward}} | OPTIONAL

5) Pre/Post Deploy Checks (required)
● Pre-deploy gate pointer: {{checks.predeploy_gate_pointer}}
● Post-deploy verification steps: {{checks.postdeploy_steps}}

Cross-References
● Upstream: {{xref:REL-01}} | OPTIONAL, {{xref:DATA-04}} | OPTIONAL, {{xref:CICD-03}}
| OPTIONAL
● Downstream: {{xref:RELOPS-02}} | OPTIONAL, {{xref:QA-05}} | OPTIONAL,
{{xref:IRP-01}} | OPTIONAL
● Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Default rollout + rollback triggers + pre/post checks.
● intermediate: Required. Add compatibility and migration ordering rules.
● advanced: Required. Add abort conditions and irreversible migration approval rules.

Unknown Handling
● UNKNOWN_ALLOWED: feature_flag_pointers, abort_conditions, notes,
backfill_rules

● If migration safety ordering is UNKNOWN → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.TOPOLOGY
● Pass conditions:
○ required_fields_present == true
○ rollout_strategy_present == true
○ compatibility_rules_present == true
○ migration_safety_present == true
○ rollback_rules_present == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

Permission Model & Authorization
Design (PMAD)

● Permission Model & Authorization Design (PMAD)
PMAD-01 Permission Model Overview (roles, resources, actions)
PMAD-02 AuthZ Policy Rules (RBAC/ABAC, inheritance, exceptions)
PMAD-03 Enforcement Points Map (UI/API/service/DB)
PMAD-04 Permission Check Patterns (standard decision flow + reason codes)
PMAD-05 Privileged Operations Policy (admin/mod/support actions, approvals)
PMAD-06 Audit Requirements for AuthZ (what must be logged)

PMAD-01

PMAD-01 — Permission Model Overview
(roles, resources, actions)
Header Block
● template_id: PMAD-01
● title: Permission Model Overview (roles, resources, actions)
● type: permission_model_authorizati

## 6. Rules

- Any rollout that runs mixed versions must guarantee compatibility.
- Schema changes must be compatible with both old and new code during transition.
- Rollback posture must be explicit before shipping.
- If a migration is irreversible, it must require explicit approval.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Default Rollout Strategy (required)`
2. `## 2) Compatibility Rules (required)`
3. `## 3) Migration Safety Rules (required)`
4. `## 4) Rollback Rules (required)`
5. `## 5) Pre/Post Deploy Checks (required)`

## 8. Cross-References

- Upstream: {{xref:REL-01}} | OPTIONAL, {{xref:DATA-04}} | OPTIONAL, {{xref:CICD-03}}
- | OPTIONAL
- Downstream: {{xref:RELOPS-02}} | OPTIONAL, {{xref:QA-05}} | OPTIONAL,
- **{{xref:IRP-01}} | OPTIONAL**
- Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
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
