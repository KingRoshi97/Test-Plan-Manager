---
library: kit
doc_id: KIT-1-GOV
title: Release Classes
version: 1.0.0
status: draft
---

# KIT-1-GOV — Release Classes

## Purpose

Define the four release class tiers that govern how kit units progress from initial development through enterprise-ready certification.

## Release Class Tiers

### dev

- Internal-only use; no stability guarantees.
- May contain incomplete proof bundles.
- Not eligible for external export.

### candidate

- Feature-complete; undergoing validation.
- Must pass all mandatory gates defined in KIT-5 kit gates.
- Proof bundle must be present but may have open items.

### certified

- Fully validated; all proofs satisfied.
- Backward compatibility contract is locked.
- Eligible for external export with internal classification.

### enterprise-ready

- Meets all certified requirements plus extended compliance proofs.
- Compatibility matrix covers all declared consumer platforms.
- Eligible for unrestricted external export.

## Promotion Rules

1. A kit unit starts as `dev`.
2. Promotion from `dev` to `candidate` requires a passing gate evaluation and a complete manifest.
3. Promotion from `candidate` to `certified` requires all proof bundle requirements satisfied (see KIT-3-GOV).
4. Promotion from `certified` to `enterprise-ready` requires an approved compatibility matrix and enterprise compliance proofs.

## Demotion Rules

- Any breaking change detected by the backcompat engine demotes a unit to `candidate` at most.
- Missing or expired proofs demote a unit to `dev`.
