# Change Contract: [TITLE]

**Date**: YYYY-MM-DD  
**Author**: [Name]  
**Status**: Draft | In Review | Approved | Implemented

---

## Problem

What breaks today or what are you improving?

## New Capability

What users/agents can do after this change.

## Scope

### Scripts Affected
- [ ] axion-kit-create.ts
- [ ] axion-generate.mjs
- [ ] axion-seed.mjs
- [ ] axion-draft.mjs
- [ ] axion-review.mjs
- [ ] axion-verify.mjs
- [ ] axion-lock.mjs
- [ ] axion-status.ts
- [ ] Other: ___

### Artifacts Affected
- [ ] manifest.json
- [ ] stage_markers/
- [ ] verify_report.json
- [ ] module docs
- [ ] Other: ___

## Contracts Impacted

### stdout JSON Contract
- [ ] No change
- [ ] New fields: ___
- [ ] Changed fields: ___

### Artifact Schemas
- [ ] No change
- [ ] New schema: ___
- [ ] Changed schema: ___

### Reason Codes
- [ ] No change
- [ ] New codes: ___
- [ ] Changed semantics: ___

### Stage Rules
- [ ] No change
- [ ] New stage: ___
- [ ] Changed ordering: ___

## Backward Compatibility

- [ ] Fully backward compatible
- [ ] Old kits still supported with: ___
- [ ] Migration required: ___

## Test Plan

### Fixtures Added
- [ ] tests/fixtures/___ (describe expected behavior)

### Tests Added/Updated
- [ ] tests/core/___
- [ ] tests/integration/___
- [ ] tests/e2e/___

### Release Gate
- [ ] Core contract tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] No pollution check passes
- [ ] Schema regression tests pass

## Rollout Plan

- [ ] Behind feature flag: ___
- [ ] Default on immediately
- [ ] Phased rollout: ___

## Migration Notes

Steps required to migrate existing kits (if applicable):

1. ___
2. ___

---

## Approval

- [ ] Change contract reviewed
- [ ] Tests written before implementation
- [ ] Implementation complete
- [ ] Release gate passed
- [ ] Changelog updated
