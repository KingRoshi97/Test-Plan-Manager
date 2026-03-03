CP-05 — Determinism Guarantees

1) Purpose
Define the cross-cutting determinism rules that apply to all three control planes. Every Axion pipeline run must produce identical outputs given identical inputs, modulo a small set of allowed noise fields.

2) Core Guarantee
Same inputs + same pinset + same registries → same outputs (excluding allowed noise fields).

3) Allowed Noise Fields
The following fields are permitted to vary between runs without violating determinism:
- `run_id` — unique per run
- `timestamps` — all `*_at`, `created_at`, `started_at`, `finished_at`, `captured_at`, `evaluated_at`, `appended_at`, `recorded_at`, `updated_at`
- `attempt_id` — unique per attempt
- `host` — host/machine identifiers
- `duration_ms` — execution timing
- `proof_id` — unique per proof object
- `bundle_id` — unique per bundle

All other fields must be deterministic.

4) Normalization Rules

4.1 Run Context Normalization
Applied by `normalizeRunContext()` in `Axion/src/core/controlPlane/determinism.ts`:
- Sort all arrays alphabetically (platforms, stack, domains)
- Lowercase all string values (risk_class, executor_type_default)
- Remove environment-dependent fields (host, working directory, env vars)
- Stable key ordering in all objects

4.2 Registry Resolution
Applied by `resolvePins()` in `Axion/src/core/controlPlane/registryLoader.ts`:
- Version resolution follows deterministic precedence rules
- Pin policy is applied in fixed order: explicit pins → version constraints → latest compatible
- Registry entries are sorted by ID before resolution

4.3 Standards Resolution
Applied by `resolveStandards()` in `Axion/src/core/controlPlane/standardsEngine.ts`:
- Applicability computation is deterministic given the same run context
- Precedence rules resolve conflicts in fixed order
- Snapshot entries are sorted by standard ID

4.4 Template Selection
Applied by `selectTemplates()` in `Axion/src/core/controlPlane/templateDriver.ts`:
- Selection criteria are evaluated in fixed order
- When multiple templates match, selection rules define a deterministic tiebreaker
- Selected templates are sorted by template ID

5) Golden Comparison
The `goldenCompare()` function in `Axion/src/core/controlPlane/determinism.ts`:
- Strips all allowed noise fields from both expected and actual artifacts
- Performs deep equality comparison on remaining fields
- Returns a structured diff if comparison fails
- Used for regression testing and determinism verification

6) Per-Control-Plane Rules

6.1 ICP Determinism
- Run manifest content (excluding noise fields) is identical for identical inputs
- Stage reports produce identical validation results for identical inputs
- Gate evaluations are deterministic: same artifacts + same evidence → same gate result
- Pinset is frozen at run start and never modified

6.2 KCP Determinism
- Unit recommendation order is deterministic given the same unit index and completion state
- Verification commands are executed in the order defined by the verification policy
- Proof objects are identical for identical inputs (excluding timestamps and proof_id)

6.3 MCP Determinism
- Dependency resolution follows deterministic policy rules
- Migration plans are ordered deterministically given the same history and target
- Refactor plans produce identical output for the same scope and constraints

7) Verification
- Golden test suite compares run outputs against known-good baselines
- Noise field isolation ensures only deterministic fields are compared
- Any non-noise field difference triggers a determinism violation alert
