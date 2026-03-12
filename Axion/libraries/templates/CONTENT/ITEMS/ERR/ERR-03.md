# ERR-03 — API Error Contract (shape,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ERR-03                                             |
| Template Type     | Architecture / Error Model                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring api error contract (shape,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled API Error Contract (shape, Document                         |

## 2. Purpose

Define the canonical error response contract for APIs: payload shape, required fields, status
mapping rules, localization hooks, correlation ID inclusion, and safe disclosure/redaction rules.
This ensures every API returns errors consistently.

## 3. Inputs Required

- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● APIG-01: {{xref:APIG-01}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● CDX-04: {{xref:CDX-04}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Error payload schema (... | spec         | Yes             |
| Required fields:          | spec         | Yes             |
| ○ error_id (unique per... | spec         | Yes             |
| ○ reason_code (rc_*)      | spec         | Yes             |
| ○ error_class             | spec         | Yes             |
| ○ http_status             | spec         | Yes             |
| ○ correlation_id (trac... | spec         | Yes             |
| ○ timestamp               | spec         | Yes             |
| Optional fields:          | spec         | Yes             |
| ○ field_errors (per in... | spec         | Yes             |
| ○ retry_after (for rat... | spec         | Yes             |
| ○ docs_url (optional)     | spec         | Yes             |

## 5. Optional Fields

● GraphQL error mapping notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- reason_code is mandatory for all non-2xx errors (except truly unknown fallback with
- **explicit rc_unknown).**
- Error payload must not leak internal stack traces or sensitive identifiers.
- Status codes must be consistent across endpoints; do not “choose per endpoint.”
- Field errors must use stable input field names (aligned to API schemas).
- Correlation ID must always be present and consistent with observability propagation.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Canonical Error Payload Schema (required)`
2. `## "field_errors": [`
3. `## 2) Required/Optional Fields (required)`
4. `## Required: error_id, reason_code, error_class, http_status, correlation_id, timestamp,`
5. `## (message_key OR safe_message)`
6. `## Optional: field_errors, retry_after, docs_url, debug_ref`
7. `## 3) Status Mapping Rules (required)`
8. `## error_class`
9. `## default_status`
10. `## overrides (reason_code`

## 8. Cross-References

- Upstream: {{xref:ERR-01}} | OPTIONAL, {{xref:ERR-02}} | OPTIONAL, {{xref:DGP-01}} |
- OPTIONAL
- Downstream: {{xref:API-03}} | OPTIONAL, {{xref:ERR-04}} | OPTIONAL, {{xref:QA-03}} |
- OPTIONAL
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
