# Execution Readiness Contract (ERC) — {{DOMAIN_NAME}} v{{VERSION}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:ERC -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}
**Version:** {{VERSION}}
**Lock Date:** {{LOCK_DATE}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: The ERC is the LOCKED version of a domain's specifications. At lock time,
the AXION pipeline copies verified content from BELS, DDES, and other core docs into
this contract. Once locked, the ERC becomes the authoritative spec for code generation.

THIS DOCUMENT IS AUTO-GENERATED AT LOCK TIME. Do not manually edit it.
The lock step performs these checks before creating the ERC:
1. No critical UNKNOWNs remain in BELS (policy rules, state machines, validation rules)
2. All reason codes have messages
3. All state machines have deny codes for invalid transitions
4. Minimum acceptance scenarios exist in TESTPLAN
5. All RPBS cross-references resolve to existing sections

IF LOCK FAILS:
- The orchestrator reports which files contain UNKNOWNs via the UNKNOWN scan
- The agent must fill those UNKNOWNs before re-attempting lock
- Open Questions in BELS and DDES must be resolved

DOWNSTREAM CONSUMERS:
- scaffold-app: Uses ERC to generate application code (routes, models, validation)
- build-exec: Reads ERC for file operations and code patterns
- verify step: Compares generated code against ERC to ensure compliance

CASCADE POSITION (terminal — auto-generated at lock time):
- Upstream (copied from): BELS (policy rules, state machines, validation, reason codes, auth rules, computed values), DDES (entity specs), DIM (interfaces), TESTPLAN (P0 acceptance scenarios), COPY_GUIDE (user-facing messages)
- Downstream (feeds into): scaffold-app (application code generation), build-exec (file operations), verify step (compliance checking)
- ERC is NOT manually edited — it is the locked snapshot of all upstream docs, assembled by the lock step after verification passes
-->

---

## Verification Status

<!-- AGENT: These checks are performed automatically by the lock step.
Manual checking is only needed if debugging a lock failure. -->

- [ ] No critical UNKNOWNs in BELS
- [ ] All policy rules have reason codes + messages
- [ ] All state machines have deny codes for invalid transitions
- [ ] All validation rules have error codes + user messages
- [ ] Minimum acceptance scenarios defined in TESTPLAN
- [ ] All RPBS cross-references resolve
- [ ] All Open Questions resolved or marked non-blocking

---

## Locked Sections

### Entity Specification (from DDES)
<!-- Copied from DDES at lock time — entities this domain owns -->
| Entity | Fields (key) | Relationships | Lifecycle States |
|--------|-------------|---------------|-----------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Policy Rules (from BELS)
<!-- Copied from BELS at lock time — business rules for this domain -->
| Rule ID | Description | Condition | Action | Deny Code | SourceRef |
|---------|-------------|-----------|--------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### State Machines (from BELS)
<!-- Copied from BELS at lock time — entity state transitions -->
| Entity | Current State | Event | Next State | Guard Condition | Deny Code |
|--------|---------------|-------|------------|----------------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Validation Rules (from BELS)
<!-- Copied from BELS at lock time — field-level validation -->
| Field | Entity | Rule | Error Code | User Message |
|-------|--------|------|------------|-------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Reason Codes (from BELS)
<!-- Copied from BELS at lock time — all error/deny codes -->
| Code | Message | Severity | HTTP Status |
|------|---------|----------|------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Authorization Rules (from BELS)
<!-- Copied from BELS at lock time — who can do what -->
| Action | Actor(s) Allowed | Condition | Deny Code |
|--------|-----------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Interfaces (from DIM)
<!-- Copied from DIM at lock time — exposed and consumed interfaces -->
| Interface ID | Type | Path/Name | Description | Contract Shape |
|-------------|------|-----------|-------------|---------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Acceptance Criteria (from TESTPLAN)
<!-- Copied from TESTPLAN at lock time — P0 test scenarios -->
| Test ID | Description | Given | When | Then |
|---------|-------------|-------|------|------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Implementation Notes
<!-- AGENT: These notes are added during the lock process to capture any context
that helps the implementing agent. They might include:
- Recommended implementation patterns
- Known edge cases to watch for
- Performance considerations
- Integration-specific setup notes -->
- UNKNOWN

---

## Computed Values (from BELS)
<!-- Copied from BELS at lock time — derived/calculated values -->
| Value | Formula/Logic | Computed Where | Dependencies |
|-------|-------------|---------------|-------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Cross-Domain Dependencies
<!-- From DIM — what this domain needs from other domains -->
| Dependency | Interface | What Is Consumed |
|-----------|-----------|-----------------|
| UNKNOWN | UNKNOWN | UNKNOWN |

---

## Lock Metadata

- **Locked by:** UNKNOWN
- **Lock date:** {{LOCK_DATE}}
- **Lock hash:** UNKNOWN
- **Source documents:**
  - BELS version: UNKNOWN
  - DDES version: UNKNOWN
  - DIM version: UNKNOWN
  - TESTPLAN version: UNKNOWN
  - COPY_GUIDE version: UNKNOWN
- **Pre-lock scan results:**
  - UNKNOWNs found: UNKNOWN
  - UNKNOWNs resolved: UNKNOWN
  - Open Questions remaining: UNKNOWN

---

## Open Questions
<!-- AGENT: Lock-blocking issues discovered during the lock process. Auto-populated by the lock step. -->
- UNKNOWN
