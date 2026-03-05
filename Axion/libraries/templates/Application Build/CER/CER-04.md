# CER-04 — Session Expiry Handling (re-auth prompts, restore state)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CER-04                                             |
| Template Type     | Build / Client Error Recovery                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring session expiry handling (re-auth prompts, restore state)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Session Expiry Handling (re-auth prompts, restore state) Document                         |

## 2. Purpose

Define the canonical client behavior when sessions expire or authentication becomes invalid:
how 401s are handled, when to prompt re-auth, how to preserve/restore navigation state, and
how to avoid loops. This template must be consistent with AuthZ/token storage policies and
route guards and must not invent auth flows not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- CSec-01 Token Storage Policy: {{csec.token_policy}} | OPTIONAL
- FE-07 Error UX: {{fe.error_ux}} | OPTIONAL
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Detection rules (how c... | spec         | Yes             |
| Re-auth prompt UX (mod... | spec         | Yes             |
| Return-to behavior (re... | spec         | Yes             |
| State preservation rul... | spec         | Yes             |
| Refresh token policy (... | spec         | Yes             |
| Loop prevention rules ... | spec         | Yes             |
| Logout fallback rule (... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Security constraints (... | spec         | Yes             |

## 5. Optional Fields

Multi-device session invalidation behavior | OPTIONAL

Grace period policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Re-auth behavior MUST align with route guards ({{xref:ROUTE-04}}).**
- **Token handling MUST align with {{xref:CSec-01}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Invalidation Triggers`
2. `## Detection`
3. `## Re-Auth UX`
4. `## Return-To Behavior`
5. `## State Preservation`
6. `## Refresh Policy (if applicable)`
7. `## Loop Prevention`
8. `## Logout Fallback`
9. `## Telemetry`
10. `## Security Constraints`

## 8. Cross-References

- **Upstream: {{xref:API-04}} | OPTIONAL, {{xref:CSec-01}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:CER-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,**
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
