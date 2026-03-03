# API-05 — Rate Limit & Abuse Controls (per endpoint class)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-05                                             |
| Template Type     | Build / API                                        |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with rate-limited API endpoints       |
| Filled By         | Internal Agent                                     |
| Consumes          | RLIM-01, RLIM-02, API-01, ERR-02, OBS-04, Standards Index |
| Produces          | Filled Rate Limit & Abuse Controls Spec            |

## 2. Purpose

Define how rate limiting and abuse controls apply to API endpoint classes: classification, limits, enforcement points, error behaviors, exemptions, and observability. This is the API-specific binding of the global RLIM policy.

## 3. Inputs Required

- RLIM-01: `{{xref:RLIM-01}}` | OPTIONAL
- RLIM-02: `{{xref:RLIM-02}}` | OPTIONAL
- API-01: `{{xref:API-01}}` | OPTIONAL
- ERR-02: `{{xref:ERR-02}}` | OPTIONAL
- OBS-04: `{{xref:OBS-04}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Endpoint classification scheme      | spec         | No              |
| Endpoint → class mapping            | API-01       | No              |
| Limits per class (scope/threshold)  | RLIM         | No              |
| Burst policy per class              | RLIM         | Yes             |
| Block duration/cooldown             | RLIM         | Yes             |
| Enforcement point                   | spec         | No              |
| Error behavior (429 + reason_code)  | ERR          | No              |
| Abuse detection pointer             | RLIM-03      | No              |
| Exemptions policy pointer           | RLIM-05      | No              |
| Verification checklist              | spec         | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| WAF/bot protection pointer  | spec   | External protection layer        |
| Notes                       | agent  | Enrichment only, no new truth    |

## 6. Rules

- Rate limits must be enforceable server-side and consistent across endpoints of same class.
- 429 responses must conform to ERR-03 and include reason_code.
- Retry-After must be included where applicable.
- Admin endpoints require stricter default limits and auditing.

## 7. Output Format

### Required Headings (in order)

1. `## Endpoint Classes` — Table: class_id, description, default_scope, default_limit, burst_policy, notes
2. `## Endpoint → Class Mapping` — Table: endpoint_id, class_id, notes
3. `## Limits by Class` — Table: class_id, scope, threshold, burst, cooldown, enforcement_point, error_reason_code, retry_after_policy, notes
4. `## Error Behavior` — 429 contract, Retry-After rule, client guidance pointer
5. `## Exemptions & Abuse Tie-ins` — exemptions policy pointer, abuse signals pointer
6. `## Verification Checklist` — validation checks

## 8. Cross-References

- **Upstream**: RLIM-01, API-01
- **Downstream**: RLIM-06, ALRT-*, QA-04
- **Standards**: STD-RELIABILITY, STD-SECURITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Classes + mapping table              | Required  | Required     | Required |
| Limits and enforcement points        | Optional  | Required     | Required |
| Exemptions + observability hooks     | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: waf_pointer, notes, burst_policy, cooldown
- If any class lacks enforcement_point or reason_code → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] classes_present == true
- [ ] endpoint_mapping_present == true
- [ ] limits_present == true
- [ ] error_behavior_present == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
