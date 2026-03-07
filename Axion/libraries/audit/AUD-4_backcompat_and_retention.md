---
library: audit
id: AUD-4-GOV
title: Backward Compatibility and Retention
schema_version: 1.0.0
status: draft
---

# AUD-4 — Backward Compatibility and Retention

## Purpose

This doctrine governs backward compatibility for audit schema changes, retention policy enforcement, and the redaction lifecycle for audit data.

## Backward Compatibility for Audit Schema Changes

### Compatibility Tiers

| Change Type | Compatibility | Action Required |
|---|---|---|
| Add optional field | Compatible | No consumer changes needed. |
| Add new enum value | Compatible | Consumers must tolerate unknown values. |
| Remove optional field | Migration required | Deprecation notice, sunset window. |
| Remove or rename required field | Breaking | Major version bump, coordinated rollout. |
| Change field type | Breaking | Major version bump. |
| Narrow enum values | Breaking | Major version bump. |
| Change `$id` or schema URI | Breaking | Major version bump, registry update. |

### Schema Versioning Rules

1. Audit schemas follow semantic versioning: `MAJOR.MINOR.PATCH`.
2. Compatible changes increment `MINOR` or `PATCH`.
3. Breaking changes increment `MAJOR` and require a new schema file (e.g., `audit_action.v2.schema.json`).
4. Both old and new schema versions must coexist during the migration window.
5. The migration window minimum is 2 release cycles or 30 days, whichever is longer.

### Migration Process

1. Publish the new schema version alongside the existing version.
2. Update producer libraries to emit events conforming to the new schema.
3. Notify all consumers via deprecation markers in the old schema.
4. After the migration window, retire the old schema version.
5. Record the schema migration as an audit decision report (AUD-2).

## Retention Policy Enforcement

### Retention Classes

| Risk Class | Minimum Retention | Maximum Retention | Archive Policy |
|---|---|---|---|
| `PROTOTYPE` | 7 days | 90 days | Delete after max retention. |
| `PROD` | 1 year | 7 years | Archive to cold storage after 1 year. |
| `COMPLIANCE` | 3 years | Indefinite | Never delete without regulatory approval. |

### Enforcement Rules

1. Retention class is assigned at event creation time based on the run's risk class.
2. Retention timers begin at the `occurred_at` timestamp of the audit event.
3. Events MUST NOT be deleted before the minimum retention period.
4. Events MAY be archived (moved to cold storage) after minimum retention but before maximum retention.
5. Retention policy changes apply only to future events; existing events retain their original retention class.
6. Retention compliance is verified during audit health checks (AUD-5).

## Redaction Lifecycle

### Redaction Triggers

| Trigger | Scope | Authority Required |
|---|---|---|
| PII removal request | Specific fields within events | Data protection officer or equivalent. |
| Legal hold release | Events under legal hold | Legal counsel. |
| Regulatory mandate | Events matching regulatory criteria | Compliance officer. |
| Retention expiry | All events past maximum retention | Automated (system). |

### Redaction Process

1. **Request**: A redaction request is submitted with the trigger type, scope, and authority.
2. **Validate**: The request is validated against retention policy. Events under minimum retention cannot be redacted unless legally mandated.
3. **Redact**: Targeted fields are replaced with `[REDACTED]` markers. The event structure and non-sensitive metadata are preserved.
4. **Record**: A redaction audit event is appended to the ledger documenting what was redacted, by whom, and why.
5. **Verify**: Hash chain integrity is re-computed for the affected segment with redaction markers in place.

### Redaction Constraints

- Redaction MUST NOT delete the event envelope (ID, timestamp, action type).
- Redaction MUST preserve hash chain integrity by re-hashing with redacted content.
- Redacted events MUST be flagged with `"redacted": true` and `"redaction_reason"`.
- Redaction is irreversible in the primary ledger. Original content may exist only in secure archival if legally required.
