---
library: gates
id: GAT-5
section: backcompat_and_drift
schema_version: 1.0.0
status: draft
governance_layer: true
complements: GATE-5
---

# GAT-5 — Backward Compatibility & Drift

## Overview
GAT-5 defines the rules governing backward compatibility for gate changes and drift detection
mechanisms. Gate changes can silently alter enforcement behavior if not carefully managed.
This document establishes the compatibility tiers, migration rules, and drift detection
processes that prevent silent enforcement regression.

## Backward Compatibility Tiers

### Tier Definitions

| Tier | Label | Description | Examples |
|---|---|---|---|
| T1 | **Fully Compatible** | No behavioral change. Existing evaluations produce identical results. | Documentation updates, description rewording |
| T2 | **Additive** | New predicates or evidence requirements added. Existing predicates unchanged. | New warning predicate added to existing gate |
| T3 | **Narrowing** | Gate becomes stricter. Previously passing inputs may now fail. | Predicate threshold tightened, new blocker predicate |
| T4 | **Breaking** | Gate behavior fundamentally changes. Predicates removed or semantics altered. | Predicate removed, evidence type changed, severity changed |

### Compatibility Rules by Tier

| Tier | Version Bump | Migration Required | Notification Required |
|---|---|---|---|
| T1 | PATCH | No | No |
| T2 | MINOR | No | Yes — changelog entry |
| T3 | MAJOR | Yes — impact assessment | Yes — operator notification |
| T4 | MAJOR | Yes — migration plan | Yes — deprecation notice + migration window |

## Change Management Process

### For T1/T2 Changes (Non-Breaking)
1. Update gate definition in registry.
2. Bump version (PATCH or MINOR).
3. Record changelog entry.
4. No further action required.

### For T3 Changes (Narrowing)
1. Create impact assessment: which existing projects would be affected.
2. Update gate definition with new version (MAJOR bump).
3. Provide migration guidance for affected projects.
4. Notify operators of stricter enforcement.
5. Allow a grace period where the old version remains available.

### For T4 Changes (Breaking)
1. Create migration plan with timeline.
2. Mark old gate version as `deprecated` with `superseded_by` reference.
3. Create new gate version with updated predicates/semantics.
4. Both versions coexist during migration window.
5. After migration window, old version moves to `retired`.

## Drift Detection

### What is Drift?
Drift occurs when gate enforcement behavior changes without an explicit version change.
Common causes:
- Evidence schema changes that alter predicate input structure.
- External dependency changes affecting predicate evaluation.
- Registry corruption or unauthorized modification.
- Environment differences between runs.

### Drift Detection Mechanisms

| Mechanism | Frequency | What It Checks |
|---|---|---|
| **Replay Verification** | Per-run | Re-evaluate stored inputs and compare verdicts |
| **Registry Integrity Check** | Per-run | Verify registry hash matches expected state |
| **Predicate Consistency Audit** | Weekly | Evaluate standard test vectors against all active gates |
| **Cross-Run Comparison** | On-demand | Compare verdicts across runs with similar project contexts |

### Drift Response Protocol
1. **Detection**: Drift is detected by any of the above mechanisms.
2. **Classification**: Drift is classified as `benign` (documentation-only) or `behavioral` (verdict-affecting).
3. **Investigation**: Behavioral drift triggers investigation to identify root cause.
4. **Resolution**: Root cause is fixed and a regression test is added.
5. **Incident Record**: A drift incident record is created in the audit ledger.

## Enforcement Consistency

### Consistency Rules
- The same gate version MUST produce the same verdict for the same inputs across all runs.
- Gate enforcement MUST NOT vary based on execution environment (host, time, etc.).
- If a gate depends on external state, that state MUST be captured in the evidence set.
- Registry modifications MUST be versioned and auditable.

### Consistency Verification
- Every gate maintains a set of **canonical test vectors**: known inputs with expected verdicts.
- Test vectors are evaluated as part of the predicate consistency audit.
- Test vector failures indicate drift and trigger the drift response protocol.

## Validation Checklist
- [ ] Every gate change is classified by backward compatibility tier.
- [ ] MAJOR version bumps include migration guidance.
- [ ] Deprecated gates have `superseded_by` references.
- [ ] Replay verification runs on every production pipeline execution.
- [ ] Registry integrity checks run at pipeline start.
- [ ] No behavioral drift detected in the last audit cycle.
- [ ] Canonical test vectors exist for all `proven` maturity gates.
