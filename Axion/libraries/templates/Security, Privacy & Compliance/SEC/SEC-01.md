# SEC-01 — Security Requirements Inventory

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-01                                           |
| Template Type     | Security / Controls                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring security requirements inv |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Security Requirements Inventory           |

## 2. Purpose

Create the single, canonical overview of the security posture for the product: scope, security principles, assumed threats, and what "secure" means for this build. This document sets the baseline expectations for all downstream security/privacy/compliance docs and must not invent guarantees beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- PRD-06 NFRs/Security constraints: `{{prd.nfrs}}` | OPTIONAL
- Security architecture: `{{xref:SEC-02}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Security scope (in-scope systems/surfaces) | spec | No |
| Out-of-scope statement (explicit) | spec | No |
| Security principles list (top 5–12) | spec | No |
| Threat posture summary (major threat classes) | spec | No |
| Trust assumptions (what is assumed secure) | spec | Yes |
| Data sensitivity summary (high-level classes) | spec | Yes |
| Security ownership (who owns security decisions) | spec | No |
| Security review cadence (when reviewed) | spec | No |
| Known gaps / exceptions pointer (SEC-08) | spec | Yes |
| References to core security docs (SEC-02..SEC-10) | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Product risk tier | spec | OPTIONAL |
| External compliance drivers summary | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Every statement must be traceable to upstream inputs or marked UNKNOWN.
- Do not claim compliance certifications unless explicitly provided.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:PRD-06}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:SEC-02}}`, `{{xref:SEC-03}}`, `{{xref:SEC-05}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Fill required fields; mark UNKNOWN rather than inventing. |
| intermediate | Required. Replace UNKNOWN with sourced statements when inputs exist. |
| advanced | Required. Add crisp scope boundaries and explicit threat posture statements. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, prd.nfrs, attacker model, highest risk data, decision process, known gaps, risk tier, compliance drivers, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `scope.in` is UNKNOWN → block Completeness Gate.
- If `principles` is UNKNOWN → block Completeness Gate.
- If `governance.owner` is UNKNOWN → block Completeness Gate.
- If `governance.review_cadence` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SEC
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] scope_defined == true
  - [ ] principles_defined == true
  - [ ] ownership_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

