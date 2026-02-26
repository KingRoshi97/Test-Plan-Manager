GOV-03 — Deprecation & Migration Rules
(Hardened Draft — Full)
1) Purpose
Define how Axion evolves without breaking existing kits by establishing:
how assets are deprecated (templates/standards/contracts)
how breaking changes are migrated (schemas/models/kit formats)
how backward compatibility is documented and enforced

2) Inputs
Versioning policy (GOV-01)
Change control rules (GOV-02)
Kit version stamping rules (KIT-04)
Canonical model rules (CAN-01/02/03)
Template and standards registries (TMP-01, STD-01)

3) Outputs
A deterministic deprecation/migration discipline including:
deprecation records
replacement mappings
migration guides for breaking changes
compatibility notes for old kits

4) Invariants (must always be true)
No sudden removal: deprecated assets remain readable and indexed until a declared removal milestone.
Replacement mapping required: deprecation must specify what replaces it (or “none”).
Breaking changes require migration path: any breaking change must have either:
a migration script/process, or
explicit “not migratable” declaration (rare, requires maintainer sign-off)
Kits remain interpretable: old kits must remain understandable using pinned versions and compatibility notes.
Migration is traceable: migrations must record before/after versions and what changed.

5) Deprecation Rules (Templates/Standards/Docs)
5.1 Deprecation Record (required fields)
deprecated_asset_id (template_id / pack_id / doc_id)
asset_type (template | standards_pack | contract_doc)
deprecated_in_version
deprecated_at
reason
replacement_asset_id (optional)
sunset_policy (enum):
supported_indefinitely
supported_until_date
supported_until_version
sunset_target (date or version; required if not indefinite)
5.2 Deprecation Behavior
Deprecated assets must remain in their registry with:
status: deprecated
replacement pointer if any
New kit generation must not select deprecated assets unless:
explicitly pinned by policy for compatibility mode
or no replacement exists and omission would break baseline coverage

6) Migration Rules (Breaking Changes)
6.1 When a migration is required
A migration is required when a breaking change affects:
intake schema field paths/types (INT-02)
canonical spec entity shapes/references (CAN-01/02/03)
standards snapshot schema (STD-03)
template index schema or placeholder variables (TMP)
kit folder structure / manifest schema (KIT-01/KIT-02)
6.2 Migration Artifact (required)
Every breaking change must include a Migration Guide containing:
migration_id
from_version → to_version
assets_affected[] (what changes)
mapping_rules (old → new fields/paths)
step_by_step_procedure
validation_checks (how to confirm migration success)
rollback_strategy (if migration fails)
known_risks
6.3 Migration Modes
Automated migration: script/tool transforms artifacts deterministically
Manual migration: step-by-step instructions with required proof checks
Rule: manual migrations must still produce proof of completion and record it.

7) Compatibility Notes (Required for Breaking Changes)
Compatibility notes must include:
what breaks
what remains compatible
how old kits should be interpreted
which version stamps determine behavior
what the agent must do differently when encountering older kits

8) Enforcement (Governance Gates)
A breaking change cannot be released unless:
deprecation record exists (if applicable)
migration guide exists (if required)
compatibility notes exist
version bumps are correct per GOV-01
registries updated (TMP/STD)
Failing any of these → change rejected.

9) Failure Modes
assets removed without replacement → older kits fail
breaking changes shipped without migration → unusable legacy artifacts
ambiguous compatibility notes → agents misinterpret old kits
deprecated assets still selected by default → drift and inconsistency

10) Definition of Done (GOV-03)
GOV-03 is complete when:
deprecation record contract is locked
migration guide requirements are locked
compatibility notes requirements are locked
enforcement conditions are explicit and gateable
rules guarantee old kits remain interpretable via pinned versions
