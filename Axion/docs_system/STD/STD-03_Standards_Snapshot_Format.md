STD-03 — Standards Snapshot Format (Emitted Into Kits)
(Hardened Draft — Full)
1) Purpose
Define the Resolved Standards Snapshot artifact that is emitted into every Agent Kit. This snapshot is the project-specific, version-pinned ruleset that all downstream artifacts must follow.
The snapshot exists so:
the build is deterministic
the external agent can follow constraints without guessing
audits can trace exactly which standards were applied and why

2) Inputs
STD-02 resolver outputs:
resolver_context
selected packs (ordered)
merged resolved rules
applied/blocked overrides
conflict log (must be empty if success)
Version stamps (system/template/standards/schema)

3) Outputs
A single snapshot file in the kit (canonical location under core artifacts):
resolved_standards_snapshot.json (or .md + embedded JSON, but must be machine-readable)

4) Snapshot Contract (Canonical Structure)
4.1 Snapshot Metadata (required)
resolved_standards_id (string)
submission_id (string)
spec_id (string, if already assigned; otherwise optional until spec exists)
created_at (timestamp)
4.2 Version Stamps (required)
system_version
schema_version_used
standards_library_version_used
template_library_version_used (if available at snapshot time; otherwise fill later and update stamp chain)
resolver_ruleset_version_used (STD-02 version/hash)
4.3 Resolver Context (required)
resolver_context (object)
routing snapshot:
skill_level/category/type_preset/build_target/audience_context
gate flags:
data.enabled/auth.required/integrations.enabled
compliance flags (if any)
delivery preferences (scope/priority bias)
4.4 Selected Packs (required)
selected_packs[] (ordered list)
each item:
pack_id
pack_version
category
applies_when (stored for audit)
specificity_score
priority
4.5 Resolved Ruleset (required)
rules[]
each rule:
rule_id
category
name
description
rule_type (requirement | constraint | default | prohibition)
value (structured)
fixed (boolean)
sources[] (list of pack_id@version that contributed)
resolved_by (enum): exact_match | precedence | override
effective_scope (optional: which parts of system it governs)
4.6 Fixed vs Configurable Map (required)
fixed_vs_configurable (map)
key: rule_id
value: fixed | configurable
4.7 Overrides (required audit section)
overrides_applied[]
overrides_blocked[]
Each override record includes:
override_id
rule_id (or field_path if you allow field-path overrides; choose one and lock)
before
after
source (user/admin/system)
reason (optional)
status (applied|blocked)
timestamp
4.8 Conflict Log (required)
conflicts[]
must be empty for successful snapshots
if not empty → snapshot is invalid and resolver should have failed
4.9 Integrity (recommended)
snapshot_hash (hash of the snapshot content)
signature (optional)

5) Snapshot Invariants (must always be true)
Self-contained: downstream steps must not need to consult the live standards library to interpret rules.
Version-pinned: every pack and library version is recorded.
Conflict-free: conflicts list must be empty for a valid snapshot.
Override-auditable: applied and blocked overrides are recorded.
Fixed rules immutable: fixed rules appear as fixed in the map and are never overridden.

6) Failure Modes
snapshot missing versions → non-reproducible builds
rules missing sources → no audit trail
overrides applied without before/after → silent drift
conflicts present but snapshot marked valid → breaks determinism

7) Definition of Done (STD-03)
STD-03 is complete when:
snapshot structure is fully specified and machine-readable
all resolver outputs are represented (context, selected packs, rules, overrides)
required version stamps are included
invariants (self-contained, conflict-free, auditable) are explicit and enforceable

