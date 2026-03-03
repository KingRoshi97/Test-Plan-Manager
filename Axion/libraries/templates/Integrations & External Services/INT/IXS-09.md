# IXS-09 — Integration Security & Compliance

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-09                                           |
| Template Type     | Integration / Core                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring integration security & co |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, IXS-02, IXS-10                           |
| Produces          | Filled Integration Security & Compliance         |

## 2. Purpose

Define the canonical strategy for testing integrations safely: which vendors have sandboxes, how stubs/mocks are used, fixture datasets, replayable test events, and CI-safe verification. This template must ensure tests do not hit production systems and must not invent test environments that don't exist in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- IXS-01 Integration Inventory: `{{ixs.inventory}}`
- IXS-02 Integration Specs: `{{ixs.integration_specs}}`
- IXS-05 Data Mapping Rules: `{{ixs.data_mapping}}` | OPTIONAL
- Existing test plans/notes: `{{inputs.test_notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| Sandbox availability map | integration_id → sandbox available yes/no |
| Sandbox endpoints/credentials policy | No secrets, references only |
| Stub/mock strategy | When to stub vs use sandbox |
| Fixture data strategy | Schemas, sample payloads |
| Replay strategy | Recorded webhooks/events |
| CI execution rules | What runs in CI |
| Safety rules | Never call prod, allowlist only |
| Test coverage expectations | Happy path + failure classes |
| Verification commands/policies | How to run tests |

## 5. Optional Fields

| Field | Notes |
|---|---|
| Contract testing approach | OPTIONAL |
| Rate-limited test windows | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- No production endpoints or production credentials may be used in tests.
- Fixtures must conform to mapping rules and data schemas.
- If sandbox does not exist, tests must use stubs/mocks with deterministic fixtures.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:IXS-01}}`, `{{xref:IXS-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IXS-10}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL, `{{standards.rules[STD-SECURITY]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. Define sandbox availability + CI safety rules; use UNKNOWN for replay tooling if not present.
- **intermediate**: Required. Define stubs/fixtures and how-to-run verification.
- **advanced**: Required. Add contract testing and replay runner rigor with deterministic fixtures.

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, sandbox endpoint/notes, fidelity rule, schema/mapping refs, replay details, ci secrets policy, allowlist ref, extra coverage items, expected outputs, contract testing, rate-limited windows, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `ci.enabled` is UNKNOWN → block Completeness Gate.
- If `safety.prod_call_block_rule` is UNKNOWN → block Completeness Gate.
- If `fixtures.location` is UNKNOWN → block Completeness Gate.
- If `verify.how_to_run` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IXS
- [ ] required_fields_present == true
- [ ] sandbox_map_defined == true
- [ ] ci_and_safety_rules_defined == true
- [ ] fixtures_defined == true
- [ ] verification_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

