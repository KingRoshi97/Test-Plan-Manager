# FFCFG-04 — Config Matrix (env vars/settings by env)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FFCFG-04                                             |
| Template Type     | Build / Feature Flags                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring config matrix (env vars/settings by env)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Config Matrix (env vars/settings by env) Document                         |

## 2. Purpose

Create the canonical matrix of configuration values by environment (env vars, runtime settings,
service configs), including defaults, requiredness, secrets handling, and change control. This
template must be consistent with the feature/config registry and must not invent config keys not
present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FFCFG-01 Feature Flag Registry: {{ffcfg.registry}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Config key registry (c... | spec         | Yes             |
| Description/purpose fo... | spec         | Yes             |
| Type (string/int/bool/... | spec         | Yes             |
| Requiredness (required... | spec         | Yes             |
| Default value policy (... | spec         | Yes             |
| Environment columns (d... | spec         | Yes             |
| Secret handling (where... | spec         | Yes             |
| Validation rules (form... | spec         | Yes             |
| Change control policy ... | spec         | Yes             |
| Runtime reload behavio... | spec         | Yes             |
| Dependencies (what rel... | spec         | Yes             |

## 5. Optional Fields

Owner/team | OPTIONAL
Rotation policy (for secrets) | OPTIONAL

Deprecation/sunset plan | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new config keys; use only: {{spec.config_by_id[cfg_*]}} as given.
- **Secrets MUST NOT be stored as plaintext in this document (store references only).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- If a config is required in prod, prod value MUST be set (not UNKNOWN) unless explicitly
- **allowed by standards.**

## 7. Output Format

### Required Headings (in order)

1. `## Matrix Summary`
2. `## Config Matrix (by config_id)`
3. `## Config`
4. `## values_by_env:`
5. `## change_control:`
6. `## open_questions:`
7. `## (Repeat the “Config” block for each config_id.)`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:STANDARDS_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FFCFG-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECRETS]}} | OPTIONAL

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
