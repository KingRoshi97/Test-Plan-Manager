# API-01 — Endpoint Catalog

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-01                                             |
| Template Type     | Build / API                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring endpoint catalog    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Endpoint Catalog Document                         |

## 2. Purpose

Define the canonical inventory of backend endpoints (HTTP + internal-only surfaces if
applicable): what exists, what feature it supports, what auth applies, what entities it touches, and
what contract docs must exist for it. This is the source list used to generate per-endpoint specs,
tests, and mapping.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- ●
- ●
- ●
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- MAP-02: {{xref:MAP-02}} | OPTIONAL
- APIG-01: {{xref:APIG-01}} | OPTIONAL
- PMAD-02: {{xref:PMAD-02}} | OPTIONAL
- ERR-02: {{xref:ERR-02}} | OPTIONAL
- ERR-03: {{xref:ERR-03}} | OPTIONAL
- DATA-01: {{xref:DATA-01}} | OPTIONAL
- PFS-01: {{xref:PFS-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Endpoint list (minimum 20 for non-trivial products; justify if smaller)
● For each endpoint row:

○ endpoint_id (stable)
○ method
○ path
○ title (1 line)
○ purpose (1–2 lines)
○ feature_id(s) served (PRD-04)
○ endpoint_kind (public/auth/admin/internal/webhook)
○ authn required (yes/no + scheme)
○ authz policy_id (PMAD) if authn required or if resource-gated
○ request_schema_ref (API-02 or DATA-06) | OPTIONAL
○ response_schema_ref (API-02) | OPTIONAL
○ entities_read (DATA entity_ids) | OPTIONAL
○ entities_written (DATA entity_ids) | OPTIONAL
○ list/query capable (yes/no)
○ pfs_profile_ref (PFS profile or “default contract”) | OPTIONAL
○ idempotency_required (yes/no + key rule pointer) | OPTIONAL
○ rate_limit_ref (RLIM limit_id/class) | OPTIONAL
○ error_contract (ERR-03 compliant: yes/no)
○ owner_boundary/service (SBDT boundary id) | OPTIONAL
○ versioning (APIG-02) | OPTIONAL
● Catalog coverage checks:
○ unique endpoint_id
○ unique method+path
○ each endpoint maps to ≥1 feature_id (unless internal/system endpoint with
explicit exception)
○ authz policy present when required
○ list endpoints declare pfs_profile_ref (or explicit “no filters/sorts”)
○ mutation endpoints declare idempotency_required stance

## 5. Optional Fields

● Deprecation status (active/deprecated/sunset date) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- Must comply with APIG-01 naming/envelope and ERR-03 error payload.
- If endpoint_kind == admin, it must also appear in ADMIN-05.
- If list/query capable == true, PFS contract binding is required (PFS-01/02/03/04).
- **Any state mutation endpoint must have an idempotency stance (required or explicitly not**
- **supported with rationale).**
- Do not duplicate semantics via multiple endpoints with minor differences; use query
- **contracts or versioning.**
- **Output Format**
- **1) Endpoint Catalog (canonical)**
- **e ki me pa titl**
- **n nd tho th e**
- **d**
- **d**
- **p**
- **o**
- **i**
- **n**
- **t**
- **_**
- **i**
- **d**
- **fea**
- **tur**
- **e_i**
- **ds**
- **au**
- **th**
- **n**
- **po en en**
- **lic titi titi**
- **y_i es es**
- **d**
- **_r _**
- **ea wr**
- **d itt**
- **en**
- **lis**
- **t_**
- **q**
- **u**
- **er**
- **y**
- **pf**
- **s_**
- **re**
- **f**
- **id**
- **e**
- **m**
- **_r**
- **eq**
- **uir**
- **ed**
- **ra**
- **te**
- **_r**
- **ef**
- **er**
- **r_**
- **c**
- **o**
- **nt**
- **ra**
- **ct**
- **ow**
- **ne**
- **r**
- **ver**
- **sio**
- **n**
- **de**
- **pr**
- **ec**
- **ati**
- **on**
- **no**
- **te**
- **s**
- **e**
- **p**
- **_**
- **0**
- **0**
- **1**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **0].**
- **kin**
- **d}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[0].**
- **me**
- **tho**
- **d}}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **0].**
- **pa**
- **th}**
- **}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **0].**
- **titl**
- **e}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[0].**
- **fea**
- **tur**
- **es}**
- **}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[0]**
- **.a**
- **ut**
- **hn**
- **}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[0].**
- **pol**
- **icy**
- **}}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **0].**
- **re**
- **ad**
- **}}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **0].**
- **wri**
- **te}**
- **}**
- **{{**
- **en**
- **dp**
- **oi**
- **nt**
- **s[**
- **0].**
- **lis**
- **t}}**
- **{{**
- **en**
- **dp**
- **oi**
- **nt**
- **s[**
- **0].**
- **pf**
- **s}**
- **}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **0].**
- **id**
- **e**
- **m}**
- **}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **0].**
- **rat**
- **e}}**
- **{{**
- **e**
- **n**
- **d**
- **p**
- **oi**
- **nt**
- **s[**
- **0]**
- **.e**
- **rr}**
- **}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[0].**
- **ow**
- **ne**
- **r}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[0].**
- **ver**
- **sio**
- **n}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[0].**
- **de**
- **pre**
- **c}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[0]**
- **.n**
- **ot**
- **es**
- **}}**
- **e**
- **p**
- **_**
- **0**
- **0**
- **2**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **1].**
- **kin**
- **d}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[1].**
- **me**
- **tho**
- **d}}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **1].**
- **pa**
- **th}**
- **}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **1].**
- **titl**
- **e}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[1].**
- **fea**
- **tur**
- **es}**
- **}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[1]**
- **.a**
- **ut**
- **hn**
- **}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[1].**
- **pol**
- **icy**
- **}}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **1].**
- **re**
- **ad**
- **}}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **1].**
- **wri**
- **te}**
- **}**
- **{{**
- **en**
- **dp**
- **oi**
- **nt**
- **s[**
- **1].**
- **lis**
- **t}}**
- **{{**
- **en**
- **dp**
- **oi**
- **nt**
- **s[**
- **1].**
- **pf**
- **s}**
- **}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **1].**
- **id**
- **e**
- **m}**
- **}**
- **{{e**
- **nd**
- **po**
- **int**
- **s[**
- **1].**
- **rat**
- **e}}**
- **{{**
- **e**
- **n**
- **d**
- **p**
- **oi**
- **nt**
- **s[**
- **1]**
- **.e**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[1].**
- **ow**
- **ne**
- **r}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[1].**
- **ver**
- **sio**
- **n}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[1].**
- **de**
- **pre**
- **c}}**
- **{{e**
- **nd**
- **poi**
- **nts**
- **[1]**
- **.n**
- **ot**
- **es**
- **}}**
- **rr}**
- **}**
- **2) Coverage Checks (required)**
- 
- 
- 
- 
- 
- 
- **endpoint_ids unique: {{coverage.unique_endpoint_ids}}**
- **method+path unique: {{coverage.unique_method_path}}**
- **feature mapping complete: {{coverage.feature_mapping_complete}}**
- **authz refs complete when required: {{coverage.policy_complete}}**
- **pfs bound for list endpoints: {{coverage.pfs_bound}}**
- **idempotency stance for mutation endpoints: {{coverage.idem_stance_present}}**
- **Cross-References**
- Upstream: {{xref:APIG-01}} | OPTIONAL, {{xref:PMAD-02}} | OPTIONAL,
- **{{xref:ERR-03}} | OPTIONAL**
- Downstream: {{xref:API-02}} (per endpoint spec), {{xref:API-05}} (rate binding),
- **{{xref:QA-02}} (contract tests) | OPTIONAL**
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- **{{standards.rules[STD-SECURITY]}} | OPTIONAL,**
- **{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- **Skill Level Requiredness Rules**
- beginner: Required. kind/method/path/title/features/authn.
- intermediate: Required. Add policy_id + entities touched + list_query flags.
- advanced: Required. Add PFS bindings + idempotency stance + coverage checks.
- **Unknown Handling**
- UNKNOWN_ALLOWED: pfs_profile_ref (only if list_query == false),
- **rate_limit_ref, owner_boundary, versioning, deprecation_status, notes**
- If authn required and policy_id is UNKNOWN → block Completeness Gate.
- If list_query == true and pfs_ref is UNKNOWN → block Completeness Gate.
- If endpoint is mutation and idem_required is UNKNOWN → block Completeness Gate.
- **Completeness Gate**
- Gate ID: TMP-05.PRIMARY.API
- Pass conditions:
- **○**
- **○**
- **○**
- **○**
- **○**
- **○**
- **○**
- **○**
- **○**
- **required_fields_present == true**
- **endpoints_count >= 20 (or justified)**
- **unique_method_path == true**
- **feature_mapping_complete == true**
- **policy_complete == true**
- **pfs_bound == true**
- **idem_stance_present == true**
- **placeholder_resolution == true**
- **no_unapproved_unknowns == true**
- **API-02**
- **API-02 — Endpoint Spec (per endpoint:**
- **request/response/auth/errors)**
- **Header Block**
- template_id: API-02
- title: Endpoint Spec (per endpoint: request/response/auth/errors)
- type: backend_api
- template_version: 1.0.0
- output_path: 10_app/api/API-02_Endpoint_Spec.md
- compliance_gate_id: TMP-05.PRIMARY.API
- upstream_dependencies: ["API-01", "APIG-01", "APIG-02", "PMAD-04", "ERR-03",
- **"PFS-01"]**
- inputs_required: ["API-01", "APIG-01", "APIG-02", "PMAD-04", "ERR-03", "PFS-01",
- **"DATA-01", "DATA-06", "STANDARDS_INDEX"]**
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Provide the authoritative per-endpoint contract: request/response shape, auth requirements,**
- **validation rules, error cases with reason codes, pagination/filtering rules (if list), and side effects.**
- **This is what the build and tests implement.**
- **Inputs Required**
- API-01: {{xref:API-01}} | OPTIONAL
- APIG-01: {{xref:APIG-01}} | OPTIONAL
- APIG-02: {{xref:APIG-02}} | OPTIONAL
- PMAD-04: {{xref:PMAD-04}} | OPTIONAL
- ERR-03: {{xref:ERR-03}} | OPTIONAL
- PFS-01: {{xref:PFS-01}} | OPTIONAL
- DATA-01: {{xref:DATA-01}} | OPTIONAL
- DATA-06: {{xref:DATA-06}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- **For each endpoint spec block:**
- endpoint_id (must exist in API-01)
- method + path
- purpose
- feature_id(s)
- auth:
- **○ authn required (yes/no + scheme)**
- **○ authz policy ref (PMAD policy_id)**
- request contract:
- **○ headers (required/optional)**
- **○ path params (types)**
- **○ query params (types) + PFS rules if list/search**
- **○ body schema (fields/types) OR schema ref (DATA-06)**
- response contract:
- **○ success status code(s)**
- **○ response schema (fields/types)**
- **○ pagination envelope (if list)**
- side effects:
- **○ entities touched (reads/writes)**
- **○ events emitted (EVT ids) | OPTIONAL**
- **○ background jobs triggered (WFO/JBS ids) | OPTIONAL**
- error cases:
- **○ list of failure conditions**
- **○ http_status**
- **○ reason_code (ERR-02)**
- **○ retryability posture (ERR-05) | OPTIONAL**
- rate limits class (RLIM) | OPTIONAL
- idempotency requirements (WFO-03/ERR-05) for writes | OPTIONAL
- observability requirements (required log fields) | OPTIONAL
- test requirements (contract tests) | OPTIONAL
- **Optional Fields**
- Examples (request/response) | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- Must comply with ERR-03 error payload shape.
- Must comply with APIG-01 naming + envelope standards.
- List endpoints must specify PFS rules: filters/sorts/pagination.
- Auth must be explicit; “protected” is not a spec.
- Every error case must map to a reason_code (or explicit fallback policy).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Endpoint Catalog (canonical)`
2. `## e ki me pa titl`
3. `## n nd tho th e`
4. `## fea`
5. `## tur`
6. `## e_i`
7. `## po en en`
8. `## lic titi titi`
9. `## y_i es es`
10. `## _r _`

## 8. Cross-References

- Upstream: {{xref:APIG-01}} | OPTIONAL, {{xref:PMAD-02}} | OPTIONAL,
- **{{xref:ERR-03}} | OPTIONAL**
- Downstream: {{xref:API-02}} (per endpoint spec), {{xref:API-05}} (rate binding),
- **{{xref:QA-02}} (contract tests) | OPTIONAL**
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL,
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
