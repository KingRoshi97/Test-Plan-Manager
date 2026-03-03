# CRMERP-04 — Data Transformation Rules (format, enum, unit mapping)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-04                                        |
| Template Type     | Integration / CRM-ERP                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring data transformation rules |
| Filled By         | Internal Agent                                   |
| Consumes          | CRMERP-03, JBS-03, FFCFG-04                      |
| Produces          | Filled Data Transformation Rules (format, enum, u|

## 2. Purpose

Define the canonical scheduling and trigger model for CRM/ERP sync: when sync runs (cron/event/manual), what triggers it, per-environment enablement, backoff under vendor limits, and operator controls. This template must be consistent with job scheduling rules, rate limits, and feature/config matrices.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- CRMERP-03 Sync Direction Rules: {{crmerp.sync_direction}} | OPTIONAL
- JBS-01 Jobs Inventory: {{jobs.inventory}} | OPTIONAL
- JBS-03 Scheduling Rules: {{jobs.scheduling_rules}} | OPTIONAL
- FFCFG-04 Config Matrix: {{cfg.matrix}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| system_id binding         | spec         | No              |
| Trigger types supported ( | spec         | No              |
| Per-object trigger assign | spec         | No              |
| Cron schedule(s) (if used | spec         | No              |
| Event triggers list (even | spec         | No              |
| Manual trigger rules (who | spec         | No              |
| Env enablement rules (dev | spec         | No              |
| Backoff policy under vend | spec         | No              |
| Concurrency rules (avoid  | spec         | No              |
| Telemetry requirements (r | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Time window constraints ( | spec         | Enrichment only, no new truth  |
| Catch-up/backfill trigger | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Scheduling MUST respect vendor rate limits and internal concurrency limits.
- Env enablement must be explicit (no accidental prod runs).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Data Transformation Rules (format, enum, unit mapping)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CRMERP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:CRMERP-08}}, {{xref:CRMERP-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, object notes, schedules/event refs, cron
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If triggers.supported is UNKNOWN → block Completeness Gate.
- If env.prod_enabled is UNKNOWN → block Completeness Gate.
- If limits.backoff_policy is UNKNOWN → block Completeness Gate.
- If telemetry.run_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CRMERP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] trigger_assignments_defined == true
- [ ] env_enablement_defined == true
- [ ] rate_limit_backoff_defined == true
- [ ] concurrency_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CRMERP-05
