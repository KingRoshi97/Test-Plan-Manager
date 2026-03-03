# SSO-10 — SSO Compliance & Audit (logs, consent, data residency)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-10                                           |
| Template Type     | Integration / SSO                                |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring sso compliance & audit (l |
| Filled By         | Internal Agent                                   |
| Consumes          | SSO-02, SSO-03, ADMIN-03, CER-05                 |
| Produces          | Filled SSO Compliance & Audit (logs, consent, dat|

## 2. Purpose

Define the canonical audit and compliance requirements for SSO: what events must be recorded (logins, failures, lockouts, provisioning, role assignments), required fields, retention, redaction, and how audit data is accessed for investigations. This template must be consistent with global audit trail and logging/redaction rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}} | OPTIONAL
- SSO-03 Claim/Role Mapping: {{sso.claim_mapping}} | OPTIONAL
- SSO-05 SCIM Provisioning: {{sso.scim}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}}
- CER-05 Logging/Crash Reporting: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Audited event types list  | spec         | No              |
| Event schema (required fi | spec         | No              |
| Correlation fields (reque | spec         | No              |
| Identity fields policy (h | spec         | No              |
| Retention policy (days)   | spec         | No              |
| Access policy (who can vi | spec         | No              |
| Export policy (for compli | spec         | No              |
| Alerting triggers (suspic | spec         | No              |
| Tamper-evidence expectati | spec         | No              |
| Deletion policy for audit | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| SIEM forwarding rules     | spec         | Enrichment only, no new truth  |
| Geo/IP capture policy     | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Audit logs must be append-only and tamper-evident where possible.
- Do not store raw secrets/tokens; sensitive identifiers should be hashed as required.
- Retention must be explicit and enforced.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## SSO Compliance & Audit (logs, consent, data residency)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:ADMIN-03}}, {{xref:SSO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-02}} | OPTIONAL
- Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, provider/user hashes, reason code, ids,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If audit.events is UNKNOWN → block Completeness Gate.
- If retention.days is UNKNOWN → block Completeness Gate.
- If access.who_can_view is UNKNOWN → block Completeness Gate.
- If tamper.append_only_rule is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SSO
- Pass conditions:
- [ ] required_fields_present == true
- [ ] audit_events_defined == true
- [ ] schema_defined == true
- [ ] retention_defined == true
- [ ] access_policy_defined == true
- [ ] tamper_evidence_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CRM/ERP Integrations (CRMERP)
- [ ] CRM/ERP Integrations (CRMERP)
- [ ] CRMERP-01 System Inventory (by system_id)
- [ ] CRMERP-02 Object/Entity Mapping Catalog (objects ↔ entities, keys)
- [ ] CRMERP-03 Sync Direction Rules (push/pull/bidirectional)
- [ ] CRMERP-04 Sync Scheduling & Triggers (cron/events/manual)
- [ ] CRMERP-05 Conflict Resolution Rules (source of truth, LWW, prompts)
- [ ] CRMERP-06 Rate Limits & Quotas (per vendor, backoff)
- [ ] CRMERP-07 Data Quality & Validation (required fields, dedupe)
- [ ] CRMERP-08 Error Handling & Reconciliation (replay, backfill)
- [ ] CRMERP-09 Security & Compliance (PII, least privilege, audit)
- [ ] CRMERP-10 Observability & Runbooks (dashboards, alerts, operator steps)
- [ ] CRMERP-01
