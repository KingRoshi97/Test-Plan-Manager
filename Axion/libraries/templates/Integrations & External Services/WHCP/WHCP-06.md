# WHCP-06 — Idempotency & Deduplication Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-06                                          |
| Template Type     | Integration / Webhooks                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring idempotency & deduplicati |
| Filled By         | Internal Agent                                   |
| Consumes          | WHCP-01, WHCP-05, ADMIN-01                       |
| Produces          | Filled Idempotency & Deduplication Rules         |

## 2. Purpose

Define the canonical subscription/endpoint registration and lifecycle management for webhooks: how consumers register endpoints, choose events, manage secrets, rotate credentials, and how admins operate and audit these subscriptions. This template must be consistent with webhook security rules and AuthZ/admin capability controls.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-05 Security Rules: {{whcp.security_rules}}
- IXS-04 Secrets/Credential Handling: {{ixs.secrets_policy}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- ADMIN-01 Admin Capabilities Matrix: {{admin.capabilities}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Subscription entity model | spec         | No              |
| Registration flow (API/UI | spec         | No              |
| Endpoint URL validation r | spec         | No              |
| Event selection rules (wh | spec         | No              |
| Secret management rules ( | spec         | No              |
| Verification handshake ru | spec         | No              |
| Pause/resume rules        | spec         | No              |
| Deletion/unsubscribe rule | spec         | No              |
| Access control rules (who | spec         | No              |
| Audit logging requirement | spec         | No              |
| Telemetry requirements (a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Test delivery (“send test | spec         | Enrichment only, no new truth  |
| Per-tenant subscription l | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Registration MUST validate endpoint URLs and must not permit open redirects or non-HTTPS
- endpoints (unless explicitly allowed).
- Secrets MUST be handled per {{xref:IXS-04}} and rotated safely.
- Access control MUST be enforced server-side per {{xref:API-04}}.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Idempotency & Deduplication Rules`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:WHCP-01}}, {{xref:WHCP-05}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:WHCP-07}}, {{xref:WHCP-08}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Core Fields                | Required  | Required     | Required |
| Extended Fields             | Optional  | Required     | Required |
| Coverage Checks            | Optional  | Optional     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

- UNKNOWN_ALLOWED: domain.map, glossary.terms, tenant/status fields, handshake, allowed
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If reg.steps is UNKNOWN → block Completeness Gate.
- If url.https_required is UNKNOWN → block Completeness Gate.
- If events.allowed_webhook_ids is UNKNOWN → block Completeness Gate.
- If audit.required is UNKNOWN → block Completeness Gate.
- If telemetry.active_subscriptions_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.WHCP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] registration_and_url_validation_defined == true
- [ ] event_selection_defined == true
- [ ] access_control_and_audit_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] WHCP-07
