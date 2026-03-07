---
library: system
id: SYS-5-GOV
schema_version: 1.0.0
status: draft
---

# SYS-5 — System Health

## Purpose

This doctrine defines the metrics, thresholds, and validation checklist for assessing the
health of the Axion system layer. It covers resolution success rate, dependency staleness,
capability coverage, pin compliance, and operational readiness.

## Health Metrics

### Resolution Success Rate

| Metric | Target | Critical Threshold |
|---|---|---|
| Successful resolutions / total resolutions | >= 99.5% | < 95% |
| Mean resolution time | < 500ms | > 2000ms |
| Resolution retry rate | < 1% | > 5% |

A resolution is considered successful when all required system units are resolved without
errors and the verdict is `pass` or `pass_with_warnings`.

### Dependency Staleness

| Metric | Target | Critical Threshold |
|---|---|---|
| Dependencies within supported version range | 100% | < 90% |
| Dependencies validated within staleness window | >= 95% | < 80% |
| Deprecated dependencies still in use | 0 | > 3 |

Staleness is evaluated against the dependency graph defined in SYS-3.

### Capability Coverage

| Metric | Target | Critical Threshold |
|---|---|---|
| Required capabilities satisfied | 100% | < 95% |
| Adapter capability discovery success rate | >= 99% | < 95% |
| Capability mismatch rate (required vs available) | < 2% | > 10% |

### Pin Compliance

| Metric | Target | Critical Threshold |
|---|---|---|
| Pinned artifacts resolved to declared version | 100% | < 100% |
| Locked artifacts within declared range | 100% | < 100% |
| Floating artifacts resolved to latest compatible | >= 95% | < 90% |
| Pin policy inheritance correctly applied | 100% | < 100% |

## Validation Checklist

Before any system release or configuration change, verify:

- [ ] All system unit `component_id` values are unique
- [ ] Resolution order is contiguous and has no gaps
- [ ] No circular dependencies exist in the cross-library dependency graph
- [ ] All pinned artifacts have valid `pinned_version` references
- [ ] All capability references resolve to entries in `capabilities.v1`
- [ ] Backward compatibility is maintained for all non-major version changes
- [ ] System decision reports are generated for test runs
- [ ] Resolution success rate meets target threshold
- [ ] No deprecated dependencies exceed their sunset date
- [ ] Loader integrity checks pass for all resolved artifacts
- [ ] Notification routing is configured for resolution failures
- [ ] Quota engine correctly enforces workspace/project limits

## Health Report

The system health report is generated on-demand or on a configured schedule. It includes:

- Timestamp of evaluation
- Current values for all metrics above
- List of any metrics below critical threshold
- Recommended remediation actions for degraded metrics
- Link to the most recent system decision report

## Escalation Policy

| Severity | Condition | Action |
|---|---|---|
| `info` | All metrics within target | No action |
| `warning` | Any metric below target but above critical | Notify system operators |
| `critical` | Any metric below critical threshold | Block new runs until resolved |
